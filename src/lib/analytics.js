// lib/analytics.js
import { trackEvent } from "@/lib/ga";

// Session ID generator
export const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID
export const getSessionId = () => {
  if (typeof window === "undefined") return null;
  let sessionId = sessionStorage.getItem("ga_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem("ga_session_id", sessionId);
  }
  return sessionId;
};

// Track funnel events with common parameters
export const trackFunnelEvent = (eventName, params = {}) => {
  const sessionId = getSessionId();

  // Get user state from localStorage
  const unlockData = JSON.parse(localStorage.getItem("oneRupeeOffer") || "{}");
  const pincodeData = JSON.parse(localStorage.getItem("user_pincode") || "{}");

  // Determine user status
  let userUnlockStatus = "never_unlocked";
  if (unlockData.permanentUnlocked) userUnlockStatus = "permanently_unlocked";
  else if (unlockData.timerUnlocked && !unlockData.timerExpired)
    userUnlockStatus = "timer_active";
  else if (unlockData.timerExpired) userUnlockStatus = "timer_expired";

  const defaultParams = {
    session_id: sessionId,
    user_unlock_status: userUnlockStatus,
    user_pincode_status: pincodeData.pincode ? "submitted" : "not_submitted",
    timestamp: new Date().toISOString(),
  };

  trackEvent(eventName, { ...defaultParams, ...params });
};

// Page view tracking
export const trackPageView = (pageName, additionalParams = {}) => {
  trackFunnelEvent("page_view", {
    page_name: pageName,
    page_url: typeof window !== "undefined" ? window.location.pathname : "",
    ...additionalParams,
  });
};
