import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { ScreenContainer } from "@/src/components/screen-container";
import { PrimaryButton } from "@/src/components/primary-button";
import { PremiumCard } from "@/src/components/premium-card";
import { colors, radius } from "@/src/theme/colors";
import { useAuth } from "@/src/auth/auth-context";

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <PremiumCard padded={false}>
        <View
          style={{
            borderRadius: radius.xl,
            backgroundColor: colors.primary,
            padding: 20,
            gap: 14,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              right: -16,
              bottom: -16,
              width: 90,
              height: 90,
              borderRadius: 99,
              backgroundColor: "rgba(255,255,255,0.16)",
            }}
          />
          <View
            style={{
              width: 74,
              height: 74,
              borderRadius: 24,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={require("@/assets/images/icon.png")}
              contentFit="cover"
              style={{ width: 52, height: 52, borderRadius: 18 }}
            />
          </View>
          <Text style={{ color: colors.primaryForeground, fontSize: 24, fontWeight: "800" }} selectable>
            {user?.name ?? "Member"}
          </Text>
          <Text style={{ color: "#E3EEFF" }} selectable>
            {user?.flatNumber ? `Flat ${user.flatNumber}` : "No flat mapped"}
          </Text>
        </View>
      </PremiumCard>

      <PremiumCard>
        <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
          Phone
        </Text>
        <Text style={{ color: colors.foreground, fontSize: 16, fontWeight: "700", marginTop: 6 }} selectable>
          {user?.phone || "Not available"}
        </Text>
      </PremiumCard>

      <PremiumCard>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
              Email
            </Text>
            <Text style={{ color: colors.foreground, fontWeight: "700" }} selectable>
              {user?.email || "-"}
            </Text>
          </View>
          <View style={{ gap: 6 }}>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
              Role
            </Text>
            <Text style={{ color: colors.foreground, fontWeight: "700" }} selectable>
              {user?.role || "-"}
            </Text>
          </View>
        </View>
      </PremiumCard>

      <PrimaryButton
        label="Log Out"
        variant="secondary"
        onPress={logout}
        icon={<Ionicons name="log-out-outline" size={18} color={colors.secondaryForeground} />}
      />
    </ScreenContainer>
  );
}
