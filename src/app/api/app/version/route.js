import { NextResponse } from "next/server";
import { ANDROID_APK_NOTES, ANDROID_APK_URL, ANDROID_APK_VERSION } from "@/lib/appDownload";

// The Android app asks this on launch; installs older than `version` show a
// "New version — Update" banner that downloads `url`.
export async function GET() {
  return NextResponse.json(
    { version: ANDROID_APK_VERSION, url: ANDROID_APK_URL, notes: ANDROID_APK_NOTES },
    { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
  );
}
