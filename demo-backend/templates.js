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
.hero{min-height:620px;max-height:680px;position:relative;display:flex;align-items:center;background:${color};overflow:hidden}
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
.hero{min-height:620px;max-height:680px;background:#000;display:flex;align-items:center;position:relative;overflow:hidden}
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
.hero{min-height:620px;max-height:680px;display:flex;align-items:center;position:relative;overflow:hidden;background:var(--primary)}
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
.hero{min-height:620px;max-height:680px;display:flex;align-items:center;position:relative;background:#111;overflow:hidden}
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

// ── TEMPLATE 6: DOMINION DARK (split screen) ─────────────────────────────
function buildDominionDarkTemplate(data) {
  const { name, type, city, phone, address, rating, reviews, description, services, tagline, photoB64, photoType, primaryColor } = data;
  const color = primaryColor || '#0f1923';
  const svcs = (services || []).slice(0, 6);
  const phoneClean = (phone || '').replace(/\D/g, '');
  const heroPhoto = photoB64 ? `data:${photoType||'image/png'};base64,${photoB64}` : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${city}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--navy:${color};--gold:#c9a84c;--gold2:#e0c070;--white:#fff;--mid:#9ca3af;--dark:#060d14}
body{font-family:'Inter',sans-serif;background:var(--dark);color:var(--white);overflow-x:hidden}
nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(6,13,20,0.95);backdrop-filter:blur(12px);padding:0 56px;height:68px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(201,168,76,0.15)}
.nav-logo{font-family:'Playfair Display',serif;font-size:1.1em;color:var(--white);text-decoration:none;font-weight:700}
.nav-logo span{color:var(--gold)}
.nav-actions{display:flex;align-items:center;gap:20px}
.nav-phone{color:var(--mid);font-size:.84em;text-decoration:none;transition:color .2s}
.nav-phone:hover{color:var(--gold)}
.nav-cta{background:var(--gold);color:var(--dark);padding:10px 24px;border-radius:4px;text-decoration:none;font-weight:700;font-size:.82em;letter-spacing:.5px;transition:all .2s}
.nav-cta:hover{background:var(--gold2)}

/* SPLIT HERO */
.hero{min-height:640px;display:grid;grid-template-columns:1fr 1fr;margin-top:68px}
.hero-left{background:var(--navy);padding:80px 64px 80px 72px;display:flex;flex-direction:column;justify-content:center;position:relative;overflow:hidden}
.hero-left::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(201,168,76,0.06) 0%,transparent 70%);pointer-events:none}
.hero-eyebrow{display:inline-flex;align-items:center;gap:10px;color:var(--gold);font-size:.7em;letter-spacing:4px;text-transform:uppercase;font-weight:600;margin-bottom:24px}
.hero-eyebrow::before{content:'';display:block;width:28px;height:1px;background:var(--gold)}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(2.4em,4vw,3.8em);color:var(--white);font-weight:700;line-height:1.1;letter-spacing:-.5px;margin-bottom:12px}
.hero h1 em{font-style:italic;color:var(--gold);display:block;font-weight:400}
.hero-desc{font-size:.95em;color:var(--mid);line-height:1.85;margin-bottom:36px;font-weight:300;max-width:440px}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:48px}
.btn-gold{background:var(--gold);color:var(--dark);padding:14px 36px;border-radius:4px;text-decoration:none;font-weight:700;font-size:.88em;letter-spacing:.5px;transition:all .2s}
.btn-gold:hover{background:var(--gold2);transform:translateY(-2px)}
.btn-ghost{border:1px solid rgba(255,255,255,0.2);color:var(--white);padding:14px 36px;border-radius:4px;text-decoration:none;font-weight:500;font-size:.88em;transition:all .2s}
.btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
.hero-stats{display:flex;gap:32px;padding-top:36px;border-top:1px solid rgba(255,255,255,0.08)}
.stat-num{font-family:'Playfair Display',serif;font-size:2em;color:var(--gold);font-weight:700;line-height:1;letter-spacing:-1px}
.stat-label{font-size:.68em;color:var(--mid);text-transform:uppercase;letter-spacing:2px;margin-top:4px}
.hero-right{position:relative;overflow:hidden;min-height:600px}
.hero-right img{width:100%;height:100%;object-fit:cover;display:block}
.hero-right-placeholder{width:100%;height:100%;background:linear-gradient(135deg,#1a2a3a,#0a1520);display:flex;align-items:center;justify-content:center;font-size:5em}
.hero-right-overlay{position:absolute;inset:0;background:linear-gradient(270deg,transparent 40%,rgba(6,13,20,0.4) 100%)}

/* FEATURES BAND */
.features-band{background:#0a1520;padding:40px 72px;border-top:1px solid rgba(201,168,76,0.1);border-bottom:1px solid rgba(201,168,76,0.1)}
.features-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(5,1fr);gap:24px}
.feature-item{text-align:center}
.feature-icon{font-size:1.5em;margin-bottom:8px}
.feature-title{font-size:.78em;font-weight:700;color:var(--white);margin-bottom:3px}
.feature-sub{font-size:.7em;color:var(--mid)}

/* SECTIONS */
section{padding:88px 72px}
.section-inner{max-width:1100px;margin:0 auto}
.eyebrow{font-size:.7em;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.section-title{font-family:'Playfair Display',serif;font-size:clamp(1.9em,3vw,2.7em);color:var(--white);margin-bottom:14px;font-weight:700;letter-spacing:-.3px;line-height:1.15}
.section-title em{font-style:italic;color:var(--gold);font-weight:400}
.section-sub{color:var(--mid);font-size:.95em;line-height:1.85;max-width:540px;font-weight:300}

/* SERVICES */
.services{background:#080f16}
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,0.05);margin-top:48px;border:1px solid rgba(255,255,255,0.05)}
.svc-card{background:#080f16;padding:36px 32px;transition:all .25s;position:relative;overflow:hidden}
.svc-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--gold);transform:scaleX(0);transition:transform .3s}
.svc-card:hover{background:#0d1824}
.svc-card:hover::after{transform:scaleX(1)}
.svc-num{font-family:'Playfair Display',serif;font-size:2.5em;color:rgba(201,168,76,0.15);font-weight:700;line-height:1;margin-bottom:16px;transition:color .25s}
.svc-card:hover .svc-num{color:rgba(201,168,76,0.3)}
.svc-title{font-weight:700;font-size:.95em;color:var(--white);margin-bottom:8px}
.svc-desc{font-size:.83em;color:var(--mid);line-height:1.75;font-weight:300}

/* ABOUT */
.about{background:var(--dark)}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.about-img{border-radius:4px;overflow:hidden;position:relative}
.about-img img{width:100%;height:400px;object-fit:cover;display:block}
.about-img-badge{position:absolute;bottom:20px;right:20px;background:var(--gold);color:var(--dark);padding:10px 20px;border-radius:4px;font-weight:700;font-size:.8em}
.about-stat{border-left:2px solid var(--gold);padding:16px 20px;margin-bottom:14px}
.about-stat-num{font-family:'Playfair Display',serif;font-size:2em;color:var(--gold);font-weight:700;line-height:1}
.about-stat-label{font-size:.78em;color:var(--mid);margin-top:3px}
.about-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:28px 0}

/* CTA */
.cta{background:var(--gold);padding:80px 72px;text-align:center}
.cta h2{font-family:'Playfair Display',serif;font-size:clamp(2em,3.5vw,3em);color:var(--dark);font-weight:700;letter-spacing:-.5px;margin-bottom:12px}
.cta-sub{color:rgba(0,0,0,0.6);font-size:1em;margin-bottom:36px;line-height:1.7;font-weight:300}
.cta-phone{font-family:'Playfair Display',serif;font-size:2.2em;color:var(--dark);font-weight:700;text-decoration:none;display:block;margin-bottom:24px;letter-spacing:-1px}
.btn-dark{background:var(--dark);color:var(--gold);padding:15px 40px;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9em;display:inline-block;transition:all .2s}
.btn-dark:hover{background:#0a1520;transform:translateY(-2px)}

/* FOOTER */
footer{background:#030810;padding:32px 72px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;border-top:1px solid rgba(201,168,76,0.1)}
.footer-brand{font-family:'Playfair Display',serif;font-size:.95em;color:var(--white)}
.footer-brand span{color:var(--gold)}
.footer-copy{font-size:.72em;color:#333}

@media(max-width:900px){
  nav{padding:0 20px}
  .hero{grid-template-columns:1fr;margin-top:68px}
  .hero-right{min-height:300px}
  .hero-left{padding:60px 24px}
  .features-band{padding:32px 24px}
  .features-grid{grid-template-columns:repeat(3,1fr)}
  section{padding:56px 24px}
  .about-grid{grid-template-columns:1fr}
  .services-grid{grid-template-columns:1fr}
  .cta{padding:56px 24px}
  footer{padding:24px;flex-direction:column;align-items:flex-start}
}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">${name.split(' ')[0]} <span>${name.split(' ').slice(1).join(' ') || type}</span></a>
  <div class="nav-actions">
    ${phone ? `<a href="tel:${phoneClean}" class="nav-phone">${phone}</a>` : ''}
    <a href="#contact" class="nav-cta">Call Now</a>
  </div>
</nav>

<div class="hero">
  <div class="hero-left">
    <div class="hero-eyebrow">Serving ${city}</div>
    <h1>${tagline ? tagline.split(/[.!]/)[0] : name}<em>${tagline ? (tagline.split(/[.!]/)[1]||type) : `Trusted ${type}`}</em></h1>
    <p class="hero-desc">${description || `${name} is ${city}'s most trusted ${type}. We deliver exceptional results with integrity, care, and expertise.`}</p>
    <div class="hero-btns">
      <a href="${phoneClean ? `tel:${phoneClean}` : '#contact'}" class="btn-gold">📞 ${phone || 'Call Now'}</a>
      <a href="#services" class="btn-ghost">Our Services</a>
    </div>
    <div class="hero-stats">
      ${rating ? `<div><div class="stat-num">${rating}★</div><div class="stat-label">Rating</div></div>` : ''}
      ${reviews ? `<div><div class="stat-num">${reviews}+</div><div class="stat-label">Reviews</div></div>` : ''}
      <div><div class="stat-num">100%</div><div class="stat-label">Satisfaction</div></div>
      <div><div class="stat-num">#1</div><div class="stat-label">In ${city}</div></div>
    </div>
  </div>
  <div class="hero-right">
    ${heroPhoto ? `<img src="${heroPhoto}" alt="${name}"><div class="hero-right-overlay"></div>` : `<div class="hero-right-placeholder">🏆</div>`}
  </div>
</div>

<div class="features-band">
  <div class="features-grid">
    <div class="feature-item"><div class="feature-icon">✓</div><div class="feature-title">Licensed & Insured</div><div class="feature-sub">Fully certified</div></div>
    <div class="feature-item"><div class="feature-icon">⚡</div><div class="feature-title">Fast Service</div><div class="feature-sub">Same-week available</div></div>
    <div class="feature-item"><div class="feature-icon">💰</div><div class="feature-title">Fair Pricing</div><div class="feature-sub">No hidden fees</div></div>
    <div class="feature-item"><div class="feature-icon">📞</div><div class="feature-title">Always Available</div><div class="feature-sub">Call anytime</div></div>
    <div class="feature-item"><div class="feature-icon">🏆</div><div class="feature-title">${rating ? rating+'★ Rated' : '5★ Rated'}</div><div class="feature-sub">${city} trusted</div></div>
  </div>
</div>

<section class="services" id="services">
  <div class="section-inner">
    <div class="eyebrow">What We Offer</div>
    <h2 class="section-title">Our <em>Services</em></h2>
    <p class="section-sub">Professional ${type} services in ${city}. We bring expertise and care to every job.</p>
    <div class="services-grid">
      ${svcs.length ? svcs.map((s,i)=>`<div class="svc-card"><div class="svc-num">0${i+1}</div><div class="svc-title">${s}</div><div class="svc-desc">Expert ${s.toLowerCase()} delivered with skill and care in ${city}.</div></div>`).join('') : `<div class="svc-card"><div class="svc-num">01</div><div class="svc-title">Expert Service</div><div class="svc-desc">Professional quality on every job.</div></div><div class="svc-card"><div class="svc-num">02</div><div class="svc-title">Quality Work</div><div class="svc-desc">We take pride in everything we do.</div></div><div class="svc-card"><div class="svc-num">03</div><div class="svc-title">Local & Trusted</div><div class="svc-desc">Proudly serving ${city}.</div></div>`}
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-img">
        ${heroPhoto ? `<img src="${heroPhoto}" alt="${name}">` : `<div style="width:100%;height:400px;background:linear-gradient(135deg,#0a1520,#1a2a3a);display:flex;align-items:center;justify-content:center;font-size:5em;border-radius:4px">🏆</div>`}
        <div class="about-img-badge">Trusted in ${city}</div>
      </div>
      <div>
        <div class="eyebrow">About Us</div>
        <h2 class="section-title">Why ${city} <em>Chooses Us</em></h2>
        <p style="color:var(--mid);line-height:1.85;font-weight:300;margin-bottom:8px">${description || `At ${name}, we've built our reputation on honest work, fair prices, and genuine care for every client we serve in ${city}.`}</p>
        <div class="about-stats-grid">
          ${rating ? `<div class="about-stat"><div class="about-stat-num">${rating}★</div><div class="about-stat-label">Rating</div></div>` : ''}
          ${reviews ? `<div class="about-stat"><div class="about-stat-num">${reviews}+</div><div class="about-stat-label">Reviews</div></div>` : ''}
          <div class="about-stat"><div class="about-stat-num">100%</div><div class="about-stat-label">Satisfaction</div></div>
          <div class="about-stat"><div class="about-stat-num">#1</div><div class="about-stat-label">In ${city}</div></div>
        </div>
        <a href="#contact" class="btn-gold" style="display:inline-block;text-decoration:none">Get in Touch →</a>
      </div>
    </div>
  </div>
</section>

<div class="cta" id="contact">
  <h2>Ready to Get Started?</h2>
  <p class="cta-sub">Contact ${name} today — ${city}'s most trusted ${type}.</p>
  ${phone ? `<a href="tel:${phoneClean}" class="cta-phone">${phone}</a>` : ''}
  <a href="#contact" class="btn-dark">Get a Free Quote</a>
  ${address ? `<p style="color:rgba(0,0,0,0.4);font-size:.8em;margin-top:20px">${address}</p>` : ''}
</div>

<footer>
  <div class="footer-brand">${name.split(' ')[0]} <span>${name.split(' ').slice(1).join(' ')}</span> · ${city}</div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${name} · Demo by <a href="https://dominionwebdesignpro.com" style="color:#333">Dominion Web Design Pro</a></div>
</footer>
</body>
</html>`;
}

// ── TEMPLATE 7: POWER LOCAL (photo with stats band) ───────────────────────
function buildPowerLocalTemplate(data) {
  const { name, type, city, phone, address, rating, reviews, description, services, tagline, photoB64, photoType, primaryColor } = data;
  const color = primaryColor || '#111827';
  const accent = '#f59e0b';
  const svcs = (services || []).slice(0, 6);
  const phoneClean = (phone || '').replace(/\D/g, '');
  const heroPhoto = photoB64 ? `data:${photoType||'image/png'};base64,${photoB64}` : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${city}</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:${color};--accent:${accent};--white:#fff;--mid:#9ca3af;--dark:#030712}
body{font-family:'Inter',sans-serif;background:var(--dark);color:var(--white);overflow-x:hidden}
nav{position:fixed;top:0;left:0;right:0;z-index:200;background:rgba(3,7,18,0.97);backdrop-filter:blur(12px);padding:0 56px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid ${accent}}
.nav-logo{font-family:'Bebas Neue',sans-serif;font-size:1.5em;color:var(--white);text-decoration:none;letter-spacing:2px}
.nav-logo span{color:${accent}}
.nav-cta{background:${accent};color:#000;padding:10px 24px;text-decoration:none;font-weight:800;font-size:.82em;letter-spacing:1px;text-transform:uppercase;clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)}

/* HERO — full bleed photo with bottom stats band */
.hero{position:relative;height:680px;margin-top:64px;overflow:hidden}
.hero-photo{width:100%;height:100%;object-fit:cover;display:block}
.hero-photo-placeholder{width:100%;height:100%;background:linear-gradient(135deg,${color},#000);display:flex;align-items:center;justify-content:center;font-size:6em}
.hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,7,18,0.2) 0%,rgba(3,7,18,0.5) 50%,rgba(3,7,18,0.92) 100%)}
.hero-content{position:absolute;bottom:0;left:0;right:0;padding:0 72px 0}
.hero-tag{display:inline-block;background:${accent};color:#000;font-weight:800;font-size:.7em;letter-spacing:3px;text-transform:uppercase;padding:5px 14px;margin-bottom:16px;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)}
.hero h1{font-family:'Bebas Neue',sans-serif;font-size:clamp(3.5em,7vw,6em);color:var(--white);line-height:.95;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}
.hero h1 span{color:${accent}}
.hero-desc{font-size:.95em;color:rgba(255,255,255,0.75);line-height:1.7;max-width:560px;margin-bottom:24px;font-weight:300}
.hero-phone{display:inline-block;background:${accent};color:#000;padding:14px 40px;text-decoration:none;font-weight:800;font-size:.95em;letter-spacing:1px;text-transform:uppercase;margin-bottom:0;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);transition:all .2s}
.hero-phone:hover{background:#fbbf24}

/* STATS BAND */
.stats-band{background:${accent};padding:0 72px}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);max-width:1100px;margin:0 auto}
.stat-item{padding:22px 24px;text-align:center;border-right:1px solid rgba(0,0,0,0.15)}
.stat-item:last-child{border-right:none}
.stat-num{font-family:'Bebas Neue',sans-serif;font-size:2.5em;color:#000;line-height:1;letter-spacing:1px}
.stat-label{font-size:.7em;color:rgba(0,0,0,0.6);font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-top:2px}

/* SECTIONS */
section{padding:88px 72px}
.section-inner{max-width:1100px;margin:0 auto}
.eyebrow{font-size:.7em;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:${accent};margin-bottom:10px}
.section-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5em,4vw,4em);color:var(--white);margin-bottom:16px;letter-spacing:1px;text-transform:uppercase;line-height:1}
.section-title span{color:${accent}}
.section-sub{color:var(--mid);font-size:.93em;line-height:1.85;max-width:540px;font-weight:300}

/* SERVICES */
.services{background:#060d14}
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:48px}
.svc-card{background:#0a1520;border:1px solid rgba(255,255,255,0.06);padding:32px;position:relative;overflow:hidden;transition:all .25s}
.svc-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:0;background:${accent};transition:height .3s}
.svc-card:hover{border-color:rgba(245,158,11,0.3);transform:translateY(-3px)}
.svc-card:hover::before{height:100%}
.svc-num{font-family:'Bebas Neue',sans-serif;font-size:3em;color:rgba(255,255,255,0.06);line-height:1;margin-bottom:14px;transition:color .25s}
.svc-card:hover .svc-num{color:rgba(245,158,11,0.15)}
.svc-title{font-weight:700;font-size:.95em;color:var(--white);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px}
.svc-desc{font-size:.82em;color:var(--mid);line-height:1.75;font-weight:300}

/* ABOUT */
.about{background:var(--dark)}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.about-visual{position:relative}
.about-visual img{width:100%;height:440px;object-fit:cover;display:block}
.about-visual-accent{position:absolute;bottom:-16px;right:-16px;width:120px;height:120px;background:${accent};display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:1.4em;color:#000;text-align:center;line-height:1.2;padding:10px}
.about-badge{display:inline-block;background:${accent};color:#000;font-weight:800;font-size:.72em;letter-spacing:2px;text-transform:uppercase;padding:5px 14px;margin-bottom:16px;clip-path:polygon(5px 0%,100% 0%,calc(100% - 5px) 100%,0% 100%)}
.about-desc{color:var(--mid);line-height:1.85;font-weight:300;font-size:.95em;margin-bottom:28px}
.about-facts{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}
.fact{background:#060d14;padding:18px 20px;border-left:3px solid ${accent}}
.fact-num{font-family:'Bebas Neue',sans-serif;font-size:2.2em;color:${accent};line-height:1}
.fact-label{font-size:.75em;color:var(--mid);margin-top:3px;text-transform:uppercase;letter-spacing:1px}

/* CTA */
.cta{background:${accent};padding:80px 72px;text-align:center}
.cta h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(3em,6vw,5em);color:#000;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;line-height:1}
.cta-sub{color:rgba(0,0,0,0.6);font-size:1em;margin-bottom:28px;font-weight:300}
.cta-phone{font-family:'Bebas Neue',sans-serif;font-size:3em;color:#000;font-weight:400;text-decoration:none;display:block;margin-bottom:20px;letter-spacing:2px}
.btn-black{background:#000;color:${accent};padding:15px 44px;text-decoration:none;font-weight:800;font-size:.88em;letter-spacing:2px;text-transform:uppercase;display:inline-block;clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%);transition:all .2s}
.btn-black:hover{background:#0a0a0a}

footer{background:#000;padding:28px 72px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;border-top:2px solid ${accent}}
.footer-logo{font-family:'Bebas Neue',sans-serif;font-size:1.2em;color:var(--white);letter-spacing:2px}
.footer-logo span{color:${accent}}
.footer-copy{font-size:.72em;color:#333}

@media(max-width:768px){
  nav{padding:0 16px}
  .hero{height:500px}
  .hero-content{padding:0 20px 0}
  .hero h1{font-size:3em}
  .stats-band{padding:0 20px}
  .stats-grid{grid-template-columns:1fr 1fr}
  section{padding:56px 20px}
  .services-grid{grid-template-columns:1fr}
  .about-grid{grid-template-columns:1fr}
  .cta{padding:56px 20px}
  footer{padding:20px;flex-direction:column}
}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">${name.split(' ')[0]}<span>${name.split(' ').slice(1).join(' ')||''}</span></a>
  <a href="#contact" class="nav-cta">Call Now</a>
</nav>

<div class="hero">
  ${heroPhoto ? `<img src="${heroPhoto}" alt="${name}" class="hero-photo">` : `<div class="hero-photo-placeholder">🏆</div>`}
  <div class="hero-overlay"></div>
  <div class="hero-content">
    <div class="hero-tag">${city} · ${type}</div>
    <h1>${tagline ? tagline.split(/[.!]/)[0] : name}<br><span>${tagline ? (tagline.split(/[.!]/)[1]||type) : type}</span></h1>
    <p class="hero-desc">${description || `${city}'s most trusted ${type}. We deliver results you can count on.`}</p>
    ${phone ? `<a href="tel:${phoneClean}" class="hero-phone">📞 Call ${phone}</a>` : ''}
  </div>
</div>

<div class="stats-band">
  <div class="stats-grid">
    ${rating ? `<div class="stat-item"><div class="stat-num">${rating}★</div><div class="stat-label">Rating</div></div>` : '<div class="stat-item"><div class="stat-num">5★</div><div class="stat-label">Top Rated</div></div>'}
    ${reviews ? `<div class="stat-item"><div class="stat-num">${reviews}+</div><div class="stat-label">Reviews</div></div>` : '<div class="stat-item"><div class="stat-num">100+</div><div class="stat-label">Clients</div></div>'}
    <div class="stat-item"><div class="stat-num">100%</div><div class="stat-label">Satisfaction</div></div>
    <div class="stat-item"><div class="stat-num">#1</div><div class="stat-label">In ${city}</div></div>
  </div>
</div>

<section class="services" id="services">
  <div class="section-inner">
    <div class="eyebrow">What We Do</div>
    <h2 class="section-title">Our <span>Services</span></h2>
    <p class="section-sub">Professional ${type} in ${city}. We bring expertise and dedication to every job.</p>
    <div class="services-grid">
      ${svcs.length ? svcs.map((s,i)=>`<div class="svc-card"><div class="svc-num">0${i+1}</div><div class="svc-title">${s}</div><div class="svc-desc">Professional ${s.toLowerCase()} delivered with skill and care.</div></div>`).join('') : `<div class="svc-card"><div class="svc-num">01</div><div class="svc-title">Expert Service</div><div class="svc-desc">Quality work on every job.</div></div><div class="svc-card"><div class="svc-num">02</div><div class="svc-title">Fast Turnaround</div><div class="svc-desc">We respect your time.</div></div><div class="svc-card"><div class="svc-num">03</div><div class="svc-title">Fair Prices</div><div class="svc-desc">No surprises, ever.</div></div>`}
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-visual">
        ${heroPhoto ? `<img src="${heroPhoto}" alt="${name}">` : `<div style="width:100%;height:440px;background:linear-gradient(135deg,#0a1520,#000);display:flex;align-items:center;justify-content:center;font-size:6em">🏆</div>`}
        <div class="about-visual-accent">#1 IN<br>${city.toUpperCase()}</div>
      </div>
      <div>
        <div class="about-badge">About ${name.split(' ')[0]}</div>
        <h2 class="section-title">Why We're <span>Different</span></h2>
        <p class="about-desc">${description || `At ${name}, we don't just do the job — we do it right. Every client in ${city} gets our full attention, our best work, and our honest pricing.`}</p>
        <div class="about-facts">
          ${rating ? `<div class="fact"><div class="fact-num">${rating}★</div><div class="fact-label">Avg Rating</div></div>` : ''}
          ${reviews ? `<div class="fact"><div class="fact-num">${reviews}+</div><div class="fact-label">Happy Clients</div></div>` : ''}
          <div class="fact"><div class="fact-num">100%</div><div class="fact-label">Satisfaction</div></div>
          <div class="fact"><div class="fact-num">#1</div><div class="fact-label">In ${city}</div></div>
        </div>
        <a href="#contact" style="display:inline-block;background:${accent};color:#000;padding:14px 36px;text-decoration:none;font-weight:800;font-size:.88em;letter-spacing:1px;text-transform:uppercase;clip-path:polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)">Get a Free Quote</a>
      </div>
    </div>
  </div>
</section>

<div class="cta" id="contact">
  <h2>Let's Get To Work</h2>
  <p class="cta-sub">${name} — ${city}'s trusted ${type}. Call today.</p>
  ${phone ? `<a href="tel:${phoneClean}" class="cta-phone">${phone}</a>` : ''}
  <a href="#contact" class="btn-black">Get a Free Quote Today</a>
  ${address ? `<p style="color:rgba(0,0,0,0.4);font-size:.8em;margin-top:16px">${address}</p>` : ''}
</div>

<footer>
  <div class="footer-logo">${name.split(' ')[0]}<span>${name.split(' ').slice(1).join(' ')||''}</span></div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${name} · Demo by <a href="https://dominionwebdesignpro.com" style="color:#333">Dominion Web Design Pro</a></div>
</footer>
</body>
</html>`;
}

// ── TEMPLATE 8: MAGAZINE (photo top, content below) ──────────────────────
function buildMagazineTemplate(data) {
  const { name, type, city, phone, address, rating, reviews, description, services, tagline, photoB64, photoType, primaryColor } = data;
  const color = primaryColor || '#1a1a2e';
  const svcs = (services || []).slice(0, 6);
  const phoneClean = (phone || '').replace(/\D/g, '');
  const heroPhoto = photoB64 ? `data:${photoType||'image/png'};base64,${photoB64}` : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${city}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--primary:${color};--gold:#c9a84c;--white:#fff;--cream:#fafaf8;--dark:#0d0d0d;--mid:#6b7280;--border:#e5e5e0}
body{font-family:'DM Sans',sans-serif;color:var(--dark);overflow-x:hidden;background:var(--cream)}

/* NAV — transparent over photo */
nav{position:absolute;top:0;left:0;right:0;z-index:200;padding:0 64px;height:72px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg,rgba(0,0,0,0.5) 0%,transparent 100%)}
.nav-logo{font-family:'DM Serif Display',serif;font-size:1.2em;color:var(--white);text-decoration:none;font-style:italic}
.nav-cta{background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.3);color:var(--white);padding:9px 22px;border-radius:100px;text-decoration:none;font-weight:500;font-size:.82em;transition:all .2s}
.nav-cta:hover{background:var(--gold);border-color:var(--gold);color:#000}

/* MAGAZINE HERO — photo fills top half */
.hero-photo-section{position:relative;height:65vh;min-height:480px;max-height:620px;overflow:hidden}
.hero-photo-section img{width:100%;height:100%;object-fit:cover;display:block}
.hero-photo-placeholder{width:100%;height:100%;background:linear-gradient(135deg,${color},#000);display:flex;align-items:center;justify-content:center;font-size:6em}
.hero-photo-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0.15) 0%,rgba(0,0,0,0.0) 40%,rgba(13,13,13,0.6) 100%)}
.hero-photo-label{position:absolute;top:80px;left:64px;background:var(--gold);color:#000;padding:5px 14px;border-radius:100px;font-size:.72em;font-weight:700;letter-spacing:1px}
.hero-photo-rating{position:absolute;bottom:28px;right:64px;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.2);color:var(--white);padding:10px 18px;border-radius:100px;font-size:.82em;font-weight:600}

/* CONTENT BELOW PHOTO */
.hero-content{background:var(--primary);padding:52px 64px 64px}
.hero-content-inner{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.hero-h1{font-family:'DM Serif Display',serif;font-size:clamp(2.4em,4vw,3.6em);color:var(--white);line-height:1.1;letter-spacing:-.3px;margin-bottom:0}
.hero-h1 em{font-style:italic;color:var(--gold)}
.hero-right-content{}
.hero-desc{font-size:.95em;color:rgba(255,255,255,0.65);line-height:1.85;margin-bottom:28px;font-weight:300}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px}
.btn-gold{background:var(--gold);color:#000;padding:13px 32px;border-radius:100px;text-decoration:none;font-weight:700;font-size:.88em;transition:all .2s}
.btn-gold:hover{background:#e0c070;transform:translateY(-2px)}
.btn-outline{border:1px solid rgba(255,255,255,0.25);color:var(--white);padding:13px 32px;border-radius:100px;text-decoration:none;font-weight:400;font-size:.88em;transition:all .2s}
.btn-outline:hover{border-color:var(--gold);color:var(--gold)}
.hero-stats{display:flex;gap:24px}
.hstat{text-align:center}
.hstat-num{font-family:'DM Serif Display',serif;font-size:1.6em;color:var(--gold);font-weight:400;line-height:1}
.hstat-label{font-size:.65em;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:2px;margin-top:3px}

/* SECTIONS */
section{padding:88px 64px}
.section-inner{max-width:1100px;margin:0 auto}
.section-kicker{font-size:.7em;font-weight:600;letter-spacing:4px;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.section-title{font-family:'DM Serif Display',serif;font-size:clamp(1.9em,3vw,2.8em);color:var(--dark);margin-bottom:14px;line-height:1.15}
.section-title em{font-style:italic;color:var(--primary)}
.section-sub{color:var(--mid);font-size:.95em;line-height:1.85;max-width:520px;font-weight:300}

/* SERVICES */
.services{background:var(--cream)}
.services-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:48px}
.svc-card{background:var(--white);border-radius:16px;padding:32px 28px;border:1px solid var(--border);transition:all .25s;position:relative;overflow:hidden}
.svc-card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(201,168,76,0.04),transparent);opacity:0;transition:opacity .3s}
.svc-card:hover{transform:translateY(-4px);box-shadow:0 16px 48px rgba(0,0,0,0.1)}
.svc-card:hover::before{opacity:1}
.svc-icon{width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,var(--primary),rgba(0,0,0,0.8));display:flex;align-items:center;justify-content:center;font-size:1.2em;margin-bottom:16px}
.svc-title{font-weight:700;font-size:.95em;color:var(--dark);margin-bottom:8px}
.svc-desc{font-size:.83em;color:var(--mid);line-height:1.75;font-weight:300}

/* ABOUT */
.about{background:var(--white)}
.about-grid{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center}
.about-quote{font-family:'DM Serif Display',serif;font-size:1.4em;font-style:italic;color:var(--dark);line-height:1.65;margin-bottom:24px;padding-left:20px;border-left:3px solid var(--gold)}
.about-stats{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
.astat{background:var(--cream);border-radius:12px;padding:20px;text-align:center}
.astat-num{font-family:'DM Serif Display',serif;font-size:2em;color:var(--primary);font-weight:400;line-height:1}
.astat-label{font-size:.72em;color:var(--mid);margin-top:4px}
.about-img{border-radius:20px;overflow:hidden;position:relative}
.about-img img{width:100%;height:420px;object-fit:cover;display:block}
.about-img-tag{position:absolute;bottom:20px;left:20px;background:var(--gold);color:#000;padding:8px 16px;border-radius:100px;font-weight:700;font-size:.78em}

/* CTA */
.cta{background:var(--primary);padding:88px 64px;text-align:center}
.cta h2{font-family:'DM Serif Display',serif;font-size:clamp(2.2em,4vw,3.2em);color:var(--white);margin-bottom:12px;line-height:1.1}
.cta h2 em{font-style:italic;color:var(--gold)}
.cta-sub{color:rgba(255,255,255,0.55);font-size:.97em;margin-bottom:36px;line-height:1.8;font-weight:300}
.cta-phone{font-family:'DM Serif Display',serif;font-size:2.4em;color:var(--gold);font-weight:400;text-decoration:none;display:block;margin-bottom:24px}
.cta-address{font-size:.82em;color:rgba(255,255,255,0.25);margin-top:20px;line-height:1.7}

footer{background:#050505;padding:32px 64px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px}
.footer-name{font-family:'DM Serif Display',serif;font-style:italic;color:var(--white);font-size:1em}
.footer-copy{font-size:.72em;color:#2a2a2a}

@media(max-width:768px){
  nav{padding:0 20px}
  .hero-photo-section{height:50vh;min-height:320px}
  .hero-photo-label{left:20px}
  .hero-photo-rating{right:20px}
  .hero-content{padding:36px 20px 48px}
  .hero-content-inner{grid-template-columns:1fr;gap:28px}
  section{padding:56px 20px}
  .services-grid{grid-template-columns:1fr}
  .about-grid{grid-template-columns:1fr}
  .about-stats{grid-template-columns:1fr 1fr}
  .cta{padding:56px 20px}
  footer{padding:20px;flex-direction:column}
}
</style>
</head>
<body>
<nav>
  <a href="/" class="nav-logo">${name}</a>
  <a href="#contact" class="nav-cta">📞 Call Now</a>
</nav>

<div class="hero-photo-section">
  ${heroPhoto ? `<img src="${heroPhoto}" alt="${name}">` : `<div class="hero-photo-placeholder">🏆</div>`}
  <div class="hero-photo-overlay"></div>
  <div class="hero-photo-label">📍 ${city}</div>
  ${rating ? `<div class="hero-photo-rating">★ ${rating} · ${reviews}+ Reviews</div>` : ''}
</div>

<div class="hero-content">
  <div class="hero-content-inner">
    <h1 class="hero-h1">${tagline ? tagline.split(/[.!]/)[0] : name}<br><em>${tagline ? (tagline.split(/[.!]/)[1]||type) : `Trusted ${type}`}</em></h1>
    <div class="hero-right-content">
      <p class="hero-desc">${description || `${name} delivers exceptional ${type} services to ${city} and surrounding areas. Honest pricing. Expert work. Guaranteed.`}</p>
      <div class="hero-btns">
        <a href="${phoneClean ? `tel:${phoneClean}` : '#contact'}" class="btn-gold">📞 ${phone || 'Call Now'}</a>
        <a href="#services" class="btn-outline">Our Services</a>
      </div>
      <div class="hero-stats">
        ${rating ? `<div class="hstat"><div class="hstat-num">${rating}★</div><div class="hstat-label">Rating</div></div>` : ''}
        ${reviews ? `<div class="hstat"><div class="hstat-num">${reviews}+</div><div class="hstat-label">Reviews</div></div>` : ''}
        <div class="hstat"><div class="hstat-num">100%</div><div class="hstat-label">Satisfaction</div></div>
      </div>
    </div>
  </div>
</div>

<section class="services" id="services">
  <div class="section-inner">
    <div class="section-kicker">What We Offer</div>
    <h2 class="section-title">Our <em>Services</em></h2>
    <p class="section-sub">Professional ${type} in ${city}. Every service delivered with expertise and care.</p>
    <div class="services-grid">
      ${svcs.length ? svcs.map(s=>`<div class="svc-card"><div class="svc-icon">✓</div><div class="svc-title">${s}</div><div class="svc-desc">Expert ${s.toLowerCase()} tailored to your specific needs in ${city}.</div></div>`).join('') : `<div class="svc-card"><div class="svc-icon">⭐</div><div class="svc-title">Expert Service</div><div class="svc-desc">Professional quality every time.</div></div><div class="svc-card"><div class="svc-icon">⚡</div><div class="svc-title">Fast Turnaround</div><div class="svc-desc">We respect your time.</div></div><div class="svc-card"><div class="svc-icon">💰</div><div class="svc-title">Fair Pricing</div><div class="svc-desc">Transparent, honest quotes.</div></div>`}
    </div>
  </div>
</section>

<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div>
        <div class="section-kicker">Who We Are</div>
        <h2 class="section-title">Why ${city} <em>Trusts</em> Us</h2>
        <p class="about-quote">"${description ? description.split('.')[0] + '.' : `We treat every client the way we'd want to be treated — with honesty, expertise, and genuine care.`}"</p>
        <div class="about-stats">
          ${rating ? `<div class="astat"><div class="astat-num">${rating}★</div><div class="astat-label">Rating</div></div>` : '<div class="astat"><div class="astat-num">5★</div><div class="astat-label">Rated</div></div>'}
          ${reviews ? `<div class="astat"><div class="astat-num">${reviews}+</div><div class="astat-label">Reviews</div></div>` : '<div class="astat"><div class="astat-num">100+</div><div class="astat-label">Clients</div></div>'}
          <div class="astat"><div class="astat-num">100%</div><div class="astat-label">Satisfaction</div></div>
          <div class="astat"><div class="astat-num">#1</div><div class="astat-label">In ${city}</div></div>
        </div>
        <a href="#contact" class="btn-gold" style="text-decoration:none;display:inline-block">Get a Free Quote →</a>
      </div>
      <div class="about-img">
        ${heroPhoto ? `<img src="${heroPhoto}" alt="${name}">` : `<div style="width:100%;height:420px;background:linear-gradient(135deg,${color},#000);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:5em">🏆</div>`}
        <div class="about-img-tag">Trusted in ${city}</div>
      </div>
    </div>
  </div>
</section>

<div class="cta" id="contact">
  <h2>Ready to Work With <em>The Best?</em></h2>
  <p class="cta-sub">${name} — ${city}'s trusted ${type}. Call us today.</p>
  ${phone ? `<a href="tel:${phoneClean}" class="cta-phone">${phone}</a>` : ''}
  <a href="#contact" class="btn-gold" style="text-decoration:none;display:inline-block">Get a Free Consultation →</a>
  ${address ? `<div class="cta-address">${address}<br>${city}</div>` : ''}
</div>

<footer>
  <div class="footer-name">${name}</div>
  <div class="footer-copy">© ${new Date().getFullYear()} ${name} · Demo by <a href="https://dominionwebdesignpro.com" style="color:#2a2a2a">Dominion Web Design Pro</a></div>
</footer>
</body>
</html>`;
}

module.exports = { buildModernTemplate, buildBoldTemplate, buildElegantTemplate, buildRusticTemplate, buildMinimalTemplate, buildDominionDarkTemplate, buildPowerLocalTemplate, buildMagazineTemplate };
