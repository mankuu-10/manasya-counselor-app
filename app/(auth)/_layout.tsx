import { Stack } from "expo-router";
import { colors } from "../../src/theme";

/**
 * Auth group layout — no tabs, simple stack navigation.
 * Used for login and signup screens.
 */
export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.surface[50] },
                animation: "slide_from_bottom",
            }}
        />
    );
}
