// lib/trackingEvents.js

// ============ STAGE 1: LANDING ============
export const EVENTS = {
  // Intro
  INTRO_VIEWED: "intro_video_viewed",
  INTRO_SKIPPED: "intro_video_skipped",
  INTRO_COMPLETED: "intro_video_completed",

  // Pincode
  PINCODE_MODAL_VIEWED: "pincode_modal_viewed",
  PINCODE_SUBMITTED: "pincode_submitted",
  PINCODE_SKIPPED: "pincode_skipped",
  PINCODE_AUTO_FILLED: "pincode_auto_filled",

  // Unlock Offer
  UNLOCK_MODAL_VIEWED: "unlock_offer_modal_viewed",
  UNLOCK_CLICKED: "unlock_offer_clicked",
  UNLOCK_SKIPPED: "unlock_offer_skipped",
  UNLOCK_TIMER_STARTED: "unlock_timer_started",
  UNLOCK_TIMER_EXPIRED: "unlock_timer_expired",
  UNLOCK_PERMANENT: "unlock_permanent_achieved",

  // Book Interactions
  ONE_RUPEE_BOOK_VIEWED: "one_rupee_book_viewed",
  ONE_RUPEE_BOOK_CLICKED: "one_rupee_book_clicked",
  ONE_RUPEE_BOOK_ADDED: "one_rupee_book_added",
  ONE_RUPEE_BOOK_ADD_BLOCKED: "one_rupee_book_add_blocked",
  REGULAR_BOOK_VIEWED: "regular_book_viewed",
  REGULAR_BOOK_ADDED: "regular_book_added",

  // Cart
  CART_TOTAL_MILESTONE: "cart_total_milestone",
  CART_VALUE_UPDATED: "cart_value_updated",
  UNLOCK_PROGRESS_VIEWED: "unlock_progress_viewed",

  // Checkout
  CHECKOUT_BUTTON_CLICKED: "checkout_button_clicked",
  BAG_PAGE_VIEWED: "bag_page_viewed",
  BAG_PAGE_EXIT: "bag_page_exit",
  ADDRESS_MODAL_OPENED: "address_modal_opened",

  // Address Form
  PINCODE_MANUAL_ENTRY: "pincode_manual_entry",
  PINCODE_AUTO_POPULATED: "pincode_auto_populated",
  ADDRESS_FORM_COMPLETED: "address_form_completed",

  // Delivery
  DELIVERY_SPEED_MODAL_OPENED: "delivery_speed_modal_opened",
  DELIVERY_SPEED_SELECTED: "delivery_speed_selected",
  GIFT_WRAP_TOGGLED: "gift_wrap_toggled",

  // Payment
  PAYMENT_METHOD_SELECTED: "payment_method_selected",
  COD_PAYMENT_INITIATED: "cod_payment_initiated",
  COD_PARTIAL_PAYMENT_CLICKED: "cod_partial_payment_clicked",
  COD_QR_REVEALED: "cod_qr_revealed",
  COD_PAYMENT_VERIFIED: "cod_payment_verified",

  UPI_PAYMENT_INITIATED: "upi_payment_initiated",
  UPI_QR_REVEALED: "upi_qr_revealed",
  UPI_LINK_COPIED: "upi_link_copied",
  UPI_QR_DOWNLOADED: "upi_qr_downloaded",
  UPI_PAYMENT_VERIFIED: "upi_payment_verified",

  WHATSAPP_CHAT_CLICKED: "whatsapp_chat_clicked",
  WHATSAPP_DESKTOP_MODAL_SHOWN: "whatsapp_desktop_modal_shown",
  WHATSAPP_LINK_COPIED: "whatsapp_link_copied",
  WHATSAPP_MESSAGE_SENT: "whatsapp_message_sent",

  // Conversion
  ORDER_CONFIRMED: "order_confirmed",
  ORDER_EXPORTED_TO_COLIST: "order_exported_to_colist",

  // Bill Modal
  BILL_MODAL_VIEWED: "bill_modal_viewed",
  BILL_MODAL_CLOSED: "bill_modal_closed",
};

// Milestone thresholds
export const MILESTONES = {
  CHECKOUT_MIN: 151,
  UNLOCK_THRESHOLD: 299,
  FREE_DELIVERY: 400,
  DISCOUNT_100: 650,
  DISCOUNT_250: 1000,
  DISCOUNT_500: 2000,
};
