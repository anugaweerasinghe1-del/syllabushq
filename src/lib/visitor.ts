// Stable per-browser visitor token used to throttle reviews/suggestions.
const KEY = "ol-visitor-token-v1";

export function getVisitorToken(): string {
  if (typeof window === "undefined") return "";
  let v = window.localStorage.getItem(KEY);
  if (v && v.length >= 12) return v;
  v = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
  window.localStorage.setItem(KEY, v);
  return v;
}
