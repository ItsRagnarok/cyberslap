import { createClient } from "@supabase/supabase-js";

// The anon key is safe to expose client-side — access is enforced by
// Postgres row-level security policies, not by keeping this key secret.
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://xrsfifqxlkhkukreialq.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhyc2ZpZnF4bGtoa3VrcmVpYWxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4OTk2MzUsImV4cCI6MjEwMDQ3NTYzNX0.raAv7XhhSZanbmudqDQgFXzIP-VgzPIbDss-H0jJZpk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
