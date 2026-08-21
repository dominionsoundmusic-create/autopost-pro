const express = require('express');
const { buildPremiumSite } = require('./premium-builder');
const { buildModernTemplate, buildBoldTemplate, buildElegantTemplate, buildRusticTemplate, buildMinimalTemplate, buildDominionDarkTemplate, buildPowerLocalTemplate, buildMagazineTemplate } = require('./templates');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY;
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM || '+19033005683';
const NOTIFY_PHONE = process.env.NOTIFY_PHONE || '+19035050889';

const ipCounts = {};
const IP_LIMIT = 5;

function getIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0] || req.ip;
}

function genRefCode() {
  return 'DWP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
}

const industryHeroes = {
  plumber: { emoji: '🔧', c1: '#0A1628', c2: '#1565C0', accent: '#4FC3F7', tagline: 'Fast & Reliable Plumbing', query: 'plumbing modern home water pipes professional' },
  plumbing: { emoji: '🔧', c1: '#0A1628', c2: '#1565C0', accent: '#4FC3F7', tagline: 'Fast & Reliable Plumbing', query: 'plumbing modern home water pipes professional' },
  dentist: { emoji: '🦷', c1: '#0A1A2E', c2: '#0277BD', accent: '#80DEEA', tagline: 'Gentle Modern Dental Care', query: 'dental office modern bright clean teeth smile' },
  dental: { emoji: '🦷', c1: '#0A1A2E', c2: '#0277BD', accent: '#80DEEA', tagline: 'Gentle Modern Dental Care', query: 'dental office modern bright clean teeth smile' },
  roof: { emoji: '🏠', c1: '#1A0A00', c2: '#4E342E', accent: '#FFCC80', tagline: 'Expert Roofing You Can Trust', query: 'roofing contractor house roof professional crew' },
  hvac: { emoji: '❄️', c1: '#002A20', c2: '#00695C', accent: '#80CBC4', tagline: 'Heating & Cooling Experts', query: 'hvac air conditioning modern home comfort' },
  heating: { emoji: '❄️', c1: '#002A20', c2: '#00695C', accent: '#80CBC4', tagline: 'Heating & Cooling Experts', query: 'hvac air conditioning modern home comfort' },
  cooling: { emoji: '❄️', c1: '#002A20', c2: '#00695C', accent: '#80CBC4', tagline: 'Heating & Cooling Experts', query: 'hvac air conditioning modern home comfort' },
  lawyer: { emoji: '⚖️', c1: '#0D0A1E', c2: '#311B92', accent: '#B39DDB', tagline: 'Experienced Legal Representation', query: 'law office attorney professional justice modern' },
  attorney: { emoji: '⚖️', c1: '#0D0A1E', c2: '#311B92', accent: '#B39DDB', tagline: 'Experienced Legal Representation', query: 'law office attorney professional justice modern' },
  legal: { emoji: '⚖️', c1: '#0D0A1E', c2: '#311B92', accent: '#B39DDB', tagline: 'Experienced Legal Representation', query: 'law office attorney professional justice modern' },
  chiro: { emoji: '🦴', c1: '#0A1E0A', c2: '#1B5E20', accent: '#A5D6A7', tagline: 'Feel Better. Move Better. Live Better.', query: 'chiropractic wellness health spine professional clinic' },
  auto: { emoji: '🚗', c1: '#1A0000', c2: '#B71C1C', accent: '#EF9A9A', tagline: 'Auto Repair Done Right', query: 'auto repair garage mechanic modern professional' },
  car: { emoji: '🚗', c1: '#1A0000', c2: '#B71C1C', accent: '#EF9A9A', tagline: 'Auto Repair Done Right', query: 'auto repair garage mechanic modern professional' },
  'real estate': { emoji: '🏡', c1: '#1A0A00', c2: '#BF360C', accent: '#FFAB91', tagline: 'Your Local Real Estate Expert', query: 'real estate luxury home beautiful house neighborhood' },
  realtor: { emoji: '🏡', c1: '#1A0A00', c2: '#BF360C', accent: '#FFAB91', tagline: 'Your Local Real Estate Expert', query: 'real estate luxury home beautiful house neighborhood' },
  restaurant: { emoji: '🍽️', c1: '#1A001A', c2: '#880E4F', accent: '#F48FB1', tagline: 'Great Food. Great Experience.', query: 'restaurant fine dining food elegant table candle' },
  food: { emoji: '🍽️', c1: '#1A001A', c2: '#880E4F', accent: '#F48FB1', tagline: 'Great Food. Great Experience.', query: 'restaurant fine dining food elegant table candle' },
  contractor: { emoji: '🔨', c1: '#0A0F14', c2: '#263238', accent: '#B0BEC5', tagline: 'Quality Construction & Renovation', query: 'construction contractor building modern renovation professional' },
  construction: { emoji: '🔨', c1: '#0A0F14', c2: '#263238', accent: '#B0BEC5', tagline: 'Quality Construction & Renovation', query: 'construction contractor building modern renovation professional' },
  landscape: { emoji: '🌿', c1: '#001A00', c2: '#1B5E20', accent: '#C8E6C9', tagline: 'Beautiful Lawns & Landscapes', query: 'landscaping lawn garden luxury outdoor green' },
  lawn: { emoji: '🌿', c1: '#001A00', c2: '#1B5E20', accent: '#C8E6C9', tagline: 'Beautiful Lawns & Landscapes', query: 'landscaping lawn garden luxury outdoor green' },
  electric: { emoji: '⚡', c1: '#1A0E00', c2: '#E65100', accent: '#FFB74D', tagline: 'Licensed Electrical Contractors', query: 'electrician electrical modern professional panel wiring' },
  insurance: { emoji: '🛡️', c1: '#0A0A1A', c2: '#1A237E', accent: '#9FA8DA', tagline: 'Protect What Matters Most', query: 'insurance protection family security professional office' },
  gym: { emoji: '💪', c1: '#050505', c2: '#212121', accent: '#E2C06A', tagline: 'Transform Your Body. Transform Your Life.', query: 'gym fitness modern workout premium weights' },
  fitness: { emoji: '💪', c1: '#050505', c2: '#212121', accent: '#E2C06A', tagline: 'Transform Your Body. Transform Your Life.', query: 'gym fitness modern workout premium weights' },
  salon: { emoji: '✂️', c1: '#1A0010', c2: '#6d1a3a', accent: '#e8a0b0', tagline: 'Look Great. Feel Amazing.', query: 'hair salon luxury beauty glamour modern interior' },
  hair: { emoji: '✂️', c1: '#1A0010', c2: '#6d1a3a', accent: '#e8a0b0', tagline: 'Look Great. Feel Amazing.', query: 'hair salon luxury beauty glamour modern interior' },
  vet: { emoji: '🐾', c1: '#001A10', c2: '#1B5E20', accent: '#A5D6A7', tagline: 'Caring for Your Pets Like Family', query: 'veterinarian pet clinic professional dog cat care' },
  animal: { emoji: '🐾', c1: '#001A10', c2: '#1B5E20', accent: '#A5D6A7', tagline: 'Caring for Your Pets Like Family', query: 'veterinarian pet clinic professional dog cat care' },
  account: { emoji: '📊', c1: '#0A0A1A', c2: '#1A237E', accent: '#9FA8DA', tagline: 'Expert Financial & Tax Services', query: 'accounting finance professional office modern business' },
  tax: { emoji: '📊', c1: '#0A0A1A', c2: '#1A237E', accent: '#9FA8DA', tagline: 'Expert Financial & Tax Services', query: 'accounting finance professional office modern business' },
  photo: { emoji: '📸', c1: '#050505', c2: '#212121', accent: '#E2C06A', tagline: 'Capturing Your Most Precious Moments', query: 'photography camera portrait wedding professional studio' },
  clean: { emoji: '✨', c1: '#001A1A', c2: '#006064', accent: '#80DEEA', tagline: 'A Cleaner Home. A Better Life.', query: 'cleaning service spotless modern home bright professional' },
  maid: { emoji: '✨', c1: '#001A1A', c2: '#006064', accent: '#80DEEA', tagline: 'A Cleaner Home. A Better Life.', query: 'cleaning service spotless modern home bright professional' },
  pest: { emoji: '🛡️', c1: '#0A1400', c2: '#33691E', accent: '#DCEDC8', tagline: 'Pest-Free Living Starts Here', query: 'pest control professional home protection clean' },
  default: { emoji: '🏢', c1: '#0A0F1E', c2: '#1B3A6B', accent: '#E2C06A', tagline: 'Professional Services You Can Trust', query: 'professional business modern office premium' }
};

// ---------------------------------------------------------------------------
// Local demo image library. Served from dominionwebdesignpro.com, so there is
// no third-party API, no hourly rate limit, and no key that can expire.
// Falls back to Unsplash for anything not covered.
// ---------------------------------------------------------------------------
const PHOTO_BASE = 'https://dominionwebdesignpro.com/demo-images';

const PHOTO_COUNTS = {
  'accounting': 4, 'auto-repair': 4, 'chiropractic': 8, 'cleaning': 4,
  'construction': 4, 'default': 4, 'dental': 4, 'electrical': 4, 'gym': 4,
  'hvac': 4, 'insurance': 4, 'landscaping': 4, 'legal': 4, 'pest-control': 4,
  'photography': 4, 'plumbing': 4, 'real-estate': 4, 'restaurant': 4,
  'roofing': 4, 'salon': 4, 'veterinary': 4
};

// maps the industryHeroes keys onto photo folders
// Ordered longest-to-shortest is WRONG: 'contractor' (10 chars) beat 'hvac' (4),
// so "HVAC contractor" and "Roofing contractor" both landed in construction.
// This is an ORDERED list — specific trades first, generic catch-alls last.
const PHOTO_FOLDER_RULES = [
  ['chiropract', 'chiropractic'],
  ['hvac', 'hvac'], ['heating', 'hvac'], ['cooling', 'hvac'],
  ['air conditioning', 'hvac'], ['furnace', 'hvac'],
  ['roof', 'roofing'],
  ['plumb', 'plumbing'],
  ['electric', 'electrical'],
  ['dentist', 'dental'], ['dental', 'dental'], ['orthodont', 'dental'],
  ['attorney', 'legal'], ['lawyer', 'legal'], ['legal', 'legal'], ['law firm', 'legal'],
  ['veterinar', 'veterinary'], ['animal hospital', 'veterinary'], ['vet clinic', 'veterinary'],
  ['pest', 'pest-control'], ['exterminat', 'pest-control'], ['termite', 'pest-control'],
  ['nail', 'salon'], ['hair', 'salon'], ['barber', 'salon'], ['salon', 'salon'], ['spa', 'salon'],
  ['landscap', 'landscaping'], ['lawn', 'landscaping'], ['tree service', 'landscaping'],
  ['tree ', 'landscaping'], ['arborist', 'landscaping'],
  ['auto repair', 'auto-repair'], ['auto body', 'auto-repair'], ['mechanic', 'auto-repair'],
  ['collision', 'auto-repair'], ['tire', 'auto-repair'],
  ['real estate', 'real-estate'], ['realtor', 'real-estate'], ['realty', 'real-estate'],
  ['restaurant', 'restaurant'], ['cafe', 'restaurant'], ['diner', 'restaurant'],
  ['pizzeria', 'restaurant'], ['bakery', 'restaurant'], ['catering', 'restaurant'],
  ['gym', 'gym'], ['fitness', 'gym'], ['crossfit', 'gym'], ['pilates', 'gym'], ['yoga', 'gym'],
  ['insurance', 'insurance'],
  ['accounting', 'accounting'], ['accountant', 'accounting'], ['bookkeep', 'accounting'],
  ['tax', 'accounting'], ['cpa', 'accounting'],
  ['photograph', 'photography'],
  ['maid', 'cleaning'], ['janitorial', 'cleaning'], ['housekeep', 'cleaning'],
  ['clean', 'cleaning'],
  // generic catch-alls LAST so a named trade always wins
  ['general contractor', 'construction'], ['remodel', 'construction'],
  ['construction', 'construction'], ['builder', 'construction'], ['contractor', 'construction']
];

