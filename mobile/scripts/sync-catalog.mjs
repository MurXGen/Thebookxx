// Builds src/data/catalog.json — a slim snapshot of the website catalogue that
// ships inside the app so the home screen renders instantly (even offline).
// The app refreshes it in the background from https://www.thebookx.in/api/app/catalog.
// Run from mobile/:  node scripts/sync-catalog.mjs
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
const utils = path.resolve(here, "../../src/utils");
const require = createRequire(import.meta.url);
const { slimCatalog } = require("../../src/lib/appCatalog.cjs");

const strip = (src) =>
  src
    .replace(/^import .*$/gm, "")
    .replace(/^export (const|function|let)/gm, "$1");

function evalModule(file, names, ctx = {}) {
  const code = strip(fs.readFileSync(path.join(utils, file), "utf8"));
  const sandbox = { ...ctx, console, Date, Math, JSON };
  vm.createContext(sandbox);
  vm.runInContext(`${code}\n;__out = { ${names.join(",")} };`, sandbox);
  return sandbox.__out;
}

const { bookImages } = evalModule("bookImages.js", ["bookImages"]);
const { books } = evalModule("book.js", ["books"], { bookImages });
const { combos } = evalModule("combos.js", ["combos"], { books });
const qrSrc = fs.readFileSync(path.resolve(utils, "../data/quickreadsMeta.js"), "utf8");
const QUICKREAD_META = JSON.parse(qrSrc.match(/QUICKREAD_META = (\{[\s\S]*?\});\s*\n/)[1]);
const out = slimCatalog(books, [], combos, QUICKREAD_META);
const dest = path.resolve(here, "../src/data/catalog.json");
fs.writeFileSync(dest, JSON.stringify(out));
console.log(`catalog.json: ${out.books.length} books, ${out.combos.length} combos, ${Object.keys(out.quickreads).length} quickreads, ${(fs.statSync(dest).size / 1024).toFixed(0)} KB`);
