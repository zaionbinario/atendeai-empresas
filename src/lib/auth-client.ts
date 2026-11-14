import { createClient } from "@supabase/supabase-js";

// Project URL is public. Keys must come from the Lovable/Vite build environment.
// Only publishable/anon keys are valid here; never use service_role or sb_secret.
const url = import.meta.env["VITE_SUPABASE_URL"] || "https://kejpnfeyttfozudqpdnm.supabase.co";
const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_ANON_KEY"] || "sb_publishable_gkefyByKyWWfI39pWm5UbA_LfAoCeKn";

const isPublicKey = typeof key === "string" &&
  (key.startsWith("sb_publishable_") || key.startsWith("eyJ"));
export const authConfigured = Boolean(url && isPublicKey);
// "Lembre-se de mim": sessão persistente no localStorage ou apenas nesta aba.
const REMEMBER_KEY = "zyon-chat-remember-me";
export function getRememberMe(): boolean {
  try { return window.localStorage.getItem(REMEMBER_KEY) === "true"; } catch { return false; }
}
export function setRememberMe(remember: boolean): void {
  try {
    const source = remember ? window.sessionStorage : window.localStorage;
    const destination = remember ? window.localStorage : window.sessionStorage;
    // Move only Supabase's auth session, never store the password.
    for (const key of Object.keys(source)) {
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        const value = source.getItem(key);
        if (value !== null) destination.setItem(key, value);
        source.removeItem(key);
      }
    }
    window.localStorage.setItem(REMEMBER_KEY, String(remember));
  } catch { /* Storage may be blocked by browser settings. */ }
}
const authStorage = {
  getItem(key: string) {
    try { return (getRememberMe() ? window.localStorage : window.sessionStorage).getItem(key); }
    catch { return null; }
  },
  setItem(key: string, value: string) {
    try { (getRememberMe() ? window.localStorage : window.sessionStorage).setItem(key, value); }
    catch { /* Private browsing may block storage. */ }
  },
  removeItem(key: string) {
    try { window.localStorage.removeItem(key); window.sessionStorage.removeItem(key); }
    catch { /* Storage may be blocked. */ }
  },
};
export const supabase = authConfigured
  ? createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        storage: authStorage,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;
