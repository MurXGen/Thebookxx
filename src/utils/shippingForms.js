// utils/shippingForms.js
// Canvas → PNG generators for India Post CDF-I declaration and FROM/TO
// address labels. Extracted so both the customer bag page and the
// manage-orders dashboard can export the same shipping documents.

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
    ctx.font = opts.font || "12px sans-serif";
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
    ctx.font = opts.font || "12px sans-serif";
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
    font: "bold 14px sans-serif",
    align: "center",
  });
  c.text("INDIA POST / SPEED POST PARCEL", c.W / 2, y + 44, {
    font: "bold 12px sans-serif",
    align: "center",
  });
  y += 60;

  // ----- CUSTOMER ID row -----
  const COL_LEFT_W = W * 0.3;
  c.rect(X, y, COL_LEFT_W, 45);
  c.rect(X + COL_LEFT_W, y, W - COL_LEFT_W, 45);
  c.text("CUSTOMER ID", X + 10, y + 27, { font: "bold 11px sans-serif" });
  c.text(orderId || "", X + COL_LEFT_W + 10, y + 27, {
    font: "12px sans-serif",
  });
  y += 45;

  // ----- Category row 1, BOOKS/DOCUMENT is checked -----
  const COL_W = W / 3;
  const H_CAT = 50;
  c.rect(X, y, COL_W, H_CAT);
  c.rect(X + COL_W, y, COL_W, H_CAT);
  c.rect(X + 2 * COL_W, y, W - 2 * COL_W, H_CAT);
  c.drawCheckbox(X + 10, y + 18, 14, true);
  c.text("BOOKS / DOCUMENT", X + 32, y + 31, { font: "bold 11px sans-serif" });
  c.drawCheckbox(X + COL_W + 10, y + 18, 14, false);
  c.text("FASHION / APPAREL", X + COL_W + 32, y + 31, {
    font: "bold 11px sans-serif",
  });
  c.drawCheckbox(X + 2 * COL_W + 10, y + 18, 14, false);
  c.text("SPORT EQUIPMENT", X + 2 * COL_W + 32, y + 31, {
    font: "bold 11px sans-serif",
  });
  y += H_CAT;

  // ----- Category row 2 -----
  c.rect(X, y, COL_W, H_CAT);
  c.rect(X + COL_W, y, COL_W, H_CAT);
  c.rect(X + 2 * COL_W, y, W - 2 * COL_W, H_CAT);
  c.drawCheckbox(X + 10, y + 18, 14, false);
  c.text("ELECTRONICS", X + 32, y + 31, { font: "bold 11px sans-serif" });
  c.drawCheckbox(X + COL_W + 10, y + 18, 14, false);
  c.text("HOUSEHOLD ITEMS", X + COL_W + 32, y + 31, {
    font: "bold 11px sans-serif",
  });
  c.drawCheckbox(X + 2 * COL_W + 10, y + 18, 14, false);
  c.text("MEDICINES", X + 2 * COL_W + 32, y + 31, {
    font: "bold 11px sans-serif",
  });
  y += H_CAT;

  // ----- OTHER row -----
  c.rect(X, y, COL_LEFT_W, 45);
  c.rect(X + COL_LEFT_W, y, W - COL_LEFT_W, 45);
  c.text("OTHER (PLEASE SPECIFY)", X + 10, y + 27, {
    font: "bold 11px sans-serif",
  });
  y += 45;

  // ----- Dangerous goods declaration row -----
  const H_DANGER = 80;
  c.rect(X, y, W, H_DANGER);
  c.text("WHETHER THE PARCEL CONTAINS THE FOLLOWING:", c.W / 2, y + 18, {
    font: "bold 11px sans-serif",
    align: "center",
  });
  c.text(
    "DRY COCONUT / BATTERY-INBUILT ELECTRONICS / FLAMMABLE ITEMS /",
    c.W / 2,
    y + 36,
    { font: "11px sans-serif", align: "center" },
  );
  c.text("CHEMICAL SUBSTANCES / LIQUIDS / MAGNETIC MATERIAL", c.W / 2, y + 52, {
    font: "11px sans-serif",
    align: "center",
  });
  // YES [ ]   NO [X], rendered as labels with drawn checkboxes for the icon
  const cx = c.W / 2;
  c.text("YES", cx - 70, y + 71, { font: "bold 11px sans-serif" });
  c.drawCheckbox(cx - 42, y + 58, 14, false);
  c.text("NO", cx + 20, y + 71, { font: "bold 11px sans-serif" });
  c.drawCheckbox(cx + 42, y + 58, 14, true);
  y += H_DANGER;

  // ----- TOTAL VALUE row -----
  c.rect(X, y, COL_LEFT_W, 45);
  c.rect(X + COL_LEFT_W, y, W - COL_LEFT_W, 45);
  c.text("TOTAL VALUE IN RS:", X + 10, y + 27, {
    font: "bold 11px sans-serif",
  });
  c.text(`Rs. ${totalValueRs || 0} /-`, X + COL_LEFT_W + 10, y + 27, {
    font: "bold 13px sans-serif",
  });
  y += 45;

  // ----- COD row (only when payment method is COD) -----
  if (isCOD) {
    const H_COD = 45;
    c.rect(X, y, W, H_COD); // border only, no fill
    c.text(`COLLECT CASH:   Rs. ${codAmount || 0} /-`, X + 10, y + 28, {
      font: "bold 14px sans-serif",
    });
    y += H_COD;
  }

  // ----- Sender / Addressee header -----
  const COL_HALF = W / 2;
  c.rect(X, y, COL_HALF, 30, { fill: "#f5f5f5", stroke: "#000" });
  c.rect(X + COL_HALF, y, COL_HALF, 30, { fill: "#f5f5f5", stroke: "#000" });
  c.text("SENDER / RETURN ADDRESS:", X + 10, y + 19, {
    font: "bold 11px sans-serif",
  });
  c.text("ADDRESSEE ADDRESS:", X + COL_HALF + 10, y + 19, {
    font: "bold 11px sans-serif",
  });
  y += 30;

  // ----- Sender / Addressee body -----
  const H_BODY = 260;
  c.rect(X, y, COL_HALF, H_BODY);
  c.rect(X + COL_HALF, y, COL_HALF, H_BODY);

  // Sender (left column)
  let sy = y + 20;
  c.text("NAME:", X + 10, sy, { font: "bold 10px sans-serif", color: "#555" });
  c.text(SENDER.name, X + 60, sy, { font: "bold 12px sans-serif" });
  sy += 24;
  c.text("ADDRESS:", X + 10, sy, {
    font: "bold 10px sans-serif",
    color: "#555",
  });
  let addrY = sy + 16;
  SENDER.addressLines.forEach((line) => {
    c.text(line, X + 10, addrY, { font: "11px sans-serif" });
    addrY += 14;
  });
  sy = y + H_BODY - 70;
  c.text("STATE:", X + 10, sy, {
    font: "bold 10px sans-serif",
    color: "#555",
  });
  c.text(SENDER.state, X + 70, sy, { font: "11px sans-serif" });
  sy += 20;
  c.text("PINCODE:", X + 10, sy, {
    font: "bold 10px sans-serif",
    color: "#555",
  });
  c.text(SENDER.pincode, X + 70, sy, { font: "11px sans-serif" });
  sy += 20;
  c.text("MOBILE NO:", X + 10, sy, {
    font: "bold 10px sans-serif",
    color: "#555",
  });
  c.text(SENDER.mobile, X + 80, sy, { font: "11px sans-serif" });

  // Addressee (right column)
  const aX = X + COL_HALF + 10;
  let ay = y + 20;
  c.text("NAME:", aX, ay, { font: "bold 10px sans-serif", color: "#555" });
  c.text(customerName || "", aX + 50, ay, { font: "bold 12px sans-serif" });
  ay += 24;
  c.text("ADDRESS:", aX, ay, { font: "bold 10px sans-serif", color: "#555" });
  c.wrap(customerAddress || "", aX, ay + 16, COL_HALF - 20, 14, {
    font: "11px sans-serif",
  });

  ay = y + H_BODY - 70;
  c.text("STATE:", aX, ay, { font: "bold 10px sans-serif", color: "#555" });
  c.text(customerState || "", aX + 60, ay, { font: "11px sans-serif" });
  ay += 20;
  c.text("PINCODE:", aX, ay, { font: "bold 10px sans-serif", color: "#555" });
  c.text(customerPincode || "", aX + 70, ay, { font: "11px sans-serif" });
  ay += 20;
  c.text("MOBILE NO:", aX, ay, {
    font: "bold 10px sans-serif",
    color: "#555",
  });
  c.text(customerPhone || "", aX + 80, ay, { font: "11px sans-serif" });

  y += H_BODY;

  // ----- Declaration footer text -----
  const H_FOOT = 78;
  c.rect(X, y, W, H_FOOT);
  c.text(
    "I, THE UNDERSIGNED, WHOSE NAME AND ADDRESS ARE MENTIONED ABOVE, CERTIFY THAT",
    X + 10,
    y + 22,
    { font: "10px sans-serif" },
  );
  c.text(
    "THE PARTICULARS GIVEN IN THIS DECLARATION ARE CORRECT AND THAT THIS ITEM",
    X + 10,
    y + 40,
    { font: "10px sans-serif" },
  );
  c.text(
    "DOES NOT CONTAIN ANY DANGEROUS ARTICLE OR ARTICLES PROHIBITED BY LEGISLATION.",
    X + 10,
    y + 58,
    { font: "10px sans-serif" },
  );
  y += H_FOOT;

  // ----- Date / signature row -----
  c.rect(X, y, W, 50);
  c.text("DATE AND SENDER'S SIGNATURE", X + W - 10, y + 32, {
    font: "bold 10px sans-serif",
    align: "right",
  });
  y += 50;

  return y;
}

