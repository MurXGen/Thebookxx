"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  X,
  User,
  Home,
  Store,
  MapPin,
  Navigation,
  Package,
  Loader2,
  MessageCircle,
  Download,
  ChevronDown,
  Truck,
  ShieldCheck,
  Info,
  Train,
  Plane,
  Gift,
  Maximize2,
  Minimize2,
  CalendarClock,
  Pencil,
  Zap,
  ChevronRight,
  Check,
  Star,
  Copy,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  submitReviewToSheet,
  isReviewRateLimited,
  recordReviewSubmission,
} from "@/utils/reviewForm";
import TrackSheet from "@/components/profile/TrackSheet";
import SupportSheet from "@/components/profile/SupportSheet";
import OrderScratchCard from "@/components/profile/OrderScratchCard";
import ReferAndEarn from "@/components/profile/ReferAndEarn";
import CodPayOnline from "@/components/profile/CodPayOnline";
import CommunityJoin from "@/components/CommunityJoin";
import PwaInstallPromo from "@/components/PwaInstallPromo";
import AddBeforePacking from "@/components/profile/AddBeforePacking";
import BookCard from "@/components/BookCard";
import { updateOrderRow } from "@/utils/googleFormOrder";
import { parseAddonsField } from "@/utils/addonsField";
import { getDeliveryCharge } from "@/utils/cartOffers";
import { books as ALL_BOOKS } from "@/utils/book";

// TheBookX dispatch origin (Matunga, Mumbai).
const SENDER = { lat: 19.0272, lng: 72.8562, label: "TheBookX · Matunga, Mumbai" };
const SUPPORT_WHATSAPP = "917710892108";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// name -> book (cover + price)
const normName = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
const BOOK_BY_NAME = {};
ALL_BOOKS.forEach((b) => {
  if (b.name) BOOK_BY_NAME[normName(b.name)] = b;
});
function findBook(name) {
  // QuickReads share the same title as their book — drop the tag so the cover
  // resolves to that book's image.
  const n = normName(String(name || "").replace(/\(quickread\)/i, ""));
  if (!n) return null;
  if (BOOK_BY_NAME[n]) return BOOK_BY_NAME[n];
  const key = Object.keys(BOOK_BY_NAME).find(
    (k) => k.includes(n) || n.includes(k),
  );
  return key ? BOOK_BY_NAME[key] : null;
}

function parseBooks(str) {
  return String(str || "")
    .split("\n")
    .map((line) => {
      if (!line.trim()) return null;
      const full = line.match(
        /\d+\.\s([^|]+)\s*\|\s*Qty:\s*(\d+)\s*\|\s*₹(\d+)\s*each\s*\|\s*Total:\s*₹(\d+)/,
      );
      if (full) {
        return {
          name: full[1].trim(),
          qty: parseInt(full[2], 10),
          price: parseInt(full[3], 10),
          total: parseInt(full[4], 10),
        };
      }
      const name = (line.split("|")[0] || "").replace(/^\d+\.\s*/, "").trim();
      const qty = parseInt((line.match(/Qty:\s*(\d+)/i) || [])[1] || "1", 10);
      const total = parseInt(
        (line.match(/Total:\s*₹?\s*(\d+)/i) || [])[1] || "0",
        10,
      );
      return name ? { name, qty, price: total, total } : null;
    })
    .filter(Boolean);
}

function parseSheetDate(v) {
  if (!v) return null;
  const s = String(v);
  const m = s.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?/);
  if (m) return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), 0);
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dmy) return new Date(+dmy[3], +dmy[2] - 1, +dmy[1]);
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

// Load Leaflet (JS + CSS) from CDN once.
function loadLeaflet() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(null);
    if (window.L) return resolve(window.L);
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    const sc = document.createElement("script");
    sc.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    sc.async = true;
    sc.onload = () => resolve(window.L);
    sc.onerror = () => resolve(null);
    document.body.appendChild(sc);
  });
}

// Express delivery when the Shipping ID starts with "E" (or the delivery type
// says faster/express). Drives the vehicle emoji, ETA and progress window.
function isExpressOrder(order) {
  const sid = String(order["Shipping ID"] || order.shippingId || "").trim();
  return /^e/i.test(sid) || /faster|express/i.test(order["Delivery Type"] || "");
}

// Journey progress 0..1 from status (primary) + days elapsed (secondary).
function computeProgress(order) {
  const st = String(order["Order Status"] || order.status || "").toLowerCase();
  // Delivered / out for delivery → route fulfilled (parcel at destination).
  if (/delivered|money received/.test(st)) return 1;
  if (/out for delivery/.test(st)) return 1;
  // Only once it's actually in transit do we move the vehicle along the route.
  if (/in\s*transit/.test(st)) {
    const win = isExpressOrder(order) ? 5 : 12;
    const od = parseSheetDate(
      order["Timestamp (D)"] || order["Timestamp"] || order["Timestamp(D)"],
    );
    const days = od ? (Date.now() - od.getTime()) / 86400000 : 0;
    // After 3 days the parcel is shown at least halfway (feels "nearer"), then
    // it keeps progressing from that point; before that it ramps up to ~50%.
    let p;
    if (days >= 3) {
      p = 0.5 + Math.min(0.4, ((days - 3) / win) * 0.9);
    } else {
      p = Math.max(0.3, (days / 3) * 0.5);
    }
    return Math.min(0.92, p);
  }
  // Confirmed / getting shipped / anything else → still at the source.
  return 0;
}

