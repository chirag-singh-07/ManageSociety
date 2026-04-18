import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { colors, radius } from "@/src/theme/colors";
import { formatINR } from "@/src/lib/format";
import { getComplaints, getMaintenanceBills, getNotices } from "@/src/api/client";
import { useAuth } from "@/src/auth/auth-context";

const quickActions = [
  { icon: "wallet-outline", label: "Pay Due" },
  { icon: "chatbubble-ellipses-outline", label: "Complaint" },
  { icon: "megaphone-outline", label: "Notice" },
  { icon: "call-outline", label: "Support" },
] as const;

export default function HomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dueAmount, setDueAmount] = useState(0);
  const [openComplaints, setOpenComplaints] = useState(0);
  const [latestNotice, setLatestNotice] = useState<string>("No notices yet");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [complaintsRes, noticesRes, billsRes] = await Promise.all([
        getComplaints(),
        getNotices(),
        getMaintenanceBills(),
      ]);

      const open = (complaintsRes.complaints ?? []).filter((c) => c.status === "open" || c.status === "in_progress").length;
      setOpenComplaints(open);

      const due = (billsRes.bills ?? []).reduce((sum, bill) => sum + Math.max(0, bill.totalAmount - bill.paidAmount), 0);
      setDueAmount(due);

      const topNotice = noticesRes.notices?.[0];
      setLatestNotice(topNotice ? topNotice.body : "No notices yet");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const displayName = useMemo(() => user?.name ?? "Resident", [user?.name]);

  return (
    <ScreenContainer>
      <PremiumCard padded={false}>
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius.xl,
            padding: 20,
            gap: 8,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              right: -18,
              top: -18,
              width: 110,
              height: 110,
              borderRadius: 90,
              backgroundColor: "rgba(255,255,255,0.18)",
            }}
          />
          <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: "700" }} selectable>
            Welcome
          </Text>
          <Text style={{ color: colors.primaryForeground, fontSize: 24, fontWeight: "800" }} selectable>
            {displayName}
          </Text>
          <Text style={{ color: "#E8EEFF", fontSize: 14, lineHeight: 22 }} selectable>
            Your monthly status at a glance.
          </Text>
          <Image
            source={require("@/assets/images/splash-icon.png")}
            contentFit="contain"
            style={{ width: "100%", height: 72, marginTop: 4 }}
          />
        </View>
      </PremiumCard>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
              Due This Month
            </Text>
            <Text
              style={{ color: colors.foreground, fontSize: 24, fontWeight: "800", fontVariant: ["tabular-nums"] }}
              selectable
            >
              {loading ? "..." : formatINR(dueAmount)}
            </Text>
          </PremiumCard>
        </View>
        <View style={{ flex: 1 }}>
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
              Open Complaints
            </Text>
            <Text
              style={{ color: colors.foreground, fontSize: 24, fontWeight: "800", fontVariant: ["tabular-nums"] }}
              selectable
            >
              {loading ? "..." : openComplaints}
            </Text>
          </PremiumCard>
        </View>
      </View>

      <PremiumCard soft>
        <Text style={{ color: colors.secondaryForeground, fontSize: 16, fontWeight: "800" }} selectable>
          Quick Actions
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {quickActions.map((action) => (
            <View
              key={action.label}
              style={{
                width: "47%",
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                paddingVertical: 10,
                alignItems: "center",
                gap: 6,
              }}
            >
              <Ionicons name={action.icon} size={18} color={colors.primary} />
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }} selectable>
                {action.label}
              </Text>
            </View>
          ))}
        </View>
      </PremiumCard>

      <PremiumCard soft>
        <Text style={{ color: colors.secondaryForeground, fontSize: 16, fontWeight: "800" }} selectable>
          Recent Notice
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
          <Ionicons name="megaphone" size={20} color={colors.primary} />
          <Text style={{ flex: 1, color: colors.foreground, lineHeight: 21 }} selectable>
            {latestNotice}
          </Text>
        </View>
      </PremiumCard>
    </ScreenContainer>
  );
}
