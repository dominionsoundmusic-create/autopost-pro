require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const app = express();
app.use(express.json());
app.use(express.static('public'));

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE || '+19033005683';

// Industries to target for web design leads
const TARGET_INDUSTRIES = [
  'restaurant', 'hair salon', 'auto repair', 'plumber', 'electrician',
  'landscaping', 'cleaning service', 'dentist', 'chiropractor', 'gym',
  'photographer', 'florist', 'bakery', 'roofing contractor', 'painter',
  'pest control', 'dog groomer', 'nail salon', 'massage therapy', 'church',
  'attorney', 'insurance agent', 'real estate agent', 'moving company',
  'hvac contractor', 'pool service', 'car wash', 'daycare', 'funeral home'
];

// Rural and small-town cities nationwide (sample - full list)
const TARGET_CITIES = [
  'Nacogdoches TX', 'Lufkin TX', 'Palestine TX', 'Corsicana TX', 'Stephenville TX',
  'Brownwood TX', 'San Angelo TX', 'Abilene TX', 'Sweetwater TX', 'Big Spring TX',
  'Alpine TX', 'Kerrville TX', 'Fredericksburg TX', 'Llano TX', 'Brady TX',
  'Flagstaff AZ', 'Prescott AZ', 'Show Low AZ', 'Payson AZ', 'Sedona AZ',
  'Durango CO', 'Montrose CO', 'Gunnison CO', 'Alamosa CO', 'Salida CO',
  'Missoula MT', 'Bozeman MT', 'Kalispell MT', 'Havre MT', 'Miles City MT',
  'Casper WY', 'Gillette WY', 'Sheridan WY', 'Cody WY', 'Lander WY',
  'Twin Falls ID', 'Pocatello ID', 'Idaho Falls ID', 'Coeur d Alene ID',
  'Medford OR', 'Grants Pass OR', 'Klamath Falls OR', 'Bend OR', 'Roseburg OR',
  'Elko NV', 'Ely NV', 'Winnemucca NV', 'Pahrump NV', 'Fallon NV',
  'Roswell NM', 'Carlsbad NM', 'Alamogordo NM', 'Silver City NM', 'Taos NM',
  'Rapid City SD', 'Aberdeen SD', 'Mitchell SD', 'Huron SD', 'Pierre SD',
  'Bismarck ND', 'Minot ND', 'Dickinson ND', 'Williston ND', 'Jamestown ND',
  'North Platte NE', 'Scottsbluff NE', 'Alliance NE', 'Kearney NE', 'Norfolk NE',
  'Dodge City KS', 'Liberal KS', 'Garden City KS', 'Pittsburg KS', 'Emporia KS',
  'Joplin MO', 'Poplar Bluff MO', 'Cape Girardeau MO', 'Rolla MO', 'Branson MO',
  'Jonesboro AR', 'Harrison AR', 'Mountain Home AR', 'Russellville AR', 'Mena AR',
  'Paducah KY', 'Hopkinsville KY', 'Hazard KY', 'Pikeville KY', 'Corbin KY',
  'Cookeville TN', 'Morristown TN', 'Crossville TN', 'Sparta TN', 'Oneida TN',
  'Hattiesburg MS', 'Meridian MS', 'Tupelo MS', 'Natchez MS', 'Vicksburg MS',
  'Monroe LA', 'Alexandria LA', 'Natchitoches LA', 'Ruston LA', 'Leesville LA',
  'Dothan AL', 'Gadsden AL', 'Anniston AL', 'Talladega AL', 'Selma AL',
  'Valdosta GA', 'Waycross GA', 'Douglas GA', 'Tifton GA', 'Blue Ridge GA',
  'Gainesville FL', 'Ocala FL', 'Sebring FL', 'Okeechobee FL', 'Palatka FL',
  'Greenville SC', 'Anderson SC', 'Spartanburg SC', 'Florence SC', 'Aiken SC',
  'Asheville NC', 'Boone NC', 'Hickory NC', 'Morganton NC', 'Brevard NC',
  'Roanoke VA', 'Lynchburg VA', 'Danville VA', 'Martinsville VA', 'Bristol VA',
  'Beckley WV', 'Martinsburg WV', 'Parkersburg WV', 'Elkins WV', 'Logan WV',
  'Johnstown PA', 'DuBois PA', 'Oil City PA', 'Meadville PA', 'Punxsutawney PA',
  'Plattsburgh NY', 'Watertown NY', 'Oneonta NY', 'Olean NY', 'Glens Falls NY',
  'Bangor ME', 'Augusta ME', 'Waterville ME', 'Presque Isle ME', 'Caribou ME',
  'Burlington VT', 'Rutland VT', 'St Johnsbury VT', 'Newport VT', 'Morrisville VT',
  'Marquette MI', 'Escanaba MI', 'Sault Sainte Marie MI', 'Cadillac MI', 'Alpena MI',
  'Duluth MN', 'Bemidji MN', 'International Falls MN', 'Hibbing MN', 'Brainerd MN',
  'Wausau WI', 'Rhinelander WI', 'Ashland WI', 'Superior WI', 'Eau Claire WI',
  'Marquette IA', 'Dubuque IA', 'Ottumwa IA', 'Mason City IA', 'Fort Dodge IA',
  'Traverse City MI', 'Petoskey MI', 'Gaylord MI', 'Cheboygan MI', 'Rogers City MI'
];