function getPhotoFolder(businessName, businessType) {
  // businessType is the deliberate signal; check it before the free-text name
  for (const source of [String(businessType || ''), String(businessName || '')]) {
    const text = source.toLowerCase();
    for (const [key, folder] of PHOTO_FOLDER_RULES) {
      if (text.includes(key)) return folder;
    }
  }
  return 'default';
}

// Picks distinct images so the hero, about and service shots are not identical.
function pickLocalPhotos(folder, howMany) {
  const count = PHOTO_COUNTS[folder] || 0;
  if (!count) return [];
  const nums = Array.from({ length: count }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  const out = [];
  for (let i = 0; i < howMany; i++) {
    out.push(`${PHOTO_BASE}/${folder}/${nums[i % nums.length]}.jpg`);
  }
  return out;
}

function getHero(businessName, businessType) {
  // Was: sort keys by length descending. That is not specificity — 'construction'
  // (12) and 'contractor' (10) beat 'hvac' (4), so "HVAC contractor" got the
  // hammer icon, the grey construction palette and a construction Unsplash query.
  // Derive from the same ordered rules so the two can never drift apart.
  const folderToHero = {
    'hvac': 'hvac', 'roofing': 'roof', 'plumbing': 'plumber', 'electrical': 'electric',
    'dental': 'dentist', 'legal': 'attorney', 'veterinary': 'vet', 'pest-control': 'pest',
    'salon': 'salon', 'landscaping': 'landscape', 'auto-repair': 'auto',
    'real-estate': 'real estate', 'restaurant': 'restaurant', 'gym': 'gym',
    'insurance': 'insurance', 'accounting': 'account', 'photography': 'photo',
    'cleaning': 'clean', 'chiropractic': 'chiro', 'construction': 'contractor'
  };
  const key = folderToHero[getPhotoFolder(businessName, businessType)];
  if (key && industryHeroes[key]) return industryHeroes[key];
  return industryHeroes.default;
}

function fetchUnsplash(query) {
  return new Promise((resolve) => {
    if (!UNSPLASH_KEY) return resolve(null);
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`;
    const req = https.request(url, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const photos = (j.results || []).map(p => p.urls?.regular).filter(Boolean);
          resolve(photos[Math.floor(Math.random() * Math.min(3, photos.length))] || null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}


// Models occasionally wrap JSON in prose or a code fence. Take the outermost
// braces rather than trusting the whole reply, and retry before giving up —
// a silent failure here is what makes social buttons appear only sometimes.
function extractJson(text) {
  const cleaned = String(text || '').replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('no JSON object found in reply: ' + cleaned.slice(0, 200));
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callClaudeJson(prompt, attempts = 3, label = 'ai') {
  let lastErr;
  for (let n = 1; n <= attempts; n++) {
    try {
      return extractJson(await callClaude(prompt));
    } catch (e) {
      lastErr = e;
      console.warn(`[${label}] attempt ${n} of ${attempts} failed: ${e.message}`);
      if (n < attempts) await new Promise(r => setTimeout(r, 400 * n));
    }
  }
  throw lastErr;
}

function callClaude(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });
    const req = https.request('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            return reject(new Error('Anthropic API: ' + (parsed.error.message || parsed.error.type || 'unknown error')));
          }
          if (!parsed.content || !parsed.content[0]) {
            return reject(new Error('Anthropic API returned no content: ' + data.slice(0, 300)));
          }
          resolve(parsed.content[0].text);
        }
        catch (e) { reject(new Error('Claude parse error: ' + e.message + ' — raw: ' + data.slice(0, 300))); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sendTwilioSMS(to, body) {
  if (!TWILIO_SID || !TWILIO_TOKEN) return;
  const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
  const postData = new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }).toString();
  const req = https.request(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  req.write(postData);
  req.end();
}

app.post('/generate-demo', async (req, res) => {
  const ip = getIP(req);
  ipCounts[ip] = (ipCounts[ip] || 0) + 1;
  if (ipCounts[ip] > IP_LIMIT) return res.status(429).json({ error: 'Preview limit reached. Call (903) 636-7511 for your custom site.' });

  const { businessName, businessType, city, state, customRequest, primaryColor } = req.body;
  if (!businessName || !businessType || !city) return res.status(400).json({ error: 'Missing required fields' });

  const refCode = genRefCode();
  let hero = getHero(businessName, businessType);
  // Allow color override from the builder
  if (primaryColor) {
    hero = { ...hero, c1: primaryColor, c2: primaryColor };
  }
  const local = pickLocalPhotos(getPhotoFolder(businessName, businessType), 3);

  try {
    const [copy, heroImg, aboutImg, serviceImg] = await Promise.all([
      callClaude(`You are writing premium website copy for a local business. Be specific, compelling, and professional — NOT generic.

HARD RULES — these override everything else:
1. NEVER invent facts about this business. No licences, insurance, certifications, awards, years in business, customer counts, ratings, prices, warranties, staff names, or statistics. You do not know any of them.
2. NEVER write a customer review or testimonial. Fabricated reviews are unlawful and this is a real named business.
3. NEVER claim emergency, 24/7 or same-day availability.
4. Where a real figure would go, output the placeholder exactly as specified so the owner can fill it in.
5. Banned phrases: "your trusted partner", "one-stop solution", "look no further", "unmatched excellence", "we've got you covered".
6. Write plainly. Short paragraphs. No em dashes in visible copy. No eyebrow labels above headings.

Business: "${businessName}"
Type: "${businessType}"  
Location: "${city}${state ? ', ' + state : ''}"
${customRequest ? 'Special request: ' + customRequest : ''}

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "headline": "powerful 5-7 word headline that speaks to their specific customers pain points",
  "subheadline": "compelling 18-22 word subheadline with a specific benefit and location mention",
  "badge1": "a short badge that states an INTENT rather than an unverified fact - e.g. 'Free Estimates' or 'Locally Owned'. NEVER claim a licence, insurance, a rating, an award, years in business, or same-day/24-7/emergency availability",
  "badge2": "a second badge under the same rule",
  "badge3": "a third badge under the same rule",
  "service1": "specific service name",
  "service1desc": "2 sentences about this service with a benefit. Make the FIRST sentence a complete thought under 15 words - it is shown alone on the hero card",
  "service1icon": "single relevant emoji",
  "service2": "specific service name",
  "service2desc": "2 sentences about this service with a benefit. Make the FIRST sentence a complete thought under 15 words - it is shown alone on the hero card",
  "service2icon": "single relevant emoji",
  "service3": "specific service name",
  "service3desc": "2 sentences about this service with a benefit. Make the FIRST sentence a complete thought under 15 words - it is shown alone on the hero card",
  "service3icon": "single relevant emoji",
  "stat1num": "[YOUR NUMBER]",
  "stat1label": "a stat label this business would plausibly fill in, e.g. 'Years in Business' or 'Jobs Completed' - the LABEL only, never a made-up figure",
  "stat2num": "[YOUR NUMBER]",
  "stat2label": "a second stat label, no figure",
  "stat3num": "[YOUR NUMBER]",
  "stat3label": "a third stat label, no figure",
  "aboutTitle": "4-5 word about section headline",
  "aboutText": "3-4 sentences about the business, their commitment to the city, what makes them different. Sound local and real.",
  "whyTitle": "compelling reason to choose them headline 4-5 words",
  "why1": "first key differentiator short phrase",
  "why1detail": "one sentence elaboration",
  "why2": "second key differentiator",
  "why2detail": "one sentence elaboration",
  "why3": "third key differentiator",
  "why3detail": "one sentence elaboration",
  "testimonial1": "[Your real Google review will appear here. Send us your reviews and we will put them on the page.]",
  "testimonial1name": "[Customer name]",
  "testimonial2": "[Your real Google review will appear here.]",
  "testimonial2name": "[Customer name]",
  "cta": "action-oriented 3-5 word CTA button text",
  "ctaSubtext": "urgency line under CTA like 'Free consultation — no commitment required'"
}`),
      local[0] ? Promise.resolve(local[0]) : fetchUnsplash(hero.query),
      local[1] ? Promise.resolve(local[1]) : fetchUnsplash(businessType + ' professional team staff'),
      local[2] ? Promise.resolve(local[2]) : fetchUnsplash(businessType + ' work service quality result')
    ]);

    let d;
    try { d = JSON.parse(copy); }
    catch {
      d = {
        headline: `${businessType} Services in ${city}`, subheadline: `Professional ${businessType} services in ${city}. Trusted by hundreds of local customers.`,
        badge1: 'Free Estimates', badge2: 'Locally Owned', badge3: 'Straight Answers',
        service1: 'Professional Service', service1desc: 'Expert service delivered with care and precision.', service1icon: hero.emoji,
        service2: 'Quality Workmanship', service2desc: 'Every job done right the first time, guaranteed.', service2icon: '⭐',
        service3: 'Customer First', service3desc: 'Your satisfaction is our top priority on every project.', service3icon: '✅',
        stat1num: '[YOUR NUMBER]', stat1label: 'Jobs Completed', stat2num: '[YOUR NUMBER]', stat2label: 'Years in Business', stat3num: '[YOUR NUMBER]', stat3label: 'Google Reviews',
        aboutTitle: `About ${businessName}`, aboutText: `${businessName} has proudly served ${city} and surrounding communities. We bring expertise, dedication, and a commitment to excellence to every project.`,
        whyTitle: 'Why Choose Us', why1: 'Expert Team', why1detail: 'Our trained professionals deliver exceptional results every time.',
        why2: 'Fast & Reliable', why2detail: 'We show up on time and get the job done right.',
        why3: 'Fair Pricing', why3detail: 'Transparent quotes with no hidden fees or surprises.',
        testimonial1: '[Your real Google review will appear here. Send us your reviews and we will add them.]', testimonial1name: '[Customer name]',
        testimonial2: '[Your real Google review will appear here.]', testimonial2name: '[Customer name]',
        cta: 'Get Your Free Quote', ctaSubtext: 'No commitment required — call or click'
      };
    }

    const html = buildHTML(businessName, businessType, city, state, d, hero, heroImg, aboutImg, serviceImg, refCode);
    res.json({ html, refCode });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Generation failed. Please try again.' });
  }
});


// Trims to a whole-word boundary. The old code did substring(0,80)+'...' which
// cut mid-word ("wait on until Mond...") and always showed an ellipsis even
// when nothing was removed, so every card looked unfinished.
function clampWords(text, maxWords) {
  const t = String(text || '').trim();
  if (!t) return '';
  // The copy spec asks for two sentences: the card wants one, the services
  // section below shows the full text. Cut on the first sentence end when it
  // lands in a sensible range so the card reads as finished, not truncated.
  const m = t.match(/^(.{25,150}?[.!?])(\s|$)/);
  if (m) return m[1];
  const words = t.split(/\s+/);
  if (words.length <= maxWords) return t;
  return words.slice(0, maxWords).join(' ').replace(/[,;:.\-]+$/, '') + '\u2026';
}

function buildHTML(name, type, city, state, d, hero, heroImg, aboutImg, serviceImg, refCode) {
  const loc = `${city}${state ? ', ' + state : ''}`;
  const phone = '(903) 636-7511';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} — ${type} in ${loc}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<style>
:root{
  --c1:${hero.c1};--c2:${hero.c2};--accent:${hero.accent};
  --gold:#E2C06A;--gold2:#C9A84C;
  --white:#ffffff;--off:#F8F9FC;--text:#0F172A;--muted:#64748B;
  --radius:16px;--radius-lg:24px;
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Inter',Arial,sans-serif;background:var(--white);color:var(--text);-webkit-font-smoothing:antialiased;margin:0;padding:0}

/* PREVIEW BAR */
.preview-bar{
  position:fixed;top:0;left:0;right:0;z-index:9999;
  background:rgba(10,15,30,0.97);
  backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(226,192,106,0.3);
  padding:10px 24px;
  display:flex;justify-content:space-between;align-items:center;
  box-shadow:0 4px 24px rgba(0,0,0,0.4);
}
.preview-bar-left{display:flex;align-items:center;gap:10px}
.preview-badge{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#0A0F1E;font-size:.65rem;font-weight:800;padding:3px 10px;border-radius:20px;letter-spacing:1px;text-transform:uppercase}
.preview-bar-left span{color:rgba(255,255,255,.55);font-size:.75rem}
.preview-bar-left strong{color:var(--gold);font-weight:700}
.preview-bar-right{display:flex;gap:8px;align-items:center}
.ref-code{font-size:.65rem;color:rgba(255,255,255,.3);letter-spacing:1px}

/* NAV */
nav{
  position:sticky;top:54px;z-index:100;
  background:${heroImg ? 'rgba('+parseInt(hero.c1.slice(1,3),16)+','+parseInt(hero.c1.slice(3,5),16)+','+parseInt(hero.c1.slice(5,7),16)+',0.97)' : hero.c1};
  backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,0.08);
  padding:0 48px;
  display:flex;justify-content:space-between;align-items:center;
  height:70px;
}
.nav-logo{display:flex;align-items:center;gap:10px}
.nav-logo-icon{width:38px;height:38px;background:linear-gradient(135deg,var(--gold2),var(--gold));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0}
.nav-logo-text{font-size:.95rem;font-weight:800;color:var(--white);line-height:1.1}
.nav-logo-sub{font-size:.65rem;color:rgba(255,255,255,.45);font-weight:400}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-links a{color:rgba(255,255,255,.65);font-size:.82rem;font-weight:500;text-decoration:none;transition:color 0.2s}
.nav-links a:hover{color:var(--white)}
.nav-cta{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#0A0F1E;padding:10px 20px;border-radius:10px;font-weight:800;font-size:.82rem;text-decoration:none;white-space:nowrap}
@media(max-width:768px){.nav-links{display:none}nav{padding:0 20px}}

/* HERO */
.hero{
  position:relative;
  height:calc(100vh - 84px);max-height:700px;min-height:520px;
  display:flex;align-items:center;
  background:#000;
  overflow:hidden;
  padding-top:0;
}
.hero-bg{
  position:absolute;inset:0;
  ${heroImg ? `background-image:url('${heroImg}');background-size:cover;background-position:center;` : ''}
  opacity:1;
}
.hero-overlay{
  position:absolute;inset:0;
  background:${heroImg ? 'linear-gradient(100deg,rgba(0,0,0,0.80) 0%,rgba(0,0,0,0.50) 35%,rgba(0,0,0,0.08) 65%,rgba(0,0,0,0.0) 100%)' : 'transparent'};
}
.hero-grid{
  position:relative;z-index:2;
  max-width:1200px;margin:0 auto;width:100%;
  padding:80px 48px;
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  gap:clamp(48px,6vw,96px);align-items:center;
}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr;padding:60px 24px;gap:32px}}
.hero-left{min-width:0}
.hero-left h1{max-width:15ch;overflow-wrap:break-word}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:var(--accent);font-size:.72rem;font-weight:700;padding:6px 14px;border-radius:20px;margin-bottom:20px;letter-spacing:1px;text-transform:uppercase}
.hero h1{font-size:clamp(2rem,4.5vw,3.2rem);font-weight:900;color:var(--white);line-height:1.08;margin-bottom:18px;letter-spacing:-0.02em;text-shadow:0 2px 12px rgba(0,0,0,0.9),0 1px 4px rgba(0,0,0,0.8)}
.hero h1 em{font-style:normal;color:var(--accent)}
.hero-sub{font-size:clamp(.95rem,2vw,1.1rem);color:var(--white);line-height:1.7;margin-bottom:32px;max-width:520px;text-shadow:0 1px 8px rgba(0,0,0,0.9);background:rgba(0,0,0,0.35);padding:12px 16px;border-radius:8px;backdrop-filter:blur(2px)}
.hero-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px}
.hero-badge{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.85);font-size:.75rem;font-weight:600;padding:6px 12px;border-radius:8px}
.hero-badge::before{content:'✓';color:var(--accent);font-weight:900}
.hero-btns{display:flex;flex-wrap:wrap;gap:12px}
.btn-primary{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#0A0F1E;padding:14px 28px;border-radius:12px;font-weight:800;font-size:.9rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(201,168,76,0.35);transition:transform 0.2s}
.btn-primary:hover{transform:translateY(-2px)}
.btn-secondary{background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.2);color:var(--white);padding:14px 28px;border-radius:12px;font-weight:700;font-size:.9rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
.hero-right{display:flex;flex-direction:column;gap:12px}
@media(max-width:900px){.hero-right{display:none}}
.hero-card{background:rgba(8,10,16,0.72);border:1px solid rgba(255,255,255,0.14);border-radius:var(--radius);padding:20px 22px;backdrop-filter:blur(14px);box-shadow:0 8px 28px rgba(0,0,0,0.35)}
.hero-card-icon{font-size:1.5rem;margin-bottom:8px}
.hero-card h3{font-size:.88rem;font-weight:700;color:var(--white);margin-bottom:4px}
.hero-card p{font-size:.79rem;color:rgba(255,255,255,0.82);line-height:1.55}

/* STATS */
.stats-strip{background:var(--off);border-bottom:1px solid #E2E8F0;padding:32px 48px}
.stats-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#E2E8F0}
@media(max-width:600px){.stats-inner{grid-template-columns:1fr}}
.stat-item{background:var(--off);padding:28px 32px;text-align:center}
.stat-num{font-size:2.2rem;font-weight:900;color:var(--c2);line-height:1}
.stat-label{font-size:.78rem;color:var(--muted);margin-top:4px;font-weight:500}

/* SERVICES */
.services{padding:88px 48px;max-width:1200px;margin:0 auto}
@media(max-width:768px){.services{padding:64px 24px}}
.section-label{font-size:.7rem;font-weight:700;color:var(--c2);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}
.section-title{font-size:clamp(1.6rem,3vw,2.2rem);font-weight:900;color:var(--text);margin-bottom:10px;letter-spacing:-0.02em}
.section-sub{color:var(--muted);font-size:.95rem;line-height:1.7;max-width:560px;margin-bottom:48px}
.svc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
@media(max-width:768px){.svc-grid{grid-template-columns:1fr}}
.svc-card{
  border:1px solid #E2E8F0;border-radius:var(--radius-lg);padding:32px 28px;
  transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s;
  position:relative;overflow:hidden;
}
.svc-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--c2)08,transparent);opacity:0;transition:opacity 0.3s}
.svc-card:hover{transform:translateY(-4px);box-shadow:0 20px 48px rgba(0,0,0,0.1);border-color:var(--accent)}
.svc-card:hover::before{opacity:1}
.svc-icon-wrap{width:52px;height:52px;background:linear-gradient(135deg,${hero.c1},${hero.c2});border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:18px;box-shadow:0 4px 16px rgba(0,0,0,0.2)}
.svc-card h3{font-size:1rem;font-weight:700;color:var(--text);margin-bottom:10px}
.svc-card p{font-size:.84rem;color:var(--muted);line-height:1.75}
.svc-link{display:inline-flex;align-items:center;gap:4px;margin-top:14px;color:var(--c2);font-size:.8rem;font-weight:700;text-decoration:none}

/* ABOUT */
.about{background:#f8fafc;padding:88px 48px;overflow:hidden;position:relative}
@media(max-width:768px){.about{padding:64px 24px}}
.about::before{content:'';position:absolute;top:-100px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(255,255,255,0.05) 0%,transparent 70%);border-radius:50%}
.about-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;position:relative;z-index:1}
@media(max-width:900px){.about-inner{grid-template-columns:1fr;gap:40px}}
.about-img-wrap{position:relative}
.about-img{border-radius:var(--radius-lg);overflow:hidden;height:420px;box-shadow:0 24px 64px rgba(0,0,0,0.4)}
.about-img img{width:100%;height:100%;object-fit:cover}
.about-img-no{background:#e2e8f0;border-radius:var(--radius-lg);height:420px;display:flex;align-items:center;justify-content:center;font-size:5rem;border:1px solid #cbd5e1}
.about-float{position:absolute;bottom:-16px;right:-16px;background:linear-gradient(135deg,var(--gold2),var(--gold));border-radius:var(--radius);padding:16px 20px;box-shadow:0 8px 32px rgba(201,168,76,0.4)}
.about-float-num{font-size:1.8rem;font-weight:900;color:#0A0F1E;line-height:1}
.about-float-txt{font-size:.7rem;font-weight:700;color:#0A0F1E;opacity:0.7}
.about-content .section-label{color:var(--accent)}
.about-content .section-title{color:#0f172a}
.about-text{color:#475569;font-size:.92rem;line-height:1.85;margin-bottom:28px}
.why-list{display:flex;flex-direction:column;gap:14px}
.why-item{display:flex;gap:14px;align-items:flex-start}
.why-icon{width:36px;height:36px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:.9rem;flex-shrink:0}
.why-item h4{font-size:.88rem;font-weight:700;color:var(--white);margin-bottom:2px}
.why-item p{font-size:.78rem;color:rgba(255,255,255,0.55);line-height:1.6}

/* TESTIMONIALS */
.testimonials{padding:88px 48px;background:var(--off)}
@media(max-width:768px){.testimonials{padding:64px 24px}}
.test-inner{max-width:1200px;margin:0 auto}
.test-grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:48px}
@media(max-width:768px){.test-grid{grid-template-columns:1fr}}
.test-card{background:var(--white);border:1px solid #E2E8F0;border-radius:var(--radius-lg);padding:32px;box-shadow:0 4px 24px rgba(0,0,0,0.06)}
.test-stars{color:#F59E0B;font-size:1rem;margin-bottom:14px;letter-spacing:2px}
.test-text{font-size:.9rem;color:#374151;line-height:1.8;margin-bottom:18px;font-style:italic}
.test-author{display:flex;align-items:center;gap:12px}
.test-avatar{width:40px;height:40px;background:linear-gradient(135deg,${hero.c1},${hero.c2});border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--white);font-weight:800;font-size:.9rem}
.test-name{font-size:.83rem;font-weight:700;color:var(--text)}
.test-location{font-size:.72rem;color:var(--muted)}
.google-badge{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:6px 12px;font-size:.72rem;font-weight:600;color:#374151;margin-top:32px;box-shadow:0 2px 8px rgba(0,0,0,0.06)}

/* CTA */
.cta-section{
  padding:88px 48px;
  background:linear-gradient(135deg,${hero.c1},${hero.c2});
  text-align:center;position:relative;overflow:hidden;
}
@media(max-width:768px){.cta-section{padding:64px 24px}}
.cta-section::before{content:'';position:absolute;top:-150px;left:50%;transform:translateX(-50%);width:600px;height:600px;background:radial-gradient(circle,rgba(255,255,255,0.06) 0%,transparent 70%);border-radius:50%}
.cta-inner{position:relative;z-index:1;max-width:700px;margin:0 auto}
.cta-section h2{font-size:clamp(1.6rem,3.5vw,2.4rem);font-weight:900;color:var(--white);margin-bottom:14px;letter-spacing:-0.02em}
.cta-section p{color:rgba(255,255,255,0.72);font-size:1rem;line-height:1.7;margin-bottom:36px}
.cta-btns{display:flex;flex-wrap:wrap;justify-content:center;gap:14px;margin-bottom:20px}
.cta-sub{font-size:.78rem;color:rgba(255,255,255,0.4)}
.btn-white{background:var(--white);color:var(--c2);padding:15px 32px;border-radius:12px;font-weight:800;font-size:.92rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(0,0,0,0.2)}
.btn-gold{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#0A0F1E;padding:15px 32px;border-radius:12px;font-weight:800;font-size:.92rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(201,168,76,0.35)}

/* FOOTER */
footer{
  background:#0A0F1E;
  padding:32px 48px;
  display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;
}
@media(max-width:768px){footer{padding:24px;flex-direction:column;text-align:center}}
.footer-left p{color:rgba(255,255,255,.3);font-size:.73rem;line-height:1.6}
.footer-right{display:flex;align-items:center;gap:8px}
.dominion-link{display:inline-flex;align-items:center;gap:7px;background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);border-radius:10px;padding:8px 14px;text-decoration:none;transition:background 0.2s}
.dominion-link:hover{background:rgba(201,168,76,0.15)}
.dominion-link span{font-size:.72rem;font-weight:700;color:var(--gold);line-height:1.2}
.dominion-link small{font-size:.65rem;color:rgba(255,255,255,.35);display:block;font-weight:400}
</style>
</head>
<body>


<!-- NAV -->
<nav>
  <div class="nav-logo">
    <div class="nav-logo-icon">${hero.emoji}</div>
    <div>
      <div class="nav-logo-text">${name}</div>
      <div class="nav-logo-sub">${type} · ${loc}</div>
    </div>
  </div>
  <div class="nav-links">
    <a href="#">Services</a>
    <a href="#">About</a>
    <a href="#">Reviews</a>
    <a href="#">Contact</a>
  </div>
  <a href="tel:+19036367511" class="nav-cta">📞 ${phone}</a>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-overlay"></div>
  <div class="hero-grid">
    <div class="hero-left">
      <div class="hero-eyebrow">${hero.emoji} ${type} · ${loc}</div>
      <h1>${d.headline.replace(/([A-Z][a-z]+)/g, '<em>$1</em>').replace(/<em>/g,'<em>').replace(/<\/em>/g,'</em>')}</h1>
      <p class="hero-sub">${d.subheadline}</p>
      <div class="hero-badges">
        <div class="hero-badge">${d.badge1}</div>
        <div class="hero-badge">${d.badge2}</div>
        <div class="hero-badge">${d.badge3}</div>
      </div>
      <div class="hero-btns">
        <a href="tel:+19036367511" class="btn-primary">📞 ${d.cta}</a>
        <a href="tel:+19036367511" class="btn-secondary">Get Free Quote</a>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-card">
        <div class="hero-card-icon">${d.service1icon || hero.emoji}</div>
        <h3>${d.service1}</h3>
        <p>${clampWords(d.service1desc, 14)}</p>
      </div>
      <div class="hero-card">
        <div class="hero-card-icon">${d.service2icon || '⭐'}</div>
        <h3>${d.service2}</h3>
        <p>${clampWords(d.service2desc, 14)}</p>
      </div>
      <div class="hero-card">
        <div class="hero-card-icon">${d.service3icon || '✅'}</div>
        <h3>${d.service3}</h3>
        <p>${clampWords(d.service3desc, 14)}</p>
      </div>
    </div>
  </div>
</div>

<!-- STATS -->
<div class="stats-strip">
  <div class="stats-inner">
    <div class="stat-item">
      <div class="stat-num">${d.stat1num}</div>
      <div class="stat-label">${d.stat1label}</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">${d.stat2num}</div>
      <div class="stat-label">${d.stat2label}</div>
    </div>
    <div class="stat-item">
      <div class="stat-num">${d.stat3num}</div>
      <div class="stat-label">${d.stat3label}</div>
    </div>
  </div>
</div>

<!-- SERVICES -->
<div class="services">
  <div class="section-label">What We Do</div>
  <h2 class="section-title">Our Services</h2>
  <p class="section-sub">Expert ${type} services for homeowners and businesses in ${loc} and surrounding areas.</p>
  <div class="svc-grid">
    <div class="svc-card">
      <div class="svc-icon-wrap">${d.service1icon || hero.emoji}</div>
      <h3>${d.service1}</h3>
      <p>${d.service1desc}</p>
      <a href="tel:+19036367511" class="svc-link">Learn more →</a>
    </div>
    <div class="svc-card">
      <div class="svc-icon-wrap">${d.service2icon || '⭐'}</div>
      <h3>${d.service2}</h3>
      <p>${d.service2desc}</p>
      <a href="tel:+19036367511" class="svc-link">Learn more →</a>
    </div>
    <div class="svc-card">
      <div class="svc-icon-wrap">${d.service3icon || '✅'}</div>
      <h3>${d.service3}</h3>
      <p>${d.service3desc}</p>
      <a href="tel:+19036367511" class="svc-link">Learn more →</a>
    </div>
  </div>
</div>

<!-- ABOUT -->
<div class="about">
  <div class="about-inner">
    <div class="about-img-wrap">
      ${aboutImg
        ? `<div class="about-img"><img src="${aboutImg}" alt="${name} team" loading="lazy"></div>`
        : `<div class="about-img-no">${hero.emoji}</div>`}
      <div class="about-float">
        <div class="about-float-num">${d.stat1num}</div>
        <div class="about-float-txt">${d.stat1label}</div>
      </div>
    </div>
    <div class="about-content">
      <div class="section-label">About Us</div>
      <h2 class="section-title">${d.aboutTitle}</h2>
      <p class="about-text">${d.aboutText}</p>
      <div class="why-list">
        <div class="why-item">
          <div class="why-icon">🏆</div>
          <div><h4>${d.why1}</h4><p>${d.why1detail}</p></div>
        </div>
        <div class="why-item">
          <div class="why-icon">⚡</div>
          <div><h4>${d.why2}</h4><p>${d.why2detail}</p></div>
        </div>
        <div class="why-item">
          <div class="why-icon">💎</div>
          <div><h4>${d.why3}</h4><p>${d.why3detail}</p></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TESTIMONIALS -->
<div class="testimonials">
  <div class="test-inner">
    <div class="section-label">Customer Reviews</div>
    <h2 class="section-title">What ${loc} Customers Say</h2>
    <div class="test-grid">
      <div class="test-card">
        <div class="test-stars">★★★★★</div>
        <p class="test-text">"${d.testimonial1}"</p>
        <div class="test-author">
          <div class="test-avatar">${d.testimonial1name.charAt(0)}</div>
          <div>
            <div class="test-name">${d.testimonial1name}</div>
            <div class="test-location">${loc} customer</div>
          </div>
        </div>
      </div>
      <div class="test-card">
        <div class="test-stars">★★★★★</div>
        <p class="test-text">"${d.testimonial2}"</p>
        <div class="test-author">
          <div class="test-avatar">${d.testimonial2name.charAt(0)}</div>
          <div>
            <div class="test-name">${d.testimonial2name}</div>
            <div class="test-location">${loc} customer</div>
          </div>
        </div>
      </div>
    </div>
    <div style="text-align:center">
      <div class="google-badge">
        <span style="color:#4285F4;font-size:.9rem">G</span>
        <span>4.9 stars · Google Reviews · ${loc}</span>
      </div>
    </div>
  </div>
</div>

<!-- CTA -->
<div class="cta-section">
  <div class="cta-inner">
    <h2>Ready to Get Started?</h2>
    <p>Contact ${name} today. We serve ${loc} and surrounding areas with fast, reliable ${type} services you can count on.</p>
    <div class="cta-btns">
      <a href="tel:+19036367511" class="btn-white">📞 Call ${phone}</a>
    </div>
    <p class="cta-sub">${d.ctaSubtext}</p>
  </div>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-left">
    <p>© 2026 ${name} · ${type} in ${loc}<br>Serving ${city} and surrounding areas · ${phone}</p>
  </div>
  <div class="footer-right">
    <a href="https://dominionwebdesignpro.com" class="dominion-link" target="_blank">
      <span>👑 <span style="color:var(--gold)">Designed by Dominion Web Design Pro</span><small>dominionwebdesignpro.com</small></span>
    </a>
  </div>
</footer>

</body>
</html>`;
}

app.post('/claim-preview', async (req, res) => {
  const { refCode, name, phone, email, businessName } = req.body;
  if (!refCode || !name || !phone) return res.status(400).json({ error: 'Missing fields' });
  const msg = `🔥 NEW DEMO LEAD!\nBusiness: ${businessName}\nContact: ${name}\nPhone: ${phone}\nEmail: ${email || 'N/A'}\nRef: ${refCode}`;
  sendTwilioSMS(NOTIFY_PHONE, msg);
  res.json({ success: true });
});

// ── HARD MONEY BORROWER LEADS ────────────────────────────────────────────
// Deliberately separate from the agency CRM. These go straight to email (and
// a text if Twilio is configured) — nothing touches GoHighLevel.

function sendEmail(subject, text) {
  return new Promise((resolve) => {
    const key = process.env.RESEND_API_KEY;
    const to = process.env.HARDMONEY_EMAIL || process.env.ALERT_EMAIL;
    if (!key || !to) { console.log('  email skipped: RESEND_API_KEY or HARDMONEY_EMAIL not set'); return resolve(false); }
    const body = JSON.stringify({
      from: 'Dominion Hard Money <leads@dominionhardmoney.com>',
      to: [to], subject: subject, text: text
    });
    const req = https.request({
      hostname: 'api.resend.com', path: '/emails', method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json',
                 'Content-Length': Buffer.byteLength(body) }
    }, (r) => { r.resume(); resolve(r.statusCode >= 200 && r.statusCode < 300); });
    req.on('error', (e) => { console.error('  email failed:', e.message); resolve(false); });
    req.setTimeout(15000, () => { req.destroy(); resolve(false); });
    req.write(body); req.end();
  });
}

app.post('/hard-money-lead', async (req, res) => {
  const b = req.body || {};
  if (!b.name || !b.phone) return res.status(400).json({ error: 'Name and phone are required' });

  // Flag the things that kill a deal before it reaches an analyst — the
  // 5 Basic Musts and 3 Must-Nots from the broker training.
  const num = (v) => { const n = parseFloat(String(v || '').replace(/[^0-9.]/g, '')); return isNaN(n) ? 0 : n; };
  const arv = num(b.arv), rehab = num(b.rehab), price = num(b.purchase_price);
  const mao = arv ? Math.round(arv * 0.7 - rehab) : 0;   // ARV x 70% - repairs

  const flags = [];
  if (/^Yes/i.test(b.owner_occupied || '')) flags.push('OWNER-OCCUPIED — not fundable');
  if (/personal name/i.test(b.entity || '')) flags.push('No entity — needs an LLC');
  if (/Under 600|600.649/i.test(b.credit || '')) flags.push('Credit below 650');
  if (/first/i.test(b.experience || '')) flags.push('First deal — no track record');
  if (!b.cash_in || /^(none|0|no)$/i.test(b.cash_in.trim())) flags.push('No skin in the game stated');
  if (mao && price && price > mao) flags.push('Purchase price is above 70% MAO (' + mao.toLocaleString() + ')');

  const lines = [
    'NEW HARD MONEY LEAD',
    '',
    'Name:            ' + (b.name || ''),
    'Phone:           ' + (b.phone || ''),
    'Email:           ' + (b.email || ''),
    'Entity:          ' + (b.entity || 'not stated'),
    'Credit:          ' + (b.credit || 'not stated'),
    'Experience:      ' + (b.experience || 'not stated'),
    '',
    'Property:        ' + (b.property || '') + '  (' + (b.source_state || '') + ')',
    'Purchase/Refi:   ' + (b.purpose || 'not stated'),
    'Plan:            ' + (b.loan_type || ''),
    'Owner-occupied:  ' + (b.owner_occupied || 'not stated'),
    '',
    'Purchase price:  ' + (b.purchase_price || 'not stated'),
    'As-is value:     ' + (b.as_is_value || 'not stated'),
    'Rehab budget:    ' + (b.rehab || 'not stated'),
    'ARV:             ' + (b.arv || 'not stated'),
    'Loan needed:     ' + (b.loan_amount || 'not stated'),
    'Their cash in:   ' + (b.cash_in || 'not stated'),
    mao ? 'MAO (ARV x70% - rehab): $' + mao.toLocaleString() : '',
    '',
    'Exit strategy:',
    (b.exit_strategy || '').trim() || '(nothing written)',
    '',
    '---',
    flags.length ? 'WATCH OUT:\n  - ' + flags.join('\n  - ') : 'No obvious disqualifiers.',
    '',
    'Texts OK:        ' + (b.sms_consent ? 'YES — consented ' + (b.consent_timestamp || '') : 'no'),
    'Came from:       ' + (b.source_url || ''),
    'Received:        ' + new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })
  ].filter(l => l !== '');
  const text = lines.join('\n');

  console.log('Hard money lead: ' + b.name + ' — ' + (b.property || '') + ' — ' + (b.loan_amount || ''));

  const emailed = await sendEmail(
    'Hard money lead: ' + b.name + ' (' + (b.property || 'no location') + ')', text);

  if (process.env.NOTIFY_PHONE_NUMBER) {
    try {
      sendTwilioSMS(process.env.NOTIFY_PHONE_NUMBER,
        'Hard money lead: ' + b.name + ' ' + b.phone + ' — ' + (b.loan_amount || '') + ' ' + (b.property || ''));
    } catch (e) {}
  }

  res.json({ success: true, emailed: emailed });
});

