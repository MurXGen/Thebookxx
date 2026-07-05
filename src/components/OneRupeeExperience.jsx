"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/context/StoreContext";
import { books } from "@/utils/book";
import BookCard from "@/components/BookCard";
import AllBooks from "@/components/AllBooks";
import { Clock, Truck, Wallet, ShieldCheck, Sparkles } from "lucide-react";

/**
 * The /1rupee experience:
 *  - Until a ₹1 book is in the cart, show a slim promo stripe + the ₹1 grid.
 *  - Once a ₹1 book is added, blur-swap to the full AllBooks catalogue so the
 *    shopper can keep adding regular books.
 */
export default function OneRupeeExperience() {
  const { cart } = useStore();

  const oneRupeeBooks = useMemo(
    () => books.filter((b) => b.discountedPrice === 1 && b.stock > 0),
    [],
  );

  const hasOneRupee = cart.some((i) => {
    const b = books.find((x) => x.id === i.id);
    return b?.discountedPrice === 1;
  });

  return (
    <AnimatePresence mode="wait">
      {!hasOneRupee ? (
        <motion.div
          key="promo"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Slim promo stripe */}
          <section className="or-hero">
            <span className="or-spark or-spark-1">✨</span>
            <span className="or-spark or-spark-2">✨</span>

            <div className="or-hero-badge">
              <Clock size={13} /> Limited-time offer
            </div>
            <h1 className="or-hero-title">
              Bestselling books at just <span className="or-price-tag">₹1</span>
            </h1>
            <p className="or-hero-sub">
              Pick a genuine, brand-new book for a single rupee — then add more
              to unlock free delivery across India.
            </p>
            <div className="or-trust">
              <span className="or-trust-item">
                <Truck size={15} /> Free delivery*
              </span>
              <span className="or-trust-item">
                <Wallet size={15} /> Cash on Delivery
              </span>
              <span className="or-trust-item">
                <ShieldCheck size={15} /> 7-day returns
              </span>
            </div>
          </section>

          {/* ₹1 books grid */}
          <section className="or-section">
            <div className="or-grab-head">
              <h2 className="or-grab-title">
                <Sparkles size={16} className="or-section-icon" />
                Grab yours for ₹1
              </h2>
              <span className="or-dash-rule" />
            </div>
            {oneRupeeBooks.length > 0 ? (
              <div className="books-grid or-grid">
                {oneRupeeBooks.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            ) : (
              <p className="or-empty">
                Our ₹1 books are sold out for now — check back soon!
              </p>
            )}
          </section>
        </motion.div>
      ) : (
        <motion.div
          key="all"
          // Opacity-only (no filter): a `filter` on this wrapper would create a
          // containing block and break AllBooks' fixed bottom cart bar.
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <AllBooks />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
