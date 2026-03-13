import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

export interface DashboardStats {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    thisWeekSessions: number;
    thisMonthSessions: number;
    totalEarnings: number;
}

export function useDashboardStats() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["dashboard-stats", user?.id],
        queryFn: async () => {
            if (!user) throw new Error("Not authenticated");

            // 1. Fetch bookings statuses for count computations
            const { data: bookings, error: bookingsError } = await supabase
                .from("bookings")
                .select("status, scheduled_at")
                .eq("counselor_id", user.id);

            if (bookingsError) throw bookingsError;

            // 2. Fetch captured payments for earnings
            const { data: payments, error: paymentsError } = await supabase
                .from("payments")
                .select("amount")
                .eq("status", "captured"); // Assuming payments might eventually track counselor_id, but sticking with web behavior for now

            if (paymentsError) throw paymentsError;

            // Compute Stats (matching web app logic)
            const stats = (bookings || []).reduce(
                (acc, b) => {
                    acc.totalBookings++;
                    if (b.status === "completed") acc.completedBookings++;
                    if (b.status === "cancelled") acc.cancelledBookings++;
                    return acc;
                },
                { totalBookings: 0, completedBookings: 0, cancelledBookings: 0 }
            );

            // Time filters
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            weekStart.setHours(0, 0, 0, 0);

            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const activeStatuses = ["completed", "confirmed", "scheduled"];

            const thisWeekSessions = (bookings || []).filter(
                (b) => activeStatuses.includes(b.status) && new Date(b.scheduled_at) >= weekStart
            ).length;

            const thisMonthSessions = (bookings || []).filter(
                (b) => activeStatuses.includes(b.status) && new Date(b.scheduled_at) >= monthStart
            ).length;

            const totalEarnings = (payments || []).reduce((sum, p) => sum + (p.amount || 0), 0);

            return {
                ...stats,
                thisWeekSessions,
                thisMonthSessions,
                totalEarnings,
            } as DashboardStats;
        },
        enabled: !!user,
    });
}
