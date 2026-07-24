"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { X, MapPin, Truck, ShieldCheck, Clock, Phone, Gift } from "lucide-react";
import LoadingButton from "./LoadingButton";
import { trackFunnelEvent } from "@/lib/analytics";
import { EVENTS } from "@/lib/trackingEvents";
import { useTrackView } from "@/lib/trackingHooks";
import { trackPincodeToGoogleForm } from "@/utils/googleForm";
import ScratchCard from "./ScratchCard";
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
    if (!pincode || pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode");
      trackFunnelEvent(EVENTS.PINCODE_SUBMITTED, {
        status: "error",
        error_reason: "invalid_pincode",
        pincode_length: pincode.length,
      });
      return;
    }

    setLoading(true);
    setError("");

    const location = await fetchLocationDetails(pincode);
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
    // Only credit shoppers who don't already hold ₹30+ in their wallet.
    if (phoneNumber && phoneNumber.length === 10) {
      const balance = await fetchWalletBalance(phoneNumber);
      const eligible = balance < 30;
      setScratchEligible(eligible);
      setScratchReward(eligible ? 11 + Math.floor(Math.random() * 30) : 0);
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
            {/* Header */}
            <div className="bill-header">
              <span className="weight-600 font-16">📍 Share Your Location</span>
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
                    Enter Pincode <span className="red">*</span>
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
                {/* Optional Phone Number Field */}
                <div className="input-group">
                  <label className="flex flex-row gap-4 flex-center items-center">
                    <Phone size={14} />
                    Phone Number <span className="gray-500">(Optional)</span>
                  </label>
                  <input
                    className="sec-mid-btn"
                    placeholder="Enter 10-digit mobile number"
                    value={phoneNumber}
                    maxLength={10}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
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
                    <span>Fill your details &amp; win big with a scratch card!</span>
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
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit"}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* 🎁 Reward scratch card — slides up after a phone number is submitted */}
    <AnimatePresence>
      {showScratch && (
        <motion.div
          className="bill-modal-overlay"
          style={{ maxWidth: "980px", margin: "0 auto" }}
          onClick={closeScratch}
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
            <div className="bill-header">
              <span className="weight-600 font-16 flex flex-row items-center gap-8">
                <Gift size={17} style={{ color: "var(--tertiary)" }} /> A little
                gift for you!
              </span>
              <span className="cursor-pointer" onClick={closeScratch}>
                <X size={16} />
              </span>
            </div>

            <div className="scratch-modal-body">
              <p className="scratch-modal-sub">
                Thanks for sharing your details 💛 Scratch the card below to
                reveal your reward.
              </p>
              <div className="cod-reward-card-wrap">
                <ScratchCard
                  width={280}
                  height={160}
                  revealText={
                    scratchEligible
                      ? `₹${scratchReward} won! 🎉`
                      : "Better luck next time"
                  }
                  revealSub={
                    scratchEligible
                      ? "Added to your TheBookX wallet"
                      : "You already have wallet credit 💛"
                  }
                  onComplete={handleScratchComplete}
                />
              </div>
              {scratchDone && (
                <div className="cod-reward-note">
                  {scratchEligible ? (
                    <>
                      <strong>₹{scratchReward} added to your wallet.</strong>{" "}
                      Use it on your next order — you can see it in your profile.
                    </>
                  ) : (
                    <>
                      You already have wallet credit waiting for you. Use it on
                      your next order!
                    </>
                  )}
                </div>
              )}
              <button
                className="pri-big-btn width100"
                onClick={closeScratch}
                style={{ marginTop: 12 }}
              >
                {scratchDone ? "Awesome, thanks!" : "Maybe later"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
