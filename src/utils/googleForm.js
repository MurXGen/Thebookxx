// utils/googleForm.js

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSc2a9NsuUaO9fSUYHyYH-vTvHW4v2u6qGlI_vcMFWsS-_ap2A/formResponse";

// Field IDs from your Google Form URL
const FORM_FIELD_IDS = {
  pincode: "entry.1661590625",
  city: "entry.1108240843",
  state: "entry.1045204168",
  phone: "entry.1161896266",
  submissionType: "entry.1508265995",
  timestamp: "entry.537496086",
  userAgent: "entry.1678458421",
  referrer: "entry.1681053085",
};

// Submit data to Google Form
export const submitToGoogleForm = async (formData) => {
  try {
    const params = new URLSearchParams();

    Object.keys(formData).forEach((key) => {
      if (
        FORM_FIELD_IDS[key] &&
        formData[key] !== undefined &&
        formData[key] !== null &&
        formData[key] !== ""
      ) {
        params.append(FORM_FIELD_IDS[key], formData[key]);
      }
    });

    // Use no-cors to avoid CORS issues
    const response = await fetch(GOOGLE_FORM_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    // With no-cors, response is opaque, so we assume success
    console.log("Submitted to Google Form:", formData);
    return { success: true };
  } catch (error) {
    console.error("Error submitting to Google Form:", error);
    return { success: false, error };
  }
};

// Track pincode submission
export const trackPincodeToGoogleForm = async (data) => {
  // Format timestamp in a readable format (like "11:01am" from your URL)
  const now = new Date();
  const formattedTime = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedDate = now.toISOString();

  const formData = {
    pincode: data.pincode || "",
    city: data.city || "",
    state: data.state || "",
    phone: data.phone || "",
    submissionType: data.type || "submit", // submit, skip, auto_filled, outside_click
    timestamp: formattedTime,
    userAgent:
      typeof navigator !== "undefined"
        ? navigator.userAgent.substring(0, 500)
        : "",
    referrer:
      typeof document !== "undefined"
        ? document.referrer.substring(0, 500)
        : "",
  };

  // Also send to GA for analytics
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "pincode_google_form", {
      event_category: "pincode",
      event_label: data.type,
      pincode: data.pincode,
      city: data.city,
      state: data.state,
    });
  }

  return submitToGoogleForm(formData);
};
