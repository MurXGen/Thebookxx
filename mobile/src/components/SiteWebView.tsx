import { useMemo, useRef, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as WebBrowser from "expo-web-browser";
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { Text } from "@/components/ui-text";
import { WebView, type WebViewNavigation } from "react-native-webview";
import { useStore, type CartLine } from "@/lib/store";
import { C, SITE } from "@/theme";

// Hosts a page of thebookx.in inside the app (checkout, orders, policies).
// - seedCart: copies the app's bag into the site's localStorage first, so the
//   website's checkout (UPI QR, COD, coupons, Shiprocket) runs unchanged.
// - The site's bag is mirrored back, so a placed order empties the app bag too.
// - UPI / WhatsApp / tel links open the matching app instead of the WebView.
const HIDE_CSS = `.tbx-bottomnav,.mo-bottomnav,.install-app-bar,.pwa-promo,.pwa-promo-spacer{display:none!important}`;

export default function SiteWebView({ path, seedCart = false }: { path: string; seedCart?: boolean }) {
  const { cart, wishlist, setCartFromWeb, deviceId } = useStore();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const nonce = useRef(Math.random().toString(36).slice(2)).current;

  // Computed once per mount on purpose: re-seeding mid-checkout would undo
  // changes the shopper made on the website's bag page.
  const before = useMemo(() => {
    const seed = seedCart
      ? `if (sessionStorage.getItem('tbx_app_seed') !== '${nonce}') {
           localStorage.setItem('cart', ${JSON.stringify(JSON.stringify(cart))});
           localStorage.setItem('wishlist', ${JSON.stringify(JSON.stringify(wishlist))});
           sessionStorage.setItem('tbx_app_seed', '${nonce}');
         }`
      : "";
    return `(function(){try{
      ${seed}
      localStorage.setItem('tbx_app', 'android');
      if (!localStorage.getItem('tbx_device_id')) localStorage.setItem('tbx_device_id', ${JSON.stringify(deviceId)});
      var st = document.createElement('style'); st.innerHTML = ${JSON.stringify(HIDE_CSS)};
      (document.head || document.documentElement).appendChild(st);
    }catch(e){}})(); true;`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const after = `(function(){
    var last = null;
    function tick(){ try{
      var c = localStorage.getItem('cart') || '[]';
      if (c !== last) { last = c; window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cart', cart: JSON.parse(c) })); }
    }catch(e){} }
    tick(); setInterval(tick, 1200);
  })(); true;`;

  const onNav = (req: WebViewNavigation) => {
    const url = req.url || "";
    if (/^https?:/i.test(url)) {
      if (/wa\.me|api\.whatsapp\.com/i.test(url)) {
        Linking.openURL(url).catch(() => {});
        return false;
      }
      return true;
    }
    if (url.startsWith("about:") || url.startsWith("data:") || url.startsWith("blob:")) return true;
    // upi://, intent://, tel:, mailto:, whatsapp:// … hand to Android.
    Linking.openURL(url).catch(() => {});
    return false;
  };

  if (Platform.OS === "web") {
    // Browser preview can't embed the site — offer to open it instead.
    return (
      <View style={s.center}>
        <View style={s.webIc}>
          <Ionicons name="globe-outline" size={28} color={C.ink} />
        </View>
        <Text style={s.webH}>Opens on thebookx.in</Text>
        <Text style={s.webS}>In the Android app this page shows right here. In the browser, open it on the website.</Text>
        <Pressable onPress={() => WebBrowser.openBrowserAsync(`${SITE}${path}`).catch(() => Linking.openURL(`${SITE}${path}`))} style={s.webBtn}>
          <Ionicons name="open-outline" size={16} color="#fff" />
          <Text style={s.webBtnTxt}>Open in browser</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {failed ? (
        <View style={s.center}>
          <Text style={s.fail}>Couldn’t reach TheBookX. Check your internet and try again.</Text>
        </View>
      ) : (
        <WebView
          source={{ uri: `${SITE}${path}${path.includes("?") ? "&" : "?"}utm_source=android_app` }}
          injectedJavaScriptBeforeContentLoaded={before}
          injectedJavaScript={after}
          onMessage={(e) => {
            try {
              const m = JSON.parse(e.nativeEvent.data);
              // Only the checkout seeds the site's bag, so only it may write back.
              if (seedCart && m?.type === "cart") setCartFromWeb(m.cart as CartLine[]);
            } catch {}
          }}
          onShouldStartLoadWithRequest={onNav}
          originWhitelist={["*"]}
          onLoadEnd={() => setLoading(false)}
          onError={() => setFailed(true)}
          domStorageEnabled
          javaScriptEnabled
          setSupportMultipleWindows={false}
          pullToRefreshEnabled
          applicationNameForUserAgent="TheBookXApp/1.0"
        />
      )}
      {loading && !failed ? (
        <View style={[StyleSheet.absoluteFill, s.center]}>
          <ActivityIndicator size="large" color={C.ink} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  webIc: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.bg, alignItems: "center", justifyContent: "center" },
  webH: { fontSize: 17, fontWeight: "700", color: C.ink, marginTop: 14, textAlign: "center" },
  webS: { fontSize: 13, color: C.muted, marginTop: 6, textAlign: "center", lineHeight: 19, maxWidth: 300 },
  webBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 18, backgroundColor: C.ink, borderRadius: 12, paddingHorizontal: 20, height: 46 },
  webBtnTxt: { color: "#fff", fontWeight: "600", fontSize: 14.5 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  fail: { color: C.ink2, textAlign: "center", fontSize: 15 },
});
