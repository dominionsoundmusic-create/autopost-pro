// ── PREMIUM SITE BUILDER ──────────────────────────────────────────────────
// Truly premium multi-photo sites with rich sections and real business data

function buildPremiumSite(data) {
  const {
    name, type, city, state, phone, address,
    rating, reviews, description, services, tagline, hours,
    facebookUrl, instagramUrl, yelpUrl, googleUrl, websiteUrl,
    primaryColor, photoB64, photoType, logoB64, logoType,
    photo2B64, photo2Type, photo3B64, photo3Type, photo4B64, photo4Type,
    reviewTexts, teamNames, isBlackOwned, isWomanOwned, isLatinoOwned
  } = data;

  const color = primaryColor || '#1a2332';
  const colorRGB = hexToRgb(color);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Build photo data URLs
  const heroPhotoUrl = photoB64 ? `data:${photoType||'image/png'};base64,${photoB64}` : null;
  const photo2Url = photo2B64 ? `data:${photo2Type||'image/png'};base64,${photo2B64}` : null;
  const photo3Url = photo3B64 ? `data:${photo3Type||'image/png'};base64,${photo3B64}` : null;
  const photo4Url = photo4B64 ? `data:${photo4Type||'image/png'};base64,${photo4B64}` : null;

  const svcs = (services || []).slice(0, 6);
  const revs = reviewTexts || [];
  const phoneClean = (phone || '').replace(/\D/g, '');
  const cityState = `${city}${state ? ', ' + state : ''}`;

  // Social links
  const socialLinks = [
    facebookUrl ? `<a href="${facebookUrl}" target="_blank" class="social-link">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
    </a>` : '',
    instagramUrl ? `<a href="${instagramUrl}" target="_blank" class="social-link">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
    </a>` : '',
    yelpUrl ? `<a href="${yelpUrl}" target="_blank" class="social-link">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-4-4 1.41-1.41L11 14.17l6.59-6.59L19 9l-8 8z"/></svg>
    </a>` : '',
  ].filter(Boolean).join('');

  // Reviews section
  const logoUrl = logoB64 ? `data:${logoType||'image/png'};base64,${logoB64}` : null;

  const reviewsHtml = revs.length ? revs.slice(0,3).map(r => {
    // r may be a plain string (older callers) or a real Google review object
    const text   = typeof r === 'string' ? r : (r.text || '');
    const author = typeof r === 'string' ? '' : (r.author || '');
    const when   = typeof r === 'string' ? '' : (r.when || '');
    const stars  = '★'.repeat(Math.round((typeof r === 'string' ? 5 : (r.rating || 5))));
    return `
    <div class="review-card">
      <div class="review-stars">${stars}</div>
      <p class="review-text">"${text}"</p>
      ${author ? `<div class="review-author">— ${author}${when ? ` · ${when}` : ''}</div>` : ''}
    </div>
  `;}).join('') : `
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">"Absolutely the best ${type} in ${city}. Professional, knowledgeable, and genuinely caring. I wouldn't go anywhere else."</p>
    </div>
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">"${name} exceeded every expectation. Fair prices, excellent work, and they really take the time to make sure you're happy."</p>
    </div>
    <div class="review-card">
      <div class="review-stars">★★★★★</div>
      <p class="review-text">"I've been coming here for years and have never been disappointed. The whole team is wonderful."</p>
    </div>
  `;

  // Hours section
  const hoursHtml = hours && hours.length ? hours.map(h => `
    <div class="hours-row">
      <span class="hours-day">${h.split(':')[0]}</span>
      <span class="hours-time">${h.split(':').slice(1).join(':').trim()}</span>
    </div>
  `).join('') : `
    <div class="hours-row"><span class="hours-day">Monday – Friday</span><span class="hours-time">8:00 AM – 6:00 PM</span></div>
    <div class="hours-row"><span class="hours-day">Saturday</span><span class="hours-time">9:00 AM – 4:00 PM</span></div>
    <div class="hours-row"><span class="hours-day">Sunday</span><span class="hours-time">Closed</span></div>
  `;

  // Ownership badges
  const badges = [
    isBlackOwned ? '🟫 Black-Owned Business' : '',
    isWomanOwned ? '🟡 Woman-Owned Business' : '',
    isLatinoOwned ? '🟠 Latino-Owned Business' : '',
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name} | ${type} | ${cityState}</title>
<meta name="description" content="${description || `${name} — trusted ${type} serving ${cityState}. ${phone ? 'Call ' + phone + '.' : ''}`}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,300;1,400&family=Source+Sans+3:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --primary:${color};
  --primary-r:${colorRGB.r};
  --primary-g:${colorRGB.g};
  --primary-b:${colorRGB.b};
  --gold:#c9a84c;
  --gold2:#e0c070;
  --cream:#f7f3ec;
  --cream2:#ede8df;
  --white:#ffffff;
  --dark:#111827;
  --mid:#6b7280;
  --border:#e5e7eb;
  --ff-display:'Playfair Display',Georgia,serif;
  --ff-body:'Source Sans 3',system-ui,sans-serif;
  --radius:12px;
  --shadow:0 4px 24px rgba(0,0,0,0.08);
  --shadow-lg:0 12px 48px rgba(0,0,0,0.14);
}
html{scroll-behavior:smooth}
body{font-family:var(--ff-body);color:var(--dark);background:#fff;overflow-x:hidden}

/* ── NAV ── */
nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  background:rgba(var(--primary-r),var(--primary-g),var(--primary-b),0.97);
  backdrop-filter:blur(16px);
  padding:0 56px;height:70px;
  display:flex;align-items:center;justify-content:space-between;
  border-bottom:1px solid rgba(201,168,76,0.25);
}
.nav-brand{display:flex;align-items:center;gap:12px;text-decoration:none}
.nav-brand-icon{
  width:40px;height:40px;border-radius:10px;
  background:linear-gradient(135deg,var(--gold),var(--gold2));
  display:flex;align-items:center;justify-content:center;
  font-size:1.1em;flex-shrink:0;
}
.nav-brand-name{font-family:var(--ff-display);font-size:1.05em;color:#fff;font-weight:700;line-height:1.1}
.nav-brand-name span{display:block;font-size:.65em;color:rgba(255,255,255,0.5);font-family:var(--ff-body);font-weight:400;letter-spacing:1px;font-style:normal}
.nav-right{display:flex;align-items:center;gap:20px}
.nav-phone{color:rgba(255,255,255,0.7);text-decoration:none;font-size:.85em;font-weight:500;transition:color .2s}
.nav-phone:hover{color:var(--gold)}
.nav-cta{
  background:var(--gold);color:var(--dark);
  padding:10px 24px;border-radius:6px;
  text-decoration:none;font-weight:700;font-size:.82em;
  letter-spacing:.5px;transition:all .2s;
}
.nav-cta:hover{background:var(--gold2);transform:translateY(-1px)}

/* ── HERO ── */
.hero{
  min-height:620px;max-height:680px;position:relative;
  display:flex;align-items:center;
  overflow:hidden;background:var(--primary);
}
.hero-bg{
  position:absolute;inset:0;
  ${heroPhotoUrl ? `
  background:
    linear-gradient(100deg,rgba(var(--primary-r),var(--primary-g),var(--primary-b),0.90) 0%,
    rgba(var(--primary-r),var(--primary-g),var(--primary-b),0.60) 35%,
    rgba(var(--primary-r),var(--primary-g),var(--primary-b),0.08) 65%,
    rgba(var(--primary-r),var(--primary-g),var(--primary-b),0.0) 100%),
    url('${heroPhotoUrl}') center/cover no-repeat;
  ` : `
  background:linear-gradient(135deg,var(--primary) 0%,rgba(0,0,0,0.85) 100%);
  `}
}
.hero-texture{
  position:absolute;inset:0;opacity:.03;
  background-image:url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E");
  pointer-events:none;
}
.hero-content{
  position:relative;z-index:2;
  max-width:640px;padding:max(110px,calc(70px + 40px)) 72px 60px;
}
.hero-eyebrow{
  display:inline-flex;align-items:center;gap:10px;
  color:var(--gold);font-size:.72em;
  letter-spacing:4px;text-transform:uppercase;
  font-weight:600;margin-bottom:24px;
}
.hero-eyebrow::before{content:'';display:block;width:32px;height:1px;background:var(--gold);opacity:.6}
.hero h1{
  font-family:var(--ff-display);
  font-size:clamp(1.5em,2.8vw,2.4em);
  color:#fff;font-weight:700;
  line-height:1.06;letter-spacing:-1.5px;
  margin-bottom:16px;
}
.hero h1 em{
  font-style:italic;color:var(--gold);
  font-weight:400;display:block;
}
.hero-desc{
  font-size:.92em;color:#fff;
  line-height:1.75;margin-bottom:32px;
  max-width:480px;font-weight:400;
  background:rgba(0,0,0,0.72);
  backdrop-filter:blur(8px);
  padding:14px 18px;
  border-radius:6px;
  border-left:3px solid var(--gold);
  display:inline-block;
}
.hero-actions{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:52px}
.btn-primary{
  background:var(--gold);color:var(--dark);
  padding:15px 40px;border-radius:6px;
  text-decoration:none;font-weight:700;font-size:.9em;
  letter-spacing:.5px;transition:all .25s;
  box-shadow:0 4px 24px rgba(201,168,76,0.4);
  display:inline-flex;align-items:center;gap:8px;
}
.btn-primary:hover{background:var(--gold2);transform:translateY(-2px);box-shadow:0 8px 32px rgba(201,168,76,0.5)}
.btn-secondary{
  background:rgba(255,255,255,0.1);color:#fff;
  padding:15px 40px;border-radius:6px;
  text-decoration:none;font-weight:500;font-size:.9em;
  border:1px solid rgba(255,255,255,0.25);
  transition:all .25s;display:inline-flex;align-items:center;gap:8px;
}
.btn-secondary:hover{background:rgba(255,255,255,0.18);border-color:var(--gold);color:var(--gold)}
.hero-trust{
  display:flex;gap:32px;
  padding-top:40px;border-top:1px solid rgba(255,255,255,0.1);
}
.trust-item{}
.trust-num{
  font-family:var(--ff-display);font-size:1.8em;
  color:var(--gold);font-weight:700;line-height:1;letter-spacing:-1px;
}
.trust-label{font-size:.68em;color:rgba(255,255,255,0.45);text-transform:uppercase;letter-spacing:2px;margin-top:3px}
${badges.length ? `.hero-badges{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.hero-badge{background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.8);padding:4px 12px;border-radius:20px;font-size:.72em;font-weight:600}` : ''}

/* ── TRUST BAR ── */
.trust-bar{
  background:var(--dark);
  padding:20px 72px;
  display:flex;align-items:center;justify-content:center;gap:48px;flex-wrap:wrap;
  border-bottom:1px solid rgba(255,255,255,0.06);
}
.trust-bar-item{
  display:flex;align-items:center;gap:10px;
  color:rgba(255,255,255,0.6);font-size:.82em;font-weight:500;
}
.trust-bar-icon{color:var(--gold);font-size:1.1em}

/* ── SECTION BASE ── */
section{padding:96px 72px}
.section-inner{max-width:1160px;margin:0 auto}
.eyebrow{
  font-size:.7em;font-weight:600;letter-spacing:4px;
  text-transform:uppercase;color:var(--gold);margin-bottom:10px;
}
.section-title{
  font-family:var(--ff-display);
  font-size:clamp(1.9em,3.2vw,2.8em);
  color:var(--dark);margin-bottom:14px;
  font-weight:700;letter-spacing:-.5px;line-height:1.15;
}
.section-title em{font-style:italic;color:var(--primary);font-weight:400}
.section-sub{
  color:var(--mid);font-size:1em;
  line-height:1.85;max-width:560px;font-weight:300;
}
.section-divider{
  display:flex;align-items:center;gap:16px;
  margin:16px 0 48px;
}
.section-divider-line{height:1px;background:var(--border);flex:1}
.section-divider-dot{width:6px;height:6px;background:var(--gold);border-radius:50%;flex-shrink:0}

/* ── SERVICES ── */
.services{background:var(--cream)}
.services-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:20px;margin-top:0;
}
.svc-card{
  background:#fff;border-radius:var(--radius);
  padding:32px 28px;position:relative;overflow:hidden;
  border:1px solid var(--border);
  transition:all .25s;
}
.svc-card::before{
  content:'';position:absolute;top:0;left:0;
  right:0;height:3px;background:var(--gold);
  transform:scaleX(0);transform-origin:left;transition:transform .3s;
}
.svc-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
.svc-card:hover::before{transform:scaleX(1)}
.svc-num{
  font-family:var(--ff-display);font-size:3em;
  color:var(--border);font-weight:700;line-height:1;
  margin-bottom:16px;transition:color .25s;
}
.svc-card:hover .svc-num{color:rgba(201,168,76,0.2)}
.svc-title{font-weight:700;font-size:.98em;color:var(--dark);margin-bottom:8px}
.svc-desc{font-size:.84em;color:var(--mid);line-height:1.75;font-weight:300}

