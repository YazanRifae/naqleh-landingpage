#!/bin/bash
# Naqla scroll-world — asset pipeline.
#   ./build-assets.sh              # uses the v2 chain
#   CHAIN=video-brief ./build-assets.sh   # fall back to the v1 chain
#
# Idempotent. Encodes whichever legs are present and skips the rest, so the page
# grows in place as clips land.
#
# Encoding rationale (SKILL Step 6): scroll-scrubbing sets currentTime every frame,
# so SEEK cost matters more than bitrate. Native resolution (never upscale), crf 20,
# and a SHORT GOP (-g 8) so a seek decodes at most 8 frames. Audio stripped, faststart
# on, light unsharp because video is inherently softer than a still.
set -e
PROJ="$(cd "$(dirname "$0")" && pwd)"
CHAIN="${CHAIN:-video-brief-v2}"
SRC="$PROJ/$CHAIN/rendered"
VID="$PROJ/assets/vid"
IMG="$PROJ/assets/img"
mkdir -p "$VID" "$IMG"

NAMES="sender pickup fleet route delivery finale"
idx_of() { case "$1" in sender) echo 0;; pickup) echo 1;; fleet) echo 2;; route) echo 3;; delivery) echo 4;; finale) echo 5;; esac; }

# Two DIFFERENT images come out of each clip and they must not be confused:
#   <name>.webp       = the clip's OWN frame 0 -> the scene POSTER. Anything else
#                       flashes and swaps the instant the video paints.
#   <name>@900.webp   = a representative frame for the DETAIL VIEW figure. Frame 0
#                       is usually useless there (leg 2 opens on a street, not the
#                       fleet), so pick the moment each scene is actually *about*.
hero_pct() { case "$1" in
  sender)   echo 30 ;;   # owner sealing the boxes at the counter
  pickup)   echo 70 ;;   # driver scanning the label at the van
  fleet)    echo 92 ;;   # the full six-vehicle lineup
  route)    echo 75 ;;   # the truck on the intercity highway
  delivery) echo 80 ;;   # the doorstep handover, phone up
  finale)   echo 85 ;;   # hands over the package, app confirmed
esac; }

echo "=== chain: $CHAIN ==="
echo
echo "=== 1. legs -> scrub-tuned mp4 + poster + detail-view figure ==="
enc() { ffmpeg -v error -y -i "$1" -an -vf "unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$2"; }

FOUND=0
for n in $NAMES; do
  i="$(idx_of "$n")"
  src="$SRC/leg_$i.mp4"
  if [ ! -f "$src" ]; then echo "  -- leg $i ($n): not rendered yet"; continue; fi
  enc "$src" "$VID/$n.mp4"

  nf="$(ffprobe -v error -select_streams v -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$src" | tr -d '\r')"
  # poster = frame 0
  ffmpeg -v error -y -ss 0 -i "$src" -frames:v 1 -q:v 2 "/tmp/_p_$n.png"
  ffmpeg -v error -y -i "/tmp/_p_$n.png" -vf "scale=1800:-2" -c:v libwebp -quality 82 -compression_level 6 "$IMG/$n.webp"
  # detail-view figure = the moment the scene is about
  hf=$(( nf * $(hero_pct "$n") / 100 )); [ "$hf" -ge "$nf" ] && hf=$((nf - 1))
  ffmpeg -v error -y -i "$src" -vf "select=eq(n\,$hf)" -fps_mode passthrough -frames:v 1 -q:v 2 "/tmp/_h_$n.png"
  ffmpeg -v error -y -i "/tmp/_h_$n.png" -vf "scale=1800:-2" -c:v libwebp -quality 82 -compression_level 6 "$IMG/$n@1800.webp"
  ffmpeg -v error -y -i "/tmp/_h_$n.png" -vf "scale=900:-2"  -c:v libwebp -quality 80 -compression_level 6 "$IMG/$n@900.webp"

  d="$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$VID/$n.mp4" | tr -d '\r')"
  echo "  OK leg $i -> $n.mp4 $(du -h "$VID/$n.mp4"|cut -f1) ${d}  poster=f0  figure=f$hf/$nf"
  FOUND=$((FOUND+1))
