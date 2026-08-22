"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
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
  Train,
  Plane,
  Gift,
  Maximize2,
  Minimize2,
} from "lucide-react";
import TrackSheet from "@/components/profile/TrackSheet";
import BookCard from "@/components/BookCard";
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
  const n = normName(name);
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

// Journey progress 0..1 from status (primary) + days elapsed (secondary).
function computeProgress(order) {
  const st = String(order["Order Status"] || order.status || "").toLowerCase();
  if (/delivered|money received/.test(st)) return 1;
  if (/out for delivery/.test(st)) return 0.9;
  const isFaster = /faster|express/.test(order["Delivery Type"] || "");
  const win = isFaster ? 5 : 12;
  const od = parseSheetDate(
    order["Timestamp (D)"] || order["Timestamp"] || order["Timestamp(D)"],
  );
  const days = od ? (Date.now() - od.getTime()) / 86400000 : 0;
  let p = Math.min(0.85, Math.max(0.12, days / win));
  if (/in\s*transit|shipped|getting shipped/.test(st)) p = Math.max(p, 0.45);
  return p;
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
    return { title: "Shipped from Mumbai", sub: "Handed to the courier" };
  if (/cancel/.test(st))
    return { title: "Cancelled", sub: "This order was cancelled" };
  return { title: "Order confirmed", sub: "We've received your order" };
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const number = String(params?.number || "").replace(/\D/g, "").slice(-10);
  const orderId = decodeURIComponent(params?.orderid || "");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiver, setReceiver] = useState(null); // {lat,lng,label}
  const [geoState, setGeoState] = useState("idle"); // idle|loading|ok|missing
  const [routeCoords, setRouteCoords] = useState(null);
  const [showTrack, setShowTrack] = useState(false);
  const [trackCopied, setTrackCopied] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [mapFull, setMapFull] = useState(false);

  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const geoKey = `tbx_geo_${number}`;

  // Fetch the order.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `/api/order?orderId=${encodeURIComponent(orderId)}`,
        );
        const json = await res.json();
        setOrder(json.order || null);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

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

    const savedShared = () => {
      try {
        const raw = localStorage.getItem(geoKey);
        if (!raw) return null;
        const p = JSON.parse(raw);
        return p && p.lat ? p : null;
      } catch {
        return null;
      }
    };

    if (!q || q.length < 4) {
      const s = savedShared();
      if (s) {
        setReceiver(s);
        setGeoState("ok");
      } else {
        setGeoState("missing");
      }
      return;
    }
    setGeoState("loading");
    (async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (json.result && json.result.lat) {
          setReceiver(json.result);
          setGeoState("ok");
        } else {
          const s = savedShared();
          if (s) {
            setReceiver(s);
            setGeoState("ok");
          } else setGeoState("missing");
        }
      } catch {
        const s = savedShared();
        if (s) {
          setReceiver(s);
          setGeoState("ok");
        } else setGeoState("missing");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const shareLocation = () => {
    if (!navigator.geolocation) return;
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Your shared location",
        };
        try {
          localStorage.setItem(geoKey, JSON.stringify(loc));
        } catch {}
        setReceiver(loc);
        setGeoState("ok");
      },
      () => setGeoState("missing"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

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
        1,
        Math.min(path.length - 1, Math.round(pct * (path.length - 1))),
      );
      const travelled = path.slice(0, splitIdx + 1);
      const remaining = path.slice(splitIdx);
      const parcelAt = path[splitIdx];

      // remaining (dashed grey) then travelled (solid orange) on top
      L.polyline(remaining, {
        color: "#cbd5e1",
        weight: 4,
        dashArray: "6 8",
      }).addTo(map);
      L.polyline(travelled, { color: "#fb8500", weight: 5 }).addTo(map);

      // Inline lucide-style SVGs (white stroke) so map pins use icons, not emoji.
      const svg = (inner) =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
      const ICON_BOOK =
        '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>';
      const ICON_HOME =
        '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>';
      const ICON_PKG =
        '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>';
      const dot = (color, inner, size = 30) =>
        L.divIcon({
          className: "od-pin",
          html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 2px 6px rgba(0,0,0,.3)">${svg(inner)}</span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
      L.marker(A, { icon: dot("#111827", ICON_BOOK) }).addTo(map);
      L.marker(B, { icon: dot("#c0223b", ICON_HOME) }).addTo(map);
      L.marker(parcelAt, {
        icon: dot("#fb8500", ICON_PKG, 34),
      }).addTo(map);

      map.fitBounds(path, { padding: [36, 36] });
    })();
    return () => {
      disposed = true;
    };
  }, [receiver, order, routeCoords]);

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
    const msg = `Hi TheBookX, I need help with order ${orderId} (${number}).`;
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
    const giftFee =
      order?.["Gift Wrap"] === "Yes"
        ? parseFloat(order?.["Gift Wrap Charge"]) || 0
        : 0;
    const isCOD = (order?.["Payment Type"] || "").includes("Cash on Delivery");
    let codFee = 0;
    let discount = 0;
    const extra = grand - sub - deliveryFee - giftFee;
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
        <div className="od-loading">
          <Loader2 size={26} className="lb-spinner" /> Loading order…
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
  const isFaster = /faster|express/i.test(order["Delivery Type"] || "");
  const inTransit = /in\s*transit/i.test(order["Order Status"] || "");
  const outForDelivery = /out\s*for\s*delivery/i.test(order["Order Status"] || "");
  const delivered = /delivered|money received/i.test(order["Order Status"] || "");
  const shippingId = order["Shipping ID"] || "";

  // ETA pill: the delivery-window range shows only once the parcel is moving
  // (in transit / out for delivery). Before that we show the current stage.
  const eta = (() => {
    if (delivered) return { done: "Delivered" };
    if (inTransit || outForDelivery)
      return isFaster
        ? { num: "1–5", unit: "days" }
        : { num: "4–9", unit: "days" };
    const st = String(order["Order Status"] || "").toLowerCase();
    if (/shipped|getting shipped/.test(st)) return { done: "Packing" };
    return { done: "Confirmed" };
  })();
  const trackOrder = {
    ...order,
    orderId,
    status: order["Order Status"] || "Processing",
    shippingId,
    deliveryType: order["Delivery Type"] || "",
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
        <button type="button" className="ord-support-btn" onClick={contactSupport}>
          <MessageCircle size={16} />
          Support
        </button>
      </header>

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

            {/* Arrival card overlapping the map bottom */}
            <div className="od-track-card">
              <div className="od-tc-main">
                <span className="od-tc-ic">
                  {delivered ? <Home size={18} /> : <Truck size={18} />}
                </span>
                <div className="od-tc-txt">
                  <strong>{stLabel.title}</strong>
                  <span>{stLabel.sub}</span>
                </div>
                <div className="od-tc-eta">
                  {eta.done ? (
                    <span className="od-tc-eta-done">{eta.done}</span>
                  ) : (
                    <>
                      <span className="od-tc-eta-num">{eta.num}</span>
                      <span className="od-tc-eta-unit">{eta.unit}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="od-tc-divider" />
              <div className="od-tc-foot">
                <span className="od-tc-courier">
                  {isFaster ? <Plane size={15} /> : <Train size={15} />}
                  {isFaster ? "Express" : "Standard"} · Delivery by India Post
                </span>
                {inTransit && shippingId && (
                  <button
                    type="button"
                    className="od-tc-track"
                    onClick={() => setShowTrack(true)}
                  >
                    Track ↗
                  </button>
                )}
              </div>
            </div>
          </>
        ) : geoState === "loading" ? (
          <div className="od-map-fallback">
            <Loader2 size={22} className="lb-spinner" /> Locating your parcel…
          </div>
        ) : (
          <div className="od-map-fallback">
            <MapPin size={26} />
            <strong>Where's my order?</strong>
            <span>
              We couldn't map your delivery address. Share your location to see
              the parcel's route.
            </span>
            <button
              type="button"
              className="od-share-btn"
              onClick={shareLocation}
            >
              <Navigation size={15} /> Share my location
            </button>
          </div>
        )}
      </section>

      {/* Deliver-to (directly below the map) */}
      <section className="od-block">
        <div className="od-block-title">Delivery details</div>
        <div className="od-deliver-row">
          <span className="od-deliver-ic">
            <User size={15} />
          </span>
          <span>
            {custName || "—"} · +91 {order["Phone Number"] || number}
          </span>
        </div>
        <div className="od-deliver-row">
          <span className="od-deliver-ic">
            <Home size={15} />
          </span>
          <span>
            {addr}
            {order["Pincode"] ? ` - ${order["Pincode"]}` : ""}
          </span>
        </div>
      </section>

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
      </section>

      {/* Ad banner (BookX, mimics Flipkart's mid-page promo) */}
      <Link href="/wallet" className="od-ad-banner">
        <div className="od-ad-left">
          <span className="od-ad-badge">TheBookX Wallet</span>
          <span className="od-ad-title">Refer &amp; earn ₹50</span>
          <span className="od-ad-sub">Credited instantly to your wallet</span>
          <span className="od-ad-cta">View wallet →</span>
        </div>
        <span className="od-ad-emoji" aria-hidden="true">
          <Gift size={28} />
        </span>
      </Link>

      {/* You might also be interested in */}
      {recos.length > 0 && (
        <section className="od-reco">
          <div className="od-block-title">You might also be interested in</div>
          <div className="od-reco-scroll">
            {recos.map((b) => (
              <div className="od-reco-item" key={b.id}>
                <BookCard book={b} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="od-actions">
        <button
          type="button"
          className="od-bill-btn"
          onClick={downloadBill}
        >
          <Download size={16} /> Download bill
        </button>
        <button
          type="button"
          className="od-track-btn"
          onClick={() => setShowTrack(true)}
        >
          <Package size={16} /> Track order
        </button>
      </div>

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
    </main>
  );
}
