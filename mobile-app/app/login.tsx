import { useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/src/components/screen-container";
import { PrimaryButton } from "@/src/components/primary-button";
import { colors, radius } from "@/src/theme/colors";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const isDisabled = !email.trim() || !password.trim();

  const handleLogin = () => {
    router.replace("/");
  };

  return (
    <ScreenContainer>
      <View
        style={{
          backgroundColor: colors.secondary,
          borderRadius: radius.xl,
          padding: 22,
          gap: 12,
          marginTop: 12,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "800", color: colors.foreground }} selectable>
          Welcome Back
        </Text>
        <Text style={{ color: colors.mutedForeground, fontSize: 15, lineHeight: 22 }} selectable>
          Sign in with your society account to continue.
        </Text>
      </View>

      <View style={{ gap: 14, backgroundColor: colors.card, borderRadius: radius.lg, padding: 18 }}>
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
              borderColor: colors.border,
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
              borderColor: colors.border,
              borderRadius: radius.md,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
            }}
          />
        </View>

        <PrimaryButton
          label="Sign In"
          onPress={handleLogin}
          disabled={isDisabled}
          icon={<Ionicons name="log-in-outline" size={18} color={colors.primaryForeground} />}
        />

        <Pressable onPress={() => router.push("/onboarding")}>
          <Text style={{ color: colors.primary, fontWeight: "700", textAlign: "center" }} selectable>
            Back to onboarding
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
