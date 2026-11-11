import { createClient } from "@supabase/supabase-js";

// A publishable key is public by design. Never use a secret/service_role key here.
const supabaseUrl = "https://kejpnfeyttfozudqpdnm.supabase.co";
const publishableKey = "sb_publishable_gkefyByKyWWfI39pWm5UbA_LfAoCeKn";

export const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
