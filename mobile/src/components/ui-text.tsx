import type { ComponentProps } from "react";
import { StyleSheet, Text as RNText, TextInput as RNTextInput, type TextInputProps, type TextProps, type TextStyle } from "react-native";

// Poppins everywhere. Android can't synthesise weights for a custom font, so
// each fontWeight maps to its own Poppins file (only these four ship in the APK).
export const FONT = {
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export function fontFor(weight?: TextStyle["fontWeight"]) {
  const w = String(weight ?? "400");
  if (w === "bold" || Number(w) >= 700) return FONT.bold;
  if (w === "600") return FONT.semibold;
  if (w === "500") return FONT.medium;
  return FONT.regular;
}

function poppins(style: TextProps["style"]) {
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;
  if (flat.fontFamily) return style;
  const { fontWeight, ...rest } = flat;
  return { ...rest, fontFamily: fontFor(fontWeight) };
}

// React 19: `ref` arrives as a normal prop and is passed straight through.
export function Text(props: ComponentProps<typeof RNText>) {
  return <RNText {...props} style={poppins(props.style)} />;
}

export function TextInput(props: ComponentProps<typeof RNTextInput>) {
  return <RNTextInput {...props} style={poppins(props.style) as TextInputProps["style"]} />;
}
