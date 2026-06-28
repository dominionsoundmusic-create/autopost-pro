const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!ANTHROPIC_API_KEY) console.warn('ANTHROPIC_API_KEY not set');
if (!UNSPLASH_ACCESS_KEY) console.warn('UNSPLASH_ACCESS_KEY not set');

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

const savedPreviews = new Map();

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
                                                                       const text = parsed.content?.[0]?.text || '';
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
    const { bizName, industry, city, phone, notable, lang, customRequest, isRegenerate } = req.body;

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

           const customInstruction = customRequest
      ? '\n\nThe business owner specifically asked for this in their own words: "' + customRequest + '". Take this request seriously and reflect it clearly in the headline, tone, and color choice.'
                 : '';

           const regenerateInstruction = isRegenerate
      ? '\n\nThis is a regeneration - the owner wants something noticeably DIFFERENT from a typical first attempt. Pick a different angle, a different photo concept, and feel free to vary the layout style (see layoutStyle field below).'
                 : '';

           const prompt = 'You are writing copy for a one-page website preview/mockup, for a small business demo tool. Write in ' + language + '.\n\n' +
                 'Business name: ' + bizName + '\n' +
                 'Industry: ' + (industry || 'general small business') + '\n' +
                 'City/location: ' + (city || 'not specified') + '\n' +
                 'Notable detail: ' + (notable || 'none provided') + customInstruction + regenerateInstruction + '\n\n' +
                 'Write ONLY valid JSON (no markdown, no backticks, no preamble) with this exact shape:\n' +
                 '{\n' +
                 '  "eyebrow": "a short 2-4 word label above the headline, e.g. Now accepting patients",\n' +
                 '  "headline": "a punchy 4-8 word headline that captures this specific business",\n' +
                 '  "subhead": "one sentence, naturally mentioning the business name and city if given",\n' +
                 '  "photoSearchTerm": "2-4 words to search a stock photo site for a relevant, real, professional photo of this exact type of business interior/work/product - be specific to the industry, not generic",\n' +
                 '  "accentColor": "a hex color code that fits this industry\'s mood - vary this meaningfully based on the business personality, not just industry category",\n' +
                 '  "layoutStyle": "one of: photo-hero (large full-bleed photo background), split (photo on one side, text on other), minimal (no photo, bold typography and color block instead) - choose whichever best fits the business personality and the request",\n' +
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
                 if (copy.layoutStyle !== 'minimal') {
                         try {
                                   photo = await fetchUnsplashPhoto(copy.photoSearchTerm || industry || 'small business');
                         } catch (e) {
                                   console.warn('Unsplash fetch failed, continuing without photo:', e.message);
                         }
                 }

      const refCode = generateRefCode();
                 savedPreviews.set(refCode, {
                         bizName, industry, city, phone, notable, lang, customRequest,
                         copy, photo, accent: copy.accentColor || '#c9a84c',
                         createdAt: new Date().toISOString(),
                 });

      res.json({ copy, photo, accent: copy.accentColor || '#c9a84c', refCode });
           } catch (err) {
                 console.error('generate-demo error:', err.message);
                 res.status(500).json({ error: err.message });
           }
});

app.post('/claim-preview', async (req, res) => {
    const { refCode, contactName, contactEmail, contactPhone } = req.body;

           if (!refCode || !savedPreviews.has(refCode)) {
                 return res.status(400).json({ error: 'Invalid or expired reference code' });
           }

           if (!contactName || (!contactEmail && !contactPhone)) {
                 return res.status(400).json({ error: 'Name and at least one contact method required' });
           }

           const preview = savedPreviews.get(refCode);

           console.log('NEW LEAD -', JSON.stringify({
                 refCode, contactName, contactEmail, contactPhone,
                 bizName: preview.bizName, industry: preview.industry, city: preview.city,
           }));

           res.json({ success: true, message: "Thanks! We'll be in touch soon." });
});

app.get('/', (req, res) => {
    res.send('Demo Generator backend is running.');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log('Demo generator backend running on port ' + PORT);
});
