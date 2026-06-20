// AutoPost Pro — Daily posting agent

// Deploy to Render.com (free tier) — runs 24/7

const https = require('https');

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const PORT = process.env.PORT || 3000;

// Real Dominion Sound release catalog with actual cover art (extracted from DistroKid June 2026)

const DOMINION_SOUND_RELEASES = [

  { title: "Every Chain is Broken", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--10F79009-F36F-4007-B40F530541F4F630--0--1261116--ArtistlyDesignml9ee1d836a8709c8ac5a9b74c9971f6.jpg" },

  { title: "Covered By Grace", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--0C92B59A-0A1B-4486-B1D3717C4B2419FB--0--1052852--ArtistlyDesignml9ec8c87b6a735f8f5bcfa05af4b2a3.jpg" },

  { title: "Corazón de Cristal (Crystal Heart)", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--2DF2D710-81DC-43F4-93A7118003A9B51B--0--1038375--ArtistlyDesignml9eb7ed77ce71e9a3e37bae51121848.jpg" },

  { title: "Fuego en la Noche (Fire in the Night)", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--5C46F37C-C501-47B5-882C2F8E9F0A542C--0--1248971--ArtistlyDesignml9eb7b60e37733a9286772a98968f6b.jpg" },

  { title: "Moonlight Serenade", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--97CB35C7-C299-4F5C-BC47285AE8E3A00E--0--1077660--ArtistlyDesignml9eb7000236710dbfefd4c6e2a9e16d.jpg" },

  { title: "Summer Breeze", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--F5E3A054-DC7E-4EA1-BD9C3FFAE803FE95--0--1052496--ArtistlyDesignml9eb6f1da4b70b7988efb3a8aead97a.jpg" },

  { title: "Temperature Rise", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--491E30E3-C18E-447C-B558BDB166E5CC39--0--1257347--ArtistlyDesignml9eb6be731872048f3cbb0266d436ca.jpg" },

  { title: "Roots of the Rhythm", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--C6C447F5-4429-49DA-84A7E8C132780897--0--1423976--ArtistlyDesignml9eb69a42b9715a9e5ba7a89984899c.jpg" },

  { title: "City Of Soul", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--31237185-F9EE-4DE1-9B96CB6663742A52--0--945312--ArtistlyDesignml9eb45953d873e3a8e9e3d95b8d192b.jpg" },

  { title: "Neon Horizon", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--71B3E64C-C9CD-4718-8BE9B21C9065692E--0--1173255--ArtistlyDesignml9eb36eef8a731a88f1528e510ba91c.jpg" },

  { title: "Pull the Plug", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--633F911F-F131-432E-B0D337E9A6C4D7FA--0--1390702--ArtistlyDesignml9eb30e822c7187a8889a29188ceaa7.jpg" },

  { title: "Midnight Whistle", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--33A6BDB3-586F-4F8F-A355C17FDE86DD6B--0--1239167--ArtistlyDesignml9eafad5c327223af0405b85861ba2d.jpg" },

  { title: "Golden Hour Groove", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--848416F4-FFB7-461E-96E1D71B0FC49E6E--0--1803134--GeminiGeneratedImageokxzktokxzktokxz.jpg" },

  { title: "Neon Pulse", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--3B9F48B4-C0B2-473D-8903D7627858AA9F--0--1287628--ArtistlyDesignml9eaeeb3b6670c0893b41a6851d21ae.jpg" },

  { title: "Concrete Jungle Rhythm", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--CEDCBDBB-4F15-4A79-AE3D8397D2085993--0--1409905--ArtistlyDesignml9eaeb2328a7108a06a44bd7003090c.jpg" },

  { title: "Walking in the Light", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--5E12A506-7CF2-4544-AC10C2B8ADA2FE09--0--1253585--ArtistlyDesignml9eadda1037718aa72159296a805dc2.jpg" },

  { title: "Velvet Shadows", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--A533981C-6E0E-47DE-A7BA662342876A83--0--1019789--ArtistlyDesignml9eaab06a6272db8c183707fed3acfa.jpg" },

  { title: "Time Zone", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--1CA052B1-C940-46D5-B9C39F3EF9665942--0--1080925--ArtistlyDesignml9eaaa13fb67137a0c135ae4431dbc2.jpg" },

  { title: "Shattered Glass", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--ABF7DADA-AB53-4CCF-9440A587AD982619--0--2641938--GeminiGeneratedImagevq8yhkvq8yhkvq8y.jpg" },

  { title: "Dust on the Dashboard", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--B964FB8A-9C60-4E15-924428C4B3937BDE--0--1270691--ArtistlyDesignml9eaa3c219170728f6d1b052b03ad9b.jpg" },

  { title: "Stepping Out Tonight", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--24D77543-AFD6-415A-95BBE1403356D6E6--0--1261170--ArtistlyDesignml9ea98d4b8570f1bf360877581b3026.jpg" },

  { title: "Rhythm of the Sun / Ritmo del Sol", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--8542A09E-BA43-4809-B06D733B3B137280--0--1364157--ArtistlyDesignml9ea4cd75d9727e8ff7631cb44e3182.jpg" },

  { title: "Delta Dust", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--58506DA7-46E4-4DD9-BAF1B27646AA83FF--0--1291771--ArtistlyDesignml9ea243aeff705eb5954dbdafed6ace.jpg" },

  { title: "Porch Light State of Mind", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--DDBCFB37-E685-4CA6-BB3F64EC222E20AA--0--1581265--ArtistlyDesignml9e9a05438872b49a05af5f1a1fadc6.jpg" },

  { title: "Steady Sun", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--14EF5F4B-B7D3-455A-B4764D0DD7B09AF4--0--1462803--ArtistlyDesignml9e98b15605707aa241d237b602fc24.jpg" },

  { title: "Grease & Gravel", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--480333E0-DC39-4080-8E6F53893BAEFED4--0--1444836--ArtistlyDesignml9e984b619972a28385458557f9ec74.jpg" },

  { title: "Rust & Timber", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--9CDC4A44-7D47-4230-A6A7D10297E5A334--0--8702174--3000.jpg" },

  { title: "Oasis Groove", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--5F06B116-FECC-4B17-8A82B0C1CA7130EF--0--1200812--ArtistlyDesignml9e97f42879722c9d7223f88b7e2cf1.jpg" },

  { title: "Electric Horizon", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--E349D826-2F0A-442E-A4D8A0460C75852B--0--2269537--GeminiGeneratedImagel7v9orl7v9orl7v9.jpg" },

  { title: "City Lights & Late Nights", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--152C85D2-E588-439C-8A7C3A0C2D5D074B--0--1289576--ArtistlyDesignml9e954affee7262b31c32acccdee19e.jpg" },

  { title: "Midnight Velvet", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--A8EB4DA6-2EC2-48D6-A35F3B999E364D8E--0--463402--ArtistlyDesignml9e950bab2673ce894638c2f2f01f49.jpg" },

  { title: "Slow Smoke", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--4F689C6C-10D8-4D3C-A3EA683439E3144F--0--8863272--GeminiGeneratedImagefdcspifdcspifdcs.jpg" },

  { title: "Good Ground", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--746B7A82-7398-47E9-9C8F2F4F34ADA0FE--0--8488401--GeminiGeneratedImageer27o1er27o1er27.jpg" },

  { title: "Elevate the Frequency", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--63C9A754-EDDB-4CAD-87114252948E776F--0--9636080--GeminiGeneratedImage6m70jn6m70jn6m70.jpg" },

  { title: "The Sound I Need", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--75C391BC-081E-4683-98801CBEA470E3CB--0--12997593--300.jpg" },

  { title: "Whiskey And Wildflowers", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--45E1253B-E626-4EFA-9C645DB20B4B7420--0--13837537--300.jpg" },

  { title: "Sunday Morning Shadows", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--0673B313-3230-4930-ABC87EE04449F6A7--0--14296869--300.jpg" },

  { title: "The Water And The Wine", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--7646E663-7996-4429-874650F063E461CA--0--12606953--300.jpg" },

  { title: "Testimony Time", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--6F85277E-0BEA-4F53-9E6164926CD2D138--0--11684156--300.jpg" },

  { title: "The Tambourine Shake", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--C529E348-544C-4065-9379FEFC7D6EF8A5--0--12700849--ArtistlyDesign019e88fe6b35704b95d7ece50f1ecdcd.jpg" },

  { title: "Rain Down Glory", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--DF989F60-8982-4581-A3751C50BFF0E5BB--0--13602816--ArtistlyDesign019e88468aa173bbbfe3cbd015881e76.jpg" },

  { title: "Hold On To The Hem", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--B134614F-97F8-425D-99B6291136620FA4--0--14496376--300.jpg" },

  { title: "He Brought Me Out", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--86BC4DB7-5962-49C6-9C7C97B49F426E17--0--12502840--300.jpg" },

  { title: "Mountains in the Morning", cover: "https://s3.amazonaws.com/gather.fandalism.com/300x300-12820735--5B74F713-7C95-4870-8A9BABF8FF1336F1--0--12789101--300.jpg" },

];

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

    postTimes: [

      { hour: 9, minute: 0 },

      { hour: 14, minute: 0 },

      { hour: 19, minute: 0 },

    ],

  },

  {

    id: 'kidstorybooks',

    name: 'Kidstorybooks',

    fbPageId: process.env.KSB_PAGE_ID,

    fbToken: process.env.KSB_PAGE_TOKEN,

    bio: 'We publish children\'s books for ages 2–12. Over 200 titles available on Amazon covering adventure, animals, bedtime, and learning. Shop at kidstorybooks.com.',

    website: 'kidstorybooks.com',

    topics: ['book_spotlight', 'parent_tip', 'engage'],

    postTimes: [

      { hour: 8, minute: 0 },

      { hour: 11, minute: 0 },

      { hour: 14, minute: 0 },

      { hour: 17, minute: 0 },

      { hour: 20, minute: 0 },

    ],

  }

  // Add client businesses here as they sign up:

  // { id: 'client-abc', name: '...', fbPageId: '...', fbToken: '...', bio: '...', website: '...', topics: [...], postTimes: [{hour:9,minute:0}] }

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

  book_spotlight: `Spotlight this children's book: "${BOOK_TITLES[new Date().getDate() % BOOK_TITLES.length]}". Mention it's available on Amazon at kidstorybooks.com. Warm, parent-friendly tone.`,

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

// If imageUrl is provided, posts as a photo with caption (via /photos endpoint).

// Otherwise posts as plain text (via /feed endpoint).

function postToFacebook(pageId, token, message, imageUrl) {

  return new Promise((resolve, reject) => {

    const usePhoto = !!imageUrl;

    const bodyObj = usePhoto

      ? { url: imageUrl, caption: message, access_token: token }

      : { message, access_token: token };

    const body = JSON.stringify(bodyObj);

    const req = https.request({

      hostname: 'graph.facebook.com',

      path: `/v19.0/${pageId}/${usePhoto ? 'photos' : 'feed'}`,

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

// If slotInfo is provided, only post for clients whose postTimes include this slot.

// If slotInfo is omitted (e.g. manual /run trigger), post for ALL clients immediately.

async function runPostingAgent(slotInfo) {

  const dueClients = slotInfo

    ? CLIENTS.filter(c => c.postTimes.some(t => t.hour === slotInfo.hour && t.minute === slotInfo.minute))

    : CLIENTS;

  if (dueClients.length === 0) return; // nothing scheduled for this exact minute

  console.log(`\n[${new Date().toISOString()}] Running posting agent for ${dueClients.length} client(s)...`);

  for (const client of CLIENTS) {

    if (!dueClients.includes(client)) continue;

    if (!client.fbPageId || !client.fbToken) {

      console.log(`⚠ Skipping ${client.name} — missing page ID or token`);

      continue;

    }

    try {

      // Pick a topic — rotates by day AND by which numbered slot of the day this is

      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

      const slotIndex = client.postTimes.findIndex(t => slotInfo && t.hour === slotInfo.hour && t.minute === slotInfo.minute);

      const topicIndex = (dayOfYear + Math.max(slotIndex, 0)) % client.topics.length;

      const topic = client.topics[topicIndex];

      const topicGuide = TOPIC_GUIDES[topic] || TOPIC_GUIDES.engage;

      // If this is a music/release post for Dominion Sound, pick a real song + real cover art

      let selectedSong = null;

      let extraContext = '';

      if (client.id === 'dominion-sound' && (topic === 'music' || topic === 'release')) {

        selectedSong = DOMINION_SOUND_RELEASES[(dayOfYear + Math.max(slotIndex, 0)) % DOMINION_SOUND_RELEASES.length];

        extraContext = `\nFeature this specific song by name: "${selectedSong.title}". Make the post about this song specifically.`;

      }

      const prompt = `Write a Facebook post for ${client.name}. 

Business: ${client.bio}

Website: ${client.website}

Today's direction: ${topicGuide}${extraContext}

Make it authentic, warm, and human.`;

      console.log(`✍ Writing post for ${client.name} (topic: ${topic}${selectedSong ? ', song: ' + selectedSong.title : ''})...`);

      const postText = await callAnthropic(prompt);

      if (!postText) throw new Error('Empty post from AI');

      console.log(`📝 Post: ${postText}`);

      const imageUrl = selectedSong ? selectedSong.cover : null;

      const result = await postToFacebook(client.fbPageId, client.fbToken, postText, imageUrl);

      if (result.id) {

        console.log(`✅ Posted to ${client.name}${selectedSong ? ' (with cover art)' : ''} — Post ID: ${result.id}`);

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

// ─── SCHEDULER — checks every minute, fires for any client scheduled at this minute ──

let lastCheckedMinute = null;

function scheduleChecker() {

  setInterval(() => {

    const now = new Date();

    const key = `${now.getHours()}:${now.getMinutes()}`;

    if (key === lastCheckedMinute) return; // already handled this minute

    lastCheckedMinute = key;

    runPostingAgent({ hour: now.getHours(), minute: now.getMinutes() });

  }, 30 * 1000); // check twice a minute to avoid missing the exact minute

  // Log the full schedule on startup so it's easy to verify in the logs

  console.log('Posting schedule:');

  for (const client of CLIENTS) {

    const times = client.postTimes.map(t => `${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}`).join(', ');

    console.log(`  ${client.name}: ${times}`);

  }

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

  scheduleChecker();

  // Run immediately on startup (for testing)

  if (process.env.RUN_ON_START === 'true') {

    setTimeout(runPostingAgent, 2000);

  }

});
