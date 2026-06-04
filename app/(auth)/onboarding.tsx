import React, { useState, useCallback } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  SlideInRight,
  SlideInLeft,
  SlideOutLeft,
  SlideOutRight,
} from "react-native-reanimated";
import { Progress } from "@/components/ui/progress";
import { ToastOverlay } from "@/components/ui/toast";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { ChildSetup } from "@/components/onboarding/child-setup";
import { RoutineSetup } from "@/components/onboarding/routine-setup";
import type { SavedRoutine } from "@/components/onboarding/routine-setup";
import { RewardSetup } from "@/components/onboarding/reward-setup";
import { storage, KEYS } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { getThemePalette } from "@/lib/theme";
import type { Child, ChildProfile, Routine, Reward } from "@/lib/types";

interface OnboardingFormData {
  children: ChildProfile[];
  savedRoutines: SavedRoutine[];
  rewards: {
    id: string;
    title: string;
    cost: number;
    iconName: string;
  }[];
}

const TOTAL_STEPS = 3;

const setupSteps = [
  {
    eyebrow: "Profil",
    title: "Wer sammelt die ersten Sterne?",
    description:
      "Name, Alter und Look helfen uns, passende Routinen vorzuschlagen.",
  },
  {
    eyebrow: "Routinen",
    title: "Welche Alltagsschritte sollen leichter werden?",
    description:
      "Wähle eine Vorlage oder passe die erste Routine direkt an eure Familie an.",
  },
  {
    eyebrow: "Belohnungen",
    title: "Was macht Fortschritt spürbar?",
    description:
      "Starte mit warmen, altersgerechten Belohnungen und ändere sie später jederzeit.",
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { toasts, toast, dismiss } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>({
    children: [],
    savedRoutines: [],
    rewards: [],
  });

  const progressValue = ((currentStep + 1) / TOTAL_STEPS) * 100;
  const onboardingTheme = getThemePalette(formData.children[0]?.theme);
  const activeStep = setupSteps[currentStep];

  const handleNext = useCallback(
    async (data: Partial<OnboardingFormData>) => {
      if (isSaving) return;

      const newFormData = { ...formData, ...data };
      setFormData(newFormData);
      setSaveError(null);

      if (currentStep < TOTAL_STEPS - 1) {
        setDirection("forward");
        setCurrentStep((prev) => prev + 1);
      } else {
        setIsSaving(true);

        try {
          const newChildren: Child[] = newFormData.children.map((profile, i) => ({
            id: `child-${Date.now()}-${i}`,
            name: profile.name,
            avatar: profile.avatar,
            stars: 0,
            theme: profile.theme,
            ageGroup: profile.ageGroup,
          }));

          if (newChildren.length === 0) {
            throw new Error("Mindestens ein Kinderprofil ist erforderlich.");
          }

          const newRoutines: Routine[] = (newFormData.savedRoutines || []).map((sr) => ({
            id: sr.id,
            name: sr.name,
            color: sr.color,
            tasks: sr.tasks.map((t) => ({
              ...t,
              completed: false,
            })),
          }));

          const newRewards: Reward[] = (newFormData.rewards || []).map((r) => ({
            id: r.id || `reward-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            title: r.title,
            cost: r.cost,
            iconName: r.iconName,
          }));

          await storage.setItem(KEYS.CHILDREN, newChildren);
          await storage.setItem(KEYS.LAST_SELECTED_CHILD_ID, newChildren[0].id);
          await storage.setItem(KEYS.CUSTOM_ROUTINES, newRoutines);
          await storage.setItem(KEYS.CUSTOM_REWARDS, newRewards);
          await storage.setItem(KEYS.HAS_ONBOARDED, true);

          const names = newChildren.map((c) => c.name).join(" & ");
          const verb = newChildren.length === 1 ? "kann" : "können";
          toast({
            title: "Alles eingerichtet!",
            description: `${names} ${verb} jetzt Sterne sammeln.`,
          });

          setTimeout(() => {
            router.replace("/(tabs)");
          }, 600);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Die Einrichtung konnte nicht gespeichert werden.";
          setSaveError(message);
          setIsSaving(false);
          toast({
            title: "Speichern nicht möglich",
            description: "Bitte versuche es noch einmal.",
          });
        }
      }
    },
    [currentStep, formData, isSaving, router, toast]
  );

  const handleBack = useCallback(() => {
    if (isSaving) return;

    if (currentStep > 0) {
      setDirection("backward");
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  }, [currentStep, isSaving, router]);

  const enteringAnimation =
    direction === "forward"
      ? SlideInRight.duration(300)
      : SlideInLeft.duration(300);

  const exitingAnimation =
    direction === "forward"
      ? SlideOutLeft.duration(300)
      : SlideOutRight.duration(300);

  return (
    <SafeAreaView className="flex-1">
      <ThemedScreenBackground theme={formData.children[0]?.theme}>
        <View className="flex-1 min-h-0 px-4 pt-4">
          <View
            className="mb-5 rounded-[26px] border px-4 py-4"
            style={{
              backgroundColor: onboardingTheme.cardTint,
              borderColor: onboardingTheme.accentBorder,
            }}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-xs font-body-semibold uppercase text-muted-foreground">
                  {activeStep.eyebrow}
                </Text>
                <Text className="mt-1 text-lg font-headline leading-6 text-foreground">
                  {activeStep.title}
                </Text>
                <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground">
                  {activeStep.description}
                </Text>
                <Progress
                  value={progressValue}
                  className="mt-4 h-3 w-full"
                  indicatorClassName="bg-[#FFD700]"
                  indicatorColor={onboardingTheme.progress}
                />
                <View className="mt-3">
                  <Animated.Text className="text-xs font-body text-muted-foreground">
                    Schritt {currentStep + 1} von {TOTAL_STEPS}
                  </Animated.Text>
                </View>
              </View>
              <View
                className="rounded-full px-3 py-1.5"
                style={{ backgroundColor: onboardingTheme.heroSurface }}
              >
                <Animated.Text
                  className="text-xs font-body-semibold"
                  style={{ color: onboardingTheme.accentText }}
                >
                  Einrichtung
                </Animated.Text>
              </View>
            </View>
          </View>

          {saveError ? (
            <View
              className="mb-4 rounded-[18px] border px-4 py-3"
              style={{
                backgroundColor: "#FFF4F4",
                borderColor: "#F5B7B7",
              }}
            >
              <Text className="text-sm font-body-semibold text-[#8A1F1F]">
                {saveError}
              </Text>
              <Text className="mt-1 text-xs font-body leading-5 text-[#8A1F1F]">
                Deine Eingaben bleiben auf diesem Screen erhalten.
              </Text>
            </View>
          ) : null}

          <View className="flex-1 min-h-0">
            {currentStep === 0 && (
              <Animated.View
                key="step-0"
                entering={enteringAnimation}
                exiting={exitingAnimation}
                style={{ flex: 1, minHeight: 0 }}
              >
                <ChildSetup
                  onNext={(data) => handleNext(data)}
                  onBack={handleBack}
                  formData={formData}
                />
              </Animated.View>
            )}

            {currentStep === 1 && (
              <Animated.View
                key="step-1"
                entering={enteringAnimation}
                exiting={exitingAnimation}
                style={{ flex: 1, minHeight: 0 }}
              >
                <RoutineSetup
                  onNext={(data) => handleNext(data)}
                  onBack={handleBack}
                  formData={formData}
                />
              </Animated.View>
            )}

            {currentStep === 2 && (
              <Animated.View
                key="step-2"
                entering={enteringAnimation}
                exiting={exitingAnimation}
                style={{ flex: 1, minHeight: 0 }}
              >
                <RewardSetup
                  onNext={(data) => handleNext(data)}
                  onBack={handleBack}
                  formData={formData}
                  isSaving={isSaving}
                />
              </Animated.View>
            )}
          </View>
        </View>
      </ThemedScreenBackground>

      {/* Toast overlay */}
      <ToastOverlay toasts={toasts} onDismiss={dismiss} />
    </SafeAreaView>
  );
}
