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
  },
  {
    name: 'Houston Power Washing Pro',
    slug: 'houston-wash',
    city: 'Houston',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'houston-powerwashing-pro',
    blog_path: 'blog',
    domain: 'houston-powerwashing-pro.netlify.app',
    topics: [
      'how often should you pressure wash your house',
      'signs your driveway needs professional cleaning',
      'pressure washing vs soft washing what is the difference',
      'how power washing protects your home value',
      'best time of year to pressure wash in {city}',
      'why DIY pressure washing damages siding',
      'how much does pressure washing cost in {city}',
      'removing oil stains from concrete driveways',
      'roof soft washing and why bleach damages shingles',
      'how clean exterior surfaces prevent costly repairs'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free power washing quote — call eight three two, six six two, four one zero seven',
    color: '#00c6ff'
  },
  {
    name: 'Houston HVAC Pro',
    slug: 'houston-hvac',
    city: 'Houston',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'houston-hvac-pro',
    blog_path: 'blog',
    domain: 'stirring-gumdrop-4e30a6.netlify.app',
    topics: [
      'why your AC is running but not cooling',
      'how often should you replace your air filter',
      'signs your air conditioner needs repair not replacement',
      'how much does AC replacement cost in {city}',
      'what SEER rating means and which one you need',
      'why AC units fail in {city} summer heat',
      'emergency AC repair what to do while you wait',
      'how annual HVAC maintenance cuts your power bill',
      'heat pump vs traditional AC which is better',
      'how to size an air conditioner for your home'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free AC repair quote today',
    color: '#e63946'
  },
  {
    name: 'Houston Roofing Pro',
    slug: 'houston-roofing',
    city: 'Houston',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'houston-roofing-pro',
    blog_path: 'blog',
    domain: 'delicate-bavarois-59069c.netlify.app',
    topics: [
      'how to spot hail damage on your roof',
      'signs you need a new roof not a repair',
      'how much does roof replacement cost in {city}',
      'does insurance cover storm damage to your roof',
      'metal roofing vs asphalt shingles which lasts longer',
      'how long does a roof last in {city} weather',
      'what to do after a storm damages your roof',
      'how to choose a roofing contractor you can trust',
      'why roof leaks get expensive when ignored',
      'free roof inspections what they should include'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free roof inspection today',
    color: '#2b6cb0'
  },
  {
    name: 'Dallas Power Washing Pro',
    slug: 'dallas-wash',
    city: 'Dallas',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dallas-powerwashing-pro',
    blog_path: 'blog',
    domain: 'dallaspowerwashingpro.com',
    topics: [
      'how often should you pressure wash your house',
      'signs your driveway needs professional cleaning',
      'pressure washing vs soft washing what is the difference',
      'how power washing protects your home value',
      'best time of year to pressure wash in {city}',
      'why DIY pressure washing damages siding',
      'how much does pressure washing cost in {city}',
      'removing oil stains from concrete driveways',
      'roof soft washing and why bleach damages shingles',
      'how clean exterior surfaces prevent costly repairs'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free power washing quote today',
    color: '#00c6ff'
  },
  {
    name: 'Dallas HVAC Pro',
    slug: 'dallas-hvac',
    city: 'Dallas',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dallas-hvac-pro',
    blog_path: 'blog',
    domain: 'dallasairandheating.com',
    topics: [
      'why your AC is running but not cooling',
      'how often should you replace your air filter',
      'signs your air conditioner needs repair not replacement',
      'how much does AC replacement cost in {city}',
      'what SEER rating means and which one you need',
      'why AC units fail in {city} summer heat',
      'emergency AC repair what to do while you wait',
      'how annual HVAC maintenance cuts your power bill',
      'heat pump vs traditional AC which is better',
      'how to size an air conditioner for your home'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free AC repair quote today',
    color: '#e63946'
  },
  {
    name: 'Dallas Roofing Pro',
    slug: 'dallas-roofing',
    city: 'Dallas',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dallas-roofing-pro',
    blog_path: 'blog',
    domain: 'dfwexpertroofers.com',
    topics: [
      'how to spot hail damage on your roof',
      'signs you need a new roof not a repair',
      'how much does roof replacement cost in {city}',
      'does insurance cover storm damage to your roof',
      'metal roofing vs asphalt shingles which lasts longer',
      'how long does a roof last in {city} weather',
      'what to do after a storm damages your roof',
      'how to choose a roofing contractor you can trust',
      'why roof leaks get expensive when ignored',
      'free roof inspections what they should include'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free roof inspection today',
    color: '#2b6cb0'
  },
  {
    name: 'Phoenix Pool Cleaning Pro',
    slug: 'phoenix-pool',
    city: 'Phoenix',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'phoenix-pool-cleaning-pro',
    blog_path: 'blog',
    domain: 'superlative-mandazi-aa17b9.netlify.app',
    topics: [
      'how often should a pool be cleaned in {city}',
      'why your pool turns green and how to fix it',
      'pool chemical balancing explained simply',
      'how desert heat and dust affect pool chemistry',
      'signs your pool pump is about to fail',
      'how much does weekly pool service cost in {city}',
      'saltwater vs chlorine pools which is easier to maintain',
      'how to keep algae out of a pool in summer',
      'pool equipment repairs you should never DIY',
      'what weekly pool service actually includes'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free pool cleaning quote — service from $99 a month',
    color: '#0ea5e9'
  },
  {
    name: 'Tucson Pool Cleaning Pro',
    slug: 'tucson-pool',
    city: 'Tucson',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'tucson-pool-cleaning-pro',
    blog_path: 'blog',
    domain: 'superb-cendol-81e0e8.netlify.app',
    topics: [
      'how often should a pool be cleaned in {city}',
      'why your pool turns green and how to fix it',
      'pool chemical balancing explained simply',
      'how desert heat and dust affect pool chemistry',
      'signs your pool pump is about to fail',
      'how much does weekly pool service cost in {city}',
      'saltwater vs chlorine pools which is easier to maintain',
      'how to keep algae out of a pool in summer',
      'pool equipment repairs you should never DIY',
      'what weekly pool service actually includes'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free pool cleaning quote — service from $99 a month',
    color: '#e07040'
  },
  {
    name: 'Yuma Pool Cleaning Pro',
    slug: 'yuma-pool',
    city: 'Yuma',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'arizona-pool-cleaning-pro',
    blog_path: 'blog',
    domain: 'majestic-youtiao-97786f.netlify.app',
    topics: [
      'how often should a pool be cleaned in {city}',
      'why your pool turns green and how to fix it',
      'pool chemical balancing explained simply',
      'how desert heat and dust affect pool chemistry',
      'signs your pool pump is about to fail',
      'how much does weekly pool service cost in {city}',
      'saltwater vs chlorine pools which is easier to maintain',
      'how to keep algae out of a pool in summer',
      'pool equipment repairs you should never DIY',
      'what weekly pool service actually includes'
    ],
    style: 'practical, homeowner-focused, local',
    cta: 'Get a free pool cleaning quote — service from $99 a month',
    color: '#0d9488'
  },
  {
    name: 'Dominion Hard Money',
    slug: 'hard-money',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dominion-hard-money',
    blog_path: 'blog',
    domain: 'dominionhardmoney.com',
    topics: [
      'what is a hard money loan and who uses one',
      'hard money vs conventional financing for investors',
      'how fast can you close on a fix and flip loan',
      'what lenders look for in a fix and flip deal',
      'DSCR rental loans explained for first time investors',
      'how to calculate ARV and maximum allowable offer',
      'bridge loans when you need to move fast',
      'common reasons hard money deals fall through',
      'how much down payment do hard money lenders require',
      'building a relationship with a private lender'
    ],
    style: 'authoritative, investor-focused, plain-spoken',
    cta: 'Get your deal reviewed at dominionhardmoney.com',
    color: '#c9a84c'
  },
  {
    name: 'Dominion Review Pro',
    slug: 'review-pro',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dominionreviewpro-site',
    blog_path: 'blog',
    domain: 'dominionreviewpro.com',
    topics: [
      'how online reviews affect local search rankings',
      'how to ask customers for reviews without being pushy',
      'what to do about a bad review',
      'why review count matters more than perfect ratings',
      'how many reviews does a local business actually need',
      'responding to reviews and why it matters to Google',
      'automating review requests after every job',
      'review sites that matter most for local business',
      'how reviews influence buying decisions',
      'turning happy customers into repeat referrals'
    ],
    style: 'helpful, reputation-focused, practical',
    cta: 'Start collecting more reviews at dominionreviewpro.com',
    color: '#38a169'
  },
  {
    name: 'Dominion Local Business Directory',
    slug: 'directory',
    repo_owner: 'dominionsoundmusic-create',
    repo_name: 'dominionlocalbusinessdirectory-site',
    blog_path: 'blog',
    domain: 'dominionlocalbusinessdirectory.com',
    topics: [
      'why local business listings still matter for SEO',
      'how to claim and optimize your business listing',
      'NAP consistency and why it affects your rankings',
      'how customers actually find local businesses online',
      'directory listings vs Google Business Profile',
      'how to write a business description that converts',
      'local citations explained for small business owners',
      'why inconsistent business info costs you customers',
      'how to show up in near me searches',
      'building local authority one listing at a time'
    ],
    style: 'informative, SEO-focused, accessible',
    cta: 'List your business free at dominionlocalbusinessdirectory.com',
    color: '#805ad5'
  }
];

// Generate a blog post using Claude API
async function generateBlogPost(brand, topic) {
  const year = new Date().getFullYear();
  const resolvedTopic = topic.replace('{year}', year).replace('{industry}', 'local').replace('{city}', brand.city || 'your area');

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
    timeout: 120000,
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
  const title = topic.replace('{year}', year).replace('{industry}', 'Local').replace('{city}', brand.city || 'Your Area');
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

// List the topic slugs a brand has already published, so we never repeat one.
async function listPublishedSlugs(brand) {
  try {
    const res = await axios.get(
      `https://api.github.com/repos/${brand.repo_owner}/${brand.repo_name}/contents/${brand.blog_path}`,
      { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' } }
    );
    // drop the -<timestamp> suffix so repeats of one topic collapse together
    return res.data
      .filter(f => f.name.endsWith('.html') && f.name !== 'index.html')
      .map(f => f.name.replace(/\.html$/, '').replace(/-\d{10,}$/, ''));
  } catch (e) {
    console.log('  (could not read existing posts — falling back to random)');
    return null;
  }
}

// Generate and publish one blog post for a brand
async function publishBlogPost(brand) {
  console.log(`\n📝 Generating blog post for ${brand.name}...`);

  // Pick a topic this brand has NOT published yet. Picking at random with no
  // memory of past posts is what produced duplicate posts on separate URLs.
  const year = new Date().getFullYear();
  const resolve = t => t.replace('{year}', year).replace('{industry}', 'Local').replace('{city}', brand.city || 'Your Area');
  const published = await listPublishedSlugs(brand);
  let topic;
  if (published === null) {
    topic = brand.topics[Math.floor(Math.random() * brand.topics.length)];
  } else {
    const unused = brand.topics.filter(t => !published.includes(slugify(resolve(t))));
    if (!unused.length) {
      console.log(`  every topic already published for ${brand.name} — skipping rather than duplicating`);
      return { success: false, skipped: true, brand: brand.name, reason: 'all topics published' };
    }
    topic = unused[Math.floor(Math.random() * unused.length)];
    console.log(`  ${unused.length} of ${brand.topics.length} topics still unpublished`);
  }
  console.log(`Topic: ${resolve(topic)}`);

  // Generate content
  const content = await generateBlogPost(brand, topic);
  const resolvedTopic = resolve(topic);
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

// Keep alive ping to prevent Render free tier spin-down
setInterval(async () => {
    try {
          await axios.get(`http://localhost:${process.env.PORT || 3001}/status`);
    } catch(e) {}
}, 840000);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n📝 Dominion Blog Generator running on port ${PORT}`);
  console.log(`Brands: ${BRANDS.map(b => b.slug).join(', ')}`);
});
