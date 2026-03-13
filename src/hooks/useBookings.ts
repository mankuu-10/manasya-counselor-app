import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

export interface Booking {
    id: string;
    scheduled_at: string;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    notes: string | null;
    created_at: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    };
}

export function useBookings() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["bookings", user?.id],
        queryFn: async () => {
            if (!user) throw new Error("Not authenticated");

            const { data, error } = await supabase
                .from("bookings")
                .select(`
                    id,
                    scheduled_at,
                    status,
                    notes,
                    created_at,
                    profiles!bookings_student_id_fkey (
                        full_name,
                        avatar_url
                    )
                `)
                .eq("counselor_id", user.id)
                .order("scheduled_at", { ascending: false });

            if (error) throw error;
            return data as unknown as Booking[];
        },
        enabled: !!user,
    });
}