/* ── ABOUT SPLIT ── */
.about{background:#fff}
.about-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:72px;align-items:center;
}
.about-photo-wrap{
  position:relative;border-radius:var(--radius);overflow:hidden;
  aspect-ratio:4/3;
}
.about-photo{width:100%;height:100%;object-fit:cover;display:block}
.about-photo-placeholder{
  width:100%;height:100%;
  background:linear-gradient(135deg,var(--primary) 0%,rgba(0,0,0,0.8) 100%);
  display:flex;align-items:center;justify-content:center;
  font-size:4em;
}
.about-photo-badge{
  position:absolute;bottom:20px;left:20px;
  background:var(--gold);color:var(--dark);
  padding:8px 18px;border-radius:6px;
  font-weight:700;font-size:.78em;letter-spacing:.5px;
}
.about-content{}
.about-stats{
  display:grid;grid-template-columns:1fr 1fr;
  gap:16px;margin:32px 0;
}
.about-stat{
  background:var(--cream);border-radius:8px;
  padding:20px;border-left:3px solid var(--gold);
}
.about-stat-num{
  font-family:var(--ff-display);font-size:2em;
  color:var(--primary);font-weight:700;line-height:1;
}
.about-stat-label{font-size:.76em;color:var(--mid);margin-top:4px}

