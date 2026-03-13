import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "../../src/lib/supabase";
import { Button, Input } from "../../src/components/ui";
import { colors, fontSize, spacing, borderRadius, shadows } from "../../src/theme";

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || "http://localhost:3000";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

    const validate = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Enter a valid email";
        }

        if (!password) {
            errors.password = "Password is required";
        } else if (password.length < 8) {
            errors.password = "Password must be at least 8 characters";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
        setError(null);

        if (!validate()) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return;
        }

        setLoading(true);

        try {
            // Call the web app's login API with role enforcement
            const response = await fetch(`${SITE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                    expectedRole: "counselor",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed. Please try again.");
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setLoading(false);
                return;
            }

            // Now sign in via Supabase directly for session persistence
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (authError) {
                setError(authError.message);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // AuthProvider will handle navigation to dashboard
            }
        } catch {
            setError("Network error. Please check your connection.");
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoPlaceholder}>
                                <Text style={styles.logoText}>M</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>Welcome back</Text>
                        <Text style={styles.subtitle}>
                            Sign in to your Manasya Practitioner account
                        </Text>
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{error}</Text>
                            </View>
                        )}

                        <Input
                            label="Email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setFieldErrors((prev) => ({ ...prev, email: undefined }));
                                setError(null);
                            }}
                            placeholder="you@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            icon="mail-outline"
                            error={fieldErrors.email}
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setFieldErrors((prev) => ({ ...prev, password: undefined }));
                                setError(null);
                            }}
                            placeholder="Enter your password"
                            secureTextEntry
                            icon="lock-closed-outline"
                            error={fieldErrors.password}
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            size="lg"
                            style={styles.loginButton}
                        />

                        {/* Forgot Password */}
                        <View style={styles.forgotRow}>
                            <Text style={styles.forgotText}>
                                Forgot your password?{" "}
                            </Text>
                            <Text style={styles.forgotLink}>Reset it on the web</Text>
                        </View>
                    </View>

                    {/* Signup CTA */}
                    <View style={styles.signupRow}>
                        <Text style={styles.signupText}>
                            New to Manasya?{" "}
                        </Text>
                        <Link href="/(auth)/signup" asChild>
                            <Text style={styles.signupLink}>Create an account</Text>
                        </Link>
                    </View>

                    {/* Footer */}
                    <Text style={styles.footer}>
                        This portal is for verified practitioners only.{"\n"}
                        Students, please use the Manasya web app.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface[50],
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing["2xl"],
        paddingTop: spacing["5xl"],
        paddingBottom: spacing["3xl"],
    },
    header: {
        alignItems: "center",
        marginBottom: spacing["4xl"],
    },
    logoContainer: {
        marginBottom: spacing.xl,
    },
    logoPlaceholder: {
        width: 72,
        height: 72,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary[600],
        alignItems: "center",
        justifyContent: "center",
        ...shadows.lg,
    },
    logoText: {
        fontFamily: "Outfit_800ExtraBold",
        fontSize: 32,
        color: colors.white,
    },
    title: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize["2xl"],
        color: colors.surface[900],
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.base,
        color: colors.surface[500],
        textAlign: "center",
    },
    formCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius["2xl"],
        padding: spacing["2xl"],
        ...shadows.md,
        marginBottom: spacing["2xl"],
    },
    errorBanner: {
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    errorBannerText: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.sm,
        color: colors.error,
        textAlign: "center",
    },
    loginButton: {
        marginTop: spacing.sm,
        width: "100%",
    },
    forgotRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: spacing.lg,
    },
    forgotText: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[400],
    },
    forgotLink: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.sm,
        color: colors.primary[600],
    },
    signupRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: spacing["3xl"],
    },
    signupText: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.base,
        color: colors.surface[500],
    },
    signupLink: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.base,
        color: colors.primary[600],
    },
    footer: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.xs,
        color: colors.surface[400],
        textAlign: "center",
        lineHeight: 18,
    },
});
