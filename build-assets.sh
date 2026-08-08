#!/bin/bash
# Naqla scroll-world — asset pipeline.
#   ./build-assets.sh
#
# Idempotent. Run it again each time a new leg lands in video-brief/rendered/;
# it encodes whatever is present and skips what isn't, so the page grows in place.
#
# Encoding rationale (SKILL Step 6): scroll-scrubbing sets currentTime every frame,
# so seek cost matters more than bitrate. Native resolution (never upscale), crf 20,
# and a SHORT GOP (-g 8) so a seek decodes at most 8 frames. Audio stripped, faststart
# on, light unsharp because video is inherently softer than the stills.
set -e
PROJ="$(cd "$(dirname "$0")" && pwd)"
SRC="$PROJ/video-brief/rendered"
# Scene stills live in src/ (pipeline sources). video-brief/start-frames/ is kept
# clean: exactly one leg_N.png per prompts/leg_N.txt, nothing else, so the pairing
# is unambiguous when uploading to a web video tool.
STILLS="$PROJ/src/stills"
FRAMES="$PROJ/video-brief/start-frames"
VID="$PROJ/assets/vid"
IMG="$PROJ/assets/img"
mkdir -p "$VID" "$IMG" "$STILLS" "$FRAMES"

NAMES="sender pickup fleet route delivery finale"

idx_of() { case "$1" in sender) echo 0;; pickup) echo 1;; fleet) echo 2;; route) echo 3;; delivery) echo 4;; finale) echo 5;; esac; }

echo "=== 1. scene stills -> webp (posters + detail-view imagery) ==="
for n in $NAMES; do
  s="$STILLS/scene_$n.png"
  [ -f "$s" ] || { echo "  skip $n (no still)"; continue; }
  # 1800w hero-grade poster
  ffmpeg -v error -y -i "$s" -vf "scale=1800:-2" -c:v libwebp -quality 82 -compression_level 6 "$IMG/$n.webp"
  # 900w for the detail view cards
  ffmpeg -v error -y -i "$s" -vf "scale=900:-2" -c:v libwebp -quality 80 -compression_level 6 "$IMG/$n@900.webp"
  echo "  $n.webp $(du -h "$IMG/$n.webp" | cut -f1)   $n@900.webp $(du -h "$IMG/$n@900.webp" | cut -f1)"
done

echo
echo "=== 2. legs -> scrub-optimised mp4 + first-frame poster ==="
enc() { # src dst
  ffmpeg -v error -y -i "$1" -an -vf "unsharp=5:5:0.8:5:5:0.0" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
    -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$2"
}
FOUND=0
for n in $NAMES; do
  i="$(idx_of "$n")"
  src="$SRC/leg_$i.mp4"
  if [ ! -f "$src" ]; then echo "  -- leg $i ($n): not rendered yet"; continue; fi
  enc "$src" "$VID/$n.mp4"
  # The scene poster must be the clip's OWN first frame, else the still flashes
  # and swaps when the video paints.
  ffmpeg -v error -y -ss 0 -i "$src" -frames:v 1 -q:v 2 "$STILLS/_first_$i.png"
  ffmpeg -v error -y -i "$STILLS/_first_$i.png" -vf "scale=1800:-2" \
    -c:v libwebp -quality 82 -compression_level 6 "$IMG/$n.webp"
  d="$(ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 "$VID/$n.mp4" | tr -d '\r')"
  echo "  OK leg $i -> $n.mp4  $(du -h "$VID/$n.mp4" | cut -f1)  ${d}  (poster = its own frame 0)"
  FOUND=$((FOUND+1))
done

echo
echo "=== 2b. og:image (1200x630) ==="
# §7 asks for "a labelled package with a QR sticker being scanned" — that is the
# pickup scene. jpg, not webp: some scrapers still won't render webp previews.
if [ -f "$STILLS/scene_pickup.png" ]; then
  ffmpeg -v error -y -i "$STILLS/scene_pickup.png" \
    -vf "scale=1200:-2,crop=1200:630:0:(ih-630)*0.42" -q:v 3 "$IMG/og.jpg"
  echo "  og.jpg $(du -h "$IMG/og.jpg" | cut -f1)"
fi

echo
echo "=== 3. manifest (build.js wires only clips that exist) ==="
{
  echo "{"
  first=1
  for n in $NAMES; do
    if [ -f "$VID/$n.mp4" ]; then
      [ $first -eq 1 ] || echo ","
      printf '  "%s": true' "$n"
      first=0
    fi
  done
  echo
  echo "}"
} > "$PROJ/src/clips.json"
cat "$PROJ/src/clips.json" | sed 's/^/  /'
echo
echo "legs encoded: $FOUND / 6"
