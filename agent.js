// AutoPost Pro — Daily posting agent
// Deploy to Render.com (free tier) — runs 24/7

const https = require('https');

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const PORT = process.env.PORT || 3000;

// Your two businesses (add more clients below as you onboard them)
const CLIENTS = [
  {
    id: 'dominion-sound',
    name: 'Dominion Sound',
    fbPageId: process.env.DS_PAGE_ID,
    fbToken: process.env.DS_PAGE_TOKEN,
    bio: 'Independent music artist releasing gospel, R&B, country, Latin, jazz, and neo soul music. We also offer custom songs for birthdays ($67), weddings ($147), memorials ($97), and business jingles ($297).',
    website: 'dominionSoundmusic.com',
    topics: ['music', 'custom_song', 'engage', 'release'],
    postsPerDay: 1,
  },
  {
    id: 'kidstorybooks',
    name: 'Kidstorybooks',
    fbPageId: process.env.KSB_PAGE_ID,
    fbToken: process.env.KSB_PAGE_TOKEN,
    bio: 'We publish children\'s books for ages 2–12. Over 200 titles available on Amazon covering adventure, animals, bedtime, and learning. Shop at kidstorybooks.com.',
    website: 'kidstorybooks.com',
    topics: ['book_spotlight', 'parent_tip', 'engage'],
    postsPerDay: 1,
  }
  // Add client businesses here as they sign up:
  // { id: 'client-abc', name: '...', fbPageId: '...', fbToken: '...', bio: '...', website: '...', topics: [...], postsPerDay: 1 }
];

// Book list for kidstorybooks spotlight rotation
const BOOK_TITLES = [
  'The Brave Little Bunny', 'Stars and Moonbeams', 'Captain Courage',
  'The Dragon Who Was Afraid', 'Grandma\'s Garden', 'Five Little Frogs',
  'Lost in the Forest', 'The Magic Crayon', 'Best Friends Forever',
  'A Dinosaur Day', 'The Sleepy Cloud', 'Rainbow Fish Tales'
];

// Topic rotation — keeps posts fresh
const TOPIC_GUIDES = {
  music:        'Promote Dominion Sound music on Spotify and Apple Music. Pick a genre (gospel, R&B, country, or Latin) and encourage fans to stream.',
  custom_song:  'Pitch custom song services. Keep it warm and personal — mention a real use case like a birthday or wedding. Include the price and website.',
  engage:       'Ask fans a fun question about music, their favorite song, or a memory tied to music. No selling — just connection.',
  release:      'Announce or remind fans about recent releases. Sound excited and genuine.',
  book_spotlight: `Spotlight this children\'s book: "${BOOK_TITLES[new Date().getDate() % BOOK_TITLES.length]}". Mention it\'s available on Amazon at kidstorybooks.com. Warm, parent-friendly tone.`,
  parent_tip:   'Share a fun reading tip or benefit of reading to children. Soft sell — mention kidstorybooks.com at the end.',
};

// ─── AI POST WRITER ───────────────────────────────────────────────────────────
function callAnthropic(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: 'You write authentic, warm Facebook posts for small businesses. Use relevant emojis. Keep posts under 250 characters. End with a call to action. Output ONLY the post text — no quotes, no labels.',
      messages: [{ role: 'user', content: prompt }]
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.content?.find(b => b.type === 'text')?.text?.trim();
          resolve(text || '');
        } catch(e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── FACEBOOK POSTER ──────────────────────────────────────────────────────────
function postToFacebook(pageId, token, message) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ message, access_token: token });
    const req = https.request({
      hostname: 'graph.facebook.com',
      path: `/v19.0/${pageId}/feed`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`FB API error (status ${res.statusCode}): ${JSON.stringify(parsed.error)}`));
          } else {
            resolve(parsed);
          }
        }
        catch(e) { reject(new Error(`Failed to parse FB response (status ${res.statusCode}): ${data}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── MAIN POSTING LOOP ────────────────────────────────────────────────────────
async function runPostingAgent() {
  console.log(`\n[${new Date().toISOString()}] Running posting agent for ${CLIENTS.length} clients...`);

  for (const client of CLIENTS) {
    if (!client.fbPageId || !client.fbToken) {
      console.log(`⚠ Skipping ${client.name} — missing page ID or token`);
      continue;
    }

    try {
      // Pick a topic (rotate through available ones)
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
      const topic = client.topics[dayOfYear % client.topics.length];
      const topicGuide = TOPIC_GUIDES[topic] || TOPIC_GUIDES.engage;

      const prompt = `Write a Facebook post for ${client.name}. 
Business: ${client.bio}
Website: ${client.website}
Today's direction: ${topicGuide}
Make it authentic, warm, and human.`;

      console.log(`✍ Writing post for ${client.name} (topic: ${topic})...`);
      const postText = await callAnthropic(prompt);

      if (!postText) throw new Error('Empty post from AI');
      console.log(`📝 Post: ${postText}`);

      const result = await postToFacebook(client.fbPageId, client.fbToken, postText);

      if (result.id) {
        console.log(`✅ Posted to ${client.name} — Post ID: ${result.id}`);
      } else {
        console.log(`❌ Facebook error for ${client.name}:`, result.error?.message || JSON.stringify(result));
      }

    } catch (err) {
      console.error(`❌ Error for ${client.name}:`, err.message);
    }

    // Wait 3 seconds between clients to be polite to APIs
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log(`[${new Date().toISOString()}] Agent run complete.\n`);
}

// ─── SCHEDULER — runs every 24 hours at 9am ───────────────────────────────────
function scheduleDaily() {
  const now = new Date();
  const next9am = new Date(now);
  next9am.setHours(9, 0, 0, 0);
  if (next9am <= now) next9am.setDate(next9am.getDate() + 1);

  const msUntil9am = next9am - now;
  console.log(`Next post scheduled in ${Math.round(msUntil9am / 60000)} minutes (9:00 AM)`);

  setTimeout(() => {
    runPostingAgent();
    setInterval(runPostingAgent, 24 * 60 * 60 * 1000); // then every 24h
  }, msUntil9am);
}

// ─── HTTP SERVER (keeps Render.com free tier alive) ───────────────────────────
const http = require('http');
http.createServer((req, res) => {
  if (req.url === '/run' && req.method === 'POST') {
    runPostingAgent();
    res.end(JSON.stringify({ status: 'running' }));
  } else if (req.url === '/health') {
    res.end(JSON.stringify({ status: 'ok', clients: CLIENTS.length, time: new Date().toISOString() }));
  } else {
    res.writeHead(200);
    res.end('AutoPost Pro is running.');
  }
}).listen(PORT, () => {
  console.log(`AutoPost Pro server running on port ${PORT}`);
  scheduleDaily();

  // Run immediately on startup (for testing)
  if (process.env.RUN_ON_START === 'true') {
    setTimeout(runPostingAgent, 2000);
  }
});
