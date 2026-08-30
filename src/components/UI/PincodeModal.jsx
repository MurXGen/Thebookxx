"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Truck,
  ShieldCheck,
  Clock,
  Phone,
  Gift,
} from "lucide-react";
import LoadingButton from "./LoadingButton";
import { trackFunnelEvent } from "@/lib/analytics";
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
  // Diwali-ish window (rough): late Oct – mid Nov
  if ((m === 9 && d >= 20) || (m === 10 && d <= 15)) {
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
  const SOURCE_CHIPS = ["Google", "Instagram", "Facebook", "YouTube"];
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
              className="bill-modal"
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
                <>
                  {/* Header */}
                  <div className="bill-header">
                    <span className="weight-600 font-16">
                      {event.emoji} Enter your number to unlock
                    </span>
                    <span className="cursor-pointer" onClick={handleSkip}>
                      <X size={16} />
                    </span>
                  </div>

                  <div className="address-form-content flex flex-col gap-12">
                    <div className="flex flex-col">
                      {/* Phone Number (only field now — no pincode) */}
                      <div className="input-group">
                        <label className="flex flex-row gap-4 flex-center items-center">
                          <Phone size={14} />
                          Mobile Number <span className="red">*</span>
                        </label>
                        <input
                          className={`sec-mid-btn ${error ? "error-border" : ""}`}
                          placeholder="Enter 10-digit mobile number"
                          value={phoneNumber}
                          maxLength={10}
                          inputMode="numeric"
                          onChange={(e) =>
                            setPhoneNumber(e.target.value.replace(/\D/g, ""))
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSubmit()
                          }
                        />
                        {error && (
                          <span className="font-12 red flex items-center gap-4 mt-4">
                            <span></span>
                            {error}
                          </span>
                        )}
                        <span className="font-10 gray-500 mt-4">
                          Get notified about special offers and delivery updates
                        </span>

                        {/* 3D teaser stripe — nudges the shopper to add their number
                      so they can win a wallet reward on submit */}
                        <div className="pin-win-stripe">
                          <svg
                            className="pin-scratch-ic"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                            aria-hidden="true"
                          >
                            <rect
                              x="2.5"
                              y="4.5"
                              width="19"
                              height="15"
                              rx="3"
                              fill="#fb8500"
                            />
                            <rect
                              x="5"
                              y="7"
                              width="14"
                              height="10"
                              rx="2"
                              fill="#ffe0a3"
                            />
                            <path
                              d="M6.5 12h9"
                              stroke="#c25e00"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeDasharray="1.5 2.4"
                            />
                            <circle
                              cx="17.5"
                              cy="7"
                              r="3.4"
                              fill="#ffd166"
                              stroke="#c25e00"
                              strokeWidth="1"
                            />
                          </svg>
                          <span>
                            Fill your details &amp;{" "}
                            <span className="pin-win-emph">
                              WIN A SCRATCH CARD
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Optional: where did you hear about us? (chip badges) */}
                    <div className="pin-source">
                      <span className="pin-source-label">
                        Where did you find us?{" "}
                        <span className="pin-source-opt">(optional)</span>
                      </span>
                      <div className="pin-source-chips">
                        {SOURCE_CHIPS.map((c) => (
                          <button
                            type="button"
                            key={c}
                            className={`pin-source-chip${source === c ? " active" : ""}`}
                            onClick={() => {
                              setSource(c);
                              setShowOtherSource(false);
                            }}
                          >
                            {c}
                          </button>
                        ))}
                        <button
                          type="button"
                          className={`pin-source-chip${source === "Others" ? " active" : ""}`}
                          onClick={() => {
                            setSource("Others");
                            setShowOtherSource(true);
                          }}
                        >
                          Others
                        </button>
                      </div>
                      {showOtherSource && (
                        <input
                          className="sec-mid-btn pin-source-other"
                          placeholder="Tell us where (e.g. friend, WhatsApp)"
                          value={otherSource}
                          maxLength={40}
                          onChange={(e) => setOtherSource(e.target.value)}
                        />
                      )}
                    </div>

                    {/* Benefits — scrolling marquee, items split by a dot */}
                    <div className="pin-marquee">
                      <div className="pin-marquee-track">
                        {[0, 1].map((k) => (
                          <span
                            className="pin-marquee-group"
                            key={k}
                            aria-hidden={k === 1}
                          >
                            <span className="pin-marquee-item">
                              Check delivery availability
                            </span>
                            <span className="pin-marquee-sep">•</span>
                            <span className="pin-marquee-item">
                              Estimated delivery time
                            </span>
                            <span className="pin-marquee-sep">•</span>
                            <span className="pin-marquee-item">
                              Better recommendations
                            </span>
                            <span className="pin-marquee-sep">•</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="dashed-border my-12"></div>

                    {/* Buttons */}
                    <div className="flex flex-row gap-12">
                      <button
                        className="sec-mid-btn width100"
                        onClick={handleSkip}
                      >
                        Skip for now
                      </button>
                      <LoadingButton
                        className="pri-big-btn width100"
                        onClick={handleSubmit}
                        disabled={loading || phoneNumber.length !== 10}
                      >
                        {loading ? "Unlocking..." : "Unlock & scratch "}
                      </LoadingButton>
                    </div>

                    {locationData && (
                      <div className="flex flex-row flex-center gap-4 green items-center infoMessage mt-12">
                        <span></span>
                        <span className="font-12">
                          Delivery available to {locationData.city},{" "}
                          {locationData.state}
                        </span>
                      </div>
                    )}
                  </div>
                </>
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
              You already have wallet credit waiting for you. Use it on your
              next order!
            </>
          )
        }
      />
    </>
  );
}