app.post('/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: system || '',
      messages: messages
    });
    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const result = await new Promise((resolve, reject) => {
      const req2 = https.request(options, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('Bad response from AI service (HTTP ' + r.statusCode + '): ' + data.slice(0, 300))); }
        });
      });
      req2.on('error', reject);
      req2.setTimeout(60000, () => { req2.destroy(new Error('AI service timed out after 60s')); });
      req2.write(body);
      req2.end();
    });
    if (result.error) {
      console.error('Anthropic returned an error:', JSON.stringify(result.error));
      return res.status(502).json({
        error: 'AI service error: ' + (result.error.message || result.error.type || 'unknown')
      });
    }
    if (!result.content || !result.content[0]) {
      console.error('Anthropic returned no content:', JSON.stringify(result).slice(0, 400));
      return res.status(502).json({ error: 'AI service returned an empty response.' });
    }
    res.json({ content: result.content[0].text });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/search-businesses', async (req, res) => {
  try {
    const { query, location } = req.body;
    const searchQuery = encodeURIComponent(`${query} in ${location}`);
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    const places = await new Promise((resolve, reject) => {
      https.get(placesUrl, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });
    const businesses = (places.results || []).slice(0, 10).map(p => ({
      name: p.name,
      address: p.formatted_address,
      rating: p.rating,
      reviews: p.user_ratings_total,
      placeId: p.place_id,
      hasWebsite: false,
      phone: '',
      website: ''
    }));
    // Get details for each to check website
    for (let biz of businesses) {
      try {
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${biz.placeId}&fields=website,formatted_phone_number&key=${process.env.GOOGLE_PLACES_API_KEY}`;
        const detail = await new Promise((resolve, reject) => {
          https.get(detailUrl, (r) => {
            let data = '';
            r.on('data', chunk => data += chunk);
            r.on('end', () => resolve(JSON.parse(data)));
          }).on('error', reject);
        });
        biz.website = detail.result?.website || '';
        biz.phone = detail.result?.formatted_phone_number || '';
        biz.hasWebsite = !!biz.website;
      } catch(e) { console.warn('place detail lookup failed: ' + e.message); }
    }
    res.json({ businesses });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ── BUILD FROM TEMPLATE ───────────────────────────────────────────────────
app.post('/build-site', async (req, res) => {
  const { businessName, businessType, city, state, phone, address, email,
          rating, reviews, description, services, tagline, template,
          primaryColor, photoB64, photoType } = req.body;

  if (!businessName || !city) return res.status(400).json({ error: 'businessName and city required' });

  // If no description/services provided, generate with AI
  let desc = description;
  let svcs = services || [];
  let tag = tagline;

  if (!desc || !svcs.length) {
    try {
      const aiPrompt = `Write website copy for: ${businessName}, a ${businessType || 'local business'} in ${city}, ${state || ''}.
Return ONLY JSON (no markdown):
{"description":"2-3 sentence business description","services":["service1","service2","service3","service4","service5","service6"],"tagline":"compelling short tagline"}`;
      const aiRes = await callClaude(aiPrompt);
      const cleaned = aiRes.replace(/\`\`\`json|\`\`\`/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!desc) desc = parsed.description || '';
      if (!svcs.length) svcs = parsed.services || [];
      if (!tag) tag = parsed.tagline || '';
    } catch(e) { console.warn('ai copy failed after retries: ' + e.message); }
  }

  const data = {
    name: businessName,
    type: businessType || 'Local Business',
    city, state, phone, address, email,
    rating: rating ? parseFloat(rating) : null,
    reviews: reviews ? parseInt(reviews) : 0,
    description: desc,
    services: svcs,
    tagline: tag,
    primaryColor,
    photoB64,
    photoType: photoType || 'image/png'
  };

  let html = '';
  const tpl = (template || 'modern').toLowerCase();
  if (tpl === 'bold') html = buildBoldTemplate(data);
  else if (tpl === 'elegant') html = buildElegantTemplate(data);
  else if (tpl === 'rustic') html = buildRusticTemplate(data);
  else if (tpl === 'minimal') html = buildMinimalTemplate(data);
  else html = buildModernTemplate(data);

  res.json({ html, template: tpl });
});


// ── PREMIUM BUILD ─────────────────────────────────────────────────────────
app.post('/build-premium', async (req, res) => {
  const {
    businessName, businessType, city, state, phone, address,
    rating, reviews, description, services, tagline, hours,
    facebookUrl, instagramUrl, yelpUrl, googleUrl, linkedinUrl, websiteUrl,
    primaryColor,
    photoB64, photoType, photo2B64, photo2Type,
    photo3B64, photo3Type, photo4B64, photo4Type,
    reviewTexts, isBlackOwned, isWomanOwned, isLatinoOwned
  } = req.body;

  if (!businessName || !city) return res.status(400).json({ error: 'businessName and city required' });

  let desc = description, svcs = services || [], tag = tagline, revs = reviewTexts || [], hrs = hours || [];

  if (!desc || !svcs.length) {
    try {
      const aiPrompt = `Write premium website content for: ${businessName}, a ${businessType || 'local business'} in ${city}.
Return ONLY valid JSON: {"description":"2-3 sentences","tagline":"Short tagline. Second line.","services":["s1","s2","s3","s4","s5","s6"],"reviewTexts":["review1 ~20 words","review2","review3"],"hours":["Monday – Friday: 8:00 AM – 6:00 PM","Saturday: 9:00 AM – 4:00 PM","Sunday: Closed"]}`;
      const aiRes = await callClaude(aiPrompt);
      const parsed = JSON.parse(aiRes.replace(/\`\`\`json|\`\`\`/g,'').trim());
      if (!desc) desc = parsed.description || '';
      if (!svcs.length) svcs = parsed.services || [];
      if (!tag) tag = parsed.tagline || '';
      if (!revs.length) revs = parsed.reviewTexts || [];
      if (!hrs.length) hrs = parsed.hours || [];
    } catch(e) { console.warn('ai enrich failed: ' + e.message); }
  }

  const data = {
    name: businessName, type: businessType || 'Local Business',
    city, state, phone, address,
    rating: rating ? parseFloat(rating) : null,
    reviews: reviews ? parseInt(reviews) : 0,
    description: desc, services: svcs, tagline: tag, hours: hrs,
    facebookUrl, instagramUrl, yelpUrl, googleUrl, linkedinUrl, websiteUrl,
    primaryColor,
    photoB64, photoType: photoType || 'image/png',
    photo2B64, photo2Type: photo2Type || 'image/png',
    photo3B64, photo3Type: photo3Type || 'image/png',
    photo4B64, photo4Type: photo4Type || 'image/png',
    reviewTexts: revs,
    isBlackOwned: isBlackOwned || false,
    isWomanOwned: isWomanOwned || false,
    isLatinoOwned: isLatinoOwned || false
  };

  const html = buildPremiumSite(data);
  const demoId = saveDemo({
    business: businessName, city, type: businessType,
    phone, hasWebsite: !!websiteUrl
  }, html);

  res.json({
    html,
    demoId,
    shareUrl: demoId ? (process.env.PUBLIC_URL || 'https://dominion-demo-backend.onrender.com') + '/demo/' + demoId : null
  });
});


// ── NETLIFY DEPLOY ────────────────────────────────────────────────────────
app.post('/deploy-to-netlify', async (req, res) => {
  const { html, slug } = req.body;
  if (!html) return res.status(400).json({ error: 'No HTML provided' });

  const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN || 'nfp_ryWT4QhrzF8N2NMXeGc1igENZmTkfY4W8237';

  try {
    // Create a new site
    const siteName = (slug || 'dominion-demo') + '-' + Date.now().toString(36);
    
    const siteRes = await new Promise((resolve, reject) => {
      const body = JSON.stringify({ name: siteName });
      const options = {
        hostname: 'api.netlify.com',
        path: '/api/v1/sites',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const req = https.request(options, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({ error: data }); } });
      });
      req.on('error', reject);
      req.write(body);
      req.end();
    });

    if (!siteRes.id) return res.status(500).json({ error: 'Could not create site: ' + JSON.stringify(siteRes) });

    // Use Netlify file digest deploy (more reliable than zip)
    const crypto = require('crypto');
    const htmlBuffer = Buffer.from(html, 'utf8');
    const sha1 = crypto.createHash('sha1').update(htmlBuffer).digest('hex');

    // Step 1: Create deploy with file manifest
    const manifestBody = JSON.stringify({ files: { '/index.html': sha1 } });
    const deployRes = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.netlify.com',
        path: `/api/v1/sites/${siteRes.id}/deploys`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(manifestBody)
        }
      };
      const req = https.request(options, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({ error: data }); } });
      });
      req.on('error', reject);
      req.write(manifestBody);
      req.end();
    });

    if (!deployRes.id) throw new Error('Deploy creation failed: ' + JSON.stringify(deployRes));

    // Step 2: Upload the actual file
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.netlify.com',
        path: `/api/v1/deploys/${deployRes.id}/files/index.html`,
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${NETLIFY_TOKEN}`,
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': htmlBuffer.length
        }
      };
      const req = https.request(options, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => resolve(data));
      });
      req.on('error', reject);
      req.write(htmlBuffer);
      req.end();
    });

    const liveUrl = siteRes.ssl_url || siteRes.url || `https://${siteRes.name || siteRes.subdomain || siteRes.id}.netlify.app`;
    res.json({ success: true, url: liveUrl, siteId: siteRes.id, deployId: deployRes.id });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});


