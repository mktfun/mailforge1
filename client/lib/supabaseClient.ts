import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string || "https://jptqwesfjiokzmginteo.supabase.co";
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdHF3ZXNmamloa3ptZ2ludGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0Njk2MzYsImV4cCI6MjA3MjA0NTYzNn0.dTjSOFb3jwAP5V0jl8RA_QfUNEd7oMNZKDDpbIIafdA";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Anon Key:", supabaseAnon ? "✓ Set" : "✗ Missing");

if (!supabaseUrl || !supabaseAnon) {
  // Intentionally throw to surface misconfiguration early in dev
  throw new Error(
    "Missing Supabase environment variables. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
