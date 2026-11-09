// Parse a sheet time into epoch ms: "DD/MM/YYYY HH:MM[:SS]" (IST, as the
// sheets store it) or gviz "Date(y,m,d,h,i,s)". A date with no time = 23:59 IST.
export function parseSheetTime(v) {
  const str = String(v ?? "").trim();
  let m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[ ,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const [, d, mo, y, h = "23", mi = "59", se = "0"] = m;
    return Date.UTC(+y, +mo - 1, +d, +h, +mi, +se) - 330 * 60 * 1000;
  }
  m = str.match(/^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+)(?:,(\d+))?)?\)/);
  if (m) {
    const [, y, mo, d, h = "0", mi = "0", se = "0"] = m;
    return Date.UTC(+y, +mo, +d, +h, +mi, +se) - 330 * 60 * 1000;
  }
  return null;
}

// Epoch/Date → "DD/MM/YYYY HH:MM:SS" in IST (how the sheets store times).
export const fmtTs = (d) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const g = (t) => parts.find((p) => p.type === t)?.value || "";
  const hh = g("hour") === "24" ? "00" : g("hour");
  return `${g("day")}/${g("month")}/${g("year")} ${hh}:${g("minute")}:${g("second")}`;
};
