import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { colors, fontSize, spacing, borderRadius } from "../../../src/theme";
import { SessionCard, Button } from "../../../src/components/ui";
import { useBookings } from "../../../src/hooks/useBookings";

type FilterTab = "upcoming" | "completed" | "cancelled";

export default function SessionsScreen() {
    const router = useRouter();
    const { data: bookings, isLoading, refetch } = useBookings();
    const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");

    const upcoming = (bookings || []).filter((b) => b.status === "confirmed" || b.status === "pending");
    const completed = (bookings || []).filter((b) => b.status === "completed");
    const cancelled = (bookings || []).filter((b) => b.status === "cancelled");

    const getActiveBookings = () => {
        switch (activeTab) {
            case "upcoming": return upcoming;
            case "completed": return completed;
            case "cancelled": return cancelled;
        }
    };

    const activeBookings = getActiveBookings();

    if (isLoading && !bookings) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading sessions...</Text>
            </SafeAreaView>
        );
    }

    // Zero-state (brand new counselor)
    if (!bookings || bookings.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.emptyContainer}>
                    <Text style={styles.headerTitle}>Sessions</Text>
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>📋</Text>
                        <Text style={styles.emptyTitle}>No sessions yet</Text>
                        <Text style={styles.emptySub}>
                            Once students book sessions with you, they'll appear here. Make sure your profile is complete.
                        </Text>
                        <Link href="/(main)/(profile)" asChild>
                            <Button title="Complete Profile" />
                        </Link>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sessions</Text>

                {/* Segmented Control */}
                <View style={styles.segmentContainer}>
                    <TouchableOpacity
                        style={[styles.segmentTab, activeTab === "upcoming" && styles.segmentTabActive]}
                        onPress={() => setActiveTab("upcoming")}
                    >
                        <Text style={[styles.segmentText, activeTab === "upcoming" && styles.segmentTextActive]}>
                            Upcoming ({upcoming.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segmentTab, activeTab === "completed" && styles.segmentTabActive]}
                        onPress={() => setActiveTab("completed")}
                    >
                        <Text style={[styles.segmentText, activeTab === "completed" && styles.segmentTextActive]}>
                            Completed ({completed.length})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.segmentTab, activeTab === "cancelled" && styles.segmentTabActive]}
                        onPress={() => setActiveTab("cancelled")}
                    >
                        <Text style={[styles.segmentText, activeTab === "cancelled" && styles.segmentTextActive]}>
                            Cancelled
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary[500]} />}
            >
                {activeBookings.length === 0 ? (
                    <View style={styles.emptyTabState}>
                        <Text style={styles.emptyTabIcon}>
                            {activeTab === "upcoming" ? "📅" : activeTab === "completed" ? "✅" : "❌"}
                        </Text>
                        <Text style={styles.emptyTabTitle}>No {activeTab} sessions</Text>
                        <Text style={styles.emptyTabSub}>
                            {activeTab === "upcoming"
                                ? "You have a clear schedule right now."
                                : "Check back later."}
                        </Text>
                    </View>
                ) : (
                    activeBookings.map((session, i) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            index={i}
                            actionLabel={activeTab === "upcoming" ? "Open Video Room" : undefined}
                            onPressAction={
                                activeTab === "upcoming"
                                    ? () => {
                                          router.push(`/(main)/(sessions)/${session.id}` as any);
                                      }
                                    : undefined
                            }
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
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
        backgroundColor: colors.surface[50],
        zIndex: 10,
    },
    headerTitle: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize["2xl"],
        color: colors.surface[900],
        marginBottom: spacing.lg,
    },
    segmentContainer: {
        flexDirection: "row",
        backgroundColor: colors.surface[200],
        padding: 4,
        borderRadius: borderRadius.xl,
    },
    segmentTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: borderRadius.md,
    },
    segmentTabActive: {
        backgroundColor: colors.white,
    },
    segmentText: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.xs,
        color: colors.surface[500],
    },
    segmentTextActive: {
        fontFamily: "Inter_600SemiBold",
        color: colors.surface[900],
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing["6xl"],
    },
    emptyContainer: {
        padding: spacing.lg,
        flex: 1,
    },
    emptyCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: borderRadius["2xl"],
        borderWidth: 1,
        borderColor: colors.surface[200],
        alignItems: "center",
        justifyContent: "center",
        padding: spacing["2xl"],
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize.xl,
        color: colors.surface[900],
        marginBottom: spacing.xs,
    },
    emptySub: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[500],
        textAlign: "center",
        marginBottom: spacing["2xl"],
        lineHeight: 20,
    },
    emptyTabState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: spacing["4xl"],
    },
    emptyTabIcon: {
        fontSize: 32,
        marginBottom: spacing.sm,
    },
    emptyTabTitle: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.md,
        color: colors.surface[900],
        marginBottom: 2,
    },
    emptyTabSub: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[500],
    },
});
