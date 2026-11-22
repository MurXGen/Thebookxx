type L = (big: boolean) => void;
const ls = new Set<L>();
// Fire a confetti burst over the whole app (offer unlocked, gift wrap, order placed…).
export const confetti = (big = true) => ls.forEach((l) => l(big));
export const onConfetti = (l: L) => {
  ls.add(l);
  return () => {
    ls.delete(l);
  };
};
