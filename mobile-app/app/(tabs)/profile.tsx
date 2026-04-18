import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/src/components/screen-container";
import { PrimaryButton } from "@/src/components/primary-button";
import { colors, radius } from "@/src/theme/colors";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.xl,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 20,
          gap: 14,
        }}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: colors.secondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person-outline" size={34} color={colors.primary} />
        </View>
        <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "800" }} selectable>
          Rahul Sharma
        </Text>
        <Text style={{ color: colors.mutedForeground }} selectable>
          Flat A-302 • Green Valley Society
        </Text>
      </View>

      <View
        style={{
          backgroundColor: colors.card,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
          gap: 8,
        }}
      >
        <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
          Phone
        </Text>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700" }} selectable>
          +91 98XXXXXX12
        </Text>
      </View>

      <PrimaryButton
        label="Log Out"
        variant="secondary"
        onPress={() => router.replace("/login")}
        icon={<Ionicons name="log-out-outline" size={18} color={colors.secondaryForeground} />}
      />
    </ScreenContainer>
  );
}
