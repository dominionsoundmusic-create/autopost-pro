// ── TEMPLATE DEFINITIONS ──────────────────────────────────────────────────
// Each template is a function that takes business data and returns full HTML

function buildModernTemplate(data) {
  const { name, type, city, phone, address, rating, reviews, description, services, tagline, photoB64, photoType, primaryColor } = data;
  const color = primaryColor || '#1a2332';
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const heroPhoto = photoB64 ? `url('data:${photoType||'image/png'};base64,${photoB64}')` : 'none';
  const heroOverlay = photoB64
    ? `linear-gradient(100deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.55) 38%,rgba(0,0,0,0.08) 70%,rgba(0,0,0,0.0) 100%)`
    : 'none';
  const svcs = (services || []).slice(0, 6);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${city}</title>
<meta name="description" content="${description || `${name} — professional ${type} serving ${city}. Call ${phone || 'us'} today.`}">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:${color};--gold:#c9a84c;--white:#fff;--light:#f8f9fa;--mid:#6b7280;--dark:#111}
body{font-family:'Inter',sans-serif;color:var(--dark)}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(0,0,0,0.92);backdrop-filter:blur(12px);padding:0 48px;height:68px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(201,168,76,0.2)}
.nav-logo{color:#fff;font-weight:800;font-size:1.05em;text-decoration:none}
.nav-logo span{color:var(--gold)}
.nav-phone{color:rgba(255,255,255,0.7);font-size:.85em;text-decoration:none}
.nav-cta{background:var(--gold);color:#000;padding:9px 22px;border-radius:4px;text-decoration:none;font-weight:700;font-size:.82em;letter-spacing:.5px}
.hero{min-height:100vh;position:relative;display:flex;align-items:center;background:${color};overflow:hidden}
.hero-bg{position:absolute;inset:0;background:${heroOverlay !== 'none' ? heroOverlay + ',' : ''}${heroPhoto !== 'none' ? heroPhoto + ' center/cover no-repeat' : heroOverlay === 'none' ? `linear-gradient(135deg,${color} 0%,#0a0a0a 100%)` : ''};background-size:cover;background-position:center}
.hero-content{position:relative;z-index:2;max-width:620px;padding:160px 56px 120px}
.hero-eyebrow{display:inline-block;color:var(--gold);font-size:.72em;letter-spacing:4px;text-transform:uppercase;font-weight:600;margin-bottom:20px;border-left:3px solid var(--gold);padding-left:12px}
.hero h1{font-size:clamp(2.8em,5.5vw,4.5em);color:#fff;font-weight:800;line-height:1.05;letter-spacing:-1.5px;margin-bottom:16px}
.hero h1 span{color:var(--gold)}
.hero-sub{font-size:1.05em;color:rgba(255,255,255,0.72);line-height:1.75;margin-bottom:40px;max-width:480px}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:48px}
.btn-gold{background:var(--gold);color:#000;padding:15px 36px;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9em;letter-spacing:.5px;transition:all .2s}
.btn-gold:hover{background:#e0c070;transform:translateY(-2px)}
.btn-outline{border:1.5px solid rgba(255,255,255,0.4);color:#fff;padding:15px 36px;border-radius:4px;text-decoration:none;font-weight:500;font-size:.9em;transition:all .2s}
.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
.hero-stats{display:flex;gap:32px}
.stat-num{font-size:1.8em;font-weight:800;color:var(--gold);line-height:1}
.stat-label{font-size:.7em;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:2px;margin-top:3px}
section{padding:88px 56px}
.section-inner{max-width:1100px;margin:0 auto}
.eyebrow{font-size:.7em;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.section-title{font-size:clamp(1.8em,3vw,2.5em);font-weight:800;color:var(--dark);letter-spacing:-1px;margin-bottom:12px;line-height:1.15}
.section-sub{color:var(--mid);font-size:1em;line-height:1.8;max-width:560px}
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.svc-card{background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:28px;transition:all .2s;border-top:3px solid transparent}
.svc-card:hover{border-top-color:var(--gold);box-shadow:0 8px 32px rgba(0,0,0,0.08);transform:translateY(-3px)}
.svc-icon{font-size:1.8em;margin-bottom:14px}
.svc-title{font-weight:700;font-size:.95em;margin-bottom:6px;color:var(--dark)}
.svc-desc{font-size:.84em;color:var(--mid);line-height:1.7}
.about{background:var(--light)}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center;margin-top:48px}
.about-stat{padding:20px;border-left:3px solid var(--gold);margin-bottom:16px}
.about-stat-num{font-size:2em;font-weight:800;color:${color};line-height:1}
.about-stat-label{font-size:.8em;color:var(--mid);margin-top:4px}
.cta{background:${color};text-align:center;padding:88px 56px}
.cta h2{font-size:clamp(2em,3.5vw,2.8em);color:#fff;font-weight:800;letter-spacing:-1px;margin-bottom:12px}
.cta-sub{color:rgba(255,255,255,0.6);font-size:1em;margin-bottom:36px;line-height:1.7}
.cta-phone{font-size:2em;color:var(--gold);font-weight:800;text-decoration:none;display:block;margin-bottom:6px;letter-spacing:-1px}
.cta-phone-label{font-size:.72em;color:rgba(255,255,255,0.4);letter-spacing:3px;text-transform:uppercase;margin-bottom:28px}
footer{background:#0a0a0a;padding:28px 56px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-brand{color:#fff;font-weight:700;font-size:.9em}
.footer-copy{color:#555;font-size:.75em}
@media(max-width:768px){nav{padding:0 16px}.hero-content{padding:120px 20px 80px}section{padding:56px 20px}.services-grid{grid-template-columns:1fr}.about-grid{grid-template-columns:1fr}.hero-stats{gap:20px}.cta{padding:56px 20px}footer{padding:20px 16px;flex-direction:column;align-items:flex-start}}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">${name.split(' ')[0]} <span>${name.split(' ').slice(1).join(' ')}</span></a>
  <div style="display:flex;align-items:center;gap:20px">
    ${phone ? `<a href="tel:${phone.replace(/\D/g,'')}" class="nav-phone">${phone}</a>` : ''}
    <a href="#contact" class="nav-cta">Call Now</a>
  </div>
</nav>
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="hero-eyebrow">Serving ${city}</div>
    <h1>${tagline ? tagline.split('.')[0] : `Professional <span>${type}</span>`}<br>${tagline ? `<span>${tagline.split('.')[1] || ''}</span>` : `Services in ${city}`}</h1>
    <p class="hero-sub">${description || `${name} is ${city}'s trusted ${type}. We deliver exceptional service every time.`}</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-gold">${phone ? `Call ${phone}` : 'Get a Free Quote'}</a>
      <a href="#services" class="btn-outline">Our Services</a>
    </div>
    ${rating ? `<div class="hero-stats"><div><div class="stat-num">${rating}★</div><div class="stat-label">Rating</div></div><div><div class="stat-num">${reviews}+</div><div class="stat-label">Reviews</div></div></div>` : ''}
  </div>
</div>
<section id="services" style="background:#fff">
  <div class="section-inner">
    <div class="eyebrow">What We Offer</div>
    <h2 class="section-title">Our Services</h2>
    <p class="section-sub">Professional ${type} services tailored to your needs in ${city} and surrounding areas.</p>
    <div class="services-grid">
      ${svcs.length ? svcs.map(s => `<div class="svc-card"><div class="svc-icon">✓</div><div class="svc-title">${s}</div><div class="svc-desc">Professional ${s.toLowerCase()} services delivered with care and expertise.</div></div>`).join('') : `<div class="svc-card"><div class="svc-icon">⭐</div><div class="svc-title">Expert Service</div><div class="svc-desc">Professional ${type} services you can count on.</div></div><div class="svc-card"><div class="svc-icon">🏆</div><div class="svc-title">Quality Work</div><div class="svc-desc">We take pride in everything we do for our clients.</div></div><div class="svc-card"><div class="svc-icon">📞</div><div class="svc-title">Always Available</div><div class="svc-desc">Ready to help when you need us most.</div></div>`}
    </div>
  </div>
</section>
<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div>
        <div class="eyebrow">About Us</div>
        <h2 class="section-title">Why ${city} Trusts ${name.split(' ')[0]}</h2>
        <p style="color:var(--mid);line-height:1.8;margin-bottom:24px">${description || `We are ${city}'s premier ${type}, committed to delivering exceptional results for every client.`}</p>
        <a href="#contact" class="btn-gold" style="display:inline-block;text-decoration:none">Get in Touch</a>
      </div>
      <div>
        ${rating ? `<div class="about-stat"><div class="about-stat-num">${rating}★</div><div class="about-stat-label">Average Rating</div></div>` : ''}
        ${reviews ? `<div class="about-stat"><div class="about-stat-num">${reviews}+</div><div class="about-stat-label">Happy Clients</div></div>` : ''}
        <div class="about-stat"><div class="about-stat-num">100%</div><div class="about-stat-label">Satisfaction Guaranteed</div></div>
      </div>
    </div>
  </div>
</section>
<div class="cta" id="contact">
  <h2>Ready to Get Started?</h2>
  <p class="cta-sub">Contact ${name} today — we're here to help.</p>
  ${phone ? `<a href="tel:${phone.replace(/\D/g,'')}" class="cta-phone">${phone}</a><div class="cta-phone-label">Call or Text Anytime</div>` : ''}
  <a href="#contact" class="btn-gold" style="display:inline-block;text-decoration:none">Get a Free Quote</a>
  ${address ? `<p style="color:rgba(255,255,255,0.35);font-size:.82em;margin-top:20px">${address}</p>` : ''}
</div>
<footer>
  <div class="footer-brand">${name} · ${city}</div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${name}. Demo by <a href="https://dominionwebdesignpro.com" style="color:#555">Dominion Web Design Pro</a></div>
</footer>
</body>
</html>`;
}

function buildBoldTemplate(data) {
  const { name, type, city, phone, address, rating, reviews, description, services, tagline, photoB64, photoType, primaryColor } = data;
  const color = primaryColor || '#111111';
  const svcs = (services || []).slice(0, 6);
  const heroPhoto = photoB64 ? `url('data:${photoType||'image/png'};base64,${photoB64}')` : 'none';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${city}</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:${color};--accent:#ff3d00;--white:#fff;--mid:#888}
body{font-family:'Inter',sans-serif;background:#0a0a0a;color:#fff}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:#000;padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid var(--accent)}
.nav-logo{color:#fff;font-family:'Oswald',sans-serif;font-size:1.3em;font-weight:700;text-decoration:none;letter-spacing:2px;text-transform:uppercase}
.nav-cta{background:var(--accent);color:#fff;padding:10px 24px;text-decoration:none;font-weight:700;font-size:.82em;letter-spacing:2px;text-transform:uppercase;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)}
.hero{min-height:100vh;background:#000;display:flex;align-items:center;position:relative;overflow:hidden}
.hero-bg{position:absolute;inset:0;${photoB64 ? `background:linear-gradient(100deg,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.6) 40%,rgba(0,0,0,0.1) 100%),${heroPhoto} center/cover no-repeat;` : `background:${color};`}opacity:1}
.hero-content{position:relative;z-index:2;padding:140px 56px 100px;max-width:700px}
.hero-tag{display:inline-block;background:var(--accent);color:#fff;font-family:'Oswald',sans-serif;font-size:.75em;letter-spacing:4px;text-transform:uppercase;padding:6px 16px;margin-bottom:24px;clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)}
.hero h1{font-family:'Oswald',sans-serif;font-size:clamp(3.5em,7vw,6em);color:#fff;font-weight:700;line-height:.95;letter-spacing:-1px;text-transform:uppercase;margin-bottom:20px}
.hero h1 span{color:var(--accent);display:block}
.hero-sub{font-size:.95em;color:rgba(255,255,255,0.6);line-height:1.8;margin-bottom:40px;max-width:480px}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.btn-accent{background:var(--accent);color:#fff;padding:15px 36px;text-decoration:none;font-family:'Oswald',sans-serif;font-weight:600;font-size:1em;letter-spacing:2px;text-transform:uppercase;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);transition:all .2s}
.btn-accent:hover{background:#ff6130}
.btn-ghost{border:2px solid rgba(255,255,255,0.3);color:#fff;padding:15px 36px;text-decoration:none;font-family:'Oswald',sans-serif;font-weight:600;font-size:1em;letter-spacing:2px;text-transform:uppercase;transition:all .2s}
.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
section{padding:88px 56px}
.section-inner{max-width:1100px;margin:0 auto}
.section-tag{display:inline-block;background:var(--accent);color:#fff;font-family:'Oswald',sans-serif;font-size:.7em;letter-spacing:3px;text-transform:uppercase;padding:4px 12px;margin-bottom:12px;clip-path:polygon(4px 0%,100% 0%,calc(100% - 4px) 100%,0% 100%)}
.section-title{font-family:'Oswald',sans-serif;font-size:clamp(2em,4vw,3.2em);color:#fff;font-weight:700;text-transform:uppercase;letter-spacing:-1px;margin-bottom:12px;line-height:1}
.services-list{margin-top:48px}
.svc-row{display:flex;align-items:center;gap:20px;padding:20px 0;border-bottom:1px solid #1a1a1a;transition:all .2s}
.svc-row:hover{padding-left:12px;border-bottom-color:var(--accent)}
.svc-num{font-family:'Oswald',sans-serif;font-size:2em;color:#1a1a1a;font-weight:700;width:60px;flex-shrink:0;transition:color .2s}
.svc-row:hover .svc-num{color:var(--accent)}
.svc-name{font-family:'Oswald',sans-serif;font-size:1.1em;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:#fff}
.svc-desc{font-size:.82em;color:#666;line-height:1.6;margin-top:3px}
.stats-band{background:var(--accent);padding:48px 56px}
.stats-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;text-align:center}
.stat-num{font-family:'Oswald',sans-serif;font-size:3em;font-weight:700;color:#fff;line-height:1}
.stat-label{font-size:.75em;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2px;margin-top:4px}
.cta{background:#000;text-align:center;padding:88px 56px;border-top:2px solid var(--accent)}
.cta-title{font-family:'Oswald',sans-serif;font-size:clamp(2.5em,5vw,4em);color:#fff;font-weight:700;text-transform:uppercase;letter-spacing:-1px;margin-bottom:12px;line-height:1}
.cta-title span{color:var(--accent)}
.cta-phone{font-family:'Oswald',sans-serif;font-size:2.5em;color:var(--accent);font-weight:700;text-decoration:none;display:block;margin:20px 0 8px;letter-spacing:-1px}
footer{background:#000;padding:24px 56px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid #1a1a1a}
.footer-logo{font-family:'Oswald',sans-serif;font-size:1em;font-weight:700;color:#fff;letter-spacing:2px;text-transform:uppercase}
.footer-copy{font-size:.72em;color:#333}
@media(max-width:768px){nav{padding:0 16px}.hero-content{padding:110px 20px 80px}section{padding:56px 20px}.stats-grid{grid-template-columns:1fr;gap:24px}.cta{padding:56px 20px}footer{padding:16px;flex-direction:column;gap:8px}}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">${name}</a>
  <a href="#contact" class="nav-cta">Call Now</a>
</nav>
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="hero-tag">${city} · ${type}</div>
    <h1>${name.split(' ')[0]}<span>${name.split(' ').slice(1).join(' ') || type}</span></h1>
    <p class="hero-sub">${description || `${city}'s most trusted ${type}. We get the job done right, every time.`}</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-accent">${phone ? `Call ${phone}` : 'Get a Quote'}</a>
      <a href="#services" class="btn-ghost">Our Work</a>
    </div>
  </div>
</div>
${rating || reviews ? `<div class="stats-band"><div class="stats-grid">${rating ? `<div><div class="stat-num">${rating}★</div><div class="stat-label">Rating</div></div>` : ''}<div><div class="stat-num">${reviews || '100'}+</div><div class="stat-label">Clients Served</div></div><div><div class="stat-num">100%</div><div class="stat-label">Satisfaction</div></div></div></div>` : ''}
<section id="services">
  <div class="section-inner">
    <div class="section-tag">What We Do</div>
    <h2 class="section-title">Our Services</h2>
    <div class="services-list">
      ${svcs.length ? svcs.map((s,i) => `<div class="svc-row"><div class="svc-num">0${i+1}</div><div><div class="svc-name">${s}</div><div class="svc-desc">Professional ${s.toLowerCase()} in ${city} and surrounding areas.</div></div></div>`).join('') : `<div class="svc-row"><div class="svc-num">01</div><div><div class="svc-name">Expert ${type}</div><div class="svc-desc">Professional services you can count on.</div></div></div>`}
    </div>
  </div>
</section>
<div class="cta" id="contact">
  <div class="cta-title">Ready to <span>Work Together?</span></div>
  <p style="color:#666;margin-bottom:8px">${description || `Contact ${name} today.`}</p>
  ${phone ? `<a href="tel:${phone.replace(/\D/g,'')}" class="cta-phone">${phone}</a><p style="color:#333;font-size:.75em;letter-spacing:3px;text-transform:uppercase">Call or Text</p>` : ''}
  ${address ? `<p style="color:#333;font-size:.8em;margin-top:16px">${address}</p>` : ''}
</div>
<footer>
  <div class="footer-logo">${name}</div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${name} · Demo by <a href="https://dominionwebdesignpro.com" style="color:#333">Dominion Web Design Pro</a></div>
</footer>
</body>
</html>`;
}

function buildElegantTemplate(data) {
  const { name, type, city, phone, address, rating, reviews, description, services, tagline, photoB64, photoType, primaryColor } = data;
  const color = primaryColor || '#1a3a2a';
  const svcs = (services || []).slice(0, 6);
  const heroPhoto = photoB64 ? `url('data:${photoType||'image/png'};base64,${photoB64}')` : 'none';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${city}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:${color};--gold:#c8a96e;--cream:#f7f3ec;--dark:#1c1c1c;--mid:#6b6b6b;--border:#e4ddd3}
body{font-family:'Source Sans 3',sans-serif;background:#fff;color:var(--dark)}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,255,255,0.96);backdrop-filter:blur(12px);padding:0 56px;height:70px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
.nav-logo{font-family:'Playfair Display',serif;font-size:1.1em;font-weight:700;color:var(--dark);text-decoration:none}
.nav-links{display:flex;align-items:center;gap:28px}
.nav-links a{color:var(--mid);text-decoration:none;font-size:.82em;letter-spacing:1.5px;text-transform:uppercase;font-weight:500;transition:color .2s}
.nav-links a:hover{color:var(--primary)}
.nav-cta{background:var(--primary)!important;color:#fff!important;padding:9px 22px;letter-spacing:1px}
.hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;background:var(--primary)}
.hero-bg{position:absolute;inset:0;${photoB64 ? `background:linear-gradient(100deg,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.5) 40%,rgba(0,0,0,0.05) 100%),${heroPhoto} center/cover no-repeat;` : `background:linear-gradient(135deg,${color} 0%,#0f2418 100%);`}}
.hero-content{position:relative;z-index:2;max-width:580px;padding:160px 72px 120px}
.hero-ornament{color:var(--gold);font-size:.75em;letter-spacing:5px;text-transform:uppercase;font-weight:300;margin-bottom:20px;display:flex;align-items:center;gap:14px}
.hero-ornament::before,.hero-ornament::after{content:'';display:block;width:32px;height:1px;background:var(--gold);opacity:0.6}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(3em,5.5vw,4.8em);color:#fff;font-weight:700;line-height:1.08;letter-spacing:-1px;margin-bottom:14px}
.hero h1 em{font-style:italic;color:var(--gold);display:block;font-weight:400}
.hero-sub{font-size:1em;color:rgba(255,255,255,0.65);line-height:1.85;margin-bottom:40px;font-weight:300;max-width:460px}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap}
.btn-gold{background:var(--gold);color:#1a1000;padding:14px 36px;text-decoration:none;font-weight:600;font-size:.85em;letter-spacing:1.5px;text-transform:uppercase;transition:all .2s}
.btn-gold:hover{background:#dbb97e;transform:translateY(-2px)}
.btn-outline{border:1px solid rgba(255,255,255,0.35);color:#fff;padding:14px 36px;text-decoration:none;font-weight:400;font-size:.85em;letter-spacing:1.5px;text-transform:uppercase;transition:all .2s}
.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
section{padding:96px 72px}
.section-inner{max-width:1100px;margin:0 auto}
.ornament{display:flex;align-items:center;gap:14px;margin-bottom:12px;color:var(--gold);font-size:.7em;letter-spacing:4px;text-transform:uppercase}
.ornament::before{content:'';display:block;width:28px;height:1px;background:var(--gold)}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(1.8em,3vw,2.6em);color:var(--dark);margin-bottom:14px;line-height:1.2}
.section-title em{font-style:italic;color:var(--primary)}
.section-sub{color:var(--mid);font-size:.95em;line-height:1.85;max-width:520px;font-weight:300}
.services-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:var(--border);margin-top:56px}
.svc-card{background:#fff;padding:36px;position:relative}
.svc-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:0;background:var(--gold);transition:height .3s}
.svc-card:hover::before{height:100%}
.svc-num{font-family:'Playfair Display',serif;font-size:2.5em;color:var(--border);font-weight:700;line-height:1;margin-bottom:12px}
.svc-title{font-family:'Playfair Display',serif;font-size:1.05em;font-weight:600;color:var(--dark);margin-bottom:8px}
.svc-desc{font-size:.84em;color:var(--mid);line-height:1.75;font-weight:300}
.about{background:var(--cream)}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center;margin-top:56px}
.about-quote{font-family:'Playfair Display',serif;font-size:1.3em;color:var(--dark);font-style:italic;line-height:1.7;margin-bottom:24px;padding-left:24px;border-left:2px solid var(--gold)}
.about-stat{display:flex;align-items:baseline;gap:8px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid var(--border)}
.about-stat:last-child{border-bottom:none}
.about-stat-num{font-family:'Playfair Display',serif;font-size:2.2em;color:var(--primary);font-weight:700;line-height:1}
.about-stat-label{font-size:.82em;color:var(--mid)}
.cta{background:var(--primary);text-align:center;padding:96px 72px}
.cta-ornament{display:flex;align-items:center;justify-content:center;gap:20px;margin-bottom:20px;color:rgba(255,255,255,0.4);font-size:.7em;letter-spacing:4px;text-transform:uppercase}
.cta-ornament::before,.cta-ornament::after{content:'';display:block;width:48px;height:1px;background:var(--gold);opacity:0.4}
.cta h2{font-family:'Playfair Display',serif;font-size:clamp(2em,3.5vw,3em);color:#fff;font-weight:700;margin-bottom:12px;letter-spacing:-.5px}
.cta h2 em{font-style:italic;color:var(--gold);font-weight:400}
.cta-sub{color:rgba(255,255,255,0.55);font-size:.95em;line-height:1.8;margin-bottom:36px;font-weight:300}
.cta-phone{font-family:'Playfair Display',serif;font-size:2.2em;color:var(--gold);font-weight:700;text-decoration:none;display:block;margin-bottom:6px}
footer{background:#0f0f0f;padding:32px 72px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-brand{font-family:'Playfair Display',serif;font-size:.95em;color:#fff;font-style:italic}
.footer-copy{font-size:.72em;color:#333}
@media(max-width:768px){nav{padding:0 16px}.nav-links{display:none}.hero-content{padding:120px 20px 80px}section{padding:56px 20px}.services-grid{grid-template-columns:1fr}.about-grid{grid-template-columns:1fr}.cta{padding:56px 20px}footer{padding:20px;flex-direction:column}}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">${name}</a>
  <div class="nav-links">
    <a href="#services">Services</a>
    <a href="#about">About</a>
    <a href="#contact">Contact</a>
    ${phone ? `<a href="tel:${phone.replace(/\D/g,'')}">${phone}</a>` : ''}
    <a href="#contact" class="nav-cta">Call Now</a>
  </div>
</nav>
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="hero-ornament">Est. ${city}</div>
    <h1>${tagline ? tagline.split('.')[0] : name}<em>${tagline ? (tagline.split('.')[1] || type) : `${type} in ${city}`}</em></h1>
    <p class="hero-sub">${description || `Exceptional ${type} services for the discerning client in ${city}. We believe in quality above all.`}</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-gold">${phone ? `Call ${phone}` : 'Schedule a Consultation'}</a>
      <a href="#services" class="btn-outline">Our Services</a>
    </div>
  </div>
</div>
<section id="services" style="background:#fff">
  <div class="section-inner">
    <div class="ornament">Services</div>
    <h2 class="section-title">What We <em>Offer</em></h2>
    <p class="section-sub">Premium ${type} services delivered with care and attention to every detail.</p>
    <div class="services-grid">
      ${svcs.length ? svcs.map((s,i) => `<div class="svc-card"><div class="svc-num">0${i+1}</div><div class="svc-title">${s}</div><div class="svc-desc">Professional ${s.toLowerCase()} services tailored to your unique needs.</div></div>`).join('') : `<div class="svc-card"><div class="svc-num">01</div><div class="svc-title">Premium Service</div><div class="svc-desc">Exceptional quality in everything we do.</div></div><div class="svc-card"><div class="svc-num">02</div><div class="svc-title">Expert Care</div><div class="svc-desc">Attention to every detail, every time.</div></div>`}
    </div>
  </div>
</section>
<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div>
        <div class="ornament">Our Story</div>
        <h2 class="section-title">Why <em>${name.split(' ')[0]}</em></h2>
        <p class="about-quote">"${description || `We are dedicated to delivering the finest ${type} experience in ${city}.`}"</p>
        <a href="#contact" class="btn-gold" style="display:inline-block;text-decoration:none">Get in Touch</a>
      </div>
      <div>
        ${rating ? `<div class="about-stat"><div class="about-stat-num">${rating}★</div><div class="about-stat-label">Average client rating</div></div>` : ''}
        ${reviews ? `<div class="about-stat"><div class="about-stat-num">${reviews}+</div><div class="about-stat-label">Satisfied clients</div></div>` : ''}
        <div class="about-stat"><div class="about-stat-num">100%</div><div class="about-stat-label">Satisfaction guaranteed</div></div>
      </div>
    </div>
  </div>
</section>
<div class="cta" id="contact">
  <div class="cta-ornament">Contact</div>
  <h2>Begin Your <em>Journey</em></h2>
  <p class="cta-sub">${name} is ready to serve you in ${city}. Reach out today.</p>
  ${phone ? `<a href="tel:${phone.replace(/\D/g,'')}" class="cta-phone">${phone}</a>` : ''}
  <a href="#contact" class="btn-gold" style="display:inline-block;text-decoration:none;margin-top:8px">Schedule a Consultation</a>
  ${address ? `<p style="color:rgba(255,255,255,0.25);font-size:.8em;margin-top:20px;font-style:italic">${address}</p>` : ''}
</div>
<footer>
  <div class="footer-brand">${name}</div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${name} · Demo by <a href="https://dominionwebdesignpro.com" style="color:#333">Dominion Web Design Pro</a></div>
</footer>
</body>
</html>`;
}

function buildRusticTemplate(data) {
  const { name, type, city, phone, address, rating, reviews, description, services, tagline, photoB64, photoType, primaryColor } = data;
  const color = primaryColor || '#2d1a00';
  const svcs = (services || []).slice(0, 6);
  const heroPhoto = photoB64 ? `url('data:${photoType||'image/png'};base64,${photoB64}')` : 'none';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${city}</title>
<link href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,300;1,400&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:${color};--warm:#c8793a;--cream:#faf6f0;--dark:#2d1a00;--mid:#7a6a5a;--border:#e8ddd0}
body{font-family:'Lato',sans-serif;background:var(--cream);color:var(--dark)}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(45,26,0,0.95);backdrop-filter:blur(8px);padding:0 48px;height:66px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid var(--warm)}
.nav-logo{font-family:'Merriweather',serif;font-size:1em;font-weight:700;color:#fff;text-decoration:none}
.nav-cta{background:var(--warm);color:#fff;padding:9px 22px;text-decoration:none;font-weight:700;font-size:.82em;border-radius:2px}
.hero{min-height:100vh;display:flex;align-items:center;position:relative;overflow:hidden;background:var(--dark)}
.hero-bg{position:absolute;inset:0;${photoB64 ? `background:linear-gradient(100deg,rgba(45,26,0,0.90) 0%,rgba(45,26,0,0.55) 40%,rgba(45,26,0,0.08) 100%),${heroPhoto} center/cover no-repeat;` : `background:linear-gradient(135deg,${color} 0%,#1a0a00 100%);`}}
.hero-content{position:relative;z-index:2;max-width:600px;padding:150px 56px 110px}
.hero-badge{display:inline-block;border:1px solid var(--warm);color:var(--warm);font-size:.72em;letter-spacing:3px;text-transform:uppercase;padding:5px 14px;margin-bottom:22px;border-radius:2px}
.hero h1{font-family:'Merriweather',serif;font-size:clamp(2.5em,5vw,4.2em);color:#fff;font-weight:700;line-height:1.15;margin-bottom:16px}
.hero h1 em{font-style:italic;color:var(--warm);display:block;font-weight:300;font-size:.85em}
.hero-sub{font-size:.95em;color:rgba(255,255,255,0.65);line-height:1.85;margin-bottom:40px;font-weight:300}
.hero-btns{display:flex;gap:14px;flex-wrap:wrap}
.btn-warm{background:var(--warm);color:#fff;padding:14px 34px;text-decoration:none;font-weight:700;font-size:.88em;border-radius:2px;transition:all .2s}
.btn-warm:hover{background:#d98840;transform:translateY(-2px)}
.btn-outline{border:1px solid rgba(255,255,255,0.3);color:#fff;padding:14px 34px;text-decoration:none;font-weight:400;font-size:.88em;border-radius:2px;transition:all .2s}
.btn-outline:hover{border-color:var(--warm);color:var(--warm)}
section{padding:88px 56px}
.section-inner{max-width:1100px;margin:0 auto}
.section-kicker{font-size:.72em;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:var(--warm);margin-bottom:10px}
.section-title{font-family:'Merriweather',serif;font-size:clamp(1.8em,3vw,2.5em);color:var(--dark);margin-bottom:14px;line-height:1.25}
.section-title em{font-style:italic;color:var(--warm);font-weight:300}
.section-sub{color:var(--mid);font-size:.93em;line-height:1.85;max-width:520px;font-weight:300}
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px}
.svc-card{background:#fff;border:1px solid var(--border);border-radius:4px;padding:30px;border-bottom:3px solid transparent;transition:all .25s}
.svc-card:hover{border-bottom-color:var(--warm);box-shadow:0 4px 24px rgba(45,26,0,0.08)}
.svc-icon{font-size:1.6em;margin-bottom:14px}
.svc-title{font-family:'Merriweather',serif;font-size:.95em;font-weight:700;color:var(--dark);margin-bottom:8px}
.svc-desc{font-size:.82em;color:var(--mid);line-height:1.75;font-weight:300}
.community{background:var(--dark);padding:64px 56px;text-align:center}
.community p{font-family:'Merriweather',serif;font-size:1.2em;color:rgba(255,255,255,0.8);line-height:1.75;max-width:700px;margin:0 auto;font-style:italic;font-weight:300}
.community strong{color:var(--warm);font-style:normal}
.stats{background:#fff;padding:56px}
.stats-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,1fr);gap:32px;text-align:center}
.stat-num{font-family:'Merriweather',serif;font-size:2.5em;color:var(--dark);font-weight:700;line-height:1}
.stat-label{font-size:.78em;color:var(--mid);margin-top:6px;letter-spacing:1px}
.cta{background:var(--warm);text-align:center;padding:80px 56px}
.cta h2{font-family:'Merriweather',serif;font-size:clamp(1.8em,3vw,2.6em);color:#fff;font-weight:700;margin-bottom:12px}
.cta-sub{color:rgba(255,255,255,0.75);margin-bottom:32px;line-height:1.7;font-weight:300}
.cta-phone{font-family:'Merriweather',serif;font-size:2em;color:#fff;font-weight:700;text-decoration:none;display:block;margin-bottom:20px}
footer{background:var(--dark);padding:28px 56px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.footer-brand{font-family:'Merriweather',serif;font-size:.9em;color:#fff;font-style:italic}
.footer-copy{font-size:.72em;color:#664}
@media(max-width:768px){nav{padding:0 16px}.hero-content{padding:110px 20px 80px}section{padding:56px 20px}.services-grid{grid-template-columns:1fr}.stats-grid{grid-template-columns:1fr;gap:20px}.community,.cta{padding:48px 20px}footer{padding:20px;flex-direction:column}}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">${name}</a>
  <a href="#contact" class="nav-cta">Call Now</a>
</nav>
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="hero-badge">Locally Owned · ${city}</div>
    <h1>${tagline ? tagline.split('.')[0] : `${name}`}<em>${tagline ? (tagline.split('.')[1] || `Serving ${city}`) : `Serving ${city} with Pride`}</em></h1>
    <p class="hero-sub">${description || `Family-owned and community-focused. ${name} has been serving ${city} with honest, quality ${type} services.`}</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-warm">${phone ? `Call ${phone}` : 'Get in Touch'}</a>
      <a href="#services" class="btn-outline">Our Services</a>
    </div>
  </div>
</div>
<section id="services" style="background:var(--cream)">
  <div class="section-inner">
    <div class="section-kicker">What We Do</div>
    <h2 class="section-title">Services We <em>Offer</em></h2>
    <p class="section-sub">Quality ${type} services delivered with the care and honesty you deserve.</p>
    <div class="services-grid">
      ${svcs.length ? svcs.map(s => `<div class="svc-card"><div class="svc-icon">🌿</div><div class="svc-title">${s}</div><div class="svc-desc">Professional ${s.toLowerCase()} done right, every time.</div></div>`).join('') : `<div class="svc-card"><div class="svc-icon">🌿</div><div class="svc-title">Quality Service</div><div class="svc-desc">Done right the first time.</div></div>`}
    </div>
  </div>
</section>
<div class="community">
  <p>"We believe in <strong>honest work, fair prices</strong>, and treating every customer like a neighbor — because in ${city}, they usually are."</p>
</div>
${rating || reviews ? `<div class="stats"><div class="stats-grid">${rating ? `<div><div class="stat-num">${rating}★</div><div class="stat-label">Average Rating</div></div>` : ''}<div><div class="stat-num">${reviews || '100'}+</div><div class="stat-label">Happy Customers</div></div><div><div class="stat-num">100%</div><div class="stat-label">Local & Proud</div></div></div></div>` : ''}
<div class="cta" id="contact">
  <h2>Let's Work Together</h2>
  <p class="cta-sub">${description || `Contact ${name} today. We're proud to serve ${city} and the surrounding community.`}</p>
  ${phone ? `<a href="tel:${phone.replace(/\D/g,'')}" class="cta-phone">${phone}</a>` : ''}
  <a href="#contact" class="btn-warm" style="display:inline-block;text-decoration:none;background:#fff;color:var(--warm)">Get a Free Quote</a>
  ${address ? `<p style="color:rgba(255,255,255,0.5);font-size:.8em;margin-top:20px">${address}</p>` : ''}
</div>
<footer>
  <div class="footer-brand">${name} · ${city}</div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${name} · Demo by <a href="https://dominionwebdesignpro.com" style="color:#664">Dominion Web Design Pro</a></div>
</footer>
</body>
</html>`;
}

function buildMinimalTemplate(data) {
  const { name, type, city, phone, address, rating, reviews, description, services, tagline, photoB64, photoType, primaryColor } = data;
  const color = primaryColor || '#111111';
  const svcs = (services || []).slice(0, 6);
  const heroPhoto = photoB64 ? `url('data:${photoType||'image/png'};base64,${photoB64}')` : 'none';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${city}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,300&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:${color};--accent:#111;--white:#fff;--light:#f9f9f9;--mid:#999;--border:#e5e5e5}
body{font-family:'DM Sans',sans-serif;background:#fff;color:#111}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:#fff;padding:0 56px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border)}
.nav-logo{font-size:.95em;font-weight:700;color:#111;text-decoration:none;letter-spacing:-.3px}
.nav-cta{background:#111;color:#fff;padding:9px 20px;text-decoration:none;font-size:.8em;font-weight:500;border-radius:6px}
.hero{min-height:100vh;display:flex;align-items:center;position:relative;background:#111;overflow:hidden}
.hero-bg{position:absolute;inset:0;${photoB64 ? `background:linear-gradient(100deg,rgba(0,0,0,0.88) 0%,rgba(0,0,0,0.5) 40%,rgba(0,0,0,0.05) 100%),${heroPhoto} center/cover no-repeat;` : `background:#111;`}}
.hero-content{position:relative;z-index:2;max-width:560px;padding:150px 56px 110px}
.hero-label{font-size:.72em;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:24px}
.hero h1{font-size:clamp(2.8em,5vw,4.5em);color:#fff;font-weight:700;line-height:1.05;letter-spacing:-2px;margin-bottom:20px}
.hero-sub{font-size:.95em;color:rgba(255,255,255,0.55);line-height:1.85;margin-bottom:40px;font-weight:300}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.btn-white{background:#fff;color:#111;padding:14px 32px;text-decoration:none;font-weight:700;font-size:.85em;border-radius:6px;transition:all .2s}
.btn-white:hover{background:#f0f0f0;transform:translateY(-2px)}
.btn-ghost{border:1px solid rgba(255,255,255,0.2);color:#fff;padding:14px 32px;text-decoration:none;font-weight:400;font-size:.85em;border-radius:6px;transition:all .2s}
.btn-ghost:hover{border-color:rgba(255,255,255,0.5)}
section{padding:96px 56px}
.section-inner{max-width:1100px;margin:0 auto}
.section-label{font-size:.7em;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:var(--mid);margin-bottom:12px}
.section-title{font-size:clamp(1.8em,3vw,2.5em);font-weight:700;color:#111;letter-spacing:-1px;margin-bottom:14px;line-height:1.1}
.section-sub{color:var(--mid);font-size:.93em;line-height:1.85;max-width:480px;font-weight:300}
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--border);margin-top:56px;border:1px solid var(--border)}
.svc-card{background:#fff;padding:32px;transition:background .2s}
.svc-card:hover{background:var(--light)}
.svc-num{font-size:.72em;font-weight:500;letter-spacing:3px;color:var(--mid);margin-bottom:14px}
.svc-title{font-size:.95em;font-weight:700;color:#111;margin-bottom:6px}
.svc-desc{font-size:.82em;color:var(--mid);line-height:1.75;font-weight:300}
.about{background:var(--light)}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;margin-top:56px}
.about-num{font-size:4em;font-weight:700;color:#111;letter-spacing:-3px;line-height:1;margin-bottom:4px}
.about-num-label{font-size:.78em;color:var(--mid);font-weight:300}
.about-nums{display:flex;gap:40px;margin-top:32px}
.cta{background:#111;text-align:center;padding:96px 56px}
.cta-label{font-size:.7em;font-weight:500;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:16px}
.cta h2{font-size:clamp(2em,4vw,3.2em);color:#fff;font-weight:700;letter-spacing:-1.5px;margin-bottom:12px;line-height:1.05}
.cta-sub{color:rgba(255,255,255,0.4);font-size:.9em;margin-bottom:36px;line-height:1.7;font-weight:300}
.cta-phone{font-size:2em;color:#fff;font-weight:700;text-decoration:none;display:block;margin-bottom:24px;letter-spacing:-1px}
footer{background:#f9f9f9;padding:24px 56px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border)}
.footer-brand{font-size:.85em;font-weight:700;color:#111}
.footer-copy{font-size:.72em;color:var(--mid)}
@media(max-width:768px){nav{padding:0 16px}.hero-content{padding:110px 20px 80px}section{padding:56px 20px}.services-grid{grid-template-columns:1fr}.about-grid{grid-template-columns:1fr}.about-nums{flex-direction:column;gap:20px}.cta{padding:56px 20px}footer{padding:16px;flex-direction:column;gap:8px}}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">${name}</a>
  <a href="#contact" class="nav-cta">${phone || 'Contact Us'}</a>
</nav>
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <div class="hero-label">${type} · ${city}</div>
    <h1>${tagline ? tagline.replace('.', '') : name}</h1>
    <p class="hero-sub">${description || `Simple. Reliable. Professional. ${name} delivers exceptional ${type} services in ${city}.`}</p>
    <div class="hero-btns">
      <a href="#contact" class="btn-white">${phone ? `Call ${phone}` : 'Get in Touch'}</a>
      <a href="#services" class="btn-ghost">Services</a>
    </div>
  </div>
</div>
<section id="services">
  <div class="section-inner">
    <div class="section-label">Services</div>
    <h2 class="section-title">What We Do</h2>
    <p class="section-sub">Clean, focused ${type} services. No fluff — just quality work.</p>
    <div class="services-grid">
      ${svcs.length ? svcs.map((s,i) => `<div class="svc-card"><div class="svc-num">0${i+1}</div><div class="svc-title">${s}</div><div class="svc-desc">${s} done professionally and efficiently.</div></div>`).join('') : `<div class="svc-card"><div class="svc-num">01</div><div class="svc-title">Core Service</div><div class="svc-desc">Professional quality, every time.</div></div>`}
    </div>
  </div>
</section>
<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div>
        <div class="section-label">About</div>
        <h2 class="section-title">${name}</h2>
        <p style="color:var(--mid);line-height:1.85;font-weight:300">${description || `We are ${city}'s trusted ${type}. Our work speaks for itself.`}</p>
        <a href="#contact" class="btn-white" style="display:inline-block;text-decoration:none;margin-top:28px;background:#111;color:#fff;padding:12px 28px;border-radius:6px;font-weight:700;font-size:.85em">Get in Touch</a>
      </div>
      <div>
        <div class="about-nums">
          ${rating ? `<div><div class="about-num">${rating}★</div><div class="about-num-label">Average rating</div></div>` : ''}
          ${reviews ? `<div><div class="about-num">${reviews}+</div><div class="about-num-label">Happy clients</div></div>` : ''}
          <div><div class="about-num">100%</div><div class="about-num-label">Satisfaction rate</div></div>
        </div>
      </div>
    </div>
  </div>
</section>
<div class="cta" id="contact">
  <div class="cta-label">Contact</div>
  <h2>Let's Talk</h2>
  <p class="cta-sub">Reach out to ${name} — we're based in ${city} and ready to help.</p>
  ${phone ? `<a href="tel:${phone.replace(/\D/g,'')}" class="cta-phone">${phone}</a>` : ''}
  <a href="#contact" class="btn-white" style="display:inline-block;text-decoration:none">Get a Free Quote</a>
  ${address ? `<p style="color:rgba(255,255,255,0.2);font-size:.78em;margin-top:20px">${address}</p>` : ''}
</div>
<footer>
  <div class="footer-brand">${name}</div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${name} · Demo by <a href="https://dominionwebdesignpro.com" style="color:var(--mid)">Dominion Web Design Pro</a></div>
</footer>
</body>
</html>`;
}

module.exports = { buildModernTemplate, buildBoldTemplate, buildElegantTemplate, buildRusticTemplate, buildMinimalTemplate };
