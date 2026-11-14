"use client";

import { XmasSnow, XmasGarland, XmasTree } from "@/components/XmasDecor";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Truck,
  ShieldCheck,
  Check,
  Clock,
  Phone,
  Gift,
} from "lucide-react";
import LoadingButton from "./LoadingButton";
import { trackFunnelEvent } from "@/lib/analytics";
import { showToast } from "@/context/ToastContext";
import { EVENTS } from "@/lib/trackingEvents";
import { useTrackView } from "@/lib/trackingHooks";
import { trackPincodeToGoogleForm } from "@/utils/googleForm";
import ScratchRewardSheet from "./ScratchRewardSheet";
import {
  fetchWalletBalance,
  creditWalletReward,
} from "@/utils/googleFormOrder";

const PINCODE_STORAGE_KEY = "pincode_modal_last_shown";
const PINCODE_DATA_KEY = "user_pincode";

// Event-aware theming for the scratch teaser, so the banner feels current for
// whatever occasion is running. Extend this list for future events.
function getActiveEvent() {
  const now = new Date();
  const m = now.getMonth(); // 0-based
  const d = now.getDate();
  // Christmas season (Nov – Dec) — matches the Christmas homepage hero
  if (m === 10 || m === 11) {
    return {
      key: "christmas",
      emoji: "🎁",
      title: "Your Christmas gift!",
      sub: "Scratch to unwrap a wallet reward",
      gradient: "linear-gradient(135deg,#dc2626,#fbbf24)",
    };
  }
  // Diwali-ish window (rough): late Oct
  if (m === 9 && d >= 20) {
    return {
      key: "diwali",
      emoji: "🪔",
      title: "Diwali dhamaka!",
      sub: "Scratch to light up your wallet with a reward",
      gradient: "linear-gradient(135deg,#ff8a00,#ffd166)",
    };
  }
  // Default festive
  return {
    key: "default",
    emoji: "🎁",
    title: "You've won a scratch card!",
    sub: "Scratch to reveal a wallet reward",
    gradient: "linear-gradient(135deg,#fb8500,#ffd166)",
  };
}

// "Logged in" = we already know the shopper's phone from a profile lookup.
function isLoggedIn() {
  if (typeof window === "undefined") return false;
  try {
    return (
      String(localStorage.getItem("track_orders_phone") || "").replace(
        /\D/g,
        "",
      ).length >= 10
    );
  } catch {
    return false;
  }
}

