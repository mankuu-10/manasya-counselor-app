import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, borderRadius, fontSize, spacing } from "../../theme";

interface TagInputProps {
    label: string;
    tags: string[];
    onChange: (tags: string[]) => void;
    suggestions: string[];
    placeholder: string;
}

export function TagInput({ label, tags, onChange, suggestions, placeholder }: TagInputProps) {
    const [modalVisible, setModalVisible] = useState(false);
    const [search, setSearch] = useState("");

    const filteredSuggestions = suggestions.filter(
        (s) => !tags.includes(s) && s.toLowerCase().includes(search.toLowerCase())
    );

    const addTag = (tag: string) => {
        if (!tags.includes(tag)) {
            onChange([...tags, tag]);
        }
        setSearch("");
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((t) => t !== tagToRemove));
    };

    const handleCustomSubmit = () => {
        const customTag = search.trim();
        if (customTag && !tags.includes(customTag)) {
            onChange([...tags, customTag]);
        }
        setSearch("");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity
                style={styles.inputTrigger}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                {tags.length === 0 ? (
                    <Text style={styles.placeholder}>{placeholder}</Text>
                ) : (
                    <View style={styles.tagsWrapper}>
                        {tags.map((tag) => (
                            <View key={tag} style={styles.tag}>
                                <Text style={styles.tagText}>{tag}</Text>
                                <TouchableOpacity
                                    onPress={() => removeTag(tag)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={14} color={colors.primary[700]} />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select {label}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={{ padding: 8 }}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={colors.surface[400]} />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={handleCustomSubmit}
                            placeholder="Search or type custom..."
                            style={styles.searchInput}
                            autoFocus
                            returnKeyType="done"
                        />
                    </View>

                    <ScrollView contentContainerStyle={styles.suggestionsContent} keyboardShouldPersistTaps="handled">
                        <Text style={styles.sectionTitle}>Suggestions</Text>
                        <View style={styles.suggestionsGrid}>
                            {filteredSuggestions.map((suggestion) => (
                                <TouchableOpacity
                                    key={suggestion}
                                    style={styles.suggestionChip}
                                    onPress={() => addTag(suggestion)}
                                >
                                    <Text style={styles.suggestionText}>+ {suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        
                        {filteredSuggestions.length === 0 && search.trim().length > 0 && (
                            <TouchableOpacity style={styles.customChip} onPress={handleCustomSubmit}>
                                <Text style={styles.customChipText}>Add "{search.trim()}"</Text>
                            </TouchableOpacity>
                        )}
                        
                        {tags.length > 0 && (
                            <>
                                <View style={styles.divider} />
                                <Text style={styles.sectionTitle}>Selected</Text>
                                <View style={styles.suggestionsGrid}>
                                    {tags.map((tag) => (
                                        <TouchableOpacity
                                            key={tag}
                                            style={styles.selectedChip}
                                            onPress={() => removeTag(tag)}
                                        >
                                            <Text style={styles.selectedChipText}>{tag}</Text>
                                            <Ionicons name="close" size={14} color={colors.white} />
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                    </ScrollView>
                </View>
            </Modal>
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
    inputTrigger: {
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.surface[200],
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        minHeight: 52,
    },
    placeholder: {
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.base,
        color: colors.surface[400],
    },
    tagsWrapper: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.sm,
    },
    tag: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[100],
        borderRadius: borderRadius.md,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    tagText: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.xs,
        color: colors.primary[700],
    },
    modalContainer: {
        flex: 1,
        backgroundColor: colors.surface[50],
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: spacing.xl,
        paddingTop: spacing.xl,
        paddingBottom: spacing.md,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface[200],
    },
    modalTitle: {
        fontFamily: "Outfit_700Bold",
        fontSize: fontSize.lg,
        color: colors.surface[900],
    },
    doneText: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.md,
        color: colors.primary[600],
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.surface[200],
        margin: spacing.lg,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.lg,
        minHeight: 48,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontFamily: "Inter_400Regular",
        fontSize: fontSize.base,
        color: colors.surface[900],
    },
    suggestionsContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing["4xl"],
    },
    sectionTitle: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.xs,
        color: colors.surface[500],
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: spacing.md,
    },
    suggestionsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: spacing.md,
    },
    suggestionChip: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.surface[200],
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    suggestionText: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.sm,
        color: colors.surface[600],
    },
    customChip: {
        backgroundColor: colors.primary[50],
        borderWidth: 1,
        borderColor: colors.primary[200],
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        alignSelf: "flex-start",
    },
    customChipText: {
        fontFamily: "Inter_600SemiBold",
        fontSize: fontSize.sm,
        color: colors.primary[700],
    },
    selectedChip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.primary[600],
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        gap: spacing.xs,
    },
    selectedChipText: {
        fontFamily: "Inter_500Medium",
        fontSize: fontSize.sm,
        color: colors.white,
    },
    divider: {
        height: 1,
        backgroundColor: colors.surface[200],
        marginVertical: spacing.xl,
    },
});
