import { useMemo, useRef, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp, LinearTransition } from "react-native-reanimated";
import { PrimaryButton } from "@/src/components/primary-button";
import { colors, radius } from "@/src/theme/colors";
import { PremiumCard } from "@/src/components/premium-card";
import { useAuth } from "@/src/auth/auth-context";

const slides = [
  {
    icon: "business" as const,
    title: "Everything In One Place",
    subtitle: "Manage notices, maintenance, and complaint updates from one clean dashboard.",
    bullets: ["Fast monthly overview", "Simple complaint tracking", "Instant society alerts"],
  },
  {
    icon: "wallet" as const,
    title: "Crystal-Clear Payments",
    subtitle: "Track due amounts, paid history, and overdue reminders without confusion.",
    bullets: ["Live due summary", "Month-by-month breakdown", "Payment status visibility"],
  },
  {
    icon: "chatbubbles" as const,
    title: "Stay Connected",
    subtitle: "Raise issues, add comments, and follow resolution progress from your phone.",
    bullets: ["Comment timeline", "Photo attachments", "Offline-safe submissions"],
  },
];

const stats = [
  { label: "Resident-first UX", value: "Modern" },
  { label: "Complaint updates", value: "Live" },
  { label: "Payment clarity", value: "High" },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = useMemo(() => slides[activeIndex], [activeIndex]);

  if (isAuthenticated) {
    return <Redirect href={"/(tabs)" as any} />;
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
          position: "absolute",
          top: -80,
          right: -70,
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
          borderRadius: 130,
          backgroundColor: "#EAF2FF",
        }}
      />

      <Animated.View
        entering={FadeInDown.duration(420)}
        style={{
          paddingTop: 64,
          paddingHorizontal: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontSize: 21, fontWeight: "800", color: colors.foreground }} selectable>
            ManageSociety
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }} selectable>
            Smarter living for your community
          </Text>
        </View>
        <Pressable onPress={() => router.replace("/login")}>
          <Text style={{ color: colors.primary, fontWeight: "700" }} selectable>
            Skip
          </Text>
        </Pressable>
      </Animated.View>

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
        {slides.map((slide, index) => (
          <Animated.View
            entering={FadeInUp.duration(420).delay(90 + index * 80)}
            key={slide.title}
            style={{ width, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 12, gap: 14 }}
          >
            <PremiumCard padded={false}>
              <View
                style={{
                  borderRadius: radius.xl,
                  padding: 22,
                  minHeight: 398,
                  gap: 16,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    width: 66,
                    height: 66,
                    borderRadius: 18,
                    backgroundColor: colors.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 22px rgba(33, 90, 215, 0.3)",
                  }}
                >
                  <Ionicons name={slide.icon} size={30} color={colors.primaryForeground} />
                </View>

                <Text style={{ fontSize: 30, lineHeight: 36, fontWeight: "800", color: colors.foreground }} selectable>
                  {slide.title}
                </Text>
                <Text style={{ fontSize: 16, lineHeight: 24, color: colors.mutedForeground }} selectable>
                  {slide.subtitle}
                </Text>

                <View style={{ gap: 9, marginTop: 4 }}>
                  {slide.bullets.map((item) => (
                    <View key={item} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={{ color: colors.foreground, fontWeight: "600" }} selectable>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </PremiumCard>

            <View style={{ flexDirection: "row", gap: 8 }}>
              {stats.map((item) => (
                <PremiumCard key={item.label} soft>
                  <Text style={{ color: colors.secondaryForeground, fontSize: 13, fontWeight: "800" }} selectable>
                    {item.value}
                  </Text>
                  <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: 4 }} selectable>
                    {item.label}
                  </Text>
                </PremiumCard>
              ))}
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      <Animated.View entering={FadeInDown.duration(460).delay(180)} style={{ paddingHorizontal: 20, paddingBottom: 30, gap: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8 }}>
          {slides.map((slide, index) => (
            <Animated.View
              layout={LinearTransition.duration(220)}
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
          label={activeIndex === slides.length - 1 ? "Continue To Login" : "Next"}
          onPress={goNext}
          icon={
            <Ionicons
              name={activeIndex === slides.length - 1 ? "arrow-forward-circle-outline" : "arrow-forward"}
              size={18}
              color={colors.primaryForeground}
            />
          }
        />

        <Text style={{ color: colors.mutedForeground, textAlign: "center", fontSize: 12 }} selectable>
          {activeSlide.title}
        </Text>
      </Animated.View>
    </View>
  );
}
