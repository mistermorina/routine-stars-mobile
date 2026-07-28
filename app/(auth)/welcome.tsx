import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Gift,
  Heart,
  ListChecks,
  Shield,
  Sparkles,
  Star,
} from "@/lib/icons";
import Animated, {
  FadeIn,
  FadeInDown,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette } from "@/lib/theme";
import { KEYS, storage } from "@/lib/storage";
import {
  onboardingJourney,
  onboardingPrinciples,
  type OnboardingIconName,
  type OnboardingJourneyScreen,
} from "@/lib/onboarding-journey";
import onboardingHeroImage from "@/assets/images/onboarding-hero.png";
import routineTrophyImage from "@/assets/images/routine-trophy-soft.png";
import rewardGiftImage from "@/assets/images/reward-star-gift-soft.png";
import parentCheckImage from "@/assets/images/parent-check-soft.png";

const iconMap: Record<OnboardingIconName, typeof Sparkles> = {
  sparkles: Sparkles,
  heart: Heart,
  star: Star,
  listChecks: ListChecks,
  gift: Gift,
  shield: Shield,
  arrowRight: ArrowRight,
};

const visualImageMap = {
  family: onboardingHeroImage,
  calm: parentCheckImage,
  child: onboardingHeroImage,
  routine: routineTrophyImage,
  rewards: rewardGiftImage,
  safety: parentCheckImage,
  ready: routineTrophyImage,
} as const;

