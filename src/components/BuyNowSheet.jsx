"use client";

// "Buy now" on a book page: a slide-up that asks how many copies and the same
// add-ons as the bag (bookmarks, Faster / Thunder delivery, gift wrap), then
// opens checkout with ONLY this book — the rest of the bag isn't touched
// (StoreContext.startBuyNow swaps it out and restores it afterwards).

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Gift, Check, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import BagAddons, { BAG_ADDONS_KEY, BAG_BOOKMARK_UNIT } from "@/components/BagAddons";
import { getDeliveryCharge } from "@/utils/cartOffers";
import { deliveryWindows, windowText, isFastRegion } from "@/lib/deliveryEta";
import { isThunderPincode, thunderCharge, thunderEta } from "@/lib/thunderDelivery";
import { trackEvent } from "@/lib/ga";

const noopSub = () => () => {};
const MAX_QTY = 10;

function readPin() {
  try {
    return {
      pincode: String(localStorage.getItem("delivery_pincode") || "").replace(/\D/g, ""),
      city: localStorage.getItem("delivery_city") || "",
      state: localStorage.getItem("delivery_state") || "",
    };
  } catch {
    return { pincode: "", city: "", state: "" };
  }
}

export default function BuyNowSheet({ open, book, onClose }) {
  const router = useRouter();
  const { startBuyNow } = useStore();
  const mounted = useSyncExternalStore(noopSub, () => true, () => false);
  const [qty, setQty] = useState(1);
  const [bookmarks, setBookmarks] = useState(0);
  const [faster, setFaster] = useState(false);
  const [thunder, setThunder] = useState(false);
  const [gift, setGift] = useState(false);
  const [pin, setPin] = useState({ pincode: "", city: "", state: "" });

  // Fresh choices each time it opens (add-ons start from the bag's last picks).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setQty(1);
      setPin(readPin());
      try {
        const v = JSON.parse(localStorage.getItem(BAG_ADDONS_KEY) || "null") || {};
        setBookmarks(0);
        setFaster(!!v.faster);
        setThunder(!!v.thunder);
      } catch {
        /* ignore */
      }
      setGift(false);
    }, 0);
    const esc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", esc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", esc);
    };
  }, [open, onClose]);

  if (!mounted || !book) return null;

  const price = Number(book.discountedPrice) || 0;
  const oneRupee = price === 1;
  const stock = Number(book.stock ?? MAX_QTY);
  const maxQty = oneRupee ? 1 : Math.max(1, Math.min(MAX_QTY, stock || MAX_QTY));
  const subtotal = price * qty;
  const minOrder = oneRupee ? 199 : 99;
  const belowMin = subtotal < minOrder;

  // Same rules as the bag.
  const stdFee = getDeliveryCharge(subtotal, false, oneRupee);
  const fasterFee = getDeliveryCharge(subtotal, true, oneRupee);
  const thunderOk = isThunderPincode(pin.pincode);
  const thunderOn = faster && thunder && thunderOk;
  const thunderFee = thunderCharge(stdFee, [{ weight: book.weight, qty }]);
  const deliveryFee = thunderOn ? thunderFee : faster ? fasterFee : stdFee;
  const freeBookmarks = subtotal >= 1000 ? 4 : subtotal >= 500 ? 3 : 2;
  const bookmarkFee = Math.max(0, bookmarks - freeBookmarks) * BAG_BOOKMARK_UNIT;
  const giftFee = gift ? (subtotal > 500 ? 35 : 15) : 0;
  const total = subtotal + deliveryFee + bookmarkFee + giftFee;
  const tEta = thunderEta();
  const win = deliveryWindows(pin);
  const mh = /^4[0-4]/.test(pin.pincode) && !pin.pincode.startsWith("403");
  const stdEta = pin.pincode.length === 6 ? (mh ? "1–5 days" : isFastRegion(pin) ? "4–9 days" : windowText(win.standard)) : "4–9 days";

  const go = () => {
    if (belowMin) return;
    try {
      localStorage.setItem(
        BAG_ADDONS_KEY,
        JSON.stringify({ bookmarks, faster, thunder: faster && thunder }),
      );
      sessionStorage.setItem("tbx_bag_gift", gift ? "1" : "0");
    } catch {
      /* ignore */
    }
    trackEvent("buy_now_checkout", { book_id: book.id, qty, faster, thunder: thunderOn });
    startBuyNow(book.id, qty);
    onClose?.();
    // Straight to checkout: the bag opens the address step on ?checkout=1.
    router.push("/bag?checkout=1");
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="buy-now"
          className="cdp-back cdp-back-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cdp psh psh-full bnw"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bnw-h"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="cdp-x" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
            <h3 id="bnw-h">Buy now</h3>
            <p>Only this book goes to checkout. Your bag stays as it is.</p>

            <div className="bnw-book">
              {book.image && <img src={book.image} alt="" className="bnw-cover" />}
              <span className="bnw-info">
                <b>{book.name}</b>
                {book.author && <small>{book.author}</small>}
                <span className="bnw-price">
                  ₹{price}
                  {book.originalPrice > price && <s>₹{book.originalPrice}</s>}
                </span>
              </span>
              <span className="bga-stepper bnw-qty" role="group" aria-label="Quantity">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="One less">
                  <Minus size={14} />
                </button>
                <span className="bga-step-n" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  aria-label="One more"
                >
                  <Plus size={14} />
                </button>
              </span>
            </div>
            {oneRupee && <p className="bnw-note">₹1 books: one copy per order.</p>}

            <div className="bnw-addons">
              <BagAddons
                bookmarks={bookmarks}
                onBookmarks={setBookmarks}
                freeBookmarks={freeBookmarks}
                faster={faster && !thunderOn}
                onFaster={(on) => {
                  setFaster(on);
                  setThunder(false);
                }}
                thunderAvailable={thunderOk}
                thunder={thunderOn}
                onThunder={(on) => {
                  setFaster(on);
                  setThunder(on);
                }}
                thunderFee={Math.max(0, thunderFee - stdFee)}
                thunderName={tEta.name}
                thunderDate={tEta.days === 1 ? `tomorrow, ${tEta.dateText}` : tEta.dateText}
                standardFee={stdFee}
                fasterFee={fasterFee}
                standardEta={stdEta}
                fasterEta={windowText(win.faster)}
              />
              <button
                type="button"
                role="checkbox"
                aria-checked={gift}
                className={`bga-fast bnw-gift${gift ? " on" : ""}`}
                onClick={() => setGift((g) => !g)}
              >
                <span className="bga-fast-txt">
                  <b>
                    Pack this as a gift <Gift size={15} aria-hidden="true" />
                  </b>
                  <small>Gift wrap with a note · +₹{subtotal > 500 ? 35 : 15}</small>
                </span>
                <span className="bga-check" aria-hidden="true">
                  {gift && <Check size={13} strokeWidth={3.5} />}
                </span>
              </button>
            </div>

            <ul className="psh-bill bnw-bill">
              <li>
                <span>
                  Book{qty > 1 ? ` × ${qty}` : ""}
                </span>
                <b>₹{subtotal}</b>
              </li>
              <li>
                <span>{thunderOn ? tEta.name : faster ? "Faster delivery" : "Delivery"}</span>
                <b>{deliveryFee > 0 ? `+₹${deliveryFee}` : "FREE"}</b>
              </li>
              {bookmarkFee > 0 && (
                <li>
                  <span>Extra bookmarks</span>
                  <b>+₹{bookmarkFee}</b>
                </li>
              )}
              {giftFee > 0 && (
                <li>
                  <span>Gift wrap</span>
                  <b>+₹{giftFee}</b>
                </li>
              )}
              <li className="is-total">
                <span>Estimated total</span>
                <b>₹{total}</b>
              </li>
            </ul>

            {belowMin && (
              <p className="bnw-note is-warn">
                {oneRupee
                  ? `₹1 books need ₹${minOrder}+ of books in one order. Add it to your bag with a few more books.`
                  : `Minimum order is ₹${minOrder}. Add one more copy, or add it to your bag with other books.`}
              </p>
            )}
            <button type="button" className="cdp-save" onClick={go} disabled={belowMin} data-no-busy>
              Continue to checkout · ₹{total} <ArrowRight size={17} strokeWidth={2.5} />
            </button>
            <p className="psh-fine bnw-fine">Offers and coupons apply at checkout.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
