import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { colors, radius } from "@/src/theme/colors";

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
}: PrimaryButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        borderRadius: radius.lg,
        paddingVertical: 14,
        paddingHorizontal: 18,
        backgroundColor: isPrimary ? colors.primary : colors.secondary,
        opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {icon}
        <Text
          style={{
            color: isPrimary ? colors.primaryForeground : colors.secondaryForeground,
            fontWeight: "700",
            fontSize: 15,
          }}
          selectable
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
