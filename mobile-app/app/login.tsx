import { useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { ScreenContainer } from "@/src/components/screen-container";
import { PrimaryButton } from "@/src/components/primary-button";
import { PremiumCard } from "@/src/components/premium-card";
import { colors, radius } from "@/src/theme/colors";
import { useAuth } from "@/src/auth/auth-context";
import { getApiBaseUrl } from "@/src/api/client";

const benefits = [
  "Track your dues and payment status",
  "Raise and monitor complaints easily",
  "Get notices and community updates instantly",
] as const;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = !email.trim() || !password.trim();

  const handleLogin = async () => {
    if (isDisabled || submitting) return;

    try {
      setSubmitting(true);
      setError(null);
      await login(email.trim(), password);
      router.replace("/(tabs)" as any);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <Redirect href={"/(tabs)" as any} />;
  }

  return (
    <ScreenContainer>
      <Animated.View entering={FadeInDown.duration(380)}>
        <PremiumCard padded={false}>
          <View
            style={{
              borderRadius: radius.xl,
              padding: 22,
              gap: 12,
              backgroundColor: colors.black,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -20,
                right: -24,
                width: 120,
                height: 120,
                borderRadius: 70,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />
            <Text style={{ color: "#A5B4FC", fontWeight: "700", fontSize: 12 }} selectable>
              Resident Portal
            </Text>
            <Text style={{ fontSize: 30, lineHeight: 36, fontWeight: "800", color: colors.primaryForeground }} selectable>
              Welcome Back
            </Text>
            <Text style={{ color: "#CBD5E1", fontSize: 14, lineHeight: 22 }} selectable>
              Sign in to access your society dashboard, notices, complaints, and payment updates.
            </Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="shield-checkmark" size={15} color={colors.success} />
                <Text style={{ color: "#E2E8F0", fontSize: 12 }} selectable>
                  Secure session
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Ionicons name="flash" size={15} color={colors.warning} />
                <Text style={{ color: "#E2E8F0", fontSize: 12 }} selectable>
                  Fast sync
                </Text>
              </View>
            </View>
          </View>
        </PremiumCard>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(420).delay(80)}>
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
                  backgroundColor: colors.card,
                }}
              />
            </View>

            <View style={{ gap: 8 }}>
              <Text style={{ color: colors.mutedForeground, fontWeight: "700", fontSize: 12 }} selectable>
                Password
              </Text>
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.borderSoft,
                  borderRadius: radius.md,
                  paddingHorizontal: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                }}
              >
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, paddingVertical: 12, fontSize: 15 }}
                />
                <Pressable onPress={() => setShowPassword((prev) => !prev)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>
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
                View onboarding again
              </Text>
            </Pressable>
          </View>
        </PremiumCard>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(440).delay(120)}>
        <PremiumCard soft>
          <Text style={{ color: colors.secondaryForeground, fontSize: 15, fontWeight: "800" }} selectable>
            Why residents love this app
          </Text>
          <View style={{ gap: 8, marginTop: 10 }}>
            {benefits.map((item) => (
              <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={{ color: colors.foreground, fontSize: 13 }} selectable>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </PremiumCard>
      </Animated.View>

      <Text style={{ color: colors.mutedForeground, fontSize: 11, textAlign: "center" }} selectable>
        API: {getApiBaseUrl()}
      </Text>
    </ScreenContainer>
  );
}
