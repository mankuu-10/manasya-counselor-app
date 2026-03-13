import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

export interface CounselorProfile {
    qualifications: string;
    specialties: string[];
    bio: string;
    experience_years: number;
    languages: string[];
    session_rate: number;
    rci_number: string;
    is_verified: boolean;
    intro_video_url: string;
    gender: string;
    timezone: string;
    welcome_message: string;
}

export interface UserProfile {
    full_name: string;
    avatar_url: string | null;
    email: string;
    phone: string;
}

export function useCounselorProfile() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["counselor", user?.id],
        queryFn: async () => {
            if (!user) throw new Error("Not authenticated");

            // Fetch public profile (name, avatar)
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("full_name, avatar_url, email, phone")
                .eq("id", user.id)
                .single();

            if (profileError) throw profileError;

            // Fetch counselor specific data
            const { data: counselor, error: counselorError } = await supabase
                .from("counselor_profiles")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (counselorError && counselorError.code !== "PGRST116") { // Ignore matching row not found error
                throw counselorError;
            }

            return {
                profile: profile as UserProfile,
                counselor: (counselor || {}) as CounselorProfile,
            };
        },
        enabled: !!user,
    });
}