// ---------------------------------------------------------------------------
// CITY IMAGES FROM WIKIMEDIA COMMONS
//
// Why this lives here: Claude's sandbox cannot reach wikimedia.org (403 from its
// own egress proxy), but this Render service has open network. So the fetching
// happens here and the results are committed straight into the site repo.
//
// Design notes:
//  * Uses node's built-in https, NOT axios — this service has no axios and
//    adding a dependency risks the build for a one-off job.
//  * Asks Commons for a THUMBNAIL at a fixed width (iiurlwidth), so Wikimedia
//    does the resizing. No sharp/jimp needed.
//  * Reads the licence field and SKIPS anything that is not clearly free.
//    Commons hosts fair-use and restricted files too; publishing one would be
//    a real problem, not a cosmetic one.
//  * Records the author and licence for every image so the page can carry the
//    attribution that free licences require.
//  * Commits every image in ONE git tree commit = one Netlify deploy, not one
//    deploy per image.
// ---------------------------------------------------------------------------

const BAD_TITLE = new RegExp([
  'map', 'sanborn', 'plaque', 'marker', 'postcard', 'seal', 'flag', 'logo',
  'diagram', 'plan of', 'survey', 'habs', 'haer', 'blueprint', 'drawing',
  'coat of arms', 'interior', 'detail of', 'sign', 'plat', 'atlas', 'engraving'
].join('|'), 'i');

