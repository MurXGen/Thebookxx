// Signature "fly to cart" micro-interaction (GSAP).
// Clones the book cover and arcs it into the navbar cart icon, then pops it.
import { gsap } from "gsap";

const TARGET_SELECTOR = "#cart-fly-target";

function popCart() {
  const target = document.querySelector(TARGET_SELECTOR);
  if (!target) return;
  target.classList.remove("cart-pop");
  // force reflow so the animation can retrigger
  // eslint-disable-next-line no-unused-expressions
  void target.offsetWidth;
  target.classList.add("cart-pop");
  window.setTimeout(() => target.classList.remove("cart-pop"), 600);
}

/**
 * @param {HTMLElement} sourceEl  the book cover (or its container) to fly from
 * @param {object} opts           { imageSrc }
 */
export function flyToCart(sourceEl, opts = {}) {
  if (typeof window === "undefined") return;
  // Respect reduced-motion preferences.
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    popCart();
    return;
  }
  const target = document.querySelector(TARGET_SELECTOR);
  if (!sourceEl || !target) {
    popCart();
    return;
  }

  // Capture the actual image element so we fly the full, real cover (not a
  // padded/letterboxed wrapper box).
  const imgEl =
    sourceEl.tagName === "IMG" ? sourceEl : sourceEl.querySelector("img");
  const rectEl = imgEl || sourceEl;
  const s = rectEl.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  if (!s.width || !s.height) {
    popCart();
    return;
  }

  const src =
    opts.imageSrc || imgEl?.currentSrc || imgEl?.src;

  const clone = document.createElement(src ? "img" : "div");
  if (src) clone.src = src;
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${s.left}px`,
    top: `${s.top}px`,
    width: `${s.width}px`,
    height: `${s.height}px`,
    borderRadius: "10px",
    objectFit: "cover",
    zIndex: "99999",
    pointerEvents: "none",
    boxShadow: "0 14px 34px rgba(0,0,0,0.28)",
    background: "#fff",
    // GPU hints so the tween stays smooth (no layout thrash / jank).
    willChange: "transform, opacity",
    backfaceVisibility: "hidden",
    transform: "translateZ(0)",
  });
  document.body.appendChild(clone);

  // Vector to the cart icon.
  const tx = t.left + t.width / 2 - (s.left + s.width / 2);
  const ty = t.top + t.height / 2 - (s.top + s.height / 2);
  // Vector to the screen centre (the "showcase" pose).
  const cx = window.innerWidth / 2 - (s.left + s.width / 2);
  const cy = window.innerHeight / 2 - (s.top + s.height / 2);

  const tl = gsap.timeline({
    defaults: { transformOrigin: "50% 50%", force3D: true },
    onComplete: () => {
      clone.remove();
      popCart();
    },
  });

  // 1) Glide smoothly from exactly where it was clicked to the screen centre,
  //    growing along the way (fromTo pins the start so it never snaps).
  tl.fromTo(
    clone,
    { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 },
    {
      duration: 0.7,
      x: cx,
      y: cy,
      scale: 1.32,
      ease: "power3.out",
    },
  )
    // 2) Hold for a beat with a gentle settle.
    .to(clone, { duration: 0.22, scale: 1.26, ease: "sine.inOut" })
    // 3) Dunk into the cart icon, shrinking + fading.
    .to(clone, {
      duration: 0.6,
      x: tx,
      y: ty,
      scale: 0.1,
      rotation: 12,
      opacity: 0.35,
      ease: "power2.in",
    });
}
