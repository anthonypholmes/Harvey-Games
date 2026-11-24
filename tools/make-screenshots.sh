#!/bin/sh
# Makes the 6 App Store screenshots (iPad 13-inch, 2064 x 2752) from tools/screenshots.html.
# Needs Google Chrome on the Mac. Run from the project folder:  sh tools/make-screenshots.sh
# For the in-app purchase's review picture instead:  sh tools/make-screenshots.sh unlock
# For the iPhone ones (6.9-inch, 1320 x 2868, saved in docs/screenshots/iphone/):  sh tools/make-screenshots.sh iphone
# For the iPhone 6.3-inch ones (1206 x 2622, saved in docs/screenshots/iphone-6.3/):  sh tools/make-screenshots.sh iphone63
# They are saved in docs/screenshots/. The App Store refuses see-through pictures, so each is flattened.
set -e
cd "$(dirname "$0")/.."
PORT=8799
OUT="docs/screenshots"
TMP="$(mktemp -d)"
mkdir -p "$OUT"
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 2
if [ "$1" = "unlock" ]; then
  # The picture App Store Connect asks for with the in-app purchase: the "Unlock the full game" screen.
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --mute-audio \
    --user-data-dir="$TMP/profile" --force-device-scale-factor=2 --window-size=1032,1376 --virtual-time-budget=15000 \
    --screenshot="$TMP/shot.png" "http://127.0.0.1:$PORT/tools/unlock-shot.html" >/dev/null 2>&1
  sips -s format bmp "$TMP/shot.png" --out "$TMP/shot.bmp" >/dev/null
  sips -s format png "$TMP/shot.bmp" --out "$OUT/iap-unlock.png" >/dev/null
  echo "$OUT/iap-unlock.png  $(sips -g pixelWidth -g pixelHeight "$OUT/iap-unlock.png" | awk '/pixel/{printf "%s ", $2}')"
  exit 0
fi
SIZE="--force-device-scale-factor=2 --window-size=1032,1376"
QUERY=""
if [ "$1" = "iphone" ]; then
  SIZE="--force-device-scale-factor=3 --window-size=440,956"
  QUERY="&size=phone"
  OUT="docs/screenshots/iphone"
  mkdir -p "$OUT"
fi
if [ "$1" = "iphone63" ]; then
  SIZE="--force-device-scale-factor=3 --window-size=402,874"
  QUERY="&size=phone&pw=402&ph=874"
  OUT="docs/screenshots/iphone-6.3"
  mkdir -p "$OUT"
fi
i=1
for NAME in clubhouse help maths-worlds words bone-shop walk; do
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars --mute-audio \
    --user-data-dir="$TMP/profile" $SIZE --virtual-time-budget=15000 \
    --screenshot="$TMP/shot.png" "http://127.0.0.1:$PORT/tools/screenshots.html?shot=$i$QUERY" >/dev/null 2>&1
  sips -s format bmp "$TMP/shot.png" --out "$TMP/shot.bmp" >/dev/null
  sips -s format png "$TMP/shot.bmp" --out "$OUT/$i-$NAME.png" >/dev/null
  echo "$OUT/$i-$NAME.png  $(sips -g pixelWidth -g pixelHeight "$OUT/$i-$NAME.png" | awk '/pixel/{printf "%s ", $2}')"
  i=$((i + 1))
done
