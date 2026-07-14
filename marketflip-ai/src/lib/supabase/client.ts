import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Reads public env vars only.
 *
 * NOTE: This app currently runs against a fake/mock user (see
 * src/lib/data/mock-user.ts) rather than real Supabase Auth sessions —
 * that's a deliberate MVP scoping decision. The schema in
 * supabase/schema.sql is already shaped for real auth + RLS, so wiring
 * up real sign-in later is a matter of:
 *   1. Setting NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   2. Replacing src/lib/data/mock-user.ts's getCurrentUser() with a
 *      real supabase.auth.getUser() call
 *   3. Swapping the in-memory dashboard store for real Supabase queries
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable real persistence."
    );
  }

  return createBrowserClient(url, anonKey);
}

/** Returns true if Supabase env vars are present, so callers can gracefully fall back to mock data. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
