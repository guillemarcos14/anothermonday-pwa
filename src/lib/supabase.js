import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Default is 5000ms. The lock protects token refresh; keeping the
      // timeout short ensures the app recovers quickly under React
      // StrictMode double-mount (where the first mount's lock is
      // orphaned and must be stolen by the second mount).
      lockAcquireTimeout: 5000,
    },
  }
)
