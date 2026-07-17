const express = require('express');
const cors = require('cors');
const https = require('https');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

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
  salon: { emoji: '✂️', c1: '#1A0010', c2: '#880E4F', accent: '#F8BBD0', tagline: 'Look Great. Feel Amazing.', query: 'hair salon luxury beauty glamour modern interior' },
  hair: { emoji: '✂️', c1: '#1A0010', c2: '#880E4F', accent: '#F8BBD0', tagline: 'Look Great. Feel Amazing.', query: 'hair salon luxury beauty glamour modern interior' },
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

function getHero(businessName, businessType) {
  const text = (businessName + ' ' + businessType).toLowerCase();
  for (const [key, val] of Object.entries(industryHeroes)) {
    if (key !== 'default' && text.includes(key)) return val;
  }
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
        try { resolve(JSON.parse(data).content[0].text); }
        catch { reject(new Error('Claude parse error')); }
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

  const { businessName, businessType, city, state, customRequest } = req.body;
  if (!businessName || !businessType || !city) return res.status(400).json({ error: 'Missing required fields' });

  const refCode = genRefCode();
  const hero = getHero(businessName, businessType);

  try {
    const [copy, heroImg, aboutImg, serviceImg] = await Promise.all([
      callClaude(`You are writing premium website copy for a local business. Be specific, compelling, and professional — NOT generic.

Business: "${businessName}"
Type: "${businessType}"  
Location: "${city}${state ? ', ' + state : ''}"
${customRequest ? 'Special request: ' + customRequest : ''}

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "headline": "powerful 5-7 word headline that speaks to their specific customers pain points",
  "subheadline": "compelling 18-22 word subheadline with a specific benefit and location mention",
  "badge1": "short trust badge like '20+ Years Experience' or 'Licensed & Insured'",
  "badge2": "short trust badge like 'Same-Day Service' or '5-Star Rated'",
  "badge3": "short trust badge like 'Free Estimates' or '100% Satisfaction'",
  "service1": "specific service name",
  "service1desc": "2 compelling sentences about this service with a benefit",
  "service1icon": "single relevant emoji",
  "service2": "specific service name",
  "service2desc": "2 compelling sentences about this service with a benefit",
  "service2icon": "single relevant emoji",
  "service3": "specific service name",
  "service3desc": "2 compelling sentences about this service with a benefit",
  "service3icon": "single relevant emoji",
  "stat1num": "impressive stat number like '500+' or '15'",
  "stat1label": "what that stat means like 'Happy Customers' or 'Years Experience'",
  "stat2num": "another stat like '24/7' or '4.9★'",
  "stat2label": "what it means like 'Emergency Service' or 'Google Rating'",
  "stat3num": "another stat",
  "stat3label": "what it means",
  "aboutTitle": "4-5 word about section headline",
  "aboutText": "3-4 sentences about the business, their commitment to the city, what makes them different. Sound local and real.",
  "whyTitle": "compelling reason to choose them headline 4-5 words",
  "why1": "first key differentiator short phrase",
  "why1detail": "one sentence elaboration",
  "why2": "second key differentiator",
  "why2detail": "one sentence elaboration",
  "why3": "third key differentiator",
  "why3detail": "one sentence elaboration",
  "testimonial1": "realistic 2-3 sentence 5-star review from a happy customer",
  "testimonial1name": "realistic first name last initial",
  "testimonial2": "different realistic 2-3 sentence 5-star review",
  "testimonial2name": "different realistic first name last initial",
  "cta": "action-oriented 3-5 word CTA button text",
  "ctaSubtext": "urgency line under CTA like 'Free consultation — no commitment required'"
}`),
      fetchUnsplash(hero.query),
      fetchUnsplash(businessType + ' professional team staff'),
      fetchUnsplash(businessType + ' work service quality result')
    ]);

    let d;
    try { d = JSON.parse(copy); }
    catch {
      d = {
        headline: `${businessType} Services in ${city}`, subheadline: `Professional ${businessType} services in ${city}. Trusted by hundreds of local customers.`,
        badge1: 'Licensed & Insured', badge2: 'Free Estimates', badge3: '5-Star Rated',
        service1: 'Professional Service', service1desc: 'Expert service delivered with care and precision.', service1icon: hero.emoji,
        service2: 'Quality Workmanship', service2desc: 'Every job done right the first time, guaranteed.', service2icon: '⭐',
        service3: 'Customer First', service3desc: 'Your satisfaction is our top priority on every project.', service3icon: '✅',
        stat1num: '500+', stat1label: 'Happy Customers', stat2num: '10+', stat2label: 'Years Experience', stat3num: '5★', stat3label: 'Google Rating',
        aboutTitle: `About ${businessName}`, aboutText: `${businessName} has proudly served ${city} and surrounding communities. We bring expertise, dedication, and a commitment to excellence to every project.`,
        whyTitle: 'Why Choose Us', why1: 'Expert Team', why1detail: 'Our trained professionals deliver exceptional results every time.',
        why2: 'Fast & Reliable', why2detail: 'We show up on time and get the job done right.',
        why3: 'Fair Pricing', why3detail: 'Transparent quotes with no hidden fees or surprises.',
        testimonial1: `${businessName} did an outstanding job. Professional, on time, and the results exceeded my expectations. Highly recommend!`, testimonial1name: 'Sarah M.',
        testimonial2: `Best ${businessType} in ${city}. Called in the morning and they had everything handled same day. Will use again!`, testimonial2name: 'David R.',
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

function buildHTML(name, type, city, state, d, hero, heroImg, aboutImg, serviceImg, refCode) {
  const loc = `${city}${state ? ', ' + state : ''}`;
  const fullUrl = `https://dominionwebdesignpro.com/demo-generator.html?ref=${refCode}`;
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
body{font-family:'Inter',Arial,sans-serif;background:var(--white);color:var(--text);-webkit-font-smoothing:antialiased}

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
.view-full-btn{
  background:linear-gradient(135deg,var(--gold2),var(--gold));
  color:#0A0F1E;padding:8px 18px;border-radius:10px;
  font-weight:800;font-size:.78rem;text-decoration:none;
  display:flex;align-items:center;gap:6px;
  box-shadow:0 2px 12px rgba(201,168,76,0.4);
  transition:transform 0.2s,box-shadow 0.2s;
  white-space:nowrap;
}
.view-full-btn:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(201,168,76,0.5)}

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
  min-height:620px;
  display:flex;align-items:center;
  background:linear-gradient(135deg,var(--c1) 0%,var(--c2) 60%,rgba(0,0,0,0.8) 100%);
  overflow:hidden;
  padding-top:0;
}
.hero-bg{
  position:absolute;inset:0;
  ${heroImg ? `background-image:url('${heroImg}');background-size:cover;background-position:center;` : ''}
  opacity:0.18;
}
.hero-overlay{
  position:absolute;inset:0;
  background:linear-gradient(135deg,${hero.c1}F5 0%,${hero.c1}CC 40%,transparent 100%);
}
.hero-grid{
  position:relative;z-index:2;
  max-width:1200px;margin:0 auto;width:100%;
  padding:80px 48px;
  display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;
}
@media(max-width:900px){.hero-grid{grid-template-columns:1fr;padding:60px 24px;gap:32px}}
.hero-left{}
.hero-eyebrow{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:var(--accent);font-size:.72rem;font-weight:700;padding:6px 14px;border-radius:20px;margin-bottom:20px;letter-spacing:1px;text-transform:uppercase}
.hero h1{font-size:clamp(2rem,4.5vw,3.2rem);font-weight:900;color:var(--white);line-height:1.08;margin-bottom:18px;letter-spacing:-0.02em}
.hero h1 em{font-style:normal;color:var(--accent)}
.hero-sub{color:rgba(255,255,255,0.72);font-size:1.05rem;line-height:1.75;margin-bottom:28px;max-width:520px}
.hero-badges{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:32px}
.hero-badge{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.85);font-size:.75rem;font-weight:600;padding:6px 12px;border-radius:8px}
.hero-badge::before{content:'✓';color:var(--accent);font-weight:900}
.hero-btns{display:flex;flex-wrap:wrap;gap:12px}
.btn-primary{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#0A0F1E;padding:14px 28px;border-radius:12px;font-weight:800;font-size:.9rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 20px rgba(201,168,76,0.35);transition:transform 0.2s}
.btn-primary:hover{transform:translateY(-2px)}
.btn-secondary{background:rgba(255,255,255,0.08);border:1.5px solid rgba(255,255,255,0.2);color:var(--white);padding:14px 28px;border-radius:12px;font-weight:700;font-size:.9rem;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
.hero-right{display:flex;flex-direction:column;gap:12px}
@media(max-width:900px){.hero-right{display:none}}
.hero-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:var(--radius);padding:20px 22px;backdrop-filter:blur(10px)}
.hero-card-icon{font-size:1.5rem;margin-bottom:8px}
.hero-card h3{font-size:.88rem;font-weight:700;color:var(--white);margin-bottom:4px}
.hero-card p{font-size:.78rem;color:rgba(255,255,255,0.55);line-height:1.6}

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
.about{background:linear-gradient(135deg,var(--c1),var(--c2));padding:88px 48px;overflow:hidden;position:relative}
@media(max-width:768px){.about{padding:64px 24px}}
.about::before{content:'';position:absolute;top:-100px;right:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(255,255,255,0.05) 0%,transparent 70%);border-radius:50%}
.about-inner{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;position:relative;z-index:1}
@media(max-width:900px){.about-inner{grid-template-columns:1fr;gap:40px}}
.about-img-wrap{position:relative}
.about-img{border-radius:var(--radius-lg);overflow:hidden;height:420px;box-shadow:0 24px 64px rgba(0,0,0,0.4)}
.about-img img{width:100%;height:100%;object-fit:cover}
.about-img-no{background:rgba(255,255,255,0.07);border-radius:var(--radius-lg);height:420px;display:flex;align-items:center;justify-content:center;font-size:5rem;border:1px solid rgba(255,255,255,0.1)}
.about-float{position:absolute;bottom:-16px;right:-16px;background:linear-gradient(135deg,var(--gold2),var(--gold));border-radius:var(--radius);padding:16px 20px;box-shadow:0 8px 32px rgba(201,168,76,0.4)}
.about-float-num{font-size:1.8rem;font-weight:900;color:#0A0F1E;line-height:1}
.about-float-txt{font-size:.7rem;font-weight:700;color:#0A0F1E;opacity:0.7}
.about-content .section-label{color:var(--accent)}
.about-content .section-title{color:var(--white)}
.about-text{color:rgba(255,255,255,0.75);font-size:.92rem;line-height:1.85;margin-bottom:28px}
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

<!-- PREVIEW BAR -->
<div class="preview-bar">
  <div class="preview-bar-left">
    <span class="preview-badge">Free Preview</span>
    <span>Your new website for <strong>${name}</strong> in ${loc}</span>
  </div>
  <div class="preview-bar-right">
    <span class="ref-code">Ref: ${refCode}</span>
    <a href="${fullUrl}" class="view-full-btn" target="_blank">
      👁 View Full Website →
    </a>
  </div>
</div>

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
        <p>${d.service1desc.substring(0,80)}...</p>
      </div>
      <div class="hero-card">
        <div class="hero-card-icon">${d.service2icon || '⭐'}</div>
        <h3>${d.service2}</h3>
        <p>${d.service2desc.substring(0,80)}...</p>
      </div>
      <div class="hero-card">
        <div class="hero-card-icon">${d.service3icon || '✅'}</div>
        <h3>${d.service3}</h3>
        <p>${d.service3desc.substring(0,80)}...</p>
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
      <a href="${fullUrl}" class="btn-gold" target="_blank">👁 View Full Website →</a>
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

app.get('/health', (req, res) => res.json({ status: 'ok', version: '3.0-premium' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Demo backend v3 PREMIUM running on port ${PORT}`));
