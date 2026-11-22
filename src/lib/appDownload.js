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
