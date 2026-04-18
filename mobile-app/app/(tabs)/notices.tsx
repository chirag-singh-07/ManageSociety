import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { colors } from "@/src/theme/colors";
import { getNotices, type Notice } from "@/src/api/client";

export default function NoticesScreen() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotices();
      setNotices(res.notices ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotices();
    }, [loadNotices]),
  );

  return (
    <ScreenContainer>
      {loading ? (
        <Text style={{ color: colors.mutedForeground }} selectable>
          Loading notices...
        </Text>
      ) : notices.length === 0 ? (
        <PremiumCard>
          <Text style={{ color: colors.mutedForeground }} selectable>
            No notices available.
          </Text>
        </PremiumCard>
      ) : (
        notices.map((notice) => (
          <PremiumCard key={notice._id}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: colors.secondary,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="megaphone" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }} selectable>
                  {notice.title}
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
                  {notice.publishedAt ? new Date(notice.publishedAt).toLocaleDateString("en-IN") : "Draft"}
                </Text>
              </View>
            </View>

            <Text style={{ color: colors.foreground, lineHeight: 22, marginTop: 10 }} selectable>
              {notice.body}
            </Text>
          </PremiumCard>
        ))
      )}
    </ScreenContainer>
  );
}
