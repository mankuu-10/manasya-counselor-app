import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import * as Haptics from "expo-haptics";
import { colors, borderRadius, fontSize, fontWeight, shadows, spacing } from "../../theme";

interface ButtonProps {
    title: string;
    onPress?: () => void;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
}

export function Button({
    title,
    onPress,
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    icon,
    style,
}: ButtonProps) {
    const handlePress = async () => {
        if (loading || disabled) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onPress) onPress();
    };

    const buttonStyle: ViewStyle[] = [
        styles.base,
        styles[`${variant}Bg` as keyof typeof styles] as ViewStyle,
        styles[`${size}Size` as keyof typeof styles] as ViewStyle,
        variant === "primary" && shadows.md,
        (disabled || loading) && styles.disabled,
        style,
    ].filter(Boolean) as ViewStyle[];

    const textStyle: TextStyle[] = [
        styles.text,
        styles[`${variant}Text` as keyof typeof styles] as TextStyle,
        styles[`${size}Text` as keyof typeof styles] as TextStyle,
    ].filter(Boolean) as TextStyle[];

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={buttonStyle}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === "primary" ? colors.white : colors.primary[600]}
                    size="small"
                />
            ) : (
                <>
                    {icon}
                    <Text style={textStyle}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: borderRadius.xl,
        gap: spacing.sm,
    },
    disabled: {
        opacity: 0.5,
    },

    // Variants — background
    primaryBg: {
        backgroundColor: colors.primary[600],
    },
    secondaryBg: {
        backgroundColor: colors.surface[800],
    },
    outlineBg: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: colors.surface[200],
    },
    ghostBg: {
        backgroundColor: "transparent",
    },
    dangerBg: {
        backgroundColor: "#fee2e2", // red-100
    },

    // Variants — text
    text: {
        fontFamily: "Inter_600SemiBold",
    },
    primaryText: {
        color: colors.white,
    },
    secondaryText: {
        color: colors.white,
    },
    outlineText: {
        color: colors.surface[700],
    },
    ghostText: {
        color: colors.primary[600],
    },
    dangerText: {
        color: colors.error,
    },

    // Sizes
    smSize: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        minHeight: 36,
    },
    mdSize: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        minHeight: 48,
    },
    lgSize: {
        paddingHorizontal: spacing["2xl"],
        paddingVertical: spacing.lg,
        minHeight: 56,
    },
    smText: {
        fontSize: fontSize.sm,
    },
    mdText: {
        fontSize: fontSize.base,
    },
    lgText: {
        fontSize: fontSize.md,
    },
});
