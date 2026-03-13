import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

export interface DayAvailability {
    day_of_week: number; // 0 = Sunday, 1 = Monday...
    start_time: string | null; // "09:00:00"
    end_time: string | null; // "17:00:00"
    is_available: boolean;
}

export function useAvailability() {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data: availability = [], isLoading } = useQuery({
        queryKey: ["availability", user?.id],
        queryFn: async () => {
            if (!user) return [];

            const { data, error } = await supabase
                .from("counselor_availability")
                .select("*")
                .eq("counselor_id", user.id);

            if (error) throw error;
            return data as DayAvailability[];
        },
        enabled: !!user,
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedDays: DayAvailability[]) => {
            if (!user) throw new Error("No user");

            // Delete existing records
            await supabase
                .from("counselor_availability")
                .delete()
                .eq("counselor_id", user.id);

            // Insert new ones
            const { error } = await supabase
                .from("counselor_availability")
                .insert(
                    updatedDays.map((day) => ({
                        counselor_id: user.id,
                        ...day,
                    }))
                );

            if (error) throw error;
            return updatedDays;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["availability", user?.id] });
        },
    });

    return {
        availability,
        isLoading,
        updateAvailability: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
    };
}
