# Making the iPad app (Phase 2)

These steps turn the `app-store` branch into a real iPad app with Capacitor 8 and open it in Xcode.
You do them once. After that, updating the app is two commands (see the end).

## What you need

- The Mac with **Xcode 26.3**
- **Node.js 22 or newer.** In Terminal, type `node -v`. If it says v20 or lower, install the LTS version from [nodejs.org](https://nodejs.org).
- Your iPad and its cable

## 1. Point the Mac at the right Xcode (once)

Open Xcode once, accept the licence and let it install any extra parts it asks for. Then in Terminal:

```bash
sudo xcode-select -s /Applications/Xcode.app
```

If your Xcode has a different name in Applications (for example `Xcode-26.3.app`), use that name instead.
It asks for your Mac password. Check it worked with `xcodebuild -version`, which should say Xcode 26.3.

## 2. Get the branch and the fonts

In GitHub Desktop: **Fetch origin**, switch to the **app-store** branch, then **Repository → Open in Terminal**.
If you haven't already:

```bash
sh tools/get-fonts.sh
```

## 3. Make the app (copy and paste these one at a time)

```bash
npm install
npm run app:build
npx cap add ios
npm run app:sync
npm run app:open
```

- `npm install` downloads Capacitor (and the ElevenLabs tool you already had).
- `npm run app:build` copies only the game files into `app-www/`. It should say about 1,850 files.
- `npx cap add ios` makes the Xcode project in a new `ios/` folder. It only needs running once.
- `npm run app:open` opens the project in Xcode.

## 4. Set it up in Xcode

In the left-hand list, click the blue **App** project at the top, then the **App** target.

1. **General → Supported Destinations:** keep **iPad**. Remove iPhone, and any Mac or Vision entries (select one, then the − button).
2. **General → Display Name:** Meadow Clubhouse.
3. **Signing & Capabilities → Team:** choose **Add an Account…** and sign in with your Apple ID. The free "Personal Team" is fine for running the app on your own iPad. Once you join the Apple Developer Program, switch it to your paid team.
   If Xcode says the bundle identifier is taken, change `uk.co.holmeshouse.meadow` to something like `uk.co.holmeshouse.meadowclub` in both Xcode and `capacitor.config.json`.

## 5. Run it on the iPad

1. Plug in the iPad and tap **Trust** on it.
2. On the iPad, turn on **Settings → Privacy & Security → Developer Mode**. It restarts.
3. In Xcode's top bar, pick your iPad as the destination, then press the ▶ button.
4. The first time, the iPad may refuse to open it. Go to **Settings → General → VPN & Device Management**, tap your Apple ID and choose **Trust**, then press ▶ again.

If Xcode says your iPad's iPadOS is too new for this Xcode, pick an iPad from the **simulator** list instead for now. Everything except the real-iPad feel can be tested there.

## 6. Check these on the iPad

- [ ] It asks for a name the first time and Bonnie talks on the first tap
- [ ] A maths level and a Meadow Words level play normally
- [ ] Bonnie's Walk works
- [ ] There's no "Add to Home Screen" banner
- [ ] Fonts look the same as on the website (rounded Fredoka headings)
- [ ] Turn on Airplane Mode, close the app fully (swipe it away), open it again: everything still works
- [ ] Earn a few bones, close the app fully, reopen: the bones are still there
- [ ] The top of the screen isn't hidden under the clock and battery

Write down anything that looks wrong (a screenshot is perfect) and send it to Claude.

## 7. Save the new files

GitHub Desktop now shows the new `ios/` folder and an updated `package-lock.json`. Commit them
("Add the iPad app project") and **Push origin**. `app-www/` and `node_modules/` are never uploaded.

## After any change to the games

```bash
npm run app:sync
```

Then press ▶ in Xcode again.

## How saves are kept safe

The games still save as they always have, but inside the app `js/app-storage.js` also copies every
Meadow save into the app's own storage (Capacitor Preferences). If iOS ever clears the web view's
storage, the next page that opens puts the saves back and reloads. On the website the file does nothing.
