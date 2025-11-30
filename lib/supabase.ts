import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function ensureEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
  return { url, anon } as { url: string; anon: string };
}

export const supabase: SupabaseClient =
  typeof window !== 'undefined'
    ? (client ?? (() => {
        const { url, anon } = ensureEnv();
        client = createClient(url, anon, {
          auth: {
            storageKey: 'propel-auth',
            autoRefreshToken: true,
            persistSession: true,
          },
        });
        return client;
      })())
    : (null as unknown as SupabaseClient);
