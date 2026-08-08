# Naqla — MOBILE video brief (native 9:16)

This is a **second, separate chain**, rendered natively in portrait. It is not a crop of
the desktop film — a 16:9 clip on a tall phone shows only its middle ~26%, which would cut
the driver, the van and the NAQLA branding out of frame.

Everything pairs by filename, same as the desktop chain:

```
prompts/leg_0.txt   <-> start-frames/leg_0.png
prompts/leg_1.txt   <-> start-frames/leg_1.png
...
```

Save each render as `rendered/leg_N.mp4` and send it to me.

---

## Render specs

| | |
|---|---|
| Aspect ratio | **9:16 PORTRAIT** (vertical) |
| Resolution | **720×1280 or higher** (e.g. 1080×1920) |
| Duration | **8 seconds** |
| Frame rate | **24 fps** |
| Start / first frame image | **required** — `start-frames/leg_N.png` |
| End / last frame image | **leave empty** |
| Audio | not needed |

Use the same start-frame setting that locked the desktop legs at 18–23 dB.

**The one thing that must not slip: the output has to be genuinely taller than it is
wide.** My pipeline checks this and refuses any landscape file with a warning, because a
16:9 file here would silently ship as a crop and defeat the whole point.

---

## What differs from the desktop chain

Same journey, same six beats, same forward-only rule. Two changes:

**1. Vertical composition.** The scene stacks into the upper two thirds of the tall frame
rather than spreading left-to-right.

**2. Calm space at the BOTTOM, not the right.** On desktop the Arabic headline sits in the
right third. On phones the engine anchors copy to the **bottom** of the screen, above the
home indicator. So every mobile prompt asks for the lower third to stay simple and
uncluttered — that's where the text goes. Leg 0's start frame does this with a plain sunlit
counter surface across the bottom.

---

## The loop (sequential — same as desktop)

Each leg's start frame is the previous leg's exact last frame, so only `leg_0.png` exists
right now.

```
you render leg N  ->  send me rendered/leg_N.mp4
->  I extract start-frames/leg_(N+1).png from it
->  I write prompts/leg_(N+1).txt from what that frame actually shows
->  repeat
```

Writing each prompt against the real frame is what stopped the two failures in the first
attempt: a prompt describing a wide shot when the camera was already at macro, and a fleet
scene that invented "Ines" branding because nothing said what *should* be on the trucks.

## Check each clip before rendering the next

**Look at the last ~2 seconds: is the camera still moving forward?** If the shot widens
out or drifts backward, re-roll — a leg that ends retreating followed by one that starts
advancing reads as a rewind glitch at the join, and the bad final frame becomes the next
leg's start image.

Also worth a glance: **NAQLA** should stay on the van/trucks and on the phone app, and the
setting should stay Damascene (ablaq stonework, wrought-iron balconies, jasmine) rather
than drifting to a generic Mediterranean look.

---

## The journey

```
0  Damascus shop - owner sealing labelled boxes, NAQLA app on the phone, NAQLA van outside
1  out to the kerb - driver loading, scanning a label with the app
2  through the van doors, down the street, into the NAQLA depot - the six-vehicle fleet
3  out of the gate onto the Damascus-Aleppo highway, following the freight truck
4  arrival in a residential street - the doorstep handover, receiver shows her code
5  the proof - hands meet over the labelled package, delivery confirmed  (final)
```

## When clips land

```bash
./build-assets.sh     # encodes 720-wide, -g 4, crf 23 -> assets/vid/<scene>-m.mp4
node build.js         # wires clipMobile + stillMobile
```

The engine serves the portrait clips automatically on phones (coarse pointer or ≤860px)
and falls back to the desktop clip for any scene that has no mobile variant, so a partial
mobile chain still works — it just mixes portrait and cropped scenes, which reads
inconsistently. Aim to finish all six.

Then I run the mobile QA: portrait clips actually served (`videoWidth < videoHeight`),
posters matching each clip's frame 0, fast-flick scrubbing at 5× CPU throttle, no page
jump when the URL bar collapses, and rotation.
