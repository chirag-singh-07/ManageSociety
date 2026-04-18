import { Stack } from "expo-router";
import { colors } from "@/src/theme/colors";
import { AuthProvider, useAuth } from "@/src/auth/auth-context";
import { AppLoadingScreen } from "@/src/components/app-loading-screen";
import { ToastProvider } from "@/src/components/ui/toast-provider";

function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoadingScreen />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.foreground,
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ title: "Welcome", headerShown: false }} />
      <Stack.Screen name="login" options={{ title: "Sign In" }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="complaints/[id]" options={{ title: "Complaint Detail" }} />
      <Stack.Screen name="settings" options={{ title: "Settings" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ToastProvider>
  );
}
