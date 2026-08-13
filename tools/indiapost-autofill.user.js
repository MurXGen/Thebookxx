// ==UserScript==
// @name         TheBookX · India Post Autofill
// @namespace    thebookx.in
// @version      2.11.0
// @description  Fill the India Post "Domestic Mail Booking" wizard from a TheBookX order. Copy an order's data in the Book-online modal, then click "Fill this step" on each stage of the government form.
// @match        https://app.indiapost.gov.in/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // ---------- tiny DOM + value helpers ----------

  // Set a value on a React/Angular-controlled input so the framework notices.
  // opts.noBlur skips the blur event (some search boxes clear on blur).
  function setNativeValue(el, value, opts = {}) {
    const proto = Object.getPrototypeOf(el);
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    const setter = desc && desc.set;
    const vproto = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    );
    if (setter) setter.call(el, value);
    else if (vproto && vproto.set) vproto.set.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    el.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    if (!opts.noBlur) el.dispatchEvent(new Event("blur", { bubbles: true }));
  }

  // Dispatch a full mouse-click sequence so Angular click handlers fire.
  function fireClick(el) {
    if (!el) return;
    ["mousedown", "mouseup", "click"].forEach((type) =>
      el.dispatchEvent(
        new MouseEvent(type, { bubbles: true, cancelable: true, view: window }),
      ),
    );
  }

  // Best-effort human-readable label for a field, from many sources.
  function labelFor(el) {
    const bits = [];
    if (el.labels && el.labels[0]) bits.push(el.labels[0].innerText);
    const holder = el.closest(
      ".form-group, .mat-form-field, .mat-mdc-form-field, mat-form-field, div",
    );
    if (holder) {
      const l = holder.querySelector("label, .label, mat-label, .mat-label");
      if (l) bits.push(l.innerText);
    }
    bits.push(
      el.getAttribute("placeholder") || "",
      el.getAttribute("aria-label") || "",
      el.getAttribute("formcontrolname") || "",
      el.getAttribute("name") || "",
      el.id || "",
    );
    return bits.join(" ").toLowerCase();
  }

  const fields = () =>
    Array.from(
      document.querySelectorAll(
        'input:not([type="hidden"]), textarea, select',
      ),
    ).filter((el) => el.offsetParent !== null || el.type === "checkbox");

  // Find the first visible field whose label matches ANY of the patterns.
  function findField(patterns, { type } = {}) {
    const list = fields();
    for (const el of list) {
      if (type && el.type !== type) continue;
      const lab = labelFor(el);
      if (patterns.some((p) => p.test(lab))) return el;
    }
    return null;
  }

  function fillText(patterns, value, log) {
    if (value === undefined || value === null || value === "") return false;
    const el = findField(patterns);
    if (!el) {
      log && log(`· not found: ${patterns[0]}`, "warn");
      return false;
    }
    el.focus();
    setNativeValue(el, String(value));
    log && log(`✓ ${labelSummary(patterns)} = ${value}`);
    return true;
  }

  function checkBox(patterns, on, log) {
    const el = findField(patterns, { type: "checkbox" });
    if (!el) {
      log && log(`· checkbox not found: ${patterns[0]}`, "warn");
      return false;
    }
    if (!!el.checked !== !!on) {
      el.click();
      log && log(`✓ ${labelSummary(patterns)} = ${on ? "checked" : "off"}`);
    }
    return true;
  }

  function labelSummary(patterns) {
    return patterns[0].source.replace(/\\/g, "").slice(0, 24);
  }

  // Angular Material / custom dropdowns: click the trigger, wait for the
  // overlay options, click the one whose text matches.
  async function selectDropdown(patterns, optionText, log) {
    // The trigger may be a mat-select, a [role=combobox], or a plain select.
    const native = findField(patterns);
    if (native && native.tagName === "SELECT") {
      const opt = Array.from(native.options).find((o) =>
        o.text.toLowerCase().includes(optionText.toLowerCase()),
      );
      if (opt) {
        native.value = opt.value;
        native.dispatchEvent(new Event("change", { bubbles: true }));
        log && log(`✓ ${labelSummary(patterns)} = ${optionText}`);
        return true;
      }
    }
    // Custom control: find a trigger near a label matching the patterns.
    const trigger = findTrigger(patterns);
    if (!trigger) {
      log && log(`· dropdown not found: ${patterns[0]}`, "warn");
      return false;
    }
    trigger.click();
    await sleep(350);
    const opt = Array.from(
      document.querySelectorAll(
        "mat-option, .mat-option, .mat-mdc-option, [role='option'], li, .dropdown-item",
      ),
    ).find((o) =>
      (o.innerText || "").toLowerCase().includes(optionText.toLowerCase()),
    );
    if (opt) {
      opt.click();
      log && log(`✓ ${labelSummary(patterns)} = ${optionText}`);
      return true;
    }
    log && log(`· option not found: ${optionText}`, "warn");
    return false;
  }

  function findTrigger(patterns) {
    const cands = Array.from(
      document.querySelectorAll(
        "mat-select, [role='combobox'], .mat-select-trigger, .mat-mdc-select-trigger, .ng-select, .dropdown-toggle",
      ),
    );
    for (const el of cands) {
      const holder = el.closest(
        ".form-group, .mat-form-field, .mat-mdc-form-field, mat-form-field, div",
      );
      const lab = (
        (holder && holder.innerText) ||
        el.getAttribute("aria-label") ||
        ""
      ).toLowerCase();
      if (patterns.some((p) => p.test(lab))) return el;
    }
    return cands[0] || null;
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- direct fill by element id (India Post uses stable ids) ----------

  // Sender is always TheBookX — hardcoded so it fills automatically.
  const SENDER = {
    senderFirstName: "TheBookX",
    senderMobileNumber: "7977960242",
    // India Post caps each address line at 30 characters, so keep them short.
    senderAddressLine1: "Near Shilpa Sarees",
    senderAddressLine2: "Opp Apollo Pharmacy",
    senderAddressLine3: "Maheshwari Udyan Circle", // landmark
    senderPincode: "400019",
    senderCity: "Mumbai",
    senderState: "Maharashtra",
  };

  function byId(id, val, log) {
    if (val === undefined || val === null || String(val) === "") return false;
    const el = document.getElementById(id);
    if (!el) {
      log && log(`· #${id} not on page`, "warn");
      return false;
    }
    // No focus() — focusing a field can trigger the portal's popups.
    setNativeValue(el, String(val));
    log && log(`✓ ${id} = ${val}`);
    return true;
  }

  function splitName(full) {
    const parts = String(full || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return { first: parts[0] || full || "", last: "" };
    return { first: parts[0], last: parts.slice(1).join(" ") };
  }

  // Open a custom dropdown by the placeholder text it currently shows, then
  // click the option whose text matches. Handles the Mail Shape control.
  async function selectByPlaceholder(placeholder, optionText, log) {
    const all = () => Array.from(document.querySelectorAll("*"));
    const ph = all().find(
      (el) =>
        el.childElementCount === 0 &&
        el.textContent.trim() === placeholder &&
        el.offsetParent !== null,
    );
    if (!ph) {
      log && log(`· dropdown "${placeholder}" not found`, "warn");
      return false;
    }
    const trigger =
      ph.closest(
        '[role="combobox"],[class*="select"],[class*="dropdown"],button,div',
      ) || ph;
    trigger.click();
    await sleep(450);
    let opt = all().find(
      (el) =>
        el.childElementCount === 0 &&
        el.textContent.trim() === optionText &&
        el.offsetParent !== null,
    );
    if (!opt)
      opt = all().find(
        (el) =>
          el.childElementCount === 0 &&
          el.textContent.trim().toLowerCase().includes(optionText.toLowerCase()) &&
          el.offsetParent !== null,
      );
    if (opt) {
      opt.click();
      log && log(`✓ ${placeholder} → ${optionText}`);
      return true;
    }
    log && log(`· option "${optionText}" not found`, "warn");
    return false;
  }

  async function fillAll(d, log) {
    // 1 — Parcel dimensions only (plain inputs). Mail Shape/Delivery Type
    // dropdowns and COD are left for you to pick via their modals.
    byId("length", d.length, log);
    byId("width", d.width, log);
    byId("height", d.height, log);

    // Names must stay within 30 characters.
    const cap30 = (s) => String(s || "").slice(0, 30);

    // Sender is managed on India Post's side ("save address"), so we don't
    // touch it — only the recipient is filled.

    // 2 — Recipient (the customer) fully, including pincode
    const nm = splitName(d.name);
    byId("recepientFirstName", cap30(nm.first), log);
    if (nm.last) byId("recepientLastName", cap30(nm.last), log);
    byId("recepientCompanyName", cap30(nm.first), log);
    byId("recepientMobileNumber", d.mobile, log);
    byId("recepientAddressLine1", cap30(d.addr1), log);
    byId("recepientAddressLine2", cap30(d.addr2), log);
    byId("recepientAddressLine3", cap30(d.landmark), log); // landmark
    // Pincode fields open the "Pincode Search" popup — left for you to complete
    // manually (city/state auto-fill from them).

    // 4 — COD: tick "COD Retail" and fill the net amount (if the order is COD
    // and the section is on this step).
    if (d.isCOD && d.codAmount) await fillCOD(d, log);

    // 5 — Tick the "Declarations" checkboxes if that section is on this step.
    tickDeclarations(log);

    log("Filled text inputs + COD + declarations. Complete the pincode popups, Mail Shape / Delivery Type yourself.", "head");
  }

  // Tick the checkbox associated with a line of text matching `regex`. Scans
  // matches tightest-first; skips ones already checked and keeps looking, so a
  // stale (already-ticked) checkbox elsewhere on the page can't shadow the one
  // we actually need.
  function tickCheckboxFor(regex, name, log) {
    const texts = Array.from(document.querySelectorAll("label, span, div, p"))
      .filter((el) => regex.test(el.textContent || ""))
      .sort((a, b) => a.textContent.length - b.textContent.length);
    let sawChecked = false;
    for (const node of texts) {
      let row = node.closest("label, .form-check, .custom-control, div") || node;
      // Never cross into a container holding a pincode field.
      if (
        row.querySelector &&
        row.querySelector('[id*="incode"], [id*="Pincode"]')
      )
        row = node.parentElement || node;
      if (!row.querySelector) continue;

      const real = row.querySelector('input[type="checkbox"]');
      if (real) {
        if (real.checked) {
          sawChecked = true;
          continue;
        }
        // Styled checkboxes hide the input — click the label if there is one.
        const lbl =
          (real.id && document.querySelector(`label[for="${real.id}"]`)) ||
          real.closest("label");
        fireClick(lbl || real);
        if (!real.checked) {
          real.checked = true;
          real.dispatchEvent(new Event("input", { bubbles: true }));
          real.dispatchEvent(new Event("change", { bubbles: true }));
        }
        log && log(`✓ ${name}`);
        return true;
      }

      const custom = row.querySelector(
        '[role="checkbox"], mat-checkbox, .mat-checkbox',
      );
      if (custom) {
        if (custom.getAttribute("aria-checked") === "true") {
          sawChecked = true;
          continue;
        }
        fireClick(custom);
        log && log(`✓ ${name} (custom)`);
        return true;
      }
    }
    if (sawChecked) {
      log && log(`· ${name} already ticked`);
      return true;
    }
    log && log(`· ${name} checkbox not found`, "warn");
    return false;
  }

  // Drop-off step acknowledgment.
  function tickTerms(log) {
    return tickCheckboxFor(
      /please read the following terms|terms and conditions/i,
      "terms & conditions",
      log,
    );
  }

  // Final step "Declarations" section — both checkboxes.
  function tickDeclarations(log) {
    tickCheckboxFor(
      /declare that the shipment does not contain/i,
      "declaration (prohibited items)",
      log,
    );
    tickCheckboxFor(
      /i accept the applicable terms|applicable terms\s*&\s*conditions/i,
      "accept terms & conditions",
      log,
    );
  }

  async function fillCurrentStep(d, log) {
    // On the Pickup/Drop-off step there's nothing to auto-fill (only the
    // pincode, which you complete via its popup) — so Fill is a no-op here and
    // never touches anything that could open the Pincode Search popup.
    const t = (document.body.innerText || "").toLowerCase();
    const onDropoff =
      /pick up or drop off|pickup \/ drop|dropoff information/.test(t) &&
      !/sender information|recipient information|mail shape/.test(t);
    if (onDropoff) {
      const pin = document.getElementById("dropOffPincode");
      const office = document.getElementById("dropOffOfficeName");
      const filled =
        pin && pin.value.trim() && office && office.value.trim();
      if (!filled) {
        log("Drop-off pincode not filled yet — complete the pincode popup, then click Fill again.", "head");
        return;
      }
      log("Drop-off pincode present — ticking terms & going Next…", "head");
      const ticked = tickTerms(log);
      await sleep(600);
      if (ticked) clickNext();
      else log("Tick the terms checkbox manually, then click Next.", "warn");
      return;
    }
    log("Filling text inputs (no dropdowns)…", "head");
    await fillAll(d, log);
  }

  // ---------- capture (for debugging selectors) ----------
  function captureFields() {
    const out = fields().map((el, i) => ({
      i,
      tag: el.tagName.toLowerCase(),
      type: el.type || "",
      name: el.name || "",
      id: el.id || "",
      formControlName: el.getAttribute("formcontrolname") || "",
      placeholder: el.getAttribute("placeholder") || "",
      ariaLabel: el.getAttribute("aria-label") || "",
      label: labelFor(el).trim().slice(0, 60),
    }));
    const json = JSON.stringify({ url: location.pathname, fields: out }, null, 2);
    navigator.clipboard.writeText(json).catch(() => {});
    return json;
  }

  // ---------- Pincode Search modal automation (DISABLED) ----------
  // The pincode popups are completed manually; this helper stays defined but
  // is not wired to anything, so nothing here opens or touches a popup.
  let pendingPincode = null;
  let panelLog = () => {};

  function findPincodeModal() {
    const heads = Array.from(document.querySelectorAll("*")).filter(
      (el) =>
        el.childElementCount < 4 &&
        /pincode search/i.test(el.textContent || ""),
    );
    for (const h of heads) {
      const modal = h.closest('.modal, [role="dialog"], div');
      if (modal && modal.querySelector("input")) return modal;
    }
    return null;
  }

  async function handlePincodeModal(modal, pincode) {
    panelLog(`Pincode popup → searching ${pincode}…`, "head");
    // The search box is the FIRST text input; the "Search…" filter box and the
    // per-column filter inputs only appear once results render, so grab it now.
    const input =
      modal.querySelector('input[type="text"]') ||
      modal.querySelector("input:not([type])") ||
      modal.querySelector("input");
    if (!input) {
      panelLog("· search box not found", "warn");
      return;
    }
    input.focus();
    setNativeValue(input, String(pincode), { noBlur: true }); // blur clears it
    await sleep(300);
    const searchBtn = Array.from(modal.querySelectorAll("button")).find((b) =>
      /search/i.test(b.innerText || ""),
    );
    if (searchBtn) fireClick(searchBtn);
    else
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );

    // Wait for a DATA row (a row that is NOT the column-filter row) to appear.
    const isDataRow = (r) =>
      r &&
      !r.querySelector("input") &&
      (r.textContent || "").replace(/\s/g, "").length > 0;
    let dataRow = null;
    for (let i = 0; i < 25; i++) {
      await sleep(400);
      const rows = Array.from(modal.querySelectorAll("table tbody tr"));
      dataRow = rows.find(isDataRow);
      if (dataRow) break;
    }
    if (!dataRow) {
      panelLog("· no results appeared — pick the office manually", "warn");
      return;
    }

    // Click the Select control in the first cell. Try the icon, then the cell,
    // then the row itself, re-checking after each whether the popup closed.
    const cell = dataRow.querySelector("td") || dataRow;
    const targets = [
      cell.querySelector("button, a, [role='button']"),
      cell.querySelector("svg, i, mat-icon, span"),
      cell,
      dataRow,
    ].filter(Boolean);
    for (const t of targets) {
      fireClick(t);
      const gone = await waitFor(() => !findPincodeModal(), 1500);
      if (gone) {
        panelLog("✓ picked first office", "head");
        return;
      }
    }
    panelLog("· selected a row — verify the office field filled", "note");
  }

  let handlingPincode = false;
  function watchPincodeModal() {
    new MutationObserver(async () => {
      if (handlingPincode || !pendingPincode) return;
      const modal = findPincodeModal();
      if (modal && !modal.dataset.tbxDone) {
        handlingPincode = true;
        modal.dataset.tbxDone = "1";
        const pin = pendingPincode;
        pendingPincode = null;
        await handlePincodeModal(modal, pin);
        handlingPincode = false;
      }
    }).observe(document.body, { childList: true, subtree: true });
  }

  function clickNext() {
    const btn = Array.from(document.querySelectorAll("button, a")).find((b) => {
      const t = (b.innerText || "").trim();
      return /^next\b/i.test(t) && !/complete booking/i.test(t);
    });
    if (btn) {
      btn.click();
      panelLog("▸ clicked Next", "head");
      return true;
    }
    panelLog("Next button not found on this step.", "warn");
    return false;
  }

  // ---------- sequenced auto-run ----------
  function detectStepName() {
    const t = (document.body.innerText || "").toLowerCase();
    if (/sender information|recipient information/.test(t)) return "parties";
    if (/mail shape|article information|volumetric weight/.test(t))
      return "article";
    if (/pick up or drop off|pickup \/ drop|dropoff information|drop off office/.test(t))
      return "dropoff";
    return "unknown";
  }

  // Click a pincode field to open the "Pincode Search" popup, let the watcher
  // fill it, then wait for the popup to close. Falls back to a plain value if
  // no popup opens (some pincode fields are ordinary inputs).
  async function fillPincodeField(id, pin, log) {
    if (!pin) return;
    const el = document.getElementById(id);
    if (!el) {
      log(`· #${id} not on page`, "warn");
      return;
    }
    pendingPincode = pin;
    el.focus();
    el.click();
    const opened = await waitFor(() => findPincodeModal(), 3000);
    if (opened) {
      await waitFor(() => !findPincodeModal(), 20000);
      log(`✓ ${id} via popup = ${pin}`);
    } else {
      setNativeValue(el, String(pin));
      log(`✓ ${id} = ${pin}`);
    }
    pendingPincode = null;
    await sleep(500);
  }

  function findCheckboxByText(text) {
    const nodes = Array.from(
      document.querySelectorAll("label, span, div, p"),
    ).filter(
      (el) =>
        el.childElementCount < 3 &&
        new RegExp(text, "i").test(el.textContent || ""),
    );
    for (const node of nodes) {
      const scope = node.closest("div, label") || node.parentElement;
      // ONLY real checkboxes — never a fuzzy [class*="checkbox"] element, which
      // could be a styled control that opens a popup.
      const cb = scope && scope.querySelector('input[type="checkbox"]');
      if (cb) return cb;
    }
    return null;
  }

  async function fillCOD(d, log) {
    const cb = findCheckboxByText("COD Retail");
    if (cb) {
      const on =
        cb.type === "checkbox"
          ? cb.checked
          : cb.getAttribute("aria-checked") === "true";
      if (!on) {
        cb.click();
        await sleep(500);
      }
    } else {
      log("· COD Retail checkbox not found", "warn");
    }
    const inp =
      document.getElementById("codAmount") ||
      document.getElementById("codRetailAmount") ||
      findField([/cod amount|cod retail amount/]) ||
      Array.from(document.querySelectorAll("input")).find((el) =>
        /cod/i.test(el.id || el.name || ""),
      );
    if (inp) {
      inp.focus();
      setNativeValue(inp, String(d.codAmount));
      log(`✓ COD amount = ${d.codAmount}`);
    } else {
      log("· COD amount field not found", "warn");
    }
  }

  // If the "Suggested Services" rate popup is open, pick India Post Parcel
  // (the economic/lowest option).
  async function pickSuggestedService(log) {
    const head = Array.from(document.querySelectorAll("*")).find(
      (el) =>
        el.childElementCount < 4 &&
        /suggested services/i.test(el.textContent || ""),
    );
    if (!head) return false;
    const box = head.closest('.modal, [role="dialog"], div') || document;
    const cards = Array.from(box.querySelectorAll("*")).filter(
      (el) =>
        el.offsetParent !== null &&
        /india\s*post\s*parcel/i.test(el.textContent || ""),
    );
    const card = cards.sort(
      (a, b) => a.textContent.length - b.textContent.length,
    )[0];
    if (card) {
      (card.closest('button, [role="button"], .card, div') || card).click();
      log("✓ picked India Post Parcel rate");
      await sleep(400);
      return true;
    }
    return false;
  }

  async function waitFor(fn, timeout) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      try {
        if (fn()) return true;
      } catch (e) {}
      await sleep(300);
    }
    return false;
  }

  // Drop-off step: open the pincode popup, let the watcher pick the office,
  // tick terms, then advance.
  async function autoDropoff(log) {
    const field =
      document.getElementById("dropOffPincode") ||
      findField([/pincode/]);
    if (!field) {
      log("· drop-off pincode field not found", "warn");
      return false;
    }
    pendingPincode = "400017";
    field.focus();
    field.click();
    log("Opened pincode popup — searching 400017…", "head");
    // Wait for the popup to OPEN first (it renders async), otherwise the
    // "modal gone" check passes instantly and we'd race ahead.
    await waitFor(() => findPincodeModal(), 3000);
    // Then wait for the office to be selected (field filled) AND popup closed.
    const done = await waitFor(() => {
      const off = document.getElementById("dropOffOfficeName");
      return off && off.value && !findPincodeModal();
    }, 18000);
    if (!done) {
      log("· office not selected — pick it in the popup, then ▸ Next", "warn");
      return false;
    }
    pendingPincode = null;
    await sleep(600);
    tickTerms(log);
    await sleep(400);
    return clickNext();
  }

  // Article step: origin/destination pincode popups, weight, mail shape,
  // dimensions, delivery type, COD — then it's ready for Next.
  async function autoArticle(d, log) {
    await fillPincodeField("originPincode", "400017", log);
    await fillPincodeField("destinationPincode", d.pincode, log);
    byId("physicalWeight", "500", log);
    await sleep(500);
    await pickSuggestedService(log);
    await selectByPlaceholder("Select Mail Shape", "Box Type (Non Roll Form)", log);
    byId("length", d.length, log);
    byId("width", d.width, log);
    byId("height", d.height, log);
    await selectByPlaceholder(
      "Select Delivery Instructions",
      "Normal Delivery",
      log,
    );
    if (d.isCOD && d.codAmount) await fillCOD(d, log);
    await pickSuggestedService(log);
  }

  // Sender + Recipient step (with pincode popups handled).
  async function autoParties(d, log) {
    const cap30 = (s) => String(s || "").slice(0, 30);
    // Sender (TheBookX)
    byId("senderFirstName", cap30(SENDER.senderFirstName), log);
    byId("senderCompanyName", cap30(SENDER.senderFirstName), log);
    byId("senderMobileNumber", SENDER.senderMobileNumber, log);
    byId("senderAddressLine1", SENDER.senderAddressLine1, log);
    byId("senderAddressLine2", SENDER.senderAddressLine2, log);
    byId("senderAddressLine3", SENDER.senderAddressLine3, log);
    await fillPincodeField("senderPincode", "400019", log);
    // Recipient (customer)
    const nm = splitName(d.name);
    byId("recepientFirstName", cap30(nm.first), log);
    if (nm.last) byId("recepientLastName", cap30(nm.last), log);
    byId("recepientCompanyName", cap30(nm.first), log);
    byId("recepientMobileNumber", d.mobile, log);
    byId("recepientAddressLine1", d.addr1, log);
    byId("recepientAddressLine2", d.addr2, log);
    byId("recepientAddressLine3", d.landmark, log);
    await fillPincodeField("recepientPincode", d.pincode, log);
    await sleep(700);
    const rCity = document.getElementById("recepientCity");
    const rState = document.getElementById("recepientState");
    if (rCity && !rCity.value) byId("recepientCity", d.city, log);
    if (rState && !rState.value) byId("recepientState", d.state, log);
    tickTerms(log);
  }

  async function autoRun(d, log) {
    if (!d) return log("Load an order first.", "warn");
    // Walk through the wizard steps, filling each and advancing, but never
    // clicking the final "Complete Booking".
    for (let i = 0; i < 5; i++) {
      const step = detectStepName();
      log(`▶ Step: ${step}`, "head");
      if (step === "dropoff") {
        const ok = await autoDropoff(log); // fills + ticks terms + Next
        if (!ok) return log("Stopped at drop-off. Click ▸ Next / re-run.", "warn");
      } else if (step === "article") {
        await autoArticle(d, log);
        await sleep(500);
        await pickSuggestedService(log);
        if (!clickNext())
          return log("Article filled — advance with ▸ Next when ready.", "head");
      } else if (step === "parties") {
        await autoParties(d, log);
        log("Sender + recipient filled. Review everything, then complete the booking yourself.", "head");
        return;
      } else {
        log("Reached an unknown/final step — stopping so you can review & Complete.", "warn");
        return;
      }
      const moved = await waitFor(() => detectStepName() !== step, 9000);
      if (!moved)
        return log("Didn't advance — pick any pending dropdown, then ▸ Next / re-run.", "warn");
    }
  }

  // ---------- floating panel UI ----------

  let ORDER = null;

  function makePanel() {
    if (document.getElementById("tbx-ip-panel")) return;
    const wrap = document.createElement("div");
    wrap.id = "tbx-ip-panel";
    wrap.innerHTML = `
      <style>
        #tbx-ip-panel{position:fixed;right:16px;bottom:16px;z-index:2147483647;width:300px;
          font:13px/1.4 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;
          background:#fff;border:1px solid #e5e7eb;border-radius:14px;
          box-shadow:0 10px 40px rgba(0,0,0,.18);overflow:hidden}
        #tbx-ip-panel .h{display:flex;align-items:center;gap:8px;padding:10px 12px;
          background:#fb8500;color:#fff;font-weight:700}
        #tbx-ip-panel .h .x{margin-left:auto;cursor:pointer;opacity:.9}
        #tbx-ip-panel .b{padding:10px 12px}
        #tbx-ip-panel .who{font-weight:700;margin-bottom:2px}
        #tbx-ip-panel .sub{color:#6b7280;font-size:11px;margin-bottom:8px}
        #tbx-ip-panel button{width:100%;margin:4px 0;padding:8px 10px;border-radius:9px;
          border:1px solid #fb8500;background:#fff7ed;color:#c25e00;font-weight:700;cursor:pointer}
        #tbx-ip-panel button.primary{background:#fb8500;color:#fff;border-color:#fb8500}
        #tbx-ip-panel button.ghost{background:#fff;color:#374151;border-color:#e5e7eb;font-weight:600}
        #tbx-ip-panel .log{margin-top:8px;max-height:180px;overflow:auto;font-size:11px;
          background:#f9fafb;border:1px solid #eef2f7;border-radius:8px;padding:6px 8px}
        #tbx-ip-panel .log .l{white-space:pre-wrap}
        #tbx-ip-panel .log .warn{color:#b45309}
        #tbx-ip-panel .log .head{font-weight:700;color:#111;margin-top:4px}
        #tbx-ip-panel .log .note{color:#2563eb}
        #tbx-ip-panel textarea{width:100%;height:52px;border:1px solid #e5e7eb;border-radius:8px;
          padding:6px;font-size:11px;box-sizing:border-box}
      </style>
      <div class="h">📦 TheBookX Autofill <span class="x" title="Hide">✕</span></div>
      <div class="b">
        <div class="who" id="tbx-who">No order loaded</div>
        <div class="sub" id="tbx-sub">Click “Copy for autofill” in the Book-online modal, then load it here.</div>
        <button class="ghost" id="tbx-load">📋 Load order from clipboard</button>
        <button class="primary" id="tbx-fill">✨ Fill this step</button>
        <button class="ghost" id="tbx-cap">🔍 Capture fields (debug)</button>
        <details><summary style="font-size:11px;color:#6b7280;cursor:pointer;margin-top:6px">Paste JSON manually</summary>
          <textarea id="tbx-paste" placeholder="Paste the order JSON here"></textarea>
          <button class="ghost" id="tbx-usepaste">Use pasted JSON</button>
        </details>
        <div class="log" id="tbx-log"></div>
      </div>`;
    document.body.appendChild(wrap);

    const logEl = wrap.querySelector("#tbx-log");
    const log = (msg, kind = "l") => {
      const d = document.createElement("div");
      d.className = kind === "l" ? "l" : "l " + kind;
      d.textContent = msg;
      logEl.appendChild(d);
      logEl.scrollTop = logEl.scrollHeight;
    };
    // Expose the panel logger to the pincode-modal automation.
    panelLog = log;

    const setOrder = (d) => {
      ORDER = d;
      wrap.querySelector("#tbx-who").textContent =
        (d.name || "Order") + (d.isCOD ? `  ·  COD ₹${d.codAmount}` : "  ·  Prepaid");
      wrap.querySelector("#tbx-sub").textContent = `Order ${d.orderId || ""}`;
      log(`Loaded: ${d.name} (${d.orderId})`, "head");
    };
    const tryParse = (txt) => {
      try {
        const d = JSON.parse(txt);
        if (d && d.v === "tbx-ip-1") {
          setOrder(d);
          return true;
        }
        log("That JSON isn't a TheBookX autofill payload.", "warn");
      } catch (e) {
        log("Couldn't parse clipboard as JSON.", "warn");
      }
      return false;
    };

    wrap.querySelector(".x").onclick = () => (wrap.style.display = "none");
    wrap.querySelector("#tbx-load").onclick = async () => {
      try {
        const txt = await navigator.clipboard.readText();
        tryParse(txt);
      } catch (e) {
        log("Clipboard blocked — use “Paste JSON manually”.", "warn");
      }
    };
    wrap.querySelector("#tbx-usepaste").onclick = () =>
      tryParse(wrap.querySelector("#tbx-paste").value.trim());
    wrap.querySelector("#tbx-fill").onclick = async () => {
      if (!ORDER) return log("Load an order first.", "warn");
      await fillCurrentStep(ORDER, log);
    };
    wrap.querySelector("#tbx-cap").onclick = () => {
      captureFields();
      log("Field map copied to clipboard — paste it to Claude.", "head");
    };
  }

  // Keep the panel alive across the SPA's route changes.
  const boot = () => makePanel();
  boot();
  new MutationObserver(() => {
    if (!document.getElementById("tbx-ip-panel")) boot();
  }).observe(document.documentElement, { childList: true, subtree: true });

  // Pincode Search popup automation is intentionally disabled — you complete
  // the pincode popups manually. (watchPincodeModal is left defined but unused.)
})();
