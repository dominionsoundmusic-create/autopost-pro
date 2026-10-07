// Playbook-style demo page (Oct 7 2026). Maurice asked for the free demo from
// dominionwebdesignpro.com/demo.html to look like the hand-built playbook demos
// (dominion-demos: Blue Thumb Pool Care, All About Lawns, Limitless Premier):
// dark sticky header, full-bleed hero with fade, highlight tiles, photo service
// cards, a section per service, a "How it works" colour break, about split,
// a second colour break for reviews, FAQ, dark call section, full footer.
//
// Rules carried over from the generator: never invent facts, never write a
// review, no em or en dashes in visible copy. Reviews are clearly marked as a
// placeholder for the owner's real Google reviews. No rating badge.

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/[\u2014\u2013]/g, ', ')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hexToRgb(h) {
  const m = String(h || '').replace('#', '').match(/^([0-9a-f]{6})$/i);
  if (!m) return [20, 40, 70];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function shade(h, f) { // f < 1 darkens, f > 1 lightens toward white
  const [r, g, b] = hexToRgb(h);
  if (f <= 1) return rgbToHex(r * f, g * f, b * f);
  const t = f - 1;
  return rgbToHex(r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t);
}
function hue(h) {
  let [r, g, b] = hexToRgb(h).map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  let x = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (x * 60 + 360) % 360;
}

// Two bold colour breaks between white sections: the brand's own mid colour,
// then a contrasting one that suits it (warm bark for cool palettes, navy for warm).
function palette(hero) {
  const c1 = hero.c1 || '#0A1628', c2 = hero.c2 || '#1565C0';
  const h = hue(c2);
  const cool = h >= 150 && h <= 280;
  return {
    dark: shade(c1, 1) === '#000000' ? '#111827' : c1,
    dark2: shade(c2, 0.7),
    deep: shade(c1, 0.6),
    call: hero.accent || '#FFC23D',
    callh: shade(hero.accent || '#FFC23D', 1.25),
    link: shade(c2, 0.85),
    tint: shade(c2, 1.92),
    line: shade(c2, 1.78),
    break1: c2,
    break2: cool ? '#8a4a16' : '#16325c'
  };
}

const CSS = `
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:Inter,"Segoe UI",Roboto,Arial,sans-serif;font-size:1.0625rem;line-height:1.7;color:#18222f;background:#fff;overflow-x:hidden}
img{max-width:100%;height:auto;display:block}
a{color:var(--link)}
h1,h2,h3{line-height:1.18;color:var(--dark);margin:0 0 .55em;font-weight:800;letter-spacing:-.015em}
h1{font-size:clamp(2.2rem,5vw,3.6rem)}h2{font-size:clamp(1.6rem,3.2vw,2.3rem)}h3{font-size:1.18rem}
p{margin:0 0 1.1em}
.sample-bar{background:#111;color:#f2f2f2;text-align:center;font-size:.85rem;padding:7px 16px;line-height:1.4}
.col{max-width:860px;margin:0 auto;padding:0 clamp(18px,4vw,32px)}
.wide{max-width:1280px;margin:0 auto;padding:0 clamp(18px,5.5vw,120px)}
.band{padding:clamp(56px,7vw,96px) 0}
.lead{font-size:1.15rem;color:#4a5868}
.head{max-width:760px;margin:0 auto 36px;text-align:center}
.btn{display:inline-flex;align-items:center;justify-content:center;font-weight:800;text-decoration:none;padding:14px 26px;border-radius:999px;border:2px solid transparent;min-height:48px}
.btn-call{background:var(--call);color:var(--deep)}
.btn-ghost{background:rgba(0,0,0,.25);color:#fff;border-color:rgba(255,255,255,.85)}
.btn-dark{background:var(--dark);color:#fff}
.btn-sm{padding:9px 18px;min-height:42px;font-size:.95rem}
.btn-row{display:flex;flex-wrap:wrap;gap:12px}
header{background:var(--dark);position:sticky;top:0;z-index:50;box-shadow:0 2px 14px rgba(0,0,0,.25)}
.hdr{padding:0 clamp(14px,5.5vw,120px);min-height:74px;display:flex;align-items:center;gap:18px}
.logo{display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:800;font-size:1.15rem;text-decoration:none;min-width:0}
.logo span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mark{flex:0 0 auto;display:inline-flex;width:42px;height:42px;border-radius:50%;background:var(--call);align-items:center;justify-content:center;font-size:1.2rem}
nav{margin-left:auto}nav ul{list-style:none;margin:0;padding:0;display:flex;gap:4px}
nav a{display:block;color:#eef3f8;text-decoration:none;font-weight:600;font-size:.97rem;padding:10px 12px}
@media(max-width:1060px){nav{display:none}.hdr .btn{margin-left:auto}}
@media(max-width:560px){.logo{font-size:.98rem}.mark{width:34px;height:34px;font-size:1rem}.hdr .btn .long{display:none}}
@media(min-width:561px){.hdr .btn .short{display:none}}
.hero{position:relative;isolation:isolate;display:flex;align-items:center;min-height:min(calc(100vh - 104px),780px);color:#fff;background:var(--deep);overflow:hidden}
.hero>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-2}
.fade{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(0,0,0,.82) 0%,rgba(0,0,0,.62) 40%,rgba(0,0,0,.2) 75%,rgba(0,0,0,.05) 100%),linear-gradient(0deg,rgba(0,0,0,.5) 0%,rgba(0,0,0,0) 40%)}
.hero-in{width:100%;padding:clamp(56px,9vw,120px) clamp(18px,5.5vw,120px) clamp(96px,11vw,150px)}
.hero h1{color:#fff;max-width:17ch;text-shadow:0 2px 18px rgba(0,0,0,.4)}
.hero-lead{font-size:clamp(1.08rem,1.7vw,1.28rem);max-width:54ch;color:#f1f5f9;margin-bottom:28px;text-shadow:0 1px 10px rgba(0,0,0,.5)}
.hero-note{margin:20px 0 0;font-size:.95rem;color:#dfe6ee}
@media(max-width:700px){.fade{background:linear-gradient(0deg,rgba(0,0,0,.86) 0%,rgba(0,0,0,.66) 60%,rgba(0,0,0,.5) 100%)}.hero{min-height:0}.hero .btn{flex:1 1 100%}}
.tiles-wrap{margin-top:-56px;position:relative;z-index:2}
.tiles{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.tiles li{background:#fff;border-radius:12px;box-shadow:0 12px 32px rgba(10,30,50,.16);padding:20px 22px;border:1px solid var(--line);border-top:5px solid var(--call);color:#4a5868;font-size:.95rem}
.tiles strong{display:block;color:var(--dark);font-size:1.1rem}
@media(max-width:960px){.tiles{grid-template-columns:1fr 1fr}}@media(max-width:480px){.tiles{grid-template-columns:1fr}}
.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
@media(max-width:1000px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.cards{grid-template-columns:1fr}}
.card{background:#fff;border:2px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;text-decoration:none;color:inherit;box-shadow:0 4px 14px rgba(10,30,50,.07)}
.card img{aspect-ratio:16/10;object-fit:cover;width:100%}
.card div{padding:18px 22px 22px;border-top:4px solid var(--call)}
.card h3{margin:0 0 6px}.card p{margin:0;color:#334155;font-size:.98rem}
.card .more{display:inline-block;margin-top:10px;font-weight:700;color:var(--link)}
.svc{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,64px);align-items:center;padding:clamp(28px,4vw,48px) 0;border-top:1px solid var(--line)}
.svc:first-of-type{border-top:0}
.svc:nth-of-type(even) figure{order:2}
.svc figure,.split figure{margin:0;border-radius:12px;overflow:hidden;box-shadow:0 12px 32px rgba(10,30,50,.16)}
.svc figure img,.split figure img{width:100%;aspect-ratio:4/3;object-fit:cover}
@media(max-width:860px){.svc{grid-template-columns:1fr}.svc:nth-of-type(even) figure{order:0}}
.b1{background:var(--break1);color:#fff}.b2{background:var(--break2);color:#fff}.bd{background:var(--dark);color:#e8eef5}
.b1 h2,.b2 h2,.bd h2{color:#fff}.b1 .lead,.b2 .lead{color:#eef3f8}
.how{list-style:none;counter-reset:h;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.how li{counter-increment:h;background:#fff;color:#4a5868;border-radius:12px;padding:24px;font-size:.98rem}
.how li::before{content:counter(h);display:inline-flex;width:40px;height:40px;border-radius:50%;background:var(--call);color:var(--deep);font-weight:800;align-items:center;justify-content:center;margin-bottom:12px}
.how strong{display:block;color:var(--dark);font-size:1.08rem;margin-bottom:4px}
@media(max-width:960px){.how{grid-template-columns:1fr 1fr}}@media(max-width:520px){.how{grid-template-columns:1fr}}
.split{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(28px,5vw,64px);align-items:center}
@media(max-width:860px){.split{grid-template-columns:1fr}}
.why{list-style:none;padding:0;margin:0 0 24px}.why li{padding-left:30px;position:relative;margin-bottom:12px}
.why li::before{content:"";position:absolute;left:4px;top:.45em;width:8px;height:14px;border-right:3px solid var(--link);border-bottom:3px solid var(--link);transform:rotate(45deg)}
.why strong{color:var(--dark)}
.reviews{display:grid;grid-template-columns:1fr 1fr;gap:22px}@media(max-width:760px){.reviews{grid-template-columns:1fr}}
.review{background:#fff;color:#4a5868;border-radius:12px;padding:24px 26px;border:2px dashed #c3ccd8}
.review strong{display:block;color:var(--dark);margin-bottom:6px}
.faq{display:grid;gap:12px;margin-top:22px}
details{background:#fff;border:2px solid var(--line);border-left:5px solid var(--call);border-radius:12px}
summary{list-style:none;cursor:pointer;padding:18px 58px 18px 22px;position:relative;font-weight:700;color:var(--dark)}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";position:absolute;right:18px;top:50%;transform:translateY(-50%);width:30px;height:30px;border-radius:50%;background:var(--tint);display:flex;align-items:center;justify-content:center;font-weight:800}
details[open] summary::after{content:"\\2212"}
details p{padding:0 22px 18px;margin:0}
.cta{display:grid;grid-template-columns:1fr 1fr;gap:clamp(28px,5vw,64px);align-items:center}
.facts{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:14px}
.facts li{background:var(--dark2);border:1px solid rgba(255,255,255,.14);border-top:4px solid var(--call);border-radius:12px;padding:16px 18px;font-size:.97rem;overflow-wrap:anywhere}
.facts strong{display:block;color:#fff}.facts a{color:#fff}
@media(max-width:900px){.cta{grid-template-columns:1fr}}@media(max-width:520px){.facts{grid-template-columns:1fr}}
footer{background:var(--deep);color:#c9d3df;font-size:.95rem;padding-top:56px}
footer a{color:#e8eef5;text-decoration:none}
.fgrid{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:32px;padding-bottom:40px}
.fgrid ul{list-style:none;margin:0;padding:0}.fgrid li{margin-bottom:6px}
.flabel{font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#93a4b8;margin:0 0 10px}
.fphone{font-size:1.3rem;font-weight:800;color:var(--call)!important}
.fbottom{border-top:1px solid rgba(255,255,255,.1);padding:18px 16px 22px;text-align:center;font-size:.86rem}
@media(max-width:900px){.fgrid{grid-template-columns:1fr 1fr}.fgrid>div:first-child{grid-column:1/-1}}@media(max-width:520px){.fgrid{grid-template-columns:1fr}}
`;

function slug(s, i) {
  return 'svc-' + (String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || i);
}

// photos: array of URLs (any length >= 1). Cycled when there are fewer than needed.
function buildPlaybookDemo({ name, type, city, state, phone, d, hero, photos, refCode }) {
  const loc = `${city}${state ? ', ' + String(state).trim().toUpperCase() : ''}`;
  const p = palette(hero);
  const root = ':root{' + Object.entries(p).map(([k, v]) => `--${k}:${v};`).join('') + '}';
  const tel = phone && phone.digits ? '+1' + phone.digits : '+19036367511';
  const phoneShow = phone && phone.display ? phone.display : '(903) 636-7511';
  const pics = (photos && photos.length ? photos : [null]);
  const pic = i => pics[i % pics.length];
  const img = (src, alt, cls = '', eager = false) => src
    ? `<img${cls ? ` class="${cls}"` : ''} src="${esc(src)}" alt="${esc(alt)}" width="1344" height="768"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`
    : '';

  const services = (d.services || []).filter(s => s && s.name).slice(0, 3);
  const steps = (d.steps || []).filter(s => s && s.title).slice(0, 4);
  const faqs = (d.faqs || []).filter(f => f && f.q && f.a).slice(0, 5);
  const why = (d.why || []).filter(w => w && w.title).slice(0, 3);
  const tiles = [
    ...(d.badges || []).filter(Boolean).slice(0, 3).map(b => [b, '']),
  ];
  tiles.push([`Serving ${loc}`, 'And the surrounding area']);
  while (tiles.length < 4) tiles.unshift(['Call or text', phoneShow]);

  const cards = services.map((s, i) => `<a class="card" href="#${slug(s.name, i)}">${img(pic(i + 1), s.name + ' in ' + loc)}<div><h3>${esc(s.name)}</h3><p>${esc(s.short)}</p><span class="more">Learn more</span></div></a>`).join('');
  const svcSections = services.map((s, i) => `<article class="svc" id="${slug(s.name, i)}"><div><h3 style="font-size:1.5rem">${esc(s.name)} in ${esc(city)}</h3>${(s.detail || []).map(x => `<p>${esc(x)}</p>`).join('')}<a class="btn btn-dark btn-sm" href="tel:${tel}">Ask about ${esc(s.name)}</a></div><figure>${img(pic(i + 1), s.name + ' for a ' + loc + ' customer')}</figure></article>`).join('');
  const faqLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) };

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(name)} | ${esc(type)} in ${esc(loc)}</title><meta name="robots" content="noindex,nofollow">
<meta name="description" content="${esc(d.subheadline)}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>${root}${CSS}</style>
<script type="application/ld+json">${JSON.stringify(faqLd).replace(/</g, '\\u003c')}</script></head><body id="top">
<div class="sample-bar">Free sample website for ${esc(name)} by Dominion Web Design Pro${refCode ? ' &middot; Ref ' + esc(refCode) : ''}</div>
<header><div class="hdr"><a class="logo" href="#top"><span class="mark">${esc(hero.emoji || '★')}</span><span>${esc(name)}</span></a>
<nav><ul><li><a href="#services">Services</a></li><li><a href="#how">How it works</a></li><li><a href="#about">About</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#faq">FAQ</a></li><li><a href="#contact">Contact</a></li></ul></nav>
<a class="btn btn-call btn-sm" href="tel:${tel}"><span class="long">Call ${esc(phoneShow)}</span><span class="short">Call</span></a></div></header>
<main>
<section class="hero">${img(pic(0), type + ' in ' + loc, '', true)}<div class="fade"></div><div class="hero-in">
<h1>${esc(d.headline)}</h1><p class="hero-lead">${esc(d.subheadline)}</p>
<div class="btn-row"><a class="btn btn-call" href="tel:${tel}">Call ${esc(phoneShow)}</a><a class="btn btn-ghost" href="#services">See services</a></div>
<p class="hero-note">${esc(type)} &middot; ${esc(loc)}</p></div></section>
<section class="tiles-wrap"><div class="wide"><ul class="tiles">${tiles.slice(0, 4).map(([a, b]) => `<li><strong>${esc(a)}</strong>${esc(b)}</li>`).join('')}</ul></div></section>
<section class="band" id="services"><div class="wide"><div class="head"><h2>${esc(d.servicesTitle || 'What we do')}</h2><p class="lead">${esc(d.servicesIntro || '')}</p></div><div class="cards">${cards}</div></div></section>
<section class="band" style="padding-top:0"><div class="wide">${svcSections}</div></section>
<section class="band b1" id="how"><div class="wide"><div class="head"><h2>How it works</h2></div><ol class="how">${steps.map(s => `<li><strong>${esc(s.title)}</strong>${esc(s.text)}</li>`).join('')}</ol></div></section>
<section class="band" id="about"><div class="wide split"><div><h2>${esc(d.aboutTitle || 'About ' + name)}</h2><p>${esc(d.aboutText)}</p>
${why.length ? `<ul class="why">${why.map(w => `<li><strong>${esc(w.title)}.</strong> ${esc(w.text)}</li>`).join('')}</ul>` : ''}
<a class="btn btn-dark" href="tel:${tel}">Talk with ${esc(name)}</a></div><figure>${img(pic(services.length + 1), name + ' at work in ' + loc)}</figure></div></section>
<section class="band b2" id="reviews"><div class="wide"><div class="head"><h2>What customers say</h2><p class="lead">Your real Google reviews go here. Send them over and they will be added exactly as your customers wrote them.</p></div>
<div class="reviews"><div class="review"><strong>Your Google review</strong>A real review from one of your customers will appear here.</div><div class="review"><strong>Your Google review</strong>A second real review will appear here, with the customer's first name.</div></div></div></section>
<section class="band" id="faq"><div class="col"><h2>Common questions</h2><div class="faq">${faqs.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('')}</div></div></section>
<section class="band bd" id="contact"><div class="wide cta"><div><h2>${esc(d.ctaTitle || 'Ready when you are')}</h2><p>${esc(d.ctaText || 'One call and you are talking to ' + name + '.')}</p><a class="btn btn-call" href="tel:${tel}">Call ${esc(phoneShow)}</a></div>
<ul class="facts"><li><strong>Phone</strong><a href="tel:${tel}">${esc(phoneShow)}</a></li><li><strong>Service area</strong>${esc(loc)} and nearby</li><li><strong>Services</strong>${esc(services.map(s => s.name).join(', '))}</li><li><strong>Hours</strong>Add your hours here</li></ul></div></section>
</main>
<footer><div class="wide fgrid"><div><a class="logo" href="#top"><span class="mark">${esc(hero.emoji || '★')}</span><span>${esc(name)}</span></a><p style="margin:14px 0;max-width:42ch">${esc(d.subheadline)}</p><a class="fphone" href="tel:${tel}">${esc(phoneShow)}</a></div>
<div><p class="flabel">Services</p><ul>${services.map((s, i) => `<li><a href="#${slug(s.name, i)}">${esc(s.name)}</a></li>`).join('')}</ul></div>
<div><p class="flabel">Company</p><ul><li><a href="#about">About</a></li><li><a href="#reviews">Reviews</a></li><li><a href="#faq">FAQ</a></li><li><a href="#contact">Contact</a></li></ul></div></div>
<div class="fbottom">&copy; 2026 ${esc(name)} &middot; Sample site by <a href="https://dominionwebdesignpro.com" target="_blank" rel="noopener">Dominion Web Design Pro</a> &middot; Photos are placeholders until your own are added.</div></footer>
</body></html>`;
}

// The copy request. Services the owner typed are kept word for word; the model
// only writes descriptions for them. If none were given it suggests three.
function playbookPrompt({ businessName, businessType, city, state, services, customRequest }) {
  const given = (services || []).map(s => String(s).trim()).filter(Boolean).slice(0, 3);
  return `You are writing website copy for a real local business. Write plainly, specifically and warmly, for its customers.

