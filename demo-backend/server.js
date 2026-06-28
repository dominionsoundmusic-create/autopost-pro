// Demo Generator Backend — Dominion Web Design Pro

// Deploy to Render.com — generates AI-written copy + real matching photos

// for the free website preview tool.

const express = require('express');

const cors = require('cors');

const https = require('https');

const app = express();

app.use(cors());

app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!ANTHROPIC_API_KEY) console.warn('⚠ ANTHROPIC_API_KEY not set');

if (!UNSPLASH_ACCESS_KEY) console.warn('⚠ UNSPLASH_ACCESS_KEY not set');

function callClaude(prompt) {

  return new Promise((resolve, reject) => {

    const body = JSON.stringify({

      model: 'claude-sonnet-4-6',

      max_tokens: 600,

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

    const path = `/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&content_filter=high`;

    const req = https.request(

      {

        hostname: 'api.unsplash.com',

        path,

        method: 'GET',

        headers: {

          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,

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

              url: parsed.urls?.regular || null,

              credit: parsed.user?.name || null,

              creditUrl: parsed.user?.links?.html || null,

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

  const { bizName, industry, city, phone, notable, lang } = req.body;

  if (!bizName) {

    return res.status(400).json({ error: 'bizName is required' });

  }

  const language = lang === 'es' ? 'Spanish' : 'English';

  const prompt = `You are writing copy for a one-page website preview/mockup, for a small business demo tool. Write in ${language}.

Business name: ${bizName}

Industry: ${industry || 'general small business'}

City/location: ${city || 'not specified'}

Notable detail: ${notable || 'none provided'}

Write ONLY valid JSON (no markdown, no backticks, no preamble) with this exact shape:

{

  "eyebrow": "a short 2-4 word label above the headline, e.g. 'Now accepting patients'",

  "headline": "a punchy 4-8 word headline that captures this specific business",

  "subhead": "one sentence, naturally mentioning the business name and city if given",

  "photoSearchTerm": "2-4 words to search a stock photo site for a relevant, real, professional photo of this exact type of business interior/work/product — be specific to the industry, not generic",

  "accentColor": "a hex color code that fits this industry's mood (e.g. warm terracotta for food, calm teal for medical, energetic lime for fitness)",

  "stat1": ["a short number/value", "a short label, e.g. '4.9★' / 'patient rating'"],

  "stat2": ["a short number/value", "a short label"],

  "stat3": ["a short number/value", "a short label"],

  "features": [

    {"h": "short feature headline (3-5 words)", "p": "one sentence benefit, specific to this industry"},

    {"h": "short feature headline", "p": "one sentence benefit"},

    {"h": "short feature headline", "p": "one sentence benefit"}

  ],

  "ctaHeadline": "a short urgency-driven headline for the closing call-to-action band",

  "ctaSub": "one supporting sentence"

}

Make the stats, features, and accent color genuinely specific to this exact industry — not generic business filler. If notable details were given, weave them in naturally.`;

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

    try {

      photo = await fetchUnsplashPhoto(copy.photoSearchTerm || industry || 'small business');

    } catch (e) {

      console.warn('Unsplash fetch failed, continuing without photo:', e.message);

    }

    res.json({ copy, photo, accent: copy.accentColor || '#c9a84c' });

  } catch (err) {

    console.error('generate-demo error:', err.message);

    res.status(500).json({ error: err.message });

  }

});

app.get('/', (req, res) => {

  res.send('Demo Generator backend is running.');

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {

  console.log(`Demo generator backend running on port ${PORT}`);

});
