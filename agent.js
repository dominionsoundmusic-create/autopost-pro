// AutoPost Pro — Daily posting agent
// Deploy to Render.com (free tier) — runs 24/7

const https = require('https');
const twilio = require('twilio');

// ─── SMS NOTIFIER (Twilio) ───────────────────────────────────────────────────
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER; // e.g. +19033005683
const NOTIFY_PHONE_NUMBER = process.env.NOTIFY_PHONE_NUMBER; // e.g. +19035050889 (Maurice's real phone)

const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

async function sendLeadSms(formData) {
  if (!twilioClient || !TWILIO_FROM_NUMBER || !NOTIFY_PHONE_NUMBER) {
    console.log('⚠ SMS not configured — skipping lead text notification');
    return;
  }
  try {
    const name = formData.name || 'Someone';
    const business = formData.business ? ` (${formData.business})` : '';
    const phone = formData.phone ? ` — ${formData.phone}` : '';
    const body = `New lead on dominionwebdesignpro.com!\n${name}${business}${phone}\nCheck your email/sheet for full details.`;

    await twilioClient.messages.create({
      body,
      from: TWILIO_FROM_NUMBER,
      to: NOTIFY_PHONE_NUMBER,
    });
    console.log(`📱 Lead SMS sent to ${NOTIFY_PHONE_NUMBER}`);
  } catch (err) {
    console.error('⚠ SMS notification failed:', err.message);
  }
}

// ─── BLOG AUTO-PUBLISHER (weekly SEO articles for dominionSoundmusic.com) ────
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const BLOG_REPO_OWNER = process.env.BLOG_REPO_OWNER || 'dominionsoundmusic-create';
const BLOG_REPO_NAME = process.env.BLOG_REPO_NAME; // e.g. 'dominionsoundmusic-site' — the repo backing the Netlify site
const BLOG_REPO_BRANCH = process.env.BLOG_REPO_BRANCH || 'main';

// Keyword clusters — one pillar per week, cycling through. Add more anytime.
const BLOG_KEYWORD_CLUSTERS = [
  {
    pillar: 'Memorial Songs',
    primary: 'how to write a memorial song for a parent',
    supporting: ['custom tribute song for funeral', 'memorial song ideas for grandmother', 'personalized song for someone who passed away', 'affordable memorial song service near me'],
  },
  {
    pillar: 'Birthday Songs',
    primary: 'personalized birthday song for adults',
    supporting: ['custom birthday song for mom', 'how to make a custom birthday song', 'unique 50th birthday song gift idea', 'custom birthday song for wife'],
  },
  {
    pillar: 'Wedding Songs',
    primary: 'custom first dance song written for us',
    supporting: ['personalized wedding song from our story', 'how to get a custom wedding song made', 'unique first dance song ideas', 'write a song about our love story'],
  },
  {
    pillar: 'Business Jingles',
    primary: 'custom jingle for small business',
    supporting: ['how to get a jingle made for my business', 'affordable custom radio jingle', 'how much does a business jingle cost'],
  },
  {
    pillar: 'Gospel Music',
    primary: 'contemporary gospel songs 2026',
    supporting: ['urban gospel music for worship service', 'gospel songs about overcoming hardship', 'uplifting gospel songs for hard times'],
  },
  {
    pillar: 'R&B and Soul',
    primary: 'independent R&B artist new music',
    supporting: ['smooth R&B songs for late night', 'neo soul music independent artist', 'soulful R&B songs about heartbreak'],
  },
  {
    pillar: 'Country Music',
    primary: 'independent country artist new song',
    supporting: ['country songs about small town life', 'country song about road trips', 'Texas country music independent artist'],
  },
  {
    pillar: 'Latin Music',
    primary: 'bilingual Latin music independent artist',
    supporting: ['new Latin song release', 'Latin music for celebration', 'Spanish English crossover song'],
  },
  {
    pillar: 'Music Distribution How-To',
    primary: 'how to distribute music on Spotify independently',
    supporting: ['how to release music without a record label', 'how to promote new music release on social media', 'how to get music on Spotify playlists independently'],
  },
  {
    pillar: 'Buyer Guide',
    primary: 'best custom song service for memorials',
    supporting: ['custom song with preview before paying', 'what information do I need to provide for a custom song', 'is a custom song a good wedding gift'],
  },
];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

async function generateBlogArticle(cluster) {
  const prompt = `Write an SEO-optimized blog article for Dominion Sound (independent music artist and custom song service, dominionSoundmusic.com).

Primary keyword (must appear in the title, first paragraph, and 2-3 times naturally in the body): "${cluster.primary}"
Supporting keywords (work in naturally where relevant, don't force them): ${cluster.supporting.join(', ')}

Write 700-900 words. Structure: an engaging intro paragraph, 3-4 H2 subheadings with substantive content under each, and a closing paragraph with a soft call-to-action pointing to dominionSoundmusic.com's custom song services.

Tone: warm, helpful, written for someone actually researching this topic — not generic SEO filler. Include genuinely useful, specific information, not vague platitudes.

Respond in ONLY this exact format, nothing else:
TITLE: [SEO-friendly article title, under 60 characters]
META: [meta description, under 155 characters]
---BODY---
[full article body in clean HTML using <h2>, <p>, <ul>/<li> tags as appropriate — no <html>/<head>/<body> wrapper tags, just the content fragment]`;

  const response = await callAnthropicLongForm(prompt, 2200);
  const titleMatch = response.match(/^TITLE:\s*(.+)$/im);
  const metaMatch = response.match(/^META:\s*(.+)$/im);
  const bodyMatch = response.split('---BODY---')[1];

  return {
    title: titleMatch ? titleMatch[1].trim() : cluster.primary,
    meta: metaMatch ? metaMatch[1].trim() : '',
    body: bodyMatch ? bodyMatch.trim() : response,
  };
}

