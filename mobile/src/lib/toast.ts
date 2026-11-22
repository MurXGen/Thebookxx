export type ToastKind = "success" | "info" | "error";
export type ToastMsg = { message: string; title?: string; kind: ToastKind; image?: string };
type Listener = (t: ToastMsg) => void;
const listeners = new Set<Listener>();

// toast("Saved")  ·  toast("The Art of Clarity", { title: "Added to your bag", kind: "success", image })
export const toast = (message: string, opts: Partial<Omit<ToastMsg, "message">> = {}) =>
  listeners.forEach((l) => l({ message, kind: opts.kind || "info", title: opts.title, image: opts.image }));

export const onToast = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
