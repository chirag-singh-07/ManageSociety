import type { ReactNode } from "react";
import { View } from "react-native";
import { colors, radius } from "@/src/theme/colors";

type PremiumCardProps = {
  children: ReactNode;
  soft?: boolean;
  padded?: boolean;
};

export function PremiumCard({ children, soft = false, padded = true }: PremiumCardProps) {
  return (
    <View
      style={{
        backgroundColor: soft ? colors.backgroundSoft : colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: soft ? colors.borderSoft : colors.border,
        padding: padded ? 16 : 0,
        boxShadow: "0 8px 20px rgba(24, 39, 75, 0.06)",
      }}
    >
      {children}
    </View>
  );
}
