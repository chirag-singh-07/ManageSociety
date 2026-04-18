import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { colors } from "@/src/theme/colors";

type ScreenContainerProps = {
  children: ReactNode;
};

export function ScreenContainer({ children }: ScreenContainerProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: 16 }}>{children}</View>
    </ScrollView>
  );
}
