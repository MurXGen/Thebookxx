import { StyleSheet, View } from "react-native";
import { BookmarkAddon, ToggleAddon } from "@/components/AddonRows";
import { Text } from "@/components/ui-text";
import { confetti } from "@/lib/confetti";
import { BOOKMARK_UNIT, deliveryCharge, freeBookmarksFor, MAX_BOOKMARKS } from "@/lib/pricing";
import { useStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { C, rupee } from "@/theme";

// Website's BagAddons: free bookmarks (2 / 3 / 4 by order value, then ₹9 each)
// and an opt-in Faster delivery. Checkout opens with the same choices.
export default function BagAddons({ fasterEta }: { fasterEta: string }) {
  const { addons, setAddons, subtotal, hasOneRupee } = useStore();
  const free = freeBookmarksFor(subtotal);
  const n = addons.bookmarks;
  const paid = Math.max(0, n - free) * BOOKMARK_UNIT;
  const extra = Math.max(0, deliveryCharge(subtotal, true, hasOneRupee) - deliveryCharge(subtotal, false, hasOneRupee));
  return (
    <View style={s.wrap}>
      <Text style={s.head}>Add-ons for this order</Text>
      <BookmarkAddon
        count={n}
        max={MAX_BOOKMARKS}
        free={!paid}
        price={paid ? `+${rupee(paid)}` : `${free} FREE`}
        sub={n > free ? `${free} free + ${n - free} × ₹${BOOKMARK_UNIT}` : n ? `${n} of ${free} free added${n === free ? ` · more ₹${BOOKMARK_UNIT} each` : ""}` : `${free} free with this order · then ₹${BOOKMARK_UNIT} each`}
        onChange={(v) => {
          if (v > MAX_BOOKMARKS) return toast(`Up to ${MAX_BOOKMARKS} bookmarks per order`, { kind: "info" });
          if (n === 0 && v === 1) confetti(false);
          setAddons({ bookmarks: Math.max(0, v) });
        }}
      />
      <ToggleAddon kind="flash" title="Faster delivery" price={`+${rupee(extra)}`} sub={`Packed first, sent by priority post · arrives in ${fasterEta}`} on={addons.faster} onToggle={() => setAddons({ faster: !addons.faster })} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: "#fff", marginTop: 10, padding: 14, gap: 10 },
  head: { fontSize: 15, fontWeight: "600", color: C.ink },
});
