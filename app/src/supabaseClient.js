import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL oder Anon Key fehlen. Die App läuft ohne Backend / Auth."
  );
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export { supabase };
