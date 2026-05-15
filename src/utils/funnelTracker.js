// utils/funnelTracker.js
import { trackFunnelEvent } from "@/lib/analytics";
import { EVENTS, MILESTONES } from "@/lib/trackingEvents";

// Track user entry to a funnel step
export const trackStepEntry = (stepName, metadata = {}) => {
  trackFunnelEvent(`${stepName}_entered`, {
    funnel_step: stepName,
    ...metadata,
  });
};

// Track user completion of a funnel step
export const trackStepCompletion = (stepName, timeSpent, metadata = {}) => {
  trackFunnelEvent(`${stepName}_completed`, {
    funnel_step: stepName,
    time_spent_seconds: timeSpent,
    ...metadata,
  });
};

// Track user exit from a funnel step
export const trackStepExit = (stepName, exitReason, metadata = {}) => {
  trackFunnelEvent(`${stepName}_exited`, {
    funnel_step: stepName,
    exit_reason: exitReason,
    ...metadata,
  });
};

// Track cart milestones automatically
export const checkCartMilestone = (currentTotal, previousTotal) => {
  const milestones = [
    MILESTONES.CHECKOUT_MIN,
    MILESTONES.UNLOCK_THRESHOLD,
    MILESTONES.FREE_DELIVERY,
    MILESTONES.DISCOUNT_100,
    MILESTONES.DISCOUNT_250,
    MILESTONES.DISCOUNT_500,
  ];

  for (const milestone of milestones) {
    if (previousTotal < milestone && currentTotal >= milestone) {
      trackFunnelEvent(EVENTS.CART_TOTAL_MILESTONE, {
        threshold: milestone,
        cart_total: currentTotal,
        milestone_type:
          milestone === MILESTONES.UNLOCK_THRESHOLD
            ? "unlock"
            : milestone === MILESTONES.FREE_DELIVERY
              ? "free_delivery"
              : milestone === MILESTONES.CHECKOUT_MIN
                ? "checkout_eligible"
                : "discount",
      });
    }
  }
};

// Track ₹1 book interaction with lock status
export const trackOneRupeeInteraction = (book, action, isLocked, cartTotal) => {
  trackFunnelEvent(action, {
    book_id: book.id,
    book_name: book.name,
    is_locked: isLocked,
    cart_total: cartTotal,
    remaining_to_unlock: Math.max(0, MILESTONES.UNLOCK_THRESHOLD - cartTotal),
  });
};
