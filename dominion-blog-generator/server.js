require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const app = express();
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

// All Dominion brands and their blog configs
const BRANDS = [
  {
    name: 'Dominion Web Design Pro',
    slug: 'web-design',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dominionwebdesignpro-site',
    blog_path: 'blog',
    domain: 'dominionwebdesignpro.com',
    topics: [
      'why small businesses need a website in {year}',
      'how to get more customers with local SEO',
      'website mistakes small businesses make',
      'how much does a website cost for a small business',
      'why your competitor is getting more calls than you',
      'best website design tips for {industry} businesses',
      'how to rank on Google in your city',
      'why mobile-friendly websites matter for local business',
      'signs your website needs a redesign',
      'how a website pays for itself with one new customer'
    ],
    style: 'professional, helpful, local-business focused',
    cta: 'Get a professional website starting at $497 at dominionwebdesignpro.com',
    color: '#c9a84c'
  },
  {
    name: 'AI Voice Agent Pros',
    slug: 'ai-voice',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'aivoiceagentpros-site',
    blog_path: 'blog',
    domain: 'aivoiceagentpros.com',
    topics: [
      'how AI receptionists are replacing answering services',
      'never miss a customer call again with AI voice agents',
      'how {industry} businesses use AI to book more appointments',
      'the true cost of missed calls for small businesses',
      'AI vs human receptionist which is better for your business',
      'how voice AI works and why it sounds so real',
      'after hours call handling with AI voice agents',
      'how to set up an AI receptionist for your business',
      'AI voice agents for {industry} businesses',
      'why customers prefer calling over texting for appointments'
    ],
    style: 'tech-forward, benefit-focused, conversational',
    cta: 'Start your free 2-week trial at aivoiceagentpros.com',
    color: '#3a7bd5'
  },
  {
    name: 'Dominion Solar Pro',
    slug: 'solar',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dominionsolarpro-site',
    blog_path: 'blog',
    domain: 'dominionsolarpro.com',
    topics: [
      'best portable solar generator for camping in {year}',
      'how to choose the right portable power station',
      'solar generator vs gas generator which is better',
      'best solar generator for home backup power',
      'jackery vs other solar generator brands compared',
      'how long does a portable solar generator last',
      'best solar generator for RV living',
      'off grid living with portable solar power',
      'how many watts do you need for home backup',
      'best portable solar panels for camping and hiking'
    ],
    style: 'outdoor enthusiast, practical, product-review style',
    cta: 'Shop the best deals on Jackery solar generators at dominionsolarpro.com',
    color: '#2d6a2d'
  },
  {
    name: 'Dominion Sound Music',
    slug: 'music',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dominionsoundmusic-site',
    blog_path: 'blog',
    domain: 'dominionSoundmusic.com',
    topics: [
      'how to order a custom memorial song for a loved one',
      'the perfect custom wedding song for your first dance',
      'why a custom birthday song is the best gift',
      'gospel music that heals the soul',
      'how independent artists release music in {year}',
      'the story behind Dominion Sound music',
      'custom business jingles that customers remember',
      'best gifts for music lovers',
      'how music helps with grief and healing',
      'neo soul and gospel music the perfect blend'
    ],
    style: 'warm, soulful, personal, storytelling',
    cta: 'Order a custom song or stream our music at dominionSoundmusic.com',
    color: '#8b5cf6'
  },
  {
    name: 'Kid Story Books',
    slug: 'kids-books',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'kidstorybooks-site',
    blog_path: 'blog',
    domain: 'kidstorybooks.com',
    topics: [
      'best children books for bedtime reading',
      'how reading to your child every day changes their life',
      'funny children books that make parents laugh too',
      'educational books for kids ages 3 to 8',
      'how to get your child excited about reading',
      'best cookbook for families with kids',
      'children books that teach important life lessons',
      'how storytelling builds imagination in children',
      'books every child should read before age 10',
      'the best gifts for kids who love to read'
    ],
    style: 'warm, family-friendly, encouraging, parent-focused',
    cta: 'Browse 200+ children books and cookbooks at kidstorybooks.com',
    color: '#f59e0b'
  },
  {
    name: 'Dominion AI Agency',
    slug: 'ai-agency',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dominionaiagency-site',
    blog_path: 'blog',
    domain: 'dominionaiagency.com',
    topics: [
      'how AI is changing small business marketing in {year}',
      'what is an AI agency and why your business needs one',
      'how to automate your business with AI tools',
      'AI marketing vs traditional marketing which wins',
      'how small businesses compete with big companies using AI',
      'the best AI tools for small business owners',
      'how to use AI to generate leads for your business',
      'AI chatbots vs AI voice agents which do you need',
      'how to scale your business without hiring more staff',
      'the future of AI in local business marketing'
    ],
    style: 'authoritative, forward-thinking, business-focused',
    cta: 'Get your free AI strategy session at dominionaiagency.com',
    color: '#e53e3e'
  }
];

