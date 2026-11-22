// Android 11+ package visibility: declare the UPI apps/schemes the checkout
// checks for, so Linking.canOpenURL can tell which UPI apps are installed.
const { withAndroidManifest } = require("expo/config-plugins");

const PACKAGES = [
  "com.google.android.apps.nbu.paisa.user",
  "com.phonepe.app",
  "net.one97.paytm",
  "in.org.npci.upiapp",
  "com.dreamplug.androidapp",
  "com.whatsapp",
];
const SCHEMES = ["upi", "tez", "phonepe", "paytmmp", "bhim", "credpay", "whatsapp"];

module.exports = function withUpiQueries(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults.manifest;
    const queries = (manifest.queries = manifest.queries || [{}]);
    const q = queries[0];
    q.package = [...(q.package || []), ...PACKAGES.map((p) => ({ $: { "android:name": p } }))];
    q.intent = [
      ...(q.intent || []),
      ...SCHEMES.map((scheme) => ({
        action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
        data: [{ $: { "android:scheme": scheme } }],
      })),
    ];
    return cfg;
  });
};
