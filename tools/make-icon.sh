#!/bin/sh
# Makes the App Store app's three icons from tools/app-icon.html (needs Google Chrome on the Mac).
# Run from the project folder:  sh tools/make-icon.sh
#   AppIcon-512@2x.png   the usual icon
#   AppIcon-dark.png     for a dark Home Screen
#   AppIcon-tinted.png   for a tinted Home Screen (see-through background, so iOS can colour it)
# The App Store refuses the usual icon with see-through parts, so that one (and the dark one) is flattened at the end.
set -e
cd "$(dirname "$0")/.."
DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
TMP="$(mktemp -d)"
shoot() { # $1 = look ('' for the usual icon), $2 = picture to make, $3 = 'flat' to remove see-through parts
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --hide-scrollbars \
    --force-device-scale-factor=1 --window-size=1024,1024 --virtual-time-budget=3000 --default-background-color=00000000 \
    --screenshot="$TMP/icon.png" "file://$PWD/tools/app-icon.html${1:+?look=$1}" >/dev/null 2>&1
  if [ "$3" = flat ]; then
    sips -s format bmp "$TMP/icon.png" --out "$TMP/icon.bmp" >/dev/null
    sips -s format png "$TMP/icon.bmp" --out "$DIR/$2" >/dev/null
  else
    cp "$TMP/icon.png" "$DIR/$2"
  fi
  sips -g pixelWidth -g pixelHeight -g hasAlpha "$DIR/$2"
}
shoot "" "AppIcon-512@2x.png" flat
shoot dark "AppIcon-dark.png" flat
shoot tinted "AppIcon-tinted.png"