const FREE_LICENCES = [
  'cc0', 'cc-zero', 'public domain', 'pd-', 'cc-by', 'cc by',
  'cc-by-sa', 'cc by-sa', 'attribution'
];

function httpsJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'DominionCityImages/1.0 (maurice@dominionwebdesignpro.com)' } }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('bad json from ' + url)); }
      });
    }).on('error', reject);
  });
}

function httpsBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'DominionCityImages/1.0 (maurice@dominionwebdesignpro.com)' } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('status ' + res.statusCode));
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

function licenceIsFree(meta) {
  const bits = [
    (meta.LicenseShortName || {}).value,
    (meta.License || {}).value,
    (meta.UsageTerms || {}).value
  ].filter(Boolean).join(' ').toLowerCase();
  if (!bits) return false;
  if (bits.includes('fair use') || bits.includes('non-free') || bits.includes('nonfree')) return false;
  return FREE_LICENCES.some(l => bits.includes(l));
}

function stripTags(v) {
  return String(v || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Search Commons for one city and return the first FREE image with metadata.
async function findCityImage(city, state, county, forceTerm) {
  // Order matters and the first version had it BACKWARDS. Leading with the
  // county courthouse gave Anaheim the Orange County courthouse — which stands
  // in Santa Ana, twelve miles away. Ask for the city itself first; the
  // courthouse is a decent fallback only when nothing city-specific exists.
  const tries = [
    forceTerm || null,
    `${city} ${state} downtown`,
    `${city}, ${state} skyline`,
    `${city}, ${state} main street`,
    county ? `${county} Courthouse ${state}` : null,
    `${city}, ${state}`
  ].filter(Boolean);

  for (const term of tries) {
    const searchUrl = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
      + '&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=' + encodeURIComponent(term)
      + '&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1000';
    let data;
    try { data = await httpsJson(searchUrl); } catch (e) { continue; }
    const pages = ((data || {}).query || {}).pages || {};
    for (const k of Object.keys(pages)) {
      const info = (pages[k].imageinfo || [])[0];
      if (!info) continue;
      const meta = info.extmetadata || {};
      if (!licenceIsFree(meta)) continue;
      if ((info.width || 0) < 800) continue;              // too small to use
      if (!/\.(jpg|jpeg|png)$/i.test(pages[k].title)) continue;
      // Commons is full of things that are technically "images of a city" and
      // useless as one. The first run returned a Sanborn insurance MAP for
      // Baton Rouge, a bronze PLAQUE for Savannah and a black-and-white
      // architectural survey shot of an interior column for Mobile.
      if (BAD_TITLE.test(pages[k].title)) continue;
      return {
        term,
        title: pages[k].title,
        thumb: info.thumburl || info.url,
        descriptionurl: info.descriptionurl,
        author: stripTags((meta.Artist || {}).value) || 'Unknown',
        licence: stripTags((meta.LicenseShortName || {}).value) || 'see source',
        width: info.thumbwidth || info.width
      };
    }
  }
  return null;
}

// One commit, many files — same tree-API approach the blog generator uses.
async function commitImages(token, owner, repo, files, message) {
  const api = (path, method, body) => new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com', path: `/repos/${owner}/${repo}${path}`, method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'DominionCityImages/1.0',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    }, res => {
      let b = ''; res.on('data', c => b += c);
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error(method + ' ' + path + ' -> ' + res.statusCode + ' ' + b.slice(0, 200)));
        try { resolve(JSON.parse(b)); } catch (e) { resolve({}); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });

  const ref = await api('/git/ref/heads/main', 'GET');
  const headSha = ref.object.sha;
  const headCommit = await api('/git/commits/' + headSha, 'GET');
  const tree = [];
  for (const f of files) {
    const blob = await api('/git/blobs', 'POST', { content: f.contentBase64, encoding: 'base64' });
    tree.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const newTree = await api('/git/trees', 'POST', { base_tree: headCommit.tree.sha, tree });
  const commit = await api('/git/commits', 'POST', { message, tree: newTree.sha, parents: [headSha] });
  await api('/git/refs/heads/main', 'PATCH', { sha: commit.sha });
  return commit.sha;
}

app.post('/fetch-city-images', async (req, res) => {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return res.status(400).json({ error: 'GITHUB_TOKEN is not set on this service. Add it in Render > Environment.' });
    }
    const cities = req.body.cities;           // [{slug, city, state, county}]
    const owner = req.body.owner || 'dominionsoundmusic-create';
    const repo = req.body.repo || 'dominionwebdesignpro-site';
    const dryRun = !!req.body.dryRun;
    if (!Array.isArray(cities) || !cities.length) {
      return res.status(400).json({ error: 'send { cities: [{slug, city, state, county}] }' });
    }

    const found = [], missed = [], files = [], credits = {};
    for (const c of cities) {
      let hit = null;
      try { hit = await findCityImage(c.city, c.state, c.county, c.term); } catch (e) { hit = null; }
      if (!hit) { missed.push(c.slug); continue; }
      let buf = null;
      if (!dryRun) {
        try { buf = await httpsBuffer(hit.thumb); } catch (e) { missed.push(c.slug + ' (download failed)'); continue; }
        if (buf.length > 900000) { missed.push(c.slug + ' (too large)'); continue; }
        files.push({ path: `images/cities/${c.slug}.jpg`, contentBase64: buf.toString('base64') });
      }
      credits[c.slug] = { author: hit.author, licence: hit.licence, source: hit.descriptionurl, title: hit.title };
      found.push({ slug: c.slug, matchedOn: hit.term, bytes: buf ? buf.length : 0, licence: hit.licence, author: hit.author });
    }

    if (dryRun) {
      return res.json({ dryRun: true, found, missed, note: 'nothing downloaded or committed' });
    }

    files.push({
      path: 'images/cities/credits.json',
      contentBase64: Buffer.from(JSON.stringify(credits, null, 2)).toString('base64')
    });

    const sha = await commitImages(token, owner, repo, files,
      `Add ${found.length} city photos from Wikimedia Commons with attribution`);
    res.json({ committed: sha, count: found.length, found, missed });
  } catch (err) {
    console.error('fetch-city-images:', err);
    res.status(500).json({ error: String(err.message || err) });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', version: '3.0-premium' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Demo backend v3 PREMIUM running on port ${PORT}`));

// ── RESEARCH BUSINESS ─────────────────────────────────────────────────────
// Auto-pulls info from Google Places, Yelp, and AI research
// ── REAL BUSINESS ASSETS ──────────────────────────────────────────────────
// Pulls the business's own Google photos and logo so a demo looks like THEIR
// site, not a template. Photos are fetched server-side and returned as base64
// so the Places API key never appears in generated HTML.

function fetchBinary(url, maxBytes) {
  return new Promise((resolve) => {
    const req = https.get(url, (r) => {
      // Places photo endpoint 302s to the real image host
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        r.resume();
        return resolve(fetchBinary(r.headers.location, maxBytes));
      }
      if (r.statusCode !== 200) { r.resume(); return resolve(null); }
      const chunks = [];
      let total = 0;
      r.on('data', (c) => {
        total += c.length;
        if (total > maxBytes) { req.destroy(); return resolve(null); }
        chunks.push(c);
      });
      r.on('end', () => resolve({
        b64: Buffer.concat(chunks).toString('base64'),
        type: r.headers['content-type'] || 'image/jpeg'
      }));
    });
    req.on('error', () => resolve(null));
    req.setTimeout(12000, () => { req.destroy(); resolve(null); });
  });
}

async function fetchPlacePhotos(photoRefs, howMany) {
  const out = [];
  for (const ref of (photoRefs || []).slice(0, howMany)) {
    const url = 'https://maps.googleapis.com/maps/api/place/photo'
      + '?maxwidth=1200&photo_reference=' + encodeURIComponent(ref)
      + '&key=' + process.env.GOOGLE_PLACES_API_KEY;
    const img = await fetchBinary(url, 4 * 1024 * 1024);
    if (img) out.push(img);
  }
  return out;
}

// Real logo if they have a website; a clean monogram if they don't.
async function fetchLogo(websiteUrl, businessName, color) {
  let domain = '';
  try { if (websiteUrl) domain = new URL(websiteUrl).hostname.replace(/^www\./, ''); } catch (e) {}

  if (domain) {
    const img = await fetchBinary('https://www.google.com/s2/favicons?sz=256&domain=' + domain, 512 * 1024);
    // a 16px default favicon means Google had nothing real — fall through to monogram
    if (img && img.b64.length > 900) {
      return { b64: img.b64, type: img.type, source: 'website' };
    }
  }

  const initials = (businessName || '')
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('') || 'B';
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">'
    + '<rect width="128" height="128" rx="26" fill="' + (color || '#1a2332') + '"/>'
    + '<text x="64" y="64" fill="#fff" font-family="Georgia,serif" font-size="56" '
    + 'font-weight="700" text-anchor="middle" dominant-baseline="central">' + initials + '</text></svg>';
  return { b64: Buffer.from(svg).toString('base64'), type: 'image/svg+xml', source: 'monogram' };
}

async function researchBusiness(input) {
  const { businessName, city, state } = input;

  const result = {
    name: businessName,
    city,
    state: state || '',
    phone: '',
    address: '',
    website: '',
    hours: [],
    rating: null,
    reviews: 0,
    category: '',
    description: '',
    services: [],
    facebookUrl: '',
    instagramUrl: '',
    yelpUrl: '',
    googleUrl: '',
    photos: [],
    photoRefs: [],
    reviewTexts: [],
    logoB64: '',
    logoType: '',
    logoSource: '',
    isBlackOwned: false,
    isWomanOwned: false,
    isLatinoOwned: false,
  };

  // 1. Google Places lookup
  try {
    const q = encodeURIComponent(`${businessName} ${city} ${state || ''}`);
    const placesUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${q}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    const places = await new Promise((resolve, reject) => {
      https.get(placesUrl, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({}); } });
      }).on('error', () => resolve({}));
    });

    const place = (places.results || [])[0];
    if (place) {
      result.rating = place.rating || null;
      result.reviews = place.user_ratings_total || 0;
      result.address = place.formatted_address || '';
      result.category = (place.types || [])[0]?.replace(/_/g, ' ') || '';

      // Get full details
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,formatted_address,website,opening_hours,editorial_summary,url,reviews,photos,rating,user_ratings_total&key=${process.env.GOOGLE_PLACES_API_KEY}`;
      const detail = await new Promise((resolve, reject) => {
        https.get(detailUrl, (r) => {
          let data = '';
          r.on('data', chunk => data += chunk);
          r.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({}); } });
        }).on('error', () => resolve({}));
      });

      const d = detail.result || {};
      result.phone = d.formatted_phone_number || '';
      result.address = d.formatted_address || '';
      result.website = d.website || '';
      result.googleUrl = d.url || '';
      result.description = d.editorial_summary?.overview || '';
      if (d.rating) result.rating = d.rating;
      if (d.user_ratings_total) result.reviews = d.user_ratings_total;

      // real Google reviews — 4 stars and up, with actual text
      result.reviewTexts = (d.reviews || [])
        .filter(r => r.text && r.text.trim().length > 40 && (r.rating || 0) >= 4)
        .slice(0, 3)
        .map(r => ({
          author: r.author_name || 'Google reviewer',
          rating: r.rating || 5,
          text: r.text.trim().slice(0, 320),
          when: r.relative_time_description || ''
        }));

      result.photoRefs = (d.photos || []).map(p => p.photo_reference).filter(Boolean);
      if (d.opening_hours?.weekday_text) {
        result.hours = d.opening_hours.weekday_text;
      }
    }
  } catch(e) { console.warn('places lookup failed: ' + e.message); }

  // 2. AI research — find social URLs and services
  try {
    const aiPrompt = `Research this business: "${businessName}" in ${city}, ${state || ''}.

Return ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "facebookUrl": "https://facebook.com/... or empty string",
  "instagramUrl": "https://instagram.com/... or empty string",
  "yelpUrl": "https://yelp.com/biz/... or empty string",
  "services": ["service1", "service2", "service3", "service4", "service5"],
  "description": "2-3 sentence business description",
  "tagline": "short compelling tagline for their website hero",
  "isBlackOwned": false,
  "isWomanOwned": false,
  "isLatinoOwned": false
}

