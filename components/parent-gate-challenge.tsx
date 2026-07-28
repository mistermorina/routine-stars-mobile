import React, { useCallback, useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { triggerFeedback } from "@/lib/feedback";
import { Lock } from "@/lib/icons";
import { modalSpring, springs } from "@/lib/motion";
import { semanticColors, shadowPresets } from "@/lib/theme";
import { cn } from "@/lib/utils";

const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 10_000;

const ONES = [
  "null",
  "eins",
  "zwei",
  "drei",
  "vier",
  "fünf",
  "sechs",
  "sieben",
  "acht",
  "neun",
];
const TEENS = [
  "zehn",
  "elf",
  "zwölf",
  "dreizehn",
  "vierzehn",
  "fünfzehn",
  "sechzehn",
  "siebzehn",
  "achtzehn",
  "neunzehn",
];
const TENS = [
  "",
  "zehn",
  "zwanzig",
  "dreißig",
  "vierzig",
  "fünfzig",
  "sechzig",
  "siebzig",
  "achtzig",
  "neunzig",
];

/** 0–99 as German words ("sechsundzwanzig"). */
function germanNumber(value: number): string {
  if (value < 10) return ONES[value];
  if (value < 20) return TEENS[value - 10];

  const tens = Math.floor(value / 10);
  const ones = value % 10;

  if (ones === 0) return TENS[tens];

  return `${ones === 1 ? "ein" : ONES[ones]}und${TENS[tens]}`;
}

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

interface Challenge {
  a: number;
  b: number;
  answer: number;
  key: string;
}

/**
 * Two 2-digit operands whose ones digits carry, spelled out in German words.
 * The reading requirement — not the arithmetic — is what stops a 4-year-old.
 */
function createChallenge(previousKey?: string): Challenge {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const a = randomInt(12, 49);
    const b = randomInt(13, 49);

    if ((a % 10) + (b % 10) < 11) continue;

    const key = `${a}+${b}`;
    if (key === previousKey) continue;

    return { a, b, answer: a + b, key };
  }

  return { a: 17, b: 26, answer: 43, key: "17+26" };
}

export interface ParentGateChallengeProps {
  visible: boolean;
  /** Fired only on a correct answer. Open the protected flow from here. */
  onSuccess: () => void;
  /** Backdrop tap, hardware back and "Abbrechen" all land here. */
  onCancel: () => void;
  /** Defaults to "Nur für Erwachsene". */
  title?: string;
}

/**
 * Reusable adult gate (App Store 5.1.4-adjacent): put it in front of anything a
 * child must not reach alone — purchases, external links, account deletion,
 * the PIN setup in app/parent-login.tsx.
 *
 * Deliberate design decisions:
 * - The question is written in German number words, so it needs reading skill.
 * - Both operands are two digits and always carry, so it needs real arithmetic.
 * - A wrong answer regenerates the question (no brute force by repetition).
 * - After 3 misses the gate cools down for 10s, and the miss counter is NOT
 *   reset by closing and reopening the sheet — only by waiting it out.
 */
