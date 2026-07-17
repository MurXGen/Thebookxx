// utils/googleFormOrder.js

const GOOGLE_FORM_ORDER_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc3dUHr_S01ODuvQpok_8n0tG0ezfUPD5NLK0M_tyms25I-eQ/formResponse";

// Field IDs from your Google Form URL
const FORM_FIELD_IDS = {
  orderId: "entry.1840449230",
  customerName: "entry.669641354",
  phone: "entry.1941153221",
  pincode: "entry.778741327",
  city: "entry.1428299588",
  state: "entry.1558326929",
  address: "entry.733437133",
  booksList: "entry.473272273",
  totalAmount: "entry.1597483561",
  paymentType: "entry.1012308641",
  deliveryType: "entry.1881073537",
  deliveryCharge: "entry.979604882",
  giftWrap: "entry.10443444",
  giftWrapCharge: "entry.713637223",
  offerApplied: "entry.1246399200",
  tinyUrl: "entry.76337166",
  orderStatus: "entry.1458161030",
  advancePaid: "entry.392734436",
  timestamp: "entry.509242940",
  userAgent: "entry.2060171385",
};

// Helper function to get delivery charge (you may need to import or define this)
const getDeliveryChargeValue = (totalDiscounted, isFasterDelivery) => {
  // This should match your existing delivery charge logic
  // For now, returning a default - you can replace with your actual function
  if (isFasterDelivery) return 119;
  if (totalDiscounted < 399) return 100;
  if (totalDiscounted < 599) return 0;
  if (totalDiscounted < 799) return 49;
  return Math.min(Math.round(totalDiscounted * 0.1), 500);
};

// Helper function to get delivery label
const getDeliveryLabelValue = (totalDiscounted, isFasterDelivery) => {
  if (isFasterDelivery) {
    if (totalDiscounted >= 799) return "Priority Express";
    return "Express Delivery";
  }
  if (totalDiscounted >= 799) return "Bulk Order Handling";
  if (totalDiscounted >= 599) return "Small Handling Fee";
  if (totalDiscounted >= 399) return "Free Delivery";
  return "Standard Delivery";
};

// Submit order data to Google Form
export const submitOrderToGoogleForm = async (orderData) => {
  try {
    const params = new URLSearchParams();

    Object.keys(orderData).forEach((key) => {
      if (
        FORM_FIELD_IDS[key] &&
        orderData[key] !== undefined &&
        orderData[key] !== null &&
        orderData[key] !== ""
      ) {
        params.append(FORM_FIELD_IDS[key], String(orderData[key]));
      }
    });

    const response = await fetch(GOOGLE_FORM_ORDER_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    console.log("Submitted order to Google Form:", orderData);
    return { success: true };
  } catch (error) {
    console.error("Error submitting order to Google Form:", error);
    return { success: false, error };
  }
};

// Format books list for Google Form
const formatBooksList = (cartBooks) => {
  if (!cartBooks || cartBooks.length === 0) return "";
  return cartBooks
    .map(
      (book, index) =>
        `${index + 1}. ${book.name} | Qty: ${book.qty} | ₹${book.discountedPrice} each | Total: ₹${book.discountedPrice * book.qty}`,
    )
    .join("\n");
};

// Track order to Google Form
export const trackOrderToGoogleForm = async (orderDetails) => {
  const {
    addressData,
    paymentType,
    fasterDeliveryChoice,
    giftWrapSelected,
    shortLink,
    totalWithDelivery,
    finalPayable,
    totalDiscounted,
    offerDiscount,
    offerLabel,
    walletUsed = 0,
    walletPhone = "",
    cartBooks,
  } = orderDetails;

  const deliveryCharge = getDeliveryChargeValue(
    totalDiscounted,
    fasterDeliveryChoice,
  );
  const deliveryLabel = getDeliveryLabelValue(
    totalDiscounted,
    fasterDeliveryChoice,
  );
  const formattedBooksList = formatBooksList(cartBooks);

  const now = new Date();
  const formattedTimestamp = now.toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const formData = {
    orderId: `ORD${Date.now()}`,
    customerName: addressData.name || "",
    phone: addressData.phone || "",
    pincode: addressData.pincode || "",
    city: addressData.city || "",
    state: addressData.state || "",
    address: addressData.address || "",
    booksList: formattedBooksList,
    totalAmount: totalWithDelivery || finalPayable,
    paymentType: paymentType === "COD" ? "Cash on Delivery" : "UPI Payment",
    deliveryType: fasterDeliveryChoice
      ? `Faster Delivery (${deliveryLabel})`
      : `Standard Delivery (${deliveryLabel})`,
    deliveryCharge: deliveryCharge || 0,
    giftWrap: giftWrapSelected ? "Yes" : "No",
    giftWrapCharge: giftWrapSelected ? 50 : 0,
    offerApplied:
      (offerDiscount > 0 ? `${offerLabel} (₹${offerDiscount} OFF)` : "None") +
      (walletUsed > 0
        ? ` · Wallet used ₹${walletUsed}${walletPhone ? ` (${walletPhone})` : ""}`
        : ""),
    tinyUrl: shortLink || "",
    orderStatus: "Pending",
    timestamp: formattedTimestamp,
    userAgent:
      typeof navigator !== "undefined"
        ? navigator.userAgent.substring(0, 500)
        : "",
  };

  // Send to GA as well
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "order_google_form", {
      event_category: "order",
      order_id: formData.orderId,
      total_amount: formData.totalAmount,
      payment_type: formData.paymentType,
    });
  }

  return submitOrderToGoogleForm(formData);
};
