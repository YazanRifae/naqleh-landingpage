#!/usr/bin/env node
/* Capture a seam on the live page: screenshots either side of a scene boundary,
   plus the scrub state, so a join can be judged as the visitor actually sees it.
     node tools/seam.js <url> <outDir> <sceneIndexOfSeam>
   Seam k is the boundary between scene k and scene k+1. */
const fs = require('fs'); const path = require('path');
const BASE = process.argv[2], OUT = process.argv[3], K = +(process.argv[4] || 0);
const PORT = 9222; const sleep = ms => new Promise(r => setTimeout(r, ms));
async function wsUrl() {
  for (let i = 0; i < 40; i++) {
    try { const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = l.find(t => t.type === 'page' && t.webSocketDebuggerUrl); if (p) return p.webSocketDebuggerUrl; } catch (e) {}
    await sleep(400);
  } throw new Error('no devtools');
}
function connect(u) {
  return new Promise((res, rej) => { const s = new WebSocket(u); let id = 0; const p = new Map();
    s.addEventListener('open', () => res({ send: (m, q) => new Promise((r2, j2) => { const i = ++id; p.set(i, { r2, j2 }); s.send(JSON.stringify({ id: i, method: m, params: q || {} })); }), close: () => s.close() }));
    s.addEventListener('error', rej);
    s.addEventListener('message', e => { const m = JSON.parse(e.data);
      if (m.id && p.has(m.id)) { const h = p.get(m.id); p.delete(m.id); m.error ? h.j2(new Error(m.error.message)) : h.r2(m.result); } });
  });
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const cdp = await connect(await wsUrl());
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 810, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: BASE });
  await sleep(3200);
  const ev = async e => (await cdp.send('Runtime.evaluate', { expression: e, returnByValue: true })).result.value;

  // Ask the engine's own DOM where the seam is: scene k's band end.
  const bands = await ev(`(() => {
    const vh = window.innerHeight;
    const cfg = JSON.parse(document.getElementById('sw-config').textContent);
    let off = 0; const out = [];
    cfg.sections.forEach(s => { const w = s.scroll || cfg.diveScroll || 1.3;
      out.push({ id: s.id, start: Math.round(off*vh), end: Math.round((off+w)*vh), hasClip: !!s.clip }); off += w; });
    return out;
  })()`);
  const a = bands[K], b = bands[K + 1];
  console.log(`seam ${K}: ${a.id}(clip=${a.hasClip}) -> ${b.id}(clip=${b.hasClip})  boundary y=${a.end}`);

  const at = async (y, tag) => {
    await ev(`window.scrollTo(0, ${y})`); await sleep(900);
    const st = await ev(`(() => {
      const vs=[...document.querySelectorAll('.sw-scene')].map((s,i)=>{ const v=s.querySelector('video');
        return { i, op:+getComputedStyle(s).opacity.slice(0,4), t: v? +v.currentTime.toFixed(2):null, dur: v? +v.duration.toFixed(2):null }; });
      return vs.filter(v => v.op > 0.01);
    })()`);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUT, tag + '.png'), Buffer.from(data, 'base64'));
    console.log(`  y=${y} ${tag}  visible:`, JSON.stringify(st));
  };
  await at(a.end - 120, `seam${K}-a-before`);
  await at(a.end,       `seam${K}-b-boundary`);
  await at(a.end + 120, `seam${K}-c-after`);
  cdp.close();
})().catch(e => { console.error('failed:', e.message); process.exit(1); });
