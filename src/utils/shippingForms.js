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
  } = data;

  // `big` (used by the standalone label-only download) scales up type and
  // bolds the main details for readability, since it has a full page to fill.
  const big = !!opts.big;
  const F = {
    title: big ? "bold 17px sans-serif" : "bold 13px sans-serif",
    cod: big ? "bold 26px sans-serif" : "bold 20px sans-serif",
    header: big ? "bold 14px sans-serif" : "bold 11px sans-serif",
    caption: big ? "bold 12px sans-serif" : "bold 10px sans-serif",
    name: big ? "bold 18px sans-serif" : "bold 13px sans-serif",
    value: big ? "bold 15px sans-serif" : "12px sans-serif",
    footer: big ? "bold 13px sans-serif" : "bold 11px sans-serif",
    footerDate: big ? "13px sans-serif" : "11px sans-serif",
  };
  const lineH = big ? 20 : 15;
  const titleH = big ? 42 : 35;
  const codH = big ? 62 : 50;
  const headerH = big ? 34 : 28;
  const footerH = big ? 38 : 30;

  const BRAND = "#fb8500";
  const X = 40;
  const W = c.W - 80;
  let y = startY;

  // Title / brand header
  if (big) {
    const brandH = 78;
    c.rect(X, y, W, brandH);
    // orange accent bar across the top of the header
    c.rect(X, y, W, 7, { fill: BRAND, stroke: false });
    c.text("TheBookX", c.W / 2, y + 46, {
      font: "bold 32px sans-serif",
      align: "center",
      color: BRAND,
    });
    // subtitle with a little letter-spacing feel via caps
    c.text("S H I P P I N G   L A B E L", c.W / 2, y + 67, {
      font: "bold 12px sans-serif",
      align: "center",
      color: "#666",
    });
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
  const H_BODY = big ? 340 : 280;
  const nameGap = big ? 52 : 42;
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
  c.text("MOBILE:", aX, ay, { font: F.caption, color: "#555" });
  c.text(`+91 ${customerPhone || ""}`, aX + mobValX, ay, {
    font: F.value,
  });

  // Map QR — when the customer pinned their location, a courier can scan it to
  // navigate straight to the drop point. Sits at the bottom-right of the TO box.
  if (mapLink) {
    const qSize = big ? 118 : 84;
    const qx = X + W - qSize - 14;
    const qy = y + H_BODY - qSize - 22;
    const drew = drawQrCode(c.ctx, mapLink, qx, qy, qSize);
    if (drew) {
      c.text("Scan receiver location", qx + qSize / 2, qy + qSize + 14, {
        font: big ? "bold 11px sans-serif" : "bold 9px sans-serif",
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
        font: big ? "bold 15px sans-serif" : "bold 12px sans-serif",
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
        font: big ? "bold 12px sans-serif" : "bold 10px sans-serif",
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
        font: big ? "bold 12px sans-serif" : "bold 10px sans-serif",
        baseline: "middle",
      });
    }
    y += stripH;
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
      font: "10px sans-serif",
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

// ── Address-label ONLY exports (bottom From/To section, no India Post CDF) ──
export function buildAddressLabelCanvas(data) {
  const isCOD = !!data.isCOD;
  // Wider label so a 3-up stack matches A4 proportions and fills the page
  // width instead of leaving big side margins.
  const W = 1080;
  const SAFE_H = 780;
  const topPad = 36;
  const botPad = 36;
  const c = buildCanvas(W, SAFE_H);
  const endY = drawAddressLabel(
    c,
    topPad,
    {
      orderId: data.orderId,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
      customerCity: data.customerCity,
      customerPincode: data.customerPincode,
      customerPhone: data.customerPhone,
      isCOD,
      codAmount: data.codAmount,
      isFaster: data.isFaster,
      hasGiftWrap: data.hasGiftWrap,
      hasBookmark: data.hasBookmark,
    },
    { big: true },
  );
  const finalH = Math.min(endY + botPad, SAFE_H);
  const out = document.createElement("canvas");
  out.width = W * 2;
  out.height = finalH * 2;
  out
    .getContext("2d")
    .drawImage(c.canvas, 0, 0, W * 2, finalH * 2, 0, 0, W * 2, finalH * 2);
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

export function buildAddressLabelSheetCanvas(group) {
  const labels = group.map((d) => buildAddressLabelCanvas(d));
  const GAP = 48; // vertical space between/around labels (2x px)
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
      // dashed cut line centered in the gap
      ctx.strokeStyle = "#bbb";
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

// Many address labels → ONE ordered PDF, three labels per page, no CDF.
export function downloadAddressLabelsPDF(dataArray, filename) {
  const pages = [];
  for (let i = 0; i < dataArray.length; i += LABELS_PER_PAGE) {
    const group = dataArray.slice(i, i + LABELS_PER_PAGE);
    const cv = buildAddressLabelSheetCanvas(group);
    const url = cv.toDataURL("image/jpeg", 0.92);
    pages.push({ data: dataUrlToBytes(url), w: cv.width, h: cv.height });
  }
  const blob = jpegPagesToPdf(pages, 14);
  triggerDownload(
    blob,
    filename || `address_labels_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
