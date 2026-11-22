// The default APK is arm64-only (every Android phone from ~2017 on) to keep the
// download small. `eas build --profile apk-legacy` also adds 32-bit ARM for
// older/budget phones (bigger file).
module.exports = ({ config }) => {
  if (process.env.TBX_ALL_ABIS) {
    config.plugins = config.plugins.map((p) =>
      Array.isArray(p) && p[0] === "expo-build-properties"
        ? [p[0], { ...p[1], android: { ...p[1].android, buildArchs: ["armeabi-v7a", "arm64-v8a"] } }]
        : p,
    );
  }
  return config;
};
