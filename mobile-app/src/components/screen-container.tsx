import type { ReactNode } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { colors } from "@/src/theme/colors";

type ScreenContainerProps = {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
};

export function ScreenContainer({ children, refreshing = false, onRefresh }: ScreenContainerProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.backgroundSoft }}
      contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
    >
      <View style={{ gap: 16 }}>{children}</View>
    </ScrollView>
  );
}
