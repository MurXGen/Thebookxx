// Where the Android APK is served from: the latest GitHub release asset, so a
// new build only needs a new release (the link never changes). Override with
// NEXT_PUBLIC_ANDROID_APK_URL if it's ever hosted elsewhere.
export const ANDROID_APK_URL =
  process.env.NEXT_PUBLIC_ANDROID_APK_URL ||
  "https://github.com/MurXGen/Thebookxx/releases/latest/download/thebookx.apk";

export const isAndroidUA = () =>
  typeof navigator !== "undefined" && /android/i.test(navigator.userAgent || "");

// True inside the TheBookX Android app's WebView (checkout / orders screens).
export const isInAndroidApp = () => {
  if (typeof window === "undefined") return false;
  try {
    if (/TheBookXApp/i.test(navigator.userAgent || "")) return true;
    return localStorage.getItem("tbx_app") === "android";
  } catch {
    return false;
  }
};

// Latest APK published as a GitHub release. Bump these with every new APK
// (the app compares its own version with ANDROID_APK_VERSION via
// /api/app/version and asks older installs to update).
export const ANDROID_APK_VERSION = "1.1.0";
export const ANDROID_APK_NOTES = "Smoother app, faster updates and a calmer home screen.";
// SHA-256 of that thebookx.apk — powers the "Scan it on VirusTotal" link.
export const ANDROID_APK_SHA256 = "99221698f851b858b10ac0a460b4a42eb7d44f7143f3444c796d354c500bba0a";

export const virusTotalUrl = () =>
  ANDROID_APK_SHA256
    ? `https://www.virustotal.com/gui/file/${ANDROID_APK_SHA256}`
    : "https://www.virustotal.com/gui/home/upload";

// Starts the APK download and opens the "it's safe" notice (ApkSafetyNotice),
// since Chrome warns about any app downloaded outside the Play Store.
export const downloadApk = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tbx:apk-download"));
  window.location.href = ANDROID_APK_URL;
};

// Opens the "Get the app" benefits sheet (AppInstall.jsx). `source` is for analytics.
export const openAppSheet = (source = "unknown") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("tbx:app-sheet", { detail: { source } }));
};
