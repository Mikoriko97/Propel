import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function createStubClient(): SupabaseClient {
  const err = new Error('Supabase is not configured');
  const q: any = {
    select: async () => ({ data: [], error: err }),
    insert: async () => ({ data: null, error: err }),
    update: async () => ({ data: null, error: err }),
    upsert: async () => ({ data: null, error: err }),
    maybeSingle: async () => ({ data: null, error: err }),
    eq: () => q,
    in: () => q,
    limit: () => q,
    order: () => q,
  };
  const stub: any = {
    auth: {
      getUser: async () => ({ data: { user: null }, error: err }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
      signInWithOAuth: async () => { throw err; },
      signOut: async () => {},
    },
    from: () => q,
  };
  if (typeof window !== 'undefined') console.warn('Supabase is not configured. Client will operate in stub mode.');
  return stub as SupabaseClient;
}

export const supabase: SupabaseClient =
  typeof window !== 'undefined'
    ? (client ?? (() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !anon) {
          client = createStubClient();
          return client;
        }
        client = createClient(url, anon, {
          auth: {
            storageKey: 'propel-auth',
            autoRefreshToken: true,
            persistSession: true,
          },
        });
        return client;
      })())
    : createStubClient();
