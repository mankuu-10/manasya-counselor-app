import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, borderRadius, fontSize, spacing, shadows } from "../../theme";
import type { Booking } from "../../hooks/useBookings";

interface SessionCardProps {
    session: Booking;
    onPressAction?: () => void;
    actionLabel?: string;
    index?: number; // for staggered animation
}

export function SessionCard({ session, onPressAction, actionLabel = "Join", index = 0 }: SessionCardProps) {
    // Format Date: "Oct 24, 2023"
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
    };

    // Format Time: "10:30 AM"
    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "confirmed":
                return { bg: "#dbeafe", text: "#1d4ed8" }; // blue-100/700
            case "pending":
                return { bg: "#fef3c7", text: "#b45309" }; // amber-100/700
            case "completed":
                return { bg: "#dcfce7", text: "#15803d" }; // green-100/700
            case "cancelled":
                return { bg: "#fee2e2", text: "#b91c1c" }; // red-100/700
            default:
                return { bg: colors.surface[100], text: colors.surface[600] };
        }
    };

    const statusStyle = getStatusStyle(session.status);
    const initial = session.profiles?.full_name?.charAt(0) || "S";

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 100).springify().damping(14)}
            style={styles.card}
        >
            <View style={styles.header}>
                <View style={styles.studentInfo}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{initial}</Text>
                    </View>
                    <View>
                        <Text style={styles.studentName}>{session.profiles?.full_name || "Student"}</Text>
                        <View style={styles.dateTimeRow}>
                            <Ionicons name="calendar-outline" size={12} color={colors.surface[400]} />
                            <Text style={styles.dateTimeText}>
                                {formatDate(session.scheduled_at)} at {formatTime(session.scheduled_at)}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <Text style={[styles.statusText, { color: statusStyle.text }]}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Text>
                </View>
            </View>

            {session.notes && (
                <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Meeting notes</Text>
                    <Text style={styles.notesText}>{session.notes}</Text>
                </View>
            )}

            {(session.status === "confirmed" || session.status === "pending") && onPressAction && (
                <View style={styles.actionContainer}>
                    <TouchableOpacity style={styles.primaryButton} onPress={onPressAction}>
                        <Ionicons name="videocam-outline" size={16} color={colors.white} />
                        <Text style={styles.primaryButtonText}>{actionLabel}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        marginBottom: spacing.md,
        ...shadows.sm,
        borderWidth: 1,
        borderColor: colors.surface[100],
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    studentInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary[100],
        alignItems: "center",
        justifyContent: "center",
    },
    avatarText: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize.md,
        color: colors.primary[700],
    },
    studentName: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.base,
        color: colors.surface[900],
        marginBottom: 2,
    },
    dateTimeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    dateTimeText: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.xs,
        color: colors.surface[500],
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: borderRadius.full,
        marginLeft: spacing.sm,
    },
    statusText: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 10,
    },
    notesContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.surface[100],
    },
    notesLabel: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.xs,
        color: colors.surface[400],
        marginBottom: 2,
    },
    notesText: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[700],
        lineHeight: 20,
    },
    actionContainer: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.surface[100],
    },
    primaryButton: {
        backgroundColor: colors.primary[600],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: borderRadius.lg,
        gap: spacing.sm,
    },
    primaryButtonText: {
        fontFamily: "Inter_600SemiBold",
        color: colors.white,
        fontSize: fontSize.sm,
    },
});
