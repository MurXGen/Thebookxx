// tools/gen-mo-mono.mjs
// -----------------------------------------------------------------------------
// Generates src/app/manage-orders/manage-orders-mono.css.
//
// The /manage-orders console is styled by ~2k rules in globals.css that
// hard-code the storefront palette (brand orange, white panels, grey text).
// Re-pointing the CSS variables only reaches the rules that use variables, so
// this script walks every globals.css rule whose classes appear in the page
// and emits a page-scoped override with each literal colour remapped onto the
// monochrome tokens defined in manage-orders-ui.css:
//
//   • brand orange / amber            → the ink accent (both themes)
//   • white text on an accent / ink fill → --g-on-accent (both themes)
//   • pale blue / violet / pink panels → neutral surface (both themes);
//                                        red & green tints keep their meaning
//   • white / light-grey surfaces     → dark surfaces   (dark theme only)
//   • dark-grey text, light borders   → dark ink / hairlines (dark theme only)
//   • pale status tints, dark status text → dark-friendly tints (dark only)
//   • existing `.mo-dark` rules       → warm/blue-black greys neutralised
//   • gradients                        → a solid fill (glows and fades to
//                                        transparent removed; dashed
//                                        repeating patterns are kept)
//
// Run after changing globals.css styles used by the console:
//   node tools/gen-mo-mono.mjs
// -----------------------------------------------------------------------------
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GLOBALS = path.join(ROOT, "src/app/globals.css");
const PAGE = path.join(ROOT, "src/app/manage-orders/page.js");
const OUT = path.join(ROOT, "src/app/manage-orders/manage-orders-mono.css");

const COLOR_PROPS =
  /^(color|fill|stroke|background(-color|-image)?|border(-(top|right|bottom|left))?(-color)?|outline(-color)?|text-decoration-color|caret-color|accent-color|column-rule-color)$/;
const COLOR_RE = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\bwhite\b/gi;
// State classes toggled at runtime — never appear as literals in page.js.
const STATE_CLASSES = new Set(["on", "open", "active", "sel", "mo-dark", "mo-glass", "my-orders-page"]);

// ---------- colour maths ----------
function parseColor(str) {
  const s = str.toLowerCase().trim();
  if (s === "white") return { r: 255, g: 255, b: 255, a: 1 };
  if (s.startsWith("#")) {
    let h = s.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join("");
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
  }
  const p = s.replace(/rgba?\(|\)/g, "").split(/[\s,/]+/).filter(Boolean);
  if (p.length < 3) return null;
  const a = p[3] === undefined ? 1 : p[3].endsWith("%") ? parseFloat(p[3]) / 100 : parseFloat(p[3]);
  return { r: +p[0], g: +p[1], b: +p[2], a };
}
function hsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return { h: 0, s: 0, l };
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}
const round = (n) => Math.round(n * 1000) / 1000;
const isBrandWarm = ({ h, s, l }) => h >= 14 && h <= (l > 0.8 ? 52 : 46) && s >= 0.5;

// Replace colours outside var() fallbacks; `fn` returns a replacement or null.
function mapColors(value, fn) {
  const masked = [];
  const v = value.replace(/var\((?:[^()]|\([^()]*\))*\)/g, (m) => `\u0000${masked.push(m) - 1}\u0000`);
  let changed = false;
  const out = v.replace(COLOR_RE, (m) => {
    const c = parseColor(m);
    if (!c) return m;
    const r = fn(c, hsl(c), m);
    if (r == null) return m;
    changed = true;
    return r;
  });
  return changed ? out.replace(/\u0000(\d+)\u0000/g, (_, i) => masked[+i]) : null;
}

// ---------- the mappings ----------
// Semantic hues keep their colour: red (danger) and green (success).
const isSemanticHue = ({ h }) => h < 14 || h > 330 || (h >= 80 && h <= 170);

