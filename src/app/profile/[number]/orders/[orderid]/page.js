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
  Mail,
  Navigation,
  Package,
  Loader2,
  MessageCircle,
  Download,
  ChevronDown,
  Truck,
  ShieldCheck,
  RotateCcw,
  PackageCheck,
  Plus,
  Trash2,
  Info,
  Train,
  Plane,
  Gift,
  Maximize2,
  Minimize2,
  Pencil,
  Zap,
  ChevronRight,
  Check,
  Star,
  Copy,
  AlertCircle,
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
import CartConfetti from "@/components/UI/Confetti";
import ReviewRewardCard from "@/components/ReviewRewardCard";
import {
  updateOrderRow,
  fetchWalletBalance,
  creditWalletReward,
} from "@/utils/googleFormOrder";
import { parseAddonsField } from "@/utils/addonsField";
import { isGiftOrder } from "@/utils/giftOrder";
import { showToast } from "@/context/ToastContext";
import { getDeliveryCharge } from "@/utils/cartOffers";
import { books as ALL_BOOKS } from "@/utils/book";
import {
  orderEmailFromRow,
  sendOrderConfirmationEmail,
} from "@/utils/orderEmail";

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

// Map a live India Post status (event-description) to our 5-step timeline
// (0 Placed · 1 Packed · 2 Shipped · 3 Out for delivery · 4 Delivered) and a
// map progress 0..1. Returns null when there's no recognisable live status.
function trackingToStage(detail) {
  const t = String(detail || "")
    .split("||")[0]
    .trim()
    .toLowerCase();
  if (!t) return null;
  if (/return(?:ed)?\s*to\s*sender/.test(t))
    return { idx: 2, progress: 0.5, returned: true };
  if (/deliver/.test(t) && !/not\s*deliver|un\s*deliver|out\s*for/.test(t))
    return { idx: 4, progress: 1 };
  if (/out\s*for\s*delivery|item\s*out/.test(t))
    return { idx: 3, progress: 0.96 };
  if (/received\s*at\s*destination|reached|arrived|at\s*delivery/.test(t))
    return { idx: 3, progress: 0.9 };
  if (/hold|kept\s*on\s*hold|undeliver|not\s*deliver/.test(t))
    return { idx: 2, progress: 0.82, hold: true };
  if (/dispatch|transit|bagged|received\s*at|forwarded|departed/.test(t))
    return { idx: 2, progress: 0.62 };
  if (/pickup|booked|accepted|item\s*booked/.test(t))
    return { idx: 1, progress: 0.28 };
  return { idx: 2, progress: 0.55 };
}

