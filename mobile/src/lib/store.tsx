import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  bundledCatalog,
  comboPairDiscount,
  type Combo,
  fetchFreshCatalog,
  isOneRupee,
  loadCachedCatalog,
  type Book,
  type Catalog,
} from "@/lib/catalog";
import { resolveApplied } from "@/lib/pricing";

// Cart shape matches the website's localStorage "cart" ([{ id, qty }]) so the
// in-app checkout (website /bag in a WebView) picks it up unchanged.
export type CartLine = { id: string; qty: number };

// Saved once at checkout (or entered on the Account tab); the phone number is
// how the website looks up a reader's orders too.
export type Profile = {
  name: string;
  phone: string;
  email: string;
  pincode: string;
  city: string;
  state: string;
  address: string;
};
export const EMPTY_PROFILE: Profile = { name: "", phone: "", email: "", pincode: "", city: "", state: "", address: "" };

type Store = {
  ready: boolean;
  catalog: Catalog;
  byId: Map<string, Book>;
  refreshing: boolean;
  refreshCatalog: () => Promise<void>;
  cart: CartLine[];
  setCartFromWeb: (lines: CartLine[]) => void;
  qtyOf: (id: string) => number;
  add: (id: string) => { ok: boolean; reason?: string };
  dec: (id: string) => void;
  remove: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  mrpTotal: number;
  paidSubtotal: number; // excludes ₹1 books
  wishlist: string[];
  toggleWish: (id: string) => void;
  isWished: (id: string) => boolean;
  pincode: string;
  setPincode: (p: string) => void;
  recent: string[];
  markViewed: (id: string) => void;
  deviceId: string;
  hasOneRupee: boolean;
  appliedOffer: number; // ₹ value of the applied flat reward (0 = none)
  applyOffer: (v: number) => void;
  offerDiscount: number; // flat reward + 10% combo-pair discount
  flatDiscount: number;
  comboDiscount: number;
  offerLabel: string;
  combos: Combo[];
  addCombo: (c: Combo) => { added: number; reason?: string };
  profile: Profile;
  saveProfile: (p: Partial<Profile>) => void;
  signOut: () => void;
  // Add-ons chosen in the bag; the checkout opens with the same choices.
  addons: Addons;
  setAddons: (a: Partial<Addons>) => void;
};

export type Addons = { bookmarks: number; gift: boolean; giftNote: string; faster: boolean };
const NO_ADDONS: Addons = { bookmarks: 0, gift: false, giftNote: "", faster: false };

const Ctx = createContext<Store | null>(null);

const K = {
  cart: "cart",
  wish: "wishlist",
  pin: "tbx_pincode",
  recent: "tbx_recent",
  device: "tbx_device_id",
  profile: "tbx_profile",
  offer: "tbx_applied_offer",
};

