#!/usr/bin/env node
/* Verify the prefers-reduced-motion fallback: the engine must NOT fetch any clip
   (stills only, no scrubbed video), particles must be gone, and all detail-view
   content must be visible (never left hidden by the reveal animation).
     node tools/reduced-motion.js <url> <outPng> */
const fs = require('fs');
const BASE = process.argv[2] || 'http://127.0.0.1:8099/';
const OUT = process.argv[3] || 'rm.png';
const PORT = 9222;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ws() {
  const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  return l.find(t => t.type === 'page').webSocketDebuggerUrl;
}
function connect(u) {
  return new Promise((res, rej) => {
    const s = new WebSocket(u); let id = 0; const p = new Map(); const ev = [];
    s.addEventListener('open', () => res({
      send: (m, q) => new Promise((r2, j2) => { const i = ++id; p.set(i, { r2, j2 }); s.send(JSON.stringify({ id: i, method: m, params: q || {} })); }),
      ev, close: () => s.close(),
    }));
    s.addEventListener('error', rej);
    s.addEventListener('message', e => {
      const m = JSON.parse(e.data);
      if (m.id && p.has(m.id)) { const h = p.get(m.id); p.delete(m.id); m.error ? h.j2(new Error(m.error.message)) : h.r2(m.result); }
      else if (m.method) ev.push(m);
    });
  });
}
(async () => {
  const cdp = await connect(await ws());
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable'); await cdp.send('Network.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await cdp.send('Page.navigate', { url: BASE });
  await sleep(3000);
  // scroll through the film so any lazy clip load would have been triggered
  for (const f of [0.15, 0.4, 0.65, 0.9]) {
    await cdp.send('Runtime.evaluate', { expression: `window.scrollTo(0, document.querySelector('.sw-track').offsetHeight*${f})` });
    await sleep(500);
  }
  const mp4s = cdp.ev.filter(e => e.method === 'Network.requestWillBeSent' && /\.mp4(\?|$)/.test(e.params.request.url))
    .map(e => e.params.request.url.split('/').pop());
  const r = await cdp.send('Runtime.evaluate', {
    expression: `(() => ({
      videoEls: document.querySelectorAll('.sw-scene__video').length,
      particles: document.querySelectorAll('.sw-pt').length,
      stillsWithSrc: [...document.querySelectorAll('.sw-scene__still')].filter(i => i.getAttribute('src')).length,
      hiddenReveals: [...document.querySelectorAll('.reveal')].filter(e => +getComputedStyle(e).opacity < 0.9).length,
      totalReveals: document.querySelectorAll('.reveal').length,
      jsRevealClass: document.documentElement.classList.contains('js-reveal'),
      htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }))()`, returnByValue: true,
  });
  console.log('mp4 requests while reduced-motion:', mp4s.length ? mp4s : 'none  <-- correct');
  console.log(JSON.stringify(r.result.value, null, 1));
  await cdp.send('Runtime.evaluate', { expression: `window.scrollTo(0, document.getElementById('pillars').offsetTop - 60)` });
  await sleep(400);
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(OUT, Buffer.from(data, 'base64'));
  console.log('shot ->', OUT);
  cdp.close();
})().catch(e => { console.error('failed:', e.message); process.exit(1); });