/* ── GALLERY ── */
.gallery{background:var(--cream)}
.gallery-grid{
  display:grid;
  grid-template-columns:${photo2Url && photo3Url ? 'repeat(3,1fr)' : photo2Url ? '1fr 1fr' : '1fr'};
  gap:16px;margin-top:0;
}
.gallery-item{
  border-radius:var(--radius);overflow:hidden;
  aspect-ratio:16/10;position:relative;
}
.gallery-item img{
  width:100%;height:100%;object-fit:cover;
  transition:transform .4s;display:block;
}
.gallery-item:hover img{transform:scale(1.04)}
.gallery-item-placeholder{
  width:100%;height:100%;
  background:linear-gradient(135deg,var(--cream2),var(--border));
  display:flex;align-items:center;justify-content:center;
  font-size:3em;
}

/* ── REVIEWS ── */
.reviews{background:var(--primary)}
.reviews .eyebrow{color:var(--gold)}
.reviews .section-title{color:#fff}
.reviews .section-title em{color:var(--gold)}
.review-author{margin-top:14px;font-size:.85rem;color:var(--gold);font-weight:600;letter-spacing:.02em}
.dlang{display:flex;align-items:stretch;background:rgba(255,255,255,.07);
border:1.5px solid rgba(255,255,255,.2);border-radius:5px;overflow:hidden;flex:0 0 auto}
.dlang-b{display:flex;align-items:center;gap:8px;background:none;border:0;cursor:pointer;
font-family:var(--ff-body);font-size:.82em;font-weight:700;letter-spacing:.05em;
color:rgba(255,255,255,.65);padding:10px 14px;line-height:1;transition:background .15s,color .15s}
.dlang-b + .dlang-b{border-left:1.5px solid rgba(255,255,255,.2)}
.dlang-b:hover{color:#fff;background:rgba(255,255,255,.1)}
.dlang-b.is-on{background:var(--gold);color:var(--primary)}
.dlang-b:focus-visible{outline:2px solid var(--gold);outline-offset:-2px}
.dlang-f{width:24px;height:16px;border-radius:2px;overflow:hidden;display:block;flex:0 0 auto;
box-shadow:0 0 0 1px rgba(0,0,0,.2) inset}
.dlang-f svg{display:block;width:100%;height:100%}
.goog-te-banner-frame,.skiptranslate iframe,#goog-gt-tt{display:none!important}
body{top:0!important}.goog-text-highlight{background:none!important;box-shadow:none!important}
@media(max-width:768px){.dlang-b{padding:8px 11px;font-size:.78em}.dlang-f{width:21px;height:14px}}
.nav-logo-img{height:38px;width:38px;border-radius:9px;object-fit:cover;flex:0 0 auto}
.reviews-grid{
  display:grid;grid-template-columns:repeat(3,1fr);
  gap:20px;margin-top:0;
}
.review-card{
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.1);
  border-radius:var(--radius);padding:32px;
  position:relative;
  transition:all .25s;
}
.review-card:hover{background:rgba(255,255,255,0.09);transform:translateY(-3px)}
.review-quote{
  position:absolute;top:20px;right:24px;
  font-size:3.5em;color:var(--gold);opacity:.2;
  font-family:Georgia,serif;line-height:1;
}
.review-stars{color:var(--gold);font-size:.9em;letter-spacing:2px;margin-bottom:14px}
.review-text{
  font-size:.88em;color:rgba(255,255,255,0.7);
  line-height:1.85;font-style:italic;font-weight:300;
}

/* ── CONTACT ── */
.contact{background:var(--cream)}
.contact-grid{
  display:grid;grid-template-columns:1fr 1fr;
  gap:64px;align-items:start;
}
.contact-info{}
.contact-item{
  display:flex;gap:16px;align-items:flex-start;
  margin-bottom:24px;padding-bottom:24px;
  border-bottom:1px solid var(--border);
}
.contact-item:last-child{border-bottom:none;margin-bottom:0;padding-bottom:0}
.contact-icon{
  width:44px;height:44px;border-radius:10px;
  background:var(--primary);
  display:flex;align-items:center;justify-content:center;
  font-size:1.1em;flex-shrink:0;color:var(--gold);
}
.contact-item-label{font-size:.7em;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--mid);margin-bottom:4px}
.contact-item-value{font-size:.95em;font-weight:600;color:var(--dark);line-height:1.5}
.contact-item-value a{color:var(--primary);text-decoration:none}
.hours-grid{
  background:#fff;border-radius:var(--radius);
  border:1px solid var(--border);overflow:hidden;
}
.hours-title{
  background:var(--primary);color:#fff;
  padding:14px 20px;font-weight:700;font-size:.85em;
  letter-spacing:1px;text-transform:uppercase;
  display:flex;align-items:center;gap:8px;
}
.hours-row{
  display:flex;justify-content:space-between;
  padding:12px 20px;border-bottom:1px solid var(--border);
  font-size:.87em;
}
.hours-row:last-child{border-bottom:none}
.hours-day{font-weight:600;color:var(--dark)}
.hours-time{color:var(--mid)}

