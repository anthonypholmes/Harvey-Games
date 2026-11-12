#!/bin/sh
# Makes the two App Store pictures from tools/store-art.html (needs Google Chrome on the Mac):
#   docs/screenshots/store-header.png  3840 x 1646  the product page header
#   docs/screenshots/store-search.png  3840 x 2560  the search results picture
# Run from the project folder:  sh tools/make-store-art.sh
# The App Store refuses see-through pictures, so each is flattened at the end.
set -e
cd "$(dirname "$0")/.."
OUT="docs/screenshots"
TMP="$(mktemp -d)"
for ART in header:823 search:1280; do
  NAME="${ART%%:*}"; H="${ART##*:}"
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars \
    --user-data-dir="$TMP/profile" --force-device-scale-factor=2 --window-size=1920,$H --virtual-time-budget=5000 \
    --allow-file-access-from-files --screenshot="$TMP/$NAME.png" "file://$PWD/tools/store-art.html?art=$NAME" >/dev/null 2>&1
  sips -s format bmp "$TMP/$NAME.png" --out "$TMP/$NAME.bmp" >/dev/null
  sips -s format png "$TMP/$NAME.bmp" --out "$OUT/store-$NAME.png" >/dev/null
  echo "$OUT/store-$NAME.png  $(sips -g pixelWidth -g pixelHeight -g hasAlpha "$OUT/store-$NAME.png" | awk '/pixel|Alpha/{printf "%s ", $2}')"
done