If you don't know specific URLs, leave them as empty strings. Base services on what this type of business typically offers.`;

    const parsed = await callClaudeJson(aiPrompt, 3, 'social-research');
    result.facebookUrl = parsed.facebookUrl || '';
    result.instagramUrl = parsed.instagramUrl || '';
    result.yelpUrl = parsed.yelpUrl || '';
    result.services = parsed.services || [];
    if (!result.description) result.description = parsed.description || '';
    result.tagline = parsed.tagline || '';
    result.isBlackOwned = parsed.isBlackOwned || false;
    result.isWomanOwned = parsed.isWomanOwned || false;
    result.isLatinoOwned = parsed.isLatinoOwned || false;
  } catch(e) {
    console.warn('social research failed after retries: ' + e.message);
    result.researchFailed = true;
  }

  // 3. Pull their actual photos and logo so the demo looks like THEIR business
  try {
    const imgs = await fetchPlacePhotos(result.photoRefs, 4);
    if (imgs[0]) { result.photoB64  = imgs[0].b64; result.photoType  = imgs[0].type; }
    if (imgs[1]) { result.photo2B64 = imgs[1].b64; result.photo2Type = imgs[1].type; }
    if (imgs[2]) { result.photo3B64 = imgs[2].b64; result.photo3Type = imgs[2].type; }
    if (imgs[3]) { result.photo4B64 = imgs[3].b64; result.photo4Type = imgs[3].type; }
    result.photoCount = imgs.length;
  } catch(e) { console.warn('photo fetch failed: ' + e.message); result.photoCount = 0; }

  try {
    const logo = await fetchLogo(result.website, result.name, input.primaryColor);
    result.logoB64 = logo.b64;
    result.logoType = logo.type;
    result.logoSource = logo.source;
  } catch(e) { console.warn('logo fetch failed: ' + e.message); }

  // photo references are internal plumbing — don't ship them to the browser
  delete result.photoRefs;

  return result;
}

