import { Pressable } from "react-native";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedTabBarButton({ onPress, onLongPress, accessibilityState, style, children }: BottomTabBarButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      accessibilityState={accessibilityState}
      style={[style, animatedStyle]}
      onPressIn={() => {
        scale.value = withTiming(0.95, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withTiming(1, { duration: 140 });
      }}
      onPress={(event) => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress?.(event);
      }}
      onLongPress={onLongPress}
    >
      {children}
    </AnimatedPressable>
  );
}
