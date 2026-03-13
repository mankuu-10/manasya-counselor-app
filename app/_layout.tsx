import "react-native-reanimated";

import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from "@expo-google-fonts/outfit";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../src/providers/AuthProvider";
import { colors } from "../src/theme";
import { usePushNotifications } from "../src/hooks/usePushNotifications";

// Keep splash visible while loading fonts
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 min — reduces Supabase calls
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

function RootApp() {
    // Calling the hook here initializes push notification listeners 
    // and token gathering automatically for the whole session.
    usePushNotifications();

    return (
        <>
            <StatusBar style="dark" backgroundColor={colors.surface[50]} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.surface[50] },
                    animation: "slide_from_right",
                }}
            />
        </>
    );
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Outfit_600SemiBold,
        Outfit_700Bold,
        Outfit_800ExtraBold,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <RootApp />
                    </AuthProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
