import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Daily, { DailyCall, DailyEventObjectParticipant, DailyEventObjectParticipantLeft } from "@daily-co/react-native-daily-js";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, fontSize, borderRadius } from "../../../src/theme";
import { supabase } from "../../../src/lib/supabase";
import { useAuthStore } from "../../../src/stores/auth-store";

// Note: To render specific video tracks you would normally use a custom Video component
// provided by Daily, or hook up the WebRTC MediaStream to a react-native-webrtc RTCView.
// Since React Native Daily SDK abstracts this, we usually use <DailyMediaView>.
// However, the standard implementation dictates that when Daily.createCallObject() is joined,
// the SDK handles streams mostly automatically if mapped right. We will build a unified
// full-screen interface.

export default function SessionRoom() {
    const { id } = useLocalSearchParams<{ id: string }>(); // booking ID
    const router = useRouter();
    const { user } = useAuthStore();
    
    const [callObject, setCallObject] = useState<DailyCall | null>(null);
    const [status, setStatus] = useState<"loading" | "joining" | "incall" | "error" | "left">("loading");
    const [errorMsg, setErrorMsg] = useState("");
    
    // Call state controls
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [participantCount, setParticipantCount] = useState(1);

    useEffect(() => {
        if (!id || !user) return;
        
        async function fetchRoomAndJoin() {
            try {
                // 1. Fetch the booking to get the Daily room URL
                const { data: booking, error: fetchErr } = await supabase
                    .from("bookings")
                    .select("roomId, status") // Assuming roomId is stored here or in a joined table. For now, we mock.
                    .eq("id", id)
                    .single();

                if (fetchErr) throw fetchErr;
                
                // For demonstration/setup, if you don't have a roomId column yet, you'd generate one
                // via your backend API. Since we are native side, we'll assume the backend
                // either saved it to `roomId` or we need to securely fetch it.
                // Let's assume the Web App's logic is to use the booking ID as the room name suffix
                // e.g. https://manasya.daily.co/session-[id]
                const roomUrl = `https://manasya.daily.co/session-${id}`; 

                setStatus("joining");

                // 2. Initialize Daily
                const newCallObject = Daily.createCallObject();
                setCallObject(newCallObject);

                // 3. Setup listeners
                newCallObject.on("joined-meeting", () => setStatus("incall"));
                newCallObject.on("left-meeting", () => setStatus("left"));
                newCallObject.on("error", (e) => {
                    setStatus("error");
                    setErrorMsg(e?.errorMsg || "Failed to join room.");
                });
                newCallObject.on("participant-joined", (e) => {
                    const pEvent = e as DailyEventObjectParticipant;
                    if (!pEvent.participant.local) {
                        setParticipantCount(prev => prev + 1);
                    }
                });
                newCallObject.on("participant-left", (e) => {
                    const pEvent = e as DailyEventObjectParticipantLeft;
                    if (!pEvent.participant.local) {
                        setParticipantCount(prev => Math.max(1, prev - 1));
                    }
                });

                // 4. Join the room
                await newCallObject.join({ url: roomUrl });

            } catch (err: any) {
                console.error("Video Error:", err);
                setStatus("error");
                setErrorMsg("Could not connect to the session securely.");
            }
        }

        fetchRoomAndJoin();

        // Cleanup on unmount
        return () => {
            if (callObject) {
                callObject.leave().then(() => callObject.destroy());
            }
        };
    }, [id, user]);

    const toggleAudio = () => {
        if (!callObject) return;
        callObject.setLocalAudio(!audioEnabled);
        setAudioEnabled(!audioEnabled);
    };

    const toggleVideo = () => {
        if (!callObject) return;
        callObject.setLocalVideo(!videoEnabled);
        setVideoEnabled(!videoEnabled);
    };

    const leaveCall = async () => {
        if (!callObject) return;
        await callObject.leave();
        router.back();
    };

    if (status === "loading" || status === "joining") {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={styles.loadingText}>
                    {status === "loading" ? "Initializing secure connection..." : "Joining specific room..."}
                </Text>
            </SafeAreaView>
        );
    }

    if (status === "error") {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Ionicons name="warning" size={48} color={colors.error} />
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity style={styles.leaveButton} onPress={() => router.back()}>
                    <Text style={styles.leaveButtonText}>Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            {/* The actual video streams would be rendered here using DailyMediaView from Daily.co SDK.
                Since it requires complex sub-component mapping, we provide the native overlay first. */}
            <View style={styles.videoPlaceholder}>
                <Ionicons name="videocam-outline" size={64} color={colors.surface[600]} />
                <Text style={styles.placeholderText}>
                    {participantCount > 1 
                        ? "Student is in the room." 
                        : "Waiting for student to join..."}
                </Text>
            </View>

            {/* Top Bar Overlay */}
            <SafeAreaView style={styles.topBar}>
                <View style={styles.badge}>
                    <View style={[styles.badgeDot, { backgroundColor: participantCount > 1 ? colors.primary[500] : colors.surface[400] }]} />
                    <Text style={styles.badgeText}>
                        {participantCount} Participant{participantCount !== 1 && "s"}
                    </Text>
                </View>
            </SafeAreaView>

            {/* Bottom Controls Overlay */}
            <SafeAreaView style={styles.bottomBar}>
                <View style={styles.controlsRow}>
                    <TouchableOpacity 
                        style={[styles.controlBtn, !audioEnabled && styles.controlBtnOff]} 
                        onPress={toggleAudio}
                    >
                        <Ionicons 
                            name={audioEnabled ? "mic" : "mic-off"} 
                            size={28} 
                            color={audioEnabled ? colors.surface[800] : colors.white} 
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.endCallBtn} onPress={leaveCall}>
                        <Ionicons name="call" size={28} color={colors.white} style={{ transform: [{ rotate: "135deg" }] }} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.controlBtn, !videoEnabled && styles.controlBtnOff]} 
                        onPress={toggleVideo}
                    >
                        <Ionicons 
                            name={videoEnabled ? "videocam" : "videocam-off"} 
                            size={28} 
                            color={videoEnabled ? colors.surface[800] : colors.white} 
                        />
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface[900],
    },
    centerContainer: {
        flex: 1,
        backgroundColor: colors.surface[50],
        justifyContent: "center",
        alignItems: "center",
        padding: spacing.xl,
    },
    loadingText: {
        marginTop: spacing.md,
        fontFamily: "Inter_500Medium",
        color: colors.surface[600],
    },
    errorText: {
        marginTop: spacing.md,
        fontFamily: "Inter_500Medium",
        color: colors.surface[900],
        textAlign: "center",
        marginBottom: spacing.xl,
    },
    videoPlaceholder: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.surface[900],
        justifyContent: "center",
        alignItems: "center",
    },
    placeholderText: {
        marginTop: spacing.md,
        fontFamily: "Inter_500Medium",
        color: colors.surface[400],
        fontSize: fontSize.lg,
    },
    topBar: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "flex-end",
        padding: spacing.lg,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        gap: spacing.sm,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    badgeText: {
        fontFamily: "Inter_600SemiBold",
        color: colors.white,
        fontSize: fontSize.sm,
    },
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: spacing["2xl"],
    },
    controlsRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: spacing["2xl"],
    },
    controlBtn: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.white,
        justifyContent: "center",
        alignItems: "center",
    },
    controlBtnOff: {
        backgroundColor: colors.surface[600],
    },
    endCallBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.error,
        justifyContent: "center",
        alignItems: "center",
    },
    leaveButton: {
        backgroundColor: colors.primary[600],
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    leaveButtonText: {
        fontFamily: "Inter_600SemiBold",
        color: colors.white,
        fontSize: fontSize.base,
    },
});