// Both themes: brand orange family → ink accent; pale decorative panel tints
// (blue / violet / pink) → the neutral sunken surface.
function accentMap(prop, c, x) {
  if (prop.startsWith("background") && !isBrandWarm(x) && !isSemanticHue(x) && x.s >= 0.3 && x.l >= 0.88)
    return "var(--g-sunken)";
  if (/^(border|outline)/.test(prop) && !isBrandWarm(x) && !isSemanticHue(x) && x.s >= 0.3 && x.l >= 0.75)
    return "var(--g-hairline)";
  if (!isBrandWarm(x)) return null;
  if (x.l >= 0.94) return `rgb(var(--g-accent-rgb) / ${round(0.04 * c.a)})`;
  if (x.l >= 0.8) return `rgb(var(--g-accent-rgb) / ${round(0.1 * c.a)})`;
  if (x.l >= 0.65) return `rgb(var(--g-accent-rgb) / ${round(0.3 * c.a)})`;
  return c.a >= 1 ? "var(--g-accent)" : `rgb(var(--g-accent-rgb) / ${round(c.a)})`;
}

// Dark theme only: light-theme literals → dark equivalents.
function darkMap(prop, c, x) {
  if (isBrandWarm(x) || c.a < 0.5) return null;
  const isBg = prop.startsWith("background");
  const isBorder = prop.startsWith("border") || prop.startsWith("outline") || prop.startsWith("column");
  const neutral = x.s < 0.3 || x.l > 0.97;
  if (isBg) {
    if (x.l < 0.8) return null;
    if (neutral) return x.l >= 0.99 ? "var(--g-surface-solid)" : "var(--g-sunken)";
    return isSemanticHue(x) ? `hsl(${Math.round(x.h)} 60% 50% / 0.14)` : "var(--g-sunken)";
  }
  if (isBorder) {
    if (x.l < 0.7) return null;
    return neutral || !isSemanticHue(x) ? "var(--g-hairline)" : `hsl(${Math.round(x.h)} 60% 55% / 0.35)`;
  }
  // text / fill / stroke
  if (x.l >= 0.5) return null;
  if (neutral) return x.l < 0.2 ? "var(--g-ink)" : "var(--g-ink-2)";
  return `hsl(${Math.round(x.h)} ${Math.round(Math.min(x.s, 0.8) * 100)}% 68%)`;
}

// Existing `.mo-dark` rules: tinted near-blacks and warm greys → the
// charcoal tokens. Those rules mostly style tiles nested inside cards, so
// opaque dark fills become the raised surface (never darker than the card).
function neutraliseMap(prop, c, x) {
  if (isBrandWarm(x)) return accentMap(prop, c, x);
  if (x.s < 0.06 || x.l > 0.4 || (x.s > 0.45 && x.l > 0.2)) return null;
  if (prop.startsWith("border") || prop.startsWith("outline")) return "var(--g-hairline)";
  if (!prop.startsWith("background")) return null;
  if (c.a < 1) return `rgb(var(--g-ink-rgb) / ${round(Math.min(c.a, 0.08))})`;
  return x.l < 0.08 ? "var(--g-canvas-1)" : "var(--g-surface-3)";
}

