# Extract the EXACT final frame of a rendered leg -> the next leg's start image.
#
#   .\extract-next-start.ps1 1      # rendered\leg_1.mp4 -> start-frames\leg_2.png
#
# Why the exact last frame and not "roughly the end": grabbing a frame ~0.15s early
# means the next clip replays a few frames you've already seen, which shows up as a
# small hitch at the seam. This selects frame (count-1) precisely.

param(
  [Parameter(Mandatory = $true)]
  [int]$Leg
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$src  = Join-Path $root "rendered\leg_$Leg.mp4"
$next = $Leg + 1
# Named leg_N.png so it pairs by filename with prompts\leg_N.txt.
$out  = Join-Path $root "start-frames\leg_${next}.png"

if (-not (Test-Path $src)) {
  Write-Host "Not found: $src" -ForegroundColor Red
  Write-Host "Save your rendered clip as rendered\leg_$Leg.mp4 first." -ForegroundColor Yellow
  exit 1
}

# Frame count, then select the last index.
$n = (& ffprobe -v error -select_streams v -count_frames `
        -show_entries stream=nb_read_frames -of csv=p=0 $src) -replace '\s',''
if (-not $n -or $n -eq 'N/A') { Write-Host "Could not read frame count from $src" -ForegroundColor Red; exit 1 }
$last = [int]$n - 1

& ffmpeg -v error -y -i $src -vf "select=eq(n\,$last)" -fps_mode passthrough -frames:v 1 -q:v 2 $out

if (-not (Test-Path $out) -or (Get-Item $out).Length -eq 0) {
  Write-Host "Extraction produced nothing." -ForegroundColor Red; exit 1
}

$dim = (& ffprobe -v error -select_streams v -show_entries stream=width,height -of csv=p=0 $src) -replace '\s',''
Write-Host ""
Write-Host "leg_$Leg.mp4  ->  $n frames @ $dim" -ForegroundColor Cyan
Write-Host "Wrote start-frames\leg_${next}.png (frame $last)" -ForegroundColor Green
Write-Host ""
Write-Host "Next: generate leg $next using" -ForegroundColor Yellow
Write-Host "   prompt      prompts\leg_$next.txt"
Write-Host "   start frame start-frames\leg_${next}.png"
Write-Host "   8s - 16:9 - 24fps - no end frame"
