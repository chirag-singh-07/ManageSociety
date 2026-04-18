import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScreenContainer } from "@/src/components/screen-container";
import { PrimaryButton } from "@/src/components/primary-button";
import { PremiumCard } from "@/src/components/premium-card";
import { colors, radius } from "@/src/theme/colors";
import { useAuth } from "@/src/auth/auth-context";
import { getApiBaseUrl } from "@/src/api/client";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = !email.trim() || !password.trim();

  const handleLogin = async () => {
    if (isDisabled || submitting) return;
    try {
      setSubmitting(true);
      setError(null);
      await login(email.trim(), password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    router.replace("/");
    return null;
  }

  return (
    <ScreenContainer>
      <PremiumCard soft>
        <View style={{ gap: 12, marginTop: 8 }}>
          <Image
            source={require("@/assets/images/splash-icon.png")}
            contentFit="contain"
            style={{ width: "100%", height: 76 }}
          />
          <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground }} selectable>
            Welcome Back
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 15, lineHeight: 22 }} selectable>
            Sign in with your society account to continue.
          </Text>
        </View>
      </PremiumCard>

      <PremiumCard>
        <View style={{ gap: 14 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.mutedForeground, fontWeight: "700", fontSize: 12 }} selectable>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                borderWidth: 1,
                borderColor: colors.borderSoft,
                borderRadius: radius.md,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
              }}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.mutedForeground, fontWeight: "700", fontSize: 12 }} selectable>
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              style={{
                borderWidth: 1,
                borderColor: colors.borderSoft,
                borderRadius: radius.md,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 15,
              }}
            />
          </View>

          <PrimaryButton
            label={submitting ? "Signing in..." : "Sign In"}
            onPress={handleLogin}
            disabled={isDisabled || submitting}
            icon={<Ionicons name="log-in-outline" size={18} color={colors.primaryForeground} />}
          />

          {error && (
            <Text style={{ color: colors.destructive, fontSize: 12, textAlign: "center" }} selectable>
              {error}
            </Text>
          )}

          <Pressable onPress={() => router.push("/onboarding")}>
            <Text style={{ color: colors.primary, fontWeight: "700", textAlign: "center" }} selectable>
              Back to onboarding
            </Text>
          </Pressable>
        </View>
      </PremiumCard>

      <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 6 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="shield-checkmark" size={16} color={colors.success} />
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
            Secure Login
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="flash" size={16} color={colors.warning} />
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
            Instant Alerts
          </Text>
        </View>
      </View>

      <Text style={{ color: colors.mutedForeground, fontSize: 11, textAlign: "center" }} selectable>
        API: {getApiBaseUrl()}
      </Text>
    </ScreenContainer>
  );
}

