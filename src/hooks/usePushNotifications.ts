import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "../stores/auth-store";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export function usePushNotifications() {
    const { user } = useAuthStore();
    const [expoPushToken, setExpoPushToken] = useState("");
    const [notification, setNotification] = useState<Notifications.Notification | undefined>(
        undefined
    );
    const notificationListener = useRef<Notifications.Subscription>(undefined as any);
    const responseListener = useRef<Notifications.Subscription>(undefined as any);

    useEffect(() => {
        if (!user) return;

        registerForPushNotificationsAsync()
            .then(async (token) => {
                if (token && user?.id) {
                    setExpoPushToken(token);
                    // Save token to Supabase counselor_profiles
                    await supabase
                        .from("counselor_profiles")
                        .update({ expo_push_token: token })
                        .eq("user_id", user.id);
                }
            })
            .catch((err) => console.log("Failed to get push token:", err));

        notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
            // e.g. Navigate to specific screen based on response.notification.request.content.data
            console.log("Notification tapped:", response);
        });

        return () => {
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, [user]);

    return { expoPushToken, notification };
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#14b8a6",
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        
        if (finalStatus !== "granted") {
            console.log("Failed to get push token for push notification!");
            return;
        }
        
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ??
            Constants?.easConfig?.projectId;
            
        if (!projectId) {
            console.log("No project ID found for push notifications.");
        }

        token = (
            await Notifications.getExpoPushTokenAsync({
                projectId,
            })
        ).data;
    } else {
        console.log("Must use physical device for Push Notifications");
    }

    return token;
}