app.post('/research-business', async (req, res) => {
  const { businessName, city } = req.body;
  if (!businessName || !city) return res.status(400).json({ error: 'businessName and city required' });
  try {
    res.json(await researchBusiness(req.body));
  } catch (err) {
    console.error('research-business error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── DEMO LIBRARY ──────────────────────────────────────────────────────────
// Every demo built gets saved, gets its own shareable link, and records how
// many times the prospect opened it.
//
// NOTE ON PERSISTENCE: this writes to the service's local disk. Render wipes
// that on every redeploy, so treat it as a working library, not an archive.
// Anything you want kept permanently should be deployed to Netlify (the URL
// is stored alongside the record and survives redeploys).

const fsp = require('fs');
const pathMod = require('path');
const DEMO_DIR = process.env.DEMO_DIR || pathMod.join(__dirname, 'demo-data');
const DEMO_INDEX = pathMod.join(DEMO_DIR, 'index.json');

function ensureDemoDir() {
  try { fsp.mkdirSync(DEMO_DIR, { recursive: true }); } catch (e) {}
}

function loadDemoIndex() {
  ensureDemoDir();
  try { return JSON.parse(fsp.readFileSync(DEMO_INDEX, 'utf8')); }
  catch (e) { return []; }
}

function saveDemoIndex(list) {
  ensureDemoDir();
  try { fsp.writeFileSync(DEMO_INDEX, JSON.stringify(list, null, 2)); }
  catch (e) { console.error('demo index write failed:', e.message); }
}

function newDemoId() {
  return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

function saveDemo(meta, html) {
  ensureDemoDir();
  const id = newDemoId();
  try {
    fsp.writeFileSync(pathMod.join(DEMO_DIR, id + '.html'), html);
  } catch (e) {
    console.error('demo html write failed:', e.message);
    return null;
  }
  const list = loadDemoIndex();
  list.unshift({
    id,
    business: meta.business || 'Untitled',
    city: meta.city || '',
    type: meta.type || '',
    phone: meta.phone || '',
    hasWebsite: !!meta.hasWebsite,
    createdAt: new Date().toISOString(),
    views: 0,
    lastViewed: null,
    netlifyUrl: '',
    status: 'new'
  });
  saveDemoIndex(list.slice(0, 500));
  return id;
}

// The prospect's own view of the demo — this is what gets counted.
app.get('/demo/:id', (req, res) => {
  const id = (req.params.id || '').replace(/[^a-z0-9]/gi, '');
  const file = pathMod.join(DEMO_DIR, id + '.html');
  if (!id || !fsp.existsSync(file)) {
    return res.status(404).send('<h1 style="font-family:system-ui;padding:60px">Demo not found</h1>' +
      '<p style="font-family:system-ui;padding:0 60px;color:#666">This preview may have expired. Call 903-636-7511.</p>');
  }
  // don't count your own previews
  if (req.query.preview !== '1') {
    const list = loadDemoIndex();
    const rec = list.find(d => d.id === id);
    if (rec) {
      rec.views = (rec.views || 0) + 1;
      rec.lastViewed = new Date().toISOString();
      if (rec.status === 'new') rec.status = 'viewed';
      saveDemoIndex(list);
      console.log('Demo viewed: ' + rec.business + ' (' + rec.views + ' total)');
    }
  }
  res.type('html').send(fsp.readFileSync(file, 'utf8'));
});

// The library — everything built, newest first, with view counts.
app.get('/demos', (req, res) => {
  res.json({ demos: loadDemoIndex() });
});

// Update a record: mark the Netlify URL, or set a status like "sent" / "won".
app.post('/demos/:id', (req, res) => {
  const id = (req.params.id || '').replace(/[^a-z0-9]/gi, '');
  const list = loadDemoIndex();
  const rec = list.find(d => d.id === id);
  if (!rec) return res.status(404).json({ error: 'Not found' });
  if (typeof req.body.netlifyUrl === 'string') rec.netlifyUrl = req.body.netlifyUrl;
  if (typeof req.body.status === 'string') rec.status = req.body.status;
  if (typeof req.body.note === 'string') rec.note = req.body.note;
  saveDemoIndex(list);
  res.json(rec);
});

app.delete('/demos/:id', (req, res) => {
  const id = (req.params.id || '').replace(/[^a-z0-9]/gi, '');
  const list = loadDemoIndex().filter(d => d.id !== id);
  saveDemoIndex(list);
  try { fsp.unlinkSync(pathMod.join(DEMO_DIR, id + '.html')); } catch (e) {}
  res.json({ deleted: true });
});

// ── LOOK UP A BUSINESS FROM A URL ─────────────────────────────────────────
// Paste a Facebook page, a website, or a Google Maps link and get the full
// research back — including whether they already have a website.

function fetchPageTitle(url) {
  return new Promise((resolve) => {
    const lib = url.startsWith('http://') ? require('http') : https;
    const req = lib.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DominionBot/1.0)' } }, (r) => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        r.resume();
        return resolve(fetchPageTitle(new URL(r.headers.location, url).href));
      }
      let data = '';
      r.on('data', (c) => {
        data += c;
        if (data.length > 60000) { req.destroy(); }
      });
      r.on('end', () => {
        const m = data.match(/<title[^>]*>([^<]{2,140})<\/title>/i);
        resolve(m ? m[1].trim() : '');
      });
    });
    req.on('error', () => resolve(''));
    req.setTimeout(8000, () => { req.destroy(); resolve(''); });
  });
}

function nameFromUrl(rawUrl) {
  let u;
  try { u = new URL(rawUrl.startsWith('http') ? rawUrl : 'https://' + rawUrl); }
  catch (e) { return { hint: '', kind: 'invalid' }; }

  const host = u.hostname.replace(/^www\./, '').toLowerCase();
  const parts = u.pathname.split('/').filter(Boolean);
  const deslug = (t) => decodeURIComponent(t || '')
    .replace(/[-_+]+/g, ' ')
    .replace(/\b\d{6,}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (host.includes('facebook.com')) {
    let seg = parts[0] || '';
    if (seg === 'p' || seg === 'pages') seg = parts[1] || '';
    if (seg === 'profile.php') return { hint: '', kind: 'facebook' };
    return { hint: deslug(seg), kind: 'facebook' };
  }
  if (host.includes('instagram.com')) {
    return { hint: deslug(parts[0] || ''), kind: 'instagram' };
  }
  if (host.includes('google.') && u.pathname.includes('/place/')) {
    const i = parts.indexOf('place');
    return { hint: deslug(parts[i + 1] || ''), kind: 'maps' };
  }
  if (host.includes('yelp.com')) {
    const i = parts.indexOf('biz');
    return { hint: deslug(parts[i + 1] || ''), kind: 'yelp' };
  }
  // plain website — the domain itself is usually the business name
  const bare = host.replace(/\.(com|net|org|biz|co|us|info|services|pro)$/i, '');
  return { hint: deslug(bare.split('.').pop()), kind: 'website' };
}

app.post('/lookup-url', async (req, res) => {
  const { url, city, state } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });

  try {
    const { hint, kind } = nameFromUrl(url);
    if (kind === 'invalid') return res.status(400).json({ error: 'That does not look like a valid URL.' });

    let name = hint;

    // For a real website the <title> is usually the cleanest business name
    if (kind === 'website') {
      const title = await fetchPageTitle(url.startsWith('http') ? url : 'https://' + url);
      if (title) {
        const cleaned = title.split(/[|\u2013\u2014\-\u00b7]/)[0].trim();
        if (cleaned.length >= 3 && cleaned.length <= 70) name = cleaned;
      }
    }

    if (!name) {
      return res.status(422).json({
        error: 'Could not work out the business name from that link. Type the name and city instead.',
        kind
      });
    }

    if (!city) {
      return res.json({ needsCity: true, guessedName: name, kind,
        message: 'Found "' + name + '". Which city are they in?' });
    }

    const result = await researchBusiness({ businessName: name, city, state, primaryColor: req.body.primaryColor });
    result.sourceUrl = url;
    result.sourceKind = kind;
    result.hasWebsite = !!result.website;

    // if the link they pasted IS the website, that answers the question directly
    if (kind === 'website' && !result.website) {
      result.website = url;
      result.hasWebsite = true;
    }

    res.json(result);
  } catch (err) {
    console.error('lookup-url error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ── PUSH TO GHL ───────────────────────────────────────────────────────────
app.post('/push-to-ghl', async (req, res) => {
  const { businessName, phone, email, address, city, state, demoUrl, tags } = req.body;
  if (!businessName) return res.status(400).json({ error: 'businessName required' });

  const GHL_KEY = process.env.GHL_API_KEY;
  const GHL_LOC = process.env.GHL_LOCATION_ID;

  if (!GHL_KEY || !GHL_LOC) return res.status(500).json({ error: 'GHL not configured' });

  try {
    // Create/update contact
    const contactPayload = {
      firstName: businessName.split(' ')[0],
      lastName: businessName.split(' ').slice(1).join(' ') || 'Business',
      name: businessName,
      phone: phone || '',
      email: email || '',
      address1: address || '',
      city: city || '',
      state: state || '',
      locationId: GHL_LOC,
      customField: demoUrl ? [{ id: 'demo_site_url', field_value: demoUrl }] : [],
      tags: tags || ['prospected-manual'],
      source: 'Dominion Prospector'
    };

    const createRes = await new Promise((resolve, reject) => {
      const body = JSON.stringify(contactPayload);
      const options = {
        hostname: 'rest.gohighlevel.com',
        path: '/v1/contacts/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GHL_KEY}`,
          'Content-Length': Buffer.byteLength(body)
        }
      };
      const request = https.request(options, (r) => {
        let data = '';
        r.on('data', chunk => data += chunk);
        r.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({ raw: data }); } });
      });
      request.on('error', reject);
      request.write(body);
      request.end();
    });

    res.json({ success: true, contact: createRes.contact || createRes, message: 'Contact added to GHL — Victoria will call shortly!' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── WRITE OUTREACH MESSAGE ────────────────────────────────────────────────
app.post('/write-outreach', async (req, res) => {
  const { businessName, city, businessType, platform, demoUrl, rating, reviews } = req.body;
  if (!businessName) return res.status(400).json({ error: 'businessName required' });

  try {
    const prompt = `Write a short, friendly, personalized outreach message for a ${platform || 'Facebook'} DM to ${businessName} in ${city}.

Context:
- They have no website
- We built them a free demo site: ${demoUrl || 'https://dominionwebdesignpro.com'}
- They are a ${businessType || 'local business'}
${rating ? `- They have ${reviews} reviews and a ${rating} star rating` : ''}

Requirements:
- Max 3 sentences
- Casual and friendly, not salesy
- Mention the free demo site
- End with a soft call to action
- Don't use emojis excessively
- Sound like a real person, not a robot

Return ONLY the message text, nothing else.`;

    const message = await callClaude(prompt);
    res.json({ message: message.trim() });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── SCORE LEAD ────────────────────────────────────────────────────────────
app.post('/score-lead', async (req, res) => {
  const { businessName, hasWebsite, rating, reviews, hasFacebook, hasInstagram, category } = req.body;

  let score = 0;
  const reasons = [];

  if (!hasWebsite) { score += 40; reasons.push('No website — prime target'); }
  if (reviews > 50) { score += 20; reasons.push(`${reviews} reviews — established business`); }
  else if (reviews > 20) { score += 10; reasons.push(`${reviews} reviews — active business`); }
  if (rating >= 4.5) { score += 15; reasons.push(`${rating}★ rating — reputation to protect`); }
  else if (rating >= 4.0) { score += 8; reasons.push(`${rating}★ rating — good reputation`); }
  if (hasFacebook) { score += 10; reasons.push('Active on Facebook — reachable'); }
  if (hasInstagram) { score += 5; reasons.push('Active on Instagram'); }

  const hotCategories = ['veterinarian', 'dentist', 'salon', 'barbershop', 'restaurant', 'chiropractor', 'attorney'];
  if (hotCategories.some(c => (category || '').toLowerCase().includes(c))) {
    score += 10; reasons.push('High-value industry');
  }

  const tier = score >= 70 ? '🔥 Hot' : score >= 45 ? '⚡ Warm' : '❄️ Cold';

  res.json({ score, tier, reasons });
});