export function ParentGateChallenge({
  visible,
  onSuccess,
  onCancel,
  title = "Nur für Erwachsene",
}: ParentGateChallengeProps) {
  const reduceMotion = useReducedMotion();
  const inputRef = useRef<TextInput>(null);

  const [challenge, setChallenge] = useState<Challenge>(() => createChallenge());
  const [value, setValue] = useState("");
  const [hasFailed, setHasFailed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownUntilRef = useRef(0);

  const isCoolingDown = cooldownRemaining > 0;

  const shakeX = useSharedValue(0);
  const lift = useSharedValue(12);
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }] }));

  useEffect(() => {
    if (!visible) {
      lift.value = 12;
      return;
    }

    lift.value = reduceMotion ? 0 : withSpring(0, modalSpring);
  }, [lift, reduceMotion, visible]);

  // Fresh question every time the gate opens; the attempt counter survives.
  useEffect(() => {
    if (!visible) return;

    setChallenge((current) => createChallenge(current.key));
    setValue("");
    setHasFailed(false);
  }, [visible]);

  useEffect(() => {
    if (!visible || isCoolingDown) return;

    const timeout = setTimeout(() => inputRef.current?.focus(), 220);
    return () => clearTimeout(timeout);
  }, [challenge.key, isCoolingDown, visible]);

  useEffect(() => {
    if (!isCoolingDown) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((cooldownUntilRef.current - Date.now()) / 1000));
      setCooldownRemaining(remaining);

      if (remaining === 0) {
        setAttempts(0);
        setHasFailed(false);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isCoolingDown]);

  const handleChangeText = useCallback((text: string) => {
    setValue(text.replace(/[^0-9]/g, "").slice(0, 3));
    setHasFailed(false);
  }, []);

  const handleConfirm = useCallback(() => {
    if (isCoolingDown || value.length === 0) return;

    if (Number(value) === challenge.answer) {
      // Semantic feedback only — never import expo-haptics directly.
      void triggerFeedback("mission_complete", { disableSound: true });
      setAttempts(0);
      setValue("");
      setHasFailed(false);
      onSuccess();
      return;
    }

    void triggerFeedback("theme_preview", { disableSound: true });

    if (!reduceMotion) {
      shakeX.value = withSequence(
        withSpring(10, springs.press),
        withSpring(-10, springs.press),
        withSpring(0, springs.press)
      );
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setValue("");
    setHasFailed(true);
    setChallenge((current) => createChallenge(current.key));

    if (nextAttempts >= MAX_ATTEMPTS) {
      cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
      setCooldownRemaining(Math.ceil(COOLDOWN_MS / 1000));
    }
  }, [attempts, challenge.answer, isCoolingDown, onSuccess, reduceMotion, shakeX, value]);

  const questionText = `Wie viel ist ${germanNumber(challenge.a)} plus ${germanNumber(challenge.b)}?`;
  const isConfirmDisabled = isCoolingDown || value.length === 0;

  return (
    <Dialog visible={visible} onClose={onCancel}>
      <Animated.View style={cardStyle}>
        <DialogContent className="rounded-card p-6" style={shadowPresets.shadowFloating}>
          <View className="items-center">
            <View
              className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary/40"
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Lock size={24} color={semanticColors.foreground} />
            </View>

            <View accessible accessibilityRole="header" accessibilityLabel={title}>
              <Text className="text-center font-headline text-xl text-card-foreground">
                {title}
              </Text>
              <Text className="mt-2 text-center font-body text-sm leading-5 text-muted-foreground">
                Bitte löse die Aufgabe, um fortzufahren.
              </Text>
            </View>

            <Animated.View style={shakeStyle} className="mt-5 w-full items-center">
              <Text className="text-center font-body-semibold text-lg leading-6 text-card-foreground">
                {questionText}
              </Text>

              <TextInput
                ref={inputRef}
                value={value}
                onChangeText={handleChangeText}
                onSubmitEditing={handleConfirm}
                editable={!isCoolingDown}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={3}
                placeholder="?"
                placeholderTextColor={semanticColors.mutedForeground}
                accessibilityLabel="Antwort eingeben"
                className="mt-4 h-14 w-32 rounded-tile border-2 border-input bg-card text-center font-headline text-xl text-foreground"
                // Fixed 56pt field — cap Dynamic Type so the answer stays visible.
                maxFontSizeMultiplier={1.2}
                style={{ letterSpacing: 4 }}
              />
            </Animated.View>

            {isCoolingDown ? (
              <Text
                className="mt-3 text-center font-body text-sm text-muted-foreground"
                accessibilityLiveRegion="polite"
              >
                {`Zu viele Versuche. Bitte warte noch ${cooldownRemaining} Sekunden.`}
              </Text>
            ) : hasFailed ? (
              <Text
                className="mt-3 text-center font-body text-sm"
                style={{ color: semanticColors.destructiveStrong }}
                accessibilityLiveRegion="polite"
              >
                Das stimmt leider nicht. Hier ist eine neue Aufgabe.
              </Text>
            ) : null}

            <View className="mt-6 w-full gap-3">
              <Button
                className={cn("w-full", isConfirmDisabled && "opacity-50")}
                disabled={isConfirmDisabled}
                accessibilityRole="button"
                accessibilityLabel="Antwort bestätigen"
                accessibilityState={{ disabled: isConfirmDisabled }}
                onPress={handleConfirm}
              >
                Bestätigen
              </Button>
              <Button
                variant="outline"
                className="w-full"
                accessibilityRole="button"
                accessibilityLabel="Abbrechen"
                onPress={onCancel}
              >
                Abbrechen
              </Button>
            </View>
          </View>
        </DialogContent>
      </Animated.View>
    </Dialog>
  );
}
