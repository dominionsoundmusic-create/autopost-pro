const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const NOTIFY_PHONE_NUMBER = process.env.NOTIFY_PHONE_NUMBER;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'kidstorybookssell@gmail.com';

if (!ANTHROPIC_API_KEY) console.warn('ANTHROPIC_API_KEY not set');
if (!UNSPLASH_ACCESS_KEY) console.warn('UNSPLASH_ACCESS_KEY not set');
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) console.warn('Twilio not configured - lead SMS disabled');
if (!RESEND_API_KEY) console.warn('RESEND_API_KEY not set - email lead notifications disabled');

const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

function sendLeadEmail(lead) {
  return new Promise((resolve, reject) => {
    if (!RESEND_API_KEY) {
      console.log('Email not configured - skipping lead email notification');
      return resolve();
    }

    const bizDesc = lead.bizName ? ' for "' + lead.bizName + '"' : '';
    const contact = lead.contactEmail || lead.contactPhone || 'no contact given';
    const subject = 'New demo site lead' + bizDesc;
    const htmlBody =
      '<h2>New Demo Site Lead</h2>' +
      '<p><strong>Name:</strong> ' + (lead.contactName || '') + '</p>' +
      '<p><strong>Contact:</strong> ' + contact + '</p>' +
      '<p><strong>Business:</strong> ' + (lead.bizName || '') + '</p>' +
      '<p><strong>Industry:</strong> ' + (lead.industry || '') + '</p>' +
      '<p><strong>City:</strong> ' + (lead.city || '') + '</p>' +
      '<p><strong>Headline they saw:</strong> ' + (lead.headline || '') + '</p>' +
      '<p><strong>Reference code:</strong> ' + (lead.refCode || '') + '</p>';

    const body = JSON.stringify({
      from: 'Dominion Web Design Pro <onboarding@resend.dev>',
      to: [NOTIFY_EMAIL],
      subject: subject,
      html: htmlBody,
    });

    const req = https.request(
      {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + RESEND_API_KEY,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Lead email sent successfully');
            resolve();
          } else {
            console.error('Resend API error:', data);
            resolve();
          }
        });
      }
    );
    req.on('error', (e) => {
      console.error('Failed to send lead email:', e.message);
      resolve();
    });
    req.write(body);
    req.end();
  });
}

async function sendLeadSms(lead) {
  if (!twilioClient || !TWILIO_FROM_NUMBER || !NOTIFY_PHONE_NUMBER) {
    console.log('SMS not configured - skipping lead text notification');
    return;
  }
  try {
    const bizDesc = lead.bizName ? ' for "' + lead.bizName + '"' : '';
    const contact = lead.contactEmail || lead.contactPhone || 'no contact given';
    const body = 'New demo site lead' + bizDesc + '! ' +
      lead.contactName + ' - ' + contact +
      (lead.refCode ? ' (Ref: ' + lead.refCode + ')' : '');
    await twilioClient.messages.create({
      body: body,
      from: TWILIO_FROM_NUMBER,
      to: NOTIFY_PHONE_NUMBER,
    });
    console.log('Lead SMS sent successfully');
  } catch (e) {
    console.error('Failed to send lead SMS:', e.message);
  }
}

const RATE_LIMIT_MAX = 5;
const ipGenerationCounts = new Map();

function checkAndIncrementRateLimit(ip) {
  const current = ipGenerationCounts.get(ip) || 0;
  if (current >= RATE_LIMIT_MAX) return false;
  ipGenerationCounts.set(ip, current + 1);
  return true;
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || 'unknown';
}

