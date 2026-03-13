import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fontSize, spacing, borderRadius } from "../../../src/theme";
import { Input, Button, TagInput } from "../../../src/components/ui";
import { useCounselorProfile, CounselorProfile, UserProfile } from "../../../src/hooks/useCounselorProfile";
import { supabase } from "../../../src/lib/supabase";
import { useAuthStore } from "../../../src/stores/auth-store";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const SUGGESTED_SPECIALTIES = [
    "Anxiety", "Depression", "Academic Stress", "Relationships",
    "Self-Esteem", "Career Guidance", "Grief & Loss", "Anger Management",
    "Family Issues", "Trauma & PTSD", "OCD", "ADHD", "Eating Disorders",
    "Addiction", "Social Anxiety", "Sleep Issues", "Burnout", "Loneliness",
    "Identity & Gender", "Peer Pressure",
];

const SUGGESTED_LANGUAGES = [
    "English", "Hindi", "Tamil", "Telugu", "Kannada", "Malayalam",
    "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu", "Odia",
    "Assamese", "Sanskrit",
];

export default function ProfileScreen() {
    const { user } = useAuthStore();
    const router = useRouter();
    const { data, isLoading, refetch } = useCounselorProfile();
    const [saving, setSaving] = useState(false);

    // Form state
    const [profile, setProfile] = useState<Partial<UserProfile>>({});
    const [counselor, setCounselor] = useState<Partial<CounselorProfile>>({
        specialties: [],
        languages: []
    });

    // Sync remote data to local form state when loaded
    useEffect(() => {
        if (data) {
            setProfile(data.profile);
            setCounselor(data.counselor);
        }
    }, [data]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // Update auth metadata
            await supabase.auth.updateUser({
                data: { display_name: profile.full_name },
            });

            // Update public profile
            const { error: profError } = await supabase
                .from("profiles")
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone || null,
                })
                .eq("id", user.id);

            if (profError) throw profError;

            // Update counselor details
            const { error: cpError } = await supabase
                .from("counselor_profiles")
                .upsert({
                    user_id: user.id,
                    ...counselor,
                });

            if (cpError) throw cpError;

            await refetch();
            Alert.alert("Success", "Profile updated successfully");
        } catch (error: any) {
            Alert.alert("Error saving profile", error.message);
        } finally {
            setSaving(false);
        }
    };

    const confirmSignOut = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out of your counselor account?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Log Out", 
                    style: "destructive",
                    onPress: async () => await supabase.auth.signOut() 
                }
            ]
        );
    };

    if (isLoading && !data) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading profile...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Profile</Text>
                <Button 
                    title={saving ? "Saving..." : "Save"} 
                    onPress={handleSave} 
                    disabled={saving}
                    size="sm"
                />
            </View>

            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary[500]} />}
            >
                {/* Personal Information */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    <View style={styles.card}>
                        <Input
                            label="Full Name"
                            value={profile.full_name || ""}
                            onChangeText={(text) => setProfile(p => ({ ...p, full_name: text }))}
                        />
                        <Input
                            label="Email Address"
                            value={profile.email || ""}
                            editable={false}
                            helperText="Managed by your login credentials. Not shared publicly."
                        />
                        <Input
                            label="Phone Number"
                            value={profile.phone || ""}
                            onChangeText={(text) => setProfile(p => ({ ...p, phone: text }))}
                            keyboardType="phone-pad"
                        />
                        <Input
                            label="Bio"
                            value={counselor.bio || ""}
                            onChangeText={(text) => setCounselor(c => ({ ...c, bio: text }))}
                            multiline
                            numberOfLines={4}
                            placeholder="Tell students about yourself and your approach..."
                            helperText={`${counselor.bio?.length || 0}/500 characters. Recommended: at least 100.`}
                            style={{ height: 100 }}
                        />
                         <Input
                            label="Welcome Message"
                            value={counselor.welcome_message || ""}
                            onChangeText={(text) => setCounselor(c => ({ ...c, welcome_message: text }))}
                            multiline
                            numberOfLines={3}
                            placeholder="Hi! I'm glad you're reaching out..."
                            helperText="Shown to students right before they book."
                            style={{ height: 80 }}
                        />
                    </View>
                </View>

                {/* Professional Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Details</Text>
                    <View style={styles.card}>
                        <TagInput
                            label="Specialties"
                            tags={counselor.specialties || []}
                            onChange={(tags) => setCounselor(c => ({ ...c, specialties: tags }))}
                            suggestions={SUGGESTED_SPECIALTIES}
                            placeholder="e.g. Anxiety, Career Guidance"
                        />
                        <TagInput
                            label="Languages Spoken"
                            tags={counselor.languages || []}
                            onChange={(tags) => setCounselor(c => ({ ...c, languages: tags }))}
                            suggestions={SUGGESTED_LANGUAGES}
                            placeholder="e.g. English, Hindi"
                        />
                        <Input
                            label="Qualifications"
                            value={counselor.qualifications || ""}
                            onChangeText={(text) => setCounselor(c => ({ ...c, qualifications: text }))}
                            placeholder="M.Phil Clinical Psychology — NIMHANS"
                        />
                        <Input
                            label="RCI Registration Number"
                            value={counselor.rci_number || ""}
                            onChangeText={(text) => setCounselor(c => ({ ...c, rci_number: text }))}
                            placeholder="e.g. A12345"
                        />
                        <Input
                            label="Years of Experience"
                            value={counselor.experience_years?.toString() || ""}
                            onChangeText={(text) => setCounselor(c => ({ ...c, experience_years: parseInt(text) || 0 }))}
                            keyboardType="number-pad"
                        />
                        <Input
                            label="Session Rate (₹)"
                            value={counselor.session_rate?.toString() || ""}
                            onChangeText={(text) => setCounselor(c => ({ ...c, session_rate: parseInt(text) || 0 }))}
                            keyboardType="number-pad"
                            helperText="Set to 0 for volunteer (free) sessions"
                        />
                    </View>
                </View>

                {/* Settings */}
                <View style={[styles.section, { marginBottom: 0 }]}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.card}>
                        <Button 
                            title="Set Availability"
                            variant="secondary"
                            icon={<Ionicons name="time-outline" size={18} color={colors.white} />}
                            onPress={() => router.push("/availability" as any)}
                            style={{ marginBottom: spacing.md }}
                        />
                       <Button 
                            title="Log Out" 
                            variant="danger" 
                            onPress={confirmSignOut} 
                        />
                    </View>
                </View>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
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
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing["6xl"],
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontFamily: "Outfit_600SemiBold",
        fontSize: fontSize.lg,
        color: colors.surface[900],
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.surface[200],
    },
});
