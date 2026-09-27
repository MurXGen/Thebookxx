"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  Check,
  X,
  MapPin,
  Pencil,
  StickyNote,
  Truck,
  Zap,
  Plus,
  Minus,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { books as ALL_BOOKS } from "@/utils/book";
import { getDeliveryCharge } from "@/utils/cartOffers";
import { updateOrderRow } from "@/utils/googleFormOrder";
import { encodeAddonsField, BOOKMARK_UNIT } from "@/utils/addonsField";
import { showToast } from "@/context/ToastContext";

const slugify = (t) =>
  String(t || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ADD_DISCOUNT = 0.3; // flat 30% off books added from this modal

// Build the sheet "Books List" string from an array of line items.
const buildBooksList = (items) =>
  items
    .map(
      (b, i) =>
        `${i + 1}. ${b.name} | Qty: ${b.qty} | ₹${b.price} each | Total: ₹${
          b.price * b.qty
        }`,
    )
    .join("\n");

export default function OrderSuccessCard({
  orderId,
  phone = "",
  name = "",
  address = { address: "", city: "", state: "", pincode: "" },
  books = [], // [{ id, name, image, qty, price }]
  baseTotal = 0,
  faster = false,
  bookmarkQty = 0,
  freeBookmarks = 2,
  onTrack,
  onClose,
}) {
  const digits = String(phone || "").replace(/\D/g, "").slice(-10);

  // Live, adjustable order snapshot (starts from what was placed).
  const [total, setTotal] = useState(Number(baseTotal) || 0);
  const [isFaster, setIsFaster] = useState(!!faster);
  const [bmQty, setBmQty] = useState(Number(bookmarkQty) || 0);
  const [committedBm, setCommittedBm] = useState(Number(bookmarkQty) || 0);
  const [added, setAdded] = useState([]); // [{ id, name, price, qty }]
  const [addedIds, setAddedIds] = useState(() => new Set());
  const [savingKey, setSavingKey] = useState("");

  // Sub-sheets
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const [addr, setAddr] = useState({
    address: address.address || "",
    city: address.city || "",
    state: address.state || "",
    pincode: address.pincode || "",
    phone: digits,
  });
  const [addrView, setAddrView] = useState({ ...address, phone: digits });

  const orderValue = useMemo(
    () => books.reduce((s, b) => s + (b.price || 0) * (b.qty || 1), 0),
    [books],
  );
  const hasOneRupee = books.some((b) => Number(b.price) === 1);
  const upgradeExtra = useMemo(() => {
    const std = getDeliveryCharge(orderValue, false, hasOneRupee);
    const fst = getDeliveryCharge(orderValue, true, hasOneRupee);
    return Math.max(0, fst - std);
  }, [orderValue, hasOneRupee]);

  // Bestsellers to upsell (exclude what's already in the order / added).
  const inOrder = useMemo(
    () => new Set(books.map((b) => b.id)),
    [books],
  );
  const bestsellers = useMemo(
    () =>
      ALL_BOOKS.filter(
        (b) =>
          b.image &&
          Number(b.discountedPrice) > 1 &&
          (b.catalogue || []).includes("bestseller") &&
          !inOrder.has(b.id),
      ).slice(0, 14),
    [inOrder],
  );

  const fullList = () =>
    buildBooksList([
      ...books.map((b) => ({ name: b.name, price: b.price, qty: b.qty || 1 })),
      ...added.map((b) => ({ name: b.name, price: b.price, qty: b.qty })),
    ]);

  // ── Actions ──────────────────────────────────────────────────────────
  const saveNote = async () => {
    const t = note.trim();
    setSavingKey("note");
    try {
      await updateOrderRow(orderId, { "Order Comment": t });
      setNoteSaved(true);
      setNoteOpen(false);
      showToast("Note added to your order 📝", "success");
    } catch {
      showToast("Couldn't save the note. Try again.", "error");
    } finally {
      setSavingKey("");
    }
  };

  const saveAddr = async () => {
    setSavingKey("addr");
    const fields = {
      Address: addr.address.trim(),
      City: addr.city.trim(),
      State: addr.state.trim(),
      Pincode: addr.pincode.trim(),
    };
    const p = addr.phone.replace(/\D/g, "").slice(-10);
    if (p.length === 10) fields["Phone Number"] = p;
    try {
      await updateOrderRow(orderId, fields);
      setAddrView({
        address: fields.Address,
        city: fields.City,
        state: fields.State,
        pincode: fields.Pincode,
        phone: p.length === 10 ? p : addrView.phone,
      });
      setAddrOpen(false);
      showToast("Delivery details updated ✅", "success");
    } catch {
      showToast("Couldn't update details. Try again.", "error");
    } finally {
      setSavingKey("");
    }
  };

  const applyFaster = async () => {
    if (isFaster || !upgradeExtra) return;
    setSavingKey("faster");
    const fasterCharge = getDeliveryCharge(orderValue, true, hasOneRupee);
    const newTotal = total + upgradeExtra;
    try {
      await updateOrderRow(orderId, {
        "Delivery Type": "Faster Delivery",
        "Delivery Charge": String(fasterCharge),
        "Total Amount": String(newTotal),
      });
      setIsFaster(true);
      setTotal(newTotal);
      showToast(`Upgraded to faster delivery ⚡ (+₹${upgradeExtra})`, "success");
    } catch {
      showToast("Couldn't upgrade. Try again.", "error");
    } finally {
      setSavingKey("");
    }
  };

  const packBookmarks = async () => {
    setSavingKey("bm");
    const prevCharge = Math.max(0, committedBm - freeBookmarks) * BOOKMARK_UNIT;
    const newCharge = Math.max(0, bmQty - freeBookmarks) * BOOKMARK_UNIT;
    const newTotal = total - prevCharge + newCharge;
    try {
      await updateOrderRow(orderId, {
        "Gift Wrap": encodeAddonsField({
          giftOn: false,
          bookmarkQty: bmQty,
          bookmarkFree: Math.min(bmQty, freeBookmarks),
        }),
        "Total Amount": String(newTotal),
      });
      setCommittedBm(bmQty);
      setTotal(newTotal);
      showToast(`${bmQty} bookmark${bmQty > 1 ? "s" : ""} added 🔖`, "success");
    } catch {
      showToast("Couldn't add bookmarks. Try again.", "error");
    } finally {
      setSavingKey("");
    }
  };

  const toggleAddBook = (b) => {
    setAddedIds((prev) => {
      const next = new Set(prev);
      if (next.has(b.id)) {
        next.delete(b.id);
        setAdded((a) => a.filter((x) => x.id !== b.id));
      } else {
        next.add(b.id);
        setAdded((a) => [
          ...a,
          {
            id: b.id,
            name: b.name,
            qty: 1,
            price: Math.round(Number(b.discountedPrice) * (1 - ADD_DISCOUNT)),
          },
        ]);
      }
      return next;
    });
  };

  const packAddedBooks = async () => {
    if (!added.length) return;
    setSavingKey("books");
    const addSum = added.reduce((s, b) => s + b.price * b.qty, 0);
    // total already includes previously-committed added books; recompute from base.
    const baseNoAdd = total; // current total is source of truth; add only the new delta
    const newTotal = baseNoAdd + addSum;
    try {
      await updateOrderRow(orderId, {
        "Books List": fullList(),
        "Total Amount": String(newTotal),
      });
      setTotal(newTotal);
      // Fold added into the order so further adds append correctly.
      books.push(...added.map((b) => ({ ...b })));
      setAdded([]);
      setAddedIds(new Set());
      showToast(`Added to your package 🎉 · +₹${addSum}`, "success");
    } catch {
      showToast("Couldn't add the books. Try again.", "error");
    } finally {
      setSavingKey("");
    }
  };

  if (typeof document === "undefined") return null;

  const addrLine = [
    addrView.address,
    addrView.city,
    addrView.state,
    addrView.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return createPortal(
    <motion.div
      className="bill-modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 99990 }}
    >
      <motion.div
        className="bill-modal osc-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="osc-head">
          <span className="osc-tick">
            <Check size={18} strokeWidth={3} />
          </span>
          <div className="osc-head-txt">
            <span className="osc-head-title">Order confirmed 🎉</span>
            <span className="osc-head-sub">
              {orderId ? `Order ${orderId}` : "Your order is placed"}
            </span>
          </div>
          <button
            type="button"
            className="osc-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="osc-body">
          {/* Delivery-to notice */}
          <div className="osc-deliver">
            <div className="osc-deliver-head">
              <span className="osc-deliver-cap">
                <MapPin size={13} /> Delivering to
              </span>
              <button
                type="button"
                className="osc-edit"
                onClick={() => {
                  setAddr({ ...addr, ...addrView, phone: addrView.phone });
                  setAddrOpen(true);
                }}
              >
                <Pencil size={13} /> Edit
              </button>
            </div>
            <div className="osc-deliver-name">{name || "Customer"}</div>
            <div className="osc-deliver-phone">+91 {addrView.phone || digits}</div>
            <div className="osc-deliver-addr">{addrLine}</div>
            <div className="osc-deliver-note">
              Please make sure your address &amp; number are correct for a
              smooth, successful delivery.
            </div>
          </div>

          {/* Quick actions */}
          <div className="osc-actions">
            <button
              type="button"
              className="osc-action"
              onClick={() => setNoteOpen(true)}
            >
              <StickyNote size={16} />
              {noteSaved ? "Note added" : "Add note"}
            </button>
            <button
              type="button"
              className="osc-action osc-action-dark"
              onClick={onTrack}
            >
              <Truck size={16} /> Track order
            </button>
          </div>

          {/* Faster delivery upgrade */}
          {!isFaster && upgradeExtra > 0 && (
            <div className="osc-up">
              <div className="osc-up-ic">
                <Zap size={18} />
              </div>
              <div className="osc-up-main">
                <span className="osc-up-title">
                  Get it faster — upgrade for ₹{upgradeExtra}
                </span>
                <span className="osc-up-sub">
                  Delivered in <b>1–5 days</b> instead of 4–9 · priority
                  dispatch by air · same books, sooner.
                </span>
              </div>
              <button
                type="button"
                className="osc-up-btn"
                disabled={savingKey === "faster"}
                onClick={applyFaster}
              >
                {savingKey === "faster" ? "…" : "Upgrade"}
              </button>
            </div>
          )}
          {isFaster && (
            <div className="osc-up osc-up-done">
              <div className="osc-up-ic">
                <Zap size={18} />
              </div>
              <div className="osc-up-main">
                <span className="osc-up-title">Faster delivery added ⚡</span>
                <span className="osc-up-sub">Arriving in 1–5 days.</span>
              </div>
            </div>
          )}

          {/* Bookmarks */}
          <div className="osc-bm">
            <div className="osc-bm-main">
              <span className="osc-bm-title">
                <BookOpen size={15} /> Bookmarks
              </span>
              <span className="osc-bm-sub">
                {freeBookmarks} free · +₹{BOOKMARK_UNIT} each beyond
              </span>
            </div>
            <div className="osc-stepper">
              <button
                type="button"
                onClick={() => setBmQty((q) => Math.max(0, q - 1))}
                disabled={bmQty === 0}
                aria-label="Fewer bookmarks"
              >
                <Minus size={15} />
              </button>
              <span>{bmQty}</span>
              <button
                type="button"
                onClick={() => setBmQty((q) => q + 1)}
                aria-label="More bookmarks"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
          {bmQty !== committedBm && (
            <button
              type="button"
              className="osc-pack-btn"
              disabled={savingKey === "bm"}
              onClick={packBookmarks}
            >
              {savingKey === "bm"
                ? "Adding…"
                : `Pack ${bmQty} bookmark${bmQty === 1 ? "" : "s"}${
                    Math.max(0, bmQty - freeBookmarks) > 0
                      ? ` · +₹${Math.max(0, bmQty - freeBookmarks) * BOOKMARK_UNIT}`
                      : " · free"
                  }`}
            </button>
          )}

          {/* Bestsellers — flat 30% off, add before packing */}
          {bestsellers.length > 0 && (
            <div className="osc-sell">
              <div className="osc-sell-head">
                <span className="osc-sell-title">
                  ✨ Add before we pack — <b>flat 30% off</b>
                </span>
                <span className="osc-sell-sub">
                  Only at this step. Ships together, nothing extra to pay online.
                </span>
              </div>
              <div className="osc-sell-row">
                {bestsellers.map((b) => {
                  const off = Math.round(
                    Number(b.discountedPrice) * (1 - ADD_DISCOUNT),
                  );
                  const on = addedIds.has(b.id);
                  return (
                    <div className="osc-card" key={b.id}>
                      <a
                        href={`/books/${slugify(b.name)}`}
                        className="osc-card-cover"
                        onClick={(e) => e.preventDefault()}
                      >
                        <img src={b.image} alt={b.name} loading="lazy" />
                        <span className="osc-card-off">30%</span>
                      </a>
                      <span className="osc-card-name">{b.name}</span>
                      <span className="osc-card-price">
                        ₹{off}
                        <s>₹{b.discountedPrice}</s>
                      </span>
                      <button
                        type="button"
                        className={`osc-card-add${on ? " on" : ""}`}
                        onClick={() => toggleAddBook(b)}
                      >
                        {on ? (
                          <>
                            <Check size={13} /> Added
                          </>
                        ) : (
                          <>
                            <Plus size={13} /> Add
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
              {added.length > 0 && (
                <button
                  type="button"
                  className="osc-pack-btn osc-pack-books"
                  disabled={savingKey === "books"}
                  onClick={packAddedBooks}
                >
                  {savingKey === "books"
                    ? "Adding…"
                    : `Add ${added.length} book${
                        added.length === 1 ? "" : "s"
                      } into the package · +₹${added.reduce(
                        (s, b) => s + b.price * b.qty,
                        0,
                      )}`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="osc-foot">
          <div className="osc-foot-total">
            <span>Order total</span>
            <b>₹{total}</b>
          </div>
          <button type="button" className="osc-foot-cta" onClick={onTrack}>
            Track order <ArrowRight size={17} />
          </button>
        </div>

        {/* Note sub-sheet */}
        <AnimatePresence>
          {noteOpen && (
            <>
              <motion.div
                className="osc-sub-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNoteOpen(false)}
              />
              <motion.div
                className="osc-sub"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              >
                <div className="osc-sub-title">Add a note to your order</div>
                <p className="osc-sub-sub">
                  Anything we should know — gift message, delivery instruction,
                  landmark…
                </p>
                <textarea
                  className="osc-sub-input"
                  rows={3}
                  placeholder="e.g. Please call before delivery, leave with the guard…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  type="button"
                  className="osc-sub-save"
                  disabled={savingKey === "note" || !note.trim()}
                  onClick={saveNote}
                >
                  {savingKey === "note" ? "Saving…" : "Save note"}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Address edit sub-sheet */}
        <AnimatePresence>
          {addrOpen && (
            <>
              <motion.div
                className="osc-sub-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAddrOpen(false)}
              />
              <motion.div
                className="osc-sub"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              >
                <div className="osc-sub-title">Edit delivery details</div>
                <input
                  className="osc-sub-field"
                  placeholder="Phone number"
                  inputMode="numeric"
                  value={addr.phone}
                  onChange={(e) =>
                    setAddr((a) => ({ ...a, phone: e.target.value }))
                  }
                />
                <textarea
                  className="osc-sub-field"
                  rows={2}
                  placeholder="Full address"
                  value={addr.address}
                  onChange={(e) =>
                    setAddr((a) => ({ ...a, address: e.target.value }))
                  }
                />
                <div className="osc-sub-grid3">
                  <input
                    className="osc-sub-field"
                    placeholder="City"
                    value={addr.city}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, city: e.target.value }))
                    }
                  />
                  <input
                    className="osc-sub-field"
                    placeholder="State"
                    value={addr.state}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, state: e.target.value }))
                    }
                  />
                  <input
                    className="osc-sub-field"
                    placeholder="Pincode"
                    inputMode="numeric"
                    value={addr.pincode}
                    onChange={(e) =>
                      setAddr((a) => ({ ...a, pincode: e.target.value }))
                    }
                  />
                </div>
                <button
                  type="button"
                  className="osc-sub-save"
                  disabled={savingKey === "addr"}
                  onClick={saveAddr}
                >
                  {savingKey === "addr" ? "Saving…" : "Save details"}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body,
  );
}
