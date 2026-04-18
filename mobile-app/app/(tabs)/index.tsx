import { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { colors, radius } from "@/src/theme/colors";
import { formatINR } from "@/src/lib/format";
import { getComplaints, getMaintenanceBills, getNotices } from "@/src/api/client";
import { useAuth } from "@/src/auth/auth-context";
import { loadCachedResource, saveCachedResource } from "@/src/lib/offline-store";

const quickActions = [
  { icon: "wallet-outline", label: "Pay Due", subtitle: "Track monthly dues" },
  { icon: "chatbubble-ellipses-outline", label: "Create Complaint", subtitle: "Raise issue quickly" },
  { icon: "megaphone-outline", label: "Read Notices", subtitle: "Stay updated" },
  { icon: "settings-outline", label: "Account", subtitle: "Manage settings" },
] as const;

const HOME_CACHE_KEY = "home_dashboard";

type HomeSnapshot = {
  dueAmount: number;
  openComplaints: number;
  latestNotice: string;
  noticesCount: number;
  totalBillAmount: number;
  totalPaidAmount: number;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingCache, setUsingCache] = useState(false);
  const [dueAmount, setDueAmount] = useState(0);
  const [openComplaints, setOpenComplaints] = useState(0);
  const [latestNotice, setLatestNotice] = useState<string>("No notices yet");
  const [noticesCount, setNoticesCount] = useState(0);
  const [totalBillAmount, setTotalBillAmount] = useState(0);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);

  const applySnapshot = (snapshot: HomeSnapshot) => {
    setDueAmount(snapshot.dueAmount);
    setOpenComplaints(snapshot.openComplaints);
    setLatestNotice(snapshot.latestNotice);
    setNoticesCount(snapshot.noticesCount);
    setTotalBillAmount(snapshot.totalBillAmount);
    setTotalPaidAmount(snapshot.totalPaidAmount);
  };

  const loadData = useCallback(async (isPullRefresh = false) => {
    try {
      if (isPullRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [complaintsRes, noticesRes, billsRes] = await Promise.all([
        getComplaints(),
        getNotices(),
        getMaintenanceBills(),
      ]);

      const complaints = complaintsRes.complaints ?? [];
      const bills = billsRes.bills ?? [];
      const notices = noticesRes.notices ?? [];

      const open = complaints.filter((c) => c.status === "open" || c.status === "in_progress").length;
      const due = bills.reduce((sum, bill) => sum + Math.max(0, bill.totalAmount - bill.paidAmount), 0);
      const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const paidAmount = bills.reduce((sum, bill) => sum + Math.min(bill.totalAmount, bill.paidAmount), 0);

      const topNotice = notices[0];
      const snapshot: HomeSnapshot = {
        openComplaints: open,
        dueAmount: due,
        latestNotice: topNotice ? topNotice.body : "No notices yet",
        noticesCount: notices.length,
        totalBillAmount: totalAmount,
        totalPaidAmount: paidAmount,
      };

      applySnapshot(snapshot);
      setUsingCache(false);
      await saveCachedResource(HOME_CACHE_KEY, snapshot);
    } catch {
      const cached = await loadCachedResource<HomeSnapshot>(HOME_CACHE_KEY);
      if (cached) {
        applySnapshot(cached.data);
        setUsingCache(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const displayName = useMemo(() => user?.name ?? "Resident", [user?.name]);
  const paymentProgress = useMemo(() => {
    if (totalBillAmount <= 0) return 0;
    return Math.max(0, Math.min(1, totalPaidAmount / totalBillAmount));
  }, [totalBillAmount, totalPaidAmount]);

  const today = useMemo(
    () => new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    [],
  );

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => loadData(true)}>
      {usingCache && (
        <Text style={{ color: colors.warning, fontWeight: "600", fontSize: 12 }} selectable>
          Showing cached data. Pull to refresh when back online.
        </Text>
      )}

      <PremiumCard padded={false}>
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: radius.xl,
            padding: 20,
            gap: 10,
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
            Dashboard � {today}
          </Text>
          <Text style={{ color: colors.primaryForeground, fontSize: 26, fontWeight: "800" }} selectable>
            Hello, {displayName}
          </Text>
          <Text style={{ color: "#E8EEFF", fontSize: 14, lineHeight: 22 }} selectable>
            Complete view of payments, complaints, and notices in one place.
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 2 }}>
            <View style={{ backgroundColor: "rgba(255,255,255,0.16)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}>
              <Text style={{ color: colors.primaryForeground, fontWeight: "700", fontSize: 12 }} selectable>
                Live Sync
              </Text>
            </View>
            <View style={{ backgroundColor: "rgba(255,255,255,0.16)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}>
              <Text style={{ color: colors.primaryForeground, fontWeight: "700", fontSize: 12 }} selectable>
                Offline Ready
              </Text>
            </View>
          </View>
        </View>
      </PremiumCard>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
              Due Amount
            </Text>
            <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }} selectable>
              {loading ? "..." : formatINR(dueAmount)}
            </Text>
          </PremiumCard>
        </View>
        <View style={{ flex: 1 }}>
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
              Open Complaints
            </Text>
            <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }} selectable>
              {loading ? "..." : openComplaints}
            </Text>
          </PremiumCard>
        </View>
        <View style={{ flex: 1 }}>
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, fontWeight: "700" }} selectable>
              Notices
            </Text>
            <Text style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] }} selectable>
              {loading ? "..." : noticesCount}
            </Text>
          </PremiumCard>
        </View>
      </View>

      <PremiumCard soft>
        <Text style={{ color: colors.secondaryForeground, fontSize: 16, fontWeight: "800" }} selectable>
          Payment Health
        </Text>
        <Text style={{ color: colors.mutedForeground, marginTop: 4 }} selectable>
          {loading ? "Calculating..." : `${Math.round(paymentProgress * 100)}% of billed amount is paid.`}
        </Text>
        <View
          style={{
            marginTop: 10,
            height: 10,
            borderRadius: 999,
            backgroundColor: "#E5ECFF",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${Math.round(paymentProgress * 100)}%`,
              height: "100%",
              borderRadius: 999,
              backgroundColor: colors.primary,
            }}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
            Paid: {formatINR(totalPaidAmount)}
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
            Total: {formatINR(totalBillAmount)}
          </Text>
        </View>
      </PremiumCard>

      <PremiumCard soft>
        <Text style={{ color: colors.secondaryForeground, fontSize: 16, fontWeight: "800" }} selectable>
          Quick Actions
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              style={{
                width: "48%",
                backgroundColor: colors.card,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: colors.borderSoft,
                padding: 12,
                gap: 6,
              }}
            >
              <Ionicons name={action.icon} size={18} color={colors.primary} />
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }} selectable>
                {action.label}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 11 }} selectable>
                {action.subtitle}
              </Text>
            </Pressable>
          ))}
        </View>
      </PremiumCard>

      <PremiumCard soft>
        <Text style={{ color: colors.secondaryForeground, fontSize: 16, fontWeight: "800" }} selectable>
          Latest Announcement
        </Text>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 }}>
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              backgroundColor: colors.card,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: colors.borderSoft,
            }}
          >
            <Ionicons name="megaphone" size={16} color={colors.primary} />
          </View>
          <Text style={{ flex: 1, color: colors.foreground, lineHeight: 21 }} selectable>
            {latestNotice}
          </Text>
        </View>
      </PremiumCard>
    </ScreenContainer>
  );
}
