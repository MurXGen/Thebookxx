export const C = {
  brand: "#FB8500",
  brandDark: "#E06F00",
  brandSoft: "#FFF3E6",
  ink: "#1C1C1E",
  ink2: "#3D3D42",
  muted: "#7A7A85",
  line: "#ECECF0",
  bg: "#F4F5F7",
  card: "#FFFFFF",
  green: "#1BA672",
  greenSoft: "#E7F6EF",
  red: "#E23744",
  gold: "#F5A623",
};

import { Platform } from "react-native";

export const SITE = "https://www.thebookx.in";
// API base: the site itself, except the browser preview in dev, which goes
// through the read-only CORS proxy (scripts/dev-cors-proxy.mjs).
// API calls go to the apex host: www.thebookx.in 308-redirects to it, and a
// redirected POST can drop its body — that's what stopped orders reaching the sheet.
export const API_HOST = "https://thebookx.in";
export const API = __DEV__ && Platform.OS === "web" ? "http://localhost:8092" : API_HOST;
export const WHATSAPP = "917710892108";

export const rupee = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