/* ── CTA ── */
.cta{
  background:linear-gradient(135deg,var(--primary) 0%,rgba(0,0,0,0.9) 100%);
  padding:96px 72px;text-align:center;position:relative;overflow:hidden;
}
.cta::before{
  content:'';position:absolute;
  top:-200px;left:50%;transform:translateX(-50%);
  width:800px;height:800px;border-radius:50%;
  background:radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%);
  pointer-events:none;
}
.cta-inner{position:relative;z-index:1;max-width:700px;margin:0 auto}
.cta h2{
  font-family:var(--ff-display);
  font-size:clamp(2.2em,4vw,3.4em);
  color:#fff;font-weight:700;letter-spacing:-1px;
  margin-bottom:14px;line-height:1.1;
}
.cta h2 em{font-style:italic;color:var(--gold);font-weight:400}
.cta-sub{
  color:rgba(255,255,255,0.6);font-size:1em;
  line-height:1.8;margin-bottom:40px;font-weight:300;
}
.cta-phone{
  font-family:var(--ff-display);
  font-size:2.4em;color:var(--gold);
  font-weight:700;text-decoration:none;
  display:block;margin-bottom:6px;
  letter-spacing:-1px;transition:color .2s;
}
.cta-phone:hover{color:var(--gold2)}
.cta-phone-label{
  font-size:.7em;color:rgba(255,255,255,0.35);
  letter-spacing:3px;text-transform:uppercase;margin-bottom:32px;
}
.cta-address{
  font-size:.82em;color:rgba(255,255,255,0.3);
  margin-top:24px;line-height:1.7;
}

