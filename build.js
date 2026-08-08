#!/usr/bin/env node
/* ============================================================================
   Naqla — static page builder.
     node build.js
   Emits  index.html      (ar, dir=rtl — the DEFAULT language)
          en/index.html   (en, dir=ltr)

   Why a build step rather than client-side i18n:
     - LANDING-PAGE-CONTENT.md §7 wants hreflang ar (x-default) + en, which needs
       one real URL per language.
     - Copy stays in ONE place (src/content.js) so ar/en can't drift.
     - Fully static HTML: crawlers and no-JS visitors get the whole page.
     - The scrub engine registers window listeners + a rAF loop per mount, so a
       client-side language toggle that re-mounts would stack them. Two documents
       sidestep that entirely — the switch is just a link.
   ========================================================================== */

const fs = require('fs');
const path = require('path');
const { CONTENT, SCENES, SCENE_STYLE, FLEET_KG } = require('./src/content');

const ROOT = __dirname;
// canonical/hreflang/og:image base. The deploy workflow sets SITE_URL to the
// address the artifact is actually served from; naqla.sy is the production default.
const SITE = (process.env.SITE_URL || 'https://naqla.sy').replace(/\/+$/, '');

// Only wire clips that actually exist, so the page never fetches a 404.
// build-assets.sh regenerates this each time a leg lands.
let CLIPS = { desktop: {}, mobile: {} };
try {
  const raw = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/clips.json'), 'utf8'));
  CLIPS = { desktop: raw.desktop || {}, mobile: raw.mobile || {} };
} catch (e) { /* no clips yet -> stills only */ }

const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Cache-bust css/js by content hash. Without this a browser happily serves a stale
   engine/stylesheet after a rebuild — which cost me a confusing QA cycle where a
   verified on-disk patch simply wasn't running. Also what you want on deploy. */
const ver = rel => {
  try {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    return rel + '?v=' + require('crypto').createHash('sha1').update(buf).digest('hex').slice(0, 8);
  } catch (e) { return rel; }
};

/* Log-scaled capacity bar: linear would render the 20 kg motorbike as an
   invisible sliver beside the 10 t truck. Floor at 10% so every bar reads. */
const barPct = kg => {
  const lo = Math.log10(FLEET_KG[0]), hi = Math.log10(FLEET_KG[FLEET_KG.length - 1]);
  return Math.round(10 + ((Math.log10(kg) - lo) / (hi - lo)) * 90);
};

/* Footer link targets, per column, matching CONTENT.*.footCols row-for-row.
   (Service / Terms / Naqla). Kept beside the markup rather than derived, so a
   copy change that adds a link fails loudly here instead of silently pointing
   every column at the same four anchors. */
const FOOT_ANCHORS = [
  ['steps', 'fleet', 'pricing', 'tracking'],
  ['protection', 'carry', 'fails', 'faq'],
  ['business', 'drivers', 'coverage', 'book'],
];

const sectionHead = (h, id) => `
      <header class="s-head reveal">
        <span class="s-kicker">${esc(h.kicker)}</span>
        <h2 class="s-title" id="${id}-title">${esc(h.title)}</h2>
      </header>`;

