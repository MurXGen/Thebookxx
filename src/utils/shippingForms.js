// utils/shippingForms.js
// Canvas → PNG generators for India Post CDF-I declaration and FROM/TO
// address labels. Extracted so both the customer bag page and the
// manage-orders dashboard can export the same shipping documents.

import QRCode from "qrcode";

// Draw a QR code for `text` onto the 2D context as filled dark modules, fitting
// inside an `size`×`size` box at (x, y). Includes a white quiet-zone backing so
// it scans cleanly on the printed label. Returns true if it drew.
function drawQrCode(ctx, text, x, y, size) {
  if (!text) return false;
  try {
    const qr = QRCode.create(String(text), { errorCorrectionLevel: "M" });
    const n = qr.modules.size;
    const data = qr.modules.data;
    const quiet = 4; // modules of white margin
    const cell = size / (n + quiet * 2);
    // white backing
    ctx.fillStyle = "#fff";
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = "#000";
    for (let r = 0; r < n; r++) {
      for (let col = 0; col < n; col++) {
        if (data[r * n + col]) {
          ctx.fillRect(
            x + (col + quiet) * cell,
            y + (r + quiet) * cell,
            Math.ceil(cell),
            Math.ceil(cell),
          );
        }
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

export const SENDER = {
  name: "TheBookX",
  addressLines: [
    "Uskillbook, TheBookX",
    "Near Shilpa Sarees, Opp Apollo Pharmacy",
    "Maheshwari Udyan Circle, Matunga",
    "Mumbai - 400019",
  ],
  state: "Maharashtra",
  pincode: "400019",
  mobile: "7977960242 / 9702551037",
};

// Strict delivery instruction shown WHEN THE CUSTOMER DID NOT add a note.
// Orders are being returned/cancelled due to delivery negligence, so this is a
// firm (but polite) message to the delivery person — printed on the card and on
// the address label, in English + Hindi, with warning emoji.
export const POSTMAN_NOTE_EN =
  "⚠️ Please deliver this parcel to the customer even during heavy workload. If returned undelivered due to negligence, a formal complaint will be lodged. 🙏";
export const POSTMAN_NOTE_HI =
  "⚠️ कृपया यह पार्सल ग्राहक तक अवश्य पहुँचाएँ, चाहे काम का बोझ कितना भी हो। लापरवाही के कारण वापस लौटाने पर औपचारिक शिकायत दर्ज की जाएगी। 🙏";

// Which note to show: the customer's own note wins (and then the postman
// message is NOT shown); otherwise the strict bilingual delivery instruction.
export const deliveryNoteFor = (customerNote) => {
  const c = String(customerNote || "").trim();
  if (c) return { text: c, textHi: "", isCustomer: true };
  return { text: POSTMAN_NOTE_EN, textHi: POSTMAN_NOTE_HI, isCustomer: false };
};

// Build a 2× scaled canvas with consistent drawing helpers. Returns the
// canvas, ctx, and a small toolkit (text, rect, wrap, download).
// Lives at module level, pure, no component state.
export function buildCanvas(W, H) {
  const canvas = document.createElement("canvas");
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext("2d");
  ctx.scale(2, 2);
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#000";

  const text = (str, x, y, opts = {}) => {
    ctx.font = opts.font || "12px Poppins, sans-serif";
    ctx.fillStyle = opts.color || "#000";
    ctx.textAlign = opts.align || "left";
    ctx.textBaseline = opts.baseline || "alphabetic";
    ctx.fillText(String(str ?? ""), x, y);
  };
  const rect = (x, y, w, h, opts = {}) => {
    if (opts.fill) {
      ctx.fillStyle = opts.fill;
      ctx.fillRect(x, y, w, h);
    }
    if (opts.stroke !== false) {
      ctx.strokeStyle = opts.stroke || "#000";
      ctx.lineWidth = opts.width || 1;
      ctx.strokeRect(x, y, w, h);
    }
  };
  const wrap = (str, x, y, maxW, lineHeight, opts = {}) => {
    ctx.font = opts.font || "12px Poppins, sans-serif";
    ctx.fillStyle = opts.color || "#000";
    ctx.textAlign = "left";
    const words = String(str || "").split(" ");
    let line = "";
    let curY = y;
    for (const w of words) {
      const test = line + w + " ";
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line.trim(), x, curY);
        line = w + " ";
        curY += lineHeight;
      } else {
        line = test;
      }
    }
    if (line.trim()) ctx.fillText(line.trim(), x, curY);
    return curY;
  };
  const download = (filename) => {
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  // Draw a square checkbox at (x, y) with optional checkmark inside.
  // The checkmark is drawn with canvas path commands matching lucide-style
  // (two-segment stroke, rounded caps), in success green.
  const drawCheckbox = (x, y, size = 14, checked = false) => {
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "miter";
    ctx.strokeRect(x, y, size, size);
    if (checked) {
      ctx.strokeStyle = "#008f0c";
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(x + size * 0.2, y + size * 0.5);
      ctx.lineTo(x + size * 0.42, y + size * 0.72);
      ctx.lineTo(x + size * 0.8, y + size * 0.26);
      ctx.stroke();
    }
    ctx.restore();
  };

  return { canvas, ctx, W, H, text, rect, wrap, drawCheckbox, download };
}

// Draw the India Post CDF-I declaration form on the given canvas helper.
// Returns the y-coordinate where the form ends so callers can stack
// additional content below it (e.g. combined frame export).
export function drawDeclarationForm(c, startY, data) {
  const {
    orderId,
    customerName,
    customerAddress,
    customerState,
    customerPincode,
    customerPhone,
    totalValueRs,
    isCOD,
    codAmount,
  } = data;

  const X = 40;
  const W = c.W - 80;
  let y = startY;

  // ----- Title row -----
  c.rect(X, y, W, 60);
  c.text("CUSTOMER DECLARATION FORM (CDF-I)", c.W / 2, y + 24, {
    font: "bold 14px Poppins, sans-serif",
    align: "center",
  });
  c.text("INDIA POST / SPEED POST PARCEL", c.W / 2, y + 44, {
    font: "bold 12px Poppins, sans-serif",
    align: "center",
  });
  y += 60;

  // ----- CUSTOMER ID row -----
  const COL_LEFT_W = W * 0.3;
  c.rect(X, y, COL_LEFT_W, 45);
  c.rect(X + COL_LEFT_W, y, W - COL_LEFT_W, 45);
  c.text("CUSTOMER ID", X + 10, y + 27, { font: "bold 11px Poppins, sans-serif" });
  c.text(orderId || "", X + COL_LEFT_W + 10, y + 27, {
    font: "12px Poppins, sans-serif",
  });
  y += 45;

  // ----- Category row 1, BOOKS/DOCUMENT is checked -----
  const COL_W = W / 3;
  const H_CAT = 50;
  c.rect(X, y, COL_W, H_CAT);
  c.rect(X + COL_W, y, COL_W, H_CAT);
  c.rect(X + 2 * COL_W, y, W - 2 * COL_W, H_CAT);
  c.drawCheckbox(X + 10, y + 18, 14, true);
  c.text("BOOKS / DOCUMENT", X + 32, y + 31, { font: "bold 11px Poppins, sans-serif" });
  c.drawCheckbox(X + COL_W + 10, y + 18, 14, false);
  c.text("FASHION / APPAREL", X + COL_W + 32, y + 31, {
    font: "bold 11px Poppins, sans-serif",
  });
  c.drawCheckbox(X + 2 * COL_W + 10, y + 18, 14, false);
  c.text("SPORT EQUIPMENT", X + 2 * COL_W + 32, y + 31, {
    font: "bold 11px Poppins, sans-serif",
  });
  y += H_CAT;

  // ----- Category row 2 -----
  c.rect(X, y, COL_W, H_CAT);
  c.rect(X + COL_W, y, COL_W, H_CAT);
  c.rect(X + 2 * COL_W, y, W - 2 * COL_W, H_CAT);
  c.drawCheckbox(X + 10, y + 18, 14, false);
  c.text("ELECTRONICS", X + 32, y + 31, { font: "bold 11px Poppins, sans-serif" });
  c.drawCheckbox(X + COL_W + 10, y + 18, 14, false);
  c.text("HOUSEHOLD ITEMS", X + COL_W + 32, y + 31, {
    font: "bold 11px Poppins, sans-serif",
  });
  c.drawCheckbox(X + 2 * COL_W + 10, y + 18, 14, false);
  c.text("MEDICINES", X + 2 * COL_W + 32, y + 31, {
    font: "bold 11px Poppins, sans-serif",
  });
  y += H_CAT;

  // ----- OTHER row -----
  c.rect(X, y, COL_LEFT_W, 45);
  c.rect(X + COL_LEFT_W, y, W - COL_LEFT_W, 45);
  c.text("OTHER (PLEASE SPECIFY)", X + 10, y + 27, {
    font: "bold 11px Poppins, sans-serif",
  });
  y += 45;

  // ----- Dangerous goods declaration row -----
  const H_DANGER = 80;
  c.rect(X, y, W, H_DANGER);
  c.text("WHETHER THE PARCEL CONTAINS THE FOLLOWING:", c.W / 2, y + 18, {
    font: "bold 11px Poppins, sans-serif",
    align: "center",
  });
  c.text(
    "DRY COCONUT / BATTERY-INBUILT ELECTRONICS / FLAMMABLE ITEMS /",
    c.W / 2,
    y + 36,
    { font: "11px Poppins, sans-serif", align: "center" },
  );
  c.text("CHEMICAL SUBSTANCES / LIQUIDS / MAGNETIC MATERIAL", c.W / 2, y + 52, {
    font: "11px Poppins, sans-serif",
    align: "center",
  });
  // YES [ ]   NO [X], rendered as labels with drawn checkboxes for the icon
  const cx = c.W / 2;
  c.text("YES", cx - 70, y + 71, { font: "bold 11px Poppins, sans-serif" });
  c.drawCheckbox(cx - 42, y + 58, 14, false);
  c.text("NO", cx + 20, y + 71, { font: "bold 11px Poppins, sans-serif" });
  c.drawCheckbox(cx + 42, y + 58, 14, true);
  y += H_DANGER;

  // ----- TOTAL VALUE row -----
  c.rect(X, y, COL_LEFT_W, 45);
  c.rect(X + COL_LEFT_W, y, W - COL_LEFT_W, 45);
  c.text("TOTAL VALUE IN RS:", X + 10, y + 27, {
    font: "bold 11px Poppins, sans-serif",
  });
  c.text(`Rs. ${totalValueRs || 0} /-`, X + COL_LEFT_W + 10, y + 27, {
    font: "bold 13px Poppins, sans-serif",
  });
  y += 45;

  // ----- COD row (only when payment method is COD) -----
  if (isCOD) {
    const H_COD = 45;
    c.rect(X, y, W, H_COD); // border only, no fill
    c.text(`COLLECT CASH:   Rs. ${codAmount || 0} /-`, X + 10, y + 28, {
      font: "bold 14px Poppins, sans-serif",
    });
    y += H_COD;
  }

  // ----- Sender / Addressee header -----
  const COL_HALF = W / 2;
  c.rect(X, y, COL_HALF, 30, { fill: "#f5f5f5", stroke: "#000" });
  c.rect(X + COL_HALF, y, COL_HALF, 30, { fill: "#f5f5f5", stroke: "#000" });
  c.text("SENDER / RETURN ADDRESS:", X + 10, y + 19, {
    font: "bold 11px Poppins, sans-serif",
  });
  c.text("ADDRESSEE ADDRESS:", X + COL_HALF + 10, y + 19, {
    font: "bold 11px Poppins, sans-serif",
  });
  y += 30;

  // ----- Sender / Addressee body -----
  const H_BODY = 260;
  c.rect(X, y, COL_HALF, H_BODY);
  c.rect(X + COL_HALF, y, COL_HALF, H_BODY);

  // Sender (left column)
  let sy = y + 20;
  c.text("NAME:", X + 10, sy, { font: "bold 10px Poppins, sans-serif", color: "#555" });
  c.text(SENDER.name, X + 60, sy, { font: "bold 12px Poppins, sans-serif" });
  sy += 24;
  c.text("ADDRESS:", X + 10, sy, {
    font: "bold 10px Poppins, sans-serif",
    color: "#555",
  });
  let addrY = sy + 16;
  SENDER.addressLines.forEach((line) => {
    c.text(line, X + 10, addrY, { font: "11px Poppins, sans-serif" });
    addrY += 14;
  });
  sy = y + H_BODY - 70;
  c.text("STATE:", X + 10, sy, {
    font: "bold 10px Poppins, sans-serif",
    color: "#555",
  });
  c.text(SENDER.state, X + 70, sy, { font: "11px Poppins, sans-serif" });
  sy += 20;
  c.text("PINCODE:", X + 10, sy, {
    font: "bold 10px Poppins, sans-serif",
    color: "#555",
  });
  c.text(SENDER.pincode, X + 70, sy, { font: "11px Poppins, sans-serif" });
  sy += 20;
  c.text("MOBILE NO:", X + 10, sy, {
    font: "bold 10px Poppins, sans-serif",
    color: "#555",
  });
  c.text(SENDER.mobile, X + 80, sy, { font: "11px Poppins, sans-serif" });

  // Addressee (right column)
  const aX = X + COL_HALF + 10;
  let ay = y + 20;
  c.text("NAME:", aX, ay, { font: "bold 10px Poppins, sans-serif", color: "#555" });
  c.text(customerName || "", aX + 50, ay, { font: "bold 12px Poppins, sans-serif" });
  ay += 24;
  c.text("ADDRESS:", aX, ay, { font: "bold 10px Poppins, sans-serif", color: "#555" });
  c.wrap(customerAddress || "", aX, ay + 16, COL_HALF - 20, 14, {
    font: "11px Poppins, sans-serif",
  });

  ay = y + H_BODY - 70;
  c.text("STATE:", aX, ay, { font: "bold 10px Poppins, sans-serif", color: "#555" });
  c.text(customerState || "", aX + 60, ay, { font: "11px Poppins, sans-serif" });
  ay += 20;
  c.text("PINCODE:", aX, ay, { font: "bold 10px Poppins, sans-serif", color: "#555" });
  c.text(customerPincode || "", aX + 70, ay, { font: "11px Poppins, sans-serif" });
  ay += 20;
  c.text("MOBILE NO:", aX, ay, {
    font: "bold 10px Poppins, sans-serif",
    color: "#555",
  });
  c.text(customerPhone || "", aX + 80, ay, { font: "11px Poppins, sans-serif" });

  y += H_BODY;

  // ----- Declaration footer text -----
  const H_FOOT = 78;
  c.rect(X, y, W, H_FOOT);
  c.text(
    "I, THE UNDERSIGNED, WHOSE NAME AND ADDRESS ARE MENTIONED ABOVE, CERTIFY THAT",
    X + 10,
    y + 22,
    { font: "10px Poppins, sans-serif" },
  );
  c.text(
    "THE PARTICULARS GIVEN IN THIS DECLARATION ARE CORRECT AND THAT THIS ITEM",
    X + 10,
    y + 40,
    { font: "10px Poppins, sans-serif" },
  );
  c.text(
    "DOES NOT CONTAIN ANY DANGEROUS ARTICLE OR ARTICLES PROHIBITED BY LEGISLATION.",
    X + 10,
    y + 58,
    { font: "10px Poppins, sans-serif" },
  );
  y += H_FOOT;

  // ----- Date / signature row -----
  c.rect(X, y, W, 50);
  c.text("DATE AND SENDER'S SIGNATURE", X + W - 10, y + 32, {
    font: "bold 10px Poppins, sans-serif",
    align: "right",
  });
  y += 50;

  return y;
}

// Draw a simple FROM/TO address label (small lined table).
// Returns the y-coordinate after the label ends.
export function drawAddressLabel(c, startY, data, opts = {}) {
  const {
    orderId,
    customerName,
    customerAddress,
    customerCity,
    customerPincode,
    customerPhone,
    isCOD,
    codAmount,
    note,
  } = data;

  // `big` (used by the standalone label-only download) scales up type and
  // bolds the main details for readability, since it has a full page to fill.
  const big = !!opts.big;
  const isPrepaid = !isCOD;
  const F = {
    title: big ? "bold 20px Poppins, sans-serif" : "bold 13px Poppins, sans-serif",
    cod: big ? "bold 30px Poppins, sans-serif" : "bold 20px Poppins, sans-serif",
    header: big ? "bold 17px Poppins, sans-serif" : "bold 11px Poppins, sans-serif",
    caption: big ? "bold 14px Poppins, sans-serif" : "bold 10px Poppins, sans-serif",
    name: big ? "bold 25px Poppins, sans-serif" : "bold 13px Poppins, sans-serif",
    value: big ? "bold 19px Poppins, sans-serif" : "12px Poppins, sans-serif",
    footer: big ? "bold 15px Poppins, sans-serif" : "bold 11px Poppins, sans-serif",
    footerDate: big ? "bold 15px Poppins, sans-serif" : "11px Poppins, sans-serif",
  };
  const lineH = big ? 26 : 15;
  const titleH = big ? 42 : 35;
  const codH = big ? 68 : 50;
  const headerH = big ? 40 : 28;
  const footerH = big ? 46 : 30;

  // ── Local canvas helpers for the revamped "big" label ──
  const ctx = c.ctx;
  const roundRectPath = (x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };
  // Little book glyph (brand decor) next to "TheBookX".
  const drawBookIcon = (x, y, s, color) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    roundRectPath(x, y, s, s * 0.78, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + s / 2, y + 2);
    ctx.lineTo(x + s / 2, y + s * 0.78 - 2);
    ctx.stroke();
    ctx.restore();
  };
  // Phone handset glyph for the call-out box.
  const drawPhoneIcon = (x, y, s, color) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x, y);
    ctx.scale(s / 24, s / 24);
    ctx.beginPath();
    ctx.moveTo(6.6, 2);
    ctx.lineTo(3, 2);
    ctx.quadraticCurveTo(2, 2, 2, 3);
    ctx.quadraticCurveTo(2, 13, 11, 20);
    ctx.quadraticCurveTo(20, 22, 21, 17.4);
    ctx.lineTo(21.5, 15);
    ctx.quadraticCurveTo(21.6, 14, 20.6, 13.7);
    ctx.lineTo(16.8, 12.9);
    ctx.quadraticCurveTo(16, 12.8, 15.5, 13.4);
    ctx.lineTo(14.8, 14.4);
    ctx.quadraticCurveTo(11.5, 12.8, 9.6, 9.2);
    ctx.lineTo(10.6, 8.5);
    ctx.quadraticCurveTo(11.2, 8, 11.1, 7.2);
    ctx.lineTo(10.3, 3.4);
    ctx.quadraticCurveTo(10, 2, 8.6, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  // Rounded pill badge with centered text (PREPAID / COD).
  const drawPill = (x, y, text, { fill, textColor, font }) => {
    ctx.save();
    ctx.font = font;
    const padX = 12;
    const tw = ctx.measureText(text).width;
    const w = tw + padX * 2;
    const h = big ? 30 : 22;
    ctx.fillStyle = fill;
    roundRectPath(x - w, y, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x - w / 2, y + h / 2 + 1);
    ctx.restore();
    return w;
  };

  const BRAND = "#fb8500";
  const X = 40;
  const W = c.W - 80;
  let y = startY;

  // Title / brand header
  if (big) {
    const brandH = 92;
    // soft brand-tinted header background + frame
    c.rect(X, y, W, brandH, { fill: "#fff7ed", stroke: "#000" });
    // orange accent bar across the top of the header
    c.rect(X, y, W, 8, { fill: BRAND, stroke: false });
    // brand lockup (book glyph + wordmark), centered
    const wordFont = "bold 34px Poppins, sans-serif";
    ctx.font = wordFont;
    const wordW = ctx.measureText("TheBookX").width;
    const iconS = 30;
    const lockW = iconS + 12 + wordW;
    const lockX = c.W / 2 - lockW / 2;
    drawBookIcon(lockX, y + 30, iconS, BRAND);
    c.text("TheBookX", lockX + iconS + 12, y + 52, {
      font: wordFont,
      align: "left",
      color: BRAND,
    });
    c.text("S H I P P I N G   L A B E L", c.W / 2, y + 78, {
      font: "bold 13px Poppins, sans-serif",
      align: "center",
      color: "#8a5a1e",
    });
    // Payment badge — PREPAID (green) or COD (orange) — top-right.
    if (isPrepaid) {
      drawPill(X + W - 16, y + 16, "PREPAID", {
        fill: "#16a34a",
        textColor: "#fff",
        font: "bold 15px Poppins, sans-serif",
      });
    } else {
      drawPill(X + W - 16, y + 16, "COD", {
        fill: "#c25e00",
        textColor: "#fff",
        font: "bold 15px Poppins, sans-serif",
      });
    }
    y += brandH;
  } else {
    c.rect(X, y, W, titleH);
    c.text("SHIPPING LABEL, TheBookX", c.W / 2, y + titleH - 12, {
      font: F.title,
      align: "center",
    });
    y += titleH;
  }

  // COD callout, large bold text, only when this is a COD order.
  // Sits between the title and the FROM/TO table so a courier sees the
  // cash-to-collect amount immediately on picking up the parcel.
  if (isCOD && codAmount) {
    c.rect(X, y, W, codH, big ? { fill: "#fff3e6", stroke: "#000" } : {});
    c.text(`COLLECT CASH ON DELIVERY:  Rs. ${codAmount} /-`, c.W / 2, y + codH - 20, {
      font: F.cod,
      align: "center",
      color: big ? "#c25e00" : "#000",
    });
    y += codH;
  }

  // 2-column header
  const COL_HALF = W / 2;
  c.rect(X, y, COL_HALF, headerH, { fill: "#f5f5f5", stroke: "#000" });
  c.rect(X + COL_HALF, y, COL_HALF, headerH, { fill: "#f5f5f5", stroke: "#000" });
  c.text("FROM (SENDER)", X + 10, y + headerH - 9, { font: F.header });
  c.text("TO (ADDRESSEE)", X + COL_HALF + 10, y + headerH - 9, {
    font: F.header,
  });
  y += headerH;

  // Body, 2 columns
  const H_BODY = big ? 400 : 280;
  const nameGap = big ? 58 : 42;
  const capGap = big ? 20 : 16;
  const rowGap = big ? 24 : 18;
  const cityValX = big ? 60 : 50;
  const pinValX = big ? 74 : 60;
  const mobValX = big ? 68 : 55;
  c.rect(X, y, COL_HALF, H_BODY);
  c.rect(X + COL_HALF, y, COL_HALF, H_BODY);

  // Sender (left)
  let sy = y + 18;
  c.text("NAME:", X + 10, sy, { font: F.caption, color: "#555" });
  c.text(SENDER.name, X + 10, sy + capGap, { font: F.name });
  sy += nameGap;
  c.text("ADDRESS:", X + 10, sy, {
    font: F.caption,
    color: "#555",
  });
  let addrY = sy + capGap;
  SENDER.addressLines.forEach((line) => {
    c.text(line, X + 10, addrY, { font: F.value });
    addrY += lineH;
  });
  sy = addrY + 14;
  c.text("MOBILE:", X + 10, sy, {
    font: F.caption,
    color: "#555",
  });
  c.text(SENDER.mobile, X + 10, sy + capGap, { font: F.value });

  // Addressee (right)
  const aX = X + COL_HALF + 10;
  let ay = y + 18;
  c.text("NAME:", aX, ay, { font: F.caption, color: "#555" });
  c.text(customerName || "", aX, ay + capGap, { font: F.name });
  ay += nameGap;
  c.text("ADDRESS:", aX, ay, { font: F.caption, color: "#555" });
  // Pull the pinned map link out of the address: it becomes a scannable QR on
  // the label, while the printed text stays clean.
  const pinMatch = (customerAddress || "").match(
    /Pinned location:\s*(https?:\/\/\S+)/i,
  );
  const mapLink = pinMatch ? pinMatch[1] : "";
  const cleanAddress = (customerAddress || "")
    .replace(/,?\s*Pinned location:\s*https?:\/\/\S+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const wrapEndY = c.wrap(
    cleanAddress,
    aX,
    ay + capGap,
    COL_HALF - 20,
    lineH,
    {
      font: F.value,
    },
  );
  ay = wrapEndY + capGap;
  c.text("CITY:", aX, ay, { font: F.caption, color: "#555" });
  c.text(customerCity || "", aX + cityValX, ay, { font: F.value });
  ay += rowGap;
  c.text("PINCODE:", aX, ay, {
    font: F.caption,
    color: "#555",
  });
  c.text(customerPincode || "", aX + pinValX, ay, { font: F.value });
  ay += rowGap;
  if (big) {
    // Highlighted "call for delivery" box — bordered, rounded, with a phone
    // icon so the courier immediately sees the number to call.
    const boxW = COL_HALF - 20;
    const boxH = 56;
    const bx = aX;
    const by = ay - 12;
    ctx.save();
    ctx.fillStyle = "#eff6ff";
    roundRectPath(bx, by, boxW, boxH, 10);
    ctx.fill();
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2.2;
    roundRectPath(bx, by, boxW, boxH, 10);
    ctx.stroke();
    ctx.restore();
    drawPhoneIcon(bx + 12, by + 15, 26, "#1d4ed8");
    c.text("CALL FOR DELIVERY", bx + 48, by + 21, {
      font: "bold 13px Poppins, sans-serif",
      color: "#1d4ed8",
    });
    c.text(`+91 ${customerPhone || ""}`, bx + 48, by + 44, {
      font: "bold 23px Poppins, sans-serif",
      color: "#0a2a6b",
    });
    ay = by + boxH + 6;
  } else {
    c.text("MOBILE:", aX, ay, { font: F.caption, color: "#555" });
    c.text(`+91 ${customerPhone || ""}`, aX + mobValX, ay, {
      font: F.value,
    });
  }

  // Map QR — when the customer pinned their location, a courier can scan it to
  // navigate straight to the drop point. Sits at the bottom-right of the TO box.
  if (mapLink) {
    const qSize = big ? 118 : 84;
    const qx = X + W - qSize - 14;
    const qy = y + H_BODY - qSize - 22;
    const drew = drawQrCode(c.ctx, mapLink, qx, qy, qSize);
    if (drew) {
      c.text("Scan receiver location", qx + qSize / 2, qy + qSize + 14, {
        font: big ? "bold 11px Poppins, sans-serif" : "bold 9px Poppins, sans-serif",
        align: "center",
        color: "#333",
      });
    }
  }

  y += H_BODY;

  // Fulfilment indicators strip — only drawn when at least one applies:
  //   • Faster delivery → bold "FASTER DELIVERY" tag
  //   • Gift wrap       → dotted circle (~1cm)
  //   • Bookmark        → rectangle (~1cm)
  // Lets the packer see special handling at a glance before sealing the parcel.
  if (data.isFaster || data.hasGiftWrap || data.hasBookmark) {
    const stripH = big ? 56 : 48;
    c.rect(X, y, W, stripH);
    const cm = big ? 40 : 34; // ≈ 1 cm mark
    const midY = y + stripH / 2;
    let ix = X + 14;
    if (data.isFaster) {
      c.text("⚡ FASTER DELIVERY", ix, midY, {
        font: big ? "bold 15px Poppins, sans-serif" : "bold 12px Poppins, sans-serif",
        color: "#c25e00",
        baseline: "middle",
      });
      ix += big ? 210 : 172;
    }
    if (data.hasGiftWrap) {
      const r = cm / 2;
      const cxx = ix + r;
      c.ctx.save();
      c.ctx.strokeStyle = "#000";
      c.ctx.lineWidth = 1.8;
      c.ctx.setLineDash([3, 3]);
      c.ctx.beginPath();
      c.ctx.arc(cxx, midY, r, 0, Math.PI * 2);
      c.ctx.stroke();
      c.ctx.restore();
      c.text("GIFT WRAP", cxx + r + 8, midY, {
        font: big ? "bold 12px Poppins, sans-serif" : "bold 10px Poppins, sans-serif",
        baseline: "middle",
      });
      ix = cxx + r + 8 + (big ? 108 : 92);
    }
    if (data.hasBookmark) {
      const rw = cm;
      const rh = cm * 0.66;
      const ry = midY - rh / 2;
      c.ctx.save();
      c.ctx.setLineDash([]);
      c.ctx.strokeStyle = "#000";
      c.ctx.lineWidth = 1.8;
      c.ctx.strokeRect(ix, ry, rw, rh);
      c.ctx.restore();
      c.text("BOOKMARK", ix + rw + 8, midY, {
        font: big ? "bold 12px Poppins, sans-serif" : "bold 10px Poppins, sans-serif",
        baseline: "middle",
      });
    }
    y += stripH;
  }

  // Order note strip — printed for the packer/courier when a note exists.
  if (note && String(note).trim()) {
    const noteFont = big ? "bold 12px Poppins, sans-serif" : "bold 10px Poppins, sans-serif";
    const topPad = big ? 20 : 16;
    const startNoteY = y;
    c.text("NOTE:", X + 10, y + topPad, { font: F.caption, color: "#c25e00" });
    const labelW = big ? 58 : 46;
    const endY = c.wrap(
      String(note).trim(),
      X + 10 + labelW,
      y + topPad,
      W - 20 - labelW,
      lineH,
      { font: noteFont },
    );
    const noteH = Math.max(big ? 40 : 32, endY - startNoteY + (big ? 14 : 12));
    c.rect(X, startNoteY, W, noteH);
    y += noteH;
  }

  // Footer with order ID + date
  c.rect(X, y, W, footerH);
  c.text(`ORDER ID: ${orderId || ""}`, X + 10, y + footerH - 10, {
    font: F.footer,
  });
  c.text(
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    X + W - 10,
    y + footerH - 10,
    { font: F.footerDate, align: "right" },
  );
  y += footerH;

  // Bold outer frame around the whole label for a crisp, finished look.
  if (big) {
    c.rect(X, startY, W, y - startY, { stroke: "#000", width: 2.2 });
  }

  return y;
}

// ---- Convenience download wrappers (match the view-bag export sizing) ----
export function downloadIndiaPostForm(data) {
  const isCOD = !!data.isCOD;
  const W = 800;
  const H = isCOD ? 930 : 880;
  const c = buildCanvas(W, H);
  drawDeclarationForm(c, 40, {
    orderId: data.orderId,
    customerName: data.customerName,
    customerAddress: data.customerAddress,
    customerState: data.customerState,
    customerPincode: data.customerPincode,
    customerPhone: data.customerPhone,
    totalValueRs: data.totalValueRs,
    isCOD,
    codAmount: data.codAmount,
  });
  c.download(`india_post_cdf_${data.orderId || Date.now()}.png`);
}

export function downloadAddressLabelForm(data) {
  const isCOD = !!data.isCOD;
  const W = 800;
  const H = isCOD ? 480 : 420;
  const c = buildCanvas(W, H);
  drawAddressLabel(c, 40, {
    orderId: data.orderId,
    customerName: data.customerName,
    customerAddress: data.customerAddress,
    customerCity: data.customerCity,
    customerPincode: data.customerPincode,
    customerPhone: data.customerPhone,
    customerAltPhone: data.customerAltPhone,
    isCOD,
    codAmount: data.codAmount,
  });
  c.download(`address_label_${data.orderId || Date.now()}.png`);
}

// ── Combined single-frame form (India Post CDF + From/To label together) ──
// Draws BOTH documents stacked on ONE canvas with a dashed cut-line between
// them, so a single order = a single downloadable frame (not two files).
// Returns a plain, pixel-cropped canvas at 2× resolution.
function drawDashedDivider(c, y, label) {
  const ctx = c.ctx;
  ctx.save();
  ctx.strokeStyle = "#9aa0a6";
  ctx.lineWidth = 1;
  ctx.setLineDash([7, 5]);
  ctx.beginPath();
  ctx.moveTo(40, y);
  ctx.lineTo(c.W - 40, y);
  ctx.stroke();
  ctx.restore();
  if (label) {
    c.text(label, c.W / 2, y - 6, {
      font: "10px Poppins, sans-serif",
      align: "center",
      color: "#80868b",
    });
  }
}

export function buildCombinedForm(data) {
  const isCOD = !!data.isCOD;
  const W = 800;
  const SAFE_H = 1800; // generous; the frame is cropped to real height after
  const topPad = 36;
  const gap = 48;
  const botPad = 36;

  const c = buildCanvas(W, SAFE_H);

  let y = drawDeclarationForm(c, topPad, {
    orderId: data.orderId,
    customerName: data.customerName,
    customerAddress: data.customerAddress,
    customerState: data.customerState,
    customerPincode: data.customerPincode,
    customerPhone: data.customerPhone,
    totalValueRs: data.totalValueRs,
    isCOD,
    codAmount: data.codAmount,
  });

  drawDashedDivider(
    c,
    y + gap / 2,
    `✂  ORDER ${data.orderId || ""} · address label below`,
  );

  const endY = drawAddressLabel(c, y + gap, {
    orderId: data.orderId,
    customerName: data.customerName,
    customerAddress: data.customerAddress,
    customerCity: data.customerCity,
    customerPincode: data.customerPincode,
    customerPhone: data.customerPhone,
    customerAltPhone: data.customerAltPhone,
    isCOD,
    codAmount: data.codAmount,
    isFaster: data.isFaster,
    hasGiftWrap: data.hasGiftWrap,
    hasBookmark: data.hasBookmark,
  });

  const finalH = Math.min(endY + botPad, SAFE_H);

  // Crop the tall working canvas down to the true content height (2× px).
  const out = document.createElement("canvas");
  out.width = W * 2;
  out.height = finalH * 2;
  const octx = out.getContext("2d");
  octx.drawImage(
    c.canvas,
    0,
    0,
    W * 2,
    finalH * 2,
    0,
    0,
    W * 2,
    finalH * 2,
  );
  return out;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// One combined frame → PNG file.
export function downloadCombinedFormPNG(data) {
  const cv = buildCombinedForm(data);
  cv.toBlob((blob) => {
    if (blob) triggerDownload(blob, `shipping_${data.orderId || Date.now()}.png`);
  }, "image/png");
}

// Many combined frames → individual PNG files (staggered so the browser
// doesn't drop rapid downloads).
export function downloadCombinedFormsPNGs(dataArray) {
  dataArray.forEach((d, i) => {
    setTimeout(() => downloadCombinedFormPNG(d), i * 350);
  });
}

// ── Minimal, dependency-free multi-page PDF from JPEG frames ──
// Each order's combined frame becomes one A4 page, in order, so the whole
// batch prints as a single ordered document.
function dataUrlToBytes(dataUrl) {
  const b64 = dataUrl.split(",")[1] || "";
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i) & 0xff;
  return u8;
}

function jpegPagesToPdf(pages, marginPt) {
  const PAGE_W = 595.28; // A4 portrait, points
  const PAGE_H = 841.89;
  const MARGIN = typeof marginPt === "number" ? marginPt : 22;

  const chunks = [];
  let length = 0;
  const offsets = [];
  const encStr = (s) => {
    const a = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 0xff;
    return a;
  };
  const push = (u8) => {
    chunks.push(u8);
    length += u8.length;
  };
  const pushStr = (s) => push(encStr(s));

  const n = pages.length;
  const totalObjs = 2 + n * 3; // catalog + pages + (page, content, image)*n

  pushStr("%PDF-1.3\n");

  offsets[1] = length;
  pushStr("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  offsets[2] = length;
  const kids = [];
  for (let i = 0; i < n; i++) kids.push(`${3 + i * 3} 0 R`);
  pushStr(
    `2 0 obj\n<< /Type /Pages /Count ${n} /Kids [${kids.join(" ")}] >>\nendobj\n`,
  );

  for (let i = 0; i < n; i++) {
    const { data, w, h } = pages[i];
    const pageId = 3 + i * 3;
    const contentId = 4 + i * 3;
    const imageId = 5 + i * 3;

    const availW = PAGE_W - 2 * MARGIN;
    const availH = PAGE_H - 2 * MARGIN;
    const scale = Math.min(availW / w, availH / h);
    const dw = w * scale;
    const dh = h * scale;
    const dx = (PAGE_W - dw) / 2;
    const dy = (PAGE_H - dh) / 2;
    const content = `q\n${dw.toFixed(2)} 0 0 ${dh.toFixed(2)} ${dx.toFixed(
      2,
    )} ${dy.toFixed(2)} cm\n/Im0 Do\nQ\n`;

    offsets[pageId] = length;
    pushStr(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`,
    );

    offsets[contentId] = length;
    pushStr(`${contentId} 0 obj\n<< /Length ${content.length} >>\nstream\n`);
    pushStr(content);
    pushStr("endstream\nendobj\n");

    offsets[imageId] = length;
    pushStr(
      `${imageId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n`,
    );
    push(data);
    pushStr("\nendstream\nendobj\n");
  }

  const xrefStart = length;
  pushStr(`xref\n0 ${totalObjs + 1}\n`);
  pushStr("0000000000 65535 f \n");
  for (let id = 1; id <= totalObjs; id++) {
    pushStr(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
  }
  pushStr(
    `trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
  );

  const out = new Uint8Array(length);
  let p = 0;
  for (const c of chunks) {
    out.set(c, p);
    p += c.length;
  }
  return new Blob([out], { type: "application/pdf" });
}

// Many combined frames → ONE ordered PDF (one order per page).
export function downloadCombinedFormsPDF(dataArray, filename) {
  const pages = dataArray.map((d) => {
    const cv = buildCombinedForm(d);
    const url = cv.toDataURL("image/jpeg", 0.9);
    return { data: dataUrlToBytes(url), w: cv.width, h: cv.height };
  });
  const blob = jpegPagesToPdf(pages);
  triggerDownload(
    blob,
    filename || `shipping_forms_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

// ── Address-label ONLY exports (clean, content-sized delivery label) ──
// A single-column, top-to-bottom layout so there are no empty gaps: brand
// header + payment badge, big COD collect banner (COD only), a hero DELIVER-TO
// block, a highlighted call-before-delivery box, a compact FROM strip, optional
// note, and an order-id/date footer. Returns the y where the label ends.
// Landscape, minimal B&W address label with three auto-picked variants:
//   normal  — clean black-on-white, one thin orange accent
//   gift    — soft festive header + warm message (any gift occasion)
//   speed   — bold priority/express header for faster-delivery orders
// The deliver-to address dominates in every variant. Returns the end-Y.
function drawBigAddressLabel(c, startY, data) {
  const ctx = c.ctx;
  const INK = "#111111";
  const isCOD = !!data.isCOD;
  const isGift = !!data.isGift;
  const isFaster = !!data.isFaster;
  const variant = isGift ? "gift" : isFaster ? "speed" : "normal";
  const ACCENT = isGift ? "#ec4899" : "#fb8500";
  const LBL = isGift ? "#b03a6e" : "#c25e00";

  const X = 34;
  const W = c.W - X * 2;
  const innerX = X + 28;
  const innerW = W - 56;
  const rightX = X + W - 28;
  let y = startY;

  const rr = (x, yy, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, yy);
    ctx.arcTo(x + w, yy, x + w, yy + h, r);
    ctx.arcTo(x + w, yy + h, x, yy + h, r);
    ctx.arcTo(x, yy + h, x, yy, r);
    ctx.arcTo(x, yy, x + w, yy, r);
    ctx.closePath();
  };
  // Rounded only on the TOP corners — used for the full-bleed header bands so
  // they tuck inside the card's rounded top corners instead of poking out.
  const roundTopRect = (x, yy, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x, yy + h);
    ctx.lineTo(x, yy + r);
    ctx.arcTo(x, yy, x + r, yy, r);
    ctx.lineTo(x + w - r, yy);
    ctx.arcTo(x + w, yy, x + w, yy + r, r);
    ctx.lineTo(x + w, yy + h);
    ctx.closePath();
  };
  const RAD = 16;
  // Inner left/right padding is (innerX - X); keep the top gap equal to it.
  const hline = (yy, color = "#ededed") => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X, yy);
    ctx.lineTo(X + W, yy);
    ctx.stroke();
    ctx.restore();
  };
  const cap = (txt, x, yy, color) =>
    c.text(txt, x, yy, {
      font: "bold 15px Poppins, sans-serif",
      color: color || "#555555",
    });

  // ===== Header (per variant) =====
  if (variant === "gift") {
    const bandH = 152;
    ctx.fillStyle = "#fff4f9";
    roundTopRect(X, y, W, bandH, RAD);
    ctx.fill();
    [
      ["#ec4899", 0.1],
      ["#8b5cf6", 0.28],
      ["#fb8500", 0.46],
      ["#10b981", 0.64],
      ["#8b5cf6", 0.82],
      ["#ec4899", 0.92],
    ].forEach(([col, fx], i) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(X + W * fx, y + 20 + (i % 2) * 10, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    // Brand row (top), then headline + description centred in the band with
    // comfortable padding so nothing sits on the stripe's edge.
    ctx.fillStyle = ACCENT;
    rr(innerX, y + 24, 9, 9, 2);
    ctx.fill();
    c.text("TheBookX", innerX + 17, y + 34, {
      font: "bold 22px Poppins, sans-serif",
      color: INK,
    });
    c.text("A GIFT FOR YOU", rightX, y + 34, {
      font: "bold 14px Poppins, sans-serif",
      color: LBL,
      align: "right",
    });
    c.text("A gift, just for you!", innerX, y + 94, {
      font: "bold 40px Georgia, serif",
      color: "#d6336c",
    });
    c.text("Hope it brightens your day — happy reading!", innerX, y + 126, {
      font: "19px Poppins, sans-serif",
      color: "#8a4a63",
    });
    y += bandH;
  } else if (variant === "speed") {
    const barH = 112;
    ctx.fillStyle = INK;
    roundTopRect(X, y, W, barH, RAD);
    ctx.fill();
    ctx.fillStyle = ACCENT;
    const lx = innerX;
    const ly = y + 30;
    ctx.beginPath();
    ctx.moveTo(lx + 24, ly);
    ctx.lineTo(lx, ly + 38);
    ctx.lineTo(lx + 18, ly + 38);
    ctx.lineTo(lx + 9, ly + 66);
    ctx.lineTo(lx + 40, ly + 28);
    ctx.lineTo(lx + 20, ly + 28);
    ctx.closePath();
    ctx.fill();
    c.text("PRIORITY EXPRESS", innerX + 60, y + 60, {
      font: "bold 36px Poppins, sans-serif",
      color: "#ffffff",
    });
    c.text("SPEED POST", rightX, y + 46, {
      font: "bold 15px Poppins, sans-serif",
      color: ACCENT,
      align: "right",
    });
    c.text("DELIVER FIRST · TIME-CRITICAL", rightX, y + 74, {
      font: "bold 16px Poppins, sans-serif",
      color: "#ffffff",
      align: "right",
    });
    y += barH;
  } else {
    ctx.fillStyle = ACCENT;
    rr(innerX, y + 28, 9, 9, 2);
    ctx.fill();
    c.text("TheBookX", innerX + 17, y + 40, {
      font: "bold 30px Poppins, sans-serif",
      color: INK,
    });
    c.text("SHIPPING LABEL", rightX, y + 38, {
      font: "bold 16px Poppins, sans-serif",
      color: "#444444",
      align: "right",
    });
    y += 72;
    hline(y);
  }
  y += 36;

  // ===== FROM =====
  cap("FROM", innerX, y, "#555555");
  y += 24;
  let fy = c.wrap(
    `TheBookX · ${SENDER.addressLines.join(", ")}`,
    innerX,
    y,
    innerW,
    22,
    { font: "15px Poppins, sans-serif", color: "#333333" },
  );
  fy += 22;
  c.text(
    `Mobile ${SENDER.mobile} — call this number for any seller assistance`,
    innerX,
    fy,
    { font: "15px Poppins, sans-serif", color: "#333333" },
  );
  y = fy + 20;
  hline(y);
  y += 34;

  // ===== DELIVER TO (hero) =====
  const toTop = y - 14;
  c.text("DELIVER TO", innerX, y, {
    font: "bold 17px Poppins, sans-serif",
    color: LBL,
  });
  const nameY = y + 46;
  c.text(data.customerName || "", innerX, nameY, {
    font: "bold 46px Poppins, sans-serif",
    color: INK,
  });
  let ay = nameY + 36;
  // Address with any "Pinned location: <map link>" stripped — map URLs are not
  // printed on the label.
  const cleanAddress = String(data.customerAddress || "")
    .replace(/,?\s*Pinned location:\s*https?:\/\/\S+/i, "")
    .replace(/\s*,\s*$/, "")
    .trim();
  ay = c.wrap(cleanAddress, innerX, ay, innerW, 30, {
    font: "23px Poppins, sans-serif",
    color: "#222222",
  });
  ay += 42;
  const cityState = [data.customerCity, data.customerState]
    .filter(Boolean)
    .join(", ");
  c.text(
    `${cityState}${cityState ? " — " : ""}${data.customerPincode || ""}`,
    innerX,
    ay,
    { font: "bold 27px Poppins, sans-serif", color: INK },
  );
  const phones = [data.customerPhone, data.customerAltPhone]
    .filter((p) => String(p || "").trim())
    .join(" / ");
  if (phones) {
    // Delivery-contact "ribbon" — accent banner with fishtail ends, white bold
    // text. Includes the main and alternate numbers.
    const stY = ay + 16;
    const stH = 46;
    const notch = 16;
    ctx.save();
    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.moveTo(innerX, stY);
    ctx.lineTo(innerX + innerW, stY);
    ctx.lineTo(innerX + innerW - notch, stY + stH / 2);
    ctx.lineTo(innerX + innerW, stY + stH);
    ctx.lineTo(innerX, stY + stH);
    ctx.lineTo(innerX + notch, stY + stH / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    c.text(`Call for delivery: ${phones}`, innerX + notch + 16, stY + 30, {
      font: "bold 19px Poppins, sans-serif",
      color: "#ffffff",
    });
    ay = stY + stH + 10;
  } else {
    ay += 12;
  }
  ctx.fillStyle = ACCENT;
  ctx.fillRect(X, toTop, 5, ay - toTop);
  y = ay + 26;
  hline(y);
  y += 34;

  // ===== Footer row: Order ID · Date · Amount/Payment =====
  const rowY = y;
  const col2 = X + Math.round(W * 0.42);
  const col3 = X + Math.round(W * 0.7);
  ctx.save();
  ctx.strokeStyle = "#dcdcdc";
  ctx.lineWidth = 1;
  // col2 separator always; col3 only when there's no COD box (below).
  ctx.beginPath();
  ctx.moveTo(col2 - 22, rowY - 16);
  ctx.lineTo(col2 - 22, rowY + 30);
  ctx.stroke();
  if (!isCOD) {
    ctx.beginPath();
    ctx.moveTo(col3 - 22, rowY - 16);
    ctx.lineTo(col3 - 22, rowY + 30);
    ctx.stroke();
  }
  ctx.restore();
  cap("ORDER ID", innerX, rowY, "#555555");
  c.text(data.orderId || "", innerX, rowY + 26, {
    font: "bold 21px Poppins, sans-serif",
    color: INK,
  });
  cap("DATE", col2, rowY, "#555555");
  c.text(
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    col2,
    rowY + 26,
    { font: "bold 21px Poppins, sans-serif", color: INK },
  );
  if (isCOD) {
    // Bordered box around the amount to collect.
    const bx = col3 - 10;
    const bw = X + W - 26 - bx;
    ctx.save();
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 1.8;
    rr(bx, rowY - 22, bw, 56, 8);
    ctx.stroke();
    ctx.restore();
    cap("COLLECT ON DELIVERY", col3, rowY, "#555555");
    c.text(`₹${data.codAmount || 0} /-`, col3, rowY + 26, {
      font: "bold 23px Poppins, sans-serif",
      color: INK,
    });
  } else {
    cap("PAYMENT", col3, rowY, "#555555");
    c.text("Paid · Prepaid", col3, rowY + 26, {
      font: "bold 21px Poppins, sans-serif",
      color: "#1d7a3a",
    });
  }
  y = rowY + 50;

  // ===== Note — short + bold =====
  hline(y, "#ededed");
  y += 28;
  let noteText;
  if (variant === "gift") {
    noteText = isCOD
      ? "Wishing you joyful reading and happy moments ahead — enjoy your gift!"
      : "Wishing you joyful reading and happy moments — your gift is all taken care of, just enjoy!";
  } else {
    const dn = deliveryNoteFor(data.note);
    noteText = dn.isCustomer
      ? `Note: ${dn.text}`
      : "Deliver to the customer — do not return. ग्राहक को ही डिलीवर करें, वापस न लौटाएँ।";
  }
  y = c.wrap(noteText, innerX, y, innerW, 24, {
    font: "bold 17px Poppins, sans-serif",
    color: "#333333",
  });
  y += 28;

  // Outer frame — lightest, rounded, dashed. Drawn last so it sits above the
  // header band. Rounded corners match the header band's rounded top.
  ctx.save();
  ctx.strokeStyle = "#d9d9d9";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([9, 7]);
  rr(X, startY, W, y - startY, RAD);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  return y;
}

function drawBigAddressLabelLegacy(c, startY, data) {
  const ctx = c.ctx;
  // High-contrast black-and-white label — minimal colour, everything dark for
  // crisp printing on any printer.
  const BRAND = "#111111";
  const INK = "#111111";
  const isCOD = !!data.isCOD;
  const X = 34;
  const W = c.W - X * 2;
  const padX = 28;
  const innerX = X + padX;
  const innerW = W - padX * 2;
  let y = startY;

  const rr = (x, yy, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, yy);
    ctx.arcTo(x + w, yy, x + w, yy + h, r);
    ctx.arcTo(x + w, yy + h, x, yy + h, r);
    ctx.arcTo(x, yy + h, x, yy, r);
    ctx.arcTo(x, yy, x + w, yy, r);
    ctx.closePath();
  };
  const hline = (yy, color = "#333333") => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(X, yy);
    ctx.lineTo(X + W, yy);
    ctx.stroke();
    ctx.restore();
  };
  // Small right-pointing arrow chip for section headings (DELIVER TO / FROM).
  const drawArrow = (x, yy, s, color) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + s, yy + s / 2);
    ctx.lineTo(x, yy + s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  // Simple book mark (cover + spine + two text lines) — reads as a book.
  const drawBook = (x, yy, s, color) => {
    ctx.save();
    ctx.fillStyle = color;
    rr(x, yy, s, s * 0.82, 4);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.5, yy + 4);
    ctx.lineTo(x + s * 0.5, yy + s * 0.82 - 4);
    ctx.stroke();
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + s * 0.12, yy + s * 0.3);
    ctx.lineTo(x + s * 0.38, yy + s * 0.3);
    ctx.moveTo(x + s * 0.62, yy + s * 0.3);
    ctx.lineTo(x + s * 0.88, yy + s * 0.3);
    ctx.stroke();
    ctx.restore();
  };
  const drawPhoneIcon = (x, yy, s, color) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x, yy);
    ctx.scale(s / 24, s / 24);
    ctx.beginPath();
    ctx.moveTo(6.6, 2);
    ctx.lineTo(3, 2);
    ctx.quadraticCurveTo(2, 2, 2, 3);
    ctx.quadraticCurveTo(2, 13, 11, 20);
    ctx.quadraticCurveTo(20, 22, 21, 17.4);
    ctx.lineTo(21.5, 15);
    ctx.quadraticCurveTo(21.6, 14, 20.6, 13.7);
    ctx.lineTo(16.8, 12.9);
    ctx.quadraticCurveTo(16, 12.8, 15.5, 13.4);
    ctx.lineTo(14.8, 14.4);
    ctx.quadraticCurveTo(11.5, 12.8, 9.6, 9.2);
    ctx.lineTo(10.6, 8.5);
    ctx.quadraticCurveTo(11.2, 8, 11.1, 7.2);
    ctx.lineTo(10.3, 3.4);
    ctx.quadraticCurveTo(10, 2, 8.6, 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  const pillRight = (rightX, topY, text, fill) => {
    ctx.save();
    ctx.font = "bold 16px Poppins, sans-serif";
    const w = ctx.measureText(text).width + 28;
    const h = 34;
    const x = rightX - w;
    ctx.fillStyle = fill;
    rr(x, topY, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, topY + h / 2 + 1);
    ctx.restore();
  };

  // ===== Header =====
  const headH = 84;
  ctx.fillStyle = "#f2f2f2";
  ctx.fillRect(X, y, W, headH);
  ctx.fillStyle = INK;
  ctx.fillRect(X, y, W, 9);
  const iconS = 32;
  drawBook(innerX, y + headH / 2 - iconS / 2 + 2, iconS, INK);
  c.text("TheBookX", innerX + iconS + 14, y + headH / 2 + 12, {
    font: "bold 38px Poppins, sans-serif",
    color: INK,
  });
  pillRight(
    X + W - padX,
    y + headH / 2 - 17,
    isCOD ? "CASH ON DELIVERY" : "PREPAID",
    INK,
  );
  y += headH;

  // ===== COD collect banner =====
  if (isCOD && data.codAmount) {
    const bh = 62;
    ctx.fillStyle = "#e9e9e9";
    ctx.fillRect(X, y, W, bh);
    ctx.fillStyle = INK;
    ctx.fillRect(X, y, 8, bh);
    c.text(`COLLECT  Rs. ${data.codAmount} /-`, innerX, y + bh / 2 + 12, {
      font: "bold 34px Poppins, sans-serif",
      color: INK,
    });
    c.text("COLLECT FROM CUSTOMER", X + W - padX, y + bh / 2 + 6, {
      font: "bold 15px Poppins, sans-serif",
      align: "right",
      color: "#333333",
    });
    y += bh;
  }
  hline(y, "#333333");

  // ===== DELIVER TO (hero) =====
  y += 30;
  drawArrow(innerX, y - 13, 13, INK);
  c.text("DELIVER TO", innerX + 22, y, {
    font: "bold 16px Poppins, sans-serif",
    color: INK,
  });
  y += 38;

  const pinMatch = (data.customerAddress || "").match(
    /Pinned location:\s*(https?:\/\/\S+)/i,
  );
  const mapLink = pinMatch ? pinMatch[1] : "";
  const cleanAddress = (data.customerAddress || "")
    .replace(/,?\s*Pinned location:\s*https?:\/\/\S+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const hasQR = !!mapLink;
  const qSize = 150;
  const textW = hasQR ? innerW - qSize - 28 : innerW;
  const blockTop = y - 8;

  c.text(data.customerName || "", innerX, y + 6, {
    font: "bold 38px Poppins, sans-serif",
  });
  y += 48;
  const addrEnd = c.wrap(cleanAddress, innerX, y, textW, 38, {
    font: "bold 27px Poppins, sans-serif",
  });
  y = addrEnd + 40;
  const cityPin = [data.customerCity, data.customerPincode]
    .filter(Boolean)
    .join(" - ");
  if (cityPin) {
    c.text(cityPin, innerX, y, { font: "bold 27px Poppins, sans-serif" });
    y += 10;
  }

  if (hasQR) {
    const qx = X + W - padX - qSize;
    const drew = drawQrCode(ctx, mapLink, qx, blockTop, qSize);
    if (drew) {
      c.text("Scan location", qx + qSize / 2, blockTop + qSize + 18, {
        font: "bold 12px Poppins, sans-serif",
        align: "center",
        color: "#6b7280",
      });
      y = Math.max(y, blockTop + qSize + 30);
    }
  }

  // ===== Call-out — one highlighted row spanning the full width =====
  y += 22;
  const cbH = 78;
  ctx.save();
  ctx.fillStyle = "#f2f2f2";
  rr(innerX, y, innerW, cbH, 12);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.8;
  rr(innerX, y, innerW, cbH, 12);
  ctx.stroke();
  ctx.restore();
  const midY = y + cbH / 2;
  drawPhoneIcon(innerX + 22, midY - 17, 34, INK);
  c.text("CALL ON THIS NUMBER FOR DELIVERY:", innerX + 70, midY, {
    font: "bold 20px Poppins, sans-serif",
    color: INK,
    baseline: "middle",
  });
  ctx.font = "bold 20px Poppins, sans-serif";
  const labelW = ctx.measureText("CALL ON THIS NUMBER FOR DELIVERY:").width;
  c.text(
    `+91 ${data.customerPhone || ""}${
      data.customerAltPhone ? ` / ${data.customerAltPhone}` : ""
    }`,
    innerX + 70 + labelW + 14,
    midY,
    {
      font: "bold 31px Poppins, sans-serif",
      color: INK,
      baseline: "middle",
    },
  );
  y += cbH + 26;

  // ===== FROM (compact) =====
  hline(y);
  y += 26;
  drawArrow(innerX, y - 11, 12, "#333333");
  c.text("FROM (SENDER)", innerX + 20, y, {
    font: "bold 14px Poppins, sans-serif",
    color: "#333333",
  });
  ctx.font = "bold 14px Poppins, sans-serif";
  const fromLblW = ctx.measureText("FROM (SENDER)").width;
  c.text(SENDER.name, innerX + 20 + fromLblW + 14, y, {
    font: "bold 17px Poppins, sans-serif",
    color: INK,
  });
  y += 24;
  const sEnd = c.wrap(SENDER.addressLines.join(", "), innerX, y, innerW, 24, {
    font: "bold 16px Poppins, sans-serif",
    color: "#111827",
  });
  y = sEnd + 24;
  c.text(`Mobile: ${SENDER.mobile}`, innerX, y, {
    font: "bold 16px Poppins, sans-serif",
    color: "#111827",
  });
  y += 14;

  // ===== Note / Gift QR =====
  // Gift orders never print the message as text — it lives behind a QR the
  // recipient scans. Non-gift orders print the packer note as usual.
  if (data.giftQrUrl) {
    y += 14;
    const qs = 118;
    drawQrCode(ctx, data.giftQrUrl, innerX, y, qs);
    c.text("🎁 GIFT ORDER", innerX + qs + 18, y + 26, {
      font: "bold 16px Poppins, sans-serif",
      color: "#c0223b",
    });
    c.wrap(
      "Scan this code to reveal the surprise message for the reader.",
      innerX + qs + 18,
      y + 52,
      innerW - qs - 18,
      22,
      { font: "bold 14px Poppins, sans-serif", color: "#7a1020" },
    );
    y += qs + 14;
  } else {
    // ===== Prominent delivery-note box =====
    // Customer's own note wins (big, auto-fitting one-liner that shrinks and
    // wraps smaller if long). If they left no note, show the strict bilingual
    // instruction for the delivery person (English + Hindi, with emoji).
    const dn = deliveryNoteFor(data.note);
    const strict = !dn.isCustomer;
    const padB = 20;
    const availW = innerW - padB * 2;
    const bg = strict ? "#fff3f1" : "#eef4ff";
    const border = strict ? "#e03a2f" : "#1f66d0";
    const titleColor = strict ? "#b00020" : "#1452b0";
    const textColor = strict ? "#5a0f08" : "#10213a";
    const title = strict ? "DELIVERY INSTRUCTION" : "NOTE FROM CUSTOMER";

    // How many wrapped lines a string needs at a given font/width.
    const wrapLineCount = (str, font, maxW) => {
      ctx.font = `bold ${font}px Poppins, sans-serif`;
      const words = String(str || "").split(" ");
      let line = "";
      let n = 1;
      for (const w of words) {
        const test = line + w + " ";
        if (ctx.measureText(test).width > maxW && line) {
          n += 1;
          line = w + " ";
        } else line = test;
      }
      return n;
    };

    // Build the content line(s) + their font sizes.
    const lines = [];
    if (strict) {
      lines.push({ str: dn.text, font: 21 });
      lines.push({ str: dn.textHi, font: 20 });
    } else {
      // Auto-fit: start big (34px) and shrink until it fits one line; if it
      // still won't fit at 20px, it wraps at 20px (smaller, 2+ lines).
      let f = 34;
      ctx.font = `bold ${f}px Poppins, sans-serif`;
      while (f > 20 && ctx.measureText(dn.text).width > availW) {
        f -= 1;
        ctx.font = `bold ${f}px Poppins, sans-serif`;
      }
      lines.push({ str: dn.text, font: f });
    }
    const lineMeta = lines.map((ln) => ({
      ...ln,
      lh: Math.round(ln.font * 1.3),
      n: wrapLineCount(ln.str, ln.font, availW),
    }));

    // Box height from measured content.
    const titleBlock = 30; // top pad + title + gap
    let contentH = 0;
    lineMeta.forEach((ln) => {
      contentH += ln.font + (ln.n - 1) * ln.lh + 8;
    });
    const boxH = titleBlock + contentH + 8;

    y += 18;
    ctx.save();
    ctx.fillStyle = bg;
    rr(innerX, y, innerW, boxH, 12);
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = 2.6;
    rr(innerX, y, innerW, boxH, 12);
    ctx.stroke();
    ctx.restore();

    let ty = y + 24;
    c.text(title, innerX + padB, ty, {
      font: "bold 14px Poppins, sans-serif",
      color: titleColor,
    });
    ty += 8;
    lineMeta.forEach((ln) => {
      ty += ln.font;
      const end = c.wrap(ln.str, innerX + padB, ty, availW, ln.lh, {
        font: `bold ${ln.font}px Poppins, sans-serif`,
        color: textColor,
      });
      ty = end + 8;
    });
    y += boxH + 14;
  }

  // ===== Footer =====
  y += 16;
  hline(y);
  y += 30;
  c.text(`ORDER ID: ${data.orderId || ""}`, innerX, y, {
    font: "bold 15px Poppins, sans-serif",
  });
  c.text(
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    X + W - padX,
    y,
    { font: "bold 15px Poppins, sans-serif", align: "right", color: "#6b7280" },
  );
  y += 22;

  // Outer frame (square, crisp).
  ctx.save();
  ctx.strokeStyle = "#111";
  ctx.lineWidth = 2.4;
  ctx.strokeRect(X, startY, W, y - startY);
  ctx.restore();

  return y;
}

// Festive decor drawn ONLY in the outer margins/corners of a label so the
// label footprint (and 3-per-page layout) is unchanged. Confetti in the top/
// bottom bands + side strips, flower emojis in the four corners.
function drawLabelDecor(ctx, W, H) {
  const colors = [
    "#fb8500",
    "#ffb703",
    "#c0223b",
    "#2a9d8f",
    "#4361ee",
    "#e76f51",
    "#06d6a0",
    "#ef476f",
  ];
  const flowers = ["🌸", "🌼", "🌺", "✨", "🎉", "🌷", "💐", "⭐"];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  ctx.save();
  const bands = [
    { x0: 2, x1: W - 2, y0: 2, y1: 28 }, // top
    { x0: 2, x1: W - 2, y0: H - 28, y1: H - 2 }, // bottom
    { x0: 2, x1: 30, y0: 30, y1: H - 30 }, // left
    { x0: W - 30, x1: W - 2, y0: 30, y1: H - 30 }, // right
  ];
  ctx.globalAlpha = 0.9;
  bands.forEach((b) => {
    const n = Math.max(
      6,
      Math.round(((b.x1 - b.x0) * (b.y1 - b.y0)) / 1500),
    );
    for (let i = 0; i < n; i++) {
      const x = b.x0 + rnd() * (b.x1 - b.x0);
      const y = b.y0 + rnd() * (b.y1 - b.y0);
      ctx.fillStyle = colors[Math.floor(rnd() * colors.length)];
      const s = 3 + rnd() * 4;
      if (rnd() < 0.5) {
        ctx.fillRect(x, y, s, s * 1.6);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, s / 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
  ctx.globalAlpha = 1;
  ctx.font = "19px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const corners = [
    [17, 16],
    [W - 17, 16],
    [17, H - 16],
    [W - 17, H - 16],
  ];
  corners.forEach((cnr, i) =>
    ctx.fillText(flowers[i % flowers.length], cnr[0], cnr[1]),
  );
  ctx.restore();
}

export function buildAddressLabelCanvas(data, opts = {}) {
  const { decor = false, mono = false } = opts;
  const isCOD = !!data.isCOD;
  // Label width — kept moderate so a single label doesn't blow up to fill the
  // whole page, while a 3-up stack still fills most of the A4 width.
  const W = 1180;
  const SAFE_H = 1400;
  const topPad = 30;
  const botPad = 30;
  const c = buildCanvas(W, SAFE_H);
  const endY = drawBigAddressLabel(c, topPad, {
    orderId: data.orderId,
    customerName: data.customerName,
    customerAddress: data.customerAddress,
    customerCity: data.customerCity,
    customerPincode: data.customerPincode,
    customerPhone: data.customerPhone,
    customerAltPhone: data.customerAltPhone,
    customerState: data.customerState,
    isCOD,
    codAmount: data.codAmount,
    note: data.note,
    isGift: data.isGift,
    isFaster: data.isFaster,
  });
  const finalH = Math.min(endY + botPad, SAFE_H);
  if (decor) drawLabelDecor(c.ctx, W, finalH);
  const out = document.createElement("canvas");
  out.width = W * 2;
  out.height = finalH * 2;
  const octx = out.getContext("2d");
  octx.drawImage(c.canvas, 0, 0, W * 2, finalH * 2, 0, 0, W * 2, finalH * 2);
  if (mono) {
    const img = octx.getImageData(0, 0, out.width, out.height);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = g;
    }
    octx.putImageData(img, 0, 0);
  }
  return out;
}

export function downloadAddressLabelOnlyPNG(data) {
  const cv = buildAddressLabelCanvas(data);
  cv.toBlob((blob) => {
    if (blob) triggerDownload(blob, `label_${data.orderId || Date.now()}.png`);
  }, "image/png");
}

// Many address labels → individual PNG files (staggered).
export function downloadAddressLabelsPNGs(dataArray) {
  dataArray.forEach((d, i) => {
    setTimeout(() => downloadAddressLabelOnlyPNG(d), i * 350);
  });
}

// Stack up to LABELS_PER_PAGE address labels onto a single sheet canvas so one
// A4 page carries three labels, separated by dashed cut lines the packer can
// trim along. Labels are centered horizontally and share the widest width.
const LABELS_PER_PAGE = 3;

const LABEL_GAP = 48; // vertical space between/around labels (2x px)
// Each label already carries its own dashed card border, so pages hold at most
// MAX_LABELS_PER_PAGE labels but drop to fewer when the labels are tall (a long
// note grows the label) — kept within PAGE_HEIGHT_BUDGET so printed A4 pages
// don't shrink the labels too much.
const MAX_LABELS_PER_PAGE = 2;
// Label canvases are rendered at 2× scale, so this budget is in 2× pixels.
// ~A4 portrait height at the label's 2× width (≈2360 × 1.414) so two standard
// labels sit on one page, dropping to one only when a label is very tall.
const PAGE_HEIGHT_BUDGET = 3340;

// Pack pre-built label canvases into pages: up to 3 short labels, or 2 (even 1)
// when they're tall. Greedy by cumulative height against the budget.
function packLabelPages(labels) {
  const pages = [];
  let cur = [];
  let curH = LABEL_GAP;
  for (const l of labels) {
    const next = curH + l.height + LABEL_GAP;
    if (
      cur.length &&
      (cur.length >= MAX_LABELS_PER_PAGE || next > PAGE_HEIGHT_BUDGET)
    ) {
      pages.push(cur);
      cur = [];
      curH = LABEL_GAP;
    }
    cur.push(l);
    curH += l.height + LABEL_GAP;
  }
  if (cur.length) pages.push(cur);
  return pages;
}

// Stack already-built label canvases onto one sheet (centered, equal gaps).
function stackLabelCanvases(labels) {
  const width = Math.max(...labels.map((l) => l.width));
  const totalH =
    labels.reduce((s, l) => s + l.height, 0) + LABEL_GAP * (labels.length + 1);
  const out = document.createElement("canvas");
  out.width = width;
  out.height = totalH;
  const ctx = out.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, out.width, out.height);
  let y = LABEL_GAP;
  labels.forEach((l) => {
    ctx.drawImage(l, (width - l.width) / 2, y);
    y += l.height + LABEL_GAP;
  });
  return out;
}

export function buildAddressLabelSheetCanvas(group, opts = {}) {
  return stackLabelCanvases(group.map((d) => buildAddressLabelCanvas(d, opts)));
}

// Many address labels → ONE ordered PDF, three labels per page, no CDF.
export function downloadAddressLabelsPDF(dataArray, filename, opts = {}) {
  const labels = dataArray.map((d) => buildAddressLabelCanvas(d, opts));
  const pages = packLabelPages(labels).map((group) => {
    const cv = stackLabelCanvases(group);
    const url = cv.toDataURL("image/jpeg", 0.92);
    return { data: dataUrlToBytes(url), w: cv.width, h: cv.height };
  });
  const blob = jpegPagesToPdf(pages, 14);
  triggerDownload(
    blob,
    filename || `address_labels_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

// Decorated (confetti + flowers) address-label PDF — same 3-per-page layout,
// identical label size. `mono:true` renders black & white.
export function downloadDecoratedAddressLabelsPDF(
  dataArray,
  filename,
  { mono = false } = {},
) {
  downloadAddressLabelsPDF(
    dataArray,
    filename ||
      `labels_${mono ? "bw" : "color"}_${new Date().toISOString().slice(0, 10)}.pdf`,
    { decor: true, mono },
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GIFT LABELS — a colorful, festive variant of the address label with the
   message hidden behind a QR, confetti decor and lit emojis. 3 per A4 page,
   same layout footprint as the address-only PDF. Prices (COD) shown only for
   cash orders. All drawing is synchronous (QR via drawQrCode).
   ═══════════════════════════════════════════════════════════════════════════ */

// Diagonal candy-stripe band (maroon / orange / gold).
function drawStripeBand(ctx, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const cols = ["#7a1020", "#c0223b", "#fb8500", "#ffb703"];
  const sw = 26;
  let i = 0;
  for (let sx = x - h; sx < x + w + h; sx += sw) {
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.moveTo(sx, y);
    ctx.lineTo(sx + sw, y);
    ctx.lineTo(sx + sw - h, y + h);
    ctx.lineTo(sx - h, y + h);
    ctx.closePath();
    ctx.fill();
    i += 1;
  }
  ctx.restore();
}

// Scattered confetti pieces inside a region (deterministic, seeded by index).
function drawConfetti(ctx, x, y, w, h, n = 40) {
  const cols = [
    "#fb8500",
    "#ffd23f",
    "#4ade80",
    "#c0223b",
    "#60a5fa",
    "#f472b6",
    "#ffb703",
  ];
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  ctx.save();
  for (let i = 0; i < n; i++) {
    const px = x + rnd() * w;
    const py = y + rnd() * h;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rnd() * Math.PI);
    ctx.fillStyle = cols[i % cols.length];
    ctx.globalAlpha = 0.85;
    ctx.fillRect(-4, -6, 8, 12);
    ctx.restore();
  }
  ctx.restore();
}

function drawGiftLabel(c, startY, data) {
  const ctx = c.ctx;
  const X = 34;
  const W = c.W - X * 2;
  const padX = 28;
  const innerX = X + padX;
  const innerW = W - padX * 2;
  let y = startY;
  const MAROON = "#7a1020";
  const RED = "#c0223b";
  const INK = "#3a0a12";
  const rr = (x, yy, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, yy);
    ctx.arcTo(x + w, yy, x + w, yy + h, r);
    ctx.arcTo(x + w, yy + h, x, yy + h, r);
    ctx.arcTo(x, yy + h, x, yy, r);
    ctx.arcTo(x, yy, x + w, yy, r);
    ctx.closePath();
  };
  // Section divider — thin maroon rule across the inner width (grid structure).
  const hline = (yy) => {
    ctx.save();
    ctx.strokeStyle = "rgba(122, 16, 32, 0.28)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(innerX, yy);
    ctx.lineTo(innerX + innerW, yy);
    ctx.stroke();
    ctx.restore();
  };
  const arrow = (x, yy, s, color) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, yy);
    ctx.lineTo(x + s, yy + s / 2);
    ctx.lineTo(x, yy + s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  // Cream background for the whole label area (extra is cropped by the builder).
  const grad = ctx.createLinearGradient(X, startY, X, startY + 900);
  grad.addColorStop(0, "#fff7ed");
  grad.addColorStop(1, "#ffeef6");
  ctx.fillStyle = grad;
  ctx.fillRect(X, startY, W, c.H - startY);

  // Top stripe band.
  const bandH = 30;
  drawStripeBand(ctx, X, startY, W, bandH);
  y = startY + bandH + 30;

  // Brand + GIFT pill.
  c.text("🎁 TheBookX", innerX, y, {
    font: "bold 30px Poppins, sans-serif",
    color: MAROON,
  });
  ctx.save();
  ctx.font = "bold 15px Poppins, sans-serif";
  const pillTxt = data.isCOD ? "GIFT · COD" : "GIFT · PREPAID";
  const pw = ctx.measureText(pillTxt).width + 26;
  ctx.fillStyle = RED;
  rr(X + W - padX - pw, y - 20, pw, 30, 15);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.fillText(pillTxt, X + W - padX - pw / 2, y);
  ctx.restore();
  y += 28;
  c.text("A GIFT FOR YOU", innerX, y, {
    font: "bold 13px Poppins, sans-serif",
    color: RED,
  });
  y += 30;

  // COD collect banner (only for COD).
  if (data.isCOD && data.codAmount) {
    const bh = 54;
    ctx.save();
    ctx.fillStyle = "#fff";
    rr(innerX, y, innerW, bh, 12);
    ctx.fill();
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    rr(innerX, y, innerW, bh, 12);
    ctx.stroke();
    ctx.restore();
    c.text(`💵 COLLECT  Rs. ${data.codAmount} /-`, innerX + 18, y + bh / 2 + 10, {
      font: "bold 26px Poppins, sans-serif",
      color: MAROON,
    });
    y += bh + 20;
  }

  // ===== DELIVER TO =====
  hline(y - 6);
  y += 24;
  arrow(innerX, y - 11, 11, RED);
  c.text("DELIVER TO", innerX + 20, y, {
    font: "bold 15px Poppins, sans-serif",
    color: RED,
  });
  y += 38;
  c.text(data.customerName || "", innerX, y, {
    font: "bold 30px Poppins, sans-serif",
    color: INK,
  });
  y += 42;
  const cleanAddr = (data.customerAddress || "")
    .replace(/,?\s*Pinned location:\s*https?:\/\/\S+/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  const aEnd = c.wrap(cleanAddr, innerX, y, innerW, 32, {
    font: "bold 22px Poppins, sans-serif",
    color: INK,
  });
  y = aEnd + 34;
  const cityPin = [data.customerCity, data.customerPincode]
    .filter(Boolean)
    .join(" - ");
  if (cityPin) {
    c.text(cityPin, innerX, y, {
      font: "bold 22px Poppins, sans-serif",
      color: INK,
    });
    y += 22;
  }

  // ===== CALL callout (kept same as the normal label) =====
  const cbH = 70;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  rr(innerX, y, innerW, cbH, 12);
  ctx.fill();
  ctx.strokeStyle = MAROON;
  ctx.lineWidth = 2.4;
  rr(innerX, y, innerW, cbH, 12);
  ctx.stroke();
  ctx.restore();
  const midY = y + cbH / 2;
  c.text("📞", innerX + 18, midY + 9, { font: "26px Poppins, sans-serif" });
  c.text("CALL ON THIS NUMBER FOR DELIVERY:", innerX + 58, midY, {
    font: "bold 16px Poppins, sans-serif",
    color: INK,
    baseline: "middle",
  });
  ctx.font = "bold 16px Poppins, sans-serif";
  const callLblW = ctx.measureText("CALL ON THIS NUMBER FOR DELIVERY:").width;
  c.text(`+91 ${data.customerPhone || ""}`, innerX + 58 + callLblW + 12, midY, {
    font: "bold 24px Poppins, sans-serif",
    color: INK,
    baseline: "middle",
  });
  y += cbH + 24;

  // ===== FROM (sender) on the left  +  reserved Gift-QR box on the right =====
  hline(y - 6);
  y += 24;
  const rowTop = y;

  // Reserved QR box — its own separate space on the right side.
  const qs = 148;
  const qbW = 200;
  const qbH = qs + 56;
  const qbX = X + W - padX - qbW;
  ctx.save();
  ctx.fillStyle = "#ffffff";
  rr(qbX, rowTop - 8, qbW, qbH, 14);
  ctx.fill();
  ctx.strokeStyle = RED;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 5]);
  rr(qbX, rowTop - 8, qbW, qbH, 14);
  ctx.stroke();
  ctx.restore();
  c.text("✨ Surprise inside", qbX + qbW / 2, rowTop + 12, {
    font: "bold 14px Poppins, sans-serif",
    color: MAROON,
    align: "center",
  });
  const qx = qbX + (qbW - qs) / 2;
  const qy = rowTop + 22;
  drawQrCode(ctx, data.giftQrUrl || "https://thebookx.in", qx, qy, qs);
  c.text("Scan to reveal 🎁", qbX + qbW / 2, qy + qs + 22, {
    font: "bold 13px Poppins, sans-serif",
    color: "#7a1020",
    align: "center",
  });
  const qrBoxEnd = rowTop - 8 + qbH;

  // FROM column (left) — width capped so it never runs under the QR box.
  const fromW = qbX - innerX - 26;
  let fy = rowTop;
  arrow(innerX, fy - 10, 10, "#8a3b1a");
  c.text("FROM (SENDER)", innerX + 18, fy, {
    font: "bold 13px Poppins, sans-serif",
    color: "#8a3b1a",
  });
  fy += 26;
  c.text(SENDER.name, innerX, fy, {
    font: "bold 16px Poppins, sans-serif",
    color: MAROON,
  });
  fy += 26;
  const sEnd = c.wrap(SENDER.addressLines.join(", "), innerX, fy, fromW, 22, {
    font: "bold 14px Poppins, sans-serif",
    color: "#8a3b1a",
  });
  fy = sEnd + 26;
  c.wrap(`Mobile: ${SENDER.mobile}`, innerX, fy, fromW, 22, {
    font: "bold 14px Poppins, sans-serif",
    color: "#8a3b1a",
  });
  fy += 16;

  y = Math.max(fy, qrBoxEnd) + 20;

  // Divider before footer.
  hline(y - 2);
  y += 10;

  // Footer.
  c.text(`ORDER ID: ${data.orderId || ""}`, innerX, y, {
    font: "bold 14px Poppins, sans-serif",
    color: MAROON,
  });
  c.text("With love, TheBookX 💛", X + W - padX, y, {
    font: "bold 14px Poppins, sans-serif",
    align: "right",
    color: MAROON,
  });
  y += 24;

  // Bottom stripe band.
  drawStripeBand(ctx, X, y, W, bandH);
  y += bandH;

  // Confetti in the side margins (behind nothing important).
  drawConfetti(ctx, X + 2, startY + bandH, padX - 6, y - startY - bandH * 2, 18);
  drawConfetti(
    ctx,
    X + W - padX + 4,
    startY + bandH,
    padX - 6,
    y - startY - bandH * 2,
    18,
  );

  // Outer festive border.
  ctx.save();
  ctx.strokeStyle = MAROON;
  ctx.lineWidth = 3;
  rr(X, startY, W, y - startY, 10);
  ctx.stroke();
  ctx.restore();

  return y;
}

export function buildGiftLabelCanvas(data) {
  const W = 1180;
  const SAFE_H = 1500;
  const topPad = 30;
  const botPad = 30;
  const c = buildCanvas(W, SAFE_H);
  const endY = drawGiftLabel(c, topPad, data);
  const finalH = Math.min(endY + botPad, SAFE_H);
  const out = document.createElement("canvas");
  out.width = W * 2;
  out.height = finalH * 2;
  out
    .getContext("2d")
    .drawImage(c.canvas, 0, 0, W * 2, finalH * 2, 0, 0, W * 2, finalH * 2);
  return out;
}

export function buildGiftLabelSheetCanvas(group) {
  const labels = group.map((d) => buildGiftLabelCanvas(d));
  const GAP = 48;
  const width = Math.max(...labels.map((l) => l.width));
  const totalH =
    labels.reduce((s, l) => s + l.height, 0) + GAP * (labels.length + 1);
  const out = document.createElement("canvas");
  out.width = width;
  out.height = totalH;
  const ctx = out.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, out.width, out.height);
  let y = GAP;
  labels.forEach((l, i) => {
    const x = (width - l.width) / 2;
    ctx.drawImage(l, x, y);
    y += l.height;
    if (i < labels.length - 1) {
      ctx.strokeStyle = "#e3b8c0";
      ctx.setLineDash([14, 9]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(24, y + GAP / 2);
      ctx.lineTo(width - 24, y + GAP / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      y += GAP;
    }
  });
  return out;
}

// Colorful gift labels → ONE PDF, three per page (same footprint as address PDF).
export function downloadGiftLabelsPDF(dataArray, filename) {
  if (!dataArray || !dataArray.length) return;
  const pages = [];
  for (let i = 0; i < dataArray.length; i += LABELS_PER_PAGE) {
    const group = dataArray.slice(i, i + LABELS_PER_PAGE);
    const cv = buildGiftLabelSheetCanvas(group);
    const url = cv.toDataURL("image/jpeg", 0.92);
    pages.push({ data: dataUrlToBytes(url), w: cv.width, h: cv.height });
  }
  const blob = jpegPagesToPdf(pages, 14);
  triggerDownload(
    blob,
    filename || `gift_labels_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
