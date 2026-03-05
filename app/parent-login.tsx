import React, { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { Lock } from "lucide-react-native";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { hasParentPin, saveParentPin, verifyParentPin } from "@/lib/parent-access";

type ParentLoginMode = "loading" | "setup" | "confirm" | "unlock";

export default function ParentLoginScreen() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<ParentLoginMode>("loading");
  const inputRef = useRef<TextInput>(null);

  const shakeX = useSharedValue(0);

  useEffect(() => {
    async function loadMode() {
      const pinExists = await hasParentPin();
      setMode(pinExists ? "unlock" : "setup");
    }

    loadMode();
  }, []);

  function triggerError() {
    setError(true);
    setPin("");
    shakeX.value = withSequence(
      withSpring(12, { damping: 2, stiffness: 500 }),
      withSpring(-12, { damping: 2, stiffness: 500 }),
      withSpring(8, { damping: 2, stiffness: 500 }),
      withSpring(-8, { damping: 2, stiffness: 500 }),
      withSpring(0, { damping: 4, stiffness: 400 })
    );
    inputRef.current?.focus();
  }

  async function handleCompletedPin(digits: string) {
    if (mode === "setup") {
      setFirstPin(digits);
      setPin("");
      setError(false);
      setMode("confirm");
      return;
    }

    if (mode === "confirm") {
      if (digits !== firstPin) {
        triggerError();
        setFirstPin("");
        setMode("setup");
        toast({
          title: "PIN stimmt nicht überein",
          description: "Bitte lege den Eltern-PIN noch einmal fest.",
          variant: "destructive",
        });
        return;
      }

      await saveParentPin(digits);
      auth.authorizeParent();
      toast({
        title: "Eltern-PIN gespeichert",
        description: "Der Eltern-Bereich ist jetzt geschützt.",
      });
      router.replace("/settings");
      return;
    }

    const isValid = await verifyParentPin(digits);
    if (!isValid) {
      triggerError();
      return;
    }

    setError(false);
    auth.authorizeParent();
    toast({ title: "Eltern-Bereich entsperrt" });
    router.replace("/settings");
  }

  async function handleSubmit() {
    if (pin.length !== 4) return;
    await handleCompletedPin(pin);
  }

  function handlePinChange(text: string) {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 4);
    setPin(digits);
    setError(false);

    if (digits.length === 4) {
      // Auto-submit when 4 digits entered
      setTimeout(() => {
        void handleCompletedPin(digits);
      }, 100);
    }
  }

  const isSetupMode = mode === "setup" || mode === "confirm";
  const title =
    mode === "confirm"
      ? "PIN bestätigen"
      : isSetupMode
        ? "Eltern-PIN festlegen"
        : "Eltern-Bereich";
  const description =
    mode === "confirm"
      ? "Bitte gib den neuen PIN noch einmal ein."
      : isSetupMode
        ? "Lege einen vierstelligen PIN fest, um die Einstellungen zu schützen."
        : "Bitte gib deinen vierstelligen Eltern-PIN ein.";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center p-6">
        {/* Lock Icon */}
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-primary/30">
          <Lock size={36} color="#1a1a2e" />
        </View>

        {/* Title */}
        <Text className="text-2xl font-headline text-foreground">
          {title}
        </Text>

        {/* Description */}
        <Text className="mt-2 text-base text-muted-foreground font-body text-center">
          {mode === "loading" ? "Einen Moment …" : description}
        </Text>

        {/* PIN Input */}
        <View className="mt-8 w-full max-w-[200px]">
          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={handlePinChange}
            secureTextEntry
            keyboardType="number-pad"
            maxLength={4}
            autoFocus
            style={{ height: 56, textAlign: "center", fontSize: 24, letterSpacing: 12 }}
            className={cn(
              "w-full rounded-xl border-2 bg-card font-headline text-foreground",
              error ? "border-destructive" : "border-input"
            )}
            selectionColor="#FFD700"
            placeholderTextColor="#737373"
            placeholder="----"
            editable={mode !== "loading"}
          />
        </View>

        {/* Error message */}
        {error && (
          <Text className="mt-3 text-sm font-body text-destructive">
            {mode === "confirm" ? "PIN stimmt nicht überein" : "Falscher PIN"}
          </Text>
        )}

        {/* PIN dots indicator */}
        <View className="mt-4 flex-row gap-3">
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              className={cn(
                "h-3 w-3 rounded-full",
                i < pin.length ? "bg-primary" : "bg-border"
              )}
            />
          ))}
        </View>

        {/* Submit button */}
        <View className="mt-8 w-full max-w-[200px]">
          <Button
            onPress={handleSubmit}
            disabled={pin.length !== 4 || mode === "loading"}
            className="w-full rounded-xl"
          >
            {isSetupMode ? "Speichern" : "Entsperren"}
          </Button>
        </View>

        {/* Cancel button */}
        <Pressable onPress={() => router.back()} className="mt-4 py-2">
          <Text className="text-base font-body text-muted-foreground">
            Abbrechen
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
