import { useEffect, PropsWithChildren } from "react";
import { useRouter, useSegments } from "expo-router";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

/**
 * AuthProvider — Manages session lifecycle and navigation guards.
 *
 * 1. On mount: checks for an existing session in SecureStore.
 * 2. Subscribes to auth state changes (login, logout, token refresh).
 * 3. Redirects: unauthenticated users → login, authenticated users → dashboard.
 */
export function AuthProvider({ children }: PropsWithChildren) {
    const { setSession, setLoading, isAuthenticated, isLoading, role } = useAuthStore();
    const segments = useSegments();
    const router = useRouter();

    // Initialize session from SecureStore
    useEffect(() => {
        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
            } catch {
                setSession(null);
            }
        };

        initSession();

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => subscription.unsubscribe();
    }, [setSession, setLoading]);

    // Navigation guard — redirect based on auth state
    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!isAuthenticated && !inAuthGroup) {
            // Not logged in and not on auth screen → go to login
            router.replace("/(auth)/login");
        } else if (isAuthenticated && inAuthGroup) {
            // Logged in but on auth screen → go to dashboard
            // Also check role: only counselors/admins can use this app
            if (role === "counselor" || role === "admin") {
                router.replace("/(main)/(dashboard)");
            } else {
                // Student trying to use counselor app → sign out
                supabase.auth.signOut();
            }
        }
    }, [isAuthenticated, isLoading, segments, role, router]);

    return <>{children}</>;
}