// Journey progress 0..1 from status (primary) + days elapsed (secondary).
function computeProgress(order) {
  // Live India Post status (when uploaded) drives the map precisely.
  const liveStage = trackingToStage(order["Tracking detail"]);
  if (liveStage) return liveStage.progress;
  const st = String(order["Order Status"] || order.status || "").toLowerCase();
  // Delivered / out for delivery → route fulfilled (parcel at destination).
  if (/delivered|money received/.test(st)) return 1;
  if (/out for delivery/.test(st)) return 1;
  // Only once it's actually in transit do we move the vehicle along the route.
  if (/in\s*transit/.test(st)) {
    // Spread the whole journey over a fixed window — 14 days for standard
    // post (6 for express). The parcel advances CONTINUOUSLY and LINEARLY:
    // each day covers ~1/win of the route, so it never jumps near the
    // destination early and never appears stuck at the customer's location.
    // (India Post often shows the last scan for days; this keeps the visual
    // journey moving smoothly until it's actually marked Delivered.)
    const win = isExpressOrder(order) ? 6 : 14;
    const od = parseSheetDate(
      order["Timestamp (D)"] || order["Timestamp"] || order["Timestamp(D)"],
    );
    const days = od ? (Date.now() - od.getTime()) / 86400000 : 0;
    // Start a touch off the origin (0.05) so it reads as "moving", and cap at
    // 0.97 so it only reaches the doorstep once the status flips to Delivered.
    const p = days / win;
    return Math.max(0.05, Math.min(0.97, p));
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
  if (/on\s*hold/.test(st))
    return {
      title: "On hold",
      sub: "There is some issue in packaging this item",
    };
  if (/return/.test(st))
    return {
      title: "Cancelled",
      sub: "We tried to deliver this order but it couldn't be completed and came back to us — usually because of an incomplete address or an unreachable phone number. If you'd still like your books, reach out and we'll gladly help you reorder.",
    };
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

// Side-view SVG vehicles for the animated Route scene (wheels spin via CSS).
function TrainSVG() {
  return (
    <svg className="rs-veh-svg" viewBox="0 0 120 70" aria-hidden="true">
      {/* open cargo wagon — low walls so the boxes inside show */}
      <rect x="2" y="22" width="44" height="28" rx="4" fill="#b65c10" />
      <rect x="5" y="26" width="38" height="22" rx="2" fill="#8f470b" />
      <rect x="2" y="40" width="44" height="10" rx="2" fill="#c96a12" />
      <path d="M2 44h44" stroke="#a9560c" strokeWidth="1.4" />
      {/* locomotive body */}
      <rect x="48" y="12" width="60" height="38" rx="7" fill="#e76f00" />
      <rect x="52" y="18" width="30" height="16" rx="3" fill="#fff4e3" />
      <rect x="88" y="16" width="16" height="10" rx="3" fill="#ffd9a8" />
      {/* chimney + cab roof */}
      <rect x="58" y="4" width="9" height="10" rx="2" fill="#7a3d00" />
      <rect x="46" y="8" width="64" height="6" rx="3" fill="#c25e00" />
      {/* coupler */}
      <rect x="44" y="34" width="8" height="5" rx="2" fill="#7a3d00" />
      {/* undercarriage */}
      <rect x="2" y="49" width="106" height="6" rx="3" fill="#5a2e00" />
      {/* wheels */}
      <g className="rs-wheel">
        <circle cx="16" cy="56" r="9" fill="#3a2500" />
        <circle cx="16" cy="56" r="3.4" fill="#caa06a" />
        <rect x="15" y="48" width="2" height="16" fill="#caa06a" />
        <rect x="8" y="55" width="16" height="2" fill="#caa06a" />
      </g>
      <g className="rs-wheel">
        <circle cx="62" cy="56" r="10" fill="#3a2500" />
        <circle cx="62" cy="56" r="3.6" fill="#caa06a" />
        <rect x="61" y="47" width="2" height="18" fill="#caa06a" />
        <rect x="53" y="55" width="18" height="2" fill="#caa06a" />
      </g>
      <g className="rs-wheel">
        <circle cx="92" cy="56" r="10" fill="#3a2500" />
        <circle cx="92" cy="56" r="3.6" fill="#caa06a" />
        <rect x="91" y="47" width="2" height="18" fill="#caa06a" />
        <rect x="83" y="55" width="18" height="2" fill="#caa06a" />
      </g>
      {/* headlight */}
      <circle cx="104" cy="40" r="3.4" fill="#fde68a" />
    </svg>
  );
}

function TruckSVG() {
  return (
    <svg className="rs-veh-svg" viewBox="0 0 120 70" aria-hidden="true">
      {/* cab */}
      <path d="M70 22h20l16 14v14H70z" fill="#e76f00" />
      <path d="M74 26h14l10 9H74z" fill="#cfe9ff" />
      <rect x="86" y="30" width="2" height="5" fill="#a9560c" />
      {/* open cargo bed — low walls so the boxes inside are visible */}
      <rect x="4" y="18" width="66" height="32" rx="3" fill="#b65c10" />
      <rect x="7" y="22" width="60" height="26" rx="2" fill="#8f470b" />
      {/* near (front) wall, lower so cargo peeks over it */}
      <rect x="4" y="40" width="66" height="10" rx="2" fill="#c96a12" />
      <path d="M4 44h66" stroke="#a9560c" strokeWidth="1.4" />
      {/* bumper + chassis */}
      <rect x="4" y="49" width="104" height="6" rx="3" fill="#5a2e00" />
      <rect x="104" y="42" width="4" height="9" rx="2" fill="#7a3d00" />
      {/* wheels */}
      <g className="rs-wheel">
        <circle cx="30" cy="56" r="10" fill="#2b2b2b" />
        <circle cx="30" cy="56" r="3.6" fill="#b9b9b9" />
        <rect x="29" y="47" width="2" height="18" fill="#b9b9b9" />
        <rect x="21" y="55" width="18" height="2" fill="#b9b9b9" />
      </g>
      <g className="rs-wheel">
        <circle cx="90" cy="56" r="10" fill="#2b2b2b" />
        <circle cx="90" cy="56" r="3.6" fill="#b9b9b9" />
        <rect x="89" y="47" width="2" height="18" fill="#b9b9b9" />
        <rect x="81" y="55" width="18" height="2" fill="#b9b9b9" />
      </g>
      {/* headlight */}
      <circle cx="105" cy="44" r="3" fill="#fde68a" />
    </svg>
  );
}

// A warehouse worker in a hi-vis vest walking a box to the truck (packing stage).
function WorkerSVG() {
  return (
    <svg className="rs-person-svg" viewBox="0 0 48 70" aria-hidden="true">
      <rect x="18" y="47" width="5" height="17" rx="2" fill="#374151" />
      <rect x="25" y="47" width="5" height="17" rx="2" fill="#374151" />
      <rect x="15" y="62" width="10" height="5" rx="2" fill="#1f2937" />
      <rect x="25" y="62" width="10" height="5" rx="2" fill="#1f2937" />
      <rect x="15" y="27" width="18" height="23" rx="5" fill="#2563eb" />
      {/* hi-vis vest */}
      <rect x="18" y="29" width="12" height="19" rx="3" fill="#facc15" />
      <rect x="16" y="31" width="7" height="11" rx="3" fill="#2563eb" />
      <rect x="25" y="31" width="7" height="11" rx="3" fill="#2563eb" />
      {/* box carried in front */}
      <rect x="12" y="35" width="24" height="17" rx="2" fill="#e0a564" />
      <path d="M24 35v17M12 43.5h24" stroke="#a9743a" strokeWidth="1.6" />
      <circle cx="24" cy="19" r="8" fill="#f1c27d" />
      {/* hard hat */}
      <path d="M15 17a9 9 0 0 1 18 0z" fill="#f59e0b" />
      <rect x="13" y="16" width="22" height="3" rx="1.5" fill="#d97706" />
    </svg>
  );
}

// A postman in a khaki uniform cradling the parcel, about to hand it over.
function PostmanSVG() {
  return (
    <svg className="rs-person-svg" viewBox="0 0 48 70" aria-hidden="true">
      <rect x="18" y="47" width="5" height="17" rx="2" fill="#6b5b2e" />
      <rect x="25" y="47" width="5" height="17" rx="2" fill="#6b5b2e" />
      <rect x="15" y="62" width="10" height="5" rx="2" fill="#2b2b2b" />
      <rect x="25" y="62" width="10" height="5" rx="2" fill="#2b2b2b" />
      {/* khaki shirt */}
      <rect x="15" y="27" width="18" height="23" rx="5" fill="#b89b4a" />
      <path d="M24 27v16" stroke="#9c8238" strokeWidth="1.4" />
      {/* arms */}
      <rect x="10" y="31" width="7" height="13" rx="3" fill="#b89b4a" />
      <rect x="31" y="31" width="7" height="13" rx="3" fill="#b89b4a" />
      {/* parcel in hands */}
      <rect x="9" y="38" width="30" height="15" rx="2" fill="#e0a564" />
      <path d="M24 38v15M9 45.5h30" stroke="#a9743a" strokeWidth="1.6" />
      <circle cx="24" cy="19" r="8" fill="#f1c27d" />
      {/* khaki cap */}
      <path d="M15 17a9 9 0 0 1 18 0z" fill="#8d7429" />
      <rect x="12" y="16" width="24" height="3" rx="1.5" fill="#6f5b1f" />
    </svg>
  );
}

// The TheBookX parcel hub — a professional multi-storey building (flat roof,
// glass façade, a branded sign band and a glass entrance). Drawn larger than
// the vehicle so it clearly reads as the origin.
function HubSVG() {
  // Glass window grid on the main tower.
  const winCols = [16, 30, 44];
  const winRows = [42, 58, 74];
  return (
    <svg className="rs-hub-svg" viewBox="0 0 94 102" aria-hidden="true">
      {/* lower side wing */}
      <rect x="58" y="44" width="30" height="54" fill="#e76f00" />
      <rect x="56" y="40" width="34" height="6" rx="1.5" fill="#a9510a" />
      <rect x="63" y="50" width="9" height="10" rx="1" fill="#bfe3ff" />
      <rect x="74" y="50" width="9" height="10" rx="1" fill="#bfe3ff" />
      <rect x="63" y="64" width="9" height="10" rx="1" fill="#bfe3ff" />
      <rect x="74" y="64" width="9" height="10" rx="1" fill="#bfe3ff" />
      {/* main tower */}
      <rect x="10" y="22" width="52" height="76" fill="#fb8500" />
      {/* flat-roof parapet */}
      <rect x="7" y="16" width="58" height="7" rx="1.5" fill="#c25e00" />
      <rect x="28" y="9" width="16" height="7" fill="#c25e00" />
      {/* branded sign band */}
      <rect x="14" y="26" width="44" height="12" rx="2" fill="#ffffff" />
      <circle cx="21" cy="32" r="3" fill="#fb8500" />
      <rect x="26" y="29" width="28" height="6" rx="1.5" fill="#ffd9a8" />
      {/* glass window grid */}
      {winRows.map((wy) =>
        winCols.map((wx) => (
          <rect
            key={`${wx}-${wy}`}
            x={wx}
            y={wy}
            width="10"
            height="11"
            rx="1"
            fill="#bfe3ff"
            stroke="#e76f00"
            strokeWidth="0.6"
          />
        )),
      )}
      {/* glass entrance */}
      <rect x="28" y="84" width="18" height="14" fill="#2f3a46" />
      <path d="M37 84v14" stroke="#4b5a68" strokeWidth="1" />
    </svg>
  );
}

// The customer's home at the destination end.
function HomeSVG() {
  return (
    <svg className="rs-home-svg" viewBox="0 0 70 80" aria-hidden="true">
      <path d="M6 40 L35 14 L64 40 Z" fill="#c25e00" />
      <rect x="12" y="40" width="46" height="36" fill="#f4a261" />
      <rect x="29" y="54" width="14" height="22" rx="1.5" fill="#8f470b" />
      <circle cx="40" cy="65" r="1.3" fill="#ffd9a8" />
      <rect x="16" y="46" width="11" height="10" rx="1.5" fill="#cfe9ff" />
      <rect x="43" y="46" width="11" height="10" rx="1.5" fill="#cfe9ff" />
    </svg>
  );
}

// A small figure at the door waiting to receive the parcel (gentle wave).
function WaitingPersonSVG() {
  return (
    <svg className="rs-wait-svg" viewBox="0 0 30 54" aria-hidden="true">
      <rect x="11" y="36" width="3.4" height="14" rx="1.6" fill="#374151" />
      <rect x="15.6" y="36" width="3.4" height="14" rx="1.6" fill="#374151" />
      <rect x="9" y="48" width="7" height="4" rx="1.6" fill="#1f2937" />
      <rect x="15" y="48" width="7" height="4" rx="1.6" fill="#1f2937" />
      <rect x="9" y="19" width="12" height="18" rx="4" fill="#2f9e52" />
      {/* waving arm */}
      <g className="rs-wait-arm">
        <rect x="19" y="14" width="3.6" height="11" rx="1.8" fill="#2f9e52" />
      </g>
      <rect x="7.6" y="22" width="3.6" height="10" rx="1.8" fill="#2f9e52" />
      <circle cx="15" cy="12" r="6.4" fill="#f1c27d" />
    </svg>
  );
}

// The parcel's cargo — a stack of cardboard boxes; one is open and holds the
// actual book covers for this order, so the reader sees their own books riding
// along. Rendered as an overlay that sits inside the vehicle's cargo bay.
function RouteCargo({ covers = [], count = 0, isTrain = false }) {
  const lead = covers[0] || null;
  const total = Math.max(count || 0, covers.length);
  const extra = Math.max(0, total - 1);
  return (
    <div className={`rs-cargo ${isTrain ? "rs-cargo-train" : "rs-cargo-truck"}`}>
      <span className="rs-box rs-box-a" />
      <motion.div
        className="rs-box rs-box-open"
        initial={{ y: 4, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div className="rs-box-flap rs-box-flap-l" />
        <div className="rs-box-flap rs-box-flap-r" />
        <div className="rs-box-books">
          {lead ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lead} alt="" className="rs-box-book" />
          ) : (
            <span className="rs-box-book rs-box-book-ph" />
          )}
        </div>
        {extra > 0 && <span className="rs-box-more">+{extra}</span>}
      </motion.div>
      <span className="rs-box rs-box-b" />
    </div>
  );
}

// Animated 2D travel scene. The vehicle is positioned by delivery stage — parked
// at the hub while packing, travelling (scenery scrolls) in transit, out near
// your door for out-for-delivery, parked at your door when delivered, and back
// at the hub when returned. Book covers ride in an open box inside the cargo;
// packing workers and a khaki postman appear for their stages. Endpoints fade
// in/out per stage, and once the vehicle has left the hub a small floating chip
// shows the hub is now behind — like a map pin that has scrolled off-screen.
function RouteScene({
  isTrain = false,
  stage = "transit",
  bookImgs = [],
  bookCount = 0,
  progressPct = 0,
  etaText = "",
}) {
  const moving = stage === "transit";
  const covers = (bookImgs || []).filter(Boolean).slice(0, 3);
  // When to show each fixed endpoint marker.
  const showHub = stage === "processing" || stage === "returned";
  const showDest =
    stage === "processing" || stage === "ofd" || stage === "delivered";
  // Hub is behind us once we're on the road (transit / out-for-delivery).
  const hubBehind = stage === "transit" || stage === "ofd";
  const caption =
    stage === "delivered"
      ? "Delivered to your door 🎉"
      : stage === "returned"
        ? "Came back to our hub"
        : stage === "processing"
          ? "Packing your books…"
          : stage === "ofd"
            ? "Out for delivery — arriving today"
            : etaText || `On the way · ${Math.round(progressPct)}%`;

  const ease = [0.45, 0.02, 0.25, 1];

  return (
    <div className={`rs-scene rs-st-${stage}${moving ? " moving" : ""}`}>
      <div className="rs-sky" />
      <span className="rs-sun" />
      <div className="rs-clouds">
        <i />
        <i />
        <i />
      </div>
      <div className="rs-scroll" aria-hidden="true">
        {[0, 1].map((k) => (
          <div className="rs-strip" key={k}>
            <span className="rs-hill rs-h1" />
            <span className="rs-hill rs-h2" />
            <span className="rs-tree rs-t1" />
            <span className="rs-flower rs-f1" />
            <span className="rs-tree rs-t2" />
            <span className="rs-bush rs-b1" />
            <span className="rs-flower rs-f2" />
            <span className="rs-tree rs-t3" />
            <span className="rs-flower rs-f3" />
          </div>
        ))}
      </div>
      <div className="rs-ground" />
      <div className={isTrain ? "rs-track" : "rs-road"} />

      {/* Fixed endpoints — only shown for the stages where they're relevant. */}
      <AnimatePresence>
        {showHub && (
          <motion.div
            className="rs-origin"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
          >
            <HubSVG />
            <b>TheBookX Parcel Hub</b>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDest && (
          <motion.div
            className="rs-dest"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.35 }}
          >
            <div className="rs-dest-scene">
              <HomeSVG />
              <div className="rs-wait">
                <WaitingPersonSVG />
              </div>
            </div>
            <b>You</b>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Off-screen hub indicator — a floating chip that says the hub is behind. */}
      <AnimatePresence>
        {hubBehind && (
          <motion.div
            className="rs-behind"
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.4, ease }}
          >
            <span className="rs-behind-ic">🏬</span>
            <span className="rs-behind-tx">Left the hub</span>
            <ArrowLeft size={12} className="rs-behind-ar" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing — a worker shuttles boxes from the hub to the truck on a
          loop (carries out → loads → walks back → repeats), with a "packing"
          cloud anchored above the truck. */}
      <AnimatePresence>
        {stage === "processing" && (
          <>
            <motion.div
              className="rs-cloud-msg"
              key="cloud"
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <span>Packing your books…</span>
            </motion.div>
            <div className="rs-loader" key="loader">
              <WorkerSVG />
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Out for delivery — a khaki postman carries the parcel toward your door. */}
      <AnimatePresence>
        {stage === "ofd" && (
          <motion.div
            className="rs-postman"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <PostmanSVG />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="rs-vehicle"
        initial={{ opacity: 0, scale: 0.8, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
      >
        {isTrain ? <TrainSVG /> : <TruckSVG />}
        <RouteCargo covers={covers} count={bookCount} isTrain={isTrain} />
      </motion.div>

      {/* The top caption is hidden while packing — the cloud over the truck
          already narrates that stage, so we don't show two messages. */}
      {stage !== "processing" && (
        <motion.div
          className={`rs-caption${stage === "returned" ? " rs-cap-ret" : ""}${stage === "delivered" ? " rs-cap-done" : ""}`}
          key={caption}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {caption}
        </motion.div>
      )}
    </div>
  );
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
  // Gift reveal — when the URL carries a ?gift=<message> (from a scanned gift QR),
  // open a celebratory popup with confetti.
  const [giftMsg, setGiftMsg] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  useEffect(() => {
    try {
      const g = new URLSearchParams(window.location.search).get("gift");
      if (g) {
        setGiftMsg(g);
        setGiftOpen(true);
      }
    } catch {}
  }, []);
  // Email (optional) — read-only here; edited via the address Edit sheet and
  // saved to the "Email" column.
  // Sales nudge: wallet balance for this shopper.
  const [walletBal, setWalletBal] = useState(0);
  const [trkIdCopied, setTrkIdCopied] = useState(false);
  // Loyalty celebration: 3+ real orders → confetti on their recent last 4.
  const [celebrate, setCelebrate] = useState(false);
  const [loyalN, setLoyalN] = useState(0);
  useEffect(() => {
    const digits = String(number || "").replace(/\D/g, "").slice(-10);
    if (digits.length !== 10) return;
    fetchWalletBalance(digits)
      .then((b) => setWalletBal(Number(b) || 0))
      .catch(() => {});
  }, [number]);

  // Loyalty celebration — 3+ real orders → confetti + banner on their recent
  // last 4 orders (once per order, so it feels special, not spammy).
  useEffect(() => {
    const digits = String(number || "").replace(/\D/g, "").slice(-10);
    if (digits.length !== 10 || !orderId) return;
    (async () => {
      try {
        const res = await fetch(`/api/orders?phone=${digits}`);
        const json = await res.json();
        const all = Array.isArray(json.orders) ? json.orders : [];
        const real = all.filter((o) => {
          const wa = /whatsapp/i.test(o["Payment Type"] || "");
          const unc =
            /unconfirmed|pending/i.test(o["Order Status"] || "") ||
            /\(unconfirmed\)/i.test(o["Customer Name"] || "");
          return !wa && !unc && o["Order ID"];
        });
        if (real.length <= 2) return;
        const sorted = [...real].sort((a, b) => {
          const da = parseSheetDate(
            a["Timestamp (D)"] || a["Timestamp"] || a["Timestamp(D)"],
          );
          const db = parseSheetDate(
            b["Timestamp (D)"] || b["Timestamp"] || b["Timestamp(D)"],
          );
          return (db?.getTime() || 0) - (da?.getTime() || 0);
        });
        const recent4 = new Set(
          sorted.slice(0, 4).map((o) => String(o["Order ID"])),
        );
        if (!recent4.has(String(orderId))) return;
        setLoyalN(real.length);
        const key = `tbx_celebrate_${orderId}`;
        let seen = false;
        try {
          seen = !!localStorage.getItem(key);
        } catch {}
        if (!seen) {
          setCelebrate(true);
          try {
            localStorage.setItem(key, "1");
          } catch {}
          try {
            if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
          } catch {}
        }
      } catch {}
    })();
  }, [number, orderId]);
  const [receiver, setReceiver] = useState(null); // {lat,lng,label}
  const [geoState, setGeoState] = useState("idle"); // idle|loading|ok|missing
  const [routeCoords, setRouteCoords] = useState(null);
  const [showTrack, setShowTrack] = useState(false);
  // Live India Post tracking — latest scan event + its geocoded location.
  const [liveEvent, setLiveEvent] = useState(null); // { lastEvent, deliveryLocation, delivered }
  const [liveLatLng, setLiveLatLng] = useState(null); // { lat, lng, label }
  // Pull the latest India Post scan for this order's article number, then
  // geocode that office so the map can show where the parcel actually is.
  useEffect(() => {
    const sid = String(order?.["Shipping ID"] || "")
      .trim()
      .toUpperCase();
    if (!/^[A-Z]{2}\d{9}IN$/.test(sid)) {
      setLiveEvent(null);
      setLiveLatLng(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/india-post/track?id=${encodeURIComponent(sid)}`,
        );
        const json = await res.json();
        const art = json?.ok ? json.article : null;
        if (cancelled || !art?.lastEvent) return;
        setLiveEvent(art);
        const office = art.lastEvent.office || art.deliveryLocation || "";
        if (office) {
          try {
            const g = await fetch(
              `/api/geocode?q=${encodeURIComponent(office + ", India")}`,
            );
            const gj = await g.json();
            if (!cancelled && gj?.result?.lat) {
              setLiveLatLng({
                lat: gj.result.lat,
                lng: gj.result.lng,
                label: office,
              });
            }
          } catch {}
        }
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.["Shipping ID"]]);
  const [trackCopied, setTrackCopied] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [mapFull, setMapFull] = useState(false);
  const [mapTab, setMapTab] = useState("map"); // map | route
  const [showSupport, setShowSupport] = useState(false);
  // Return / refund-for-books-back request.
  const [retOpen, setRetOpen] = useState(false);
  const [retSel, setRetSel] = useState({}); // { lineIdx: true }
  const [retExtra, setRetExtra] = useState([""]); // free-text extra book names
  const [retBusy, setRetBusy] = useState(false);
  const [retRequest, setRetRequest] = useState(null); // existing request, if any
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
  // Add-email slide-up sheet (shown when the order has no email on file).
  const [showEmailSheet, setShowEmailSheet] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);

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
        // Unconfirmed orders (payment-pending / needs attention) ARE shown now,
        // with a clear banner + a contact-support link.
        if (!ignore) setOrder(owned ? row : null);
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

  // Load any existing return/refund request for this order (to show its status).
  useEffect(() => {
    const oid = String(params?.orderid || "").trim();
    if (!oid) return;
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/returns?orderId=${encodeURIComponent(oid)}`,
        );
        const json = await res.json();
        const reqs = Array.isArray(json.requests) ? json.requests : [];
        const active =
          reqs.find((r) => !/reject/i.test(r.status || "")) || reqs[0] || null;
        if (!ignore) setRetRequest(active);
      } catch {
        /* no-op */
      }
    })();
    return () => {
      ignore = true;
    };
  }, [params?.orderid]);

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
      const isReturned = /return/i.test(String(order["Order Status"] || ""));

      // Real route if available, else a straight line. The outbound leg is what
      // the vehicle travels; a returned parcel also makes the trip back, drawn
      // as a separate line offset slightly so there's a visible gap between the
      // "to you" and "came back" routes.
      const path =
        routeCoords && routeCoords.length > 1 ? routeCoords : [A, B];
      const effPct = isReturned ? 1 : pct;
      const splitIdx = Math.max(
        0,
        Math.min(path.length - 1, Math.round(effPct * (path.length - 1))),
      );
      // Return leg = outbound reversed, nudged ~0.3° south so it sits parallel
      // to the outbound line with a clear gap (not drawn on top of it).
      const returnPath = path
        .slice()
        .reverse()
        .map(([la, ln]) => [la - 0.3, ln]);
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
      // Faint grey "untravelled" base for the whole route, then a solid BLACK
      // "travelled" line that grows as the vehicle animates to the current point.
      L.polyline(path, {
        color: "#94a3b8",
        weight: 4.5,
        opacity: 0.7,
        dashArray: "7 9",
        lineCap: "round",
      }).addTo(map);
      const travelledLine = L.polyline([path[0]], {
        color: "#111827",
        weight: 5,
        opacity: 0.92,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);
      // Returned parcels: draw the "came back" leg in black too, offset below the
      // outbound line (visible gap) and dashed so the two routes read separately.
      if (isReturned) {
        L.polyline(returnPath, {
          color: "#111827",
          weight: 4,
          opacity: 0.8,
          dashArray: "3 8",
          lineCap: "round",
          lineJoin: "round",
        }).addTo(map);
      }

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
      // Vehicle travelling the route — a train for Faster/express delivery, a
      // truck for Standard. No flight (it never followed the roads). The emoji
      // sits in a tilted white badge for a subtle 3D feel.
      const vehicleEmoji = isExpressOrder(order) ? "🚆" : "🚚";
      const vehicle = L.marker(path[0], {
        icon: L.divIcon({
          className: "od-vehicle od-vehicle-3d",
          html: `<span class="od-veh-badge"><span class="od-veh-pulse"></span><span class="od-veh-emoji">${vehicleEmoji}</span></span>`,
          iconSize: [46, 46],
          iconAnchor: [23, 23],
        }),
        zIndexOffset: 1000,
      }).addTo(map);
      if (!delivered && !cancelled) {
        vehicle.bindTooltip("📦 Your order is here", {
          permanent: true,
          direction: "top",
          offset: [0, -30],
          className: "od-veh-tip",
        });
      }

      // If India Post reported a real latest scan location, drop the vehicle
      // exactly there (and label it with the event) instead of the estimate.
      const liveP = liveLatLng ? [liveLatLng.lat, liveLatLng.lng] : null;
      if (liveP && !delivered && !cancelled) {
        vehicle.setLatLng(liveP);
        try {
          vehicle.setTooltipContent(
            `📦 ${liveEvent?.lastEvent?.event || "Your order is here"}`,
          );
        } catch {}
      }

      // Zoom to fit the route, then re-centre on the parcel's CURRENT position
      // and lift it up so it sits in the visible upper area (not hidden behind
      // the bottom status overlay).
      const curPoint = liveP || path[splitIdx];
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
      // Skip the travel animation when we've pinned the real live location —
      // the vehicle already sits at the actual scan point.
      if (!liveP) {
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
      } else {
        // Draw the travelled line straight to the live point.
        try {
          travelledLine.setLatLngs([path[0], liveP]);
        } catch {}
      }
    })();
    return () => {
      disposed = true;
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiver, order, routeCoords, liveLatLng]);

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

  // Switching back to the Map tab un-hides the Leaflet container, which needs a
  // size recalculation (it can't measure a display:none element).
  useEffect(() => {
    if (mapTab !== "map" || !mapObj.current) return;
    const t = setTimeout(() => {
      try {
        mapObj.current.invalidateSize();
      } catch {}
    }, 60);
    return () => clearTimeout(t);
  }, [mapTab]);

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
    const advancePaidFlag = /^\s*yes/i.test(
      String(order?.["Advance Paid"] || ""),
    );
    // COD covers plain Cash-on-Delivery AND ₹99-advance orders (balance at door).
    const isCOD =
      /cash on delivery|\bcod\b|advance/i.test(
        String(order?.["Payment Type"] || ""),
      ) || advancePaidFlag;
    const hasCodFee = /cash on delivery/i.test(
      String(order?.["Payment Type"] || ""),
    );
    let codFee = 0;
    let discount = 0;
    const extra = grand - sub - deliveryFee - giftFee - bookmarkFee;
    if (extra > 0) {
      if (hasCodFee) codFee = extra;
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
    // ₹99 advance (Pay in two parts): paid online, the rest collected at the
    // door. "Pay on delivery" is the grand total minus any advance already paid.
    const advancePaid = advancePaidFlag;
    const advanceAmount = advancePaid ? 99 : 0;
    const payOnDelivery = Math.max(0, grand - advanceAmount);
    // Applied coupon (code column + discount parsed from the Offer Applied note).
    const couponCode = String(order?.["Coupon"] || "").trim();
    const cMatch = String(order?.["Offer Applied"] || "").match(
      /Coupon\s+\S+\s*\(₹(\d+)\s*OFF\)/i,
    );
    let couponDiscount = cMatch ? parseInt(cMatch[1], 10) : 0;

    // Prefer the dedicated itemised billing columns when they're present (new
    // orders). Old orders (no columns) keep the parsed/derived values above.
    const col = (name) => {
      const v = order?.[name];
      if (v === undefined || v === null || String(v).trim() === "") return null;
      const num = parseFloat(String(v).replace(/[^\d.-]/g, ""));
      return Number.isFinite(num) ? num : null;
    };
    const cSub = col("Subtotal");
    const cMrp = col("Total MRP");
    const cItemDisc = col("Item Discount");
    const cOffer = col("Offer Discount");
    const cCoupon = col("Coupon Discount");
    const cWallet = col("Wallet Applied");
    const cBookmark = col("Bookmark Charge");
    const cQr = col("QuickReads Total");
    const cCodFee = col("COD Fee");
    const cAdvance = col("Advance Amount");
    const cCollect = col("COD Collectible");

    const subF = cSub != null ? cSub : sub;
    const listingF = cMrp != null ? cMrp : listing;
    const giftF = giftFee;
    const bookmarkF = cBookmark != null ? cBookmark : bookmarkFee;
    const codFeeF = cCodFee != null ? cCodFee : codFee;
    const offerF = cOffer != null ? cOffer : 0;
    if (cCoupon != null) couponDiscount = cCoupon;
    const walletF = cWallet != null ? cWallet : 0;
    const qrF = cQr != null ? cQr : 0;
    // For new orders (dedicated columns) the offer, coupon and wallet each get
    // their OWN line, so the "Discount" line is just the auto offer. Old orders
    // keep the single derived "discount" (which rolls everything together).
    const hasBillCols =
      cSub != null || cOffer != null || cItemDisc != null || cMrp != null;
    const discountF = hasBillCols ? offerF : discount;
    const advanceAmountF = cAdvance != null ? cAdvance : advanceAmount;
    const payOnDeliveryF =
      cCollect != null ? cCollect : Math.max(0, grand - advanceAmountF);
    const itemDiscountF =
      cItemDisc != null ? cItemDisc : Math.max(0, listingF - subF);

    return {
      sub: subF,
      grand,
      deliveryFee,
      giftFee: giftF,
      bookmarkFee: bookmarkF,
      bookmarkCharged: addons.bookmarkCharged,
      bookmarkFree: addons.bookmarkFree,
      bookmarkQty: addons.bookmarkQty,
      quickReadsTotal: qrF,
      codFee: codFeeF,
      discount: discountF,
      offerDiscount: offerF,
      walletApplied: walletF,
      itemDiscount: itemDiscountF,
      freeDelivery,
      deliveryLabel: !freeDelivery && isHandling ? "Handling & Care" : "Delivery",
      listing: listingF,
      savings: Math.max(0, listingF - subF),
      isCOD,
      advancePaid,
      advanceAmount: advanceAmountF,
      payOnDelivery: payOnDeliveryF,
      couponCode,
      couponDiscount,
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
      quickReadsTotal,
      couponCode,
      couponDiscount,
      walletApplied,
      advancePaid,
      advanceAmount,
      payOnDelivery,
      listing,
      itemDiscount,
    } = bd;
    const W = 700;
    const P = 44;
    const rowH = 32;
    const scale = 2;
    const summaryCount =
      1 + // Total MRP
      (itemDiscount > 0 ? 1 : 0) +
      (sub > 0 ? 1 : 0) + // Total after discount
      1 + // delivery
      (giftFee > 0 ? 1 : 0) +
      (bookmarkFee > 0 ? 1 : 0) +
      (quickReadsTotal > 0 ? 1 : 0) +
      (codFee > 0 ? 1 : 0) +
      (discount > 0 ? 1 : 0) +
      (couponDiscount > 0 ? 1 : 0) +
      (walletApplied > 0 ? 1 : 0) +
      (advancePaid ? 2 : 0);
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
    sumLine(`Total MRP (${items.length} items)`, `₹${listing}`);
    if (itemDiscount > 0)
      sumLine("Discount on MRP", `−₹${itemDiscount}`, "#008f0c");
    if (sub > 0) sumLine("Total after discount", `₹${sub}`);
    if (quickReadsTotal > 0) sumLine("QuickReads", `+₹${quickReadsTotal}`);
    if (discount > 0) sumLine("Offer discount", `−₹${discount}`, "#008f0c");
    if (couponDiscount > 0)
      sumLine(
        `Coupon${couponCode ? ` (${couponCode})` : ""}`,
        `−₹${couponDiscount}`,
        "#008f0c",
      );
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
    if (walletApplied > 0)
      sumLine("Wallet applied", `−₹${walletApplied}`, "#008f0c");
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
    ctx.fillText(advancePaid ? "Order total" : "Total paid", P, y);
    ctx.textAlign = "right";
    ctx.fillText(`₹${grand}`, W - P, y);
    ctx.textAlign = "left";
    y += 36;
    if (advancePaid) {
      ctx.font = "600 13px Arial";
      ctx.fillStyle = "#008f0c";
      ctx.fillText("Paid online (advance)", P, y);
      ctx.textAlign = "right";
      ctx.fillText(`−₹${advanceAmount}`, W - P, y);
      ctx.textAlign = "left";
      y += 24;
      ctx.fillStyle = "#0a0a0a";
      ctx.font = "700 14px Arial";
      ctx.fillText("Collect at door", P, y);
      ctx.textAlign = "right";
      ctx.fillText(`₹${payOnDelivery}`, W - P, y);
      ctx.textAlign = "left";
      y += 30;
    }
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
  // Live India Post tracking status (pushed from the booking-report upload).
  // Stored as "<status>||<ISO time>" in the single "Tracking detail" column.
  // When present it overrides our manual status label on this page.
  const [trackDetailRaw, trackUpdatedIso] = String(
    order["Tracking detail"] || "",
  ).split("||");
  const trackDetail = (trackDetailRaw || "").trim();
  const trackStage = trackingToStage(order["Tracking detail"]);
  const trackUpdatedAt = trackUpdatedIso
    ? new Date(trackUpdatedIso.trim())
    : null;
  const trackUpdatedTxt =
    trackUpdatedAt && !isNaN(trackUpdatedAt.getTime())
      ? trackUpdatedAt.toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "";
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
  const cancelled = /cancel|return/i.test(order["Order Status"] || "");
  const isReturned = /return/i.test(order["Order Status"] || "");
  const onHold = /on\s*hold/i.test(order["Order Status"] || "");
  // Which scene the animated Route tab shows, + the lead book cover (with a
  // "+N" badge for the rest) to ride in the vehicle's cargo.
  const routeStage = isReturned
    ? "returned"
    : delivered
      ? "delivered"
      : outForDelivery
        ? "ofd"
        : inTransit
          ? "transit"
          : "processing";
  const routeBookImgs = books
    .map((b) => findBook(b.name)?.image)
    .filter(Boolean);
  const routeBookCount = books.length;
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
      altPhone: String(order["Alternate number"] || "")
        .replace(/\D/g, "")
        .slice(-10),
      email: String(order["Email"] || "").trim(),
    });
    setShowAddrEdit(true);
  };

  // ── Return books for a refund (to wallet) ────────────────────────────────
  const openReturn = () => {
    setRetSel({});
    setRetExtra([""]);
    setRetOpen(true);
  };
  const retEstimate = () =>
    books.reduce(
      (s, b, i) => (retSel[i] ? s + Math.round((b.total || 0) * 0.5) : s),
      0,
    );
  const retPickupAddress = () => {
    const parts = [cleanAddr, order["City"], order["State"], order["Pincode"]]
      .map((x) => String(x || "").trim())
      .filter(Boolean);
    return parts.join(", ");
  };
  const submitReturn = async () => {
    const selectedBooks = books
      .filter((_, i) => retSel[i])
      .map((b) => `${b.name}${b.quantity > 1 ? ` ×${b.quantity}` : ""}`);
    const extras = retExtra.map((s) => String(s || "").trim()).filter(Boolean);
    if (selectedBooks.length === 0 && extras.length === 0) {
      showToast("Please select at least one book to return.", "warning");
      return;
    }
    setRetBusy(true);
    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          orderId: String(order["Order ID"] || params?.orderid || ""),
          phone: number,
          customerName: custName,
          returnBooks: selectedBooks,
          extraBooks: extras,
          estimated: retEstimate(),
          pickupFrom: retPickupAddress(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(
          "Exchange request has been sent successfully. Our team might contact for images of the books to confirm.",
          "success",
        );
        setRetOpen(false);
        setRetRequest({
          requestId: json.requestId,
          status: "Requested",
          moneyReleased: false,
          approvedRefund: 0,
          estimatedRefund: retEstimate(),
          returnBooks: selectedBooks.join(" | "),
          extraBooks: extras.join(" | "),
        });
      } else {
        showToast(
          "Couldn't raise the request right now. Please try again.",
          "error",
        );
      }
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setRetBusy(false);
    }
  };

  const saveAddr = async () => {
    if (!addrForm) return;
    const em = String(addrForm.email || "").trim();
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      alert("Please enter a valid email address.");
      return;
    }
    setAddrSaving(true);
    const fields = {
      Address: addrForm.address.trim(),
      City: addrForm.city.trim(),
      State: addrForm.state.trim(),
      Pincode: addrForm.pincode.trim(),
      "Alternate number": String(addrForm.altPhone || "")
        .replace(/\D/g, "")
        .slice(-10),
      Email: em,
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

  // ── Email (optional) — stored in the order's "Email" column ──
  const orderEmail = String(order["Email"] || "").trim();

  // Add an email to an order that doesn't have one, so confirmations and
  // updates can reach the customer.
  const saveEmail = async () => {
    const em = String(emailDraft || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    setEmailSaving(true);
    try {
      await updateOrderRow(orderId, { Email: em });
      setOrder((o) => ({ ...o, Email: em }));
      setShowEmailSheet(false);
      setEmailDraft("");
      showToast("Email added — confirmation on the way.", "success");
      // Send the order confirmation to the newly-added address so the customer
      // immediately gets their order details and invoice by email.
      try {
        const emailOrder = orderEmailFromRow({ ...order, Email: em }, books);
        sendOrderConfirmationEmail({ to: em, order: emailOrder });
      } catch (mailErr) {
        console.error("Confirmation email failed", mailErr);
      }
    } catch (e) {
      console.error("Email save failed", e);
      showToast("Couldn't save your email. Please try again.", "error");
    } finally {
      setEmailSaving(false);
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
    if (/cancel|return/i.test(order["Order Status"] || ""))
      return { done: "Cancelled" };
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
    if (/on\s*hold/.test(st)) return "On hold";
    if (delivered) return "Delivered"; // includes "money received"
    if (/shipped|getting shipped/.test(st)) return "Getting shipped";
    if (/processing/.test(st)) return "Preparing";
    if (inTransit || outForDelivery) return `${eta.num} ${eta.unit}`;
    if (/unconfirmed|pending/.test(st)) return "Processing";
    return "Confirmed";
  })();

  // Journey progress 0..1 for the green fill bar.
  const progressPct = Math.round(computeProgress(order) * 100);

  // Delivery window (min/max days) — used for the support sheet ETA copy.
  const [etaMin, etaMax] = isFaster ? [1, 5] : [4, 9];
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
      // Reward a review on a delivered order with ₹10 straight to the wallet.
      if (delivered) {
        creditWalletReward(
          String(order["Phone Number"] || number || ""),
          10,
          orderId,
          "Review reward",
        )
          .then(() => setWalletBal((b) => b + 10))
          .catch(() => {});
      }
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

      {/* Gift order — flowing confetti down the page (no banner card). */}
      {order && isGiftOrder(order) && (
        <span className="od-gift-confetti" aria-hidden="true">
          {Array.from({ length: 16 }).map((_, i) => (
            <span key={i} className={`odgc odgc-${i % 10}`} />
          ))}
        </span>
      )}

      {/* Loyalty confetti + celebration banner (3+ orders, recent 4). */}
      <CartConfetti trigger={celebrate} />
      {loyalN > 2 && (
        <div className="od-loyalty">
          <span className="od-loyalty-emoji">🎉</span>
          <div className="od-loyalty-txt">
            <strong>That&apos;s {loyalN} orders with TheBookX!</strong>
            <span>
              You&apos;re one of our loyal readers — thank you for keeping the
              pages turning. 📚
            </span>
          </div>
        </div>
      )}

      {/* Unconfirmed order — payment-pending / needs attention. */}
      {order &&
        (/unconfirmed|pending/i.test(order["Order Status"] || "") ||
          /\(unconfirmed\)/i.test(order["Customer Name"] || "")) && (
          <div className="od-unconf-banner">
            <span className="od-unconf-ic">
              <AlertCircle size={18} />
            </span>
            <div className="od-unconf-txt">
              <strong>This order isn&apos;t confirmed yet</strong>
              <span>
                We may be waiting for your payment, or there could be an issue
                with this order. Please contact us and we&apos;ll sort it out
                right away.
              </span>
              <button
                type="button"
                className="od-unconf-btn"
                onClick={contactSupport}
              >
                <FaWhatsapp size={15} /> Contact support
              </button>
            </div>
          </div>
        )}

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

          {/* Email — read-only; edit via the Edit sheet (near name/address). */}
          <div className="od-email-row od-email-readonly">
            <Mail size={15} />
            {orderEmail ? (
              <span className="od-email-val">{orderEmail}</span>
            ) : (
              <button
                type="button"
                className="od-email-add"
                onClick={() => {
                  setEmailDraft("");
                  setShowEmailSheet(true);
                }}
              >
                Add an email
              </button>
            )}
          </div>
        </section>
      )}

      {/* Order status card — moved below the name/address card (standalone). */}
      {order && (
        <div className="od-map-eta od-eta-standalone">
          <div className="od-map-eta-row">
            <span
              className={`od-map-eta-dot${delivered || trackStage?.idx === 4 ? " done" : cancelled ? " off" : ""}`}
            />
            <div className="od-map-eta-txt">
              <strong>{trackDetail || stLabel.title}</strong>
              <span>
                {trackDetail ? (
                  <>
                    📍 Live tracking status
                    {trackUpdatedTxt ? (
                      <span className="od-track-upd">
                        {" "}
                        · last updated {trackUpdatedTxt}
                      </span>
                    ) : null}
                  </>
                ) : cancelled ? (
                  "This order was cancelled"
                ) : onHold ? (
                  "There is some issue in packaging this item"
                ) : delivered ? (
                  "Your books have arrived — enjoy!"
                ) : outForDelivery ? (
                  "Arriving today — keep your phone handy"
                ) : (
                  `Reaching you in ${etaMin}–${etaMax} days`
                )}
              </span>
            </div>
            <span
              className={`od-map-eta-badge${delivered ? " done" : ""}${cancelled ? " cancelled" : ""}`}
            >
              {psBadge}
            </span>
          </div>
          {liveEvent?.lastEvent?.event && !cancelled && (
            <div className="od-last-scan">
              <MapPin size={14} />
              <span className="od-last-scan-txt">
                <b>{liveEvent.lastEvent.event}</b>
                {liveEvent.lastEvent.office
                  ? ` · ${liveEvent.lastEvent.office}`
                  : ""}
                {liveEvent.lastEvent.date ? (
                  <span className="od-last-scan-time">
                    {" "}
                    ·{" "}
                    {new Date(liveEvent.lastEvent.date).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ) : null}
              </span>
            </div>
          )}
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
            ) : inTransit &&
              shippingId &&
              /^[ce]/i.test(String(shippingId).trim()) ? (
              <button
                type="button"
                className="od-map-eta-btn"
                onClick={() => setShowTrack(true)}
              >
                <Navigation size={12} /> Track
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

      {/* Map + floating arrival card (Flipkart-style) */}
      <section
        className={`od-map-card${mapFull ? " od-map-full" : ""}`}
      >
        {geoState === "ok" && receiver ? (
          <>
            <div className="od-map-tabs">
              <button
                type="button"
                className={`od-map-tab${mapTab === "map" ? " on" : ""}`}
                onClick={() => setMapTab("map")}
              >
                <MapPin size={14} /> Live location
              </button>
              <button
                type="button"
                className={`od-map-tab${mapTab === "route" ? " on" : ""}`}
                onClick={() => setMapTab("route")}
              >
                <Navigation size={14} /> Delivery journey
              </button>
            </div>
            <div className="od-map-stage">
              <div
                ref={mapRef}
                className="od-map"
                style={{ display: mapTab === "map" ? "block" : "none" }}
              />
              {mapTab === "route" && (
                <RouteScene
                  isTrain={isFaster}
                  stage={routeStage}
                  bookImgs={routeBookImgs}
                  bookCount={routeBookCount}
                  progressPct={progressPct}
                  etaText={
                    inTransit ? `On the way · ${progressPct}%` : ""
                  }
                />
              )}
              {mapTab === "map" && (
                <button
                  type="button"
                  className="od-map-expand"
                  onClick={() => setMapFull((v) => !v)}
                  aria-label={mapFull ? "Exit full screen" : "Full screen map"}
                >
                  {mapFull ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                </button>
              )}
            </div>
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
              We couldn&apos;t locate the delivery area for this order right now.
            </span>
          </div>
        )}

      </section>

      {/* Delivery details — ETA date, status timeline, courier, tracking ID. */}
      {order && !cancelled && (
        <section className="od-deliv-card">
          {(() => {
            const steps = [
              { k: "Placed", Icon: Check },
              { k: "Packed", Icon: Package },
              { k: "Shipped", Icon: Truck },
              { k: "Out for delivery", Icon: Navigation },
              { k: "Delivered", Icon: Home },
            ];
            // When a live India Post status is present, it drives the step so
            // the timeline matches reality (e.g. Delivered / Out for delivery).
            const liveStage = trackingToStage(order["Tracking detail"]);
            const idx = liveStage
              ? liveStage.idx
              : delivered
                ? 4
                : outForDelivery
                  ? 3
                  : inTransit || (shipped && shippingId)
                    ? 2
                    : /processing|getting shipped|packed/i.test(
                          order["Order Status"] || "",
                        )
                      ? 1
                      : 0;
            return (
              <ol className="od-timeline">
                {steps.map((s, i) => {
                  const state =
                    i < idx ? "done" : i === idx ? "active" : "todo";
                  const Ic = s.Icon;
                  return (
                    <li key={s.k} className={`od-tl-step ${state}`}>
                      <span className="od-tl-dot">
                        <Ic size={13} />
                      </span>
                      <span className="od-tl-lbl">{s.k}</span>
                    </li>
                  );
                })}
              </ol>
            );
          })()}

          {shippingId &&
            (() => {
              // Only real consignment IDs (ordinary "C…" / speed-post "E…") are
              // copiable + link to tracking. Anything else is shown plainly.
              const isPostId = /^[ce]/i.test(String(shippingId).trim());
              // India Post has no public GET deep-link to a single consignment
              // (that page 502s on direct load), so we open their site — which
              // loads reliably — with the ID already on the clipboard to paste.
              const TRACK_URL = "https://www.indiapost.gov.in/";
              // Copy the ID; only flag "Copied" when the write genuinely
              // succeeds (the Clipboard API resolves/rejects per permission).
              const copyId = async () => {
                try {
                  await navigator.clipboard.writeText(String(shippingId));
                  setTrkIdCopied(true);
                  setTimeout(() => setTrkIdCopied(false), 2000);
                  return true;
                } catch {
                  return false;
                }
              };
              return (
                <div className="od-trk-id">
                  <div className="od-trk-id-l">
                    <span className="od-trk-lbl">Tracking ID</span>
                    <span className="od-trk-val">{shippingId}</span>
                  </div>
                  {isPostId && (
                    <div className="od-trk-id-r">
                      <button
                        type="button"
                        className="od-trk-copy"
                        onClick={copyId}
                      >
                        {trkIdCopied ? <Check size={14} /> : <Copy size={14} />}
                        {trkIdCopied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        type="button"
                        className="od-trk-link"
                        onClick={async () => {
                          await copyId();
                          window.open(
                            TRACK_URL,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                      >
                        Track ↗
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
        </section>
      )}

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
          className={`od-quick-btn${delivered ? " od-quick-reward" : ""}`}
          onClick={() => setShowRateSheet(true)}
        >
          <Star size={15} /> {delivered ? "Rate us · +₹10" : "Rate us"}
        </button>
        <button
          type="button"
          className="od-quick-btn od-quick-refer"
          onClick={() => setShowReferSheet(true)}
        >
          <Gift size={15} /> Refer &amp; win ₹50
        </button>
      </div>

      {/* Share & earn — post a review of this order, get up to ₹200 back. */}
      <ReviewRewardCard phone={number} orderId={orderId} />

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
        {/* Clear, meaningful flow: Total MRP → after discount → offer/coupon →
            add-ons → wallet → net bill (each step adds up to the next). */}
        <div className="od-price-row">
          <span>
            Total MRP ({books.length} {books.length === 1 ? "item" : "items"})
          </span>
          <span className="od-strike">₹{bd.listing}</span>
        </div>
        {bd.itemDiscount > 0 && (
          <div className="od-price-row od-price-save">
            <span>Discount on MRP</span>
            <span>−₹{bd.itemDiscount}</span>
          </div>
        )}
        <div className="od-price-row od-price-sub">
          <span>Total after discount</span>
          <span>₹{bd.sub}</span>
        </div>
        {bd.quickReadsTotal > 0 && (
          <div className="od-price-row">
            <span>QuickReads</span>
            <span>+₹{bd.quickReadsTotal}</span>
          </div>
        )}
        {bd.discount > 0 && (
          <div className="od-price-row od-price-save">
            <span>Offer discount</span>
            <span>−₹{bd.discount}</span>
          </div>
        )}
        {(bd.couponDiscount > 0 || bd.couponCode) && (
          <div className="od-price-row od-price-save">
            <span>Coupon{bd.couponCode ? ` (${bd.couponCode})` : ""}</span>
            <span>
              {bd.couponDiscount > 0 ? `−₹${bd.couponDiscount}` : "Applied"}
            </span>
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
        {bd.walletApplied > 0 && (
          <div className="od-price-row od-price-save">
            <span>Wallet applied</span>
            <span>−₹{bd.walletApplied}</span>
          </div>
        )}
        <div className="od-price-row od-price-total">
          <span>Net bill amount</span>
          <span>₹{bd.grand}</span>
        </div>
        {bd.advancePaid && (
          <div className="od-price-row od-price-save">
            <span>Advance paid online</span>
            <span>−₹{bd.advanceAmount}</span>
          </div>
        )}
        {bd.isCOD && !delivered && (
          <div className="od-pay-due">
            <div className="od-pay-due-main">
              <span className="od-pay-due-lbl">
                {bd.advancePaid
                  ? "To pay on delivery (balance)"
                  : "To pay on delivery"}
              </span>
              <span className="od-pay-due-amt">₹{bd.payOnDelivery}</span>
            </div>
            <span className="od-pay-due-note">
              {bd.advancePaid
                ? `₹${bd.advanceAmount} already paid online · pay the remaining ₹${bd.payOnDelivery} in cash/UPI to the delivery agent`
                : "Pay in cash or UPI to the delivery agent"}
            </span>
          </div>
        )}
        <div className="od-paid-row">
          <span>
            {bd.isCOD && !delivered ? "Payment mode" : "Paid by"}
          </span>
          <span className="od-paid-mode">
            {order["Payment Type"] || "—"}
            {bd.advancePaid ? " · ₹99 advance paid" : ""}
          </span>
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

        {/* Return books for a refund (money back to wallet). Delivered only. */}
        {delivered &&
          !cancelled &&
          (retRequest ? (
            <div className="od-return-raised">
              <div className="od-return-raised-top">
                <PackageCheck size={16} />
                <span>
                  {retRequest.moneyReleased
                    ? "Refund completed"
                    : "Pickup request raised"}
                </span>
              </div>
              <p className="od-return-raised-sub">
                {retRequest.moneyReleased ? (
                  <>
                    ₹{retRequest.approvedRefund} has been added to your TheBookX
                    wallet for the returned books.
                  </>
                ) : retRequest.approvedRefund > 0 ? (
                  <>
                    Approved refund:{" "}
                    <b>₹{retRequest.approvedRefund}</b> — credited to your wallet
                    once we receive &amp; verify the books.
                  </>
                ) : (
                  <>
                    We&apos;ll arrange a pickup for the selected books. Our team
                    may contact you for photos to confirm, then the refund is
                    credited to your wallet.
                  </>
                )}
              </p>
            </div>
          ) : (
            <button
              type="button"
              className="od-return-btn"
              onClick={openReturn}
            >
              <RotateCcw size={16} /> Get money on return of the books
            </button>
          ))}
      </section>

      {/* COD → pay-online upgrade (only before the parcel is moving). Also
          shown for ANY unpaid order when the customer arrives via the "pay now"
          link (?pay=online) — e.g. the "Payment not received" message for an
          order that shows paid but wasn't. Only hidden once delivered/cancelled. */}
      {((/cash on delivery|cod/i.test(order["Payment Type"] || "") &&
        !inTransit &&
        !outForDelivery) ||
        payParam) &&
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

      {/* TheBookX Exclusive membership pitch removed on request. */}

      {/* Wallet nudge — spendable balance to pull them back for a next order. */}
      {walletBal > 0 && !cancelled && (
        <Link href="/" className="od-wallet-nudge">
          <span className="od-wallet-ic">₹</span>
          <span className="od-wallet-txt">
            You have <b>₹{walletBal}</b> in your wallet — use it on your next
            order.
          </span>
          <span className="od-wallet-go">Shop now →</span>
        </Link>
      )}

      {/* Cross-sell rail — more books readers loved (new order). */}
      {recos.length > 0 && !cancelled && (
        <section className="od-reco">
          <div className="od-reco-head">
            <span className="od-reco-title">Readers also loved</span>
            <span className="od-reco-sub">Add your next great read</span>
          </div>
          <div className="od-reco-rail">
            {recos.map((b) => (
              <div className="od-reco-item" key={b.id || b.name}>
                <BookCard book={b} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Scratch-card reward — below the bill breakdown (skeleton → 3D → reveal).
          Hidden for unconfirmed orders (payment-pending / needs attention). */}
      {!(
        /unconfirmed|pending/i.test(order["Order Status"] || "") ||
        /\(unconfirmed\)/i.test(order["Customer Name"] || "")
      ) && (
        <OrderScratchCard
          phone={String(order["Phone Number"] || number)}
          orderId={orderId}
          orderValue={bd.grand}
          cancelled={cancelled}
        />
      )}

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
            order={order}
            onClose={() => setShowSupport(false)}
          />
        )}
      </AnimatePresence>

      {/* Return books for a refund — bottom sheet */}
      <AnimatePresence>
        {retOpen && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !retBusy && setRetOpen(false)}
          >
            <motion.div
              className="bill-modal od-return-modal"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="od-return-head">
                <div>
                  <h3>Return books for a refund</h3>
                  <p>
                    Pick the books you want to send back. We arrange a free
                    pickup, and once we receive &amp; verify them the refund is
                    added to your TheBookX wallet.
                  </p>
                </div>
                <button
                  type="button"
                  className="od-return-x"
                  onClick={() => !retBusy && setRetOpen(false)}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="od-return-body">
                <div className="od-return-label">Books in this order</div>
                <div className="od-return-books">
                  {books.map((b, i) => {
                    const on = !!retSel[i];
                    const half = Math.round((b.total || 0) * 0.5);
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`od-return-book${on ? " on" : ""}`}
                        onClick={() =>
                          setRetSel((s) => ({ ...s, [i]: !s[i] }))
                        }
                      >
                        <span className="od-return-book-check">
                          {on && <Check size={13} />}
                        </span>
                        <span className="od-return-book-name">
                          {b.name}
                          {b.quantity > 1 ? ` ×${b.quantity}` : ""}
                        </span>
                        <span className="od-return-book-val">
                          ≈₹{half}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="od-return-label">
                  Other books to return (optional)
                </div>
                <div className="od-return-extras">
                  {retExtra.map((val, i) => (
                    <div key={i} className="od-return-extra-row">
                      <input
                        className="od-return-extra-input"
                        placeholder="Type a book title…"
                        value={val}
                        onChange={(e) =>
                          setRetExtra((arr) =>
                            arr.map((v, j) => (j === i ? e.target.value : v)),
                          )
                        }
                      />
                      {retExtra.length > 1 && (
                        <button
                          type="button"
                          className="od-return-extra-del"
                          onClick={() =>
                            setRetExtra((arr) => arr.filter((_, j) => j !== i))
                          }
                          aria-label="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className="od-return-addmore"
                    onClick={() => setRetExtra((arr) => [...arr, ""])}
                  >
                    <Plus size={14} /> Add another book
                  </button>
                </div>

                <div className="od-return-estimate">
                  <span>Estimated refund (≈50% of value)</span>
                  <b>₹{retEstimate()}</b>
                </div>
                <p className="od-return-note">
                  This is an estimate. Our team confirms the final refund after
                  inspecting the books — extra books you add are assessed then.
                  Refund is credited to your TheBookX wallet.
                </p>
              </div>

              <div className="od-return-foot">
                <button
                  type="button"
                  className="od-return-cancel"
                  onClick={() => !retBusy && setRetOpen(false)}
                  disabled={retBusy}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="od-return-submit"
                  onClick={submitReturn}
                  disabled={retBusy}
                >
                  {retBusy ? "Sending…" : "Raise pickup request"}
                </button>
              </div>
            </motion.div>
          </motion.div>
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
                <div>
                  <label className="od-field-lbl">Alternate number</label>
                  <input
                    className="od-field-input"
                    inputMode="tel"
                    maxLength={10}
                    placeholder="Optional"
                    value={addrForm.altPhone || ""}
                    onChange={(e) =>
                      setAddrForm((f) => ({
                        ...f,
                        altPhone: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      }))
                    }
                  />
                </div>
                <div className="od-field-full">
                  <label className="od-field-lbl">Email</label>
                  <input
                    className="od-field-input"
                    type="email"
                    inputMode="email"
                    autoCapitalize="off"
                    autoCorrect="off"
                    placeholder="you@example.com (optional)"
                    value={addrForm.email || ""}
                    onChange={(e) =>
                      setAddrForm((f) => ({ ...f, email: e.target.value }))
                    }
                  />
                  <span className="od-field-note">
                    Used for order tracking &amp; further communications only.
                  </span>
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

      {/* Add-email slide-up sheet — same drawer UI as the note/number sheets. */}
      <AnimatePresence>
        {showEmailSheet && (
          <motion.div
            className="bill-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !emailSaving && setShowEmailSheet(false)}
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
                  <Mail size={16} /> Add your email
                </span>
                <span
                  className="cursor-pointer"
                  onClick={() => !emailSaving && setShowEmailSheet(false)}
                >
                  <X size={16} />
                </span>
              </div>
              <div className="od-sheet-body">
                <p className="od-sheet-hint">
                  We&apos;ll send your order confirmation, invoice and delivery
                  updates here.
                </p>
                <input
                  type="email"
                  inputMode="email"
                  className="od-note-input"
                  placeholder="you@example.com"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !emailSaving) saveEmail();
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="od-track-btn"
                  onClick={saveEmail}
                  disabled={emailSaving}
                >
                  {emailSaving ? "Saving…" : "Save email"}
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

      {/* Gift reveal — surprise message popup with confetti (from a scanned QR) */}
      <AnimatePresence>
        {giftOpen && (
          <motion.div
            className="gift-reveal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGiftOpen(false)}
          >
            <span className="gift-reveal-confetti" aria-hidden="true">
              {Array.from({ length: 36 }).map((_, i) => (
                <span key={i} className={`grc grc-${i % 12}`} />
              ))}
            </span>
            <motion.div
              className="gift-reveal-card"
              initial={{ scale: 0.8, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="gift-reveal-x"
                onClick={() => setGiftOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
              <div className="gift-reveal-emoji">🎁</div>
              <div className="gift-reveal-kicker">A surprise for you</div>
              <p className="gift-reveal-msg">{giftMsg}</p>
              <div className="gift-reveal-foot">
                With love, from TheBookX 💛
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
