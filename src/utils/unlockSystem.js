// utils/unlockSystem.js

const UNLOCK_KEY = "book_unlock_data";
const IP_UNLOCK_KEY = "user_ip_unlocked";

export const UNLOCK_CONFIG = {
  TIMER_DURATION: 10 * 60 * 1000, // 10 minutes in milliseconds
  RE_UNLOCK_THRESHOLD: 299, // ₹299 worth of books
};

// Get unlock data from localStorage
export const getUnlockData = () => {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(UNLOCK_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

// Save unlock data to localStorage
export const saveUnlockData = (data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(UNLOCK_KEY, JSON.stringify(data));
};

// Check if user has permanently unlocked
export const isPermanentlyUnlocked = () => {
  const unlockData = getUnlockData();
  return unlockData?.permanentlyUnlocked === true;
};

// Check if user is within the 10-minute timer window
export const isTimerActive = () => {
  const unlockData = getUnlockData();
  if (!unlockData || !unlockData.timerStartTime) return false;
  if (unlockData.permanentlyUnlocked) return false;

  const elapsed = Date.now() - unlockData.timerStartTime;
  return elapsed < UNLOCK_CONFIG.TIMER_DURATION;
};

// Get remaining time in milliseconds
export const getRemainingTime = () => {
  const unlockData = getUnlockData();
  if (!unlockData || !unlockData.timerStartTime) return 0;
  if (unlockData.permanentlyUnlocked) return 0;

  const elapsed = Date.now() - unlockData.timerStartTime;
  const remaining = UNLOCK_CONFIG.TIMER_DURATION - elapsed;
  return Math.max(0, remaining);
};

// Start the unlock timer (10 minutes)
export const startUnlockTimer = () => {
  const unlockData = {
    timerStartTime: Date.now(),
    permanentlyUnlocked: false,
    unlockedAt: Date.now(),
  };
  saveUnlockData(unlockData);
  return unlockData;
};

// Permanently unlock ₹1 books (after ₹299+ cart)
export const permanentlyUnlock = () => {
  const unlockData = getUnlockData() || {};
  unlockData.permanentlyUnlocked = true;
  unlockData.permanentlyUnlockedAt = Date.now();
  saveUnlockData(unlockData);
  return unlockData;
};

// Check if ₹1 book should be enabled for display/click
export const isOneRupeeBookEnabled = () => {
  // Check if permanently unlocked
  if (isPermanentlyUnlocked()) return true;

  // Check if timer is active
  if (isTimerActive()) return true;

  return false;
};

// Get reason why ₹1 book is disabled (for tooltip/message)
export const getDisabledReason = () => {
  if (isPermanentlyUnlocked()) return null;

  const remaining = getRemainingTime();
  if (remaining > 0) {
    const minutes = Math.ceil(remaining / 60000);
    return `Add more than ₹299 worth of books to unlock ₹1 books`;
  }

  return `Add more than ₹299 worth of books to unlock ₹1 books again`;
};

// Reset unlock state (for testing/debugging)
export const resetUnlockState = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(UNLOCK_KEY);
};

// Check if user's IP has permanently unlocked (backend sync)
// Call this after successful permanent unlock to sync with backend
export const syncUnlockWithBackend = async (ipAddress) => {
  try {
    await fetch("https://api.journalx.app/api/bookxTelegram/unlock-sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ipAddress,
        permanentlyUnlocked: true,
        timestamp: Date.now(),
      }),
    });
  } catch (error) {
    console.error("Error syncing unlock with backend:", error);
  }
};
