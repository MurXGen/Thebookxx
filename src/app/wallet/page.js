"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Wallet, ArrowLeft, Clock, Gift, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import { getSavedPhone } from "@/utils/userPhone";
import { fetchWalletLedger, WALLET_TTL_DAYS } from "@/utils/walletLedger";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

const fmtDateTime = (d) =>
  d
    ? `${new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} · ${new Date(d).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`
    : "";

export default function WalletPage() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [ledger, setLedger] = useState(null);
  const [filter, setFilter] = useState("all"); // all | credit | debit
  const [name, setName] = useState("");

  useEffect(() => {
    const p = getSavedPhone();
    setPhone(p);
    try {
      const nm =
        localStorage.getItem("track_orders_name") ||
        JSON.parse(localStorage.getItem("checkoutAddress") || "null")?.name ||
        "";
      setName(String(nm || "").trim());
    } catch (_) {}
    if (!p) {
      setLoading(false);
      return;
    }
    (async () => {
      const led = await fetchWalletLedger(p);
      setLedger(led);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      <Navbar />
      <main className="section-680 wallet-page" style={{ padding: "16px 16px 80px" }}>
        <Link href="/profile" className="wallet-back">
          <ArrowLeft size={18} /> Back to profile
        </Link>

        {/* Balance card (white) */}
        <motion.div
          className="wallet-hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="wallet-hero-top">
            <div className="wallet-hero-ic">
              <Wallet size={22} />
            </div>
            <div className="wallet-hero-id">
              <span className="wallet-hero-label">TheBookX Wallet</span>
              {name && <span className="wallet-hero-name">{name}</span>}
            </div>
          </div>
          <div className="wallet-hero-balrow">
            <span className="wallet-hero-balance">
              ₹{ledger ? ledger.balance : 0}
            </span>
            <span className="wallet-hero-baltag">Available balance</span>
          </div>
          <div className="wallet-benefits">
            <div className="wallet-benefit">
              <Check size={15} /> Use on any order — no minimum
            </div>
            <div className="wallet-benefit">
              <Clock size={15} /> Valid for {WALLET_TTL_DAYS} days from credit
            </div>
            <div className="wallet-benefit">
              <Gift size={15} /> Earn coins with scratch cards at checkout
            </div>
          </div>
        </motion.div>

        {!phone && !loading && (
          <div className="wallet-empty">
            <p>Enter your mobile number to see your wallet balance and history.</p>
            <Link href="/profile" className="pri-big-btn" style={{ marginTop: 12 }}>
              Go to profile
            </Link>
          </div>
        )}

        {loading && phone && (
          <div className="wallet-skel">
            <div className="skel" style={{ height: 60, borderRadius: 12 }} />
            <div className="skel" style={{ height: 60, borderRadius: 12 }} />
            <div className="skel" style={{ height: 60, borderRadius: 12 }} />
          </div>
        )}

        {ledger && ledger.expiringSoon > 0 && (
          <div className="wallet-expiry-warn">
            <AlertTriangle size={16} />
            <span>
              <strong>₹{ledger.expiringSoon}</strong> will expire on{" "}
              <strong>{fmtDate(ledger.expiringDate)}</strong>. Use it before then
              so you don&apos;t lose it.
            </span>
          </div>
        )}

        {ledger && ledger.history.length > 0 && (
          <div className="wallet-history">
            <h2 className="wallet-h2">Transaction history</h2>

            {/* Filter chips (like the ride-history filter) */}
            <div className="wallet-filter">
              {[
                { k: "all", label: "All" },
                { k: "credit", label: "Credited" },
                { k: "debit", label: "Used" },
              ].map((f) => (
                <button
                  key={f.k}
                  type="button"
                  className={`wallet-chip${filter === f.k ? " on" : ""}`}
                  onClick={() => setFilter(f.k)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="wallet-txn-list">
              {ledger.history
                .filter((h) => filter === "all" || h.type === filter)
                .map((h, i) => (
                  <div key={i} className="wallet-txn">
                    <span
                      className={`wallet-txn-ic ${h.type === "credit" ? "cr" : "db"}`}
                    >
                      {h.type === "credit" ? (
                        <ArrowDownCircle size={20} />
                      ) : (
                        <ArrowUpCircle size={20} />
                      )}
                    </span>
                    <div className="wallet-txn-mid">
                      <span className="wallet-txn-title">
                        {h.reason ||
                          (h.type === "credit"
                            ? "Reward credited"
                            : "Used on order")}
                      </span>
                      <span className="wallet-txn-date">
                        {fmtDateTime(h.date)}
                      </span>
                      {h.type === "credit" && h.expires && (
                        <span className="wallet-txn-exp">
                          Expires {fmtDate(h.expires)}
                        </span>
                      )}
                    </div>
                    <span
                      className={`wallet-txn-amt ${h.type === "credit" ? "cr" : "db"}`}
                    >
                      {h.type === "credit" ? "+" : "−"}₹{Math.abs(h.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {ledger && ledger.history.length === 0 && (
          <div className="wallet-empty">
            <Gift size={30} style={{ color: "var(--tertiary)" }} />
            <p>No wallet activity yet. Earn coins with scratch cards at checkout!</p>
            <Link href="/books" className="pri-big-btn" style={{ marginTop: 12 }}>
              Shop books
            </Link>
          </div>
        )}

        <div className="wallet-info-row">
          <Clock size={14} />
          <span>Coins expire {WALLET_TTL_DAYS} days after they are credited.</span>
        </div>
      </main>
    </>
  );
}
