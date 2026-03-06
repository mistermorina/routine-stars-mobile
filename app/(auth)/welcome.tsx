import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  LockKeyhole,
  Shield,
  Sparkles,
  Star,
} from "lucide-react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeInUp,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Button } from "@/components/ui/button";
import { FamilyHeroArt } from "@/components/ui/family-hero-art";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { triggerFeedback } from "@/lib/feedback";
import { getThemePalette } from "@/lib/theme";
import { KEYS, storage } from "@/lib/storage";

const previewCards = [
  {
    eyebrow: "Familienalltag",
    title: "Mehr Leichtigkeit im Familienalltag.",
    description:
      "Eltern richten einmal ein, Kinder erleben kleine Erfolgsmomente statt taeglicher Diskussionen.",
    Icon: Sparkles,
    chips: ["Morgen", "Abend", "Hausaufgaben"],
  },
  {
    eyebrow: "Spielerisch",
    title: "Routinen werden zu kleinen Levels.",
    description:
      "Zaehneputzen, Aufraeumen und Abendrituale werden zu sichtbaren Schritten mit Sternen und Belohnungen.",
    Icon: Star,
    chips: ["Sterne", "Belohnungen", "Fortschritt"],
  },
  {
    eyebrow: "Elternkontrolle",
    title: "Eltern behalten die Kontrolle.",
    description:
      "PIN-Schutz, lokale Daten und kein eigenes Kinderkonto halten die App klar und sicher.",
    Icon: LockKeyhole,
    chips: ["PIN", "Lokal", "Privat"],
  },
] as const;

function FloatingParticle({
  top,
  left,
  delay,
  size,
  duration,
  color,
}: {
  top: number;
  left: number;
  delay: number;
  size: number;
  duration: number;
  color: string;
}) {
  const reduceMotion = useReducedMotion();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(reduceMotion ? 0.32 : 0.2);

  React.useEffect(() => {
    if (reduceMotion) {
      translateY.value = 0;
      opacity.value = 0.3;
      return;
    }

    const timeout = setTimeout(() => {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, {
            duration,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(8, {
            duration,
            easing: Easing.inOut(Easing.ease),
          })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: duration * 0.7 }),
          withTiming(0.22, { duration: duration * 0.7 })
        ),
        -1,
        true
      );
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, duration, opacity, reduceMotion, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { rotate: `${translateY.value * 1.8}deg` }],
  }));

  return (
    <Animated.View
      className="absolute"
      pointerEvents="none"
      style={[
        animatedStyle,
        {
          top,
          left,
        },
      ]}
    >
      <Star size={size} color={color} fill={color} />
    </Animated.View>
  );
}

