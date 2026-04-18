import { Text, View } from "react-native";
import { ScreenContainer } from "@/src/components/screen-container";
import { colors, radius } from "@/src/theme/colors";

const bills = [
  { month: "April 2026", amount: 3200, status: "Unpaid" },
  { month: "March 2026", amount: 3200, status: "Paid" },
  { month: "February 2026", amount: 3200, status: "Paid" },
];

export default function PaymentsScreen() {
  return (
    <ScreenContainer>
      <View
        style={{
          backgroundColor: colors.secondary,
          borderRadius: radius.xl,
          padding: 20,
          gap: 8,
        }}
      >
        <Text style={{ color: colors.secondaryForeground, fontSize: 13, fontWeight: "700" }} selectable>
          Maintenance
        </Text>
        <Text style={{ color: colors.foreground, fontSize: 28, fontWeight: "800" }} selectable>
          ₹3,200 Due
        </Text>
        <Text style={{ color: colors.mutedForeground, lineHeight: 22 }} selectable>
          Pay before 10 May 2026 to avoid late fee.
        </Text>
      </View>

      {bills.map((bill) => (
        <View
          key={bill.month}
          style={{
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: colors.border,
            padding: 16,
            gap: 6,
          }}
        >
          <Text style={{ color: colors.foreground, fontWeight: "700", fontSize: 16 }} selectable>
            {bill.month}
          </Text>
          <Text style={{ color: colors.mutedForeground }} selectable>
            ₹{bill.amount.toLocaleString("en-IN")}
          </Text>
          <Text
            style={{
              color: bill.status === "Paid" ? colors.success : colors.warning,
              fontWeight: "700",
              fontSize: 13,
            }}
            selectable
          >
            {bill.status}
          </Text>
        </View>
      ))}
    </ScreenContainer>
  );
}
