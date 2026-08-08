#!/usr/bin/env node
/* ============================================================================
   Zero-dependency QA driver: talks to headless Chrome over the DevTools
   Protocol using Node's built-in global WebSocket + fetch (Node >= 22).
   No playwright/puppeteer install needed.

     node tools/qa.js <baseUrl> <outDir> [--mobile]

   Captures the detail view + a sweep of scroll positions through the film,
   and reports console errors, video seekability and scrub state.
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://127.0.0.1:8099/';
const OUT = process.argv[3] || 'qa-shots';
const MOBILE = process.argv.includes('--mobile');
const PORT = 9222;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function targetWs() {
  for (let i = 0; i < 40; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (page) return page.webSocketDebuggerUrl;
    } catch (e) { /* chrome not up yet */ }
    await sleep(400);
  }
  throw new Error('Chrome DevTools endpoint never came up on port ' + PORT);
}

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    const events = [];
    ws.addEventListener('open', () => resolve({
      send(method, params) {
        return new Promise((res, rej) => {
          const mid = ++id;
          pending.set(mid, { res, rej });
          ws.send(JSON.stringify({ id: mid, method, params: params || {} }));
        });
      },
      events,
      close: () => ws.close(),
    }));
    ws.addEventListener('error', reject);
    ws.addEventListener('message', ev => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) {
        const p = pending.get(m.id);
        pending.delete(m.id);
        m.error ? p.rej(new Error(m.error.message)) : p.res(m.result);
      } else if (m.method) {
        events.push(m);
      }
    });
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const cdp = await connect(await targetWs());

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('Log.enable');

  const W = MOBILE ? 390 : 1440;
  const H = MOBILE ? 844 : 900;
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: W, height: H, deviceScaleFactor: 1, mobile: MOBILE,
  });
  if (MOBILE) {
    await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    // Phones decode video far slower than this machine; throttle so a fast flick
    // is actually representative (SKILL Step 8 asks for 4-6x).
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 5 });
  }

  const shot = async (name) => {
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    const f = path.join(OUT, name + '.png');
    fs.writeFileSync(f, Buffer.from(data, 'base64'));
    return f;
  };
  const evalJs = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) return { __err: r.exceptionDetails.text || String(r.exceptionDetails.exception && r.exceptionDetails.exception.description) };
    return r.result.value;
  };

  await cdp.send('Page.navigate', { url: BASE });
  await sleep(MOBILE ? 4500 : 3200);

  // Total film height + section bands, straight from the engine's own layout.
  const geom = await evalJs(`(() => {
    const t = document.querySelector('.sw-track');
    return {
      trackH: t ? t.offsetHeight : 0,
      vh: window.innerHeight,
      docH: document.documentElement.scrollHeight,
      scenes: document.querySelectorAll('.sw-scene').length,
      copies: document.querySelectorAll('.sw-copy').length,
      dots: document.querySelectorAll('.sw-route__dot').length,
      dir: document.documentElement.dir,
      lang: document.documentElement.lang,
      font: getComputedStyle(document.body).fontFamily,
    };
  })()`);
  console.log('geometry:', JSON.stringify(geom));

  // Sweep the film. Fractions of the film track, so it scales with N legs.
  const marks = [0, 0.08, 0.16, 0.26, 0.36, 0.46, 0.58, 0.7, 0.82, 0.94];
  const report = [];
  for (let i = 0; i < marks.length; i++) {
    const y = Math.round(geom.trackH * marks[i]);
    await evalJs(`window.scrollTo(0, ${y})`);
    await sleep(MOBILE ? 900 : 620);
    const st = await evalJs(`(() => {
      const vids = [...document.querySelectorAll('.sw-scene__video')];
      return {
        y: Math.round(window.scrollY),
        vids: vids.length,
        seekable: vids.map(v => v.seekable.length ? +v.seekable.end(0).toFixed(2) : 0),
        t: vids.map(v => +v.currentTime.toFixed(2)),
        painted: [...document.querySelectorAll('.sw-scene')].filter(s => s.classList.contains('has-clip')).length,
        visibleCopy: [...document.querySelectorAll('.sw-copy')]
          .map((c,i) => ({ i, o: +getComputedStyle(c).opacity }))
          .filter(x => x.o > 0.35).map(x => x.i),
      };
    })()`);
    report.push({ mark: marks[i], ...st });
    await shot(`${MOBILE ? 'm' : 'd'}-film-${String(i).padStart(2, '0')}-${Math.round(marks[i] * 100)}pc`);
  }
  console.table(report);

  // Detail view
  const anchors = ['details', 'pillars', 'steps', 'fleet', 'carry', 'pricing', 'tracking', 'protection', 'fails', 'business', 'coverage', 'drivers', 'faq', 'book'];
  for (const a of anchors) {
    const ok = await evalJs(`(() => { const el = document.getElementById('${a}');
      if (!el) return false; window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 70); return true; })()`);
    if (!ok) { console.log('  MISSING anchor #' + a); continue; }
    await sleep(MOBILE ? 700 : 480);
    await shot(`${MOBILE ? 'm' : 'd'}-sec-${a}`);
  }

  // Open the first FAQ item so the accordion's open state gets captured too.
  await evalJs(`(() => { const d = document.querySelector('.qa'); if (d) { d.open = true;
    window.scrollTo(0, d.getBoundingClientRect().top + window.scrollY - 120); } })()`);
  await sleep(500);
  await shot(`${MOBILE ? 'm' : 'd'}-faq-open`);

  // Horizontal overflow is the classic RTL/again-wide-table bug.
  const overflow = await evalJs(`(() => {
    const bad = [];
    document.querySelectorAll('#details *, .foot *').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && (r.right > window.innerWidth + 2 || r.left < -2)) {
        bad.push((el.tagName + '.' + (el.className || '')).slice(0, 70) + ' @' + Math.round(r.left) + '..' + Math.round(r.right));
      }
    });
    return { docW: document.documentElement.scrollWidth, winW: window.innerWidth, bad: bad.slice(0, 12) };
  })()`);
  console.log('overflow:', JSON.stringify(overflow, null, 1));

  const errs = cdp.events
    .filter(e => e.method === 'Log.entryAdded' && e.params.entry.level === 'error')
    .map(e => e.params.entry.text);
  const exc = cdp.events
    .filter(e => e.method === 'Runtime.exceptionThrown')
    .map(e => e.params.exceptionDetails.text);
  console.log('console errors:', errs.length ? errs : 'none');
  console.log('exceptions:', exc.length ? exc : 'none');

  cdp.close();
  console.log('\nshots -> ' + OUT);
})().catch(e => { console.error('QA FAILED:', e.message); process.exit(1); });