export default function WelcomeScreen() {
  const router = useRouter();
  const palette = getThemePalette("sterne");
  const reduceMotion = useReducedMotion();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");

  const particles = useMemo(
    () => [
      { top: 58, left: 24, delay: 0, size: 12, duration: 4400, color: palette.chartPrimary },
      { top: 92, left: 298, delay: 120, size: 10, duration: 5200, color: palette.chartSecondary },
      { top: 192, left: 42, delay: 220, size: 11, duration: 5000, color: palette.chartPrimary },
      { top: 248, left: 310, delay: 340, size: 9, duration: 5600, color: palette.chartSecondary },
      { top: 356, left: 30, delay: 440, size: 8, duration: 6000, color: palette.chartPrimary },
      { top: 418, left: 282, delay: 510, size: 12, duration: 5300, color: palette.chartSecondary },
      { top: 530, left: 64, delay: 650, size: 10, duration: 5800, color: palette.chartPrimary },
      { top: 602, left: 292, delay: 780, size: 8, duration: 6200, color: palette.chartSecondary },
    ],
    [palette.chartPrimary, palette.chartSecondary]
  );

  const previewCard = previewCards[previewIndex];

  const markWelcomeSeen = async () => {
    await storage.setItem(KEYS.HAS_SEEN_WELCOME, true);
  };

  const handleStart = async () => {
    await markWelcomeSeen();
    void triggerFeedback("stars_added");
    router.replace("/(auth)/login");
  };

  const handlePreviewStart = async () => {
    await markWelcomeSeen();
    setDirection("forward");
    setPreviewIndex(0);
    setIsPreviewMode(true);
    void triggerFeedback("theme_preview");
  };

  const handleNextPreview = async () => {
    if (previewIndex === previewCards.length - 1) {
      await handleStart();
      return;
    }
    setDirection("forward");
    setPreviewIndex((prev) => prev + 1);
    void triggerFeedback("tab_focus");
  };

  const handlePreviousPreview = () => {
    if (previewIndex === 0) {
      setIsPreviewMode(false);
      return;
    }
    setDirection("backward");
    setPreviewIndex((prev) => prev - 1);
    void triggerFeedback("tab_focus");
  };

  const handleSkip = async () => {
    await markWelcomeSeen();
    router.replace("/(auth)/login");
  };

  const enteringAnimation = direction === "forward" ? SlideInRight.duration(260) : SlideInLeft.duration(260);
  const exitingAnimation = direction === "forward" ? SlideOutLeft.duration(220) : SlideOutRight.duration(220);

  return (
    <SafeAreaView className="flex-1">
      <ThemedScreenBackground theme="sterne">
        {!reduceMotion &&
          particles.map((particle, index) => (
            <FloatingParticle key={index} {...particle} />
          ))}

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-10 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row items-center justify-between px-1">
            <View className="flex-row items-center gap-2">
              {isPreviewMode ? (
                <Pressable
                  onPress={handlePreviousPreview}
                  className="flex-row items-center rounded-full px-2 py-1.5"
                  style={{ backgroundColor: palette.headerGlass }}
                >
                  <ChevronLeft size={16} color={palette.accentStrong} />
                  <Text className="ml-1 text-xs font-body-semibold" style={{ color: palette.accentText }}>
                    Zurueck
                  </Text>
                </Pressable>
              ) : (
                <View
                  className="rounded-full px-3 py-1.5"
                  style={{ backgroundColor: palette.headerGlass }}
                >
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.7px]" style={{ color: palette.accentText }}>
                    First Start
                  </Text>
                </View>
              )}
            </View>

            {isPreviewMode ? (
              <Pressable onPress={handleSkip}>
                <Text className="text-sm font-body-semibold" style={{ color: palette.accentStrong }}>
                  Ueberspringen
                </Text>
              </Pressable>
            ) : (
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: palette.headerGlass }}
              >
                <Text className="text-xs font-body-semibold uppercase tracking-[0.7px]" style={{ color: palette.accentText }}>
                  Storyworld
                </Text>
              </View>
            )}
          </View>

          {!isPreviewMode ? (
            <Animated.View entering={FadeInDown.duration(320)} className="mt-4">
              <View
                className="rounded-[34px] border px-5 pb-5 pt-5"
                style={{
                  backgroundColor: palette.cardTint,
                  borderColor: palette.accentBorder,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      className="rounded-2xl p-2.5"
                      style={{ backgroundColor: palette.tabActiveBg }}
                    >
                      <Check size={18} color={palette.accentText} strokeWidth={3} />
                    </View>
                    <Text className="text-xl font-headline text-foreground">Routine Stars</Text>
                  </View>
                  <View
                    className="rounded-full px-3 py-1.5"
                    style={{ backgroundColor: palette.heroSurface }}
                  >
                    <Text className="text-xs font-body-semibold uppercase tracking-[0.8px]" style={{ color: palette.accentText }}>
                      Willkommen
                    </Text>
                  </View>
                </View>

                <Text className="mt-5 text-[34px] font-headline leading-[40px] text-foreground">
                  Starke Routinen. Kleine Stars.
                </Text>
                <Text className="mt-3 text-base font-body leading-7 text-muted-foreground">
                  Spielerisch motiviert, liebevoll begleitet und jeden Tag ein
                  bisschen selbststaendiger.
                </Text>

                <FamilyHeroArt theme="sterne" className="mt-5" />

                <View className="mt-5 flex-row flex-wrap gap-2">
                  {[
                    { icon: Sparkles, label: "Sterne statt Stress" },
                    { icon: Star, label: "Jeden Tag ein Level weiter" },
                    { icon: Shield, label: "Eltern bleiben in Kontrolle" },
                  ].map((item) => (
                    <View
                      key={item.label}
                      className="flex-row items-center gap-2 rounded-full border px-3 py-2"
                      style={{
                        backgroundColor: "#FFFFFF",
                        borderColor: palette.accentBorder,
                      }}
                    >
                      <item.icon size={14} color={palette.accentStrong} />
                      <Text className="text-xs font-body-semibold text-foreground">
                        {item.label}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="mt-6 gap-3">
                  <Button
                    onPress={() => {
                      void handleStart();
                    }}
                    size="lg"
                    className="w-full rounded-[22px]"
                    style={{ backgroundColor: palette.button }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Star size={18} color="#FFFFFF" fill="#FFFFFF" />
                      <Text className="text-lg font-body-semibold text-white">Loslegen</Text>
                    </View>
                  </Button>

                  <Button
                    variant="outline"
                    onPress={() => {
                      void handlePreviewStart();
                    }}
                    size="lg"
                    className="w-full rounded-[22px]"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: palette.accentBorder,
                    }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Sparkles size={18} color={palette.accentStrong} />
                      <Text className="text-lg font-body-semibold" style={{ color: palette.accentStrong }}>
                        Erst anschauen
                      </Text>
                    </View>
                  </Button>
                </View>
              </View>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.duration(220)} className="mt-4">
              <View
                className="rounded-[34px] border px-5 pb-5 pt-5"
                style={{
                  backgroundColor: palette.cardTint,
                  borderColor: palette.accentBorder,
                }}
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
                      {previewCard.eyebrow}
                    </Text>
                    <Text className="mt-2 text-[28px] font-headline leading-[34px] text-foreground">
                      {previewCard.title}
                    </Text>
                  </View>
                  <View
                    className="h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: palette.tabActiveBg }}
                  >
                    <previewCard.Icon size={24} color={palette.accentStrong} />
                  </View>
                </View>

                <Text className="mt-4 text-base font-body leading-7 text-muted-foreground">
                  {previewCard.description}
                </Text>

                <View className="mt-5 min-h-[260px]">
                  <Animated.View
                    key={previewIndex}
                    entering={enteringAnimation}
                    exiting={exitingAnimation}
                  >
                    <View
                      className="overflow-hidden rounded-[30px] border px-4 py-4"
                      style={{
                        backgroundColor: palette.heroSurface,
                        borderColor: palette.accentBorder,
                      }}
                    >
                      {previewIndex === 0 ? (
                        <>
                          <FamilyHeroArt theme="sterne" compact />
                          <View className="mt-4 flex-row flex-wrap gap-2">
                            {previewCard.chips.map((chip) => (
                              <View
                                key={chip}
                                className="rounded-full bg-white px-3 py-1.5"
                              >
                                <Text className="text-xs font-body-semibold text-foreground">
                                  {chip}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </>
                      ) : (
                        <>
                          <View className="flex-row gap-3">
                            {previewCard.chips.map((chip, index) => (
                              <View
                                key={chip}
                                className="flex-1 rounded-[22px] border px-3 py-4"
                                style={{
                                  backgroundColor: index === 1 ? "#FFFFFF" : palette.cardTint,
                                  borderColor: palette.accentBorder,
                                }}
                              >
                                <View
                                  className="h-10 w-10 items-center justify-center rounded-full"
                                  style={{ backgroundColor: palette.tabActiveBg }}
                                >
                                  {index === 0 ? (
                                    <Star size={16} color={palette.chartPrimary} fill={palette.chartPrimary} />
                                  ) : index === 1 ? (
                                    <Sparkles size={16} color={palette.accentStrong} />
                                  ) : (
                                    <Shield size={16} color={palette.accentStrong} />
                                  )}
                                </View>
                                <Text className="mt-3 text-sm font-body-semibold text-foreground">
                                  {chip}
                                </Text>
                                <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground">
                                  {previewIndex === 1
                                    ? index === 0
                                      ? "Aufgaben geben direkt sichtbaren Fortschritt."
                                      : index === 1
                                        ? "Belohnungen machen aus Routine kleine Ziele."
                                        : "Eltern sehen klar, was gut laeuft."
                                    : index === 0
                                      ? "Nur Eltern kommen in die Verwaltung."
                                      : index === 1
                                        ? "Familiendaten bleiben lokal auf dem Geraet."
                                        : "Kinder brauchen kein eigenes Konto."}
                                </Text>
                              </View>
                            ))}
                          </View>
                          <View
                            className="mt-4 rounded-[22px] border px-4 py-4"
                            style={{
                              backgroundColor: "#FFFFFF",
                              borderColor: palette.accentBorder,
                            }}
                          >
                            <Text className="text-sm font-body leading-6 text-muted-foreground">
                              {previewIndex === 1
                                ? "So fuehlt sich die App spaeter fuer Kinder an: freundlich, motivierend und mit klaren kleinen Schritten."
                                : "Der Elternbereich bleibt bewusst getrennt, damit Kinder nur ihre Welt sehen und Eltern trotzdem alles steuern koennen."}
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  </Animated.View>
                </View>

                <View className="mt-5 flex-row items-center justify-center gap-2">
                  {previewCards.map((_, index) => (
                    <View
                      key={index}
                      className="rounded-full"
                      style={{
                        width: index === previewIndex ? 24 : 8,
                        height: 8,
                        backgroundColor:
                          index === previewIndex ? palette.accentStrong : palette.accentBorder,
                      }}
                    />
                  ))}
                </View>

                <View className="mt-6 gap-3">
                  <Button
                    onPress={() => {
                      void handleNextPreview();
                    }}
                    size="lg"
                    className="w-full rounded-[22px]"
                    style={{ backgroundColor: palette.button }}
                  >
                    <View className="flex-row items-center gap-2">
                      <Text className="text-lg font-body-semibold text-white">
                        {previewIndex === previewCards.length - 1 ? "Jetzt starten" : "Weiter"}
                      </Text>
                      <ArrowRight size={18} color="#FFFFFF" />
                    </View>
                  </Button>

                  <Button
                    variant="outline"
                    onPress={handlePreviousPreview}
                    size="lg"
                    className="w-full rounded-[22px]"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: palette.accentBorder,
                    }}
                  >
                    <Text className="text-lg font-body-semibold" style={{ color: palette.accentStrong }}>
                      {previewIndex === 0 ? "Zurueck zum Welcome" : "Zurueck"}
                    </Text>
                  </Button>
                </View>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </ThemedScreenBackground>
    </SafeAreaView>
  );
}
