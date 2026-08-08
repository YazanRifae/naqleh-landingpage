# نقلة · Naqla — scroll-world landing page

A scroll-scrubbed camera flight (Apple-style: scroll drives *time*, the camera genuinely
moves) followed by the full detail view from `LANDING-PAGE-CONTENT.md`.

Arabic is the default language at `/`; English lives at `/en/`.

```
index.html          ar · dir=rtl · the default
en/index.html       en · dir=ltr
```

Both are **generated** — edit `src/content.js`, never the HTML.

---

## Run it

The engine fetches each clip as a Blob, so it needs `http://`, not `file://`:

```bash
python -m http.server 8099 --bind 127.0.0.1
# http://127.0.0.1:8099/
```

## Rebuild

```bash
bash build-assets.sh     # stills -> webp, legs -> scrub-tuned mp4, posters, og image, manifest
node build.js            # src/content.js -> index.html + en/index.html
```

`build-assets.sh` is idempotent: it encodes whichever legs exist in
`video-brief/rendered/` and skips the rest, so run it again each time a clip lands.
`build.js` reads `src/clips.json` and wires **only** clips that exist — missing scenes
fall back to their still, and the page never requests a 404.

---

## Layout

| Path | Role |
|---|---|
| `src/content.js` | **All copy, both languages.** Single source of truth. Also scene pacing + fleet numbers. |
| `build.js` | Renders both static pages. Footer anchor map lives here. |
| `build-assets.sh` | Image + video pipeline. |
| `assets/js/scrub-engine.js` | The scroll-scrub engine (vendored from the scroll-world skill + **one documented patch**, see below). |
| `assets/js/site.js` | Mounts the engine, reveal-on-scroll, scroll-aware header. |
| `assets/css/site.css` | Theme, RTL mirroring, detail view. |
| `video-brief/` | Prompts + start frames for generating the camera legs. See its README. |
| `tools/` | Zero-dependency QA drivers (headless Chrome over DevTools Protocol). |
| `PLACEHOLDERS.md` | **Read before launch** — figures ops must confirm; §5 claims blocked on purpose. |

---

## The film

Six scenes, one continuous forward flight, ~48s:

```
shop counter → out the doorway → the kerb → the vehicle yard
→ the intercity highway → the doorstep handover → the package
```

This is **architecture A** (one continuous forward take): each leg starts from the
previous leg's *exact final frame*, and there are no connector clips — the legs are the
journey. Two rules keep the seams invisible:

1. **Frame handoff.** Leg *i*'s start image is leg *i−1*'s last frame, so the seam is
   frame-identical. `video-brief/extract-next-start.ps1` does the extraction.
2. **Forward only.** A leg that ends *retreating* followed by one that starts advancing
   reverses velocity at the seam and reads as a rewind glitch. Direction changes are made
   by turning while still moving forward, never by backing up. Every prompt carries the
   no-retreat clause verbatim.

Current state: **legs 0–1 rendered**; legs 2–5 pending (`video-brief/README.md`).
Scenes without a clip show their still and still read correctly.

### Engine patch: real cross-dissolve at seams

Upstream sets `zIndex = (i === ci) ? 120 : …`, so the **current** segment is always on
top at opacity 1. Every scene is a full-viewport `object-fit:cover` layer, so the top one
completely hides its neighbour — segments **hard-swap** at the boundary and the
`crossfade` option only ramps a layer that's already hidden. That's invisible when seams
are frame-identical (upstream's premise) but a visible cut otherwise.

Leg 1 was rendered on a tool that treats the start image as a *reference* rather than a
true first frame, so its frame 0 doesn't match leg 0's last frame (13.8 dB; a locked seam
reads 18–25 dB) — it invents its own opening composition. The patch orders scenes strictly
by index (`100 + i`) so the incoming scene fades in **over** the outgoing one and
`crossfade` becomes a genuine dissolve. Symmetric on scroll-up, and still invisible on
frame-identical seams.

`crossfade` is `0.18` in `build.js` to suit unlocked joins. **If the whole chain ends up
frame-locked, drop it back to `0.08`** — and the patch can stay either way.

### Pacing

Per-scene `scroll` (dwell length) and `linger` (camera settles mid-scene, exactly where
the copy peaks) live in `SCENE_STYLE` in `src/content.js`. Seam frames are untouched by
`linger`, so tuning it can't break a seam.

---

## Things that will bite you

- **Don't add a global CSS reset.** The engine's styles live in `@layer sw`, and
  *unlayered* rules beat layered ones regardless of specificity. A global
  `img { height:auto }` silently letterboxes every scene; `h1..h4 { color }` repaints the
  film headline. The reset in `site.css` is scoped to our own containers with `:where()`
  so it carries zero specificity — keep it that way.
- **Never letter-space Arabic.** It severs the cursive joins. The engine letter-spaces
  the copy eyebrow and the scroll hint; `site.css` undoes that for RTL and re-applies it
  only for `[dir="ltr"]`.
- **The engine mounts once per document.** It registers window listeners and a rAF loop
  per mount, so a client-side language toggle that re-mounted would stack them. That's
  why there are two documents and the switch is a plain link (which `hreflang` wants
  anyway).
- **Latin digits in RTL** ("01 / 06") get reordered by bidi. The scene counter is
  isolated as LTR in `site.css`.

---

## QA

Zero-dependency headless Chrome drivers (no playwright/puppeteer install):

```bash
chrome --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/cprof about:blank

node tools/qa.js  http://127.0.0.1:8099/      shots-ar          # desktop sweep
node tools/qa.js  http://127.0.0.1:8099/      shots-m --mobile  # 390x844, CPU throttled 5x
node tools/qa.js  http://127.0.0.1:8099/en/   shots-en
node tools/reduced-motion.js http://127.0.0.1:8099/ rm.png
node tools/probe.js   http://127.0.0.1:8099/                    # computed styles
node tools/measure.js http://127.0.0.1:8099/                    # box geometry + contrast
```

`qa.js` reports console errors, horizontal overflow, `video.seekable` (proves blob
loading works — a frozen scrub means seekable is `[0,0]`) and whether `currentTime`
tracks scroll.

Last run: no console errors, no horizontal overflow at 1440 or 390, `seekable = 8.04`,
reduced-motion fetches **zero** mp4s.
