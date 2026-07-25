"use client";

import { useState, useEffect } from "react";
import { Mail, Check } from "lucide-react";
import {
  submitSubscription,
  isValidEmail,
  markSubscribed,
  hasSubscribed,
} from "@/utils/subscribeForm";

// Email capture box for the blog (listing + posts). Submits to a Google Sheet.
export default function BlogSubscribe({ source = "blog", compact = false }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [already, setAlready] = useState(false);

  useEffect(() => {
    setAlready(hasSubscribed());
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    const res = await submitSubscription({ email, source });
    // Treat unconfigured as success for the visitor (owner sees the console note).
    if (res.ok || res.unconfigured) {
      markSubscribed(email);
      setStatus("done");
      setAlready(true);
    } else {
      setStatus("error");
    }
  };

  if (already && status !== "done") {
    return (
      <div className={`blog-subscribe ${compact ? "compact" : ""} subscribed`}>
        <div className="blog-subscribe-inner">
          <Check size={18} />
          <span>You're subscribed — new reads are on the way. </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`blog-subscribe ${compact ? "compact" : ""}`}>
      <div className="blog-subscribe-inner">
        <div className="blog-subscribe-copy">
          <div className="blog-subscribe-title">
            <Mail size={compact ? 16 : 18} />
            Get the best reads in your inbox
          </div>
          {!compact && (
            <p className="blog-subscribe-sub">
              New book lists, trending picks & QuickReads — no spam, unsubscribe
              anytime.
            </p>
          )}
        </div>

        {status === "done" ? (
          <div className="blog-subscribe-done">
            <Check size={18} /> Thanks! You're on the list.
          </div>
        ) : (
          <form className="blog-subscribe-form" onSubmit={onSubmit}>
            <input
              type="email" inputMode="email" placeholder="you@email.com" value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              aria-label="Email address" className="blog-subscribe-input"
            />
            <button
              type="submit" className="blog-subscribe-btn" disabled={status === "sending"}
            >
              {status === "sending" ? "Joining…" : "Subscribe"}
            </button>
          </form>
        )}
      </div>
      {status === "error" && (
        <p className="blog-subscribe-err">Please enter a valid email address.</p>
      )}
    </div>
  );
}