// Draw a simple FROM/TO address label (small lined table).
// Returns the y-coordinate after the label ends.
export function drawAddressLabel(c, startY, data) {
  const {
    orderId,
    customerName,
    customerAddress,
    customerCity,
    customerPincode,
    customerPhone,
    isCOD,
    codAmount,
  } = data;

  const X = 40;
  const W = c.W - 80;
  let y = startY;

  // Title row
  c.rect(X, y, W, 35);
  c.text("SHIPPING LABEL, TheBookX", c.W / 2, y + 23, {
    font: "bold 13px sans-serif",
    align: "center",
  });
  y += 35;

  // COD callout, large bold text, only when this is a COD order.
  // Sits between the title and the FROM/TO table so a courier sees the
  // cash-to-collect amount immediately on picking up the parcel.
  if (isCOD && codAmount) {
    c.rect(X, y, W, 50);
    c.text(`COLLECT CASH ON DELIVERY:  Rs. ${codAmount} /-`, c.W / 2, y + 32, {
      font: "bold 20px sans-serif",
      align: "center",
    });
    y += 50;
  }

  // 2-column header
  const COL_HALF = W / 2;
  c.rect(X, y, COL_HALF, 28, { fill: "#f5f5f5", stroke: "#000" });
  c.rect(X + COL_HALF, y, COL_HALF, 28, { fill: "#f5f5f5", stroke: "#000" });
  c.text("FROM (SENDER)", X + 10, y + 19, { font: "bold 11px sans-serif" });
  c.text("TO (ADDRESSEE)", X + COL_HALF + 10, y + 19, {
    font: "bold 11px sans-serif",
  });
  y += 28;

  // Body, 2 columns
  const H_BODY = 280;
  c.rect(X, y, COL_HALF, H_BODY);
  c.rect(X + COL_HALF, y, COL_HALF, H_BODY);

  // Sender (left)
  let sy = y + 18;
  c.text("NAME:", X + 10, sy, { font: "bold 10px sans-serif", color: "#555" });
  c.text(SENDER.name, X + 10, sy + 16, { font: "bold 13px sans-serif" });
  sy += 42;
  c.text("ADDRESS:", X + 10, sy, {
    font: "bold 10px sans-serif",
    color: "#555",
  });
  let addrY = sy + 16;
  SENDER.addressLines.forEach((line) => {
    c.text(line, X + 10, addrY, { font: "12px sans-serif" });
    addrY += 15;
  });
  sy = addrY + 14;
  c.text("MOBILE:", X + 10, sy, {
    font: "bold 10px sans-serif",
    color: "#555",
  });
  c.text(SENDER.mobile, X + 10, sy + 16, { font: "12px sans-serif" });

  // Addressee (right)
  const aX = X + COL_HALF + 10;
  let ay = y + 18;
  c.text("NAME:", aX, ay, { font: "bold 10px sans-serif", color: "#555" });
  c.text(customerName || "", aX, ay + 16, { font: "bold 13px sans-serif" });
  ay += 42;
  c.text("ADDRESS:", aX, ay, { font: "bold 10px sans-serif", color: "#555" });
  const wrapEndY = c.wrap(
    customerAddress || "",
    aX,
    ay + 16,
    COL_HALF - 20,
    15,
    {
      font: "12px sans-serif",
    },
  );
  ay = wrapEndY + 16;
  c.text("CITY:", aX, ay, { font: "bold 10px sans-serif", color: "#555" });
  c.text(customerCity || "", aX + 50, ay, { font: "12px sans-serif" });
  ay += 18;
  c.text("PINCODE:", aX, ay, {
    font: "bold 10px sans-serif",
    color: "#555",
  });
  c.text(customerPincode || "", aX + 60, ay, { font: "12px sans-serif" });
  ay += 18;
  c.text("MOBILE:", aX, ay, { font: "bold 10px sans-serif", color: "#555" });
  c.text(`+91 ${customerPhone || ""}`, aX + 55, ay, {
    font: "12px sans-serif",
  });

  y += H_BODY;

  // Footer with order ID + date
  c.rect(X, y, W, 30);
  c.text(`ORDER ID: ${orderId || ""}`, X + 10, y + 20, {
    font: "bold 11px sans-serif",
  });
  c.text(
    new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    X + W - 10,
    y + 20,
    { font: "11px sans-serif", align: "right" },
  );
  y += 30;

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
    isCOD,
    codAmount: data.codAmount,
  });
  c.download(`address_label_${data.orderId || Date.now()}.png`);
}
