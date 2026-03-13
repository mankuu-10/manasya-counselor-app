import { Redirect } from "expo-router";

// Redirect to the main dashboard
// AuthProvider will automatically intercept this and redirect to login if not authenticated
export default function Index() {
    return <Redirect href="/(main)/(dashboard)" />;
}
