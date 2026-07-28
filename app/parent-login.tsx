import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { useDesignMode } from "@/contexts/design-mode-context";
import { getAccentTokens } from "@/lib/design-mode";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { PressableScale } from "@/components/ui/pressable-scale";
import { ParentGateChallenge } from "@/components/parent-gate-challenge";
import { useAuth } from "@/hooks/use-auth";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useToast } from "@/hooks/use-toast";
import { triggerFeedback } from "@/lib/feedback";
import { Lock } from "@/lib/icons";
import { enterFade, exitFade, springs } from "@/lib/motion";
import {
  PARENT_PIN_LENGTH,
  getLockState,
  hasParentPin,
  saveParentPin,
  verifyParentPin,
  type ParentPinLockState,
} from "@/lib/parent-access";
import { getThemePalette, semanticColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * `verify` (default) unlocks the parent area, `setup` creates the very first
 * PIN, `change` replaces an existing one. Setup is only reachable through
 * ParentGateChallenge, change only after the current PIN was entered — a child
 * must never be able to invent or overwrite the PIN.
 */
type ParentLoginMode = "verify" | "setup" | "change";

type Step =
  | "loading"
  /** Adult challenge in front of the first PIN creation. */
  | "gate"
  /** Change flow: confirm the PIN that is currently stored. */
  | "current"
  | "create"
  | "confirm"
  | "unlock";

const PIN_SLOTS = Array.from({ length: PARENT_PIN_LENGTH }, (_, index) => index);

function normalizeMode(value: string | string[] | undefined): ParentLoginMode {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "setup" || raw === "change" ? raw : "verify";
}

function formatCountdown(remainingMs: number): string {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));

  if (seconds < 60) {
    return `${seconds} Sekunden`;
  }

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;

  return `${minutes}:${String(rest).padStart(2, "0")} Minuten`;
}

function attemptsHint(attemptsRemaining: number): string {
  if (attemptsRemaining <= 0) return "";
  if (attemptsRemaining === 1) return " Noch 1 Versuch.";
  return ` Noch ${attemptsRemaining} Versuche.`;
}