// ── GHL HELPERS ──────────────────────────────────────────────────────────────

async function createGHLContact(business, tag) {
  try {
    const payload = {
      firstName: business.name,
      companyName: business.name,
      phone: business.phone || '',
      address1: business.address || '',
      city: business.city || '',
      tags: [tag, 'prospected', business.hasWebsite ? 'weak-website' : 'no-website'],
      source: 'Dominion Prospector',
      customField: {
        industry: business.industry || '',
        google_rating: business.rating || '',
        website_status: business.hasWebsite ? 'Has Website' : 'No Website',
        prospected_by: tag === 'prospected-auto' ? 'Sarah' : 'Maurice'
      }
    };
    const res = await axios.post(
      'https://services.leadconnectorhq.com/contacts/',
      payload,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json'
        }
      }
    );
    return res.data.contact;
  } catch (err) {
    console.error('GHL contact error:', err.response?.data || err.message);
    return null;
  }
}

async function checkContactExists(phone) {
  try {
    const res = await axios.get(
      `https://services.leadconnectorhq.com/contacts/search/duplicate?number=${encodeURIComponent(phone)}`,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: '2021-07-28'
        }
      }
    );
    return res.data?.contact || null;
  } catch {
    return null;
  }
}

// ── GOOGLE PLACES SEARCH ──────────────────────────────────────────────────────

async function searchBusinesses(industry, city) {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') {
    // Fallback: use Overpass/OSM for free searching
    return await searchOSM(industry, city);
  }
  try {
    const query = `${industry} in ${city}`;
    const res = await axios.get('https://maps.googleapis.com/maps/api/place/textsearch/json', {
      params: { query, key: GOOGLE_API_KEY }
    });
    return (res.data.results || []).map(p => ({
      name: p.name,
      address: p.formatted_address,
      city: city,
      phone: '',
      rating: p.rating || '',
      hasWebsite: false, // will check details
      placeId: p.place_id,
      industry: industry
    }));
  } catch (err) {
    console.error('Google Places error:', err.message);
    return [];
  }
}

async function getPlaceDetails(placeId) {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'YOUR_GOOGLE_PLACES_API_KEY') return {};
  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
      params: {
        place_id: placeId,
        fields: 'name,formatted_phone_number,website',
        key: GOOGLE_API_KEY
      }
    });
    const r = res.data.result || {};
    return {
      phone: r.formatted_phone_number || '',
      hasWebsite: !!r.website,
      website: r.website || ''
    };
  } catch {
    return {};
  }
}

async function searchOSM(industry, city) {
  // Free fallback using Nominatim + Overpass
  try {
    const nominatim = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: city, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'DominionProspector/1.0' }
    });
    if (!nominatim.data.length) return [];
    const { lat, lon } = nominatim.data[0];
    const radius = 10000;
    const osmType = industry.replace(/ /g, '_');
    const query = `[out:json][timeout:25];(node["name"]["amenity"](around:${radius},${lat},${lon});node["name"]["shop"](around:${radius},${lat},${lon}););out body;`;
    const overpass = await axios.post('https://overpass-api.de/api/interpreter', query, {
      headers: { 'Content-Type': 'text/plain' }
    });
    return (overpass.data.elements || []).slice(0, 10).map(e => ({
      name: e.tags.name,
      address: e.tags['addr:street'] || '',
      city: city,
      phone: e.tags.phone || e.tags['contact:phone'] || '',
      rating: '',
      hasWebsite: !!e.tags.website,
      website: e.tags.website || '',
      industry: industry
    })).filter(b => b.name);
  } catch (err) {
    console.error('OSM error:', err.message);
    return [];
  }
}

// ── TWILIO SMS ────────────────────────────────────────────────────────────────

