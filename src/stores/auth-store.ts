import { create } from "zustand";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    role: string | null;

    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    role: null,

    setSession: (session) =>
        set({
            session,
            user: session?.user ?? null,
            isAuthenticated: !!session?.user,
            role: session?.user?.user_metadata?.role ?? null,
            isLoading: false,
        }),

    setLoading: (isLoading) => set({ isLoading }),

    reset: () =>
        set({
            user: null,
            session: null,
            isAuthenticated: false,
            role: null,
            isLoading: false,
        }),
}));