// Gradient → solid. Returns the replacement value, "none", or null to keep.
function flattenGradient(value) {
  if (!/gradient\(/.test(value) || /repeating-/.test(value)) return null;
  if (/radial-gradient\(/.test(value)) return "none";
  const stops = [];
  value.replace(/var\((?:[^()]|\([^()]*\))*\)|#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\btransparent\b/gi, (m) => stops.push(m));
  if (!stops.length) return null;
  const fades = stops.some((m) => m === "transparent" || (/^(#|rgb|white)/i.test(m) && (parseColor(m)?.a ?? 1) < 0.05));
  if (fades) return "none"; // glows, shines, edge fades — all decoration
  return stops[0];
}

// ---------- selectors ----------
function scope(sel, prefix) {
  const s = sel.trim();
  if (/^(:root|html|body)\b/.test(s)) return null;
  if (s.startsWith(".my-orders-page")) return s.replace(".my-orders-page", `.my-orders-page${prefix}`);
  if (prefix === ".mo-glass" && /\.mo-dark\b/.test(s)) return s; // already page-scoped
  return `${prefix} ${s}`;
}

// ---------- run ----------
const page = fs.readFileSync(PAGE, "utf8");
const used = new Set(page.match(/[A-Za-z][\w-]*/g));
const src = postcss.parse(fs.readFileSync(GLOBALS, "utf8"), { from: GLOBALS });

function relevant(rule) {
  for (let p = rule.parent; p; p = p.parent) if (p.type === "atrule" && /keyframes/i.test(p.name)) return false;
  const classes = (rule.selector.match(/\.[A-Za-z][\w-]*/g) || []).map((c) => c.slice(1));
  const real = classes.filter((c) => !STATE_CLASSES.has(c));
  // `some`, not `every`: modifiers are often built at runtime (`st-${st}`).
  // Everything emitted is page-scoped, so extra matches are harmless.
  return real.length > 0 && real.some((c) => used.has(c));
}

// Selector|prop pairs the existing dark rules already handle — leave those alone.
const darkHandled = new Set();
src.walkRules((r) => {
  if (!/\.mo-dark\b/.test(r.selector)) return;
  r.selectors.forEach((s) => {
    const base = s.replace(/\.my-orders-page\.mo-dark|\.mo-dark\s*/g, "").trim();
    r.walkDecls((d) => darkHandled.add(`${base}|${d.prop.replace(/-color$/, "")}`));
  });
});

const outRoot = postcss.root();
const counts = { both: 0, dark: 0 };

function emit(rule, selectors, decls) {
  if (!decls.length || !selectors.length) return;
  let node = postcss.rule({ selectors });
  decls.forEach((d) => node.append(d));
  // Rebuild @media / @supports wrappers.
  for (let p = rule.parent; p && p.type === "atrule"; p = p.parent) {
    node = postcss.atRule({ name: p.name, params: p.params }).append(node);
  }
  outRoot.append(node);
}

src.walkRules((rule) => {
  if (!relevant(rule)) return;
  const isDarkRule = /\.mo-dark\b/.test(rule.selector);
  const both = [];
  const dark = [];
  let accentFill = false;
  let whiteText = null;

  rule.walkDecls((d) => {
    if (!COLOR_PROPS.test(d.prop)) return;
    if (d.prop.startsWith("background") && (/var\(--(tertiary|foreground|dark|primary)\b/.test(d.value) || mapColors(d.value, (c, x) => (isBrandWarm(x) && x.l < 0.65 ? "x" : null))))
      accentFill = true;
    if (d.prop === "color" && /^(#fff|#ffffff|white)$/i.test(d.value.trim())) whiteText = d;

    const fn = isDarkRule ? (c, x) => neutraliseMap(d.prop, c, x) : (c, x) => accentMap(d.prop, c, x);
    const flat = d.prop.startsWith("background") ? flattenGradient(d.value) : null;
    const src = flat ?? d.value;
    const v = mapColors(src, fn) ?? (flat != null ? flat : null);
    const prop = flat && flat !== "none" && d.prop === "background-image" ? "background" : d.prop;
    if (v) both.push(postcss.decl({ prop, value: v, important: d.important }));

    if (!isDarkRule) {
      const base = rule.selectors.map((s) => s.trim());
      if (base.every((s) => darkHandled.has(`${s}|${d.prop.replace(/-color$/, "")}`))) return;
      const dv = mapColors(v || src, (c, x) => darkMap(d.prop, c, x));
      if (dv) dark.push(postcss.decl({ prop, value: dv, important: d.important }));
    }
  });

  if (accentFill && whiteText)
    both.push(postcss.decl({ prop: "color", value: "var(--g-on-accent)", important: whiteText.important }));

  const sBoth = rule.selectors.map((s) => scope(s, ".mo-glass")).filter(Boolean);
  const sDark = rule.selectors.map((s) => scope(s, ".mo-dark")).filter(Boolean);
  if (both.length) { emit(rule, sBoth, both); counts.both++; }
  if (dark.length) { emit(rule, sDark, dark); counts.dark++; }
});

const header = `/* =========================================================================
   manage-orders-mono.css — GENERATED by tools/gen-mo-mono.mjs. Do not edit.
   Remaps the literal colours of globals.css rules used by /manage-orders onto
   the monochrome tokens in manage-orders-ui.css and flattens gradients to
   solid fills. Re-run the script instead.
   ========================================================================= */
`;
fs.writeFileSync(OUT, header + outRoot.toString() + "\n");
console.log(`wrote ${path.relative(ROOT, OUT)} — ${counts.both} theme rules, ${counts.dark} dark-only rules`);