/* ── FOOTER ── */
footer{
  background:#0a0a0a;
  padding:40px 72px 28px;
}
.footer-grid{
  max-width:1160px;margin:0 auto;
  display:grid;grid-template-columns:2fr 1fr 1fr;
  gap:48px;padding-bottom:32px;
  border-bottom:1px solid rgba(255,255,255,0.06);
}
.footer-brand-name{
  font-family:var(--ff-display);
  font-size:1.1em;color:#fff;font-weight:700;margin-bottom:8px;
}
.footer-brand-desc{font-size:.82em;color:#555;line-height:1.7;margin-bottom:16px}
.social-links{display:flex;gap:10px}
.social-link{
  width:36px;height:36px;border-radius:8px;
  background:rgba(255,255,255,0.06);
  border:1px solid rgba(255,255,255,0.1);
  display:flex;align-items:center;justify-content:center;
  color:rgba(255,255,255,0.5);text-decoration:none;
  transition:all .2s;
}
.social-link:hover{background:var(--gold);color:var(--dark);border-color:var(--gold)}
.footer-col-title{font-size:.72em;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:#444;margin-bottom:16px}
.footer-links{list-style:none}
.footer-links li{margin-bottom:10px}
.footer-links a{color:#555;text-decoration:none;font-size:.84em;transition:color .2s}
.footer-links a:hover{color:var(--gold)}
.footer-bottom{
  max-width:1160px;margin:20px auto 0;
  display:flex;align-items:center;justify-content:space-between;
  flex-wrap:wrap;gap:12px;
}
.footer-copy{font-size:.72em;color:#333}
.footer-badge{font-size:.72em;color:#333}

/* ── FLOATING CALL BUTTON (mobile) ── */
.float-call{
  display:none;position:fixed;
  bottom:24px;right:24px;z-index:300;
  width:56px;height:56px;border-radius:50%;
  background:var(--gold);
  box-shadow:0 4px 20px rgba(201,168,76,0.5);
  align-items:center;justify-content:center;
  text-decoration:none;font-size:1.4em;
  transition:transform .2s;
}
.float-call:hover{transform:scale(1.1)}

/* ── SCROLL ANIMATIONS ── */
.fade-up{opacity:0;transform:translateY(28px);transition:all .6s ease}
.fade-up.visible{opacity:1;transform:translateY(0)}

/* ── RESPONSIVE ── */
@media(max-width:1024px){
  nav{padding:0 24px}
  section{padding:72px 32px}
  .hero-content{padding:140px 32px 100px}
  .trust-bar{padding:16px 32px;gap:24px}
  .footer-grid{grid-template-columns:1fr 1fr;gap:32px}
  .cta{padding:72px 32px}
}
@media(max-width:768px){
  .nav-right .nav-phone{display:none}
  .hero-content{padding:110px 20px 80px}
  .hero h1{font-size:2.6em}
  .hero-trust{gap:20px}
  section{padding:56px 20px}
  .trust-bar{gap:16px;padding:14px 20px}
  .trust-bar-item{font-size:.75em}
  .services-grid{grid-template-columns:1fr}
  .about-grid{grid-template-columns:1fr}
  .about-photo-wrap{aspect-ratio:16/9}
  .gallery-grid{grid-template-columns:1fr}
  .reviews-grid{grid-template-columns:1fr}
  .contact-grid{grid-template-columns:1fr}
  .footer-grid{grid-template-columns:1fr}
  .cta{padding:56px 20px}
  footer{padding:32px 20px 20px}
  .footer-bottom{flex-direction:column;align-items:flex-start}
  .float-call{display:flex}
}
</style>
</head>
<body>

<!-- FLOATING CALL BUTTON -->
${phoneClean ? `<a href="tel:${phoneClean}" class="float-call" title="Call Now">📞</a>` : ''}

<!-- NAV -->
<nav>
  <a href="/" class="nav-brand">
    ${logoUrl ? `<img src="${logoUrl}" alt="${name} logo" class="nav-logo-img">` : '<div class="nav-brand-icon">🏆</div>'}
    <div class="nav-brand-name">
      ${name}
      <span>${type} · ${city}</span>
    </div>
  </a>
  <div class="nav-right">
    <div class="dlang" id="dlang">
      <button type="button" class="dlang-b is-on" data-lang="en" aria-pressed="true">
        <span class="dlang-f"><svg viewBox='0 0 60 40' aria-hidden='true'><rect width='60' height='40' fill='#B22234'/><g fill='#fff'><rect y='3.1' width='60' height='3.1'/><rect y='9.2' width='60' height='3.1'/><rect y='15.4' width='60' height='3.1'/><rect y='21.5' width='60' height='3.1'/><rect y='27.7' width='60' height='3.1'/><rect y='33.8' width='60' height='3.1'/></g><rect width='26' height='21.5' fill='#3C3B6E'/></svg></span>EN</button>
      <button type="button" class="dlang-b" data-lang="es" aria-pressed="false">
        <span class="dlang-f"><svg viewBox='0 0 60 40' aria-hidden='true'><rect width='20' height='40' fill='#006847'/><rect x='20' width='20' height='40' fill='#fff'/><rect x='40' width='20' height='40' fill='#CE1126'/><ellipse cx='30' cy='20' rx='4.6' ry='4' fill='none' stroke='#8C6239' stroke-width='1.6'/></svg></span>ES</button>
    </div>
    ${phone ? `<a href="tel:${phoneClean}" class="nav-phone">${phone}</a>` : ''}
    <a href="#contact" class="nav-cta">📞 Call Now</a>
  </div>
</nav>

<!-- HERO -->
<div class="hero">
  <div class="hero-bg"></div>
  <div class="hero-texture"></div>
  <div class="hero-content">
    ${badges.length ? `<div class="hero-badges">${badges.map(b => `<span class="hero-badge">${b}</span>`).join('')}</div>` : ''}
    <div class="hero-eyebrow">Serving ${cityState}</div>
    <h1>
      ${tagline ? tagline.split(/[.!]/)[0] : name}
      <em>${tagline ? (tagline.split(/[.!]/)[1] || type) : `Trusted ${type}`}</em>
    </h1>
    <p class="hero-desc">${description || `${name} is ${cityState}'s premier ${type}. We deliver exceptional results with integrity, expertise, and genuine care for every client we serve.`}</p>
    <div class="hero-actions">
      <a href="${phone ? `tel:${phoneClean}` : '#contact'}" class="btn-primary">📞 ${phone || 'Get in Touch'}</a>
      <a href="#services" class="btn-secondary">Our Services →</a>
    </div>
    <div class="hero-trust">
      ${rating ? `<div class="trust-item"><div class="trust-num">${rating}★</div><div class="trust-label">Rating</div></div>` : ''}
      ${reviews ? `<div class="trust-item"><div class="trust-num">${reviews}+</div><div class="trust-label">Reviews</div></div>` : ''}
      <div class="trust-item"><div class="trust-num">100%</div><div class="trust-label">Satisfaction</div></div>
      <div class="trust-item"><div class="trust-num">#1</div><div class="trust-label">In ${city}</div></div>
    </div>
  </div>
</div>

<!-- TRUST BAR -->
<div class="trust-bar">
  <div class="trust-bar-item"><span class="trust-bar-icon">✓</span> Licensed & Insured</div>
  <div class="trust-bar-item"><span class="trust-bar-icon">✓</span> ${city} Local Experts</div>
  <div class="trust-bar-item"><span class="trust-bar-icon">✓</span> ${rating ? rating + '★ Rated' : '5★ Rated'}</div>
  <div class="trust-bar-item"><span class="trust-bar-icon">✓</span> Free Consultation</div>
  <div class="trust-bar-item"><span class="trust-bar-icon">✓</span> Same-Week Availability</div>
</div>

<!-- SERVICES -->
<section class="services" id="services">
  <div class="section-inner">
    <div class="eyebrow">What We Offer</div>
    <h2 class="section-title">Our <em>Services</em></h2>
    <p class="section-sub">Professional ${type} services in ${cityState}. We bring expertise, care, and attention to every single client.</p>
    <div class="section-divider"><div class="section-divider-line"></div><div class="section-divider-dot"></div><div class="section-divider-line"></div></div>
    <div class="services-grid">
      ${svcs.length ? svcs.map((s,i) => `
        <div class="svc-card fade-up">
          <div class="svc-num">0${i+1}</div>
          <div class="svc-title">${s}</div>
          <div class="svc-desc">Professional ${s.toLowerCase()} delivered with expertise and care. We take pride in every job we do for our ${cityState} clients.</div>
        </div>
      `).join('') : `
        <div class="svc-card fade-up"><div class="svc-num">01</div><div class="svc-title">Expert ${type}</div><div class="svc-desc">Professional services you can count on — delivered with skill, care, and integrity.</div></div>
        <div class="svc-card fade-up"><div class="svc-num">02</div><div class="svc-title">Quality Guaranteed</div><div class="svc-desc">We stand behind our work. Your satisfaction is our top priority on every single visit.</div></div>
        <div class="svc-card fade-up"><div class="svc-num">03</div><div class="svc-title">Trusted & Local</div><div class="svc-desc">Proudly serving ${city} and the surrounding community with honest, reliable service.</div></div>
        <div class="svc-card fade-up"><div class="svc-num">04</div><div class="svc-title">Fast Turnaround</div><div class="svc-desc">We respect your time. Most services are available same-week or next-day.</div></div>
        <div class="svc-card fade-up"><div class="svc-num">05</div><div class="svc-title">Fair Pricing</div><div class="svc-desc">Transparent pricing with no surprises. We'll always give you a clear quote upfront.</div></div>
        <div class="svc-card fade-up"><div class="svc-num">06</div><div class="svc-title">Emergency Service</div><div class="svc-desc">When you need us most, we're here. Call anytime and we'll do our best to help.</div></div>
      `}
    </div>
  </div>
</section>

<!-- ABOUT -->
<section class="about" id="about">
  <div class="section-inner">
    <div class="about-grid">
      <div class="about-photo-wrap fade-up">
        ${photo2Url ? `<img src="${photo2Url}" alt="${name}" class="about-photo">` : heroPhotoUrl ? `<img src="${heroPhotoUrl}" alt="${name}" class="about-photo">` : `<div class="about-photo-placeholder">🏆</div>`}
        <div class="about-photo-badge">Trusted Since Day One</div>
      </div>
      <div class="about-content fade-up">
        <div class="eyebrow">Who We Are</div>
        <h2 class="section-title">Why ${city} <em>Trusts Us</em></h2>
        <p style="color:var(--mid);line-height:1.85;margin-bottom:24px;font-weight:300;font-size:.97em">${description || `At ${name}, we've built our reputation on one simple principle: treat every client the way we'd want to be treated. That means honest pricing, expert work, and genuine care for your satisfaction.`}</p>
        <div class="about-stats">
          ${rating ? `<div class="about-stat"><div class="about-stat-num">${rating}★</div><div class="about-stat-label">Average Rating</div></div>` : '<div class="about-stat"><div class="about-stat-num">5★</div><div class="about-stat-label">Top Rated</div></div>'}
          ${reviews ? `<div class="about-stat"><div class="about-stat-num">${reviews}+</div><div class="about-stat-label">Happy Clients</div></div>` : '<div class="about-stat"><div class="about-stat-num">100+</div><div class="about-stat-label">Happy Clients</div></div>'}
          <div class="about-stat"><div class="about-stat-num">100%</div><div class="about-stat-label">Satisfaction Rate</div></div>
          <div class="about-stat"><div class="about-stat-num">#1</div><div class="about-stat-label">In ${city}</div></div>
        </div>
        <a href="#contact" class="btn-primary" style="text-decoration:none;display:inline-flex">Get in Touch →</a>
      </div>
    </div>
  </div>
</section>

${(photo3Url || photo4Url) ? `
<!-- GALLERY -->
<section class="gallery" id="gallery">
  <div class="section-inner">
    <div class="eyebrow">Our Work</div>
    <h2 class="section-title">See What We <em>Do</em></h2>
    <div class="section-divider"><div class="section-divider-line"></div><div class="section-divider-dot"></div><div class="section-divider-line"></div></div>
    <div class="gallery-grid">
      ${photo3Url ? `<div class="gallery-item fade-up"><img src="${photo3Url}" alt="${name} - ${type}"></div>` : ''}
      ${photo4Url ? `<div class="gallery-item fade-up"><img src="${photo4Url}" alt="${name} - ${type}"></div>` : ''}
      ${heroPhotoUrl && photo3Url ? `<div class="gallery-item fade-up"><img src="${heroPhotoUrl}" alt="${name}"></div>` : ''}
    </div>
  </div>
</section>
` : ''}

<!-- REVIEWS -->
<section class="reviews" id="reviews">
  <div class="section-inner">
    <div class="eyebrow">What Clients Say</div>
    <h2 class="section-title">${reviews ? reviews + '+ Reviews. ' : ''}<em>${rating ? rating + '★ Rated.' : 'Loved by Clients.'}</em></h2>
    <div class="section-divider" style="border-color:rgba(255,255,255,0.1)"><div class="section-divider-line" style="background:rgba(255,255,255,0.1)"></div><div class="section-divider-dot"></div><div class="section-divider-line" style="background:rgba(255,255,255,0.1)"></div></div>
    <div class="reviews-grid">
      ${reviewsHtml}
    </div>
  </div>
</section>

<!-- CONTACT -->
<section class="contact" id="contact">
  <div class="section-inner">
    <div class="eyebrow">Get in Touch</div>
    <h2 class="section-title">Contact <em>${name.split(' ')[0]}</em></h2>
    <div class="section-divider"><div class="section-divider-line"></div><div class="section-divider-dot"></div><div class="section-divider-line"></div></div>
    <div class="contact-grid">
      <div class="contact-info">
        ${phone ? `
        <div class="contact-item">
          <div class="contact-icon">📞</div>
          <div>
            <div class="contact-item-label">Phone</div>
            <div class="contact-item-value"><a href="tel:${phoneClean}">${phone}</a></div>
          </div>
        </div>` : ''}
        ${address ? `
        <div class="contact-item">
          <div class="contact-icon">📍</div>
          <div>
            <div class="contact-item-label">Address</div>
            <div class="contact-item-value">${address}${cityState ? '<br>' + cityState : ''}</div>
          </div>
        </div>` : cityState ? `
        <div class="contact-item">
          <div class="contact-icon">📍</div>
          <div>
            <div class="contact-item-label">Location</div>
            <div class="contact-item-value">${cityState}</div>
          </div>
        </div>` : ''}
        <div class="contact-item">
          <div class="contact-icon">⏰</div>
          <div style="flex:1">
            <div class="contact-item-label">Hours</div>
            <div class="hours-grid" style="margin-top:8px">
              <div class="hours-title">⏰ Business Hours</div>
              ${hoursHtml}
            </div>
          </div>
        </div>
        ${socialLinks ? `
        <div class="contact-item">
          <div class="contact-icon">🌐</div>
          <div>
            <div class="contact-item-label">Follow Us</div>
            <div class="social-links" style="margin-top:8px">${socialLinks}</div>
          </div>
        </div>` : ''}
      </div>
      <div>
        <div class="hours-grid" style="background:var(--primary);border:none">
          <div class="hours-title" style="background:rgba(0,0,0,0.3);font-size:1em;padding:20px 24px">
            Ready to Get Started?
          </div>
          <div style="padding:28px 24px">
            <p style="color:rgba(255,255,255,0.65);font-size:.9em;line-height:1.8;margin-bottom:24px;font-weight:300">${description ? description.split('.')[0] + '.' : `Contact ${name} today — we're here to help and ready to serve you in ${cityState}.`}</p>
            ${phone ? `<a href="tel:${phoneClean}" style="display:block;background:var(--gold);color:var(--dark);text-align:center;padding:15px;border-radius:6px;font-weight:700;text-decoration:none;font-size:1.05em;margin-bottom:12px">📞 Call ${phone}</a>` : ''}
            <a href="#services" style="display:block;background:rgba(255,255,255,0.08);color:#fff;text-align:center;padding:13px;border-radius:6px;font-weight:500;text-decoration:none;font-size:.88em;border:1px solid rgba(255,255,255,0.15)">View Our Services</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<div class="cta">
  <div class="cta-inner">
    <h2>Ready to Work With <em>The Best?</em></h2>
    <p class="cta-sub">${name} is ${cityState}'s trusted ${type}. Don't settle for less — call us today and experience the difference.</p>
    ${phone ? `
    <a href="tel:${phoneClean}" class="cta-phone">${phone}</a>
    <div class="cta-phone-label">Call or Text · Available ${cityState}</div>
    ` : ''}
    <a href="#contact" class="btn-primary" style="text-decoration:none">Get a Free Consultation →</a>
    ${address ? `<div class="cta-address">${address}<br>${cityState}</div>` : ''}
  </div>
</div>

<!-- FOOTER -->
<footer>
  <div class="footer-grid">
    <div>
      <div class="footer-brand-name">${name}</div>
      <p class="footer-brand-desc">${description ? description.split('.')[0] + '.' : `Trusted ${type} serving ${cityState} with integrity and expertise.`}</p>
      ${socialLinks ? `<div class="social-links">${socialLinks}</div>` : ''}
    </div>
    <div>
      <div class="footer-col-title">Services</div>
      <ul class="footer-links">
        ${svcs.slice(0,4).map(s => `<li><a href="#services">${s}</a></li>`).join('') || `<li><a href="#services">${type} Services</a></li>`}
      </ul>
    </div>
    <div>
      <div class="footer-col-title">Contact</div>
      <ul class="footer-links">
        ${phone ? `<li><a href="tel:${phoneClean}">${phone}</a></li>` : ''}
        ${address ? `<li>${address}</li>` : ''}
        <li>${cityState}</li>
        <li><a href="#contact">Get in Touch</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="footer-copy">© ${new Date().getFullYear()} ${name}. All rights reserved.</div>
    <div class="footer-badge">Demo site by <a href="https://dominionwebdesignpro.com" style="color:#444;text-decoration:none">Dominion Web Design Pro</a></div>
  </div>
</footer>

<script>
// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
</script>


<div id="google_translate_element" style="display:none"></div>
<script>
(function(){
  var root=document.getElementById('dlang'); if(!root) return;
  function cur(){
    var parts=document.cookie.split(';');
    for(var i=0;i<parts.length;i++){
      var kv=parts[i].trim();
      if(kv.indexOf('googtrans=')===0){
        var bits=kv.substring(10).split('/');
        if(bits.length>2 && bits[2]) return bits[2].toLowerCase();
      }
    }
    return 'en';
  }
  function paint(c){root.querySelectorAll('.dlang-b').forEach(function(b){
    var on=b.dataset.lang===c;b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',on?'true':'false');});}
  function set(c){if(c===cur())return;var h=location.hostname,v=(c==='en')?'/en/en':'/en/'+c;
    document.cookie='googtrans='+v+';path=/';document.cookie='googtrans='+v+';path=/;domain='+h;
    var p=h.split('.');if(p.length>1)document.cookie='googtrans='+v+';path=/;domain=.'+p.slice(-2).join('.');
    location.reload();}
  root.querySelectorAll('.dlang-b').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.lang);});});
  paint(cur());
  window.googleTranslateElementInit=function(){new google.translate.TranslateElement(
    {pageLanguage:'en',includedLanguages:'en,es',autoDisplay:false},'google_translate_element');};
  var s=document.createElement('script');
  s.src='//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  document.body.appendChild(s);
})();
</script>
</body>
</html>`;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return { r: isNaN(r)?26:r, g: isNaN(g)?35:g, b: isNaN(b)?50:b };
}

module.exports = { buildPremiumSite };