done

echo
echo "=== 2. og:image (1200x630) ==="
# §7 wants "a labelled package with a QR sticker being scanned" — the delivery
# handover frame. jpg, not webp: some scrapers still won't render webp previews.
if [ -f "/tmp/_h_delivery.png" ]; then
  ffmpeg -v error -y -i "/tmp/_h_delivery.png" -vf "scale=1200:-2,crop=1200:630:0:(ih-630)*0.42" -q:v 3 "$IMG/og.jpg"
  echo "  og.jpg $(du -h "$IMG/og.jpg"|cut -f1)"
fi

echo
echo "=== 2b. native 9:16 mobile chain -> -m.mp4 + portrait posters ==="
# THE mobile version is a parallel chain rendered natively in portrait (SKILL §6b),
# never a centre-crop of the landscape film — a 16:9 clip on a tall phone shows only
# its middle ~26%. Encode 720 WIDE with a tighter GOP: a phone decoder's seek cost
# scales with frames-from-keyframe, so -g 4 is what makes portrait scrubbing smooth.
MSRC="$PROJ/${MCHAIN:-video-brief-v2-mobile}/rendered"
encm() { ffmpeg -v error -y -i "$1" -an -vf "scale=720:-2,unsharp=5:5:0.6:5:5:0.0" \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
  -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart "$2"; }
MFOUND=0
for n in $NAMES; do
  i="$(idx_of "$n")"
  src="$MSRC/leg_$i.mp4"
  if [ ! -f "$src" ]; then echo "  -- mobile leg $i ($n): not rendered yet"; continue; fi
  w="$(ffprobe -v error -select_streams v -show_entries stream=width -of csv=p=0 "$src" | tr -d '\r')"
  h="$(ffprobe -v error -select_streams v -show_entries stream=height -of csv=p=0 "$src" | tr -d '\r')"
  if [ "$w" -ge "$h" ]; then
    echo "  !! mobile leg $i ($n) is ${w}x${h} — NOT portrait. Skipping."
    echo "     The mobile chain must be natively 9:16; a landscape file here would"
    echo "     ship as a crop and defeat the point. Re-render it vertical."
    continue
  fi
  encm "$src" "$VID/$n-m.mp4"
  ffmpeg -v error -y -ss 0 -i "$src" -frames:v 1 -q:v 2 "/tmp/_pm_$n.png"
  ffmpeg -v error -y -i "/tmp/_pm_$n.png" -vf "scale=720:-2" -c:v libwebp -quality 82 -compression_level 6 "$IMG/$n-m.webp"
  echo "  OK mobile leg $i -> $n-m.mp4 $(du -h "$VID/$n-m.mp4"|cut -f1) ${w}x${h} -> $(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$VID/$n-m.mp4"|tr -d '\r')  poster=$n-m.webp"
  MFOUND=$((MFOUND+1))
done

echo
echo "=== 3. manifest (build.js wires only what exists) ==="
{
  echo "{"
  printf '  "desktop": {'
  first=1; for n in $NAMES; do
    [ -f "$VID/$n.mp4" ] || continue
    [ $first -eq 1 ] || printf ','; printf '\n    "%s": true' "$n"; first=0
  done
  printf '\n  },\n  "mobile": {'
  first=1; for n in $NAMES; do
    [ -f "$VID/$n-m.mp4" ] || continue
    [ $first -eq 1 ] || printf ','; printf '\n    "%s": true' "$n"; first=0
  done
  printf '\n  }\n}\n'
} > "$PROJ/src/clips.json"
sed 's/^/  /' "$PROJ/src/clips.json"
echo
echo "desktop legs: $FOUND/6   mobile legs: $MFOUND/6   total video: $(du -ch "$VID"/*.mp4 2>/dev/null | tail -1 | cut -f1)"
