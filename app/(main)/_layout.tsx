import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, fontSize, fontWeight } from "../../src/theme";
import { Platform } from "react-native";

/**
 * Main tab navigator — the core navigation for authenticated counselors.
 * 3 tabs: Dashboard, Sessions, Profile
 */
export default function MainLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary[600],
                tabBarInactiveTintColor: colors.surface[400],
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontFamily: "Inter_600SemiBold",
                    fontWeight: fontWeight.semibold,
                    marginBottom: Platform.OS === "ios" ? 0 : 4,
                },
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: colors.surface[200],
                    borderTopWidth: 1,
                    paddingTop: 8,
                    paddingBottom: Platform.OS === "ios" ? 24 : 10,
                    height: Platform.OS === "ios" ? 84 : 64,
                    elevation: 8,
                    shadowColor: colors.black,
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                },
                tabBarItemStyle: {
                    paddingVertical: 2,
                },
            }}
        >
            <Tabs.Screen
                name="(dashboard)"
                options={{
                    title: "Dashboard",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(sessions)"
                options={{
                    title: "Sessions",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="calendar-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="(profile)"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
