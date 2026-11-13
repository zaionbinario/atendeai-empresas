import { createClient } from "@supabase/supabase-js";

// Project URL is public. Keys must come from the Lovable/Vite build environment.
// Only publishable/anon keys are valid here; never use service_role or sb_secret.
const url = import.meta.env["VITE_SUPABASE_URL"] || "https://kejpnfeyttfozudqpdnm.supabase.co";
const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_ANON_KEY"] || "sb_publishable_gkefyByKyWWfI39pWm5UbA_LfAoCeKn";

const isPublicKey = typeof key === "string" &&
  (key.startsWith("sb_publishable_") || key.startsWith("eyJ"));
export const authConfigured = Boolean(url && isPublicKey);
export const supabase = authConfigured
  ? createClient(url, key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    })
  : null;
