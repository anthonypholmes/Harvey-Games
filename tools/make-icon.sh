#!/bin/sh
# Makes the App Store app's icon from tools/app-icon.html (needs Google Chrome on the Mac).
# Run from the project folder:  sh tools/make-icon.sh
# The App Store refuses icons with see-through parts, so the picture is flattened at the end.
set -e
cd "$(dirname "$0")/.."
OUT="ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
TMP="$(mktemp -d)"
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=1 --window-size=1024,1024 --virtual-time-budget=3000 \
  --screenshot="$TMP/icon.png" "file://$PWD/tools/app-icon.html" >/dev/null 2>&1
sips -s format bmp "$TMP/icon.png" --out "$TMP/icon.bmp" >/dev/null
sips -s format png "$TMP/icon.bmp" --out "$OUT" >/dev/null
sips -g pixelWidth -g pixelHeight -g hasAlpha "$OUT"
