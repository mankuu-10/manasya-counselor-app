import { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import * as Haptics from "expo-haptics";
import { supabase } from "../../src/lib/supabase";
import { Button, Input } from "../../src/components/ui";
import { colors, fontSize, spacing, borderRadius, shadows } from "../../src/theme";

const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL || "http://localhost:3000";

type Step = "credentials" | "professional" | "invite";

export default function SignupScreen() {
    const [step, setStep] = useState<Step>("credentials");

    // Credentials
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Professional Info
    const [qualifications, setQualifications] = useState("");
    const [rciNumber, setRciNumber] = useState("");
    const [specialties, setSpecialties] = useState("");
    const [experience, setExperience] = useState("");

    // Invite Code
    const [inviteCode, setInviteCode] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const validateCredentials = (): boolean => {
        const errors: Record<string, string> = {};
        if (!fullName.trim()) errors.fullName = "Full name is required";
        if (!email.trim()) errors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email";
        if (!password) errors.password = "Password is required";
        else if (password.length < 8) errors.password = "At least 8 characters";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validateProfessional = (): boolean => {
        const errors: Record<string, string> = {};
        if (!qualifications.trim()) errors.qualifications = "Required";
        if (!specialties.trim()) errors.specialties = "List at least one specialty";
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = async () => {
        setError(null);
        if (step === "credentials" && validateCredentials()) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setStep("professional");
        } else if (step === "professional" && validateProfessional()) {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setStep("invite");
        }
    };

    const handleBack = () => {
        setError(null);
        setFieldErrors({});
        if (step === "professional") setStep("credentials");
        if (step === "invite") setStep("professional");
    };

    const handleSignup = async () => {
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(`${SITE_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                    fullName: fullName.trim(),
                    displayName: fullName.trim(),
                    role: "counselor",
                    qualifications: qualifications.trim(),
                    rciNumber: rciNumber.trim(),
                    specialties: specialties.trim(),
                    experience: experience.trim() || "0",
                    inviteCode: inviteCode.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Signup failed. Please try again.");
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                setLoading(false);
                return;
            }

            // Sign in immediately after signup
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password,
            });

            if (authError) {
                // Account created but auto-login failed — direct to login
                setError("Account created! Please log in.");
            } else {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch {
            setError("Network error. Please check your connection.");
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const stepIndex = step === "credentials" ? 0 : step === "professional" ? 1 : 2;

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
                        <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoText}>M</Text>
                        </View>
                        <Text style={styles.title}>Join as a Practitioner</Text>
                        <Text style={styles.subtitle}>
                            Help students access affordable mental health support
                        </Text>
                    </View>

                    {/* Progress Indicator */}
                    <View style={styles.progressRow}>
                        {["Account", "Professional", "Verification"].map((label, i) => (
                            <View key={label} style={styles.progressItem}>
                                <View
                                    style={[
                                        styles.progressDot,
                                        i <= stepIndex && styles.progressDotActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.progressDotText,
                                            i <= stepIndex && styles.progressDotTextActive,
                                        ]}
                                    >
                                        {i + 1}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.progressLabel,
                                        i <= stepIndex && styles.progressLabelActive,
                                    ]}
                                >
                                    {label}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Form Card */}
                    <View style={styles.formCard}>
                        {error && (
                            <View style={styles.errorBanner}>
                                <Text style={styles.errorBannerText}>{error}</Text>
                            </View>
                        )}

                        {/* Step 1: Credentials */}
                        {step === "credentials" && (
                            <>
                                <Input
                                    label="Full Name"
                                    value={fullName}
                                    onChangeText={(t) => { setFullName(t); setFieldErrors((p) => ({ ...p, fullName: undefined as unknown as string })); }}
                                    placeholder="Dr. Jane Doe"
                                    icon="person-outline"
                                    error={fieldErrors.fullName}
                                />
                                <Input
                                    label="Email"
                                    value={email}
                                    onChangeText={(t) => { setEmail(t); setFieldErrors((p) => ({ ...p, email: undefined as unknown as string })); }}
                                    placeholder="you@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    icon="mail-outline"
                                    error={fieldErrors.email}
                                />
                                <Input
                                    label="Password"
                                    value={password}
                                    onChangeText={(t) => { setPassword(t); setFieldErrors((p) => ({ ...p, password: undefined as unknown as string })); }}
                                    placeholder="Min 8 characters"
                                    secureTextEntry
                                    icon="lock-closed-outline"
                                    error={fieldErrors.password}
                                />
                                <Button title="Continue" onPress={handleNext} size="lg" style={styles.fullButton} />
                            </>
                        )}

                        {/* Step 2: Professional Info */}
                        {step === "professional" && (
                            <>
                                <Input
                                    label="Qualifications"
                                    value={qualifications}
                                    onChangeText={(t) => { setQualifications(t); setFieldErrors((p) => ({ ...p, qualifications: undefined as unknown as string })); }}
                                    placeholder="M.Sc. Clinical Psychology, RCI Certified"
                                    icon="school-outline"
                                    error={fieldErrors.qualifications}
                                />
                                <Input
                                    label="RCI Registration Number (optional)"
                                    value={rciNumber}
                                    onChangeText={setRciNumber}
                                    placeholder="RCI/PSY/12345"
                                    icon="document-text-outline"
                                />
                                <Input
                                    label="Specialties"
                                    value={specialties}
                                    onChangeText={(t) => { setSpecialties(t); setFieldErrors((p) => ({ ...p, specialties: undefined as unknown as string })); }}
                                    placeholder="Anxiety, Depression, Academic Stress"
                                    icon="heart-outline"
                                    error={fieldErrors.specialties}
                                />
                                <Input
                                    label="Years of Experience"
                                    value={experience}
                                    onChangeText={setExperience}
                                    placeholder="e.g. 3"
                                    keyboardType="numeric"
                                    icon="time-outline"
                                />
                                <View style={styles.buttonRow}>
                                    <Button title="Back" onPress={handleBack} variant="outline" size="md" style={styles.halfButton} />
                                    <Button title="Continue" onPress={handleNext} size="md" style={styles.halfButton} />
                                </View>
                            </>
                        )}

                        {/* Step 3: Invite Code */}
                        {step === "invite" && (
                            <>
                                <Text style={styles.stepDescription}>
                                    If you have a pilot invite code, enter it below for instant verification. Otherwise, your account will be reviewed by our team.
                                </Text>
                                <Input
                                    label="Invite Code (optional)"
                                    value={inviteCode}
                                    onChangeText={setInviteCode}
                                    placeholder="MANASYA2026"
                                    icon="key-outline"
                                    autoCapitalize="none"
                                />
                                <View style={styles.buttonRow}>
                                    <Button title="Back" onPress={handleBack} variant="outline" size="md" style={styles.halfButton} />
                                    <Button
                                        title="Create Account"
                                        onPress={handleSignup}
                                        loading={loading}
                                        size="md"
                                        style={styles.halfButton}
                                    />
                                </View>
                            </>
                        )}
                    </View>

                    {/* Login CTA */}
                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <Link href="/(auth)/login" asChild>
                            <Text style={styles.loginLink}>Sign in</Text>
                        </Link>
                    </View>
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
        paddingTop: spacing["3xl"],
        paddingBottom: spacing["3xl"],
    },
    header: {
        alignItems: "center",
        marginBottom: spacing["2xl"],
    },
    logoPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary[600],
        alignItems: "center",
        justifyContent: "center",
        ...shadows.lg,
        marginBottom: spacing.lg,
    },
    logoText: {
        fontFamily: "Outfit_800ExtraBold",
        fontSize: 28,
        color: colors.white,
    },
    title: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize.xl,
        color: colors.surface[900],
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[500],
        textAlign: "center",
    },
    progressRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: spacing["2xl"],
        marginBottom: spacing["2xl"],
    },
    progressItem: {
        alignItems: "center",
        gap: spacing.xs,
    },
    progressDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.surface[200],
        alignItems: "center",
        justifyContent: "center",
    },
    progressDotActive: {
        backgroundColor: colors.primary[600],
    },
    progressDotText: {
        fontFamily: "Inter_700Bold",
        fontSize: fontSize.sm,
        color: colors.surface[400],
    },
    progressDotTextActive: {
        color: colors.white,
    },
    progressLabel: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.xs,
        color: colors.surface[400],
    },
    progressLabelActive: {
        color: colors.primary[700],
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
    stepDescription: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[500],
        lineHeight: 20,
        marginBottom: spacing.lg,
    },
    fullButton: {
        marginTop: spacing.sm,
        width: "100%",
    },
    buttonRow: {
        flexDirection: "row",
        gap: spacing.md,
        marginTop: spacing.sm,
    },
    halfButton: {
        flex: 1,
    },
    loginRow: {
        flexDirection: "row",
        justifyContent: "center",
    },
    loginText: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.base,
        color: colors.surface[500],
    },
    loginLink: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.base,
        color: colors.primary[600],
    },
});