const readJSON = async <T,>(k: string, fallback: T): Promise<T> => {
  try {
    const raw = await AsyncStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const newId = () =>
  "app-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [catalog, setCatalog] = useState<Catalog>(bundledCatalog);
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [pincode, setPin] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [appliedOffer, setAppliedOffer] = useState(0);
  const [addons, setAddonsState] = useState<Addons>(NO_ADDONS);
  const setAddons = useCallback((a: Partial<Addons>) => setAddonsState((cur) => ({ ...cur, ...a })), []);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const [c, w, p, r, d, cached, prof, off] = await Promise.all([
        readJSON<CartLine[]>(K.cart, []),
        readJSON<string[]>(K.wish, []),
        AsyncStorage.getItem(K.pin).catch(() => null),
        readJSON<string[]>(K.recent, []),
        AsyncStorage.getItem(K.device).catch(() => null),
        loadCachedCatalog(),
        readJSON<Profile>(K.profile, EMPTY_PROFILE),
        AsyncStorage.getItem(K.offer).catch(() => null),
      ]);
      setProfile({ ...EMPTY_PROFILE, ...prof });
      setAppliedOffer(Number(off) || 0);
      setCart(Array.isArray(c) ? c : []);
      setWishlist(Array.isArray(w) ? w : []);
      setPin(p || "");
      setRecent(Array.isArray(r) ? r : []);
      const id = d || newId();
      if (!d) AsyncStorage.setItem(K.device, id).catch(() => {});
      setDeviceId(id);
      if (cached) setCatalog(cached);
      loaded.current = true;
      setReady(true);
      const fresh = await fetchFreshCatalog();
      if (fresh) setCatalog(fresh);
    })();
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(K.cart, JSON.stringify(cart)).catch(() => {});
  }, [cart]);
  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(K.wish, JSON.stringify(wishlist)).catch(() => {});
  }, [wishlist]);
  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(K.recent, JSON.stringify(recent)).catch(() => {});
  }, [recent]);

  const byId = useMemo(() => new Map(catalog.books.map((b) => [b.id, b])), [catalog]);

  const totals = useMemo(() => {
    let subtotal = 0,
      mrpTotal = 0,
      paidSubtotal = 0,
      cartCount = 0;
    for (const l of cart) {
      const b = byId.get(l.id);
      if (!b) continue;
      cartCount += l.qty;
      subtotal += b.price * l.qty;
      mrpTotal += Math.max(b.mrp, b.price) * l.qty;
      if (!isOneRupee(b)) paidSubtotal += b.price * l.qty;
    }
    return { subtotal, mrpTotal, paidSubtotal, cartCount };
  }, [cart, byId]);

  const hasOneRupee = cart.some((l) => {
    const b = byId.get(l.id);
    return !!b && isOneRupee(b);
  });
  const applied = resolveApplied(totals.subtotal, hasOneRupee, appliedOffer);
  const flatDiscount = applied?.value || 0;
  const combos = useMemo(() => catalog.combos || [], [catalog]);
  const comboDiscount = useMemo(() => comboPairDiscount(cart, byId, combos).discount, [cart, byId, combos]);
  const offerDiscount = flatDiscount + comboDiscount;
  const offerLabel = [applied ? `₹${applied.value} OFF` : "", comboDiscount ? "★ Combo discount (10%)" : ""].filter(Boolean).join(" + ");
  // Adds every book of a combo that isn't already in the bag.
  const addCombo = useCallback(
    (c: Combo) => {
      const missing = c.bookIds.filter((id) => !cart.some((l) => l.id === id));
      const ok = missing.filter((id) => {
        const b = byId.get(id);
        return b && b.stock > 0;
      });
      if (!missing.length) return { added: 0, reason: "This combo is already in your bag" };
      if (!ok.length) return { added: 0, reason: "This combo is out of stock" };
      setCart((prev) => [...prev, ...ok.map((id) => ({ id, qty: 1 }))]);
      return { added: ok.length };
    },
    [cart, byId],
  );
  const applyOffer = useCallback((v: number) => {
    setAppliedOffer(v);
    AsyncStorage.setItem(K.offer, String(v)).catch(() => {});
  }, []);
  const saveProfile = useCallback((p: Partial<Profile>) => {
    setProfile((cur) => {
      const next = { ...cur, ...p };
      AsyncStorage.setItem(K.profile, JSON.stringify(next)).catch(() => {});
      return next;
    });
    if (p.pincode && /^[1-9]\d{5}$/.test(p.pincode)) {
      setPin(p.pincode);
      AsyncStorage.setItem(K.pin, p.pincode).catch(() => {});
    }
  }, []);
  const signOut = useCallback(() => {
    setProfile(EMPTY_PROFILE);
    AsyncStorage.removeItem(K.profile).catch(() => {});
  }, []);

  const qtyOf = useCallback((id: string) => cart.find((l) => l.id === id)?.qty || 0, [cart]);

  const add = useCallback(
    (id: string) => {
      const b = byId.get(id);
      if (!b) return { ok: false, reason: "This book is unavailable right now" };
      if (b.stock <= 0) return { ok: false, reason: "Out of stock" };
      if (isOneRupee(b)) {
        if (cart.some((l) => l.id === id)) return { ok: false, reason: "Maximum book limit reached for Rs.1" };
        if (cart.some((l) => { const x = byId.get(l.id); return !!x && isOneRupee(x); }))
          return { ok: false, reason: "Just one ₹1 book per order 😊 Remove the one in your bag to pick this instead." };
      }
      const cur = cart.find((l) => l.id === id)?.qty || 0;
      if (cur >= b.stock) return { ok: false, reason: `Only ${b.stock} in stock` };
      setCart((prev) =>
        prev.some((l) => l.id === id)
          ? prev.map((l) => (l.id === id ? { ...l, qty: l.qty + 1 } : l))
          : [...prev, { id, qty: 1 }],
      );
      return { ok: true };
    },
    [byId, cart],
  );

  const dec = useCallback((id: string) => setCart((prev) => prev.map((l) => (l.id === id ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0)), []);
  const remove = useCallback((id: string) => setCart((prev) => prev.filter((l) => l.id !== id)), []);
  const clearCart = useCallback(() => {
    setCart([]);
    setAddonsState(NO_ADDONS);
  }, []);
  const setCartFromWeb = useCallback((lines: CartLine[]) => {
    const clean = (Array.isArray(lines) ? lines : [])
      .filter((l) => l && typeof l.id === "string" && Number(l.qty) > 0)
      .map((l) => ({ id: l.id, qty: Math.floor(Number(l.qty)) }));
    setCart((prev) => (JSON.stringify(prev) === JSON.stringify(clean) ? prev : clean));
  }, []);

  const toggleWish = useCallback(
    (id: string) => setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [id, ...w])),
    [],
  );
  const isWished = useCallback((id: string) => wishlist.includes(id), [wishlist]);

  const setPincode = useCallback((p: string) => {
    setPin(p);
    AsyncStorage.setItem(K.pin, p).catch(() => {});
  }, []);

  const markViewed = useCallback((id: string) => {
    setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 20));
  }, []);

  const refreshCatalog = useCallback(async () => {
    setRefreshing(true);
    const fresh = await fetchFreshCatalog();
    if (fresh) setCatalog(fresh);
    setRefreshing(false);
  }, []);

  const value: Store = {
    ready,
    catalog,
    byId,
    refreshing,
    refreshCatalog,
    cart,
    setCartFromWeb,
    qtyOf,
    add,
    dec,
    remove,
    clearCart,
    ...totals,
    wishlist,
    toggleWish,
    isWished,
    pincode,
    setPincode,
    recent,
    markViewed,
    deviceId,
    hasOneRupee,
    appliedOffer: applied?.value || 0,
    applyOffer,
    offerDiscount,
    flatDiscount,
    comboDiscount,
    offerLabel,
    combos,
    addCombo,
    profile,
    saveProfile,
    signOut,
    addons,
    setAddons,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside StoreProvider");
  return s;
}
