"use client";

// /escrow — two-party escrow deals, verified by TheBookX.
//
// Home → Create (creator fills terms, gets ID + PIN to share) or Join (phone →
// your escrows → PIN) → Deal room: both parties see terms, agree, add proof
// links and notes. Once both agree and each adds a proof, it moves to
// "Under review"; TheBookX approves (Escrow complete) or rejects with a note.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Link2,
  Lock,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";

const SESSION_KEY = "esc_session";
const phone10 = (v) =>
  String(v || "")
    .replace(/\D/g, "")
    .slice(-10);

async function api(body) {
  const res = await fetch("/api/escrow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.success === false)
    throw new Error(data.error || "Something went wrong — try again.");
  return data;
}

const STEPS = [
  { k: "created", label: "Created" },
  { k: "joined", label: "Joined" },
  { k: "agreed", label: "Agreed" },
  { k: "proofs", label: "Proofs" },
  { k: "review", label: "Review" },
  { k: "done", label: "Complete" },
];

// How far along the deal is (index into STEPS of the first unfinished step).
function progressOf(e) {
  if (!e) return 0;
  if (/approved/i.test(e.status)) return 6;
  if (/under review|rejected/i.test(e.status)) return 4;
  if (!e.p2.joinedAt) return 1;
  if (!(e.p1.agreed && e.p2.agreed)) return 2;
  const has = (p) => e.sources.some((s) => s.by === p);
  if (!(has(e.p1.phone) && has(e.p2.phone))) return 3;
  return 4;
}

const statusTone = (s) =>
  /approved/i.test(s)
    ? "ok"
    : /rejected/i.test(s)
      ? "bad"
      : /under review/i.test(s)
        ? "review"
        : "open";
const statusLabel = (s) =>
  /approved/i.test(s) ? "Escrow complete" : s || "Awaiting other party";

export default function EscrowPage() {
  const [view, setView] = useState("home"); // home | create | created | join | list | pin | room
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Create
  const [cf, setCf] = useState({
    p1Name: "",
    p1Phone: "",
    p1Role: "Buyer",
    p2Phone: "",
    title: "",
    amount: "",
    terms: "",
  });
  const [created, setCreated] = useState(null); // { id, pin, p2Phone, title }

  // Join
  const [joinPhone, setJoinPhone] = useState("");
  const [list, setList] = useState([]);
  const [pick, setPick] = useState(null); // escrow summary
  const [pin, setPin] = useState("");
  const [joinName, setJoinName] = useState("");
  const [linkId, setLinkId] = useState("");

  // Room
  const [session, setSession] = useState(null); // { id, phone, pin }
  const [esc, setEsc] = useState(null);
  const [me, setMe] = useState("p1");

  const go = (v) => {
    setErr("");
    setView(v);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openRoom = useCallback(async (s, name) => {
    const data = await api({ action: "open", ...s, name });
    setSession(s);
    setEsc(data.escrow);
    setMe(data.me);
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {}
    setView("room");
  }, []);

  // Restore an open room, or pre-select an escrow from an invite link.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id") || "";
    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {}
    if (saved?.id && (!id || saved.id === id)) {
      openRoom(saved).catch(() => sessionStorage.removeItem(SESSION_KEY));
    } else if (id) {
      setLinkId(id);
      setView("join");
    }
  }, [openRoom]);

  // Keep the room fresh while it's open (the other party may act).
  useEffect(() => {
    if (view !== "room" || !session) return;
    const t = setInterval(() => {
      api({ action: "open", ...session })
        .then((d) => setEsc(d.escrow))
        .catch(() => {});
    }, 20000);
    return () => clearInterval(t);
  }, [view, session]);

  // Runs an action with busy/error handling; resolves true when it worked.
  const run = async (fn) => {
    setBusy(true);
    setErr("");
    try {
      await fn();
      return true;
    } catch (e) {
      setErr(e.message);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submitCreate = () =>
    run(async () => {
      const d = await api({ action: "create", ...cf });
      setCreated({
        id: d.id,
        pin: d.pin,
        p2Phone: phone10(cf.p2Phone),
        title: cf.title,
      });
      go("created");
    });

  const submitLookup = () =>
    run(async () => {
      const d = await api({ action: "lookup", phone: joinPhone });
      setList(d.escrows || []);
      const linked = linkId && d.escrows.find((x) => x.id === linkId);
      if (linked) {
        setPick(linked);
        go("pin");
      } else go("list");
    });

  const submitPin = () =>
    run(() =>
      openRoom(
        { id: pick.id, phone: phone10(joinPhone), pin: pin.trim() },
        joinName,
      ),
    );

  const act = (body) =>
    run(async () => {
      const d = await api({ ...body, ...session });
      setEsc(d.escrow);
    });

  const leaveRoom = () => {
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
    setSession(null);
    setEsc(null);
    setPin("");
    go("home");
  };

  return (
    <main className="esc">
      <div className="esc-wrap">
        {view !== "home" && view !== "room" && (
          <button type="button" className="esc-back" onClick={() => go("home")}>
            <ArrowLeft size={16} /> Escrow home
          </button>
        )}

        {err && <div className="esc-err">{err}</div>}

        {view === "home" && (
          <Home onCreate={() => go("create")} onJoin={() => go("join")} />
        )}

        {view === "create" && (
          <CreateForm
            cf={cf}
            setCf={setCf}
            busy={busy}
            onSubmit={submitCreate}
          />
        )}

        {view === "created" && created && (
          <Created
            created={created}
            onOpen={() =>
              run(() =>
                openRoom({
                  id: created.id,
                  phone: phone10(cf.p1Phone),
                  pin: created.pin,
                }),
              )
            }
          />
        )}

        {view === "join" && (
          <section className="esc-card">
            <div className="esc-card-head">
              <span className="esc-ic">
                <UserPlus size={18} />
              </span>
              <div>
                <h1>Join an escrow</h1>
                <p>Enter the number the escrow was created for.</p>
              </div>
            </div>
            <label className="esc-field">
              <span>Your phone number</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={joinPhone}
                onChange={(e) => setJoinPhone(phone10(e.target.value))}
              />
            </label>
            <button
              type="button"
              className="esc-primary"
              disabled={busy || joinPhone.length !== 10}
              onClick={submitLookup}
            >
              {busy ? "Checking…" : "Find my escrows"}
            </button>
          </section>
        )}

        {view === "list" && (
          <section className="esc-card">
            <div className="esc-card-head">
              <span className="esc-ic">
                <Users size={18} />
              </span>
              <div>
                <h1>Your escrows</h1>
                <p>For {joinPhone}. Pick one to open.</p>
              </div>
            </div>
            {list.length === 0 ? (
              <div className="esc-empty">
                No escrow found for this number. Ask the other party to create
                one with your number, or{" "}
                <button
                  type="button"
                  className="esc-link"
                  onClick={() => go("create")}
                >
                  create one yourself
                </button>
                .
              </div>
            ) : (
              <div className="esc-list">
                {list.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    className="esc-row"
                    onClick={() => {
                      setPick(x);
                      go("pin");
                    }}
                  >
                    <span className="esc-row-main">
                      <b>{x.title || x.id}</b>
                      <em>
                        {x.myRole === "Creator"
                          ? "You created"
                          : "You were invited"}{" "}
                        · with {x.otherMasked} · {x.createdAt.split(" ")[0]}
                      </em>
                    </span>
                    <span className={`esc-pill ${statusTone(x.status)}`}>
                      {statusLabel(x.status)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {view === "pin" && pick && (
          <section className="esc-card">
            <div className="esc-card-head">
              <span className="esc-ic">
                <Lock size={18} />
              </span>
              <div>
                <h1>{pick.title || pick.id}</h1>
                <p>Enter the 4-digit PIN shared with you for this escrow.</p>
              </div>
            </div>
            <label className="esc-field">
              <span>Escrow PIN</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={4}
                className="esc-pin"
                placeholder="••••"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
              />
            </label>
            {pick.myRole !== "Creator" && (
              <label className="esc-field">
                <span>Your name</span>
                <input
                  type="text"
                  placeholder="So the other party knows it's you"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                />
              </label>
            )}
            <button
              type="button"
              className="esc-primary"
              disabled={busy || pin.length !== 4}
              onClick={submitPin}
            >
              {busy ? "Opening…" : "Open escrow"}
            </button>
          </section>
        )}

        {view === "room" && esc && (
          <Room
            esc={esc}
            me={me}
            busy={busy}
            act={act}
            onLeave={leaveRoom}
            onRefresh={() =>
              run(async () =>
                setEsc((await api({ action: "open", ...session })).escrow),
              )
            }
          />
        )}
      </div>
    </main>
  );
}

function Home({ onCreate, onJoin }) {
  return (
    <>
      <section className="esc-hero">
        <span className="esc-hero-ic">
          <ShieldCheck size={26} />
        </span>
        <h1>Leading Escrow</h1>
        <p>
          A safe way for two people to close a deal. Agree on the terms, share
          proof, and our team verifies everything before the escrow is marked
          complete.
        </p>
      </section>
      <div className="esc-choices">
        <button type="button" className="esc-choice" onClick={onCreate}>
          <span className="esc-ic">
            <PlusCircle size={20} />
          </span>
          <b>Create escrow</b>
          <em>Set the terms and invite the other party by phone number.</em>
        </button>
        <button type="button" className="esc-choice" onClick={onJoin}>
          <span className="esc-ic">
            <UserPlus size={20} />
          </span>
          <b>Join escrow</b>
          <em>Invited to one? Enter your number and the PIN you received.</em>
        </button>
      </div>
      <section className="esc-how">
        <h2>How it works</h2>
        <ol>
          <li>
            <b>Create</b> — one party writes the terms and adds the other&apos;s
            number.
          </li>
          <li>
            <b>Join</b> — the other party opens it with their number and the
            PIN.
          </li>
          <li>
            <b>Agree &amp; prove</b> — both accept the terms and add proof links
            (screenshots, receipts, tracking).
          </li>
          <li>
            <b>Review</b> — TheBookX verifies and approves the escrow, or
            rejects it with a note.
          </li>
        </ol>
      </section>
    </>
  );
}

function CreateForm({ cf, setCf, busy, onSubmit }) {
  const set = (k) => (e) => setCf((p) => ({ ...p, [k]: e.target.value }));
  const ok =
    cf.p1Name.trim() &&
    phone10(cf.p1Phone).length === 10 &&
    phone10(cf.p2Phone).length === 10 &&
    cf.title.trim() &&
    cf.terms.trim();
  return (
    <section className="esc-card">
      <div className="esc-card-head">
        <span className="esc-ic">
          <PlusCircle size={18} />
        </span>
        <div>
          <h1>Create an escrow</h1>
          <p>You&apos;ll get an ID and PIN to share with the other party.</p>
        </div>
      </div>

      <h3 className="esc-sec">You</h3>
      <div className="esc-grid">
        <label className="esc-field">
          <span>Your name</span>
          <input
            value={cf.p1Name}
            onChange={set("p1Name")}
            placeholder="Full name"
          />
        </label>
        <label className="esc-field">
          <span>Your phone</span>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={cf.p1Phone}
            onChange={(e) =>
              setCf((p) => ({ ...p, p1Phone: phone10(e.target.value) }))
            }
            placeholder="10-digit number"
          />
        </label>
      </div>
      <div className="esc-field">
        <span>You are the</span>
        <div className="esc-seg">
          {["Buyer", "Seller"].map((r) => (
            <button
              key={r}
              type="button"
              className={cf.p1Role === r ? "on" : ""}
              onClick={() => setCf((p) => ({ ...p, p1Role: r }))}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <h3 className="esc-sec">Other party</h3>
      <label className="esc-field">
        <span>Their phone number</span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          value={cf.p2Phone}
          onChange={(e) =>
            setCf((p) => ({ ...p, p2Phone: phone10(e.target.value) }))
          }
          placeholder="Who you're dealing with"
        />
      </label>

      <h3 className="esc-sec">The deal</h3>
      <div className="esc-grid">
        <label className="esc-field">
          <span>Title</span>
          <input
            value={cf.title}
            onChange={set("title")}
            placeholder="e.g. Sale of 20 used books"
            maxLength={140}
          />
        </label>
        <label className="esc-field">
          <span>Amount (₹)</span>
          <input
            type="number"
            inputMode="numeric"
            value={cf.amount}
            onChange={set("amount")}
            placeholder="Optional"
          />
        </label>
      </div>
      <label className="esc-field">
        <span>Terms &amp; conditions</span>
        <textarea
          rows={6}
          value={cf.terms}
          onChange={set("terms")}
          placeholder="What each side delivers, by when, and what counts as done. Be specific — the reviewer checks proofs against these terms."
        />
      </label>

      <button
        type="button"
        className="esc-primary"
        disabled={busy || !ok}
        onClick={onSubmit}
      >
        {busy ? "Creating…" : "Create escrow"}
      </button>
    </section>
  );
}

function Created({ created, onOpen }) {
  const [copied, setCopied] = useState("");
  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/escrow?id=${created.id}`
      : `/escrow?id=${created.id}`;
  const invite =
    `You've been invited to a TBX escrow: "${created.title}".\n\n` +
    `Open: ${link}\nEscrow ID: ${created.id}\nPIN: ${created.pin}\n\n` +
    `Join with this phone number and the PIN.`;
  const copy = (txt, k) => {
    navigator.clipboard?.writeText(txt);
    setCopied(k);
    setTimeout(() => setCopied(""), 1600);
  };
  return (
    <section className="esc-card">
      <div className="esc-done-ic">
        <CheckCircle2 size={34} />
      </div>
      <h1 className="esc-center">Escrow created</h1>
      <p className="esc-center esc-muted">
        Share the link and PIN with the other party. Keep the PIN — you&apos;ll
        need it to open this escrow too.
      </p>
      <div className="esc-keys">
        <div>
          <span>Escrow ID</span>
          <b>{created.id}</b>
        </div>
        <div>
          <span>PIN</span>
          <b className="esc-pinval">{created.pin}</b>
        </div>
      </div>
      <div className="esc-actions">
        <a
          className="esc-primary"
          href={`https://wa.me/91${created.p2Phone}?text=${encodeURIComponent(invite)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Send size={16} /> Invite on WhatsApp
        </a>
        <button
          type="button"
          className="esc-secondary"
          onClick={() => copy(invite, "inv")}
        >
          {copied === "inv" ? <Check size={16} /> : <Copy size={16} />}
          {copied === "inv" ? "Copied" : "Copy invite"}
        </button>
      </div>
      <button
        type="button"
        className="esc-link esc-center-btn"
        onClick={onOpen}
      >
        Open the escrow →
      </button>
    </section>
  );
}

function Room({ esc, me, busy, act, onLeave, onRefresh }) {
  const [editTerms, setEditTerms] = useState(false);
  const [terms, setTerms] = useState(esc.terms);
  const [amount, setAmount] = useState(esc.amount);
  const [src, setSrc] = useState({ label: "", url: "" });
  const [note, setNote] = useState("");

  const mine = me === "p1" ? esc.p1 : esc.p2;
  const other = me === "p1" ? esc.p2 : esc.p1;
  const p1Role = esc.p1.role;
  const p2Role = p1Role === "Buyer" ? "Seller" : "Buyer";
  const roleOf = (p) => (p === "p1" ? p1Role : p2Role);
  const step = progressOf(esc);
  const locked = /under review|approved|rejected/i.test(esc.status);
  const who = (phone) =>
    phone === mine.phone
      ? "You"
      : other.name || (me === "p1" ? "Other party" : "Creator");
  const mySources = esc.sources.filter((s) => s.by === mine.phone).length;
  const otherSources = esc.sources.filter((s) => s.by === other.phone).length;

  // What this person should do next.
  const nextHint = useMemo(() => {
    if (/approved/i.test(esc.status))
      return "Escrow complete — TheBookX approved this deal.";
    if (/rejected/i.test(esc.status))
      return "TheBookX rejected this escrow. See the reviewer's note below.";
    if (/under review/i.test(esc.status))
      return "Both sides are done. TheBookX is reviewing the proofs.";
    if (!esc.p2.joinedAt)
      return "Waiting for the other party to join with their number and the PIN.";
    if (!mine.agreed)
      return "Read the terms and tap “I agree” when you're happy with them.";
    if (!other.agreed)
      return "Waiting for the other party to agree to the terms.";
    if (!mySources)
      return "Add at least one proof link (receipt, screenshot, tracking).";
    if (!otherSources) return "Waiting for the other party to add their proof.";
    return "";
  }, [esc, mine, other, mySources, otherSources]);

  return (
    <div className="esc-room">
      <div className="esc-room-top">
        <button type="button" className="esc-back" onClick={onLeave}>
          <ArrowLeft size={16} /> Leave
        </button>
        <button
          type="button"
          className="esc-iconbtn"
          onClick={onRefresh}
          disabled={busy}
          aria-label="Refresh"
        >
          <RefreshCw size={16} className={busy ? "esc-spin" : ""} />
        </button>
      </div>

      <section className="esc-card">
        <div className="esc-room-head">
          <div>
            <h1>{esc.title}</h1>
            <p className="esc-muted">
              {esc.id} · created {esc.createdAt.split(" ")[0]}
              {esc.amount
                ? ` · ₹${Number(esc.amount).toLocaleString("en-IN")}`
                : ""}
            </p>
          </div>
          <span className={`esc-pill ${statusTone(esc.status)}`}>
            {statusLabel(esc.status)}
          </span>
        </div>

        <ol className="esc-steps" aria-label="Progress">
          {STEPS.map((s, i) => (
            <li
              key={s.k}
              className={i < step ? "done" : i === step ? "now" : ""}
            >
              <span>{i < step ? <Check size={12} /> : i + 1}</span>
              <em>{s.label}</em>
            </li>
          ))}
        </ol>

        {nextHint && (
          <div className={`esc-next ${statusTone(esc.status)}`}>
            {/approved/i.test(esc.status) ? (
              <CheckCircle2 size={16} />
            ) : /rejected/i.test(esc.status) ? (
              <XCircle size={16} />
            ) : (
              <Clock size={16} />
            )}
            {nextHint}
          </div>
        )}
        {esc.reviewNote && (
          <div className="esc-review">
            <b>Reviewer&apos;s note</b>
            <p>{esc.reviewNote}</p>
            {esc.reviewedAt && <em>{esc.reviewedAt}</em>}
          </div>
        )}
      </section>

      {/* Parties */}
      <section className="esc-card">
        <h3 className="esc-sec">
          <Users size={14} /> Parties
        </h3>
        <div className="esc-parties">
          {["p1", "p2"].map((p) => {
            const x = esc[p];
            const isMe = p === me;
            return (
              <div key={p} className={`esc-party${isMe ? " me" : ""}`}>
                <span className="esc-avatar">
                  {(x.name || "?").slice(0, 1).toUpperCase()}
                </span>
                <span className="esc-party-main">
                  <b>
                    {x.name || (p === "p2" ? "Not joined yet" : "—")}
                    {isMe ? " (you)" : ""}
                  </b>
                  <em>
                    {roleOf(p)} · {x.phone}
                  </em>
                </span>
                <span className={`esc-agree${x.agreed ? " yes" : ""}`}>
                  {x.agreed ? (
                    <>
                      <Check size={12} /> Agreed
                    </>
                  ) : (
                    "Not agreed"
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Terms */}
      <section className="esc-card">
        <div className="esc-sec-row">
          <h3 className="esc-sec">
            <FileText size={14} /> Terms
          </h3>
          {me === "p1" && !locked && !editTerms && (
            <button
              type="button"
              className="esc-link"
              onClick={() => {
                setTerms(esc.terms);
                setAmount(esc.amount);
                setEditTerms(true);
              }}
            >
              Edit
            </button>
          )}
        </div>
        {editTerms ? (
          <>
            <label className="esc-field">
              <span>Amount (₹)</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label className="esc-field">
              <span>Terms — saving asks the other party to agree again</span>
              <textarea
                rows={6}
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </label>
            <div className="esc-actions">
              <button
                type="button"
                className="esc-secondary"
                onClick={() => setEditTerms(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="esc-primary"
                disabled={busy || !terms.trim()}
                onClick={async () => {
                  if (await act({ action: "terms", terms, amount }))
                    setEditTerms(false);
                }}
              >
                Save terms
              </button>
            </div>
          </>
        ) : (
          <p className="esc-terms">{esc.terms}</p>
        )}
        {!locked && !editTerms && (
          <button
            type="button"
            className={mine.agreed ? "esc-secondary" : "esc-primary"}
            disabled={busy}
            onClick={() => act({ action: "agree", agree: !mine.agreed })}
          >
            {mine.agreed ? (
              "Withdraw my agreement"
            ) : (
              <>
                <Check size={16} /> I agree to these terms
              </>
            )}
          </button>
        )}
      </section>

      {/* Sources / proofs */}
      <section className="esc-card">
        <h3 className="esc-sec">
          <Link2 size={14} /> Proof &amp; sources
        </h3>
        {esc.sources.length === 0 ? (
          <p className="esc-muted">
            No links yet. Each party adds at least one proof.
          </p>
        ) : (
          <div className="esc-sources">
            {esc.sources.map((s, i) => (
              <a
                key={i}
                className="esc-source"
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="esc-source-main">
                  <b>{s.label}</b>
                  <em>
                    {who(s.by)} · {s.at}
                  </em>
                </span>
                <ExternalLink size={15} />
              </a>
            ))}
          </div>
        )}
        {!locked && (
          <div className="esc-add">
            <input
              placeholder="Label (e.g. Payment receipt)"
              value={src.label}
              onChange={(e) => setSrc((p) => ({ ...p, label: e.target.value }))}
            />
            <input
              placeholder="https://…"
              value={src.url}
              onChange={(e) => setSrc((p) => ({ ...p, url: e.target.value }))}
            />
            <button
              type="button"
              className="esc-primary"
              disabled={busy || !/^https?:\/\/\S+$/i.test(src.url)}
              onClick={async () => {
                if (await act({ action: "source", ...src }))
                  setSrc({ label: "", url: "" });
              }}
            >
              Add link
            </button>
          </div>
        )}
      </section>

      {/* Notes */}
      <section className="esc-card">
        <h3 className="esc-sec">
          <MessageSquare size={14} /> Notes
        </h3>
        {esc.notes.length === 0 ? (
          <p className="esc-muted">No notes yet.</p>
        ) : (
          <div className="esc-notes">
            {esc.notes.map((n, i) => (
              <div
                key={i}
                className={`esc-note${n.by === mine.phone ? " me" : ""}`}
              >
                <p>{n.text}</p>
                <em>
                  {who(n.by)} · {n.at}
                </em>
              </div>
            ))}
          </div>
        )}
        {!locked && (
          <div className="esc-add esc-add-note">
            <textarea
              rows={2}
              placeholder="Write a note for the other party and the reviewer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button
              type="button"
              className="esc-primary"
              disabled={busy || !note.trim()}
              onClick={async () => {
                if (await act({ action: "note", text: note })) setNote("");
              }}
            >
              <Send size={15} /> Send
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
