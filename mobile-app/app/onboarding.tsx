import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { PrimaryButton } from "@/src/components/primary-button";
import { colors, radius } from "@/src/theme/colors";
import { PremiumCard } from "@/src/components/premium-card";
import { useAuth } from "@/src/auth/auth-context";

const slides = [
  {
    icon: "business" as const,
    title: "Manage Society In One Place",
    subtitle:
      "Track members, notices, complaints, and maintenance without switching tools.",
  },
  {
    icon: "wallet" as const,
    title: "Track Payments Clearly",
    subtitle:
      "See pending dues, paid amounts, and overdue bills with a clean monthly summary.",
  },
  {
    icon: "notifications" as const,
    title: "Stay Updated Instantly",
    subtitle:
      "Get important announcements and reminders as soon as your society admin posts them.",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  if (isAuthenticated) {
    router.replace("/");
    return null;
  }

  const goNext = () => {
    if (activeIndex === slides.length - 1) {
      router.replace("/login");
      return;
    }
    const nextIndex = activeIndex + 1;
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setActiveIndex(nextIndex);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSoft }}>
      <View
        style={{
          paddingTop: 64,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "800", color: colors.foreground }} selectable>
          ManageSociety
        </Text>
        <Pressable onPress={() => router.replace("/login")}>
          <Text style={{ color: colors.primary, fontWeight: "700" }} selectable>
            Skip
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
      >
        {slides.map((slide) => (
          <View
            key={slide.title}
            style={{ width, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, gap: 18 }}
          >
            <PremiumCard padded={false}>
              <View
                style={{
                  borderRadius: radius.xl,
                  padding: 26,
                  minHeight: 420,
                  gap: 20,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    position: "absolute",
                    top: -32,
                    right: -32,
                    width: 160,
                    height: 160,
                    borderRadius: 99,
                    backgroundColor: "#DCE8FF",
                  }}
                />
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 20,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name={slide.icon} size={34} color={colors.primaryForeground} />
                </View>
                <Image
                  source={require("@/assets/images/splash-icon.png")}
                  contentFit="contain"
                  style={{ width: "100%", height: 120 }}
                />
                <Text
                  style={{ fontSize: 30, lineHeight: 36, fontWeight: "800", color: colors.foreground }}
                  selectable
                >
                  {slide.title}
                </Text>
                <Text
                  style={{ fontSize: 16, lineHeight: 24, color: colors.mutedForeground }}
                  selectable
                >
                  {slide.subtitle}
                </Text>
              </View>
            </PremiumCard>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingBottom: 34, gap: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {slides.map((slide, index) => (
            <View
              key={slide.title}
              style={{
                width: index === activeIndex ? 26 : 8,
                height: 8,
                borderRadius: 8,
                backgroundColor: index === activeIndex ? colors.primary : colors.border,
              }}
            />
          ))}
        </View>

        <PrimaryButton
          label={activeIndex === slides.length - 1 ? "Get Started" : "Next"}
          onPress={goNext}
          icon={
            <Ionicons
              name={activeIndex === slides.length - 1 ? "checkmark-circle-outline" : "arrow-forward"}
              size={18}
              color={colors.primaryForeground}
            />
          }
        />
      </View>
    </View>
  );
}

