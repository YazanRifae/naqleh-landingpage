#!/usr/bin/env node
/* One-off box/style measurements.  node tools/measure.js <url> */
const BASE = process.argv[2] || 'http://127.0.0.1:8099/';
const PORT = 9222;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function ws() {
  const l = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  return l.find(t => t.type === 'page').webSocketDebuggerUrl;
}
function connect(u) {
  return new Promise((res, rej) => {
    const s = new WebSocket(u); let id = 0; const p = new Map();
    s.addEventListener('open', () => res({
      send: (m, q) => new Promise((r2, j2) => { const i = ++id; p.set(i, { r2, j2 }); s.send(JSON.stringify({ id: i, method: m, params: q || {} })); }),
      close: () => s.close(),
    }));
    s.addEventListener('error', rej);
    s.addEventListener('message', e => {
      const m = JSON.parse(e.data);
      if (m.id && p.has(m.id)) { const h = p.get(m.id); p.delete(m.id); m.error ? h.j2(new Error(m.error.message)) : h.r2(m.result); }
    });
  });
}
(async () => {
  const cdp = await connect(await ws());
  await cdp.send('Page.enable'); await cdp.send('Runtime.enable');
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: BASE });
  await sleep(2600);
  const r = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const out = [];
      const box = (sel, label) => {
        const el = document.querySelector(sel);
        if (!el) return out.push((label||sel) + ' MISSING');
        const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
        out.push((label||sel) + ' -> ' + Math.round(r.width) + 'x' + Math.round(r.height) +
          '  display=' + cs.display + ' flex=' + cs.flex + ' radius=' + cs.borderRadius);
      };
      box('.qa summary i', 'faq icon');
      box('.step__n', 'step badge');
      box('.tick', 'carry tick');
      box('.site-brand__mark', 'brand mark');
      box('.veh__bar span', 'capacity bar fill');
      // contrast probe: exclusions text on its panel
      const ex = document.querySelector('.excl li');
      if (ex) {
        const p = document.querySelector('.excl');
        out.push('excl li color=' + getComputedStyle(ex).color + ' on panel bg=' + getComputedStyle(p).backgroundColor);
      }
      // does any card overflow its grid cell?
      const wide = [...document.querySelectorAll('#details .card')].filter(c => c.scrollWidth > c.clientWidth + 1);
      out.push('cards overflowing horizontally: ' + wide.length);
      // heading colours inside the dark panel (the :where regression)
      const dt = document.querySelector('.dark .s-title');
      if (dt) out.push('dark panel title color=' + getComputedStyle(dt).color + ' on ' + getComputedStyle(document.querySelector('.dark')).backgroundColor);
      return out.join('\\n');
    })()`, returnByValue: true,
  });
  console.log(r.result.value);
  cdp.close();
})().catch(e => { console.error('measure failed:', e.message); process.exit(1); });
