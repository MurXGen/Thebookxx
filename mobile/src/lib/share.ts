import * as Clipboard from "expo-clipboard";
import { Platform, Share } from "react-native";
import { toast } from "@/lib/toast";

// Native share sheet; where sharing isn't supported (web preview), copy instead.
export async function shareText(message: string, url?: string) {
  const text = url ? `${message}\n${url}` : message;
  if (Platform.OS === "web" && !(globalThis.navigator as { share?: unknown } | undefined)?.share) {
    await Clipboard.setStringAsync(text).catch(() => {});
    toast("Paste it anywhere to share", { title: "Link copied", kind: "success" });
    return;
  }
  try {
    await Share.share({ message: text });
  } catch {
    await Clipboard.setStringAsync(text).catch(() => {});
    toast("Paste it anywhere to share", { title: "Link copied", kind: "success" });
  }
}