function statusLabel(order) {
  const st = String(order["Order Status"] || "").toLowerCase();
  if (/delivered|money received/.test(st))
    return { title: "Delivered", sub: "Your books have arrived — happy reading!" };
  if (/out for delivery/.test(st))
    return { title: "Out for delivery", sub: "Arriving today — keep your phone handy" };
  if (/in\s*transit/.test(st))
    return { title: "In transit", sub: "Your parcel is on its way" };
  if (/shipped|getting shipped/.test(st))
    return { title: "About to ship", sub: "Your parcel is being handed over" };
  if (/processing/.test(st))
    return { title: "Order status", sub: "We're preparing your order" };
  if (/cancel/.test(st))
    return { title: "Cancelled", sub: "This order was cancelled" };
  if (/unconfirmed|pending/.test(st)) {
    return {
      title: "Order status",
      sub: "We're confirming your order — this usually takes a few minutes",
    };
  }
  return { title: "Order confirmed", sub: "We've received your order" };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const number = String(params?.number || "").replace(/\D/g, "").slice(-10);
  const orderId = decodeURIComponent(params?.orderid || "");
  // Shareable pay-link: ?pay=online (or ?pay=1) auto-opens the pay flow. Read
  // from window (avoids needing a Suspense boundary for useSearchParams).
  const [payParam, setPayParam] = useState(false);
  useEffect(() => {
    try {
      setPayParam(!!new URLSearchParams(window.location.search).get("pay"));
    } catch {}
  }, []);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiver, setReceiver] = useState(null); // {lat,lng,label}
  const [geoState, setGeoState] = useState("idle"); // idle|loading|ok|missing
  const [routeCoords, setRouteCoords] = useState(null);
  const [showTrack, setShowTrack] = useState(false);
  const [trackCopied, setTrackCopied] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [mapFull, setMapFull] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  // Address edit sheet
  const [showAddrEdit, setShowAddrEdit] = useState(false);
  const [addrForm, setAddrForm] = useState(null);
  const [addrSaving, setAddrSaving] = useState(false);
  // Order note (Order Comment)
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteSaving, setNoteSaving] = useState(false);
  // Faster-delivery upgrade (applied to the sheet) + undo snapshot.
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  // Prepaid-order upgrade: pay the surplus, then verify + merchant-approve on WA.
  const [prepaidStage, setPrepaidStage] = useState(false);
  const [surplusVerified, setSurplusVerified] = useState(false);
  const [surplusCopied, setSurplusCopied] = useState(false);
  // Order/service review (posts to the shared book-store review sheet).
  const [revRating, setRevRating] = useState(0);
  const [revHover, setRevHover] = useState(0);
  const [revText, setRevText] = useState("");
  const [revBusy, setRevBusy] = useState(false);
  const [revDone, setRevDone] = useState(false);
  const [revErr, setRevErr] = useState("");
  // Quick-action slide-up sheets (note / rate / refer).
  const [showNoteSheet, setShowNoteSheet] = useState(false);
  const [showRateSheet, setShowRateSheet] = useState(false);
  const [showReferSheet, setShowReferSheet] = useState(false);

  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const animRef = useRef(null);
  const geoKey = `tbx_geo_${number}`;

  // Fetch the order. The `ignore` guard means React's dev double-invoke (Strict
  // Mode) can't trigger a second state update / re-render flicker — the order
  // resolves once and the skeleton hands off directly to the content.
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // Pass the logged-in number so the server only returns this order when
        // it belongs to that number (prevents viewing another customer's order
        // by guessing an Order ID).
        const res = await fetch(
          `/api/order?orderId=${encodeURIComponent(orderId)}${
            /^\d{10}$/.test(number) ? `&phone=${number}` : ""
          }`,
        );
        const json = await res.json();
        const row = json.order || null;
        // Defence in depth: if the row's phone doesn't match the URL number,
        // treat it as not found rather than rendering someone else's details.
        const rowPhone = String(row?.["Phone Number"] || "")
          .replace(/\D/g, "")
          .slice(-10);
        const owned = row && (!/^\d{10}$/.test(number) || rowPhone === number);
        // Unconfirmed orders (drafts / payment-pending) aren't real orders yet —
        // show the "not found" state rather than a detail page for them.
        const unconfirmed =
          row &&
          (/unconfirmed/i.test(row["Order Status"] || "") ||
            /\(unconfirmed\)/i.test(row["Customer Name"] || ""));
        if (!ignore) setOrder(owned && !unconfirmed ? row : null);
      } catch {
        if (!ignore) setOrder(null);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [orderId, number]);

  // Geocode the receiver address once the order is known; fall back to a
  // previously-shared location saved for this number.
  useEffect(() => {
    if (!order) return;
    const parts = [
      order["Address"],
      order["City"],
      order["State"],
      order["Pincode"],
    ]
      .map((x) => String(x || "").trim())
      .filter(Boolean)
      .map((x) => x.replace(/,?\s*Pinned location:\s*https?:\/\/\S+/i, ""));
    const q = parts.join(", ");

    setGeoState("loading");
    const geocode = async (query) => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        return json.result && json.result.lat ? json.result : null;
      } catch {
        return null;
      }
    };
    (async () => {
      // We never use the visitor's live location. Locate the destination from
      // the order's address; if that can't be resolved, fall back to the order
      // pincode so the map still shows the delivery area.
      let result = q && q.length >= 4 ? await geocode(q) : null;
      const pin = String(order["Pincode"] || "").trim();
      if (!result && /^\d{6}$/.test(pin)) {
        result = await geocode(`${pin}, India`);
        if (result) result = { ...result, approx: true };
      }
      if (result) {
        setReceiver(result);
        setGeoState("ok");
      } else {
        setGeoState("missing");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  // Fetch a real road route whenever the receiver coords change.
  useEffect(() => {
    if (!receiver) {
      setRouteCoords(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/route?from=${SENDER.lat},${SENDER.lng}&to=${receiver.lat},${receiver.lng}`,
        );
        const json = await res.json();
        if (!cancelled)
          setRouteCoords(
            Array.isArray(json.coords) && json.coords.length > 1
              ? json.coords
              : null,
          );
      } catch {
        if (!cancelled) setRouteCoords(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [receiver]);

  // Draw / update the Leaflet map.
  useEffect(() => {
    if (!receiver || !mapRef.current) return;
    let disposed = false;
    (async () => {
      const L = await loadLeaflet();
      if (!L || disposed || !mapRef.current) return;

      if (!mapObj.current) {
        mapObj.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: false,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
        }).addTo(mapObj.current);
      }
      const map = mapObj.current;
      map.eachLayer((l) => {
        if (l instanceof L.Marker || l instanceof L.Polyline) map.removeLayer(l);
      });

      const A = [SENDER.lat, SENDER.lng];
      const B = [receiver.lat, receiver.lng];
      const pct = computeProgress(order);

      // Choose the path: real route if available, else straight line.
      const path = routeCoords && routeCoords.length > 1 ? routeCoords : [A, B];
      const splitIdx = Math.max(
        0,
        Math.min(path.length - 1, Math.round(pct * (path.length - 1))),
      );
      // Inline lucide-style SVGs (white stroke) so map pins use icons, not emoji.
      const svg = (inner) =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
      const ICON_BOOK =
        '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>';
      const ICON_HOME =
        '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>';
      const dot = (color, inner, size = 30) =>
        L.divIcon({
          className: "od-pin",
          html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 2px 6px rgba(0,0,0,.3)">${svg(inner)}</span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      // Soft orange "glow" underlay, a subtle dotted base, then the orange
      // "travelled" line that grows as the vehicle animates to the current point.
      L.polyline(path, {
        color: "#fb8500",
        weight: 11,
        opacity: 0.12,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      L.polyline(path, {
        color: "#94a3b8",
        weight: 3.5,
        opacity: 0.7,
        dashArray: "1 10",
        lineCap: "round",
      }).addTo(map);
      const travelledLine = L.polyline([path[0]], {
        color: "#fb8500",
        weight: 5,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      const aM = L.marker(A, { icon: dot("#111827", ICON_BOOK) }).addTo(map);
      aM.bindTooltip("Dispatched from Mumbai", {
        direction: "top",
        offset: [0, -16],
        className: "od-pin-tip",
      });
      const bM = L.marker(B, { icon: dot("#c0223b", ICON_HOME) }).addTo(map);
      bM.bindTooltip("Delivery address", {
        direction: "top",
        offset: [0, -16],
        className: "od-pin-tip",
      });
      // Vehicle travelling the route — ✈️ for express, 🚆 for standard — inside
      // a white badge with a live pulse, plus a "your order is here" tooltip.
      const vehicleEmoji = isExpressOrder(order) ? "✈️" : "🚆";
      const vehicle = L.marker(path[0], {
        icon: L.divIcon({
          className: "od-vehicle",
          html: `<span class="od-veh-badge"><span class="od-veh-pulse"></span><span class="od-veh-emoji">${vehicleEmoji}</span></span>`,
          iconSize: [42, 42],
          iconAnchor: [21, 21],
        }),
        zIndexOffset: 1000,
      }).addTo(map);
      if (!delivered && !cancelled) {
        vehicle.bindTooltip("Your order is here", {
          permanent: true,
          direction: "top",
          offset: [0, -20],
          className: "od-veh-tip",
        });
      }

      // Zoom to fit the route, then re-centre on the parcel's CURRENT position
      // and lift it up so it sits in the visible upper area (not hidden behind
      // the bottom status overlay).
      const curPoint = path[splitIdx];
      const OVERLAY_LIFT = 96; // px to push the current point above the card
      const focusCurrent = () => {
        try {
          map.fitBounds(path, { padding: [40, 40] });
          if (!delivered) {
            map.setView(curPoint, map.getZoom(), { animate: false });
            map.panBy([0, OVERLAY_LIFT], { animate: false });
          } else {
            // Delivered → focus the destination, lifted above the overlay.
            map.setView(B, map.getZoom(), { animate: false });
            map.panBy([0, OVERLAY_LIFT], { animate: false });
          }
        } catch {}
      };
      focusCurrent();
      setTimeout(() => {
        try {
          map.invalidateSize();
          focusCurrent();
        } catch {}
      }, 80);

      // Smoothly animate the vehicle + orange trail from source to the current
      // point (easeOutCubic), a slow ~2.4s glide once the map is ready.
      if (animRef.current) cancelAnimationFrame(animRef.current);
      const targetIdx = splitIdx;
      const duration = 2400;
      const ease = (t) => 1 - Math.pow(1 - t, 3);
      const startAt = performance.now() + 350; // small settle delay
      const step = (now) => {
        if (disposed) return;
        const t = Math.max(0, Math.min(1, (now - startAt) / duration));
        const idx = Math.max(0, Math.round(ease(t) * targetIdx));
        travelledLine.setLatLngs(path.slice(0, idx + 1));
        vehicle.setLatLng(path[idx]);
        if (t < 1) animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    })();
    return () => {
      disposed = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [receiver, order, routeCoords]);

  // Keep the map filling its container on window resize.
  useEffect(() => {
    const onResize = () => {
      if (mapObj.current) {
        try {
          mapObj.current.invalidateSize();
        } catch {}
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(
    () => () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    },
    [],
  );

  // Resize the Leaflet map after a full-screen toggle (container changed size).
  useEffect(() => {
    if (!mapObj.current) return;
    const t = setTimeout(() => {
      try {
        mapObj.current.invalidateSize();
        if (receiver)
          mapObj.current.fitBounds(
            routeCoords && routeCoords.length > 1
              ? routeCoords
              : [
                  [SENDER.lat, SENDER.lng],
                  [receiver.lat, receiver.lng],
                ],
            { padding: [36, 36] },
          );
      } catch {}
    }, 260);
    return () => clearTimeout(t);
  }, [mapFull, receiver, routeCoords]);

  // Lock body scroll while the map is full-screen.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mapFull ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mapFull]);

  const contactSupport = () => {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/profile/${number}/orders/${encodeURIComponent(orderId)}`
        : "";
    const msg = `Hi TheBookX, I need help with this order 🙏\nOrder: ${orderId}\n${link}`;
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const askAboutOrder = () => {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/profile/${number}/orders/${encodeURIComponent(orderId)}`
        : "";
    const msg = `Hi TheBookX, I need some help with this order 🙏\nOrder: ${orderId}\n${link}`;
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const books = useMemo(
    () => (order ? parseBooks(order["Books List"]) : []),
    [order],
  );

  // Price breakdown (mirrors the profile invoice logic).
  const bd = useMemo(() => {
    const sub = books.reduce((s, b) => s + (b.total || b.price * b.qty || 0), 0);
    const grand = parseFloat(order?.["Total Amount"]) || sub;
    const isFree = (order?.["Delivery Type"] || "").toLowerCase().includes("free");
    let deliveryFee = parseFloat(order?.["Delivery Charge"]) || 0;
    const addons = parseAddonsField(order?.["Gift Wrap"]);
    const giftFee = addons.giftOn
      ? parseFloat(order?.["Gift Wrap Charge"]) || 0
      : 0;
    const bookmarkFee = addons.bookmarkCharge;
    const isCOD = (order?.["Payment Type"] || "").includes("Cash on Delivery");
    let codFee = 0;
    let discount = 0;
    const extra = grand - sub - deliveryFee - giftFee - bookmarkFee;
    if (extra > 0) {
      if (isCOD) codFee = extra;
      else deliveryFee += extra;
    } else if (extra < 0) discount = -extra;
    const freeDelivery = isFree || deliveryFee === 0;
    const isHandling = /handling/i.test(order?.["Delivery Type"] || "");
    // Listing (MRP) = sum of book original prices where known, else sub*1.5
    let listing = 0;
    books.forEach((b) => {
      const bk = findBook(b.name);
      const mrp = bk?.originalPrice || Math.round((b.price || b.total) * 1.5);
      listing += mrp * (b.qty || 1);
    });
    if (!listing) listing = Math.round(sub * 1.5);
    return {
      sub,
      grand,
      deliveryFee,
      giftFee,
      bookmarkFee,
      bookmarkCharged: addons.bookmarkCharged,
      bookmarkFree: addons.bookmarkFree,
      bookmarkQty: addons.bookmarkQty,
      codFee,
      discount,
      freeDelivery,
      deliveryLabel: !freeDelivery && isHandling ? "Handling & Care" : "Delivery",
      listing,
      savings: Math.max(0, listing - sub),
    };
  }, [books, order]);

  const downloadBill = () => {
    if (!order) return;
    const items = books;
    const {
      sub,
      grand,
      deliveryFee,
      giftFee,
      bookmarkFee,
      bookmarkCharged,
      bookmarkFree,
      codFee,
      discount,
      freeDelivery,
      deliveryLabel,
    } = bd;
    const W = 700;
    const P = 44;
    const rowH = 32;
    const scale = 2;
    const summaryCount =
      (sub > 0 ? 1 : 0) +
      1 +
      (giftFee > 0 ? 1 : 0) +
      (bookmarkFee > 0 ? 1 : 0) +
      (codFee > 0 ? 1 : 0) +
      (discount > 0 ? 1 : 0);
    const H = 300 + items.length * rowH + summaryCount * 26 + 70 + 70;
    const canvas = document.createElement("canvas");
    canvas.width = W * scale;
    canvas.height = H * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    let y = P + 10;
    ctx.fillStyle = "#fb8500";
    ctx.font = "700 30px Arial";
    ctx.fillText("TheBookX", P, y);
    y += 26;
    ctx.fillStyle = "#888888";
    ctx.font = "13px Arial";
    ctx.fillText(`Invoice · Order ${order["Order ID"] || orderId}`, P, y);
    y += 18;
    ctx.fillText(`${order["Timestamp"] || ""}`, P, y);
    y += 18;
    ctx.fillText(
      `${order["Customer Name"] || ""} · ${order["Phone Number"] || number}`,
      P,
      y,
    );
    y += 18;
    const addr = `${order["Address"] || ""}, ${order["City"] || ""} ${order["Pincode"] || ""}`;
    ctx.fillText(addr.slice(0, 84), P, y);
    y += 26;
    ctx.strokeStyle = "#eeeeee";
    ctx.beginPath();
    ctx.moveTo(P, y);
    ctx.lineTo(W - P, y);
    ctx.stroke();
    y += 22;
    ctx.fillStyle = "#888888";
    ctx.font = "700 11px Arial";
    ctx.fillText("ITEM", P, y);
    ctx.textAlign = "right";
    ctx.fillText("AMOUNT", W - P, y);
    ctx.textAlign = "left";
    y += 8;
    ctx.beginPath();
    ctx.moveTo(P, y);
    ctx.lineTo(W - P, y);
    ctx.stroke();
    items.forEach((b) => {
      y += rowH;
      ctx.fillStyle = "#0a0a0a";
      ctx.font = "600 14px Arial";
      ctx.fillText(`${b.name} × ${b.qty}`.slice(0, 50), P, y - 9);
      ctx.textAlign = "right";
      ctx.font = "700 14px Arial";
      ctx.fillText(`₹${b.total || b.price * b.qty || 0}`, W - P, y - 9);
      ctx.textAlign = "left";
      ctx.strokeStyle = "#f2f2f2";
      ctx.beginPath();
      ctx.moveTo(P, y);
      ctx.lineTo(W - P, y);
      ctx.stroke();
    });
    const sumLine = (label, val, color) => {
      y += 26;
      ctx.fillStyle = "#666666";
      ctx.font = "13px Arial";
      ctx.fillText(label, P, y);
      ctx.textAlign = "right";
      ctx.fillStyle = color || "#0a0a0a";
      ctx.font = "600 13px Arial";
      ctx.fillText(val, W - P, y);
      ctx.textAlign = "left";
    };
    y += 8;
    if (sub > 0) sumLine(`Subtotal (${items.length} items)`, `₹${sub}`);
    sumLine(
      deliveryLabel,
      freeDelivery ? "FREE" : `+₹${deliveryFee}`,
      freeDelivery ? "#008f0c" : "#0a0a0a",
    );
    if (giftFee > 0) sumLine("Gift wrapping", `+₹${giftFee}`);
    if (bookmarkFee > 0)
      sumLine(
        `Bookmarks (${bookmarkCharged} × ₹9${bookmarkFree > 0 ? `, ${bookmarkFree} free` : ""})`,
        `+₹${bookmarkFee}`,
      );
    if (codFee > 0) sumLine("COD handling fee", `+₹${codFee}`);
    if (discount > 0) sumLine("Discount", `−₹${discount}`, "#008f0c");
    y += 18;
    ctx.strokeStyle = "#cccccc";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(P, y);
    ctx.lineTo(W - P, y);
    ctx.stroke();
    ctx.setLineDash([]);
    y += 28;
    ctx.fillStyle = "#0a0a0a";
    ctx.font = "700 17px Arial";
    ctx.fillText("Total paid", P, y);
    ctx.textAlign = "right";
    ctx.fillText(`₹${grand}`, W - P, y);
    ctx.textAlign = "left";
    y += 36;
    ctx.fillStyle = "#888888";
    ctx.font = "12px Arial";
    ctx.fillText(
      `Payment: ${order["Payment Type"] || ""} · Delivery: ${order["Delivery Type"] || ""}`,
      P,
      y,
    );
    y += 20;
    ctx.fillText("Thank you for shopping with TheBookX.", P, y);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `TheBookX-Invoice-${order["Order ID"] || "order"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  if (loading) {
    return (
      <main className="od-page">
        <div className="od-skel" aria-busy="true" aria-label="Loading order">
          {/* header */}
          <div className="od-skel-head">
            <span className="od-sk od-sk-back" />
            <span className="od-sk od-sk-title" />
          </div>
          {/* map */}
          <div className="od-sk od-sk-map">
            <span className="od-sk-shine" />
          </div>
          {/* arrival card */}
          <div className="od-skel-card">
            <span className="od-sk od-sk-dot" />
            <div className="od-skel-card-lines">
              <span className="od-sk od-sk-line" style={{ width: "40%" }} />
              <span className="od-sk od-sk-line" style={{ width: "70%" }} />
              <span className="od-sk od-sk-bar" />
            </div>
          </div>
          {/* delivery details */}
          <div className="od-skel-block">
            <span className="od-sk od-sk-line" style={{ width: "35%" }} />
            <span className="od-sk od-sk-line" style={{ width: "85%" }} />
            <span className="od-sk od-sk-line" style={{ width: "60%" }} />
          </div>
        </div>
      </main>
    );
  }
  if (!order) {
    return (
      <main className="od-page">
        <header className="ord-head">
          <button className="ord-back" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <div className="ord-head-titles">
            <h1>Order</h1>
          </div>
        </header>
        <div className="ord-empty">
          <Package size={26} />
          <strong>Order not found</strong>
          <span>{orderId}</span>
        </div>
      </main>
    );
  }

  const itemCount = books.reduce((s, b) => s + (b.qty || 1), 0);
  const custName = String(order["Customer Name"] || "").replace(
    /\s*\(unconfirmed\)\s*/i,
    "",
  );
  const addr = [order["Address"], order["City"], order["State"]]
    .map((x) =>
      String(x || "")
        .replace(/,?\s*Pinned location:\s*https?:\/\/\S+/i, "")
        .trim(),
    )
    .filter(Boolean)
    .join(", ");
  const stLabel = statusLabel(order);
  const isFaster = isExpressOrder(order);
  const inTransit = /in\s*transit/i.test(order["Order Status"] || "");
  const outForDelivery = /out\s*for\s*delivery/i.test(order["Order Status"] || "");
  const delivered = /delivered|money received/i.test(order["Order Status"] || "");
  const shipped = /shipped|getting shipped/i.test(order["Order Status"] || "");
  // The note is only useful (and shown) once the parcel is on the move —
  // shipped and every status ahead of it (in transit / out for delivery /
  // delivered). Hidden while the order is still just confirmed/processing.
  const showOrderNote =
    shipped || inTransit || outForDelivery || delivered;
  const cancelled = /cancel/i.test(order["Order Status"] || "");
  const shippingId = order["Shipping ID"] || "";

  // Address is editable before the parcel really moves: not delivered/cancelled/
  // out-for-delivery, and not in-transit UNLESS no tracking ID exists yet.
  const canEditAddress =
    !delivered &&
    !cancelled &&
    !outForDelivery &&
    (!inTransit || !String(shippingId).trim());

  const cleanAddr = String(order["Address"] || "").replace(
    /,?\s*Pinned location:\s*https?:\/\/\S+/i,
    "",
  ).trim();

  const openAddrEdit = () => {
    setAddrForm({
      name: custName,
      address: cleanAddr,
      city: String(order["City"] || ""),
      state: String(order["State"] || ""),
      pincode: String(order["Pincode"] || ""),
    });
    setShowAddrEdit(true);
  };

  const saveAddr = async () => {
    if (!addrForm) return;
    setAddrSaving(true);
    const fields = {
      Address: addrForm.address.trim(),
      City: addrForm.city.trim(),
      State: addrForm.state.trim(),
      Pincode: addrForm.pincode.trim(),
    };
    try {
      await updateOrderRow(orderId, fields);
      setOrder((o) => ({ ...o, ...fields }));
      setShowAddrEdit(false);
      // Tell the team the address changed so they update the courier before dispatch.
      const line = [fields.Address, fields.City, fields.State, fields.Pincode]
        .filter(Boolean)
        .join(", ");
      const msg = `Hi TheBookX, I've updated the delivery address for order ${orderId}. New address: ${line}. Please use this for shipping. (${number})`;
      window.open(
        `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (e) {
      console.error("Address update failed", e);
      alert("Couldn't update the address. Please try again.");
    } finally {
      setAddrSaving(false);
    }
  };

  const orderNote = String(order["Order Comment"] || "").trim();
  const saveNote = async () => {
    const t = noteDraft.trim();
    setNoteSaving(true);
    try {
      await updateOrderRow(orderId, { "Order Comment": t });
      setOrder((o) => ({ ...o, "Order Comment": t }));
      setNoteEditing(false);
    } catch (e) {
      console.error("Note save failed", e);
      alert("Couldn't save your note. Please try again.");
    } finally {
      setNoteSaving(false);
    }
  };

  // ETA pill: the delivery-window range shows only once the parcel is moving
  // (in transit / out for delivery). Before that we show the current stage.
  const eta = (() => {
    if (/cancel/i.test(order["Order Status"] || "")) return { done: "Cancelled" };
    if (
      /unconfirmed|pending/i.test(order["Order Status"] || "") ||
      /\(unconfirmed\)/i.test(order["Customer Name"] || "")
    )
      return { done: "Unconfirmed" };
    if (delivered) return { done: "Delivered" };
    if (inTransit || outForDelivery)
      return isFaster
        ? { num: "1–5", unit: "days" }
        : { num: "4–9", unit: "days" };
    const st = String(order["Order Status"] || "").toLowerCase();
    if (/shipped|getting shipped/.test(st)) return { done: "Packing" };
    return { done: "Confirmed" };
  })();
  // Badge text for the compact status (per the custom status→badge mapping).
  const psBadge = (() => {
    const st = String(order?.["Order Status"] || "").toLowerCase();
    if (cancelled) return "Cancelled";
    if (delivered) return "Delivered"; // includes "money received"
    if (/shipped|getting shipped/.test(st)) return "Getting shipped";
    if (/processing/.test(st)) return "Preparing";
    if (inTransit || outForDelivery) return `${eta.num} ${eta.unit}`;
    if (/unconfirmed|pending/.test(st)) return "Processing";
    return "Confirmed";
  })();

  // Journey progress 0..1 for the green fill bar.
  const progressPct = Math.round(computeProgress(order) * 100);

  // Delivery window (min/max days) + estimated date range.
  const [etaMin, etaMax] = isFaster ? [1, 5] : [4, 9];
  const estimate = (() => {
    const od = parseSheetDate(
      order["Timestamp (D)"] || order["Timestamp"] || order["Timestamp(D)"],
    );
    if (!od) return null;
    const fmt = (d) =>
      d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
    return {
      from: fmt(new Date(od.getTime() + etaMin * 86400000)),
      to: fmt(new Date(od.getTime() + etaMax * 86400000)),
      mn: etaMin,
      mx: etaMax,
    };
  })();
  const trackOrder = {
    ...order,
    orderId,
    status: order["Order Status"] || "Processing",
    shippingId,
    deliveryType: order["Delivery Type"] || "",
  };

  // Faster-delivery upgrade: offered only for a Standard order that hasn't been
  // dispatched yet. The extra cost is priced with the SAME tiered logic as
  // checkout (extra = faster charge − standard charge for this order's value).
  const upgradeExtra = (() => {
    if (isFaster || !canEditAddress) return null;
    const orderValue = bd.sub || 0;
    const hasOneRupee = books.some(
      (b) => Number(b.price) === 1 || Number(b.total) === 1,
    );
    const standard = getDeliveryCharge(orderValue, false, hasOneRupee);
    const faster = getDeliveryCharge(orderValue, true, hasOneRupee);
    const extra = Math.max(0, faster - standard);
    return extra > 0 ? extra : null;
  })();

  // Apply the faster-delivery upgrade directly to the order row (adds the extra
  // charge to the total) and offer an Undo that reverts it exactly.
  const applyFasterUpgrade = async () => {
    if (upgrading || upgradeExtra == null) return;
    setUpgrading(true);
    const orderValue = bd.sub || 0;
    const hasOneRupee = books.some(
      (b) => Number(b.price) === 1 || Number(b.total) === 1,
    );
    const fasterCharge = getDeliveryCharge(orderValue, true, hasOneRupee);
    const newTotal =
      (parseFloat(order["Total Amount"]) || bd.grand) + upgradeExtra;
    const fields = {
      "Delivery Type": "Faster Delivery",
      "Total Amount": String(newTotal),
      "Delivery Charge": String(fasterCharge),
    };
    try {
      await updateOrderRow(orderId, fields);
      setOrder((o) => ({ ...o, ...fields }));
      setShowUpgradeModal(false);
      // Let the team know so they prioritise dispatch for the faster delivery.
      const msg = `Hi TheBookX, I've *upgraded to Faster delivery* (+₹${upgradeExtra}) for order ${orderId}. New total ₹${newTotal}. Please dispatch it faster by air. 🙏`;
      window.open(
        `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (e) {
      console.error("Faster upgrade failed", e);
      alert("Couldn't upgrade right now. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  // ── Prepaid upgrade (order already paid online / advance paid) ──
  // Rather than silently editing the sheet, the shopper pays only the surplus
  // and we route everything through WhatsApp: an intent message, then a verify
  // message that carries the merchant approval link (opens the merchant page).
  const isPrepaidOrder =
    /upi|online|prepaid|paytm|razorpay|gpay|phonepe/i.test(
      String(order?.["Payment Type"] || ""),
    ) || /^\s*yes/i.test(String(order?.["Advance Paid"] || ""));
  const UPI_ID = "7977960242-1@okbizaxis";
  const merchantUpgradeLink = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://www.thebookx.in";
    return `${origin}/${encodeURIComponent(orderId)}?upgrade=faster`;
  };
  const startPrepaidSurplus = () => {
    setPrepaidStage(true);
    const msg = `Hi TheBookX, I'd like to *upgrade order ${orderId} to Faster delivery* (+₹${upgradeExtra}). I've already paid online, so I'll pay just the ₹${upgradeExtra} surplus now and share the confirmation. 🙏`;
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const copySurplusUpi = () => {
    try {
      navigator.clipboard.writeText(UPI_ID);
      setSurplusCopied(true);
      setTimeout(() => setSurplusCopied(false), 1500);
    } catch {}
  };
  const verifyPrepaidUpgrade = () => {
    const link = merchantUpgradeLink();
    const msg = [
      `Hi TheBookX, I've *paid the ₹${upgradeExtra} surplus* to upgrade order ${orderId} to Faster delivery. Please approve. 🙏`,
      "",
      "——— Merchant only (tap to approve the upgrade):",
      link,
    ].join("\n");
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSurplusVerified(true);
  };

  // Revert a Faster order back to Standard delivery — works even after reload
  // (recomputes charges from the order value), updates the sheet and pings us.
  const revertToStandard = async () => {
    if (upgrading || !isFaster) return;
    setUpgrading(true);
    const orderValue = bd.sub || 0;
    const hasOneRupee = books.some(
      (b) => Number(b.price) === 1 || Number(b.total) === 1,
    );
    const standardCharge = getDeliveryCharge(orderValue, false, hasOneRupee);
    const fasterCharge = getDeliveryCharge(orderValue, true, hasOneRupee);
    const diff = Math.max(0, fasterCharge - standardCharge);
    const newTotal = Math.max(
      0,
      (parseFloat(order["Total Amount"]) || bd.grand) - diff,
    );
    const fields = {
      "Delivery Type": "Standard Delivery",
      "Total Amount": String(newTotal),
      "Delivery Charge": String(standardCharge),
    };
    try {
      await updateOrderRow(orderId, fields);
      setOrder((o) => ({ ...o, ...fields }));
      const msg = `Hi TheBookX, I've switched order ${orderId} *back to Standard delivery* (−₹${diff}). New total ₹${newTotal}. Please dispatch it as standard. 🙏`;
      window.open(
        `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(msg)}`,
        "_blank",
        "noopener,noreferrer",
      );
    } catch (e) {
      console.error("Revert to standard failed", e);
      alert("Couldn't switch back right now. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  // Submit an order/service review to the shared book-store review sheet.
  const submitOrderReview = async () => {
    if (revBusy || revDone) return;
    if (revRating === 0) {
      setRevErr("Please tap a star to rate.");
      return;
    }
    if (!revText.trim()) {
      setRevErr("Please write a line about your experience.");
      return;
    }
    if (isReviewRateLimited()) {
      setRevErr("Too many reviews from this device. Please try later.");
      return;
    }
    setRevErr("");
    setRevBusy(true);
    try {
      await submitReviewToSheet({
        type: "Store",
        bookName: books[0]?.name || "",
        rating: revRating,
        review: revText.trim(),
        phone: String(order["Phone Number"] || number || ""),
        timestamp: new Date().toISOString(),
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : "",
      });
      recordReviewSubmission();
      setRevDone(true);
    } catch (e) {
      setRevErr("Couldn't submit right now. Please try again.");
    } finally {
      setRevBusy(false);
    }
  };

  // Recommendations — a few books not already in this order, always featuring
  // "The Art of Clarity" first.
  const inOrder = new Set(books.map((b) => normName(b.name)));
  const pool = ALL_BOOKS.filter((b) => b.image);
  const clarity = pool.find((b) => /art of clarity/i.test(b.name));
  const rest = pool.filter(
    (b) => !inOrder.has(normName(b.name)) && b !== clarity,
  );
  const recos = [clarity, ...rest].filter(Boolean).slice(0, 8);

  return (
    <main className="od-page">
      <header className="ord-head">
        <button
          type="button"
          className="ord-back"
          onClick={() => router.push(`/profile/${number}/orders`)}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="ord-head-titles">
          <h1>Order details</h1>
          <span className="ord-sub">{orderId}</span>
        </div>
        <button
          type="button"
          className="ord-support-btn"
          onClick={() => setShowSupport(true)}
        >
          <MessageCircle size={16} />
          Help
        </button>
      </header>

      {/* User profile — bold name, number, address. */}
      {order && (
        <section className="od-profile-card">
          <div className="od-profile-head">
            <div>
              <strong className="od-profile-name">{custName || "—"}</strong>
              <span className="od-profile-phone">
                +91 {order["Phone Number"] || number}
              </span>
            </div>
            {canEditAddress && (
              <button
                type="button"
                className="od-edit-btn"
                onClick={openAddrEdit}
              >
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>
          <div className="od-profile-addr">
            <MapPin size={15} />
            <span>
              {addr}
              {order["Pincode"] ? ` - ${order["Pincode"]}` : ""}
            </span>
          </div>
        </section>
      )}

      {/* Map + floating arrival card (Flipkart-style) */}
      <section
        className={`od-map-card${mapFull ? " od-map-full" : ""}`}
      >
        {geoState === "ok" && receiver ? (
          <>
            <div ref={mapRef} className="od-map" />
            <button
              type="button"
              className="od-map-expand"
              onClick={() => setMapFull((v) => !v)}
              aria-label={mapFull ? "Exit full screen" : "Full screen map"}
            >
              {mapFull ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
            </button>
          </>
        ) : geoState === "loading" ? (
          <div className="od-map-locating">
            <span className="od-sk-shine" />
            <div className="od-locating-badge">
              <span className="od-locating-pulse">
                <MapPin size={20} />
              </span>
              <span className="od-locating-text">Locating your parcel…</span>
            </div>
          </div>
        ) : (
          <div className="od-map-fallback">
            <MapPin size={26} />
            <strong>Map unavailable</strong>
            <span>
              We couldn't locate the delivery area for this order right now.
            </span>
          </div>
        )}

        {/* Floating status card — full status, progress, ETA + action, right on
            the map (single source of truth; shown over any map state). */}
        {order && (
          <div className="od-map-eta">
            <div className="od-map-eta-row">
              <span
                className={`od-map-eta-dot${delivered ? " done" : cancelled ? " off" : ""}`}
              />
              <div className="od-map-eta-txt">
                <strong>{stLabel.title}</strong>
                <span>
                  {cancelled
                    ? "This order was cancelled"
                    : delivered
                      ? "Your books have arrived — enjoy!"
                      : outForDelivery
                        ? "Arriving today — keep your phone handy"
                        : `Reaching you in ${etaMin}–${etaMax} days`}
                </span>
              </div>
              <span
                className={`od-map-eta-badge${delivered ? " done" : ""}${cancelled ? " cancelled" : ""}`}
              >
                {psBadge}
              </span>
            </div>
            {!cancelled && (
              <div className="od-map-eta-bar" aria-hidden="true">
                <span style={{ width: `${progressPct}%` }} />
              </div>
            )}
            <div className="od-map-eta-foot">
              <span className="od-map-eta-deliv">
                {delivered ? (
                  <>
                    <Home size={13} /> Delivered
                  </>
                ) : (
                  <>
                    {isFaster ? <Plane size={13} /> : <Train size={13} />}
                    {isFaster ? "Express delivery" : "Standard delivery"}
                  </>
                )}
              </span>
              {delivered ? (
                <button
                  type="button"
                  className="od-map-eta-btn"
                  onClick={() => setShowRateSheet(true)}
                >
                  <Star size={12} /> Review us
                </button>
              ) : inTransit && shippingId ? (
                <button
                  type="button"
                  className="od-map-eta-btn"
                  onClick={() => setShowTrack(true)}
                >
                  Track ↗
                </button>
              ) : upgradeExtra != null &&
                !shippingId &&
                /processing|getting shipped/i.test(
                  order["Order Status"] || "",
                ) ? (
                <button
                  type="button"
                  className="od-map-eta-btn"
                  onClick={() => setShowUpgradeModal(true)}
                  disabled={upgrading}
                >
                  <Zap size={12} /> Faster +₹{upgradeExtra}
                </button>
              ) : null}
            </div>
          </div>
        )}
      </section>

      {/* Quick actions — minimal buttons that open slide-up sheets. */}
      <div className="od-quick">
        <button
          type="button"
          className="od-quick-btn"
          onClick={() => {
            setNoteDraft(orderNote);
            setShowNoteSheet(true);
          }}
        >
          <Pencil size={15} />
          {orderNote ? "Edit note" : "Add note"}
        </button>
        <button
          type="button"
          className="od-quick-btn"
          onClick={() => setShowRateSheet(true)}
        >
          <Star size={15} /> Rate us
        </button>
        <button
          type="button"
          className="od-quick-btn od-quick-refer"
          onClick={() => setShowReferSheet(true)}
        >
          <Gift size={15} /> Refer &amp; win ₹50
        </button>
      </div>

      {/* Faster-delivery upgrade — confirmation modal (benefits + air mode) */}
      <AnimatePresence>
        {showUpgradeModal && upgradeExtra != null && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (upgrading) return;
              setShowUpgradeModal(false);
              setPrepaidStage(false);
              setSurplusVerified(false);
            }}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal fdu-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.32, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <Plane size={17} /> Upgrade to Faster delivery
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    if (upgrading) return;
                    setShowUpgradeModal(false);
                    setPrepaidStage(false);
                    setSurplusVerified(false);
                  }}
                >
                  <X size={18} />
                </span>
              </div>

              <div className="fdu-body">
                <div className="fdu-hero">
                  <span className="fdu-hero-ic">
                    <Plane size={22} />
                  </span>
                  <div className="fdu-hero-txt">
                    <strong>Air mode dispatch</strong>
                    <span>
                      Your parcel ships by <b>air</b> on priority — arriving in{" "}
                      <b>1–5 days</b> instead of {etaMin}–{etaMax} days.
                    </span>
                  </div>
                </div>

                <div className="fdu-benefits">
                  <div className="fdu-benefit">
                    <Zap size={15} /> Priority air dispatch — packed & shipped
                    first
                  </div>
                  <div className="fdu-benefit">
                    <Truck size={15} /> Faster transit: 1–5 days delivery window
                  </div>
                  <div className="fdu-benefit">
                    <ShieldCheck size={15} /> Same safe, tracked handling — end to
                    end
                  </div>
                </div>

                <div className="fdu-bill">
                  <div className="fdu-bill-row">
                    <span>Faster delivery upgrade</span>
                    <span>+₹{upgradeExtra}</span>
                  </div>
                  <div className="fdu-bill-row fdu-bill-total">
                    <span>New order total</span>
                    <span>
                      ₹
                      {(parseFloat(order["Total Amount"]) || bd.grand) +
                        upgradeExtra}
                    </span>
                  </div>
                </div>

                {isPrepaidOrder ? (
                  <p className="fdu-note">
                    You&apos;ve already paid online, so you only pay the ₹
                    {upgradeExtra} difference to upgrade.
                  </p>
                ) : (
                  <p className="fdu-note">
                    The extra ₹{upgradeExtra} is added to your order total. You
                    can switch back to standard delivery anytime before dispatch.
                  </p>
                )}

                {isPrepaidOrder && prepaidStage && (
                  <div className="fdu-prepaid">
                    <span className="fdu-prepaid-amt">
                      Pay ₹{upgradeExtra} surplus
                    </span>
                    <img
                      src="/books/uskillbook.png"
                      alt="UPI QR code"
                      className="fdu-qr"
                    />
                    <button
                      type="button"
                      className="fdu-upi"
                      onClick={copySurplusUpi}
                    >
                      {surplusCopied ? (
                        <>
                          <Check size={14} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> {UPI_ID}
                        </>
                      )}
                    </button>
                    {surplusVerified ? (
                      <div className="fdu-verified">
                        <Check size={16} strokeWidth={3} /> Sent for approval —
                        we&apos;ll upgrade your order shortly.
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="pri-big-btn width100"
                        onClick={verifyPrepaidUpgrade}
                      >
                        <FaWhatsapp size={16} /> I&apos;ve paid — verify on
                        WhatsApp
                      </button>
                    )}
                  </div>
                )}
              </div>

              {!(isPrepaidOrder && prepaidStage) && (
                <button
                  type="button"
                  className="pri-big-btn width100 fdu-confirm"
                  onClick={isPrepaidOrder ? startPrepaidSurplus : applyFasterUpgrade}
                  disabled={upgrading}
                >
                  {upgrading ? (
                    <>
                      <Loader2 size={16} className="lb-spinner" /> Upgrading…
                    </>
                  ) : isPrepaidOrder ? (
                    `Pay ₹${upgradeExtra} difference to upgrade`
                  ) : (
                    "Okay, I got it — confirm upgrade"
                  )}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Items summary strip (Flipkart "Total N items" + thumbnails) */}
      <section className="od-block od-items-block">
        <button
          type="button"
          className="od-items-head"
          onClick={() => setItemsOpen((v) => !v)}
        >
          <span className="od-items-count">Total {itemCount} items</span>
          <span className="od-items-toggle">
            {itemsOpen ? "Hide details" : "See details"}
            <ChevronDown
              size={16}
              className={`od-items-chev${itemsOpen ? " open" : ""}`}
            />
          </span>
        </button>

        {!itemsOpen && (
          <div className="od-thumbs-row">
            {books.map((b, i) => {
              const bk = findBook(b.name);
              return (
                <span className="od-thumb" key={i}>
                  {bk?.image ? (
                    <Image src={bk.image} alt={b.name} width={46} height={62} />
                  ) : (
                    <span className="od-thumb-ph">
                      <Package size={16} />
                    </span>
                  )}
                  {b.qty > 1 && <span className="od-thumb-qty">×{b.qty}</span>}
                </span>
              );
            })}
          </div>
        )}

        <AnimatePresence initial={false}>
          {itemsOpen && (
            <div className="od-items-list">
              {books.map((b, i) => {
                const bk = findBook(b.name);
                return (
                  <div className="od-line" key={i}>
                    <span className="od-line-cover">
                      {bk?.image ? (
                        <Image
                          src={bk.image}
                          alt={b.name}
                          width={44}
                          height={60}
                        />
                      ) : (
                        <span className="od-line-ph">
                          <Package size={16} />
                        </span>
                      )}
                    </span>
                    <span className="od-line-info">
                      <span className="od-line-name">{b.name}</span>
                      <span className="od-line-meta">
                        Qty {b.qty}
                        {b.price ? ` · ₹${b.price} each` : ""}
                      </span>
                    </span>
                    <span className="od-line-amt">
                      ₹{b.total || b.price * b.qty || 0}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* Price details (Flipkart-style breakdown) */}
      <section className="od-block od-price-block">
        <div className="od-block-title">Price details</div>
        <div className="od-price-row">
          <span>Listing price</span>
          <span className="od-strike">₹{bd.listing}</span>
        </div>
        <div className="od-price-row">
          <span>Selling price ({books.length} items)</span>
          <span>₹{bd.sub}</span>
        </div>
        {bd.savings > 0 && (
          <div className="od-price-row od-price-save">
            <span>Discount on MRP</span>
            <span>−₹{bd.savings}</span>
          </div>
        )}
        <div className="od-price-row">
          <span>{bd.deliveryLabel} charges</span>
          {bd.freeDelivery ? (
            <span className="od-free">FREE</span>
          ) : (
            <span>+₹{bd.deliveryFee}</span>
          )}
        </div>
        {bd.giftFee > 0 && (
          <div className="od-price-row">
            <span>Gift wrapping</span>
            <span>+₹{bd.giftFee}</span>
          </div>
        )}
        {bd.bookmarkFee > 0 && (
          <div className="od-price-row">
            <span>
              Bookmarks ({bd.bookmarkCharged} × ₹9
              {bd.bookmarkFree > 0 ? `, ${bd.bookmarkFree} free` : ""})
            </span>
            <span>+₹{bd.bookmarkFee}</span>
          </div>
        )}
        {bd.codFee > 0 && (
          <div className="od-price-row">
            <span>COD handling fee</span>
            <span>+₹{bd.codFee}</span>
          </div>
        )}
        {bd.discount > 0 && (
          <div className="od-price-row od-price-save">
            <span>Discount</span>
            <span>−₹{bd.discount}</span>
          </div>
        )}
        <div className="od-price-row od-price-total">
          <span>Total amount</span>
          <span>₹{bd.grand}</span>
        </div>
        <div className="od-paid-row">
          <span>
            {/cash on delivery|cod/i.test(order["Payment Type"] || "") &&
            !delivered
              ? "Pay on delivery"
              : "Paid by"}
          </span>
          <span className="od-paid-mode">{order["Payment Type"] || "—"}</span>
        </div>
        {bd.savings > 0 && (
          <div className="od-save-banner">
            <ShieldCheck size={15} /> You saved ₹{bd.savings} on this order
          </div>
        )}
        {/* Ask about this order + Download bill — one row in the billing card. */}
        <div className="od-bill-actions">
          <button
            type="button"
            className="od-help-btn"
            onClick={() => setShowSupport(true)}
          >
            <FaWhatsapp size={16} /> Ask about order
          </button>
          <button
            type="button"
            className="od-bill-btn"
            onClick={downloadBill}
          >
            <Download size={16} /> Download bill
          </button>
        </div>
      </section>

      {/* COD → pay-online upgrade (only before the parcel is moving) */}
      {/cash on delivery|cod/i.test(order["Payment Type"] || "") &&
        !inTransit &&
        !outForDelivery &&
        !delivered &&
        !cancelled && (
          <CodPayOnline
            order={order}
            orderId={orderId}
            phone={number}
            name={custName}
            bd={bd}
            autoOpen={payParam}
            onPaid={(fields) => setOrder((o) => ({ ...o, ...fields }))}
          />
        )}

      {/* Scratch-card reward — below the bill breakdown (skeleton → 3D → reveal) */}
      <OrderScratchCard
        phone={String(order["Phone Number"] || number)}
        orderId={orderId}
        orderValue={bd.grand}
        cancelled={cancelled}
      />

      {/* Add more before packing — at the bottom, only while still packable. */}
      {order &&
        !inTransit &&
        !outForDelivery &&
        !delivered &&
        !cancelled &&
        !shippingId && (
          <AddBeforePacking
            order={order}
            orderId={orderId}
            phone={order["Phone Number"] || number}
          />
        )}

      {/* Good to know — cancellation notice, at the bottom */}
      {!delivered && !cancelled && (
        <div className="ok-cancel-note od-cancel-note">
          <span className="ok-cancel-title">
            <Info size={14} /> Good to know
          </span>
          <ul className="ok-cancel-list">
            <li>This order can&apos;t be cancelled once placed.</li>
            {/cash on delivery|cod/i.test(order["Payment Type"] || "") && (
              <li>
                You may get a call or WhatsApp to confirm your order — please
                stay responsive so it isn&apos;t delayed.
              </li>
            )}
          </ul>
          <a
            href="/terms#cancellation-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="ok-cancel-link"
          >
            View cancellation policy →
          </a>
        </div>
      )}

      <AnimatePresence>
        {showTrack && (
          <TrackSheet
            trackOrder={trackOrder}
            onClose={() => setShowTrack(false)}
            trackCopied={trackCopied}
            setTrackCopied={setTrackCopied}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSupport && (
          <SupportSheet
            phone={number}
            orderId={orderId}
            eta={`${etaMin}–${etaMax}`}
            onDetail
            onClose={() => setShowSupport(false)}
          />
        )}
      </AnimatePresence>

      {/* Edit delivery address — bottom sheet */}
      <AnimatePresence>
        {showAddrEdit && addrForm && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !addrSaving && setShowAddrEdit(false)}
          >
            <motion.div
              className="bill-modal od-addr-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.34, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-700 font-16">Edit delivery address</span>
                <span
                  className="cursor-pointer"
                  onClick={() => !addrSaving && setShowAddrEdit(false)}
                >
                  <X size={18} />
                </span>
              </div>
              <p className="ep-hint" style={{ marginBottom: 10 }}>
                We&apos;ll update the address on your order and open WhatsApp so
                our team can ship it to the new address.
              </p>

              <label className="od-field-lbl">Full address</label>
              <textarea
                className="od-note-input"
                rows={3}
                value={addrForm.address}
                onChange={(e) =>
                  setAddrForm((f) => ({ ...f, address: e.target.value }))
                }
              />
              <div className="od-field-grid">
                <div>
                  <label className="od-field-lbl">City</label>
                  <input
                    className="od-field-input"
                    value={addrForm.city}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, city: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="od-field-lbl">State</label>
                  <input
                    className="od-field-input"
                    value={addrForm.state}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, state: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="od-field-lbl">Pincode</label>
                  <input
                    className="od-field-input"
                    inputMode="numeric"
                    maxLength={6}
                    value={addrForm.pincode}
                    onChange={(e) =>
                      setAddrForm((f) => ({
                        ...f,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                  />
                </div>
              </div>

              <button
                type="button"
                className="od-track-btn"
                style={{ marginTop: 14 }}
                onClick={saveAddr}
                disabled={addrSaving || !addrForm.address.trim()}
              >
                {addrSaving ? "Saving…" : "Save & notify on WhatsApp"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add-note slide-up sheet */}
      <AnimatePresence>
        {showNoteSheet && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !noteSaving && setShowNoteSheet(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal od-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <Pencil size={16} /> Note for this order
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => !noteSaving && setShowNoteSheet(false)}
                >
                  <X size={16} />
                </span>
              </div>
              <div className="od-sheet-body">
                <textarea
                  className="od-note-input"
                  rows={4}
                  placeholder="e.g. Please call before delivery, leave with the guard…"
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="od-track-btn"
                  onClick={async () => {
                    await saveNote();
                    setShowNoteSheet(false);
                  }}
                  disabled={noteSaving}
                >
                  {noteSaving ? "Saving…" : "Save note"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate-us slide-up sheet */}
      <AnimatePresence>
        {showRateSheet && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !revBusy && setShowRateSheet(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal od-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <Star size={16} /> Rate your experience
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => !revBusy && setShowRateSheet(false)}
                >
                  <X size={16} />
                </span>
              </div>
              <div className="od-sheet-body">
                {revDone ? (
                  <div className="od-review-done">
                    <span className="od-review-done-ic">
                      <Check size={20} strokeWidth={3} />
                    </span>
                    <div>
                      <strong>Thanks for the review! 🙏</strong>
                      <p>Your feedback helps other readers trust TheBookX.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="od-review-stars"
                      onMouseLeave={() => setRevHover(0)}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          className="od-star"
                          aria-label={`${n} star${n > 1 ? "s" : ""}`}
                          onMouseEnter={() => setRevHover(n)}
                          onClick={() => {
                            setRevRating(n);
                            setRevErr("");
                          }}
                        >
                          <Star
                            size={32}
                            strokeWidth={1.5}
                            className={
                              (revHover || revRating) >= n
                                ? "od-star-on"
                                : "od-star-off"
                            }
                            fill={
                              (revHover || revRating) >= n
                                ? "currentColor"
                                : "none"
                            }
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="od-review-input"
                      rows={3}
                      placeholder="Tell us what you loved (or what we can improve)…"
                      value={revText}
                      onChange={(e) => {
                        setRevText(e.target.value);
                        setRevErr("");
                      }}
                    />
                    {revErr && (
                      <span className="od-review-err">{revErr}</span>
                    )}
                    <button
                      type="button"
                      className="od-track-btn"
                      onClick={submitOrderReview}
                      disabled={revBusy}
                    >
                      {revBusy ? (
                        <>
                          <Loader2 size={16} className="lb-spinner" />{" "}
                          Submitting…
                        </>
                      ) : (
                        "Submit review"
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Refer & win slide-up sheet */}
      <AnimatePresence>
        {showReferSheet && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReferSheet(false)}
            style={{ maxWidth: "980px", margin: "0 auto" }}
          >
            <motion.div
              className="bill-modal od-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bill-header">
                <span className="weight-600 font-16 flex items-center gap-8">
                  <Gift size={16} /> Refer &amp; win ₹50
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => setShowReferSheet(false)}
                >
                  <X size={16} />
                </span>
              </div>
              <div className="od-sheet-body od-sheet-body--refer">
                <ReferAndEarn
                  phone={String(order["Phone Number"] || number)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating community FAB (bottom-right, sliding label) + install bar. */}
      <div className="od-community-fab">
        <CommunityJoin variant="icon" />
        <span className="od-community-fab-label">Join community</span>
      </div>
      <PwaInstallPromo variant="bar" />
    </main>
  );
}
