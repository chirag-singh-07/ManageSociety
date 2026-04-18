import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/src/components/screen-container";
import { colors, radius } from "@/src/theme/colors";

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <View
        style={{
          backgroundColor: colors.primary,
          borderRadius: radius.xl,
          padding: 20,
          gap: 8,
        }}
      >
        <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: "700" }} selectable>
          Welcome
        </Text>
        <Text style={{ color: colors.primaryForeground, fontSize: 24, fontWeight: "800" }} selectable>
          Green Valley Society
        </Text>
        <Text style={{ color: "#E8EEFF", fontSize: 14, lineHeight: 22 }} selectable>
          Your monthly status at a glance.
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: 16,
            gap: 6,
          }}
        >
          <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
            Due This Month
          </Text>
          <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "800" }} selectable>
            ₹3,200
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.lg,
            padding: 16,
            gap: 6,
          }}
        >
          <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
            Open Complaints
          </Text>
          <Text style={{ color: colors.foreground, fontSize: 24, fontWeight: "800" }} selectable>
            2
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: colors.secondary,
          borderRadius: radius.lg,
          padding: 16,
          gap: 10,
        }}
      >
        <Text style={{ color: colors.secondaryForeground, fontSize: 16, fontWeight: "800" }} selectable>
          Recent Notice
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Ionicons name="megaphone-outline" size={20} color={colors.primary} />
          <Text style={{ flex: 1, color: colors.foreground, lineHeight: 21 }} selectable>
            Water tank cleaning will happen on Sunday between 10 AM and 1 PM.
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
