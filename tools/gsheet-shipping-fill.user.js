// ==UserScript==
// @name         TheBookX · Fill Shipping IDs (by name)
// @namespace    thebookx.in
// @version      1.0.0
// @description  Build the Shipping ID column for TheBookX C-Orders sheet — matches each tracking ID to its customer by name, keeps existing IDs, and copies the ready column to the clipboard. Click G2 and press Cmd/Ctrl+V once.
// @match        https://docs.google.com/spreadsheets/d/1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const SHEET_ID = "1ovqFn50d0TKjV0nm4q1lb3N9XvimUgIsHCOlHh6QRdg";

  // Name → tracking (Article) number. Add more pairs here any time.
  const MAP_RAW = {
    "MD MASKOOR AHSAN": "CX046689771IN",
    "Tanvi Wasnik": "CX046690837IN",
    "Prince yadav": "CX046691506IN",
    "Tejanshu Sekhar Panda": "CX046692682IN",
    "Jayshree": "CX046714785IN",
    "Prashant Darpe": "EY496332144IN",
    "Mariya Baig": "CX046716596IN",
    "ABIRAMI B": "CX046717075IN",
    "Shiv pandit": "CX046717645IN",
    "Aryan Rajput": "CX046718265IN",
    "HRITHIK": "CX046718994IN",
    "Dr Sunil Panchal": "CX046719500IN",
    "Mohd Ahad": "CX046719924IN",
    "Kartik Jain": "EY496358827IN",
    "Aishwarya Loganathan": "CX046721361IN",
    "Heer": "CX046722367IN",
    "Shana Yasmin": "CX046723230IN",
    "Ashfak": "CX046723623IN",
    "Divit": "CX046724442IN",
    "PARTH SONI": "CX046724990IN",
    "Sonali": "CX046725743IN",
    "Himangshu Deka": "CX046727934IN",
    "Prasad Devadiga": "EY496401919IN",
    "Nadhiya Hussain": "CX046729396IN",
    "Sagun Mardi": "CX046730638IN",
    "Jaskaran Singh": "CX046731240IN",
    "Cherry Ramteke": "CX046732585IN",
    "Vivek Jagtap": "CX046733563IN",
    "Raghav Guleria": "CX046734011IN",
    "Rishikkesh Das": "CX046734688IN",
    "Yashvi Desai": "CX046735706IN",
    "Md irshad": "CX046736732IN",
    "Kavya": "CX046737199IN",
    "Jeevika G": "CX046738279IN",
  };

  const norm = (s) =>
    String(s || "")
      .replace(/\(unconfirmed\)/gi, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const MAP = {};
  Object.keys(MAP_RAW).forEach((k) => (MAP[norm(k)] = MAP_RAW[k]));

  function currentGid() {
    const m = location.href.match(/[?#&]gid=(\d+)/);
    return m ? m[1] : "0";
  }

  // Read columns F (name) and G (shipping id) via the gviz data endpoint.
  async function readFG(gid) {
    const url =
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
      `?gid=${gid}&headers=1&tq=${encodeURIComponent("select F, G")}`;
    const res = await fetch(url, { credentials: "include" });
    const txt = await res.text();
    const start = txt.indexOf("{");
    const end = txt.lastIndexOf("}");
    const json = JSON.parse(txt.slice(start, end + 1));
    const rows = json.table.rows || [];
    return rows.map((r) => {
      const c = r.c || [];
      const name = c[0] && c[0].v != null ? c[0].v : "";
      const ship = c[1] && c[1].v != null ? c[1].v : "";
      return { name: String(name), ship: String(ship) };
    });
  }

  // Build the aligned Shipping-ID column. Rule: only fill a matched row when
  // its Shipping ID is currently EMPTY — this preserves every existing ID and
  // correctly routes a new tracking number to the new (empty) order when the
  // same customer name appears on more than one row.
  function buildColumn(rows) {
    const used = new Set();
    let matched = 0;
    const col = rows.map((row) => {
      const key = norm(row.name);
      const existing = row.ship || "";
      if (key && MAP[key] && existing === "") {
        used.add(key);
        matched++;
        return MAP[key];
      }
      return existing; // keep whatever's already there (never overwrite)
    });
    const missing = Object.keys(MAP_RAW).filter((k) => !used.has(norm(k)));
    return { col, matched, missing, total: rows.length };
  }

  function panel() {
    if (document.getElementById("tbx-ship")) return;
    const w = document.createElement("div");
    w.id = "tbx-ship";
    w.innerHTML = `
      <style>
        #tbx-ship{position:fixed;right:16px;bottom:16px;z-index:2147483647;width:310px;
          font:13px/1.45 -apple-system,Segoe UI,Roboto,sans-serif;color:#111;background:#fff;
          border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 10px 40px rgba(0,0,0,.18);overflow:hidden}
        #tbx-ship .h{display:flex;align-items:center;gap:8px;padding:10px 12px;background:#188038;color:#fff;font-weight:700}
        #tbx-ship .h .x{margin-left:auto;cursor:pointer}
        #tbx-ship .b{padding:10px 12px}
        #tbx-ship button{width:100%;margin:4px 0;padding:9px 10px;border-radius:9px;border:1px solid #188038;
          background:#188038;color:#fff;font-weight:700;cursor:pointer}
        #tbx-ship button.ghost{background:#fff;color:#188038}
        #tbx-ship .log{margin-top:8px;max-height:200px;overflow:auto;font-size:11px;background:#f6f8f6;
          border:1px solid #e6efe6;border-radius:8px;padding:6px 8px;white-space:pre-wrap}
      </style>
      <div class="h">📦 Fill Shipping IDs <span class="x">✕</span></div>
      <div class="b">
        <button id="tbx-build">📋 Build &amp; copy Shipping-ID column</button>
        <button class="ghost" id="tbx-map">Copy name → ID map (for VLOOKUP)</button>
        <div class="log" id="tbx-log">Open the “Form responses 1” tab, then click the green button. After it copies, click cell <b>G2</b> and press ⌘V (Ctrl+V).</div>
      </div>`;
    document.body.appendChild(w);
    const log = (m) => (w.querySelector("#tbx-log").innerHTML = m);
    w.querySelector(".x").onclick = () => (w.style.display = "none");

    w.querySelector("#tbx-build").onclick = async () => {
      try {
        log("Reading the sheet…");
        const rows = await readFG(currentGid());
        if (!rows.length) return log("No rows read. Are you on the data tab?");
        const { col, matched, missing, total } = buildColumn(rows);
        await navigator.clipboard.writeText(col.join("\n"));
        let msg = `✓ Copied a ${total}-row Shipping-ID column.\n${matched} rows matched a tracking ID; the rest keep their current value.\n\nNow: click cell G2 → press ⌘V (Ctrl+V).\n(⌘Z undoes if anything looks off.)`;
        if (missing.length)
          msg += `\n\n⚠ ${missing.length} tracking IDs had no matching name in the sheet:\n- ${missing.join("\n- ")}`;
        log(msg);
      } catch (e) {
        log("Couldn't read the sheet automatically: " + e.message + "\nUse the “Copy name → ID map” button + VLOOKUP instead.");
      }
    };

    w.querySelector("#tbx-map").onclick = async () => {
      const tsv = Object.keys(MAP_RAW)
        .map((k) => k + "\t" + MAP_RAW[k])
        .join("\n");
      await navigator.clipboard.writeText(tsv);
      log("✓ Copied 34 name→ID rows (tab-separated).\nPaste into two empty columns, then VLOOKUP on the name.");
    };
  }

  const boot = () => panel();
  boot();
  new MutationObserver(() => {
    if (!document.getElementById("tbx-ship")) boot();
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
