import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, fontSize, spacing, borderRadius } from "../../../src/theme";
import { Button } from "../../../src/components/ui";
import { useAvailability, DayAvailability } from "../../../src/hooks/useAvailability";

const DAYS_OF_WEEK = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const DEFAULT_START = "09:00:00";
const DEFAULT_END = "17:00:00";

// Helper to construct a Date object from a "HH:mm:ss" string for the picker
const timeStringToDate = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
};

// Helper to extract "HH:mm:ss" from a Date object
const dateToTimeString = (date: Date) => {
    return date.toTimeString().split(" ")[0];
};

// Formats "HH:mm:ss" to e.g. "9:00 AM"
const formatDisplayTime = (timeStr: string) => {
    const date = timeStringToDate(timeStr);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function AvailabilityScreen() {
    const router = useRouter();
    const { availability, isLoading, updateAvailability, isUpdating } = useAvailability();
    
    // Local state for edits
    const [schedule, setSchedule] = useState<DayAvailability[]>([]);

    // Time picker state
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<"start" | "end">("start");
    const [activeDayIdx, setActiveDayIdx] = useState<number | null>(null);

    // Initialize local state when data loads
    useEffect(() => {
        if (!isLoading) {
            const initialSchedule = DAYS_OF_WEEK.map((_, index) => {
                const existing = availability.find(a => a.day_of_week === index);
                if (existing) return existing;
                return {
                    day_of_week: index,
                    is_available: false,
                    start_time: DEFAULT_START,
                    end_time: DEFAULT_END,
                };
            });
            setSchedule(initialSchedule);
        }
    }, [availability, isLoading]);

    const toggleDay = (dayIndex: number) => {
        setSchedule(prev => prev.map(day => 
            day.day_of_week === dayIndex 
                ? { ...day, is_available: !day.is_available } 
                : day
        ));
    };

    const openPicker = (dayIndex: number, mode: "start" | "end") => {
        setActiveDayIdx(dayIndex);
        setPickerMode(mode);
        setShowPicker(true);
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate && activeDayIdx !== null) {
            const timeStr = dateToTimeString(selectedDate);
            setSchedule(prev => prev.map(day => {
                if (day.day_of_week === activeDayIdx) {
                    return {
                        ...day,
                        [pickerMode === "start" ? "start_time" : "end_time"]: timeStr
                    };
                }
                return day;
            }));
        }
        setActiveDayIdx(null);
    };

    const handleSave = async () => {
        try {
            // Only save days that are marked as available
            const activeDays = schedule.filter(d => d.is_available);
            await updateAvailability(activeDays);
            Alert.alert("Success", "Schedule updated automatically.");
            router.back();
        } catch (error: any) {
            Alert.alert("Error saving", error.message);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.loadingText}>Loading schedule...</Text>
            </SafeAreaView>
        );
    }

    // Determine the active date for the picker
    let pickerDate = new Date();
    if (activeDayIdx !== null) {
        const activeItem = schedule.find(d => d.day_of_week === activeDayIdx);
        if (activeItem) {
            const timeStr = pickerMode === "start" ? activeItem.start_time : activeItem.end_time;
            if (timeStr) pickerDate = timeStringToDate(timeStr);
        }
    }

    return (
        <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.surface[900]} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Availability</Text>
                <Button 
                    title="Save" 
                    onPress={handleSave} 
                    loading={isUpdating}
                    size="sm"
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.description}>
                    Set your weekly repeating schedule. Students can only book sessions during these hours.
                </Text>

                <View style={styles.scheduleList}>
                    {schedule.map((day) => (
                        <View key={day.day_of_week} style={[styles.dayCard, !day.is_available && styles.dayCardDisabled]}>
                            <View style={styles.dayHeader}>
                                <Text style={styles.dayName}>{DAYS_OF_WEEK[day.day_of_week]}</Text>
                                <Switch
                                    value={day.is_available}
                                    onValueChange={() => toggleDay(day.day_of_week)}
                                    trackColor={{ false: colors.surface[300], true: colors.primary[500] }}
                                    thumbColor={colors.white}
                                />
                            </View>

                            {day.is_available && (
                                <View style={styles.timeControls}>
                                    <View style={styles.timeGroup}>
                                        <Text style={styles.timeLabel}>Start</Text>
                                        <TouchableOpacity 
                                            style={styles.timeButton}
                                            onPress={() => openPicker(day.day_of_week, "start")}
                                        >
                                            <Text style={styles.timeButtonText}>
                                                {formatDisplayTime(day.start_time || DEFAULT_START)}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    <Ionicons name="arrow-forward" size={16} color={colors.surface[400]} />

                                    <View style={styles.timeGroup}>
                                        <Text style={styles.timeLabel}>End</Text>
                                        <TouchableOpacity 
                                            style={styles.timeButton}
                                            onPress={() => openPicker(day.day_of_week, "end")}
                                        >
                                            <Text style={styles.timeButtonText}>
                                                {formatDisplayTime(day.end_time || DEFAULT_END)}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {showPicker && (
                <DateTimePicker
                    value={pickerDate}
                    mode="time"
                    is24Hour={false}
                    display="spinner"
                    onChange={onTimeChange}
                />
            )}
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
        paddingHorizontal: spacing.sm,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        backgroundColor: colors.surface[50],
    },
    backButton: {
        padding: spacing.sm,
    },
    headerTitle: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize["xl"],
        color: colors.surface[900],
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing["6xl"],
    },
    description: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.sm,
        color: colors.surface[600],
        marginBottom: spacing.xl,
        lineHeight: 20,
    },
    scheduleList: {
        gap: spacing.md,
    },
    dayCard: {
        backgroundColor: colors.white,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.surface[200],
    },
    dayCardDisabled: {
        backgroundColor: colors.surface[50],
        opacity: 0.8,
    },
    dayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dayName: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.base,
        color: colors.surface[900],
    },
    timeControls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.surface[100],
    },
    timeGroup: {
        flex: 1,
        alignItems: "center",
    },
    timeLabel: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.xs,
        color: colors.surface[500],
        marginBottom: spacing.xs,
    },
    timeButton: {
        backgroundColor: colors.surface[100],
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.lg,
        minWidth: 100,
        alignItems: "center",
    },
    timeButtonText: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.sm,
        color: colors.surface[900],
    },
});
