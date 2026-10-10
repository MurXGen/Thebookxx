"use client";

import { useEffect, useRef, useState } from "react";
import {
  Gift,
  Upload,
  Check,
  Clock,
  XCircle,
  Sparkles,
  Camera,
} from "lucide-react";
import { getSavedPhone } from "@/utils/userPhone";
import { showToast } from "@/context/ToastContext";

const MAX_REWARD = 200;
const PLATFORMS = ["Instagram", "YouTube", "Facebook", "Other"];
const norm = (p) => String(p || "").replace(/\D/g, "").slice(-10);

// Downscale an uploaded screenshot to a compact JPEG data URL (keeps the POST
// small while still clear enough for the team to review in Telegram).
function fileToDataUrl(file, maxDim = 1080, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const r = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * r);
          height = Math.round(height * r);
        }
        const c = document.createElement("canvas");
        c.width = width;
        c.height = height;
        c.getContext("2d").drawImage(img, 0, 0, width, height);
        try {
          resolve(c.toDataURL("image/jpeg", quality));
        } catch {
          resolve(reader.result);
        }
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReviewRewardCard({ orderId = "", phone: phoneProp = "" }) {
  const [phone, setPhone] = useState(() =>
    norm(phoneProp) ||
    (typeof window !== "undefined" ? norm(getSavedPhone()) : ""),
  );
  const [platform, setPlatform] = useState("Instagram");
  const [link, setLink] = useState("");
  const [shot, setShot] = useState(""); // dataURL preview
  const [busy, setBusy] = useState(false);
  const [subs, setSubs] = useState([]);
  const [open, setOpen] = useState(false); // form expanded
  const fileRef = useRef(null);

  // Prefill from the prop if it arrives after mount (e.g. profile loads async).
  useEffect(() => {
    const p = norm(phoneProp);
    if (p.length === 10) {
      queueMicrotask(() => setPhone((cur) => cur || p));
    }
  }, [phoneProp]);

  const loadSubs = async (p) => {
    const d = norm(p);
    if (d.length !== 10) return;
    try {
      const res = await fetch(`/api/reviews?phone=${d}`);
      const json = await res.json();
      setSubs(Array.isArray(json.submissions) ? json.submissions : []);
    } catch {}
  };
  useEffect(() => {
    if (norm(phone).length === 10) loadSubs(phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const pickFile = () => fileRef.current?.click();
  const onFile = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (!/^image\//.test(file.type)) {
      showToast("Please upload an image screenshot", "error");
      return;
    }
    try {
      setShot(await fileToDataUrl(file));
    } catch {
      showToast("Couldn't read that image — try another", "error");
    }
  };

  const submit = async () => {
    const p = norm(phone);
    if (p.length !== 10) {
      showToast("Enter your 10-digit mobile number", "error");
      return;
    }
    if (!shot) {
      showToast("Upload a screenshot of your post", "error");
      return;
    }
    if (!/^https?:\/\//i.test(link.trim())) {
      showToast("Paste the link where you posted it", "error");
      return;
    }
    setBusy(true);
    try {
      // Remember the number so it's prefilled next time (same key as checkout).
      try {
        localStorage.setItem("track_orders_phone", p);
      } catch {}
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: p,
          orderId,
          platform,
          link: link.trim(),
          image: shot,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.ok) {
        showToast("Submitted! We'll review it shortly 🎉", "success");
        setShot("");
        setLink("");
        setOpen(false);
        loadSubs(p);
      } else {
        showToast(json.error || "Couldn't submit — try again", "error");
      }
    } catch {
      showToast("Couldn't submit — check your connection", "error");
    } finally {
      setBusy(false);
    }
  };

  const StatusRow = ({ s }) => {
    if (s.status === "approved")
      return (
        <div className="rr-sub rr-sub-ok">
          <Check size={15} />
          <span>
            <b>₹{s.amount || 0} credited</b> to your wallet 🎉
            <small>{s.platform ? ` · ${s.platform}` : ""}</small>
          </span>
        </div>
      );
    if (s.status === "rejected")
      return (
        <div className="rr-sub rr-sub-no">
          <XCircle size={15} />
          <span>
            <b>Not approved</b>
            {s.note ? <small> · {s.note}</small> : null}
          </span>
        </div>
      );
    return (
      <div className="rr-sub rr-sub-pending">
        <Clock size={15} />
        <span>
          <b>Under review</b>
          <small> · usually within 24h</small>
        </span>
      </div>
    );
  };

  return (
    <section className="rr-card">
      <div className="rr-head">
        <span className="rr-badge">
          <Gift size={14} /> SHARE &amp; EARN
        </span>
        <h3 className="rr-title">
          Post a reel or story — get up to{" "}
          <span className="rr-amt">₹{MAX_REWARD}</span> back
        </h3>
        <p className="rr-sub-txt">
          Share your books &amp; an honest review on Instagram/YouTube, send us
          the link + screenshot, and we&apos;ll credit your wallet. 📚✨
        </p>
        <div className="rr-steps">
          <span>
            <b>1</b> Post with your books
          </span>
          <span>
            <b>2</b> Upload screenshot + link
          </span>
          <span>
            <b>3</b> Get up to ₹{MAX_REWARD}
          </span>
        </div>
      </div>

      {/* Existing submissions / status */}
      {subs.length > 0 && (
        <div className="rr-subs">
          {subs.slice(0, 4).map((s, i) => (
            <StatusRow s={s} key={s.subId || i} />
          ))}
        </div>
      )}

      {!open ? (
        <button
          type="button"
          className="rr-cta"
          onClick={() => setOpen(true)}
        >
          <Sparkles size={16} /> Submit your post &amp; earn
        </button>
      ) : (
        <div className="rr-form">
          {/* Screenshot */}
          <button type="button" className="rr-upload" onClick={pickFile}>
            {shot ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={shot} alt="screenshot" className="rr-upload-img" />
            ) : (
              <span className="rr-upload-ph">
                <Camera size={20} />
                <span>Upload screenshot of your post</span>
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            style={{ display: "none" }}
          />

          {/* Platform */}
          <div className="rr-plats">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                className={`rr-plat${platform === p ? " on" : ""}`}
                onClick={() => setPlatform(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Link */}
          <input
            className="rr-input"
            placeholder="Paste the post/reel/story link"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          {/* Phone */}
          <input
            className="rr-input"
            inputMode="numeric"
            maxLength={10}
            placeholder="Your 10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          />

          <button
            type="button"
            className="rr-cta"
            onClick={submit}
            disabled={busy}
          >
            {busy ? (
              "Submitting…"
            ) : (
              <>
                <Upload size={16} /> Submit for review
              </>
            )}
          </button>
          <p className="rr-fine">
            Reward amount is confirmed after we verify your post. Paid to your
            TheBookX wallet.
          </p>
        </div>
      )}
    </section>
  );
}