async function sendOutreachSMS(phone, businessName, city) {
  if (!TWILIO_SID || TWILIO_SID === 'YOUR_TWILIO_SID') {
    console.log(`[SMS PENDING A2P] Would text ${phone}: outreach for ${businessName}`);
    return { pending: true };
  }
  try {
    const message = `Hi! This is Sarah with Dominion Web Design Pro. I noticed ${businessName} in ${city} may not have a website — or could use an upgrade. We build professional sites starting at $497, done for you in 7 days. Interested? Reply YES for details or STOP to opt out.`;
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64');
    const res = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      new URLSearchParams({ From: TWILIO_PHONE, To: phone, Body: message }),
      { headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return res.data;
  } catch (err) {
    console.error('Twilio error:', err.response?.data || err.message);
    return null;
  }
}

// ── PROSPECT ENGINE ───────────────────────────────────────────────────────────

async function prospectCity(city, industry, mode = 'auto') {
  console.log(`\n🔍 Prospecting: ${industry} in ${city}`);
  const businesses = await searchBusinesses(industry, city);
  const results = [];

  for (const biz of businesses.slice(0, 5)) {
    // Get details if Google Places
    if (biz.placeId) {
      const details = await getPlaceDetails(biz.placeId);
      biz.phone = details.phone || '';
      biz.hasWebsite = details.hasWebsite || false;
      biz.website = details.website || '';
    }

    // Skip if they have a good website (has website and it's not a social media link)
    const hasSocialOnly = biz.website && (biz.website.includes('facebook.com') || biz.website.includes('yelp.com'));
    const isGoodProspect = !biz.hasWebsite || hasSocialOnly;

    if (!isGoodProspect) {
      console.log(`  ⏭ Skip ${biz.name} — has website`);
      continue;
    }

    // Check if already in GHL
    if (biz.phone) {
      const existing = await checkContactExists(biz.phone);
      if (existing) {
        console.log(`  ⏭ Skip ${biz.name} — already in GHL`);
        continue;
      }
    }

    // Add to GHL
    const tag = mode === 'auto' ? 'prospected-auto' : 'prospected-manual';
    const contact = await createGHLContact(biz, tag);
    console.log(`  ✅ Added to GHL: ${biz.name} (${biz.hasWebsite ? 'weak site' : 'no website'})`);

    // Send SMS if auto mode and A2P approved
    let smsSent = false;
    if (mode === 'auto' && biz.phone) {
      const sms = await sendOutreachSMS(biz.phone, biz.name, city);
      smsSent = !!sms;
    }

    results.push({
      name: biz.name,
      phone: biz.phone,
      address: biz.address,
      city: city,
      industry: industry,
      hasWebsite: biz.hasWebsite,
      hasSocialOnly: hasSocialOnly,
      addedToGHL: !!contact,
      smsSent: smsSent,
      ghlContactId: contact?.id || ''
    });

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

// ── ROUTES ────────────────────────────────────────────────────────────────────

// Dashboard
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Manual prospect — you pick city and industry
app.post('/prospect/manual', async (req, res) => {
  const { city, industry } = req.body;
  if (!city || !industry) return res.status(400).json({ error: 'city and industry required' });
  try {
    const results = await prospectCity(city, industry, 'manual');
    res.json({ success: true, found: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manual outreach — you send the first SMS yourself
app.post('/prospect/outreach', async (req, res) => {
  const { phone, businessName, city } = req.body;
  if (!phone || !businessName) return res.status(400).json({ error: 'phone and businessName required' });
  try {
    const sms = await sendOutreachSMS(phone, businessName, city || '');
    res.json({ success: true, sms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auto run — trigger manually or via cron
app.post('/prospect/auto', async (req, res) => {
  res.json({ success: true, message: 'Auto prospecting started in background' });
  // Run async
  runAutoProspect();
});

// Status check
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    ghl: !!GHL_API_KEY,
    google: !!GOOGLE_API_KEY && GOOGLE_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY',
    twilio: !!TWILIO_SID && TWILIO_SID !== 'YOUR_TWILIO_SID',
    a2pReady: !!TWILIO_SID && TWILIO_SID !== 'YOUR_TWILIO_SID'
  });
});

// ── AUTO PROSPECTOR ───────────────────────────────────────────────────────────

async function runAutoProspect() {
  console.log('\n🚀 Auto prospecting started:', new Date().toLocaleString());
  // Pick random city and industries each run
  const shuffledCities = TARGET_CITIES.sort(() => Math.random() - 0.5).slice(0, 3);
  const shuffledIndustries = TARGET_INDUSTRIES.sort(() => Math.random() - 0.5).slice(0, 3);

  for (const city of shuffledCities) {
    for (const industry of shuffledIndustries) {
      await prospectCity(city, industry, 'auto');
      await new Promise(r => setTimeout(r, 2000)); // be nice to APIs
    }
  }
  console.log('✅ Auto prospecting complete');
}

// Run auto prospecting every day at 9am CST
cron.schedule('0 9 * * *', () => {
  console.log('⏰ Cron triggered auto prospect');
  runAutoProspect();
}, { timezone: 'America/Chicago' });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n🌐 Dominion Prospector running on port ${PORT}`));