function buildBlogPageHtml(article, slug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${article.title} | Dominion Sound</title>
<meta name="description" content="${article.meta}">
<link rel="canonical" href="https://dominionsoundmusic.com/blog/${slug}.html">
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#0a0a0a;color:#e8e4dc;line-height:1.8;font-weight:300}
.wrap{max-width:720px;margin:0 auto;padding:60px 24px 100px}
.back{color:#c9a84c;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase}
h1{font-family:'Cormorant Garamond',serif;font-size:clamp(30px,5vw,44px);color:#fff;margin:24px 0 32px;font-weight:500;line-height:1.2}
h2{font-family:'Cormorant Garamond',serif;font-size:26px;color:#c9a84c;margin:36px 0 16px;font-weight:500}
p{margin-bottom:18px;font-size:16px;color:#cfc9bd}
ul{margin:0 0 18px 22px;color:#cfc9bd}
li{margin-bottom:8px}
.cta{background:#161616;border:1px solid #c9a84c;border-radius:6px;padding:28px;margin-top:48px;text-align:center}
.cta a{display:inline-block;margin-top:14px;background:#c9a84c;color:#0a0a0a;padding:13px 30px;border-radius:4px;text-decoration:none;font-weight:600;font-size:14px}
</style>
</head>
<body>
<div class="wrap">
  <a href="../index.html" class="back">← Back to Dominion Sound</a>
  <h1>${article.title}</h1>
  ${article.body}
  <div class="cta">
    <p style="margin:0">Looking for a custom song made just for you?</p>
    <a href="../index.html#custom-songs">Order a Custom Song →</a>
  </div>
</div>
</body>
</html>`;
}

async function commitFileToGitHub(path, content, commitMessage) {
  if (!GITHUB_TOKEN || !BLOG_REPO_NAME) {
    console.log('⚠ GitHub not configured — skipping blog publish');
    return null;
  }
  const apiBase = `https://api.github.com/repos/${BLOG_REPO_OWNER}/${BLOG_REPO_NAME}/contents/${path}`;

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      message: commitMessage,
      content: Buffer.from(content).toString('base64'),
      branch: BLOG_REPO_BRANCH,
    });
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${BLOG_REPO_OWNER}/${BLOG_REPO_NAME}/contents/${path}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'AutoPost-Pro-Blog-Publisher',
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(`GitHub API error (${res.statusCode}): ${JSON.stringify(parsed)}`));
        } catch(e) { reject(new Error(`Failed to parse GitHub response: ${data}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function publishWeeklyBlogPost() {
  console.log(`\n[${new Date().toISOString()}] Running weekly blog publisher...`);
  try {
    const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const cluster = BLOG_KEYWORD_CLUSTERS[weekNum % BLOG_KEYWORD_CLUSTERS.length];

    console.log(`✍ Writing blog article for pillar: ${cluster.pillar}...`);
    const article = await generateBlogArticle(cluster);
    const slug = slugify(article.title);
    const html = buildBlogPageHtml(article, slug);

    const result = await commitFileToGitHub(`blog/${slug}.html`, html, `Add blog post: ${article.title}`);

    if (result) {
      console.log(`✅ Published blog post: ${article.title} (blog/${slug}.html)`);
    }
  } catch (err) {
    console.error('❌ Blog publishing failed:', err.message);
  }
}

// ─── EMAIL NOTIFIER (via Resend — works on Render free tier, unlike Gmail SMTP) ──
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'AutoPost Pro <onboarding@resend.dev>';
const EMAIL_USER = process.env.NOTIFY_EMAIL || process.env.GMAIL_SENDER_USER; // where YOUR notifications land

function sendEmail(to, subject, html) {
  return new Promise((resolve, reject) => {
    if (!RESEND_API_KEY) {
      console.log('⚠ Email not configured (no RESEND_API_KEY) — skipping notification');
      resolve(null);
      return;
    }
    const body = JSON.stringify({ from: RESEND_FROM_EMAIL, to: [to], subject, html });
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(parsed);
          else reject(new Error(`Resend API error (${res.statusCode}): ${JSON.stringify(parsed)}`));
        } catch(e) { reject(new Error(`Failed to parse Resend response: ${data}`)); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function sendPostNotification(toEmail, clientName, postText, postUrl, imageUrl) {
  try {
    const html = `
      <div style="font-family:sans-serif;max-width:480px">
        <h2 style="color:#c9a84c;margin-bottom:4px">${clientName} just posted</h2>
        <p style="font-size:15px;line-height:1.6;color:#333;white-space:pre-wrap">${postText}</p>
        ${imageUrl ? `<img src="${imageUrl}" style="max-width:100%;border-radius:8px;margin:12px 0">` : ''}
        <p style="margin-top:16px">
          <a href="${postUrl}" style="background:#c9a84c;color:#000;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600">View & Share on Facebook →</a>
        </p>
      </div>
    `;
    await sendEmail(toEmail, `New post live: ${clientName}`, html);
    console.log(`📧 Notification sent to ${toEmail}`);
  } catch (err) {
    console.error(`⚠ Email notification failed:`, err.message);
  }
}

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

// Real Kidstorybooks catalog with Amazon cover art (extracted from live site June 21, 2026)
const KIDSTORYBOOKS_CATALOG = [
  { title: "From Puddle to Pond: Tadpole's Big Adventure", asin: "B0H4SNH1SY", category: "nature" },
  { title: "The Hungry Little Seed: How the Venus Flytrap Grows", asin: "B0H3Q9HVV7", category: "nature" },
  { title: "The Butterfly Sisters", asin: "B0H1RXJJLL", category: "childrens" },
  { title: "The Donkey Who Had to Speak Up", asin: "B0H2RVLFNK", category: "christian" },
  { title: "The Lifecycle of a Kangaroo: Ages 3-5", asin: "B0H23W9ZFJ", category: "nature" },
  { title: "The Lifecycle of a Hummingbird: Ages 3-5", asin: "B0H1X4KM9Y", category: "nature" },
  { title: "The Lifecycle of a Salmon: Ages 3-5", asin: "B0H1RSF8BC", category: "nature" },
  { title: "Lifecycle of a Pine Tree: The Evergreen Promise", asin: "B0H1MW3MCS", category: "nature" },
  { title: "Lifecycle of a Strawberry", asin: "B0H1J8NNNQ", category: "nature" },
  { title: "Lifecycle of a Bean Plant: Reaching for the Light", asin: "B0H1HTWCHC", category: "nature" },
  { title: "The Faithful Mustard Seed: Small but Mighty", asin: "B0GZVSS9QZ", category: "nature" },
  { title: "The Everyday Queen: A Crown for Mom", asin: "B0GZPK1SBB", category: "childrens" },
  { title: "The Honest Ivy: The Courage to Tell the Truth", asin: "B0GZDSBP8B", category: "nature" },
  { title: "The Bountiful Bramble: Learning to Share Your Sweetness", asin: "B0GZBKWC13", category: "nature" },
  { title: "The Gentle Willow: Letting Go of the Heavy Leaves", asin: "B0GZ4GYNCR", category: "nature" },
  { title: "The Remarkable Redwood: Standing Strong Together", asin: "B0GZ48DL2Z", category: "nature" },
  { title: "The Brave Bamboo: Learning to Bend in the Wind", asin: "B0GYWWZTZW", category: "nature" },
  { title: "The Daring Dandelion: Scattering Seeds of Joy", asin: "B0GYRT1SVB", category: "nature" },
  { title: "The Humble Apple Seed: From Tiny Pip to a Harvest of Joy", asin: "B0GYP3DVDZ", category: "nature" },
  { title: "The New Little Sister", asin: "B0GXYWB7ZC", category: "childrens" },
  { title: "Cam the Chameleon Who Ran Out of Color", asin: "B0GCYR4D1T", category: "childrens" },
  { title: "Benny's Big Balloon", asin: "B0G8VRZ4GJ", category: "childrens" },
  { title: "Barnaby Bear's Wobbly Bicycle", asin: "B0G6WRDNLV", category: "childrens" },
  { title: "The Radiant Sunflower: From Tiny Seed to Golden Giant", asin: "B0GY8VFHB8", category: "nature" },
  { title: "The Marvelous Monarch: From Tiny Egg to Painted Wings", asin: "B0GY815SH7", category: "nature" },
  { title: "The Mighty Oak: From Acorn to Ancient Sentinel", asin: "B0GY7Q2LTB", category: "nature" },
  { title: "Lifecycle of a Penguin: Ages 3-5", asin: "B0GY7C6LM4", category: "nature" },
  { title: "Lifecycle of a Spider: Ages 3-5", asin: "B0GY4TM8J5", category: "nature" },
  { title: "Lifecycle of an Ant: Ages 3-5", asin: "B0GY46SWTN", category: "nature" },
  { title: "Lifecycle Of An Apple Tree: Ages 3-5", asin: "B0GY3MJN7Y", category: "nature" },
  { title: "Lifecycle of a Chicken: Ages 3-5", asin: "B0GXZGWSN7", category: "nature" },
  { title: "The Five Senses: Ages 3-5", asin: "B0GXVLH1HF", category: "nature" },
  { title: "Lifecycle of a Ladybug: Ages 3-5", asin: "B0GXP4Z5Z8", category: "nature" },
  { title: "Lifecycle of a Sea Turtle: Ages 3-5", asin: "B0GXJ7DCK7", category: "nature" },
  { title: "Lifecycle of a Frog: Ages 3-5", asin: "B0GXDZ6TNW", category: "nature" },
  { title: "Lifecycle of a Honey Bee", asin: "B0GX9JL5MM", category: "nature" },
  { title: "Lifecycle Of A Plant", asin: "B0GX7CPD3K", category: "nature" },
  { title: "Obedience On The First Try", asin: "B0GX6NKB8K", category: "christian" },
  { title: "Lifecycle Of A Butterfly", asin: "B0GWXYJSG6", category: "nature" },
  { title: "Hector the Hippo and the Huge Hat", asin: "B0GWWXB1QC", category: "childrens" },
  { title: "Conscious Discipline: Understanding Our Feelings", asin: "B0GW34JNV9", category: "childrens" },
  { title: "Planting Seeds of Kindness", asin: "B0G3TPMGWW", category: "childrens" },
  { title: "Luna and the Lullaby Light", asin: "B0GTZK4KQ4", category: "childrens" },
  { title: "Gideon's Great Height", asin: "B0GTBGGYTD", category: "christian" },
  { title: "Franklin's Leap of Faith", asin: "B0GT9S3BTJ", category: "christian" },
  { title: "The True Meaning of Easter", asin: "B0GT4VC6ZP", category: "christian" },
  { title: "Noah's Ark", asin: "B0FXRGGS7M", category: "christian" },
  { title: "Jonah and the Big Fish", asin: "B0FXRKJ5K3", category: "christian" },
  { title: "The Faithful Fig Tree", asin: "B0GT17ZCTZ", category: "christian" },
  { title: "Felix the Flashlight: A Story of Shining Bright", asin: "B0GSWCPW2F", category: "christian" },
  { title: "Creature Connections: Addison's Quiet Grace", asin: "B0GQB4QWRG", category: "childrens" },
  { title: "Olivia's Tangled Day", asin: "B0GSCV7MYR", category: "christian" },
  { title: "Eddie the Engine's Impossible Pull", asin: "B0GS5K47S9", category: "christian" },
  { title: "Edgar the Emu's Fast Feet", asin: "B0GS543MY3", category: "christian" },
  { title: "Ernie the Eraser's Gift of Grace", asin: "B0GS2H2DWY", category: "christian" },
  { title: "Sammy's Thankful Tree", asin: "B0G25LWFSF", category: "christian" },
  { title: "The Secret To Unshakable Truth!", asin: "B0GPL1SRTX", category: "teens" },
  { title: "Navigating Life's Deep Questions: Why Do Bad Things Happen?", asin: "B0GPLD3LXV", category: "teens" },
  { title: "The Secret To Knowing God", asin: "B0GP6JJ86J", category: "christian" },
  { title: "Arthur the Anchor Holds Fast", asin: "B0GNZHL78N", category: "christian" },
  { title: "Pip, The Super Swimmer", asin: "B0GNTDR7GT", category: "christian" },
  { title: "Celebrating Black History: Heroes and Innovators", asin: "B0GNK7HTS6", category: "teens" },
  { title: "Barnaby the Bumblebee & The Impossible Flight", asin: "B0GNJG3BZY", category: "christian" },
  { title: "Rocky the Geode & The Hidden Treasure", asin: "B0GN8XWHBH", category: "christian" },
  { title: "Flash the Firefly & The Darkest Night", asin: "B0GN8SHRZZ", category: "christian" },
  { title: "Sammy the Seed: Fun Facts & Big Faith for Little Hearts", asin: "B0GN3L18Z3", category: "christian" },
  { title: "The Impossible Crumb", asin: "B0GN2ZCFY9", category: "christian" },
  { title: "Skyler the Kite & The String of Love", asin: "B0GMWDJC5L", category: "christian" },
  { title: "Penny the Caterpillar & The Impossible Dream", asin: "B0GMWJWBT4", category: "christian" },
  { title: "Captain North & The Lost Bunny", asin: "B0GMQLMPDC", category: "christian" },
  { title: "Builder Ben's Unbreakable Dam", asin: "B0GMQCSFV5", category: "christian" },
  { title: "A Gift from God", asin: "B0G5DZ1FD3", category: "christian" },
  { title: "Barnaby Bear and the Great Winter Share", asin: "B0G4W76B7D", category: "childrens" },
  { title: "Jehovah-Mekaddishkhem: My Sanctifier!", asin: "B0GLQ252L4", category: "christian" },
  { title: "Jehovah RHOI: My Shepherd!", asin: "B0GLP63ZK8", category: "christian" },
  { title: "Jehovah Shemmah: My Ever-Present God!", asin: "B0GLNFYV6M", category: "christian" },
  { title: "Seeking First: Matthew 6:33", asin: "B0G1YPX86R", category: "christian" },
  { title: "JEHOVAH-TSIDKENU: My Righteousness!", asin: "B0GLGXYDWD", category: "christian" },
  { title: "JEHOVAH-SHALOM: My Peace!", asin: "B0GLGJZFVN", category: "christian" },
  { title: "Jehovah Rapha: My Healer!", asin: "B0GKWBQL8Z", category: "christian" },
  { title: "Jehovah Nissi: My Banner!", asin: "B0GKV6ZZX2", category: "christian" },
  { title: "Jehovah Jireh: My Provider!", asin: "B0GKV1QTHT", category: "christian" },
  { title: "Jehovah: Eternal, Permanent, and Self-Existent!", asin: "B0GKPY8HNC", category: "christian" },
  { title: "ADONAI: Owner of My Life!", asin: "B0GKNYBVNF", category: "christian" },
  { title: "EL SHADDAI: All-Sufficient!", asin: "B0GKMTZQR8", category: "christian" },
  { title: "ELOHIM The Creator", asin: "B0GKGDC1X5", category: "christian" },
  { title: "EL-ALMIGHTY GOD!", asin: "B0GKFFY4VQ", category: "christian" },
  { title: "Sharing God's Love", asin: "B0GJZR832L", category: "christian" },
  { title: "David and Goliath", asin: "B0FY3N357X", category: "christian" },
  { title: "Leo and Mia's Grand Learning Adventure", asin: "B0FXWJVQ8S", category: "childrens" },
  { title: "Amin's Sky Soar", asin: "B0FY1SMBLG", category: "childrens" },
  { title: "Talia's Starry Prayer", asin: "B0FY267CGH", category: "christian" },
  { title: "The Grateful Goose's Feast", asin: "B0G1YX9VKS", category: "childrens" },
  { title: "Herman's Shiny Shell", asin: "B0GHF34JYD", category: "childrens" },
  { title: "Creation God's Super-Duper Week", asin: "B0FXTFMZX4", category: "christian" },
  { title: "Pippin Puffs Up", asin: "B0GH87PTN7", category: "childrens" },
  { title: "The Loving Father and His Two Sons", asin: "B0G4R6W5MJ", category: "christian" },
  { title: "The Heartbeat of the Neighborhood: Kai's Barbershop Journey", asin: "B0G4LXB397", category: "childrens" },
  { title: "Zuri the Little Scientist and the Ladybug Spot", asin: "B0G4GTLKFZ", category: "childrens" },
  { title: "The Secret of the Garden", asin: "B0G4CCJJJG", category: "christian" },
  { title: "The Tower of Babel", asin: "B0G48K3HQ1", category: "christian" },
  { title: "The Seed of Worry", asin: "B0G471VWDQ", category: "childrens" },
  { title: "Finley's Fidgety Spots", asin: "B0G3LZVDBD", category: "childrens" },
  { title: "The Sunflower Secret", asin: "B0G3LV1BKY", category: "childrens" },
  { title: "Shelby's Speed Secret", asin: "B0G3H8FX6W", category: "childrens" },
  { title: "Freddie the Fox Who Felt Too Fast", asin: "B0G33BX6FN", category: "childrens" },
  { title: "The Little Engineer Who Couldn't Wait", asin: "B0G2CCQ1RC", category: "childrens" },
  { title: "Ella and the Quiet Rumble", asin: "B0GDFQQSWP", category: "childrens" },
  { title: "The Owl Who Loved the Day", asin: "B0GDFPCCX6", category: "childrens" },
  { title: "The Shark Who Needed Glasses", asin: "B0GD77WRVQ", category: "childrens" },
  { title: "Simon's Nutty Rescue", asin: "B0GCZR4ZBQ", category: "childrens" },
  { title: "The Blessed Path", asin: "B0G2HFYTL4", category: "christian" },
  { title: "Detective Paws and the Case of the Missing Squeak", asin: "B0GCW3F8H5", category: "childrens" },
  { title: "Willow's Heavy Words", asin: "B0GCWFGMGD", category: "childrens" },
  { title: "Shemaiah and Tia's Splashy Spa Surprise", asin: "B0FZ93T68W", category: "childrens" },
  { title: "Chatter's Banana Phone Adventure", asin: "B0GCRX4MRQ", category: "childrens" },
  { title: "Simon Squirrel's Winter Ride", asin: "B0GCM3HXGQ", category: "childrens" },
  { title: "The Girl Who Planted a Raincloud", asin: "B0GCHYKQ61", category: "childrens" },
  { title: "The Antique Shop of Unfinished Things", asin: "B0GC86XJT9", category: "childrens" },
  { title: "Officer Owl and the Missing Moon", asin: "B0GC7JC1SV", category: "childrens" },
  { title: "Pip's Golden Acorn", asin: "B0GC77TFJR", category: "childrens" },
  { title: "Jomo's River Bounty", asin: "B0FXXNG2PN", category: "childrens" },
  { title: "Maple's Hidden Island Hop", asin: "B0FXTQXS7P", category: "childrens" },
  { title: "Dino-Nugget Dave: The Dinosaur Who Refused Dinner", asin: "B0G9S9XXN7", category: "childrens" },
  { title: "Yuri the Yeti and the Power of Yet", asin: "B0G9SR81H3", category: "childrens" },
  { title: "The Grumble-Bee Who Found His Buzz", asin: "B0G9M4BVZ3", category: "childrens" },
  { title: "The Nocturnal Friend: Oliver's Brightest Day", asin: "B0G7JMV8NK", category: "childrens" },
  { title: "The Smallest Hero", asin: "B0G6ZB6R7C", category: "childrens" },
  { title: "Simon Saves The Day", asin: "B0G6Z2H7L3", category: "childrens" },
  { title: "Leo and the Loud Library", asin: "B0G6TXCVCP", category: "childrens" },
  { title: "The Worry Whales and Milo's Map", asin: "B0G6RZ217V", category: "childrens" },
  { title: "The Farmer and the Seeds", asin: "B0G6F75G2D", category: "christian" },
  { title: "Generations of Grace", asin: "B0G64RK5C9", category: "christian" },
  { title: "Kofi and Kwame: Brothers Through Thick and Thin", asin: "B0G5Z66BW7", category: "childrens" },
  { title: "Rusty the Rafter Squirrel and the Library Mystery", asin: "B0G5Y6ZDXZ", category: "childrens" },
  { title: "The Secret of the Sacred Scroll", asin: "B0G5PKR3WF", category: "christian" },
  { title: "Ferdinand and the Ticklish Secret", asin: "B0G5K73YDQ", category: "childrens" },
  { title: "We Love Because He First Loved Us: 1 John 4:19", asin: "B0G5FQYLVF", category: "christian" },
  { title: "Remy Raccoon and the Quiet Forest", asin: "B0G5GD6MX4", category: "childrens" },
  { title: "Rupert's Invisible Bridge and the Valley of Lost Things", asin: "B0G588485P", category: "childrens" },
  { title: "Eli and the Mystery Skree-eek!", asin: "B0G4W4MGMT", category: "childrens" },
  { title: "Wally the Wombat Who Couldn't Wait", asin: "B0G4VSMLHQ", category: "childrens" },
  { title: "The Littlest Lamb Who Couldn't Sleep", asin: "B0G4VRNPCX", category: "childrens" },
  { title: "Felix Finds His Song", asin: "B0G4R7HTTH", category: "childrens" },
  { title: "The Hive's Great Data Disaster", asin: "B0G3QMLP9J", category: "childrens" },
  { title: "Missing Moonbeam", asin: "B0G3F88V4S", category: "childrens" },
  { title: "Penny the Planner and the Wobbly Bridge", asin: "B0G39QQMRT", category: "childrens" },
  { title: "The Worry Cloud in My Tummy", asin: "B0G397NWXV", category: "childrens" },
  { title: "My Heart Is Happy: A Little Book of God's Blessings", asin: "B0G356DQD4", category: "christian" },
  { title: "The Little Seed Who Wouldn't Grow", asin: "B0G2XRXHBC", category: "childrens" },
  { title: "The Day the Scribbly Crayon Found Its Color", asin: "B0G2SZYWNS", category: "childrens" },
  { title: "The Loudest Whisper", asin: "B0G2T18WQG", category: "childrens" },
  { title: "The Golden Rule: Treat Others As You Wish To Be Treated", asin: "B0G2RT3V4X", category: "christian" },
  { title: "The Prayer of Salvation: Romans 10:9-10", asin: "B0G2JV37MH", category: "christian" },
  { title: "The Lord's Blessing: Riches with No Sorrow", asin: "B0G2J33FM7", category: "christian" },
  { title: "Grandma Sara's Prayer Power", asin: "B0G2GDCWF5", category: "christian" },
  { title: "Counting Stars: Luna's Cosmic Adventure", asin: "B0G2CTRB42", category: "childrens" },
  { title: "Sebastian's Fuzzies: A Cat's Guide to Human Management", asin: "B0G292JLNN", category: "childrens" },
  { title: "The Grumbles That Went to Sleep", asin: "B0G25M1PBR", category: "childrens" },
  { title: "The Thankful Tractor", asin: "B0G1ZF55QK", category: "christian" },
  { title: "Henrietta, the Chicken Who Thought She Was a Superhero", asin: "B0G1Z1688H", category: "childrens" },
  { title: "The Library Lion Who Forgot How to Roar", asin: "B0FY5GW6BL", category: "childrens" },
  { title: "Elijah and the Widow's Son: A Story of Faith and Miracles", asin: "B0FY3F4GPX", category: "christian" },
  { title: "Jayden's Joyful Hut", asin: "B0FY38MGZW", category: "childrens" },
  { title: "Moses in Egypt and the Exodus", asin: "B0FXTMFS6D", category: "christian" },
  { title: "Beyond Sunday", asin: "B0FXTFMZX4", category: "christian" },
];

function bookCoverUrl(asin) {
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`;
}

// Cookbook titles — same catalog family, posted with cooking-focused copy instead of storytime framing
const KIDSTORYBOOKS_COOKBOOKS = [
  { title: "Copper & Cane: The Elevated Southern Sweet Treats Cookbook", asin: "B0GWHM9SZX", category: "cookbooks" },
  { title: "Spoon & Silk: The Elevated Southern Pudding Cookbook", asin: "B0GVY2SJ3X", category: "cookbooks" },
  { title: "Cream & Churn: The Elevated Southern Ice Cream Cookbook", asin: "B0GW2MSG6V", category: "cookbooks" },
  { title: "Batter & Brass: The Elevated Southern Bar Cookbook", asin: "B0GVNZ72PY", category: "cookbooks" },
  { title: "Molasses & Melt: The Elevated Southern Cookie Cookbook", asin: "B0GVMRH2VL", category: "cookbooks" },
  { title: "Orchard & Iron: The Elevated Southern Cobbler Cookbook", asin: "B0GVMV534Y", category: "cookbooks" },
  { title: "The Everyday High-Protein Cookbook", asin: "B0GPPZZNLP", category: "cookbooks" },
  { title: "Roux & Root: A Culinary Journey Of Heritage and Flavor", asin: "B0GPDKZB4M", category: "cookbooks" },
  { title: "WILD & CHOSEN: The Hunter's Harvest Cookbook", asin: "B0GHQGGTXR", category: "cookbooks" },
  { title: "PRESS & PULSE: Recovery Tonics and Vitality Blends", asin: "B0GHPXRHVC", category: "cookbooks" },
  { title: "Field & Fuel: Essential Carbohydrates for Endurance", asin: "B0GHP1V63W", category: "cookbooks" },
  { title: "Prime And Power: High-Performance Proteins for Strength", asin: "B0GHNDNN46", category: "cookbooks" },
  { title: "Grits And Grain: Morning Fuel for Discipline and Drive", asin: "B0GHJKKPYN", category: "cookbooks" },
  { title: "SOUL & SPICE: Elevated Soul Food", asin: "B0GJD6V82Q", category: "cookbooks" },
  { title: "SMOKE & SEAR: Elevated Barbecue & Grilling", asin: "B0GJ3WTHVC", category: "cookbooks" },
  { title: "WOK & WILLOW: Elevated Asian Fusion", asin: "B0GHYDGG84", category: "cookbooks" },
  { title: "IRON & OIL: One Skillet, Infinite Flavor", asin: "B0GJKZC41T", category: "cookbooks" },
  { title: "The Type 2 Table: Delicious Meals for a Balanced Life", asin: "B0GP13KJW9", category: "cookbooks" },
  { title: "The Puerto Rican Kitchen", asin: "B0GN2M3316", category: "cookbooks" },
  { title: "FLOUR & FROSTING: The Ultimate Kids' Baking Book", asin: "B0GK6H858F", category: "cookbooks" },
  { title: "FLOUR & FIRE: Elevated Rustic Italian", asin: "B0GHSPJTPX", category: "cookbooks" },
  { title: "Smoke & Oak: Elevated Barbecue & Bourbon", asin: "B0GFDSNH3S", category: "cookbooks" },
  { title: "TIDE & TABLE: Elevated Coastal Cuisine", asin: "B0GFJL2YHD", category: "cookbooks" },
  { title: "Salt And Sea: Elevated Coastal Cuisine", asin: "B0GG6JXPLQ", category: "cookbooks" },
  { title: "SMOKE & SEAR Elevated Steakhouse Classics", asin: "B0GF1YGX2X", category: "cookbooks" },
  { title: "CRISP & COMFORT: Elevated Air Fryer Classics", asin: "B0GDQJ5141", category: "cookbooks" },
  { title: "Tides & Traditions: Elevated Seafood Classics", asin: "B0GDQBVJ5N", category: "cookbooks" },
  { title: "Heritage & Heat: Elevated Mexican Classics", asin: "B0GDLQ8GFY", category: "cookbooks" },
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
    notifyEmail: 'dominionsoundmusic@gmail.com',
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
    notifyEmail: 'kidstorybookssell@gmail.com',
    topics: ['book_spotlight', 'cookbook_spotlight', 'parent_tip', 'engage'],
    postTimes: [
      { hour: 8, minute: 0 },
      { hour: 11, minute: 0 },
      { hour: 14, minute: 0 },
      { hour: 17, minute: 0 },
      { hour: 20, minute: 0 },
    ],
  }
  // Add client businesses here as they sign up:
  // { id: 'client-abc', name: '...', fbPageId: '...', fbToken: '...', bio: '...', website: '...', notifyEmail: '...', topics: [...], postTimes: [{hour:9,minute:0}] }
];

// Topic rotation — keeps posts fresh
const TOPIC_GUIDES = {
  music:        'Promote Dominion Sound music on Spotify and Apple Music. Pick a genre (gospel, R&B, country, or Latin) and encourage fans to stream.',
  custom_song:  'Pitch custom song services. Keep it warm and personal — mention a real use case like a birthday or wedding. Include the price and website.',
  engage:       'Ask fans a fun question about music, their favorite song, or a memory tied to music. No selling — just connection.',
  release:      'Announce or remind fans about recent releases. Sound excited and genuine.',
  book_spotlight: 'Spotlight a specific children\'s book from the catalog. Mention it\'s available on Amazon at kidstorybooks.com. Warm, parent-friendly tone.',
  cookbook_spotlight: 'Spotlight a specific cookbook from the catalog. This is a cooking/recipe book, NOT a children\'s storybook — write with a food-lover, kitchen-inspired tone (mouth-watering, appetite-driving), not a storytime tone. Mention it\'s available on Amazon at kidstorybooks.com.',
  parent_tip:   'Share a fun reading tip or benefit of reading to children. Soft sell — mention kidstorybooks.com at the end.',
};

// ─── AI POST WRITER ───────────────────────────────────────────────────────────
function callAnthropicLongForm(prompt, maxTokens) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens || 2000,
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
          if (parsed.error) { reject(new Error(`Anthropic API error: ${JSON.stringify(parsed.error)}`)); return; }
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
      // If this is a book_spotlight post for Kidstorybooks, pick a real book + real Amazon cover
      let selectedItem = null;
      let extraContext = '';
      let imageUrl = null;

      if (client.id === 'dominion-sound' && (topic === 'music' || topic === 'release')) {
        selectedItem = DOMINION_SOUND_RELEASES[(dayOfYear + Math.max(slotIndex, 0)) % DOMINION_SOUND_RELEASES.length];
        extraContext = `\nFeature this specific song by name: "${selectedItem.title}". Make the post about this song specifically.`;
        imageUrl = selectedItem.cover;
      } else if (client.id === 'kidstorybooks' && topic === 'book_spotlight') {
        selectedItem = KIDSTORYBOOKS_CATALOG[(dayOfYear + Math.max(slotIndex, 0)) % KIDSTORYBOOKS_CATALOG.length];
        extraContext = `\nFeature this specific book by title: "${selectedItem.title}" (category: ${selectedItem.category}). Make the post about this book specifically — describe what a parent/child would enjoy about it.`;
        imageUrl = bookCoverUrl(selectedItem.asin);
      } else if (client.id === 'kidstorybooks' && topic === 'cookbook_spotlight') {
        selectedItem = KIDSTORYBOOKS_COOKBOOKS[(dayOfYear + Math.max(slotIndex, 0)) % KIDSTORYBOOKS_COOKBOOKS.length];
        extraContext = `\nFeature this specific cookbook by title: "${selectedItem.title}". This is a cooking/recipe book — make the post about this cookbook specifically, with food-focused, appetite-driving language, not a children's story tone.`;
        imageUrl = bookCoverUrl(selectedItem.asin);
      }

      const prompt = `Write a Facebook post for ${client.name}. 
Business: ${client.bio}
Website: ${client.website}
Today's direction: ${topicGuide}${extraContext}
Make it authentic, warm, and human.`;

      console.log(`✍ Writing post for ${client.name} (topic: ${topic}${selectedItem ? ', featuring: ' + selectedItem.title : ''})...`);
      const postText = await callAnthropic(prompt);

      if (!postText) throw new Error('Empty post from AI');
      console.log(`📝 Post: ${postText}`);

      const result = await postToFacebook(client.fbPageId, client.fbToken, postText, imageUrl);

      if (result.id) {
        console.log(`✅ Posted to ${client.name}${imageUrl ? ' (with cover art)' : ''} — Post ID: ${result.id}`);

        // Build a viewable Facebook URL and email a notification so it's easy to find & share
        const postIdOnly = result.id.includes('_') ? result.id.split('_')[1] : result.id;
        const postUrl = `https://www.facebook.com/${client.fbPageId}/posts/${postIdOnly}`;
        if (client.notifyEmail) {
          await sendPostNotification(client.notifyEmail, client.name, postText, postUrl, imageUrl);
        }
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
let lastBlogCheckDate = null; // tracks the date string of the last blog publish, prevents double-firing

// Blog publishes every Tuesday at 10:00 AM
const BLOG_PUBLISH_DAY = 2; // 0=Sunday, 1=Monday, 2=Tuesday...
const BLOG_PUBLISH_HOUR = 10;
const BLOG_PUBLISH_MINUTE = 0;

function scheduleChecker() {
  setInterval(() => {
    const now = new Date();
    const key = `${now.getHours()}:${now.getMinutes()}`;
    if (key !== lastCheckedMinute) {
      lastCheckedMinute = key;
      runPostingAgent({ hour: now.getHours(), minute: now.getMinutes() });
    }

    // Weekly blog check — independent of the per-minute post scheduler above
    const todayKey = now.toDateString();
    if (
      now.getDay() === BLOG_PUBLISH_DAY &&
      now.getHours() === BLOG_PUBLISH_HOUR &&
      now.getMinutes() === BLOG_PUBLISH_MINUTE &&
      todayKey !== lastBlogCheckDate
    ) {
      lastBlogCheckDate = todayKey;
      publishWeeklyBlogPost();
    }
  }, 30 * 1000); // check twice a minute to avoid missing the exact minute

  // Log the full schedule on startup so it's easy to verify in the logs
  console.log('Posting schedule:');
  for (const client of CLIENTS) {
    const times = client.postTimes.map(t => `${String(t.hour).padStart(2,'0')}:${String(t.minute).padStart(2,'0')}`).join(', ');
    console.log(`  ${client.name}: ${times}`);
  }
  console.log(`  Blog: Tuesdays at ${String(BLOG_PUBLISH_HOUR).padStart(2,'0')}:${String(BLOG_PUBLISH_MINUTE).padStart(2,'0')}`);
}

// ─── CUSTOMER REPLY DRAFTER (drafts a reply, holds for your approval) ───────
const pendingReplies = {}; // in-memory store: { id: { formData, draftEmail, draftSms, createdAt } }
const APPROVAL_BASE_URL = process.env.APPROVAL_BASE_URL || 'https://autopost-pro-pzds.onrender.com';

function generateReplyId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function draftCustomerReply(formData) {
  const name = formData.name || 'there';
  const business = formData.business || 'your business';

  const prompt = `You are drafting a reply on behalf of Dominion Web Design Pro, a web design service in Dallas, TX, responding to a new lead who just requested a free website preview/quote.

Customer details: Name: ${name}, Business: ${business}.

Write two things:
1. A short, warm EMAIL reply (3-4 sentences) thanking them, confirming we'll follow up within 24 hours, and mentioning we'll prepare a free preview of what their site could look like.
2. A short SMS reply (under 300 characters) with the same warm tone, more brief.

Respond in ONLY this exact format:
EMAIL: [email reply text]
SMS: [sms reply text]`;

  const response = await callAnthropicLongForm(prompt, 400);
  const emailMatch = response.match(/^EMAIL:\s*([\s\S]*?)(?=^SMS:|$)/im);
  const smsMatch = response.match(/^SMS:\s*(.+)$/im);

  return {
    draftEmail: emailMatch ? emailMatch[1].trim() : '',
    draftSms: smsMatch ? smsMatch[1].trim() : '',
  };
}

async function notifyDraftForApproval(replyId, formData, draft) {
  const approveUrl = `${APPROVAL_BASE_URL}/approve-reply?id=${replyId}`;
  const rejectUrl = `${APPROVAL_BASE_URL}/reject-reply?id=${replyId}`;

  // Send via email (richer formatting, includes clickable approve button)
  try {
    const html = `
      <div style="font-family:sans-serif;max-width:480px">
        <h3>New lead: ${formData.name || 'Unknown'} (${formData.business || 'No business listed'})</h3>
        <p><strong>Draft email reply:</strong></p>
        <p style="background:#f5f5f5;padding:12px;border-radius:6px">${draft.draftEmail}</p>
        <p><strong>Draft SMS reply:</strong></p>
        <p style="background:#f5f5f5;padding:12px;border-radius:6px">${draft.draftSms}</p>
        <a href="${approveUrl}" style="background:#c9a84c;color:#000;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600;margin-right:10px">✅ Approve & Send</a>
        <a href="${rejectUrl}" style="background:#888;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:600">❌ Discard</a>
      </div>
    `;
    await sendEmail(EMAIL_USER, `Approve reply to ${formData.name || 'new lead'}?`, html);
    console.log(`📧 Draft reply sent for approval (ID: ${replyId})`);
  } catch (err) {
    console.error('⚠ Failed to send draft approval email:', err.message);
  }

  // Also text a short approval notice if Twilio is configured
  if (twilioClient && TWILIO_FROM_NUMBER && NOTIFY_PHONE_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: `New lead from ${formData.name || 'someone'}. A reply draft is ready — check your email to approve & send.`,
        from: TWILIO_FROM_NUMBER,
        to: NOTIFY_PHONE_NUMBER,
      });
    } catch (err) {
      console.error('⚠ Failed to send approval SMS notice:', err.message);
    }
  }
}

async function sendApprovedReply(replyId) {
  const pending = pendingReplies[replyId];
  if (!pending) return { ok: false, message: 'Reply not found or already handled.' };

  const { formData, draftEmail, draftSms } = pending;

  // Send email to the customer, if we have their email
  if (formData.email) {
    try {
      const htmlBody = `<div style="font-family:sans-serif;white-space:pre-wrap">${draftEmail}</div>`;
      await sendEmail(formData.email, `Thanks for reaching out, ${formData.name || ''}!`, htmlBody);
    } catch (err) {
      console.error('⚠ Failed to send approved email to customer:', err.message);
    }
  }

  // Send SMS to the customer, if we have their phone
  if (formData.phone && twilioClient && TWILIO_FROM_NUMBER) {
    try {
      await twilioClient.messages.create({
        body: draftSms,
        from: TWILIO_FROM_NUMBER,
        to: formData.phone,
      });
    } catch (err) {
      console.error('⚠ Failed to send approved SMS to customer:', err.message);
    }
  }

  delete pendingReplies[replyId];
  return { ok: true, message: 'Reply sent to customer.' };
}


// ─── HTTP SERVER (keeps Render.com free tier alive) ───────────────────────────
const http = require('http');

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch(e) { resolve({}); } // tolerate malformed/empty bodies
    });
    req.on('error', reject);
  });
}

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/run' && req.method === 'POST') {
    runPostingAgent();
    res.end(JSON.stringify({ status: 'running' }));

  } else if (req.url === '/run-blog' && req.method === 'POST') {
    publishWeeklyBlogPost();
    res.end(JSON.stringify({ status: 'publishing blog post' }));

  } else if (req.url === '/lead' && req.method === 'POST') {
    readJsonBody(req).then(async formData => {
      console.log(`📩 New lead received:`, JSON.stringify(formData));
      sendLeadSms(formData); // existing instant notification to you

      try {
        const draft = await draftCustomerReply(formData);
        const replyId = generateReplyId();
        pendingReplies[replyId] = { formData, draftEmail: draft.draftEmail, draftSms: draft.draftSms, createdAt: Date.now() };
        await notifyDraftForApproval(replyId, formData, draft);
      } catch (err) {
        console.error('⚠ Failed to draft customer reply:', err.message);
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'received' }));
    });

  } else if (req.url.startsWith('/approve-reply') && req.method === 'GET') {
    const replyId = new URL(req.url, 'http://x').searchParams.get('id');
    sendApprovedReply(replyId).then(result => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>${result.ok ? '✅ Sent!' : '⚠ ' + result.message}</h2></body></html>`);
    });

  } else if (req.url.startsWith('/reject-reply') && req.method === 'GET') {
    const replyId = new URL(req.url, 'http://x').searchParams.get('id');
    delete pendingReplies[replyId];
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<html><body style="font-family:sans-serif;text-align:center;padding:60px"><h2>Reply discarded.</h2></body></html>`);

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
