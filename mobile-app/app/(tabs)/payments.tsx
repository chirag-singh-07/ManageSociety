import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { ScreenContainer } from "@/src/components/screen-container";
import { PremiumCard } from "@/src/components/premium-card";
import { colors, radius } from "@/src/theme/colors";
import { formatINR } from "@/src/lib/format";
import { getMaintenanceBills, type MaintenanceBill } from "@/src/api/client";

export default function PaymentsScreen() {
  const [bills, setBills] = useState<MaintenanceBill[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMaintenanceBills();
      setBills(res.bills ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [loadBills]),
  );

  const dueAmount = bills.reduce((sum, bill) => sum + Math.max(0, bill.totalAmount - bill.paidAmount), 0);

  return (
    <ScreenContainer>
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
          <Text style={{ color: colors.primaryForeground, fontSize: 28, fontWeight: "800" }} selectable>
            {loading ? "..." : formatINR(dueAmount)}
          </Text>
          <Text style={{ color: "#CBD5E1", lineHeight: 22 }} selectable>
            Live data from backend maintenance bills.
          </Text>
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
        bills.map((bill) => (
          <PremiumCard key={bill._id}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ gap: 6 }}>
                <Text style={{ color: colors.foreground, fontWeight: "800", fontSize: 16 }} selectable>
                  {bill.period}
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
                  backgroundColor: bill.status === "paid" ? "#E8FFF2" : "#FFF8E6",
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Ionicons
                  name={bill.status === "paid" ? "checkmark-circle" : "time"}
                  size={14}
                  color={bill.status === "paid" ? colors.success : colors.warning}
                />
                <Text
                  style={{
                    color: bill.status === "paid" ? colors.success : colors.warning,
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                  selectable
                >
                  {bill.status.toUpperCase()}
                </Text>
              </View>
            </View>
          </PremiumCard>
        ))
      )}
    </ScreenContainer>
  );
}
