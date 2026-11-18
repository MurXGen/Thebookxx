"use client";

// Manage-orders → Orders: a collapsible map of where the orders in view come
// from (follows every filter/search applied above). Orders are pinned on their
// state straight away, then moved to their city as it's located (OpenStreetMap
// via /api/geocode, one lookup a second, cached in this browser for good).
// Leaflet loads from the CDN only when the map is first opened.

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, MapPin, Loader2, GripHorizontal, Maximize2, Minimize2 } from "lucide-react";

const STATE_CENTRES = {
  andhrapradesh: [15.9, 79.7],
  arunachalpradesh: [28.2, 94.7],
  assam: [26.2, 92.9],
  bihar: [25.1, 85.3],
  chhattisgarh: [21.3, 81.9],
  goa: [15.35, 74.05],
  gujarat: [22.3, 71.2],
  haryana: [29.1, 76.1],
  himachalpradesh: [31.1, 77.2],
  jharkhand: [23.6, 85.3],
  karnataka: [15.3, 75.7],
  kerala: [10.9, 76.3],
  madhyapradesh: [23.0, 78.7],
  maharashtra: [19.75, 75.7],
  manipur: [24.7, 93.9],
  meghalaya: [25.5, 91.4],
  mizoram: [23.2, 92.9],
  nagaland: [26.2, 94.6],
  odisha: [20.95, 85.1],
  punjab: [31.15, 75.3],
  rajasthan: [27.0, 74.2],
  sikkim: [27.5, 88.5],
  tamilnadu: [11.1, 78.7],
  telangana: [18.1, 79.0],
  tripura: [23.9, 91.99],
  uttarpradesh: [26.85, 80.95],
  uttarakhand: [30.07, 79.0],
  westbengal: [23.0, 87.85],
  delhi: [28.65, 77.2],
  jammuandkashmir: [33.8, 76.6],
  ladakh: [34.15, 77.6],
  puducherry: [11.94, 79.81],
  chandigarh: [30.73, 76.78],
  andamanandnicobarislands: [11.74, 92.66],
  dadraandnagarhavelianddamananddiu: [20.4, 72.83],
  lakshadweep: [10.57, 72.64],
};
const STATE_ALIASES = {
  orissa: "odisha",
  chattisgarh: "chhattisgarh",
  chhatisgarh: "chhattisgarh",
  chhattishgarh: "chhattisgarh",
  telengana: "telangana",
  tamilnad: "tamilnadu",
  bengal: "westbengal",
  wb: "westbengal",
  maharastra: "maharashtra",
  gujrat: "gujarat",
  karnatka: "karnataka",
  utterpradesh: "uttarpradesh",
  uttrakhand: "uttarakhand",
  jammuandkashmirut: "jammuandkashmir",
  newdelhi: "delhi",
  nctofdelhi: "delhi",
  pondicherry: "puducherry",
  jammukashmir: "jammuandkashmir",
  jk: "jammuandkashmir",
  uttaranchal: "uttarakhand",
  andaman: "andamanandnicobarislands",
  andamannicobar: "andamanandnicobarislands",
  damananddiu: "dadraandnagarhavelianddamananddiu",
  dadraandnagarhaveli: "dadraandnagarhavelianddamananddiu",
  up: "uttarpradesh",
  mp: "madhyapradesh",
};
const stateKey = (s) => {
  const k = String(s || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z]/g, "");
  return STATE_ALIASES[k] || k;
};
const title = (s) =>
  String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (c) => c.toUpperCase());
const inr = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;

// Same free base maps as the customer order page (street + satellite).
const MAP_LAYERS = {
  streets: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery © Esri",
  },
};

const GEO_KEY = "mo_geo_v1";
const readGeo = () => {
  try {
    return JSON.parse(localStorage.getItem(GEO_KEY) || "{}") || {};
  } catch {
    return {};
  }
};
const writeGeo = (g) => {
  try {
    localStorage.setItem(GEO_KEY, JSON.stringify(g));
  } catch {}
};

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
    const existing = document.getElementById("leaflet-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L));
      return;
    }
    const sc = document.createElement("script");
    sc.id = "leaflet-js";
    sc.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    sc.async = true;
    sc.onload = () => resolve(window.L);
    sc.onerror = () => resolve(null);
    document.body.appendChild(sc);
  });
}

