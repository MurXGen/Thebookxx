// QuickReads: 10 free cards per book, the rest unlock for ₹19 (website rules).
// Card text comes from /api/quickread (full set only for a verified purchase).
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API } from "@/theme";

export const QUICKREAD_PRICE = 19;
export const QUICKREAD_MRP = 99;
export const QUICKREAD_FREE_FRAMES = 10;

export type Frame = { id: string; title: string; content: string };
export type QuickRead = { bookId: string; total: number; unlocked: boolean; frames: Frame[] };

export async function fetchQuickRead(bookId: string, phone: string): Promise<QuickRead> {
  const p = phone.replace(/\D/g, "").slice(-10);
  const r = await fetch(`${API}/api/quickread?bookId=${encodeURIComponent(bookId)}${p.length === 10 ? `&phone=${p}` : ""}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

const KEY = "tbx_qr_progress";
export async function getProgress(): Promise<Record<string, number>> {
  try {
    return JSON.parse((await AsyncStorage.getItem(KEY)) || "{}");
  } catch {
    return {};
  }
}
export async function setProgress(bookId: string, index: number) {
  const all = await getProgress();
  all[bookId] = index;
  AsyncStorage.setItem(KEY, JSON.stringify(all)).catch(() => {});
}
