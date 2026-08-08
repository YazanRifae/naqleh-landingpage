#!/usr/bin/env node
/* Ad-hoc computed-style probe over CDP.  node tools/probe.js <url> */
const BASE = process.argv[2] || 'http://127.0.0.1:8099/';
const PORT = 9222;
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function ws() {
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  return list.find(t => t.type === 'page').webSocketDebuggerUrl;
}
function connect(url) {
  return new Promise((res, rej) => {
    const s = new WebSocket(url); let id = 0; const p = new Map();
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
  await sleep(3000);
  const r = await cdp.send('Runtime.evaluate', {
    expression: `(() => {
      const g = (sel, props) => {
        const el = document.querySelector(sel); if (!el) return sel + ' :: MISSING';
        const cs = getComputedStyle(el);
        return sel + ' :: ' + props.map(p => p + '=' + cs.getPropertyValue(p)).join('  ');
      };
      const gb = (sel, props) => {
        const el = document.querySelector(sel); if (!el) return sel + ' ::before MISSING';
        const cs = getComputedStyle(el, '::before');
        return sel + '::before :: ' + props.map(p => p + '=' + cs.getPropertyValue(p)).join('  ');
      };
      const root = document.querySelector('.sw-root');
      return [
        'layers supported: ' + (CSS.supports('at-rule', '@layer') || 'unknown'),
        '.sw-root exists: ' + !!root,
        root ? 'vars: bg=' + getComputedStyle(root).getPropertyValue('--sw-bg') +
               ' ink=' + getComputedStyle(root).getPropertyValue('--sw-ink') +
               ' accent=' + getComputedStyle(root).getPropertyValue('--sw-accent') : '',
        g('.sw-copy__title', ['color','font-family','font-size']),
        g('.sw-copy__body', ['color']),
        g('.sw-copy__eyebrow', ['color','letter-spacing']),
        g('.sw-copy__num', ['color','direction','unicode-bidi']),
        gb('.sw-copylayer', ['left','right','width','background-image']),
        g('.sw-route', ['left','right']),
        g('.sw-route__label', ['color','background-color','left','right']),
        g('.sw-hint', ['letter-spacing','text-transform','color']),
        g('.sw-copy', ['left','right','width']),
        g('.sw-copy__tags li', ['color','background-color']),
      ].join('\\n');
    })()`, returnByValue: true,
  });
  console.log(r.result.value || JSON.stringify(r));
  cdp.close();
})().catch(e => { console.error('probe failed:', e.message); process.exit(1); });
