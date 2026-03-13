import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { colors, fontSize, spacing, borderRadius, shadows } from "../../../src/theme";
import { StatCard, SessionCard, Button } from "../../../src/components/ui";
import { useCounselorProfile } from "../../../src/hooks/useCounselorProfile";
import { useDashboardStats } from "../../../src/hooks/useDashboardStats";
import { useBookings } from "../../../src/hooks/useBookings";
import { useAuthStore } from "../../../src/stores/auth-store";

export default function DashboardScreen() {
    const { user } = useAuthStore();
    const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useCounselorProfile();
    const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
    const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useBookings();

    const isRefreshing = profileLoading || statsLoading || bookingsLoading;

    const onRefresh = async () => {
        await Promise.all([refetchProfile(), refetchStats(), refetchBookings()]);
    };

    // Derived states
    const displayName = profileData?.profile?.full_name || user?.user_metadata?.display_name || "Doctor";
    const upcomingSessions = (bookings || [])
        .filter((b) => b.status === "confirmed" || b.status === "pending")
        .slice(0, 5); // take up to 5 for dashboard

    // Completeness calculation
    const isProfileComplete = profileData?.counselor &&
        profileData.profile?.avatar_url &&
        (profileData.counselor.bio?.length || 0) >= 100 &&
        (profileData.counselor.specialties?.length || 0) > 0 &&
        profileData.counselor.qualifications &&
        profileData.counselor.rci_number;

    if (profileLoading && !profileData) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading your dashboard...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />
                }
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.name}>{displayName}</Text>
                    </View>
                </View>

                {/* Completeness Warning card */}
                {!isProfileComplete && (
                    <View style={styles.warningCard}>
                        <View style={styles.warningHeader}>
                            <Text style={styles.warningIcon}>⚠️</Text>
                            <Text style={styles.warningTitle}>Complete your profile</Text>
                        </View>
                        <Text style={styles.warningText}>
                            Students are more likely to book sessions with practitioners who have complete profiles, photos, and a brief bio.
                        </Text>
                        <Link href="/(main)/(profile)" asChild>
                            <Button title="Edit Profile" size="sm" variant="secondary" style={styles.warningButton} />
                        </Link>
                    </View>
                )}

                {/* Stat Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Bookings this Month"
                        value={stats?.thisMonthSessions || 0}
                        icon="calendar-outline"
                        iconBgColor={colors.primary[50]}
                        iconColor={colors.primary[600]}
                    />
                    <StatCard
                        title="Sessions this Week"
                        value={stats?.thisWeekSessions || 0}
                        icon="time-outline"
                        iconBgColor="#fdf4ff" // fuchsia-50
                        iconColor="#c026d3" // fuchsia-600
                    />
                </View>

                {/* Upcoming Sessions Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                    <Link href="/(main)/(sessions)">
                        <Text style={styles.seeAll}>See All</Text>
                    </Link>
                </View>

                {upcomingSessions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateEmoji}>🍵</Text>
                        <Text style={styles.emptyStateTitle}>No upcoming sessions</Text>
                        <Text style={styles.emptyStateSub}>Take a moment for yourself.</Text>
                    </View>
                ) : (
                    upcomingSessions.map((session, index) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            index={index}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface[50],
    },
    centerContainer: {
        flex: 1,
        backgroundColor: colors.surface[50],
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        fontFamily: "Inter_500Medium",
        color: colors.surface[500],
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing["6xl"], // extra padding for bottom tab bar
    },
    header: {
        marginBottom: spacing.xl,
    },
    greeting: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[500],
    },
    name: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize["2xl"],
        color: colors.surface[900],
    },
    warningCard: {
        backgroundColor: "#fffbeb", // amber-50
        borderWidth: 1,
        borderColor: "#fde68a", // amber-200
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.xl,
    },
    warningHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    warningIcon: {
        fontSize: 16,
    },
    warningTitle: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.sm,
        color: "#92400e", // amber-800
    },
    warningText: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: "#b45309", // amber-700
        lineHeight: 20,
        marginBottom: spacing.md,
    },
    warningButton: {
        alignSelf: "flex-start",
    },
    statsGrid: {
        flexDirection: "row",
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontFamily: "Outfit_600SemiBold",
        fontSize: fontSize.lg,
        color: colors.surface[900],
    },
    seeAll: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.sm,
        color: colors.primary[600],
        paddingBottom: 2,
    },
    emptyState: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing["2xl"],
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.surface[200],
        borderStyle: "dashed",
    },
    emptyStateEmoji: {
        fontSize: 40,
        marginBottom: spacing.md,
    },
    emptyStateTitle: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.md,
        color: colors.surface[900],
        marginBottom: 4,
    },
    emptyStateSub: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[500],
    },
});