function JourneyVisual({
  screen,
  compact,
}: {
  screen: OnboardingJourneyScreen;
  compact: boolean;
}) {
  const palette = getThemePalette("sterne");
  const imageSource = visualImageMap[screen.visual];
  const imageAspectRatio = compact ? 1.16 : 1.34;

  return (
    <View
      className="overflow-hidden rounded-[28px] border"
      style={{ backgroundColor: palette.heroSurface, borderColor: palette.accentBorder }}
    >
      <Image
        source={imageSource}
        style={{ width: "100%", aspectRatio: imageAspectRatio }}
        contentFit="cover"
        transition={180}
        accessibilityLabel={screen.title}
      />

      <View className="px-4 pb-4 pt-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-xs font-body-semibold uppercase text-muted-foreground">
              Sternenmoment
            </Text>
            <Text
              className="mt-1 text-base font-body-semibold leading-6 text-foreground"
              numberOfLines={3}
            >
              {screen.childLine}
            </Text>
          </View>
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <Star size={22} color={palette.chartPrimary} fill={palette.chartPrimary} />
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-2">
          {[0, 1, 2].map((item) => (
            <View
              key={item}
              className="h-2 flex-1 rounded-full"
              style={{
                backgroundColor:
                  item <= onboardingJourney.findIndex((entry) => entry.id === screen.id)
                    ? palette.progress
                    : palette.accentBorder,
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function HighlightRow({
  highlight,
}: {
  highlight: OnboardingJourneyScreen["highlights"][number];
}) {
  const palette = getThemePalette("sterne");
  const Icon = iconMap[highlight.iconName];

  return (
    <View
      className="flex-row items-start rounded-[20px] border px-3.5 py-3.5"
      style={{ backgroundColor: "#FFFFFF", borderColor: palette.accentBorder }}
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: palette.tabActiveBg }}
      >
        <Icon size={18} color={palette.accentStrong} />
      </View>
      <View className="ml-3 min-w-0 flex-1">
        <Text className="text-sm font-body-semibold leading-5 text-foreground">
          {highlight.title}
        </Text>
        <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground">
          {highlight.description}
        </Text>
      </View>
    </View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const palette = getThemePalette("sterne");
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const [screenIndex, setScreenIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const screen = onboardingJourney[screenIndex];
  const isFirstScreen = screenIndex === 0;
  const isLastScreen = screenIndex === onboardingJourney.length - 1;
  const progressValue = ((screenIndex + 1) / onboardingJourney.length) * 100;
  const isCompact = width < 370;

  const enteringAnimation = direction === "forward" ? SlideInRight.duration(250) : SlideInLeft.duration(250);
  const exitingAnimation = direction === "forward" ? SlideOutLeft.duration(210) : SlideOutRight.duration(210);

  const topPrinciples = useMemo(
    () => onboardingPrinciples.slice(0, isCompact ? 3 : 5),
    [isCompact]
  );

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
  };

  const markWelcomeSeen = async () => {
    await storage.setItem(KEYS.HAS_SEEN_WELCOME, true);
  };

  const startSetup = async () => {
    await markWelcomeSeen();
    void triggerFeedback("stars_added");
    router.replace("/(auth)/onboarding");
  };

  const goNext = () => {
    if (isLastScreen) {
      void startSetup();
      return;
    }

    setDirection("forward");
    setScreenIndex((current) => current + 1);
    scrollToTop();
    void triggerFeedback("tab_focus");
  };

  const goBack = () => {
    if (isFirstScreen) {
      return;
    }

    setDirection("backward");
    setScreenIndex((current) => current - 1);
    scrollToTop();
    void triggerFeedback("tab_focus");
  };

  const handleSecondary = () => {
    if (isLastScreen) {
      setDirection("backward");
      setScreenIndex(0);
      scrollToTop();
      return;
    }

    void startSetup();
  };

  return (
    <SafeAreaView className="flex-1">
      <ThemedScreenBackground theme="sterne">
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerClassName="px-4 pb-10 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between gap-3 px-1">
            <Pressable
              onPress={goBack}
              disabled={isFirstScreen}
              className="h-11 min-w-[92px] flex-row items-center rounded-full px-3"
              style={{
                backgroundColor: isFirstScreen ? "transparent" : palette.headerGlass,
                opacity: isFirstScreen ? 0 : 1,
              }}
              accessibilityRole="button"
              accessibilityLabel="Zurück"
            >
              <ChevronLeft size={17} color={palette.accentStrong} />
              <Text className="ml-1 text-sm font-body-semibold" style={{ color: palette.accentStrong }}>
                Zurück
              </Text>
            </Pressable>

            <View
              className="rounded-full px-3 py-1.5"
              style={{ backgroundColor: palette.headerGlass }}
            >
              <Text className="text-xs font-body-semibold uppercase" style={{ color: palette.accentText }}>
                {screen.stepLabel}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                void startSetup();
              }}
              className="h-11 min-w-[92px] items-end justify-center rounded-full px-3"
              accessibilityRole="button"
              accessibilityLabel="Intro überspringen und Setup starten"
            >
              <Text className="text-sm font-body-semibold" style={{ color: palette.accentStrong }}>
                Setup
              </Text>
            </Pressable>
          </View>

          <Animated.View entering={FadeInDown.duration(280)} className="mt-4">
            <View
              className="rounded-[24px] border px-4 py-4"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.tabActiveBg }}
                >
                  <Check size={20} color={palette.accentStrong} strokeWidth={3} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-xs font-body-semibold uppercase text-muted-foreground">
                    Neue Familienreise
                  </Text>
                  <Text className="text-lg font-headline leading-6 text-foreground">
                    Routine Stars
                  </Text>
                </View>
                <Text className="text-sm font-body-semibold" style={{ color: palette.accentStrong }}>
                  {screenIndex + 1}/{onboardingJourney.length}
                </Text>
              </View>

              <Progress
                value={progressValue}
                className="mt-4 h-3 w-full"
                indicatorClassName="bg-[#FFD700]"
                indicatorColor={palette.progress}
              />

              <View className="mt-4 flex-row flex-wrap gap-2">
                {topPrinciples.map((principle) => (
                  <View
                    key={principle}
                    className="rounded-full border px-3 py-1.5"
                    style={{ backgroundColor: palette.heroSurface, borderColor: palette.accentBorder }}
                  >
                    <Text
                      className="text-xs font-body-semibold leading-4"
                      style={{ color: palette.accentText }}
                      numberOfLines={1}
                    >
                      {principle}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>

          <Animated.View
            key={screen.id}
            entering={enteringAnimation}
            exiting={exitingAnimation}
            className="mt-3"
          >
            <View
              className="rounded-[34px] border px-5 pb-5 pt-5"
              style={{ backgroundColor: palette.cardTint, borderColor: palette.accentBorder }}
            >
              <Text className="text-xs font-body-semibold uppercase text-muted-foreground">
                {screen.eyebrow}
              </Text>
              <Text
                className="mt-2 text-[28px] font-headline leading-[34px] text-foreground"
                maxFontSizeMultiplier={1.12}
              >
                {screen.title}
              </Text>
              <Text className="mt-3 text-[15px] font-body leading-6 text-muted-foreground">
                {screen.description}
              </Text>

              <View className="mt-5">
                <JourneyVisual screen={screen} compact={isCompact} />
              </View>

              <View className="mt-5 gap-3">
                {screen.highlights.map((highlight) => (
                  <HighlightRow key={highlight.title} highlight={highlight} />
                ))}
              </View>

              <View className="mt-6 flex-row items-center justify-center gap-2">
                {onboardingJourney.map((item, index) => (
                  <View
                    key={item.id}
                    className="rounded-full"
                    style={{
                      width: index === screenIndex ? 24 : 8,
                      height: 8,
                      backgroundColor:
                        index === screenIndex ? palette.accentStrong : palette.accentBorder,
                    }}
                  />
                ))}
              </View>

              <View className="mt-6 gap-3">
                <Button
                  onPress={goNext}
                  size="lg"
                  className="h-14 w-full rounded-[22px]"
                  style={{ backgroundColor: palette.button }}
                >
                  <View className="flex-row items-center gap-2">
                    {isLastScreen ? (
                      <Star size={18} color="#FFFFFF" fill="#FFFFFF" />
                    ) : null}
                    <Text className="text-base font-body-semibold leading-5 text-white">
                      {screen.primaryCta}
                    </Text>
                    {!isLastScreen ? <ArrowRight size={18} color="#FFFFFF" /> : null}
                  </View>
                </Button>

                <Button
                  variant="outline"
                  onPress={handleSecondary}
                  size="lg"
                  className="h-14 w-full rounded-[22px]"
                  style={{ backgroundColor: "#FFFFFF", borderColor: palette.accentBorder }}
                >
                  <View className="flex-row items-center gap-2">
                    {isLastScreen ? (
                      <ChevronLeft size={18} color={palette.accentStrong} />
                    ) : (
                      <ArrowRight size={18} color={palette.accentStrong} />
                    )}
                    <Text className="text-base font-body-semibold leading-5" style={{ color: palette.accentStrong }}>
                      {screen.secondaryCta}
                    </Text>
                  </View>
                </Button>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeIn.duration(360)} className="mt-4 px-4">
            <Text className="text-center text-xs font-body leading-5 text-muted-foreground">
              Der erste Start ist lokal. Du kannst Profile, Routinen und Belohnungen später im Elternbereich anpassen.
            </Text>
          </Animated.View>
        </ScrollView>
      </ThemedScreenBackground>
    </SafeAreaView>
  );
}
