import { useState } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, fontSize, spacing } from "../../theme";

interface InputProps {
    label: string;
    value: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad";
    autoCapitalize?: "none" | "sentences" | "words";
    error?: string;
    helperText?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
    editable?: boolean;
    multiline?: boolean;
    numberOfLines?: number;
    maxLength?: number;
}

export function Input({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType = "default",
    autoCapitalize = "sentences",
    error,
    helperText,
    icon,
    style,
    editable = true,
    multiline = false,
    maxLength,
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isSecure = secureTextEntry && !showPassword;

    return (
        <View style={[styles.container, style]}>
            <Text style={[styles.label, error && styles.labelError]}>{label}</Text>

            <View
                style={[
                    styles.inputWrapper,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                ]}
            >
                {icon && (
                    <Ionicons
                        name={icon}
                        size={18}
                        color={isFocused ? colors.primary[600] : colors.surface[400]}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={colors.surface[400]}
                    secureTextEntry={isSecure}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    editable={editable}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={[
                        styles.input,
                        multiline && styles.multiline,
                    ]}
                    multiline={multiline}
                    maxLength={maxLength}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={colors.surface[400]}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error ? (
                <View style={styles.errorRow}>
                    <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : helperText ? (
                <Text style={styles.helperText}>{helperText}</Text>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.lg,
    },
    label: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.sm,
        color: colors.surface[700],
        marginBottom: spacing.sm,
    },
    labelError: {
        color: colors.error,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.surface[200],
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.lg,
        minHeight: 52,
    },
    inputFocused: {
        borderColor: colors.primary[400],
        backgroundColor: colors.primary[50],
    },
    inputError: {
        borderColor: colors.error,
        backgroundColor: "#fef2f2",
    },
    icon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.base,
        color: colors.surface[900],
        paddingVertical: spacing.md,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: "top",
    },
    errorRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: spacing.xs,
    },
    errorText: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.xs,
        color: colors.error,
    },
    helperText: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.xs,
        color: colors.surface[500],
        marginTop: spacing.xs,
    },
});
