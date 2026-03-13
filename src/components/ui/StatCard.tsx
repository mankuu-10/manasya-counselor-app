import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, fontSize, spacing, shadows } from "../../theme";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof Ionicons.glyphMap;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    iconColor?: string;
    iconBgColor?: string;
}

export function StatCard({
    title,
    value,
    icon,
    trend,
    iconColor = colors.primary[600],
    iconBgColor = colors.primary[50],
}: StatCardProps) {
    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
                {trend && (
                    <View
                        style={[
                            styles.trendBadge,
                            trend.isPositive ? styles.trendPositive : styles.trendNegative,
                        ]}
                    >
                        <Ionicons
                            name={trend.isPositive ? "arrow-up" : "arrow-down"}
                            size={12}
                            color={trend.isPositive ? colors.success : colors.error}
                        />
                        <Text
                            style={[
                                styles.trendText,
                                trend.isPositive ? styles.trendTextPositive : styles.trendTextNegative,
                            ]}
                        >
                            {trend.value}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.content}>
                <Text style={styles.value}>{value}</Text>
                <Text style={styles.title}>{title}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        ...shadows.sm,
        flex: 1,
        minWidth: 140,
        marginBottom: spacing.md,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: borderRadius.md,
        alignItems: "center",
        justifyContent: "center",
    },
    trendBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: borderRadius.full,
        gap: 2,
    },
    trendPositive: {
        backgroundColor: "#dcfce7", // green-50
    },
    trendNegative: {
        backgroundColor: "#fee2e2", // red-50
    },
    trendText: {
        fontFamily: "Inter_600SemiBold",
        fontSize: 11,
    },
    trendTextPositive: {
        color: colors.success,
    },
    trendTextNegative: {
        color: colors.error,
    },
    content: {
        gap: 4,
    },
    value: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize["2xl"],
        color: colors.surface[900],
    },
    title: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.sm,
        color: colors.surface[500],
    },
});