export default function PincodeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  // Funnel stage inside the modal: teaser scratch card details form.
  // (The real, scratchable reveal is the ScratchRewardSheet shown after submit.)
  const [stage, setStage] = useState("teaser"); // "teaser" | "form"
  // Scratch-card reward shown after submit (only when a phone number is given).
  const [showScratch, setShowScratch] = useState(false);
  const [scratchEligible, setScratchEligible] = useState(false);
  const [scratchReward, setScratchReward] = useState(0);
  const [scratchDone, setScratchDone] = useState(false);

  // Optional "where did you come from?" source (not required to submit).
  const SOURCE_CHIPS = [
    "Google",
    "Instagram",
    "Facebook",
    "YouTube",
    "ChatGPT",
    "AI",
  ];
  const [source, setSource] = useState("");
  const [otherSource, setOtherSource] = useState("");
  const [showOtherSource, setShowOtherSource] = useState(false);
  const resolvedSource = () =>
    source === "Others" ? otherSource.trim() : source;

  const handleScratchComplete = async () => {
    if (scratchDone) return;
    setScratchDone(true);
    if (scratchEligible && scratchReward > 0) {
      // Credit to the dedicated Wallet sheet (Credit · Scratch card reward).
      const res = await creditWalletReward(
        phoneNumber,
        scratchReward,
        "",
        "Scratch card reward",
      );
      if (!res || !res.success) {
        console.error(
          "[wallet] homepage scratch credit FAILED",
          phoneNumber,
          scratchReward,
          res,
        );
      } else {
        console.info(
          "[wallet] homepage scratch credited ₹" +
            scratchReward +
            " to " +
            phoneNumber,
        );
      }
      // Mark the one-time scratch perk as claimed so a repeat scratch shows
      // "Better luck next time" instead of crediting again.
      try {
        localStorage.setItem("tbx_scratch_claimed", "1");
      } catch (_) {}
    }
  };
  const closeScratch = () => setShowScratch(false);

  // Auto-log-in this number into the profile (overrides any existing), then
  // send the shopper to their profile.
  const goToProfile = () => {
    const digits = String(phoneNumber || "")
      .replace(/\D/g, "")
      .slice(-10);
    if (digits.length === 10) {
      try {
        localStorage.setItem("track_orders_phone", digits);
        let list = [];
        try {
          list = JSON.parse(
            localStorage.getItem("track_orders_saved_phones") || "[]",
          );
        } catch (_) {}
        if (!Array.isArray(list)) list = [];
        list = [digits, ...list.filter((x) => x !== digits)].slice(0, 5);
        localStorage.setItem("track_orders_saved_phones", JSON.stringify(list));
      } catch (_) {}
    }
    if (typeof window !== "undefined") window.location.assign("/profile");
  };

  // Track modal view when opened
  useTrackView(EVENTS.PINCODE_MODAL_VIEWED, {}, isOpen);

  // Check for saved pincode on mount (auto-fill from localStorage)
  useEffect(() => {
    const savedPincodeData = localStorage.getItem(PINCODE_DATA_KEY);
    if (savedPincodeData) {
      try {
        const parsed = JSON.parse(savedPincodeData);
        if (parsed.pincode && !hasAutoFilled) {
          setPincode(parsed.pincode);
          setPhoneNumber(parsed.phone || "");
          setHasAutoFilled(true);

          // Only track to GA, NOT to Google Form
          trackFunnelEvent(EVENTS.PINCODE_AUTO_FILLED, {
            source: "localStorage",
            has_pincode: true,
          });
        }
      } catch (e) {
        console.error("Error parsing saved pincode:", e);
      }
    }
  }, []);

  // Decide whether the modal is *eligible* to show (once every 24h, and never
  // if the user already gave a pincode). We no longer pop it on first paint, // instead it triggers on the first engagement signal (scroll past the hero)
  // or after a generous delay, so visitors always see the store first.
  // No longer auto-opens. The hero renders the scratch teaser card; when the
  // shopper starts scratching it, it fires "tbx:open-scratch" and we open the
  // number modal here (keeping the wallet/reward logic in one place).
  useEffect(() => {
    const open = () => {
      setStage("form");
      setIsOpen(true);
      setStartTime(Date.now());
    };
    window.addEventListener("tbx:open-scratch", open);
    return () => window.removeEventListener("tbx:open-scratch", open);
  }, []);

  // Auto-open the number modal once the visitor engages (scrolls past the hero).
  // Throttled to once per 24h and skipped for already-logged-in shoppers.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let done = false;
    const eligible = () => {
      if (isLoggedIn()) return false;
      try {
        const last = Number(localStorage.getItem(PINCODE_STORAGE_KEY) || 0);
        if (Date.now() - last < 24 * 60 * 60 * 1000) return false;
      } catch (_) {}
      return true;
    };
    const onScroll = () => {
      if (done) return;
      if (window.scrollY < window.innerHeight * 0.6) return;
      done = true;
      window.removeEventListener("scroll", onScroll);
      if (!eligible()) return;
      setStage("form");
      setIsOpen(true);
      setStartTime(Date.now());
      try {
        localStorage.setItem(PINCODE_STORAGE_KEY, String(Date.now()));
      } catch (_) {}
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch location details based on pincode
  const fetchLocationDetails = async (pincodeValue) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincodeValue}`,
      );
      const data = await response.json();

      if (data && data[0] && data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        return {
          city: postOffice.District,
          state: postOffice.State,
          country: "India",
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching location:", error);
      return null;
    }
  };

  const handleSubmit = async () => {
    // Phone is now REQUIRED; pincode is optional.
    if (phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      showToast(
        phoneNumber.length === 0
          ? "Enter your 10-digit mobile number"
          : `Enter all 10 digits (${phoneNumber.length}/10 entered)`,
        "error",
      );
      trackFunnelEvent(EVENTS.PINCODE_SUBMITTED, {
        status: "error",
        error_reason: "invalid_phone",
      });
      return;
    }

    setLoading(true);
    setError("");

    // Only look up the city/state when a full pincode was entered.
    const location =
      pincode && pincode.length === 6
        ? await fetchLocationDetails(pincode)
        : null;
    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : null;

    // Track successful submission to GA
    trackFunnelEvent(EVENTS.PINCODE_SUBMITTED, {
      status: "success",
      pincode: pincode,
      city: location?.city,
      state: location?.state,
      phone_provided: !!phoneNumber,
      time_spent_seconds: timeSpent,
      is_manual_entry: !hasAutoFilled,
    });

    // Submit to Google Form ONLY on manual submit. The optional "where did you
    // find us?" answer goes into its own Source column.
    await trackPincodeToGoogleForm({
      pincode: pincode,
      city: location?.city,
      state: location?.state,
      phone: phoneNumber,
      source: resolvedSource(),
      type: "submit",
    });

    // Store in localStorage
    localStorage.setItem(
      PINCODE_DATA_KEY,
      JSON.stringify({
        pincode: pincode,
        city: location?.city,
        state: location?.state,
        phone: phoneNumber,
        submittedAt: Date.now(),
      }),
    );

    localStorage.setItem(PINCODE_STORAGE_KEY, Date.now().toString());

    setLocationData(location);
    setLoading(false);

    // If they shared a valid phone number, reward them with a scratch card.
    // The total wallet balance is capped at ₹25 for this beginner scratch perk.
    if (phoneNumber && phoneNumber.length === 10) {
      const balance = await fetchWalletBalance(phoneNumber);
      // The scratch reward is a FIRST-TIME welcome perk. A shopper who is
      // already logged in (has a saved phone) or who has already claimed a
      // scratch reward gets "Better luck next time" and is NOT credited again.
      let alreadyLoggedIn = false;
      let alreadyClaimed = false;
      try {
        alreadyLoggedIn =
          String(localStorage.getItem("track_orders_phone") || "").replace(
            /\D/g,
            "",
          ).length >= 10;
        alreadyClaimed = localStorage.getItem("tbx_scratch_claimed") === "1";
      } catch (_) {}
      // Eligible if the wallet still has room below ₹25 and the scratch reward
      // hasn't been claimed yet — logged-in shoppers qualify too (the wallet
      // balance + claimed flag already prevent farming).
      const room = 25 - balance;
      const eligible = room > 0 && !alreadyClaimed;
      let rew = 0;
      if (eligible) {
        rew = 11 + Math.floor(Math.random() * 15); // ₹11–25
        if (rew > room) rew = room; // never let balance + reward exceed ₹25
      }
      setScratchEligible(eligible);
      setScratchReward(rew);
      setScratchDone(false);
      // Sign them in now (eligibility was already computed above, so this
      // doesn't affect the reward). Their profile recognises them afterwards.
      try {
        const digits = String(phoneNumber).replace(/\D/g, "").slice(-10);
        if (digits.length === 10) {
          localStorage.setItem("track_orders_phone", digits);
          let list = [];
          try {
            list = JSON.parse(
              localStorage.getItem("track_orders_saved_phones") || "[]",
            );
          } catch (_) {}
          if (!Array.isArray(list)) list = [];
          list = [digits, ...list.filter((x) => x !== digits)].slice(0, 5);
          localStorage.setItem(
            "track_orders_saved_phones",
            JSON.stringify(list),
          );
        }
      } catch (_) {}
      setIsOpen(false);
      setShowScratch(true);
      return;
    }

    setTimeout(() => {
      setIsOpen(false);
    }, 1500);
  };

  const handleSkip = () => {
    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : null;

    trackFunnelEvent(EVENTS.PINCODE_SKIPPED, {
      time_spent_seconds: timeSpent,
      has_pincode_input: !!pincode,
      has_phone_input: !!phoneNumber,
    });

    // Submit skip to Google Form ONLY on manual skip
    trackPincodeToGoogleForm({
      pincode: pincode || "skipped",
      phone: phoneNumber,
      type: "skip",
      time_spent: timeSpent,
    });

    localStorage.setItem(PINCODE_STORAGE_KEY, Date.now().toString());
    setIsOpen(false);
  };

  const handleOutsideClick = () => {
    const timeSpent = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : null;

    // DO NOT send to Google Form on outside click
    trackFunnelEvent("pincode_outside_click", {
      time_spent_seconds: timeSpent,
      has_pincode_input: !!pincode,
      has_phone_input: !!phoneNumber,
    });

    localStorage.setItem(PINCODE_STORAGE_KEY, Date.now().toString());
    setIsOpen(false);
  };

  // Track when user starts typing pincode
  const handlePincodeChange = (value) => {
    const newValue = value.replace(/\D/g, "");
    setPincode(newValue);
    setError("");

    if (newValue.length === 6) {
      trackFunnelEvent(EVENTS.PINCODE_MANUAL_ENTRY, {
        pincode_complete: true,
      });
    }
  };

  const event = getActiveEvent();
  const xmas = event.key === "christmas";

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bill-modal-overlay"
            style={{ maxWidth: "980px", margin: "0 auto" }}
            onClick={handleOutsideClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`bill-modal${stage === "teaser" ? "" : " pinfs-modal"}`}
              onClick={(e) => e.stopPropagation()}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {stage === "teaser" ? (
                <>
                  <div className="bill-header">
                    <span className="weight-600 font-16">
                      {event.emoji} {event.title}
                    </span>
                    <span className="cursor-pointer" onClick={handleSkip}>
                      <X size={16} />
                    </span>
                  </div>

                  <div className="pin-teaser">
                    <button
                      type="button"
                      className="pin-teaser-card"
                      onClick={() => setStage("form")}
                      aria-label="Scratch to reveal your reward"
                      style={{ background: event.gradient }}
                    >
                      <span className="pin-teaser-shine" />
                      <span className="pin-teaser-inner">
                        <span style={{ fontSize: 30 }}>{event.emoji}</span>
                        <span className="pin-teaser-t">Scratch to reveal</span>
                        <span className="pin-teaser-hint">Tap to start</span>
                      </span>
                    </button>

                    <p className="pin-teaser-copy">
                      {event.sub}. Just add your <b>mobile number</b> to unlock,
                      scratch it, and see your orders &amp; wallet.
                    </p>

                    <button
                      type="button"
                      className="pri-big-btn width100"
                      onClick={() => setStage("form")}
                    >
                      Scratch &amp; reveal
                    </button>
                    <button
                      type="button"
                      className="pin-teaser-skip"
                      onClick={handleSkip}
                    >
                      Skip for now
                    </button>
                  </div>
                </>
              ) : (
                <div className={`pinfs${xmas ? " pinfs-xmas" : ""}`}>
                  {xmas ? (
                    <>
                      {/* Christmas: hero look — rose backdrop, garland, snow, baubles */}
                      <XmasSnow className="pinfs-snow" density={0.7} max={50} />
                      <XmasGarland
                        className="pinfs-garland"
                        baubles={[
                          { l: 8, len: 16, c: "red", d: 0 },
                          { l: 24, len: 26, c: "gold", d: 0.5 },
                          { l: 76, len: 22, c: "red", d: 0.3 },
                          { l: 92, len: 14, c: "gold", d: 0.8 },
                        ]}
                      />
                    </>
                  ) : (
                    <>
                      {/* Sunburst + floating coins/books */}
                      <div className="pinfs-rays" aria-hidden="true" />
                      <span className="pinfs-float c1" aria-hidden="true">₹</span>
                      <span className="pinfs-float c2" aria-hidden="true">₹</span>
                      <span className="pinfs-float c3" aria-hidden="true">₹</span>
                      <span className="pinfs-float b1" aria-hidden="true">📚</span>
                      <span className="pinfs-float b2" aria-hidden="true">🔖</span>
                    </>
                  )}

                  <button type="button" className="pinfs-x" onClick={handleSkip} aria-label="Close">
                    <X size={20} />
                  </button>

                  <div className="pinfs-top">
                    <span className={`pinfs-brand${xmas ? " hx-capped" : ""}`}>
                      {xmas ? "TheBookX · Christmas gift" : "TheBookX"}
                    </span>
                    <h2 className="pinfs-h">
                      Scratch &amp; win
                      <br />
                      <em>wallet cash</em>
                    </h2>
                    <p className="pinfs-sub">Add your mobile number to unlock your scratch card</p>
                  </div>

                  <div className="pinfs-badge" aria-hidden="true">
                    {xmas && <XmasTree size={70} gifts={false} className="pinfs-tree l" />}
                    {xmas && <XmasTree size={86} className="pinfs-tree r" />}
                    <span className="pinfs-crown">{event.emoji || "🪔"}</span>
                    <span className="pinfs-badge-in">
                      <b>Scratch</b>
                      <b>&amp; Win</b>
                    </span>
                  </div>

                  <div className="pinfs-form">
                    <label className="pinfs-lbl" htmlFor="pinfs-phone">
                      Mobile number
                    </label>
                    <div className={`pinfs-phone${error ? " err" : ""}`}>
                      <span className="pinfs-cc">+91</span>
                      <input
                        id="pinfs-phone"
                        placeholder="10-digit mobile number"
                        value={phoneNumber}
                        maxLength={10}
                        inputMode="numeric"
                        autoComplete="tel-national"
                        onChange={(e) => {
                          setPhoneNumber(e.target.value.replace(/\D/g, ""));
                          if (error) setError("");
                        }}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                      />
                      {phoneNumber.length === 10 && <Check size={18} className="pinfs-ok" />}
                    </div>
                    {error ? (
                      <span className="pinfs-err">{error}</span>
                    ) : (
                      <span className="pinfs-help">For offers, order updates &amp; your wallet</span>
                    )}

                    <span className="pinfs-lbl2">
                      Where did you find us? <small>(optional)</small>
                    </span>
                    <div className="pinfs-chips">
                      {[...SOURCE_CHIPS, "Others"].map((c) => (
                        <button
                          type="button"
                          key={c}
                          className={`pinfs-chip${source === c ? " on" : ""}`}
                          onClick={() => {
                            setSource(c);
                            setShowOtherSource(c === "Others");
                          }}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    {showOtherSource && (
                      <input
                        className="pinfs-other"
                        placeholder="Tell us where (e.g. friend, WhatsApp)"
                        value={otherSource}
                        maxLength={40}
                        onChange={(e) => setOtherSource(e.target.value)}
                      />
                    )}
                    {locationData && (
                      <span className="pinfs-loc">
                        Delivery available to {locationData.city}, {locationData.state}
                      </span>
                    )}
                  </div>

                  <div className="pinfs-foot">
                    <small className="pinfs-tc">*T&amp;C apply</small>
                    <LoadingButton
                      className={`pinfs-cta${xmas ? " hx-capped" : ""}`}
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? "Unlocking…" : "Unlock & scratch"}
                    </LoadingButton>
                    <button type="button" className="pinfs-skip" onClick={handleSkip}>
                      Skip for now
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward scratch card — slides up after a phone number is submitted */}
      <ScratchRewardSheet
        open={showScratch}
        onClose={closeScratch}
        onViewProfile={
          String(phoneNumber || "").replace(/\D/g, "").length >= 10
            ? goToProfile
            : undefined
        }
        eligible={scratchEligible}
        reward={scratchReward}
        scratched={scratchDone}
        onScratch={handleScratchComplete}
        note={
          scratchEligible ? (
            <>
              <strong>₹{scratchReward} added to your wallet.</strong> Use it on
              your next order — you can see it in your profile.
            </>
          ) : (
            <>
              No reward this time. Your books are still at the lowest prices, so happy
              shopping!
            </>
          )
        }
      />
    </>
  );
}
