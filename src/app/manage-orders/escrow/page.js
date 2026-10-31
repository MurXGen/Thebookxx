"use client";

// /manage-orders/escrow — the middleman's review desk for /escrow deals.
// Lives under the manage-orders AdminLock; admin API calls send the unlock
// code as "x-admin-code" (see lib/adminCode).

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { ADMIN_CODE_KEY } from "@/lib/adminCode";
import "../../escrow/escrow.css";

const TABS = [
  { k: "review", label: "Under review", test: (s) => /under review/i.test(s) },
  { k: "open", label: "In progress", test: (s) => /^(open|awaiting)/i.test(s) },
  { k: "done", label: "Completed", test: (s) => /approved/i.test(s) },
  { k: "rejected", label: "Rejected", test: (s) => /rejected/i.test(s) },
  { k: "all", label: "All", test: () => true },
];

const adminCode = () => {
  try {
    return (
      sessionStorage.getItem(ADMIN_CODE_KEY) ||
      localStorage.getItem(ADMIN_CODE_KEY) ||
      ""
    );
  } catch {
    return "";
  }
};

export default function EscrowReviewPage() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState("review");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [openId, setOpenId] = useState("");
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/escrow?admin=1", {
        headers: { "x-admin-code": adminCode() },
        cache: "no-store",
      });
      const d = await res.json();
      if (!res.ok || !d.success)
        throw new Error(
          res.status === 401
            ? "Unlock again from the console (log out and back in) to review escrows."
            : d.error || "Couldn't load escrows",
        );
      setRows(d.escrows || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.k, rows.filter((r) => t.test(r.status)).length])),
    [rows],
  );
  const shown = rows.filter((r) => TABS.find((t) => t.k === tab).test(r.status));

  const review = async (id, decision) => {
    const note = String(notes[id] || "").trim();
    if (decision === "reject" && !note) {
      setErr("Add a note explaining why it's rejected.");
      return;
    }
    setBusyId(id);
    setErr("");
    try {
      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-code": adminCode() },
        body: JSON.stringify({ action: "review", id, decision, note }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || "Review failed");
      setRows((p) =>
        p.map((r) =>
          r.id === id
            ? { ...r, status: decision === "approve" ? "Approved" : "Rejected", reviewNote: note }
            : r,
        ),
      );
      setOpenId("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusyId("");
    }
  };

  const who = (r, phone) =>
    phone === r.p1.phone ? `${r.p1.name || "Creator"} (${r.p1.role})` : r.p2.name || "Invited party";

  return (
    <main className="esc">
      <div className="esc-wrap esc-admin">
        <div className="esc-room-top">
          <Link href="/manage-orders" className="esc-back">
            <ArrowLeft size={16} /> Manage orders
          </Link>
          <button type="button" className="esc-iconbtn" onClick={load} aria-label="Refresh">
            <RefreshCw size={16} className={loading ? "esc-spin" : ""} />
          </button>
        </div>

        <div className="esc-card-head">
          <span className="esc-ic"><ShieldCheck size={18} /></span>
          <div>
            <h1 className="esc-admin-title">Escrow review</h1>
            <p className="esc-muted">Verify proofs against the terms, then approve or reject with a note.</p>
          </div>
        </div>

        <div className="esc-seg esc-admin-tabs">
          {TABS.map((t) => (
            <button key={t.k} type="button" className={tab === t.k ? "on" : ""} onClick={() => setTab(t.k)}>
              {t.label} <b>{counts[t.k]}</b>
            </button>
          ))}
        </div>

        {err && <div className="esc-err">{err}</div>}

        {!loading && shown.length === 0 && (
          <div className="esc-empty">Nothing here right now.</div>
        )}

        {shown.map((r) => {
          const open = openId === r.id;
          return (
            <section key={r.id} className="esc-card">
              <button type="button" className="esc-admin-row" onClick={() => setOpenId(open ? "" : r.id)}>
                <span className="esc-row-main">
                  <b>{r.title}</b>
                  <em>
                    {r.id} · {r.p1.name || r.p1.phone} ↔ {r.p2.name || r.p2.phone}
                    {r.amount ? ` · ₹${Number(r.amount).toLocaleString("en-IN")}` : ""} · {r.updatedAt}
                  </em>
                </span>
                <span className={`esc-pill ${/approved/i.test(r.status) ? "ok" : /rejected/i.test(r.status) ? "bad" : /under review/i.test(r.status) ? "review" : ""}`}>
                  {r.status}
                </span>
              </button>

              {open && (
                <>
                  <div className="esc-parties">
                    {["p1", "p2"].map((p) => (
                      <div key={p} className="esc-party">
                        <span className="esc-avatar">{(r[p].name || "?").slice(0, 1).toUpperCase()}</span>
                        <span className="esc-party-main">
                          <b>{r[p].name || "—"}</b>
                          <em>
                            {p === "p1" ? `Creator · ${r.p1.role}` : `Invited · ${r.p1.role === "Buyer" ? "Seller" : "Buyer"}`} · {r[p].phone}
                          </em>
                        </span>
                        <span className={`esc-agree${r[p].agreed ? " yes" : ""}`}>
                          {r[p].agreed ? <><Check size={12} /> Agreed</> : "Not agreed"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <h3 className="esc-sec">Terms</h3>
                  <p className="esc-terms">{r.terms}</p>

                  <h3 className="esc-sec">Proof &amp; sources</h3>
                  {r.sources.length ? (
                    <div className="esc-sources">
                      {r.sources.map((s, i) => (
                        <a key={i} className="esc-source" href={s.url} target="_blank" rel="noopener noreferrer">
                          <span className="esc-source-main">
                            <b>{s.label}</b>
                            <em>{who(r, s.by)} · {s.at}</em>
                          </span>
                          <ExternalLink size={15} />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="esc-muted">No links added.</p>
                  )}

                  {r.notes.length > 0 && (
                    <>
                      <h3 className="esc-sec">Notes</h3>
                      <div className="esc-notes">
                        {r.notes.map((n, i) => (
                          <div key={i} className={`esc-note${n.by === r.p1.phone ? "" : " me"}`}>
                            <p>{n.text}</p>
                            <em>{who(r, n.by)} · {n.at}</em>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {r.reviewNote && (
                    <div className="esc-review">
                      <b>Review note</b>
                      <p>{r.reviewNote}</p>
                    </div>
                  )}

                  {/under review/i.test(r.status) && (
                    <>
                      <label className="esc-field">
                        <span>Reviewer note (required to reject)</span>
                        <textarea
                          rows={3}
                          placeholder="What you checked, or why it's rejected — both parties see this."
                          value={notes[r.id] || ""}
                          onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
                        />
                      </label>
                      <div className="esc-actions">
                        <button
                          type="button"
                          className="esc-secondary esc-reject"
                          disabled={busyId === r.id}
                          onClick={() => review(r.id, "reject")}
                        >
                          <X size={16} /> Reject
                        </button>
                        <button
                          type="button"
                          className="esc-primary"
                          disabled={busyId === r.id}
                          onClick={() => review(r.id, "approve")}
                        >
                          <Check size={16} /> Approve — escrow complete
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
