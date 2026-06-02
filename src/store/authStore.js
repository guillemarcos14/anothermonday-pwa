import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  /** Atomic setter — avoids intermediate renders where loading=false but user=null */
  hydrate: (user, session) => set({ user, session, loading: false }),

  logout: () => set({ user: null, session: null }),
}))