function generateRefCode() {
  return 'DWP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const req = https.request(
      {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) return reject(new Error(parsed.error.message));
            const text = parsed.content && parsed.content[0] ? parsed.content[0].text : '';
            resolve(text);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function fetchUnsplashPhoto(query) {
  return new Promise((resolve, reject) => {
    const path = '/photos/random?query=' + encodeURIComponent(query) + '&orientation=landscape&content_filter=high';
    const req = https.request(
      {
        hostname: 'api.unsplash.com',
        path,
        method: 'GET',
        headers: {
          Authorization: 'Client-ID ' + UNSPLASH_ACCESS_KEY,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.errors) return reject(new Error(parsed.errors.join(', ')));
            resolve({
              url: parsed.urls && parsed.urls.regular ? parsed.urls.regular : null,
              credit: parsed.user && parsed.user.name ? parsed.user.name : null,
              creditUrl: parsed.user && parsed.user.links ? parsed.user.links.html : null,
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

app.post('/generate-demo', async (req, res) => {
  const { bizName, industry, city, phone, notable, lang, customRequest, isRegenerate, layoutStyle } = req.body;

  if (!bizName) {
    return res.status(400).json({ error: 'bizName is required' });
  }

  const ip = getClientIp(req);
  if (!checkAndIncrementRateLimit(ip)) {
    return res.status(429).json({
      error: 'rate_limited',
      message: "You've tried a few looks already - pick your favorite and let's build it for real!",
    });
  }

  const language = lang === 'es' ? 'Spanish' : 'English';
  const chosenLayout = layoutStyle || 'photo-hero';
  const needsPhoto = chosenLayout !== 'minimal';

  const layoutDescriptions = {
    'photo-hero': 'a large full-bleed photo background filling the entire hero section, with text overlaid on top',
    'split': 'a two-column layout with a photo on one side and text on the other side',
    'minimal': 'no photo at all - just bold, oversized typography on a solid color background',
    'photo-card': 'a photo contained within a smaller rounded card/frame floating over a colored background, not filling the whole hero',
    'stacked': 'a short photo banner strip at the top, with the headline and content stacked below it',
  };
  const layoutDesc = layoutDescriptions[chosenLayout] || layoutDescriptions['photo-hero'];

  const customInstruction = customRequest
    ? '\n\nThe business owner specifically asked for this in their own words: "' + customRequest + '". Take this request seriously and reflect it clearly in the headline, tone, and color choice.'
    : '';

  const regenerateInstruction = isRegenerate
    ? '\n\nThis is a regeneration - the owner wants something noticeably DIFFERENT from a typical first attempt. Pick a different angle and a different photo concept.'
    : '';

  const prompt = 'You are writing copy for a one-page website preview/mockup, for a small business demo tool. Write in ' + language + '.\n\n' +
    'Business name: ' + bizName + '\n' +
    'Industry: ' + (industry || 'general small business') + '\n' +
    'City/location: ' + (city || 'not specified') + '\n' +
    'Notable detail: ' + (notable || 'none provided') + customInstruction + regenerateInstruction + '\n\n' +
    'The layout for this preview has ALREADY been chosen as: ' + chosenLayout + ' - meaning ' + layoutDesc + '. Write copy and pick colors that work well within this specific layout.\n\n' +
    'Write ONLY valid JSON (no markdown, no backticks, no preamble) with this exact shape:\n' +
    '{\n' +
    '  "eyebrow": "a short 2-4 word label above the headline, e.g. Now accepting patients",\n' +
    '  "headline": "a punchy 4-8 word headline that captures this specific business",\n' +
    '  "subhead": "one sentence, naturally mentioning the business name and city if given",\n' +
    '  "photoSearchTerm": "2-4 words to search a stock photo site for a relevant, real, professional photo of this exact type of business interior/work/product - be specific to the industry, not generic",\n' +
    '  "accentColor": "a hex color code that fits this industry mood - vary this meaningfully based on the business personality, not just industry category",\n' +
    '  "stat1": ["a short number/value", "a short label"],\n' +
    '  "stat2": ["a short number/value", "a short label"],\n' +
    '  "stat3": ["a short number/value", "a short label"],\n' +
    '  "features": [\n' +
    '    {"h": "short feature headline (3-5 words)", "p": "one sentence benefit, specific to this industry"},\n' +
    '    {"h": "short feature headline", "p": "one sentence benefit"},\n' +
    '    {"h": "short feature headline", "p": "one sentence benefit"}\n' +
    '  ],\n' +
    '  "ctaHeadline": "a short urgency-driven headline for the closing call-to-action band",\n' +
    '  "ctaSub": "one supporting sentence"\n' +
    '}\n\n' +
    'Make the stats, features, and accent color genuinely specific to this exact industry and request - not generic business filler. If notable details were given, weave them in naturally.';

  try {
    const claudeText = await callClaude(prompt);

    let copy;
    try {
      const cleaned = claudeText.replace(/```json|```/g, '').trim();
      copy = JSON.parse(cleaned);
    } catch (e) {
      throw new Error('Could not parse AI response as JSON');
    }

    let photo = null;
    if (needsPhoto) {
      try {
        photo = await fetchUnsplashPhoto(copy.photoSearchTerm || industry || 'small business');
      } catch (e) {
        console.warn('Unsplash fetch failed, continuing without photo:', e.message);
      }
    }

    const refCode = generateRefCode();

    res.json({ copy, photo, accent: copy.accentColor || '#c9a84c', refCode, layoutStyle: chosenLayout });
  } catch (err) {
    console.error('generate-demo error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/claim-preview', async (req, res) => {
  const { refCode, contactName, contactEmail, contactPhone, previewData } = req.body;

  if (!contactName || (!contactEmail && !contactPhone)) {
    return res.status(400).json({ error: 'Name and at least one contact method required' });
  }

  const lead = {
    refCode: refCode || 'unknown',
    contactName, contactEmail, contactPhone,
    bizName: previewData && previewData.bizName,
    industry: previewData && previewData.industry,
    city: previewData && previewData.city,
    headline: previewData && previewData.copy && previewData.copy.headline,
  };

  console.log('NEW LEAD -', JSON.stringify(lead));

  await Promise.all([sendLeadSms(lead), sendLeadEmail(lead)]);

  res.json({ success: true, message: "Thanks! We'll be in touch soon." });
});

app.get('/', (req, res) => {
  res.send('Demo Generator backend is running.');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log('Demo generator backend running on port ' + PORT);
});
