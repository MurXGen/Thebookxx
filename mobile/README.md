# TheBookX — Android app (Expo SDK 58)

Native shopping app for thebookx.in: Swiggy-style home, bag with the website's
offer ladder, native two-step checkout (same sheet columns + Telegram alert as
the website), phone-based orders, and notification preferences.

## Run it on your phone (Expo Go)

```bash
cd mobile
npm install
npx expo start
```
Scan the QR code with **Expo Go** on Android. Everything works in Expo Go
except *remote* push (server-sent order updates). Local reminders do work.

## Build the APK to share

```bash
npm i -g eas-cli          # once
eas login                 # once
eas init                  # once — links the project and adds extra.eas.projectId
eas build -p android --profile apk
```
- `apk` → arm64-only, minified (R8 + resource shrinking). Smallest download;
  runs on every Android phone from ~2017 on.
- `apk-legacy` → also includes 32-bit ARM for old / budget phones (bigger).
- `production` → .aab for the Play Store.

Download the finished APK from the EAS build page and put it at
`public/downloads/thebookx.apk` in the website repo (or set
`NEXT_PUBLIC_ANDROID_APK_URL` to wherever it's hosted). On Android, the
website's install banners now download this APK.

## Data
- Catalogue: `src/data/catalog.json` ships in the app (instant + offline) and is
  refreshed from `https://www.thebookx.in/api/app/catalog`. Rebuild the bundled
  snapshot after big catalogue changes: `node scripts/sync-catalog.mjs`.
- Orders: written via `/api/order-write` (append), status polled via `/api/order`,
  history via `/api/orders?phone=`. Team alert via the same journalx Telegram endpoint.
- Notification prefs + push token: `POST /api/app/devices` → "App Devices" sheet tab
  (create the tab before relying on it).

## Pricing rules mirrored from the website
`src/lib/pricing.ts` ⇄ `src/utils/cartOffers.js`, `src/lib/eta.ts` ⇄
`src/lib/deliveryEta.js`, combos ⇄ `src/utils/combos.js`. Keep them in sync.