HARD RULES, these override everything else:
1. NEVER invent facts about this business: no licences, insurance, certifications, awards, years in business, customer counts, ratings, prices, warranties, hours, staff names or statistics. You do not know any of them.
2. NEVER write a customer review or testimonial.
3. NEVER claim emergency, 24/7 or same-day availability unless the special request below says so.
4. FAQ answers must be true for any honest business of this type: explain how things generally work and invite the reader to call. Never state a price, a time frame, an hour of opening or a credential.
5. No em dashes or en dashes anywhere. No eyebrow labels. Banned phrases: "your trusted partner", "one-stop solution", "look no further", "unmatched excellence", "we've got you covered".

Business: "${businessName}"
Type: "${businessType}"
Location: "${city}${state ? ', ' + state : ''}"
${given.length ? `Services they offer (use these EXACT names, in this order): ${given.map(s => '"' + s + '"').join(', ')}` : 'Suggest the three services this type of business most commonly offers.'}
${customRequest ? 'Special request from the owner (facts here may be used): ' + customRequest : ''}

Return ONLY a valid JSON object, no markdown:
{
  "headline": "6 to 9 word headline that speaks to this business's customers",
  "subheadline": "18 to 24 word line naming the main services and ${city}",
  "badges": ["three short intent statements, e.g. 'Free estimates', 'Locally owned', 'Straight answers'. Never a licence, rating, award, years, or emergency claim"],
  "servicesTitle": "3 to 5 word heading for the services section",
  "servicesIntro": "one sentence introducing the services",
  "services": [{"name": "service name", "short": "one complete sentence under 18 words", "detail": ["paragraph of 2 to 3 sentences on what the service involves and why it matters", "a second paragraph of 2 sentences on what the customer can expect"]}],
  "steps": [{"title": "2 to 4 words", "text": "one sentence"}, "four steps from first call to finished job"],
  "aboutTitle": "4 to 6 word heading",
  "aboutText": "3 sentences about serving ${city}, with no invented facts",
  "why": [{"title": "2 to 4 words", "text": "one sentence"}, "three reasons, no invented facts"],
  "faqs": [{"q": "a question customers really ask, in their words", "a": "2 to 3 sentence honest answer that follows rule 4"}, "four questions"],
  "ctaTitle": "4 to 8 word closing heading",
  "ctaText": "one sentence closing line"
}
The services array must have ${given.length || 3} items.`;
}

function fallbackCopy({ businessName, businessType, city, services }) {
  const names = (services || []).filter(Boolean).slice(0, 3);
  const list = names.length ? names : [`${businessType} service`, 'Repairs and upkeep', 'Free estimates'];
  return {
    headline: `${businessType} in ${city}, done right`,
    subheadline: `${businessName} offers ${list.join(', ').toLowerCase()} for homes and businesses in ${city} and the surrounding area.`,
    badges: ['Free estimates', 'Locally owned', 'Straight answers'],
    servicesTitle: 'What we do', servicesIntro: `Here is what ${businessName} takes care of in ${city}.`,
    services: list.map(n => ({ name: n, short: `${n} for customers in ${city}.`, detail: [`Call to talk through what you need and get a clear answer on what it involves.`] })),
    steps: [{ title: 'Call or text', text: 'Tell us what you need.' }, { title: 'Get a clear quote', text: 'You hear what it involves before any work starts.' }, { title: 'Work gets done', text: 'The job is done the way it was agreed.' }, { title: 'Follow up', text: 'Call any time with questions afterwards.' }],
    aboutTitle: `About ${businessName}`, aboutText: `${businessName} serves ${city} and the surrounding area.`,
    why: [], faqs: [{ q: `Do you serve my part of ${city}?`, a: 'Call with your address and you will get a straight answer.' }],
    ctaTitle: 'Ready when you are', ctaText: `One call and you are talking to ${businessName}.`
  };
}

function parsePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  if (digits.length !== 10) return null;
  return { digits, display: `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}` };
}

module.exports = { buildPlaybookDemo, playbookPrompt, fallbackCopy, parsePhone, palette };
