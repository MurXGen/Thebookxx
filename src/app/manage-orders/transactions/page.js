"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  Pin,
  PinOff,
  Trash2,
  Download,
  ArrowUpCircle,
  ArrowDownCircle,
  Pencil,
  Check,
  X,
  User,
  Phone,
  MapPin,
  StickyNote,
} from "lucide-react";

const STORAGE_KEY = "mo_txns";
const OPENING_KEY = "mo_txns_opening";
const BADGES_KEY = "mo_txn_badges";

// Default quick-fill note badges (user-typed notes get added to this list)
const DEFAULT_BADGES = [
  { label: "Delivery charges", type: "expense" },
  { label: "Order income", type: "income" },
  { label: "Extra delivery", type: "expense" },
  { label: "Order cancelled", type: "expense" },
];

export default function TransactionsPage() {
  const [txns, setTxns] = useState([]);
  const [opening, setOpening] = useState(0);
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [tagged, setTagged] = useState(null); // customer tagged in current note
  const [customers, setCustomers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState(null); // string or null
  const [editingBal, setEditingBal] = useState(false);
  const [balInput, setBalInput] = useState("");
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [showNote, setShowNote] = useState(false);
  const [badges, setBadges] = useState(DEFAULT_BADGES);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setTxns(saved);
      const op = parseFloat(localStorage.getItem(OPENING_KEY) || "0");
      if (!Number.isNaN(op)) setOpening(op);
      const cust = JSON.parse(localStorage.getItem("mo_customers") || "[]");
      if (Array.isArray(cust)) setCustomers(cust);
      const bdg = JSON.parse(localStorage.getItem(BADGES_KEY) || "null");
      if (Array.isArray(bdg) && bdg.length) setBadges(bdg);
    } catch {}
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
    } catch {}
  }, [badges]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
    } catch {}
  }, [txns]);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(OPENING_KEY, String(opening));
    } catch {}
  }, [opening]);

  const income = txns
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + (t.amount || 0), 0);
  const expense = txns
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + (t.amount || 0), 0);
  const balance = opening + income - expense;

  // ── @-mention handling ──
  const onNoteChange = (val) => {
    setNote(val);
    const m = val.match(/@([^@]*)$/);
    setMentionQuery(m ? m[1] : null);
  };
  const suggestions =
    mentionQuery === null
      ? []
      : customers
          .filter((c) =>
            c.name.toLowerCase().includes(mentionQuery.toLowerCase().trim()),
          )
          .slice(0, 6);
  const pickMention = (c) => {
    setNote((prev) => prev.replace(/@([^@]*)$/, `@${c.name} `));
    setTagged(c);
    setMentionQuery(null);
  };

  const addTxn = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const cleanNote = note.trim();
    setTxns((prev) => [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type,
        amount: Math.round(amt * 100) / 100,
        note: cleanNote,
        customer: tagged || null,
        ts: Date.now(),
        pinned: false,
      },
      ...prev,
    ]);
    // Remember a brand-new note as a reusable badge (ignore @-mentions)
    const badgeLabel = cleanNote.replace(/@[^@]*$/, "").trim();
    if (
      badgeLabel &&
      badgeLabel.length <= 24 &&
      !badges.some((b) => b.label.toLowerCase() === badgeLabel.toLowerCase())
    ) {
      setBadges((b) => [...b, { label: badgeLabel, type }]);
    }
    setAmount("");
    setNote("");
    setTagged(null);
    setMentionQuery(null);
  };

  const deleteTxn = (id) => setTxns((t) => t.filter((x) => x.id !== id));
  const togglePin = (id) =>
    setTxns((t) =>
      t.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)),
    );

  const saveBalance = () => {
    const v = parseFloat(balInput);
    if (!Number.isNaN(v)) setOpening(v - (income - expense));
    setEditingBal(false);
  };

  const downloadCSV = () => {
    if (!txns.length) return;
    const ordered = [...txns].sort((a, b) => a.ts - b.ts);
    const rows = [
      ["Date", "Day", "Time", "Type", "Amount", "Note", "Customer", "Balance"],
    ];
    let run = opening;
    ordered.forEach((t) => {
      run += t.type === "income" ? t.amount : -t.amount;
      const d = new Date(t.ts);
      rows.push([
        d.toLocaleDateString("en-IN"),
        d.toLocaleDateString("en-IN", { weekday: "long" }),
        d.toLocaleTimeString("en-IN"),
        t.type,
        String(t.amount),
        t.note || "",
        t.customer?.name || "",
        String(run),
      ]);
    });
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-orders-page">
      <div className="section-1200 flex flex-col gap-24">
        {/* Header */}
        <div className="orders-header orders-header-row">
          <Link
            href="/manage-orders"
            className="flex flex-row gap-8 items-center"
          >
            <ArrowLeft size={18} />
            <div className="flex flex-col">
              <h1 className="font-24">Money Manager</h1>
              <p className="font-12 dark-50">
                Track income, expenses &amp; running balance
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="sec-mid-btn"
            onClick={downloadCSV}
            disabled={!txns.length}
            title="Download all transactions as CSV"
          >
            <Download size={14} /> CSV
          </button>
        </div>

        {/* Balance summary */}
        <div className="tx-summary">
          <div className={`tx-balance ${balance >= 0 ? "pos" : "neg"}`}>
            <span className="tx-balance-label">
              <Wallet size={15} /> Current balance
              {!editingBal && (
                <button
                  type="button"
                  className="tx-bal-edit"
                  onClick={() => {
                    setBalInput(String(balance));
                    setEditingBal(true);
                  }}
                  title="Edit balance"
                >
                  <Pencil size={13} />
                </button>
              )}
            </span>
            {editingBal ? (
              <div className="tx-bal-edit-row">
                <input
                  type="number"
                  className="tx-bal-input"
                  value={balInput}
                  autoFocus
                  onChange={(e) => setBalInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveBalance()}
                />
                <button
                  type="button"
                  className="tx-bal-save"
                  onClick={saveBalance}
                >
                  <Check size={16} />
                </button>
                <button
                  type="button"
                  className="tx-bal-save"
                  onClick={() => setEditingBal(false)}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <span className="tx-balance-val">
                {balance < 0 ? "−" : ""}₹
                {Math.abs(balance).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="tx-mini-cards">
            <div className="tx-mini income">
              <ArrowUpCircle size={18} />
              <div>
                <span className="tx-mini-label">Income</span>
                <strong>₹{income.toLocaleString("en-IN")}</strong>
              </div>
            </div>
            <div className="tx-mini expense">
              <ArrowDownCircle size={18} />
              <div>
                <span className="tx-mini-label">Expense</span>
                <strong>₹{expense.toLocaleString("en-IN")}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Add form */}
        <div className="tx-form">
          {/* Entry row: type icons + amount + optional-note toggle */}
          <div className="tx-entry-row">
            <button
              type="button"
              className={`tx-type-ic income ${type === "income" ? "active" : ""}`}
              onClick={() => setType("income")}
              title="Income"
              aria-label="Income"
            >
              <TrendingUp size={18} />
            </button>
            <button
              type="button"
              className={`tx-type-ic expense ${type === "expense" ? "active" : ""}`}
              onClick={() => setType("expense")}
              title="Expense"
              aria-label="Expense"
            >
              <TrendingDown size={18} />
            </button>
            <input
              type="number"
              inputMode="decimal"
              className="sec-mid-btn tx-amount-full"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTxn()}
            />
            <button
              type="button"
              className={`tx-note-ic ${showNote ? "active" : ""}`}
              onClick={() => setShowNote((s) => !s)}
              title="Add a note (optional)"
              aria-label="Toggle note"
            >
              <StickyNote size={18} />
            </button>
          </div>

          {/* Optional note input — slides out smoothly */}
          <AnimatePresence initial={false}>
            {showNote && (
              <motion.div
                key="note"
                className="tx-note-slot"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "visible" }}
              >
                <div className="tx-note-wrap">
                  <input
                    type="text"
                    className="sec-mid-btn width100"
                    placeholder="Note… type @ to tag a customer"
                    value={note}
                    autoFocus
                    onChange={(e) => onNoteChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && mentionQuery === null) addTxn();
                    }}
                  />
                  {mentionQuery !== null && suggestions.length > 0 && (
                    <div className="tx-mention">
                      {suggestions.map((c) => (
                        <button
                          type="button"
                          key={c.name}
                          className="tx-mention-item"
                          onClick={() => pickMention(c)}
                        >
                          <User size={13} /> {c.name}
                          {c.phone && (
                            <span className="tx-mention-ph">{c.phone}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick-fill note badges — horizontally scrollable */}
          <div className="tx-badges tx-badges-scroll">
            {badges.map((b) => (
              <button
                type="button"
                key={b.label}
                className="tx-badge"
                onClick={() => {
                  setNote(b.label);
                  if (b.type) setType(b.type);
                  setShowNote(true);
                  setMentionQuery(null);
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          {tagged && (
            <div className="tx-tagged-hint">
              Tagged: <b>@{tagged.name}</b>
              <button
                type="button"
                onClick={() => setTagged(null)}
                aria-label="Remove tag"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <button
            type="button"
            className="pri-big-btn width100"
            onClick={addTxn}
            disabled={!amount || parseFloat(amount) <= 0}
          >
            <Plus size={16} /> Add transaction
          </button>
        </div>

        {/* Transactions list */}
        <div className="tx-list">
          {txns.length === 0 && (
            <div className="tx-empty">
              No transactions yet. Add your first income or expense above.
            </div>
          )}
          {txns.map((t) => {
            const d = new Date(t.ts);
            return (
              <div className={`tx-row ${t.type}`} key={t.id}>
                <span className={`tx-icon ${t.type}`}>
                  {t.type === "income" ? (
                    <ArrowUpCircle size={20} />
                  ) : (
                    <ArrowDownCircle size={20} />
                  )}
                </span>
                <div className="tx-body">
                  <div className="tx-body-top">
                    <span className="tx-note">
                      {t.note || (t.type === "income" ? "Income" : "Expense")}
                      {t.pinned && <Pin size={12} className="tx-pinned-ic" />}
                    </span>
                    <span className={`tx-amt ${t.type}`}>
                      {t.type === "income" ? "+" : "−"}₹
                      {t.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {t.customer && (
                    <button
                      type="button"
                      className="tx-cust-chip"
                      onClick={() => setActiveCustomer(t.customer)}
                      title="View customer details"
                    >
                      <User size={12} /> {t.customer.name}
                    </button>
                  )}
                  <div className="tx-body-meta">
                    <span>
                      {d.toLocaleDateString("en-IN", { weekday: "short" })},{" "}
                      {d.toLocaleDateString("en-IN")} ·{" "}
                      {d.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="tx-actions">
                      <button
                        type="button"
                        className={`tx-act ${t.pinned ? "on" : ""}`}
                        onClick={() => togglePin(t.id)}
                        title={
                          t.pinned
                            ? "Unpin from notifications"
                            : "Pin to notifications"
                        }
                      >
                        {t.pinned ? <PinOff size={13} /> : <Pin size={13} />}
                      </button>
                      <button
                        type="button"
                        className="tx-act"
                        onClick={() => deleteTxn(t.id)}
                        title="Delete transaction"
                      >
                        <Trash2 size={13} />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Customer details modal */}
      {activeCustomer && (
        <div
          className="bill-modal-overlay"
          onClick={() => setActiveCustomer(null)}
        >
          <div
            className="bill-modal tx-cust-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bill-header">
              <span className="weight-600 font-16 flex flex-row gap-8 items-center">
                <User size={18} /> {activeCustomer.name}
              </span>
              <span
                className="cursor-pointer"
                onClick={() => setActiveCustomer(null)}
              >
                <X size={16} />
              </span>
            </div>
            <div className="tx-cust-body">
              {activeCustomer.phone && (
                <div className="tx-cust-row">
                  <Phone size={14} />
                  <a href={`tel:${activeCustomer.phone}`}>
                    +91 {activeCustomer.phone}
                  </a>
                </div>
              )}
              {(activeCustomer.address ||
                activeCustomer.city ||
                activeCustomer.pincode) && (
                <div className="tx-cust-row">
                  <MapPin size={14} />
                  <span>
                    {[
                      activeCustomer.address,
                      activeCustomer.city,
                      activeCustomer.state,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                    {activeCustomer.pincode ? ` - ${activeCustomer.pincode}` : ""}
                  </span>
                </div>
              )}
              <div className="tx-cust-grid">
                {activeCustomer.orderId && (
                  <div>
                    <span>Last Order ID</span>
                    <strong>{activeCustomer.orderId}</strong>
                  </div>
                )}
                {activeCustomer.status && (
                  <div>
                    <span>Status</span>
                    <strong>{activeCustomer.status}</strong>
                  </div>
                )}
                {activeCustomer.lastAmount ? (
                  <div>
                    <span>Last Order Value</span>
                    <strong>
                      ₹{Number(activeCustomer.lastAmount).toLocaleString("en-IN")}
                    </strong>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
