#!/bin/sh
# Downloads the three fonts the games use into fonts/, so the app never loads Google Fonts.
# Run once from the repo folder:  sh tools/get-fonts.sh
set -e
cd "$(dirname "$0")/.."
B=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -fL -o fonts/Fredoka.ttf        "$B/fredoka/Fredoka%5Bwdth,wght%5D.ttf"
curl -fL -o fonts/Nunito.ttf         "$B/nunito/Nunito%5Bwght%5D.ttf"
curl -fL -o fonts/Andika-Regular.ttf "$B/andika/Andika-Regular.ttf"
curl -fL -o fonts/Andika-Bold.ttf    "$B/andika/Andika-Bold.ttf"
curl -fL -o fonts/OFL-Fredoka.txt    "$B/fredoka/OFL.txt"
curl -fL -o fonts/OFL-Nunito.txt     "$B/nunito/OFL.txt"
curl -fL -o fonts/OFL-Andika.txt     "$B/andika/OFL.txt"
echo "Fonts saved in fonts/"