export default function ParentLoginScreen() {
  const { designMode } = useDesignMode();
  const accents = getAccentTokens(designMode, getThemePalette(null));
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();
  const params = useLocalSearchParams<{ mode?: string | string[] }>();
  const mode = normalizeMode(params.mode);

  const [step, setStep] = useState<Step>("loading");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [lock, setLock] = useState<ParentPinLockState | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [hadPinOnEntry, setHadPinOnEntry] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const submittingRef = useRef(false);

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  const isLocked = Boolean(lock?.isLocked);
  const isPinStep = step === "current" || step === "create" || step === "confirm" || step === "unlock";
  const isInputEnabled = isPinStep && !isLocked && !isBusy;

  /* --- initial resolution ------------------------------------------- */

  useEffect(() => {
    let isMounted = true;

    async function resolveStep() {
      const [configured, lockState] = await Promise.all([hasParentPin(), getLockState()]);
      if (!isMounted) return;

      setHadPinOnEntry(configured);
      setLock(lockState);

      if (!configured) {
        // Nothing to verify against — creating the first PIN needs the adult gate.
        setStep("gate");
        return;
      }

      // `setup` on a device that already has a PIN is treated as a change:
      // overwriting a PIN without knowing it would defeat the whole gate.
      setStep(mode === "verify" ? "unlock" : "current");
    }

    void resolveStep();

    return () => {
      isMounted = false;
    };
  }, [mode]);

  /* --- lockout countdown -------------------------------------------- */

  useEffect(() => {
    if (!lock?.isLocked) {
      setRemainingMs(0);
      return;
    }

    let isMounted = true;
    const lockedUntil = lock.lockedUntil;
    setRemainingMs(Math.max(0, lockedUntil - Date.now()));
    // Nothing can be typed while locked — get the keyboard out of the way.
    inputRef.current?.blur();

    const interval = setInterval(() => {
      const next = Math.max(0, lockedUntil - Date.now());
      if (!isMounted) return;

      setRemainingMs(next);

      if (next === 0) {
        clearInterval(interval);
        void getLockState().then((state) => {
          if (isMounted) setLock(state);
        });
      }
    }, 500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lock]);

  /* --- focus handling ------------------------------------------------ */

  useEffect(() => {
    if (!isInputEnabled) return;

    const timeout = setTimeout(() => inputRef.current?.focus(), 180);
    return () => clearTimeout(timeout);
  }, [isInputEnabled, step]);

  /* --- helpers -------------------------------------------------------- */

  const dismiss = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  }, [router]);

  const failWith = useCallback(
    (message: string) => {
      setErrorMessage(message);
      setPin("");
      void triggerFeedback("theme_preview", { disableSound: true });

      if (!reduceMotion) {
        shakeX.value = withSequence(
          withSpring(10, springs.press),
          withSpring(-10, springs.press),
          withSpring(0, springs.press)
        );
      }
    },
    [reduceMotion, shakeX]
  );

  const completeWithNewPin = useCallback(
    async (digits: string) => {
      await saveParentPin(digits);
      setFirstPin("");
      setPin("");
      setErrorMessage(null);
      setLock(await getLockState());

      void triggerFeedback("mission_complete", { disableSound: true });
      auth.authorizeParent();
      toast({
        title: hadPinOnEntry ? "Eltern-PIN geändert" : "Eltern-PIN gespeichert",
        description: "Der Eltern-Bereich ist jetzt geschützt.",
      });
      router.replace("/settings");
    },
    [auth, hadPinOnEntry, router, toast]
  );

  const submitPin = useCallback(
    async (digits: string) => {
      if (submittingRef.current || digits.length !== PARENT_PIN_LENGTH) return;

      submittingRef.current = true;
      setIsBusy(true);
      // Let the busy state paint before the (synchronous) key derivation.
      await new Promise((resolve) => setTimeout(resolve, 0));

      try {
        if (step === "create") {
          setFirstPin(digits);
          setPin("");
          setErrorMessage(null);
          setStep("confirm");
          return;
        }

        if (step === "confirm") {
          if (digits !== firstPin) {
            setFirstPin("");
            setStep("create");
            failWith("Die PINs stimmen nicht überein.");
            toast({
              title: "PIN stimmt nicht überein",
              description: "Bitte lege den Eltern-PIN noch einmal fest.",
              variant: "destructive",
            });
            return;
          }

          await completeWithNewPin(digits);
          return;
        }

        const result = await verifyParentPin(digits);
        setLock(result.lock);

        if (!result.success) {
          if (result.reason === "locked") {
            setPin("");
            setErrorMessage(null);
            return;
          }

          if (result.lock.isLocked) {
            setPin("");
            setErrorMessage(null);
            void triggerFeedback("theme_preview", { disableSound: true });
            return;
          }

          failWith(`Falscher PIN.${attemptsHint(result.lock.attemptsRemaining)}`);
          return;
        }

        if (step === "current") {
          setPin("");
          setErrorMessage(null);
          setStep("create");
          return;
        }

        setPin("");
        setErrorMessage(null);
        void triggerFeedback("mission_complete", { disableSound: true });
        auth.authorizeParent();
        toast({ title: "Eltern-Bereich entsperrt" });
        router.replace("/settings");
      } finally {
        submittingRef.current = false;
        setIsBusy(false);
      }
    },
    [auth, completeWithNewPin, failWith, firstPin, router, step, toast]
  );

  const handlePinChange = useCallback(
    (text: string) => {
      const digits = text.replace(/[^0-9]/g, "").slice(0, PARENT_PIN_LENGTH);
      setPin(digits);

      if (digits.length > 0) {
        setErrorMessage(null);
      }

      if (digits.length === PARENT_PIN_LENGTH) {
        void submitPin(digits);
      }
    },
    [submitPin]
  );

  const handleGateSuccess = useCallback(() => {
    setStep("create");
    setPin("");
    setErrorMessage(null);
  }, []);

  /* --- copy ------------------------------------------------------------ */

  const isCreateFlow = step === "create" || step === "confirm";

  const title =
    step === "confirm"
      ? "PIN bestätigen"
      : step === "create"
        ? hadPinOnEntry
          ? "Neuen PIN festlegen"
          : "Eltern-PIN festlegen"
        : step === "current"
          ? "Aktuellen PIN eingeben"
          : step === "gate"
            ? "Eltern-PIN einrichten"
            : "Eltern-Bereich";

  const description =
    step === "loading"
      ? "Einen Moment …"
      : step === "confirm"
        ? "Bitte gib den neuen PIN noch einmal ein."
        : step === "create"
          ? "Lege einen vierstelligen PIN fest, um die Einstellungen zu schützen."
          : step === "current"
            ? "Bitte gib zuerst deinen aktuellen Eltern-PIN ein."
            : step === "gate"
              ? "Nur Erwachsene dürfen den Eltern-PIN festlegen."
              : "Bitte gib deinen vierstelligen Eltern-PIN ein.";

  const submitLabel = isCreateFlow ? "Speichern" : step === "current" ? "Weiter" : "Entsperren";
  const lockMessage = `Zu viele Fehlversuche. Bitte warte noch ${formatCountdown(remainingMs)}.`;
  const isSubmitDisabled = pin.length !== PARENT_PIN_LENGTH || !isInputEnabled;

  return (
    <ThemedScreenBackground>
      <SafeAreaView className="flex-1">
      <View className="flex-1 items-center justify-center p-6">
        <View
          className="mb-6 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: accents.pillFill }}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Lock size={36} color={accents.iconColor} />
        </View>

        <View accessible accessibilityRole="header">
          <Text className="text-center font-headline text-3xl text-foreground">{title}</Text>
        </View>

        <Text className="mt-2 text-center font-body text-base leading-6 text-muted-foreground">
          {description}
        </Text>

        <Animated.View style={shakeStyle} className="w-full items-center">
          <View className="mt-8 w-full max-w-[220px]">
            <TextInput
              ref={inputRef}
              value={pin}
              onChangeText={handlePinChange}
              onSubmitEditing={() => void submitPin(pin)}
              secureTextEntry
              keyboardType="number-pad"
              returnKeyType="done"
              textContentType="none"
              autoComplete="off"
              maxLength={PARENT_PIN_LENGTH}
              editable={isInputEnabled}
              accessibilityLabel="Vierstelligen Eltern-PIN eingeben"
              accessibilityState={{ disabled: !isInputEnabled }}
              // Fixed 56pt field with wide tracking — cap Dynamic Type growth.
              maxFontSizeMultiplier={1.2}
              style={{ height: 56, textAlign: "center", fontSize: 24, letterSpacing: 12 }}
              className={cn(
                "w-full rounded-tile border-2 bg-card font-headline text-foreground",
                errorMessage ? "border-destructive" : "border-input",
                !isInputEnabled && "opacity-60"
              )}
              selectionColor={accents.accent}
              placeholderTextColor={semanticColors.mutedForeground}
              placeholder="----"
            />
          </View>

          <View
            className="mt-4 flex-row gap-3"
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            {PIN_SLOTS.map((slot) => (
              <View
                key={slot}
                className={cn("h-3 w-3 rounded-full", slot < pin.length ? "" : "bg-border")}
                style={slot < pin.length ? { backgroundColor: accents.accent } : undefined}
              />
            ))}
          </View>
        </Animated.View>

        {isLocked ? (
          <Animated.View entering={enterFade()} exiting={exitFade()} className="mt-4 px-2">
            <Text
              className="text-center font-body text-sm leading-5 text-destructive-strong"
              accessibilityLiveRegion="polite"
              accessibilityLabel={lockMessage}
            >
              {lockMessage}
            </Text>
          </Animated.View>
        ) : errorMessage ? (
          <Animated.View entering={enterFade()} exiting={exitFade()} className="mt-4 px-2">
            <Text
              className="text-center font-body text-sm leading-5 text-destructive-strong"
              accessibilityLiveRegion="polite"
            >
              {errorMessage}
            </Text>
          </Animated.View>
        ) : null}

        <View className="mt-8 w-full max-w-[220px]">
          <Button
            onPress={() => void submitPin(pin)}
            disabled={isSubmitDisabled}
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
            accessibilityState={{ disabled: isSubmitDisabled }}
            className={cn("w-full rounded-tile", isSubmitDisabled && "opacity-50")}
          >
            {isBusy ? "Bitte warten …" : submitLabel}
          </Button>
        </View>

        <PressableScale
          onPress={dismiss}
          accessibilityRole="button"
          accessibilityLabel="Abbrechen und zurückgehen"
          hitSlop={8}
          className="mt-4 min-h-[44px] justify-center rounded-chip px-6"
        >
          <Text
            className="text-center font-body text-base text-muted-foreground"
            maxFontSizeMultiplier={1.4}
          >
            Abbrechen
          </Text>
        </PressableScale>
      </View>

      <ParentGateChallenge
        visible={step === "gate"}
        title="Nur für Erwachsene"
        onSuccess={handleGateSuccess}
        onCancel={dismiss}
      />
      </SafeAreaView>
    </ThemedScreenBackground>
  );
}
