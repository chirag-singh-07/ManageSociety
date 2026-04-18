import { useEffect } from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { colors, radius } from "@/src/theme/colors";

export function AppLoadingScreen() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.04, { duration: 700 }), withTiming(1, { duration: 700 })),
      -1,
      false,
    );
  }, [scale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundSoft,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -80,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: 120,
          backgroundColor: "#DCE8FF",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -100,
          left: -60,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: "#EAF2FF",
        }}
      />

      <Animated.View
        entering={FadeIn.duration(280)}
        style={[
          {
            width: 96,
            height: 96,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.primary,
            boxShadow: "0 16px 34px rgba(28, 77, 187, 0.28)",
          },
          pulseStyle,
        ]}
      >
        <Ionicons name="business" size={42} color={colors.primaryForeground} />
      </Animated.View>

      <Text
        style={{ color: colors.foreground, fontSize: 22, fontWeight: "800", marginTop: 18 }}
        selectable
      >
        ManageSociety
      </Text>
      <Text
        style={{ color: colors.mutedForeground, marginTop: 6, textAlign: "center", lineHeight: 21 }}
        selectable
      >
        Preparing your dashboard and syncing live society updates...
      </Text>

      <View
        style={{
          marginTop: 20,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: colors.borderSoft,
          backgroundColor: colors.card,
        }}
      >
        <Text style={{ color: colors.secondaryForeground, fontWeight: "700", fontSize: 12 }} selectable>
          Secure Login + Offline Queue Enabled
        </Text>
      </View>
    </View>
  );
}