// Calendar-day age, matching the order cards ("Today", "1 day", "5 days").
const startOfDay = (t) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const daysAgo = (t) => (t ? Math.round((startOfDay(Date.now()) - startOfDay(t)) / 864e5) : null);
const ageLabel = (d) => (d == null ? "—" : d <= 0 ? "Today" : d === 1 ? "1 day ago" : `${d} days ago`);
const fmtDate = (t) =>
  t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—";

export default function OrdersMap({ orders, dateOf, onOpenOrder }) {
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem("mo_map_open") === "1";
    } catch {
      return false;
    }
  });
  const [geo, setGeo] = useState(() => (typeof window === "undefined" ? {} : readGeo()));
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const tileRef = useRef(null);
  const [mapLayer, setMapLayer] = useState("streets");
  const [full, setFull] = useState(false);
  const canvasRef = useRef(null);
  // True full screen (browser Fullscreen API); Esc or the button exits.
  const toggleFull = () => {
    const el = canvasRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => setFull((v) => !v));
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else {
      setFull((v) => !v); // no Fullscreen API: fixed overlay fallback
    }
  };
  useEffect(() => {
    const onChange = () =>
      setFull(!!(document.fullscreenElement || document.webkitFullscreenElement) &&
        (document.fullscreenElement || document.webkitFullscreenElement) === canvasRef.current);
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, []);
  const fittedSig = useRef("");
  const fitAll = () => {
    const L = typeof window !== "undefined" ? window.L : null;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    map.invalidateSize();
    const pts = [];
    layer.eachLayer((l) => l.getLatLng && pts.push(l.getLatLng()));
    if (pts.length) map.fitBounds(L.latLngBounds(pts).pad(0.2), { maxZoom: 9, animate: false });
  };

  const toggle = () =>
    setOpen((v) => {
      try {
        localStorage.setItem("mo_map_open", v ? "0" : "1");
      } catch {}
      return !v;
    });

  // Group the orders in view by city (+ state), keeping each order's details.
  const places = useMemo(() => {
    const m = new Map();
    (orders || []).forEach((o) => {
      const city = title(o["City"]);
      const st = String(o["State"] || "").trim();
      const sk = stateKey(st);
      const pin = String(o["Pincode"] || "").replace(/\D/g, "").slice(0, 6);
      const key = `${city.toLowerCase()}|${sk}`;
      if (!m.has(key))
        m.set(key, { key, city, state: title(st), sk, pin, n: 0, rev: 0, names: [], list: [] });
      const p = m.get(key);
      const d = dateOf ? dateOf(o) : null;
      const t = d && !isNaN(d) ? d.getTime() : 0;
      p.n += 1;
      p.rev += Number(o.revenue) || 0;
      if (p.names.length < 6) p.names.push(String(o["Customer Name"] || "").trim() || "—");
      const bookNames = (o.parsedBooks || [])
        .map((b) => `${String(b.name || "").trim()}${Number(b.quantity) > 1 ? ` ×${b.quantity}` : ""}`)
        .filter(Boolean);
      p.list.push({
        id: o["Order ID"],
        name: String(o["Customer Name"] || "").trim() || "—",
        phone: String(o["Phone Number"] || "").replace(/\D/g, "").slice(-10),
        pin,
        area: [title(o["City"]), title(o["State"])].filter(Boolean).join(", "),
        books: bookNames,
        nBooks: (o.parsedBooks || []).reduce((n, b) => n + (Number(b.quantity) || 1), 0),
        t,
        status: String(o["Order Status"] || "").trim() || "—",
        rev: Number(o.revenue) || 0,
        cod: /cash|cod/i.test(String(o["Payment Type"] || "")),
        gift: /^\s*yes/i.test(String(o["Gift Wrap"] || "")),
        express: /faster|express/i.test(String(o["Delivery Type"] || "")),
        trk: String(o.shippingId || o["Shipping ID"] || "").trim(),
      });
      if (!p.pin && pin) p.pin = pin;
    });
    return [...m.values()]
      .map((p) => {
        const ts = p.list.map((x) => x.t).filter(Boolean);
        p.list.sort((a, b) => b.t - a.t);
        return { ...p, newest: ts.length ? Math.max(...ts) : 0, oldest: ts.length ? Math.min(...ts) : 0 };
      })
      .sort((a, b) => b.n - a.n || b.newest - a.newest);
  }, [orders, dateOf]);

  // Headline stats for the orders in view.
  const stats = useMemo(() => {
    const total = (orders || []).length;
    const byState = new Map();
    places.forEach((p) => {
      if (!p.sk) return;
      const cur = byState.get(p.sk) || { name: p.state, n: 0 };
      cur.n += p.n;
      byState.set(p.sk, cur);
    });
    const topState = [...byState.values()].sort((a, b) => b.n - a.n)[0];
    const ages = places.flatMap((p) => p.list.map((x) => daysAgo(x.t))).filter((d) => d != null);
    const repeatCities = places.filter((p) => p.n > 1).length;
    return {
      total,
      cities: places.length,
      states: byState.size,
      topState,
      topCity: places[0],
      repeatCities,
      avgAge: ages.length ? ages.reduce((s2, d) => s2 + d, 0) / ages.length : null,
      oldest: ages.length ? Math.max(...ages) : null,
      rev: places.reduce((s2, p) => s2 + p.rev, 0),
    };
  }, [orders, places]);
  // City list: 4 at first; each "Show more" renders the next batch.
  const [listN, setListN] = useState(4);
  // Map height — drag the grip (or arrow keys), like the order page map.
  const [mapH, setMapH] = useState(() => {
    try {
      const h = parseInt(localStorage.getItem("mo_map_h") || "", 10);
      return h >= 220 && h <= 900 ? h : 380;
    } catch {
      return 380;
    }
  });
  const saveH = (h) => {
    try {
      localStorage.setItem("mo_map_h", String(h));
    } catch {}
  };
  const startResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startH = mapH;
    const maxH = Math.round(window.innerHeight * 0.85);
    let last = startH;
    const move = (ev) => {
      last = Math.round(Math.max(220, Math.min(maxH, startH + ev.clientY - startY)));
      setMapH(last);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      saveH(last);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const nudgeH = (d) =>
    setMapH((h) => {
      const n = Math.max(220, Math.min(Math.round(window.innerHeight * 0.85), h + d));
      saveH(n);
      return n;
    });
  const markerByKey = useRef(new Map());
  const drawSigRef = useRef("");
  // Opening an order leaves full screen first so its bill isn't hidden.
  const onOpenRef = useRef(null);
  useEffect(() => {
    onOpenRef.current = (id) => {
      if (document.fullscreenElement) document.exitFullscreen?.();
      setFull(false);
      onOpenOrder?.(id);
    };
  }, [onOpenOrder]);

  const unresolved = places.filter((p) => p.city && !(p.key in geo));
  const located = places.filter((p) => Array.isArray(geo[p.key])).length;

  // Locate cities one by one (OpenStreetMap allows ~1 lookup a second).
  // Restarts only when the places in view change, not on each city found.
  const placesSig = places.map((p) => p.key).join(",");
  useEffect(() => {
    if (!open) return;
    const g = { ...readGeo() };
    const todo = places.filter((p) => p.city && !(p.key in g)).slice(0, 60);
    if (!todo.length) return;
    let stop = false;
    const run = async () => {
      setLocating(true);
      for (const p of todo) {
        if (stop) break;
        if (p.key in g) continue;
        const q = [p.city, p.state, "India"].filter(Boolean).join(", ");
        let hit = null;
        try {
          const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
          const j = await r.json();
          hit = j?.result;
          if (!hit && p.pin) {
            await new Promise((z) => setTimeout(z, 1100));
            const r2 = await fetch(`/api/geocode?q=${encodeURIComponent(`${p.pin}, India`)}`);
            hit = (await r2.json())?.result;
          }
        } catch {}
        g[p.key] = hit && Number.isFinite(hit.lat) ? [hit.lat, hit.lng] : 0;
        writeGeo(g);
        if (!stop) setGeo({ ...g });
        await new Promise((z) => setTimeout(z, 1100));
      }
      if (!stop) setLocating(false);
    };
    run();
    return () => {
      stop = true;
      setLocating(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, placesSig]);

  // Markers: located cities on their spot; the rest grouped on their state.
  const markers = useMemo(() => {
    const out = [];
    const byState = new Map();
    places.forEach((p) => {
      const at = geo[p.key];
      if (Array.isArray(at)) {
        out.push({ ...p, at, approx: false, label: p.city || p.state });
        return;
      }
      const c = STATE_CENTRES[p.sk];
      if (!c) return;
      if (!byState.has(p.sk))
        byState.set(p.sk, { key: `st:${p.sk}`, at: c, approx: true, label: p.state, state: p.state, n: 0, rev: 0, names: [], cities: [], list: [], members: [] });
      const s = byState.get(p.sk);
      s.n += p.n;
      s.rev += p.rev;
      if (s.names.length < 6) s.names.push(...p.names.slice(0, 6 - s.names.length));
      if (p.city) s.cities.push(p.city);
      s.list.push(...p.list.map((x) => ({ ...x, city: p.city })));
      s.members.push(p.key);
    });
    return [...out, ...byState.values()];
  }, [places, geo]);

  // Create the map when first opened.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled) return;
      if (!L || !mapEl.current) {
        setFailed(true);
        return;
      }
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        return;
      }
      const map = L.map(mapEl.current, {
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
        minZoom: 4,
        maxBounds: [
          [2, 62],
          [40, 100],
        ],
      }).setView([22.5, 79], 4);
      map.attributionControl.setPrefix(false);
      const base = MAP_LAYERS[mapLayer] || MAP_LAYERS.streets;
      tileRef.current = L.tileLayer(base.url, {
        maxZoom: 18,
        attribution: base.attribution,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      // Popups: fit inside the map (the order list scrolls), and wire the
      // order cards (open the order) and Track buttons (India Post).
      map.on("popupopen", (ev) => {
        const box = ev.popup.getElement();
        if (!box) return;
        const avail = map.getSize().y - 150;
        box.style.setProperty("--mp-max", `${Math.max(120, Math.min(420, avail))}px`);
        ev.popup.update();
        if (box.dataset.wired) return;
        box.dataset.wired = "1";
        const act = (e) => {
          const t = e.target.closest("[data-track]");
          if (t) {
            e.preventDefault();
            e.stopPropagation();
            const id = t.getAttribute("data-track");
            try {
              navigator.clipboard?.writeText(id);
            } catch {}
            t.textContent = "Copied ✓";
            setTimeout(() => {
              t.textContent = "Track ↗";
            }, 1800);
            window.open("https://www.indiapost.gov.in", "_blank", "noopener,noreferrer");
            return;
          }
          if (e.target.closest("a")) return;
          const card = e.target.closest("[data-oid]");
          if (card && onOpenRef.current) onOpenRef.current(card.getAttribute("data-oid"));
        };
        box.addEventListener("click", act);
        box.addEventListener("keydown", (e) => {
          if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-oid]")) {
            e.preventDefault();
            act(e);
          }
        });
      });
      mapRef.current = map;
      fittedSig.current = "";
      drawSigRef.current = "";
      setGeo((g) => ({ ...g })); // trigger a marker draw
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Street ↔ satellite.
  useEffect(() => {
    const map = mapRef.current;
    const L = typeof window !== "undefined" ? window.L : null;
    if (!map || !L) return;
    const base = MAP_LAYERS[mapLayer];
    if (tileRef.current) map.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(base.url, { maxZoom: 18, attribution: base.attribution }).addTo(map);
    tileRef.current.bringToBack();
  }, [mapLayer]);

  // Leaflet re-measures when entering/leaving full screen.
  useEffect(() => {
    const ids = [60, 300].map((ms, i) =>
      setTimeout(() => {
        try {
          if (i) fitAll();
          else mapRef.current?.invalidateSize();
        } catch {}
      }, ms),
    );
    if (!full || document.fullscreenElement) return () => ids.forEach(clearTimeout);
    // Fallback overlay only: Esc closes it; free the map from the page
    // section's transform so it can cover the whole screen.
    const onKey = (e) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    document.body.classList.add("mo-map-fs-open");
    return () => {
      ids.forEach(clearTimeout);
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("mo-map-fs-open");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full]);
  useEffect(() => {
    if (!open) setFull(false);
  }, [open]);

  // Keep Leaflet in step with the map's height.
  useEffect(() => {
    if (!mapRef.current) return;
    const id = requestAnimationFrame(() => {
      try {
        mapRef.current.invalidateSize();
      } catch {}
    });
    return () => cancelAnimationFrame(id);
  }, [mapH]);

  // Tear the map down when the section closes (its div unmounts).
  useEffect(() => {
    if (open) return;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      layerRef.current = null;
      tileRef.current = null;
    }
  }, [open]);

  // Draw markers whenever the orders in view or locations change.
  useEffect(() => {
    const L = typeof window !== "undefined" ? window.L : null;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    // Redraw only when the pins really change (re-renders, city lookups that
    // don't move a pin, etc. must not close an open popup).
    const drawSig = markers
      .map((m) => `${m.key}@${m.at.join(",")}:${m.n}:${(m.list || []).map((x) => `${x.id}/${x.status}/${x.trk}`).join(";")}`)
      .join("|");
    if (drawSig === drawSigRef.current && layer.getLayers().length) return;
    drawSigRef.current = drawSig;
    // Remember which place's popup is open so it can be reopened.
    let openKey = null;
    markerByKey.current.forEach((mk, k) => {
      if (!openKey && mk.isPopupOpen && mk.isPopupOpen()) openKey = k;
    });
    layer.clearLayers();
    markerByKey.current = new Map();
    const max = Math.max(1, ...markers.map((m) => m.n));
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    markers.forEach((m) => {
      // Round pin with the order count, styled like the order-page pins.
      const size = Math.round(26 + Math.sqrt(m.n / max) * 22);
      const bg = m.approx ? "#64748b" : "#111827";
      const icon = L.divIcon({
        className: "od-pin mo-map-pin",
        html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:#fff;font:700 ${size > 36 ? 14 : 12}px Poppins,sans-serif;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)${m.approx ? ";opacity:.85" : ""}">${m.n}</span>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
      const placeName = m.approx
        ? m.label
        : `${m.label}${m.state && m.state !== m.label ? `, ${m.state}` : ""}`;
      const aria = `${placeName}: ${m.n} order${m.n === 1 ? "" : "s"}, ${inr(m.rev)}. Press Enter for details.`;
      const cm = L.marker(m.at, { icon, riseOnHover: true, keyboard: true, alt: aria });
      const r = size / 2;
      // "Today", "3 days ago", or "2–13 days ago" across this place's orders.
      const ages = (m.list || []).map((x) => daysAgo(x.t)).filter((d) => d != null);
      const lo = ages.length ? Math.min(...ages) : null;
      const hi = ages.length ? Math.max(...ages) : null;
      const ageSpan =
        lo == null
          ? ""
          : lo === hi
            ? ageLabel(lo).toLowerCase()
            : lo === 0
              ? `today to ${hi} day${hi === 1 ? "" : "s"} ago`
              : `${lo}–${hi} days ago`;
      cm.bindTooltip(
        `<b>${esc(placeName)}</b> · ${m.n} order${m.n === 1 ? "" : "s"}${ageSpan ? `<br><span style="opacity:.75">Placed ${esc(ageSpan)} · click for details</span>` : ""}${m.approx ? `<br><span style="opacity:.65">Pinned on the state while cities are located</span>` : ""}`,
        { direction: "top", offset: [0, -r], className: "mo-map-tip" },
      );
      // Popup: every order here with its date and how long ago it was placed.
      const list = [...(m.list || [])].sort((x, y) => y.t - x.t);
      const rows = list
        .slice(0, 15)
        .map((x) => {
          const d = daysAgo(x.t);
          const tone = d == null ? "" : d >= 7 ? " old" : d >= 3 ? " mid" : " new";
          const bks = x.books.slice(0, 3).map((b) => `<li>${esc(b)}</li>`).join("");
          const moreB = x.books.length > 3 ? `<li class="mp-bk-more">+${x.books.length - 3} more</li>` : "";
          const tags = [
            `<span class="mp-tag ${x.cod ? "cod" : "paid"}">${x.cod ? "COD" : "Paid"}</span>`,
            x.express ? `<span class="mp-tag exp">Express</span>` : "",
            x.gift ? `<span class="mp-tag gift">Gift</span>` : "",
          ].join("");
          const phone = x.phone ? `<a href="tel:+91${x.phone}">+91 ${x.phone.slice(0, 5)} ${x.phone.slice(5)}</a>` : "";
          const trk = x.trk
            ? `<div class="mp-trk"><span class="mp-trk-id" title="Tracking ID">${esc(x.trk)}</span><button type="button" class="mp-trk-btn" data-track="${esc(x.trk)}" aria-label="Track ${esc(x.trk)} on India Post — copies the ID and opens India Post">Track ↗</button></div>`
            : `<div class="mp-trk none">No tracking ID yet</div>`;
          return `<li class="mp-o" data-oid="${esc(x.id)}" tabindex="0" role="button" aria-label="Open order of ${esc(x.name)}">
            <div class="mp-top"><b class="mp-name">${esc(x.name)}</b><b class="mp-amt">${inr(x.rev)}</b></div>
            <div class="mp-meta">${phone}${phone && (x.pin || x.area) ? " · " : ""}${esc([m.approx ? x.area : "", x.pin].filter(Boolean).join(" · "))}</div>
            <ul class="mp-books" aria-label="Books">${bks}${moreB}</ul>
            ${trk}
            <div class="mp-foot"><span class="mp-date">${fmtDate(x.t)}</span><span class="mp-age${tone}" title="Days since the order was placed">${d === 0 ? "Placed today" : `${ageLabel(d)}`}</span><span class="mp-st">${esc(x.status)}</span>${tags}</div>
          </li>`;
        })
        .join("");
      const more = list.length > 15 ? `<p class="mp-more">+${list.length - 15} more orders — filter the list to see them all</p>` : "";
      const books = list.reduce((n, x) => n + (x.nBooks || 0), 0);
      cm.bindPopup(
        `<div class="mp" role="dialog" aria-label="${esc(placeName)} orders"><div class="mp-h"><b>${esc(placeName)}</b><span>${m.n} order${m.n === 1 ? "" : "s"} · ${books} book${books === 1 ? "" : "s"} · ${inr(m.rev)}</span>${ageSpan ? `<span class="mp-h-age">Placed ${esc(ageSpan)}</span>` : ""}</div><ul class="mp-list">${rows}</ul>${more}</div>`,
        { className: "mo-map-pop", maxWidth: 360, minWidth: 200, autoPanPadding: [24, 24] },
      );
      cm.on("add", () => {
        const el = cm.getElement();
        if (el) {
          el.setAttribute("role", "button");
          el.setAttribute("aria-label", aria);
        }
      });
      markerByKey.current.set(m.key, cm);
      (m.members || []).forEach((k) => markerByKey.current.set(k, cm));
      cm.addTo(layer);
    });
    if (openKey && markerByKey.current.get(openKey)) {
      const mk = markerByKey.current.get(openKey);
      setTimeout(() => mk.openPopup(), 0);
    }
    // Fit to the markers when the set of places changes (not on every locate).
    const sig = places.map((p) => p.key).join(",");
    if (markers.length && sig !== fittedSig.current) {
      fittedSig.current = sig;
      fitAll();
    }
  }, [markers, places]);

  const top = places[0];
  const maxN = Math.max(1, ...places.map((p) => p.n));
  const focusPlace = (p) => {
    const mk = markerByKey.current.get(p.key);
    const map = mapRef.current;
    if (!mk || !map) return;
    map.flyTo(mk.getLatLng(), Math.max(map.getZoom(), 7), { duration: 0.6 });
    setTimeout(() => mk.openPopup(), 650);
  };
  const shownPlaces = places.slice(0, listN);
  const pct = (a2, b2) => (b2 ? Math.round((a2 / b2) * 100) : 0);

  return (
    <section className={`mo-map${open ? " open" : ""}`}>
      <button type="button" className="mo-map-head" onClick={toggle} aria-expanded={open}>
        <ChevronRight size={16} className="mo-map-chev" />
        <MapPin size={16} />
        <span className="mo-map-title">
          <b>Order map</b>
          <small>
            {stats.total} order{stats.total === 1 ? "" : "s"} · {stats.cities} cit{stats.cities === 1 ? "y" : "ies"} · {stats.states} state{stats.states === 1 ? "" : "s"}
            {top ? ` · most from ${top.city || top.state} (${top.n})` : ""}
          </small>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="mo-map-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={fitAll}
          >
            <div className="mo-map-stats" role="list" aria-label="Order map summary">
              <div role="listitem">
                <b>{stats.total}</b>
                <span>Orders · {inr(stats.rev)}</span>
              </div>
              <div role="listitem">
                <b>{stats.cities}</b>
                <span>Cities · {stats.repeatCities} with 2+ orders</span>
              </div>
              <div role="listitem">
                <b>{stats.states}</b>
                <span>States &amp; UTs</span>
              </div>
              <div role="listitem">
                <b>{stats.topState ? stats.topState.name : "—"}</b>
                <span>
                  Top state{stats.topState ? ` · ${stats.topState.n} (${pct(stats.topState.n, stats.total)}%)` : ""}
                </span>
              </div>
              <div role="listitem">
                <b>{stats.avgAge == null ? "—" : `${stats.avgAge.toFixed(1)} d`}</b>
                <span>Avg order age{stats.oldest != null ? ` · oldest ${stats.oldest} d` : ""}</span>
              </div>
            </div>
            <div className="mo-map-inner">
              <div ref={canvasRef} className={`mo-map-canvas${full ? " full" : ""}`}>
                <div ref={mapEl} className="mo-map-el" style={{ height: mapH }} />
                <div className="mo-map-tools">
                  <button
                    type="button"
                    className="mo-map-layer"
                    onClick={() => setMapLayer((l) => (l === "satellite" ? "streets" : "satellite"))}
                    aria-pressed={mapLayer === "satellite"}
                  >
                    {mapLayer === "satellite" ? "Street map" : "Satellite"}
                  </button>
                  <button
                    type="button"
                    className="mo-map-max"
                    onClick={toggleFull}
                    aria-pressed={full}
                    aria-label={full ? "Exit full screen (Esc)" : "Full-screen map"}
                    title={full ? "Exit full screen (Esc)" : "Full-screen map"}
                  >
                    {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  </button>
                </div>
                <div className="mo-map-legend" aria-hidden="true">
                  <span><i className="ex" /> City</span>
                  <span><i className="ap" /> State (locating)</span>
                  <span>Size = orders</span>
                </div>
                {failed && <p className="mo-map-note">Couldn&apos;t load the map. Check your connection and reopen.</p>}
                {(locating || unresolved.length > 0) && !failed && (
                  <span className="mo-map-status">
                    <Loader2 size={12} className="vz-spin" /> Locating cities · {located} of {places.filter((p) => p.city).length}
                  </span>
                )}
                <button
                  type="button"
                  className="mo-map-grip"
                  onPointerDown={startResize}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      nudgeH(40);
                    } else if (e.key === "ArrowUp") {
                      e.preventDefault();
                      nudgeH(-40);
                    }
                  }}
                  aria-label="Resize map — drag, or use the arrow keys"
                  title="Drag to resize"
                >
                  <GripHorizontal size={18} />
                </button>
              </div>
              <div className="mo-map-side" style={{ maxHeight: mapH + 22 }}>
                <ol className="mo-map-list" aria-label="Cities by number of orders">
                  {shownPlaces.map((p) => {
                    const dn = daysAgo(p.newest);
                    const dOld = daysAgo(p.oldest);
                    return (
                      <li key={p.key}>
                        <button
                          type="button"
                          onClick={() => focusPlace(p)}
                          aria-label={`${p.city || p.state}, ${p.state}: ${p.n} orders. Show on map.`}
                        >
                          <span className="mo-map-place">
                            <b>{p.city || "—"}</b>
                            <small>
                              {p.state}
                              {p.newest ? ` · ${p.n > 1 && dOld !== dn ? `${dn}–${dOld} d ago` : ageLabel(dn)}` : ""}
                            </small>
                          </span>
                          <span className="mo-map-bar" aria-hidden="true">
                            <i style={{ width: `${(p.n / maxN) * 100}%` }} />
                          </span>
                          <span className="mo-map-n">{p.n}</span>
                        </button>
                      </li>
                    );
                  })}
                  {!places.length && <li className="mo-map-more">No orders in view.</li>}
                </ol>
                {places.length > 4 && (
                  <div className="mo-map-more-row">
                    {listN < places.length && (
                      <button type="button" className="mo-map-all" onClick={() => setListN((n) => n + 20)}>
                        Show {Math.min(20, places.length - listN)} more cit{Math.min(20, places.length - listN) === 1 ? "y" : "ies"}
                        <em>{places.length - listN} left</em>
                      </button>
                    )}
                    {listN > 4 && (
                      <button type="button" className="mo-map-all ghost" onClick={() => setListN(4)}>
                        Show less
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