// Generate a blog post using Claude API
async function generateBlogPost(brand, topic) {
  const year = new Date().getFullYear();
  const resolvedTopic = topic.replace('{year}', year).replace('{industry}', 'local');

  const prompt = `Write a complete SEO-optimized blog post for ${brand.name} about: "${resolvedTopic}"

Style: ${brand.style}
Domain: ${brand.domain}
CTA at the end: ${brand.cta}

Requirements:
- Write in HTML format ready to embed in a page
- Include an H1 title, introduction, 4-6 sections with H2 headings, and conclusion
- 800-1200 words total
- Include the CTA as a styled button/section at the end
- Make it genuinely helpful and informative
- Include relevant keywords naturally throughout
- Do NOT include DOCTYPE, html, head, or body tags - just the article content HTML
- Start with: <article class="blog-post">
- End with: </article>

Write the full blog post now:`;

  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  }, {
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json'
    }
  });

  return response.data.content[0].text;
}

// Create full HTML page for the blog post
function wrapBlogPost(brand, topic, content, slug) {
  const year = new Date().getFullYear();
  const title = topic.replace('{year}', year).replace('{industry}', 'Local');
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | ${brand.name}</title>
<meta name="description" content="${title} - Expert insights from ${brand.name}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://${brand.domain}/blog/${slug}.html">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;background:#fff;line-height:1.7;}
header{background:#0a0a0a;color:#fff;padding:16px 24px;}
header h1{font-size:1.2rem;font-weight:800;color:${brand.color};}
.hero{background:#f9f9f9;border-bottom:3px solid ${brand.color};padding:40px 24px;}
.hero h2{font-size:2rem;font-weight:800;max-width:800px;margin:0 auto 12px;}
.hero .meta{color:#888;font-size:.9rem;max-width:800px;margin:0 auto;}
.content{max-width:800px;margin:0 auto;padding:40px 24px;}
.content h1{font-size:1.8rem;font-weight:800;color:#0a0a0a;margin-bottom:16px;}
.content h2{font-size:1.4rem;font-weight:700;color:#0a0a0a;margin:32px 0 12px;}
.content p{margin-bottom:16px;font-size:1rem;color:#333;}
.content ul,.content ol{margin:0 0 16px 24px;}
.content li{margin-bottom:8px;}
.cta-box{background:${brand.color};color:#fff;padding:32px;border-radius:10px;text-align:center;margin:40px 0;}
.cta-box h3{font-size:1.4rem;font-weight:800;margin-bottom:12px;}
.cta-box a{display:inline-block;background:#fff;color:#0a0a0a;font-weight:700;padding:12px 28px;border-radius:6px;text-decoration:none;margin-top:12px;}
.back{display:inline-block;margin-bottom:24px;color:${brand.color};font-weight:600;text-decoration:none;}
footer{background:#0a0a0a;color:#aaa;text-align:center;padding:20px;font-size:.85rem;}
</style>
</head>
<body>
<header><h1>${brand.name}</h1></header>
<div class="hero">
<h2>${title}</h2>
<div class="meta">Published ${date} &bull; ${brand.name}</div>
</div>
<div class="content">
<a href="/blog" class="back">← Back to Blog</a>
${content}
</div>
<footer><p>&copy; ${year} ${brand.name} | <a href="https://${brand.domain}" style="color:${brand.color};">${brand.domain}</a></p></footer>
</body>
</html>`;
}

// Slugify a topic title
function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Commit file to GitHub
async function commitToGitHub(owner, repo, path, content, message) {
  try {
    // Check if file exists
    let sha = null;
    try {
      const existing = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
      );
      sha = existing.data.sha;
    } catch (e) { /* file doesn't exist yet */ }

    const payload = {
      message,
      content: Buffer.from(content).toString('base64'),
      branch: 'main'
    };
    if (sha) payload.sha = sha;

    await axios.put(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      payload,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' } }
    );
    return true;
  } catch (err) {
    console.error('GitHub commit error:', err.response?.data || err.message);
    return false;
  }
}

// Generate and publish one blog post for a brand
async function publishBlogPost(brand) {
  console.log(`\n📝 Generating blog post for ${brand.name}...`);

  // Pick a random topic
  const topic = brand.topics[Math.floor(Math.random() * brand.topics.length)];
  console.log(`Topic: ${topic}`);

  // Generate content
  const content = await generateBlogPost(brand, topic);
  const year = new Date().getFullYear();
  const resolvedTopic = topic.replace('{year}', year).replace('{industry}', 'Local');
  const slug = slugify(resolvedTopic) + '-' + Date.now();

  // Wrap in full HTML page
  const html = wrapBlogPost(brand, topic, content, slug);

  // Commit to GitHub
  const path = `${brand.blog_path}/${slug}.html`;
  const committed = await commitToGitHub(
    brand.repo_owner,
    brand.repo_name,
    path,
    html,
    `Add blog post: ${resolvedTopic}`
  );

  if (committed) {
    console.log(`✅ Published: ${resolvedTopic} → ${brand.domain}/${path}`);
    return { success: true, brand: brand.name, topic: resolvedTopic, path, url: `https://${brand.domain}/${path}` };
  } else {
    console.log(`❌ Failed to publish for ${brand.name}`);
    return { success: false, brand: brand.name, topic: resolvedTopic };
  }
}

// Run all brands
async function runAllBlogs() {
  console.log('\n🚀 Blog generator started:', new Date().toLocaleString());
  const results = [];
  for (const brand of BRANDS) {
    try {
      const result = await publishBlogPost(brand);
      results.push(result);
      await new Promise(r => setTimeout(r, 3000)); // pause between brands
    } catch (err) {
      console.error(`Error for ${brand.name}:`, err.message);
      results.push({ success: false, brand: brand.name, error: err.message });
    }
  }
  console.log('\n✅ Blog generation complete');
  return results;
}

// Run one specific brand
async function runOneBrand(brandSlug) {
  const brand = BRANDS.find(b => b.slug === brandSlug);
  if (!brand) return { error: 'Brand not found' };
  return await publishBlogPost(brand);
}

// ── ROUTES ──────────────────────────────────────────────────────────────────

app.get('/', (req, res) => {
  res.json({
    service: 'Dominion Blog Generator',
    status: 'running',
    brands: BRANDS.map(b => ({ name: b.name, slug: b.slug, domain: b.domain })),
    endpoints: {
      'POST /run-all': 'Generate blog post for all 6 brands',
      'POST /run/:slug': 'Generate blog post for one brand (e.g. /run/web-design)',
      'GET /brands': 'List all brands',
      'GET /status': 'Check service status'
    }
  });
});

app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    anthropic: !!ANTHROPIC_API_KEY,
    github: !!GITHUB_TOKEN,
    brands: BRANDS.length
  });
});

app.get('/brands', (req, res) => {
  res.json(BRANDS.map(b => ({ name: b.name, slug: b.slug, domain: b.domain, topics: b.topics.length })));
});

app.post('/run-all', async (req, res) => {
  res.json({ success: true, message: 'Blog generation started for all brands' });
  runAllBlogs();
});

app.post('/run/:slug', async (req, res) => {
  const { slug } = req.params;
  res.json({ success: true, message: `Blog generation started for ${slug}` });
  runOneBrand(slug);
});

// Schedule: run all blogs every day at 7am CST
cron.schedule('0 7 * * *', () => {
  console.log('⏰ Daily blog generation triggered');
  runAllBlogs();
}, { timezone: 'America/Chicago' });

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n📝 Dominion Blog Generator running on port ${PORT}`);
  console.log(`Brands: ${BRANDS.map(b => b.slug).join(', ')}`);
});
