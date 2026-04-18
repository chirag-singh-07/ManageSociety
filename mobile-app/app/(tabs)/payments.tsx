import { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { colors, radius } from "@/src/theme/colors";
import { formatINR } from "@/src/lib/format";
import { getMaintenanceBills, type MaintenanceBill } from "@/src/api/client";
import { loadCachedResource, saveCachedResource } from "@/src/lib/offline-store";

const CACHE_KEY = "maintenance_bills";

export default function PaymentsScreen() {
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usingCache, setUsingCache] = useState(false);

  const loadBills = useCallback(async (isPullRefresh = false) => {
    try {
      if (isPullRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await getMaintenanceBills();
      const next = res.bills ?? [];
      setBills(next);
      setUsingCache(false);
      await saveCachedResource(CACHE_KEY, next);
    } catch {
      const cached = await loadCachedResource<MaintenanceBill[]>(CACHE_KEY);
      if (cached) {
        setBills(cached.data);
        setUsingCache(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [loadBills]),
  );

  const dueAmount = useMemo(
    () => bills.reduce((sum, bill) => sum + Math.max(0, bill.totalAmount - bill.paidAmount), 0),
    [bills],
  );

  const summary = useMemo(() => {
    const paid = bills.filter((bill) => bill.status === "paid").length;
    const overdue = bills.filter((bill) => bill.status === "overdue").length;
    const unpaid = bills.filter((bill) => bill.status === "unpaid" || bill.status === "partial").length;
    const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const paidAmount = bills.reduce((sum, bill) => sum + Math.min(bill.totalAmount, bill.paidAmount), 0);
    const progress = totalAmount > 0 ? Math.min(1, paidAmount / totalAmount) : 0;
    return { paid, overdue, unpaid, totalAmount, paidAmount, progress };
  }, [bills]);

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => loadBills(true)}>
      {usingCache && (
        <Text style={{ color: colors.warning, fontWeight: "600", fontSize: 12 }} selectable>
          Showing cached bills. Pull to refresh when online.
        </Text>
      )}

      <PremiumCard padded={false}>
        <View
          style={{
            backgroundColor: colors.black,
            borderRadius: radius.xl,
            padding: 20,
            gap: 8,
          }}
        >
          <Text style={{ color: "#A5B4FC", fontSize: 13, fontWeight: "700" }} selectable>
            Maintenance Due
          </Text>
          <Text style={{ color: colors.primaryForeground, fontSize: 28, fontWeight: "800", fontVariant: ["tabular-nums"] }} selectable>
            {loading ? "..." : formatINR(dueAmount)}
          </Text>
          <Text style={{ color: "#CBD5E1", lineHeight: 22 }} selectable>
            Keep dues clear and avoid late fees.
          </Text>
        </View>
      </PremiumCard>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700" }} selectable>
              Paid
            </Text>
            <Text style={{ color: colors.success, fontWeight: "800", fontSize: 20 }} selectable>
              {summary.paid}
            </Text>
          </PremiumCard>
        </View>
        <View style={{ flex: 1 }}>
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700" }} selectable>
              Pending
            </Text>
            <Text style={{ color: colors.warning, fontWeight: "800", fontSize: 20 }} selectable>
              {summary.unpaid}
            </Text>
          </PremiumCard>
        </View>
        <View style={{ flex: 1 }}>
          <PremiumCard>
            <Text style={{ color: colors.mutedForeground, fontSize: 11, fontWeight: "700" }} selectable>
              Overdue
            </Text>
            <Text style={{ color: colors.destructive, fontWeight: "800", fontSize: 20 }} selectable>
              {summary.overdue}
            </Text>
          </PremiumCard>
        </View>
      </View>

      <PremiumCard soft>
        <Text style={{ color: colors.secondaryForeground, fontWeight: "800", fontSize: 16 }} selectable>
          Collection Progress
        </Text>
        <Text style={{ color: colors.mutedForeground, marginTop: 4 }} selectable>
          {Math.round(summary.progress * 100)}% of billed amount is paid.
        </Text>
        <View style={{ marginTop: 10, height: 10, borderRadius: 999, backgroundColor: "#E5ECFF", overflow: "hidden" }}>
          <View style={{ width: `${Math.round(summary.progress * 100)}%`, height: "100%", backgroundColor: colors.primary }} />
        </View>
      </PremiumCard>

      {loading ? (
        <Text style={{ color: colors.mutedForeground }} selectable>
          Loading bills...
        </Text>
      ) : bills.length === 0 ? (
        <PremiumCard>
          <Text style={{ color: colors.mutedForeground }} selectable>
            No bills found for your account yet.
          </Text>
        </PremiumCard>
      ) : (
        bills.map((bill, index) => {
          const dueForBill = Math.max(0, bill.totalAmount - bill.paidAmount);

          return (
            <PremiumCard key={bill._id} enteringDelay={index * 50}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ gap: 5 }}>
                  <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }} selectable>
                    {bill.period}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 12 }} selectable>
                    Due date: {new Date(bill.dueDate).toLocaleDateString("en-IN")}
                  </Text>
                  <Text style={{ color: colors.mutedForeground }} selectable>
                    Total: {formatINR(bill.totalAmount)}
                  </Text>
                  <Text style={{ color: colors.mutedForeground }} selectable>
                    Paid: {formatINR(bill.paidAmount)}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: bill.status === "paid" ? "#E8FFF2" : bill.status === "overdue" ? "#FFECEC" : "#FFF8E6",
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Ionicons
                    name={bill.status === "paid" ? "checkmark-circle" : bill.status === "overdue" ? "alert-circle" : "time"}
                    size={14}
                    color={bill.status === "paid" ? colors.success : bill.status === "overdue" ? colors.destructive : colors.warning}
                  />
                  <Text
                    style={{
                      color: bill.status === "paid" ? colors.success : bill.status === "overdue" ? colors.destructive : colors.warning,
                      fontWeight: "700",
                      fontSize: 12,
                    }}
                    selectable
                  >
                    {bill.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {dueForBill > 0 && (
                <Text style={{ marginTop: 8, color: colors.warning, fontWeight: "700" }} selectable>
                  Due now: {formatINR(dueForBill)}
                </Text>
              )}
            </PremiumCard>
          );
        })
      )}
    </ScreenContainer>
  );
}