function page(langKey) {
  const c = CONTENT[langKey];
  const isAr = langKey === 'ar';
  const base = isAr ? '' : '../';        // en/ lives one level down
  const other = CONTENT[isAr ? 'en' : 'ar'];

  /* ---- scene config handed to the engine ---- */
  const sections = SCENES.map(id => {
    const s = c.scenes[id], st = SCENE_STYLE[id];
    const o = {
      id, label: s.label,
      still: `${base}assets/img/${id}.webp`,
      accent: st.accent, scroll: st.scroll, linger: st.linger,
      eyebrow: s.eyebrow, title: s.title, body: s.body,
    };
    if (CLIPS.desktop[id]) o.clip = `${base}assets/vid/${id}.mp4`;
    // Native 9:16 variants. The engine serves these on phones and falls back to the
    // desktop clip when absent; stillMobile keeps the poster portrait so there's no
    // landscape->portrait flash when the vertical clip paints.
    if (CLIPS.mobile[id]) {
      o.clipMobile = `${base}assets/vid/${id}-m.mp4`;
      o.stillMobile = `${base}assets/img/${id}-m.webp`;
    }
    if (s.tags) o.tags = s.tags;
    if (id === 'finale') {
      o.cta = {
        primary: { label: c.cta.book, href: '#book' },
        secondary: { label: c.cta.driver, href: '#drivers' },
      };
    }
    return o;
  });

  const swConfig = {
    dir: c.dir,
    hint: c.hint,
    nav: false,            // we render our own persistent header instead
    atmosphere: false,     // photoreal full-bleed scenes; the gradient/particles fight them
    // 0.08 is right when every seam is frame-identical (architecture A's premise).
    // Legs rendered on a tool that only *references* the start frame don't lock, so
    // the join carries a content pop. A longer dissolve is free on a locked seam —
    // identical frames fading into each other look unchanged — and materially softens
    // an unlocked one. Drop back to 0.08 if the whole chain ends up frame-locked.
    crossfade: 0.18,
    diveScroll: 1.5,
    sections,
    connectors: [],        // architecture A has no connectors — the legs ARE the journey
  };

  /* ---- detail view ---- */
  const pillars = `
    <section class="s s--pillars" id="pillars" aria-labelledby="pillars-title">
      <div class="wrap">
        ${sectionHead(c.pillarsHead, 'pillars')}
        <ol class="grid grid--3 pillars">
          ${c.pillars.map((p, i) => `
          <li class="card pillar reveal" style="--i:${i}">
            <span class="pillar__n">${String(i + 1).padStart(2, '0')}</span>
            <h3>${esc(p.t)}</h3>
            <p>${esc(p.d)}</p>
          </li>`).join('')}
        </ol>
      </div>
    </section>`;

  const steps = `
    <section class="s s--steps" id="steps" aria-labelledby="steps-title">
      <div class="wrap">
        ${sectionHead(c.stepsHead, 'steps')}
        <ol class="steps">
          ${c.steps.map((s, i) => `
          <li class="step reveal" style="--i:${i}">
            <span class="step__n">${i + 1}</span>
            <div class="step__b"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>
          </li>`).join('')}
        </ol>
        <p class="note reveal">${esc(c.stepsNote)}</p>
      </div>
    </section>`;

  const fleet = `
    <section class="s s--fleet" id="fleet" aria-labelledby="fleet-title">
      <div class="wrap">
        ${sectionHead(c.fleetHead, 'fleet')}
        <figure class="shot reveal">
          <img src="${base}assets/img/fleet@1800.webp" width="1800" height="1013" loading="lazy" decoding="async"
               alt="${esc(isAr ? 'مركبات نقلة الست في ساحة الأسطول' : "Naqla's six vehicle types in the fleet yard")}">
        </figure>
        <p class="caveat reveal">${esc(c.fleetCaveat)}</p>
        <ul class="grid grid--3 fleetcards">
          ${c.fleet.map((f, i) => `
          <li class="card veh reveal" style="--i:${i}">
            <h3 class="veh__n">${esc(f.v)}</h3>
            <div class="veh__bar" aria-hidden="true"><span style="inline-size:${barPct(FLEET_KG[i])}%"></span></div>
            <p class="veh__cap"><strong>${esc(f.w)}</strong><span>${esc(f.vol)}</span></p>
            <dl class="veh__d">
              <dt>${esc(c.fleetCols.dims)}</dt><dd>${esc(f.d)}</dd>
              <dt>${esc(c.fleetCols.body)}</dt><dd>${esc(f.b)}</dd>
              <dt>${esc(c.fleetCols.help)}</dt><dd>${esc(f.h)}</dd>
              <dt>${esc(c.fleetCols.pkgs)}</dt><dd>${esc(f.p)}</dd>
            </dl>
            <p class="veh__u">${esc(f.u)}</p>
          </li>`).join('')}
        </ul>
        <p class="note reveal">${esc(c.fleetNote)}</p>
      </div>
    </section>`;

  const carry = `
    <section class="s s--carry" id="carry" aria-labelledby="carry-title">
      <div class="wrap">
        ${sectionHead(c.carryHead, 'carry')}
        <div class="two">
          <div class="card panel panel--yes reveal">
            <h3><span class="tick" aria-hidden="true"></span>${esc(c.carryYes.t)}</h3>
            <ul>${c.carryYes.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          </div>
          <div class="card panel panel--no reveal">
            <h3><span class="cross" aria-hidden="true"></span>${esc(c.carryNo.t)}</h3>
            <ul>${c.carryNo.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
          </div>
        </div>
        <p class="note note--hard reveal">${esc(c.carryNote)}</p>
      </div>
    </section>`;

  const pricing = `
    <section class="s s--pricing" id="pricing" aria-labelledby="pricing-title">
      <div class="wrap">
        ${sectionHead(c.priceHead, 'pricing')}
        <h3 class="sub reveal">${esc(c.priceBuildT)}</h3>
        <ul class="grid grid--3">
          ${c.priceBuild.map((p, i) => `
          <li class="card fee reveal" style="--i:${i}"><h4>${esc(p.t)}</h4><p>${esc(p.d)}</p></li>`).join('')}
        </ul>
        <h3 class="sub reveal">${esc(c.priceExtraT)}</h3>
        <ul class="chips reveal">${c.priceExtra.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        <h3 class="sub reveal">${esc(c.payT)}</h3>
        <ul class="grid grid--3">
          ${c.pay.map((p, i) => `
          <li class="card pay reveal" style="--i:${i}"><h4>${esc(p.t)}</h4><p>${esc(p.d)}</p></li>`).join('')}
        </ul>
        <div class="bounds">
          ${c.priceBounds.map(b => `<p class="bound reveal">${esc(b)}</p>`).join('')}
        </div>
      </div>
    </section>`;

  const tracking = `
    <section class="s s--tracking" id="tracking" aria-labelledby="tracking-title">
      <div class="wrap">
        ${sectionHead(c.trackHead, 'tracking')}
        <div class="split">
          <ul class="rows">
            ${c.track.map((t, i) => `
            <li class="row reveal" style="--i:${i}"><h3>${esc(t.t)}</h3><p>${esc(t.d)}</p></li>`).join('')}
          </ul>
          <figure class="shot shot--tall reveal">
            <img src="${base}assets/img/delivery@900.webp" width="900" height="509" loading="lazy" decoding="async"
                 alt="${esc(isAr ? 'المستلم يعرض رمز التحقق على هاتفه والسائق يمسحه عند الباب' : 'A receiver showing the verification code on her phone while the driver scans it at the door')}">
          </figure>
        </div>
      </div>
    </section>`;

  const protection = `
    <section class="s s--protect" id="protection" aria-labelledby="protection-title">
      <div class="wrap">
        ${sectionHead(c.protectHead, 'protection')}
        <ul class="grid grid--2">
          ${c.protect.map((p, i) => `
          <li class="card reveal" style="--i:${i}"><h3>${esc(p.t)}</h3><p>${esc(p.d)}</p></li>`).join('')}
        </ul>
        <div class="card excl reveal">
          <h3>${esc(c.exclT)}</h3>
          <ul>${c.excl.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </div>
    </section>`;

  const fails = `
    <section class="s s--fails" id="fails" aria-labelledby="fails-title">
      <div class="wrap">
        ${sectionHead(c.failHead, 'fails')}
        <ul class="grid grid--4">
          ${c.fail.map((f, i) => `
          <li class="card reveal" style="--i:${i}"><h3>${esc(f.t)}</h3><p>${esc(f.d)}</p></li>`).join('')}
        </ul>
        <p class="note note--hard reveal">${esc(c.failNote)}</p>
      </div>
    </section>`;

  const business = `
    <section class="s s--biz" id="business" aria-labelledby="business-title">
      <div class="wrap">
        ${sectionHead(c.bizHead, 'business')}
        <div class="split">
          <ul class="ticks">${c.biz.map((b, i) => `<li class="reveal" style="--i:${i}">${esc(b)}</li>`).join('')}</ul>
          <figure class="shot shot--tall reveal">
            <img src="${base}assets/img/pickup@900.webp" width="900" height="509" loading="lazy" decoding="async"
                 alt="${esc(isAr ? 'سائق يمسح رموز الطرود عند استلامها من محل' : 'A driver scanning package codes while collecting from a shop')}">
          </figure>
        </div>
        <p class="cta-row reveal"><a class="btn btn--primary" href="#book">${esc(c.cta.volume)}</a></p>
      </div>
    </section>`;

  const coverage = `
    <section class="s s--cover" id="coverage" aria-labelledby="coverage-title">
      <div class="wrap">
        ${sectionHead(c.coverHead, 'coverage')}
        <div class="route reveal" role="img" aria-label="${esc(isAr ? 'خط الانطلاق: دمشق إلى حلب' : 'Founding route: Damascus to Aleppo')}">
          <span class="route__city">${esc(isAr ? 'دمشق' : 'Damascus')}</span>
          <span class="route__line" aria-hidden="true"><i></i></span>
          <span class="route__city">${esc(isAr ? 'حلب' : 'Aleppo')}</span>
        </div>
        ${c.cover.map(l => `<p class="lead reveal">${esc(l)}</p>`).join('')}
      </div>
    </section>`;

  const drivers = `
    <section class="s s--drivers" id="drivers" aria-labelledby="drivers-title">
      <div class="wrap">
        <div class="dark card">
          <header class="s-head reveal">
            <span class="s-kicker">${esc(c.driverHead.kicker)}</span>
            <h2 class="s-title" id="drivers-title">${esc(c.driverHead.title)}</h2>
          </header>
          <ul class="ticks ticks--light">${c.driver.map((d, i) => `<li class="reveal" style="--i:${i}">${esc(d)}</li>`).join('')}</ul>
          <p class="cta-row reveal"><a class="btn btn--accent" href="#book">${esc(c.driverCta)}</a></p>
        </div>
      </div>
    </section>`;

  const faq = `
    <section class="s s--faq" id="faq" aria-labelledby="faq-title">
      <div class="wrap wrap--narrow">
        ${sectionHead(c.faqHead, 'faq')}
        <div class="faq">
          ${c.faq.map((f, i) => `
          <details class="qa reveal" style="--i:${i}">
            <summary><span>${esc(f.q)}</span><i aria-hidden="true"></i></summary>
            <div class="qa__a"><p>${esc(f.a)}</p></div>
          </details>`).join('')}
        </div>
      </div>
    </section>`;

  const footer = `
    <footer class="foot" id="book">
      <div class="wrap">
        <div class="foot__top">
          <h2 class="foot__h">${esc(c.footHead)}</h2>
          <p class="foot__cta">
            <a class="btn btn--accent" href="#book">${esc(c.cta.book)}</a>
            <a class="btn btn--ghostlight" href="#drivers">${esc(c.cta.driver)}</a>
            <a class="btn btn--plain" href="#book">${esc(c.cta.talk)}</a>
          </p>
        </div>
        <nav class="foot__cols" aria-label="${esc(isAr ? 'روابط الموقع' : 'Site links')}">
          ${c.footCols.map((col, ci) => `
          <div>
            <h3>${esc(col.t)}</h3>
            <ul>${col.links.map((l, li) => `<li><a href="#${FOOT_ANCHORS[ci][li]}">${esc(l)}</a></li>`).join('')}</ul>
          </div>`).join('')}
        </nav>
        <p class="foot__note">${esc(c.footNote)}</p>
        <div class="foot__legal">
          <span>${esc(c.footLegal)}</span>
          <a class="lang" href="${base ? '../' : 'en/'}" lang="${other.lang}" hreflang="${other.lang}">${esc(c.altLabel)}</a>
        </div>
      </div>
    </footer>`;

  const ogImg = `${SITE}/assets/img/og.jpg`;
  const canonical = isAr ? `${SITE}/` : `${SITE}/en/`;

  return `<!doctype html>
<html lang="${c.lang}" dir="${c.dir}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(c.meta.title)}</title>
<meta name="description" content="${esc(c.meta.description)}">
<meta name="keywords" content="${esc(c.meta.keywords)}">
<meta name="theme-color" content="#0B2226">
<link rel="icon" href="${base}assets/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${base}assets/img/og.jpg">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="ar" href="${SITE}/">
<link rel="alternate" hreflang="en" href="${SITE}/en/">
<link rel="alternate" hreflang="x-default" href="${SITE}/">
<meta property="og:type" content="website">
<meta property="og:locale" content="${isAr ? 'ar_SY' : 'en_US'}">
<meta property="og:title" content="${esc(c.meta.title)}">
<meta property="og:description" content="${esc(c.meta.description)}">
<meta property="og:image" content="${ogImg}">
<meta property="og:url" content="${canonical}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${base}${ver("assets/css/site.css")}">
</head>
<body>
<a class="skip" href="#details">${esc(c.skipLink)}</a>

<header class="site-head">
  <a class="site-brand" href="#top">
    <span class="site-brand__mark" aria-hidden="true"></span>
    <span class="site-brand__name">${esc(c.brand)}</span>
  </a>
  <p class="site-head__actions">
    <a class="lang lang--head" href="${base ? '../' : 'en/'}" lang="${other.lang}" hreflang="${other.lang}">${esc(c.altLabel)}</a>
    <a class="btn btn--sm btn--accent" href="#book">${esc(c.cta.book)}</a>
  </p>
</header>

<div id="top"></div>
<div id="world" class="world"></div>

<main id="details">
  <p class="tagline"><span>${esc(c.tagline)}</span></p>
${pillars}
${steps}
${fleet}
${carry}
${pricing}
${tracking}
${protection}
${fails}
${business}
${coverage}
${drivers}
${faq}
</main>
${footer}

<script id="sw-config" type="application/json">${JSON.stringify(swConfig).replace(/</g, '\\u003c')}</script>
<script src="${base}${ver("assets/js/scrub-engine.js")}"></script>
<script src="${base}${ver("assets/js/site.js")}"></script>
</body>
</html>
`;
}

/* ---- emit ---- */
const arHtml = page('ar');
const enHtml = page('en');
fs.writeFileSync(path.join(ROOT, 'index.html'), arHtml);
fs.mkdirSync(path.join(ROOT, 'en'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'en/index.html'), enHtml);

const wired = SCENES.filter(s => CLIPS.desktop[s]);
const wiredM = SCENES.filter(s => CLIPS.mobile[s]);
console.log('built index.html      %s  (ar, rtl)', String(Buffer.byteLength(arHtml) / 1024).slice(0, 5) + ' KB');
console.log('built en/index.html   %s  (en, ltr)', String(Buffer.byteLength(enHtml) / 1024).slice(0, 5) + ' KB');
console.log('clips wired: %d/6  [%s]', wired.length, wired.join(', ') || 'none — stills only');
console.log('mobile 9:16 wired: %d/6 [%s]', wiredM.length, wiredM.join(', ') || 'none — phones get the landscape centre-crop');
if (wired.length < SCENES.length) {
  console.log('scenes still on stills: %s', SCENES.filter(s => !CLIPS.desktop[s]).join(', '));
}
