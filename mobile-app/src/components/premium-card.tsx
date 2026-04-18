import type { ReactNode } from "react";
import Animated, { FadeInUp } from "react-native-reanimated";
import { colors, radius } from "@/src/theme/colors";

type PremiumCardProps = {
  children: ReactNode;
  soft?: boolean;
  padded?: boolean;
  animated?: boolean;
  enteringDelay?: number;
};

export function PremiumCard({
  children,
  soft = false,
  padded = true,
  animated = true,
  enteringDelay = 0,
}: PremiumCardProps) {
  return (
    <Animated.View
      entering={animated ? FadeInUp.duration(360).delay(enteringDelay) : undefined}
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
    </Animated.View>
  );
}
