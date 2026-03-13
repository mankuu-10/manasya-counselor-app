import "react-native-url-polyfill/dist/setup";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * SecureStore adapter for Supabase Auth.
 *
 * On native: Uses Android Keystore / iOS Keychain (encrypted).
 * On web: Falls back to localStorage (for Expo web dev only).
 */
const secureStoreAdapter = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === "web") {
            return localStorage.getItem(key);
        }
        return SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === "web") {
            localStorage.setItem(key, value);
            return;
        }
        await SecureStore.setItemAsync(key, value);
    },
    removeItem: async (key: string): Promise<void> => {
        if (Platform.OS === "web") {
            localStorage.removeItem(key);
            return;
        }
        await SecureStore.deleteItemAsync(key);
    },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: secureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // No URL-based auth in native
    },
});
