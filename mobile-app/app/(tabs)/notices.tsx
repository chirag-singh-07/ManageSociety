import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ScreenContainer } from "@/src/components/screen-container";
import { colors, radius } from "@/src/theme/colors";

const notices = [
  { title: "Lift Maintenance", date: "18 Apr 2026", body: "Tower B lift will be under maintenance from 2 PM to 5 PM." },
  { title: "Festival Meeting", date: "16 Apr 2026", body: "Residents' meeting at clubhouse on Saturday 6 PM." },
  { title: "Parking Update", date: "13 Apr 2026", body: "Visitor parking area has been shifted to Block C." },
];

export default function NoticesScreen() {
  return (
    <ScreenContainer>
      {notices.map((notice) => (
        <View
          key={notice.title}
          style={{
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 10,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 12,
                backgroundColor: colors.secondary,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="megaphone-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }} selectable>
                {notice.title}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
                {notice.date}
              </Text>
            </View>
          </View>
          <Text style={{ color: colors.foreground, lineHeight: 22 }} selectable>
            {notice.body}
          </Text>
        </View>
      ))}
    </ScreenContainer>
  );
}
