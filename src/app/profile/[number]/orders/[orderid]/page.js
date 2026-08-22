"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";
import TrackSheet from "@/components/profile/TrackSheet";

// TheBookX dispatch origin (Matunga, Mumbai).
const SENDER = { lat: 19.0272, lng: 72.8562, label: "TheBookX · Matunga, Mumbai" };

function parseBooks(str) {
  return String(str || "")
    .split("\n")
    .map((line) => {
      const name = (line.split("|")[0] || "").replace(/^\d+\.\s*/, "").trim();
      const qty = parseInt((line.match(/Qty:\s*(\d+)/i) || [])[1] || "1", 10);
      const total = parseInt(
        (line.match(/Total:\s*₹?\s*(\d+)/i) || [])[1] || "0",
        10,
      );
      return { name, qty, total };
    })
    .filter((b) => b.name);
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const number = String(params?.number || "").replace(/\D/g, "").slice(-10);
  const orderId = decodeURIComponent(params?.orderid || "");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receiver, setReceiver] = useState(null); // {lat,lng,label}
  const [geoState, setGeoState] = useState("idle"); // idle|loading|ok|missing
  const [showTrack, setShowTrack] = useState(false);
  const [trackCopied, setTrackCopied] = useState(false);

  const mapRef = useRef(null);
  const mapObj = useRef(null);

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

  // Geocode the receiver address once the order is known.
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
      // strip pinned-location URLs
      .map((x) => x.replace(/,?\s*Pinned location:\s*https?:\/\/\S+/i, ""));
    const q = parts.join(", ");
    if (!q || q.length < 4) {
      setGeoState("missing");
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
          setGeoState("missing");
        }
      } catch {
        setGeoState("missing");
      }
    })();
  }, [order]);

  const shareLocation = () => {
    if (!navigator.geolocation) return;
    setGeoState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setReceiver({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Your shared location",
        });
        setGeoState("ok");
      },
      () => setGeoState("missing"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  // Draw / update the Leaflet map when receiver coords are ready.
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
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          { maxZoom: 18 },
        ).addTo(mapObj.current);
      }
      const map = mapObj.current;
      map.eachLayer((l) => {
        if (l instanceof L.Marker || l instanceof L.Polyline) map.removeLayer(l);
      });

      const A = [SENDER.lat, SENDER.lng];
      const B = [receiver.lat, receiver.lng];
      const pct = computeProgress(order);
      const mid = [A[0] + (B[0] - A[0]) * pct, A[1] + (B[1] - A[1]) * pct];

      // full route (dashed, remaining) + travelled (solid orange)
      L.polyline([A, B], {
        color: "#cbd5e1",
        weight: 4,
        dashArray: "6 8",
      }).addTo(map);
      L.polyline([A, mid], { color: "#fb8500", weight: 5 }).addTo(map);

      const dot = (color, emoji) =>
        L.divIcon({
          className: "od-pin",
          html: `<span style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${color};color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:15px">${emoji}</span>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });
      L.marker(A, { icon: dot("#111827", "🏬") }).addTo(map);
      L.marker(B, { icon: dot("#c0223b", "🏠") }).addTo(map);
      L.marker(mid, {
        icon: L.divIcon({
          className: "od-pin",
          html: `<span style="font-size:22px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">📦</span>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      }).addTo(map);

      map.fitBounds([A, B], { padding: [40, 40] });
    })();
    return () => {
      disposed = true;
    };
  }, [receiver, order]);

  useEffect(
    () => () => {
      if (mapObj.current) {
        mapObj.current.remove();
        mapObj.current = null;
      }
    },
    [],
  );

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
            <ArrowLeft size={18} />
          </button>
          <h1>Order</h1>
        </header>
        <div className="ord-empty">
          <Package size={26} />
          <strong>Order not found</strong>
          <span>{orderId}</span>
        </div>
      </main>
    );
  }

  const books = parseBooks(order["Books List"]);
  const itemCount = books.reduce((s, b) => s + (b.qty || 1), 0);
  const custName = String(order["Customer Name"] || "").replace(
    /\s*\(unconfirmed\)\s*/i,
    "",
  );
  const addr = [order["Address"], order["City"], order["State"]]
    .map((x) => String(x || "").replace(/,?\s*Pinned location:\s*https?:\/\/\S+/i, "").trim())
    .filter(Boolean)
    .join(", ");
  const trackOrder = {
    ...order,
    orderId,
    status: order["Order Status"] || "Processing",
    shippingId: order["Shipping ID"] || "",
    deliveryType: order["Delivery Type"] || "",
  };

  return (
    <main className="od-page">
      <header className="ord-head">
        <button
          type="button"
          className="ord-back"
          onClick={() => router.push(`/profile/${number}/orders`)}
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1>Order details</h1>
          <span className="ord-sub">{orderId}</span>
        </div>
      </header>

      {/* Map */}
      <section className="od-map-card">
        {geoState === "ok" && receiver ? (
          <div ref={mapRef} className="od-map" />
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
            <button type="button" className="od-share-btn" onClick={shareLocation}>
              <Navigation size={15} /> Share my location
            </button>
          </div>
        )}
        {geoState === "ok" && (
          <div className="od-route-row">
            <span className="od-route-end">
              <Store size={14} /> Mumbai
            </span>
            <span className="od-route-line" />
            <span className="od-route-end">
              <Home size={14} /> {order["City"] || "You"}
            </span>
          </div>
        )}
      </section>

      {/* Items */}
      <section className="od-block">
        <div className="od-block-title">
          Items ({itemCount})
        </div>
        {books.map((b, i) => (
          <div className="od-item" key={i}>
            <span className="od-item-name">
              {i + 1}. {b.name}
            </span>
            <span className="od-item-qty">×{b.qty}</span>
            <span className="od-item-amt">₹{b.total}</span>
          </div>
        ))}
        <div className="od-item od-item-total">
          <span>Total</span>
          <span />
          <span>₹{order["Total Amount"] || "—"}</span>
        </div>
      </section>

      {/* Deliver to */}
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

      {/* Track button */}
      <button
        type="button"
        className="od-track-btn"
        onClick={() => setShowTrack(true)}
      >
        <Package size={16} /> Track order
      </button>

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
