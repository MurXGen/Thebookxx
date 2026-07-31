"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, MapPin, Truck, ShieldCheck, Clock, Phone, Gift } from "lucide-react";
import LoadingButton from "./LoadingButton";
import { trackFunnelEvent } from "@/lib/analytics";
import { EVENTS } from "@/lib/trackingEvents";
import { useTrackView } from "@/lib/trackingHooks";
import { trackPincodeToGoogleForm } from "@/utils/googleForm";
import ScratchRewardSheet from "./ScratchRewardSheet";
import { fetchWalletBalance, creditWalletReward } from "@/utils/googleFormOrder";

const PINCODE_STORAGE_KEY = "pincode_modal_last_shown";
const PINCODE_DATA_KEY = "user_pincode";

export default function PincodeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  // Funnel stage inside the modal: teaser scratch card → details form.
  // (The real, scratchable reveal is the ScratchRewardSheet shown after submit.)
  const [stage, setStage] = useState("teaser"); // "teaser" | "form"
  // Scratch-card reward shown after submit (only when a phone number is given).
  const [showScratch, setShowScratch] = useState(false);
  const [scratchEligible, setScratchEligible] = useState(false);
  const [scratchReward, setScratchReward] = useState(0);
  const [scratchDone, setScratchDone] = useState(false);

  const handleScratchComplete = async () => {
    if (scratchDone) return;
    setScratchDone(true);
    if (scratchEligible && scratchReward > 0) {
      await creditWalletReward(phoneNumber, scratchReward);
    }
  };
  const closeScratch = () => setShowScratch(false);

  // Auto-log-in this number into the profile (overrides any existing), then
  // send the shopper to their profile.
  const goToProfile = () => {
    const digits = String(phoneNumber || "").replace(/\D/g, "").slice(-10);
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
  // if the user already gave a pincode). We no longer pop it on first paint,   // instead it triggers on the first engagement signal (scroll past the hero)
  // or after a generous delay, so visitors always see the store first.
  useEffect(() => {
    const lastShown = localStorage.getItem(PINCODE_STORAGE_KEY);
    const savedPincode = localStorage.getItem(PINCODE_DATA_KEY);

    if (savedPincode) return; // already captured, never nag

    if (lastShown) {
      const hoursPassed = (Date.now() - parseInt(lastShown, 10)) / (1000 * 60 * 60);
      if (hoursPassed < 24) return; // shown recently, respect the cooldown
    }

    let done = false;
    const open = () => {
      if (done) return;
      done = true;
      setStage("teaser");
      setIsOpen(true);
      setStartTime(Date.now());
      cleanup();
    };

    // Trigger on engagement (scrolled past the hero) …
    const onScroll = () => {
      if (window.scrollY > 600) open();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // … or after a generous delay so it never blocks the first impression.
    const timer = setTimeout(open, 8000);

    function cleanup() {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    }
    return cleanup;
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

    // ✅ Submit to Google Form ONLY on manual submit
    await trackPincodeToGoogleForm({
      pincode: pincode,
      city: location?.city,
      state: location?.state,
      phone: phoneNumber,
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
    // The total wallet balance is capped at ₹16 for pincode rewards.
    if (phoneNumber && phoneNumber.length === 10) {
      const balance = await fetchWalletBalance(phoneNumber);
      // Eligible only if there's room below ₹16. Reward is ₹11–16, and still
      // capped so the balance never crosses ₹16 (e.g. balance ₹10 → max ₹6).
      const room = 16 - balance;
      const eligible = room > 0;
      let rew = 0;
      if (eligible) {
        rew = 11 + Math.floor(Math.random() * 6); // ₹11–16
        if (rew > room) rew = room; // never let balance + reward exceed ₹16
      }
      setScratchEligible(eligible);
      setScratchReward(rew);
      setScratchDone(false);
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

    // ✅ Submit skip to Google Form ONLY on manual skip
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

    // ❌ DO NOT send to Google Form on outside click
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
                    🎁 You&apos;ve won a scratch card
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
                  >
                    <span className="pin-teaser-shine" />
                    <span className="pin-teaser-inner">
                      <Gift size={30} />
                      <span className="pin-teaser-t">Scratch to reveal</span>
                      <span className="pin-teaser-hint">Tap to start</span>
                    </span>
                  </button>

                  <p className="pin-teaser-copy">
                    A wallet reward is hiding under here. Add your{" "}
                    <b>mobile number</b> to unlock and scratch it.
                  </p>

                  <button
                    type="button"
                    className="pri-big-btn width100"
                    onClick={() => setStage("form")}
                  >
                    Scratch &amp; reveal →
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
                📍 Enter details to unlock
              </span>
              <span className="cursor-pointer" onClick={handleSkip}>
                <X size={16} />
              </span>
            </div>

            <div className="address-form-content flex flex-col gap-12">
              <div className="flex flex-col">
                {" "}
                <div className="input-group">
                  <label className="flex flex-row gap-4 flex-center items-center">
                    <MapPin size={14} />
                    Enter Pincode <span className="gray-500">(Optional)</span>
                  </label>
                  <input
                    className={`sec-mid-btn ${error ? "error-border" : ""}`}
                    placeholder="Enter 6 digit pincode"
                    value={pincode}
                    maxLength={6}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  />
                  {error && (
                    <span className="font-12 red flex items-center gap-4 mt-4">
                      <span>⚠️</span>
                      {error}
                    </span>
                  )}
                </div>
                {/* Phone Number (required) */}
                <div className="input-group">
                  <label className="flex flex-row gap-4 flex-center items-center">
                    <Phone size={14} />
                    Phone Number <span className="red">*</span>
                  </label>
                  <input
                    className="sec-mid-btn"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    maxLength={10}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  />
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
                      <span className="pin-win-emph">WIN A SCRATCH CARD</span>
                    </span>
                  </div>
                </div>
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
                <button className="sec-mid-btn width100" onClick={handleSkip}>
                  Skip for now
                </button>
                <LoadingButton
                  className="pri-big-btn width100"
                  onClick={handleSubmit}
                  disabled={loading || phoneNumber.length !== 10}
                >
                  {loading ? "Unlocking..." : "Unlock & scratch 🎁"}
                </LoadingButton>
              </div>

              {locationData && (
                <div className="flex flex-row flex-center gap-4 green items-center infoMessage mt-12">
                  <span>✓</span>
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

    {/* 🎁 Reward scratch card — slides up after a phone number is submitted */}
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
            You already have wallet credit waiting for you. Use it on your next
            order!
          </>
        )
      }
    />
    </>
  );
}
