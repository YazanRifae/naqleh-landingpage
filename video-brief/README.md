# Naqla — video generation brief

Everything pairs **by filename**:

```
prompts/leg_0.txt   ←pairs with→   start-frames/leg_0.png
prompts/leg_1.txt   ←pairs with→   start-frames/leg_1.png
...
```

Paste the `.txt`, upload the `.png` as the start frame, save the result as
`rendered/leg_N.mp4`, send it to me.

---

## Render specs

| | |
|---|---|
| Aspect ratio | **16:9** |
| Resolution | **1280×720 or higher** |
| Duration | **8 seconds** |
| Frame rate | **24 fps** |
| Start / first frame image | **required** — `start-frames/leg_N.png` |
| End / last frame image | **leave empty** |
| Audio | not needed |

Your tool **must** support a start-frame (first-frame / image-to-video) input. Without it
the clip can't continue from the previous shot and the page will jump between scenes.

**Do not set an end frame.** It drags the camera backwards at the end of the clip, which
is the most common cause of a visible stutter at the join.

---

## Start with leg 0 only — then wait for me

Only `leg_0.png` and `leg_1.png` exist right now, and there's a catch worth 4 wasted
renders if you miss it:

> **Each leg's start frame is the previous leg's exact final frame.**
> `leg_2.png` cannot exist until leg 1 is rendered. And so on.

So the loop is:

```
you render leg_N  →  send me rendered/leg_N.mp4  →  I extract start-frames/leg_(N+1).png  →  repeat
```

### Why leg 0 and not leg 1

I already rendered `rendered/leg_0.mp4` on Higgsfield. But you're using a different tool,
and **every generator has its own motion and colour character** — mixing them mid-chain
shows up as a subtle pop at that one join, even when the frames line up perfectly.

So: **render leg 0 with your tool first.** That makes all six clips one consistent film.
Once you send me your `leg_0.mp4`, I'll extract a fresh `leg_1.png` from *your* render and
hand it back.

`leg_1.png` as it stands right now was extracted from **my** leg 0. It's only valid if you
decide to keep my leg 0 and accept one character shift at that seam — your call, just tell
me which way you're going.

---

## Check each clip before rendering the next

**Look at the last ~2 seconds: is the camera still moving forward?**

- ✅ good — the view keeps opening up, objects keep growing, it keeps travelling in
- ❌ re-roll — the shot widens out, drifts backward, or retreats from the subject

If a leg ends moving backward and the next one starts moving forward, the join reads as a
rewind glitch. I hit exactly this on my first leg-0 attempt — the prompt said "ease back
out" and the camera retreated, so I rewrote it. Every prompt now ends with:

> *At no point does the camera pull back, retreat, reverse or move away from the subject -
> it only ever travels forward.*

Keep that sentence in. A bad final frame also poisons every later leg, because it becomes
the next leg's start image.

## If a clip gets blocked by a content filter

Realistic interiors with people trip filters fairly often, usually a false positive.
1. Re-roll — it's often non-deterministic and passes on the 2nd or 3rd try.
2. Add `empty, unoccupied, architectural, tasteful, professional`.
3. Try a different model.

If one leg simply won't render, tell me — the page can crossfade that join and still work.

---

## The journey

One continuous forward flight, six clips, ~48s total:

```
0 shop counter → out the doorway
1 the kerb, driver scanning packages → down the street
2 the vehicle yard, the six vehicle types → the gate
3 the intercity highway → a residential street
4 the doorstep handover → the boxes on the step
5 the package close-up, hands meeting  (final — no leg after it)
```

## Folder

| Path | What |
|---|---|
| `prompts/leg_0.txt` … `leg_5.txt` | Paste as-is. Plain ASCII. |
| `start-frames/leg_0.png` | 2688×1512, exact 16:9 |
| `start-frames/leg_1.png` | 1280×720 — from **my** leg 0 (see above) |
| `rendered/` | ← drop your `leg_N.mp4` here |
| `extract-next-start.ps1` | Optional. You don't need it — just send me the video. |

## When clips land

I verify each join (frame match + no reversal), encode all six for smooth scroll-scrubbing,
extract each clip's first frame as its scene poster, and wire them in. The page is already
built and running against the stills, so clips drop straight in.
