import React, { useCallback, useMemo, useState } from "react";
import { Linking, ScrollView, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { useFocusEffect } from "expo-router";

import {
  Bell,
  BellOff,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Settings,
  Sparkles,
  TriangleAlert,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PressableScale } from "@/components/ui/pressable-scale";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ThemedScreenBackground } from "@/components/ui/themed-screen-background";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { useChildren } from "@/hooks/use-children";
import { useRoutines } from "@/hooks/use-routines";
import { useToast } from "@/hooks/use-toast";
import { triggerFeedback } from "@/lib/feedback";
import { enterFade, enterStagger, exitFade } from "@/lib/motion";
import { getThemePalette, semanticColors, shadowPresets } from "@/lib/theme";
import {
  ensurePermissions,
  formatReminderSchedule,
  getNotificationSettings,
  getPermissionState,
  getScheduledRoutineNotifications,
  isReminderReady,
  scheduleTestNotification,
  setRoutineRemindersEnabled,
  syncRoutineReminders,
  whenRemindersSynced,
  type PermissionResult,
  type ScheduledReminder,
} from "@/lib/notifications";

/**
 * Parent-facing reminder settings. Everything on this screen reflects real
 * system state: the permission card reads iOS, the switches write to the
 * routines that actually get scheduled, and the list at the bottom shows
 * what is genuinely queued. No switch here promises a feature that is not
 * wired up.
 */

const PERMISSION_COPY: Record<
  PermissionResult["status"],
  { hero: string; title: string; body: string }
> = {
  granted: {
    hero: "Erinnerungen sind aktiv",
    title: "Erinnerungen sind erlaubt",
    body: "Routine Stars darf Erinnerungen auf diesem Gerät anzeigen. Geplant wird nur, was du unten einschaltest.",
  },
  undetermined: {
    hero: "Erinnerungen einschalten",
    title: "Noch keine Erlaubnis erteilt",
    body: "Damit sich eine Routine melden kann, braucht die App einmal deine Erlaubnis. Es wird nichts gesendet — die Erinnerung entsteht auf diesem Gerät.",
  },
  denied: {
    hero: "Erinnerungen sind blockiert",
    title: "Mitteilungen sind ausgeschaltet",
    body: "In den Geräte-Einstellungen sind Mitteilungen für Routine Stars deaktiviert. Solange das so bleibt, kann keine Erinnerung erscheinen.",
  },
  unsupported: {
    hero: "Hier nicht verfügbar",
    title: "Erinnerungen brauchen die App",
    body: "Geplante Erinnerungen funktionieren in der App auf einem Gerät oder im Simulator — im Browser gibt es sie nicht.",
  },
};

export default function NotificationsSettings() {
  const { selectedChild } = useChildren();
  const { routines, isLoading, setRoutineReminderEnabled } = useRoutines();
  const { toast } = useToast();

  const [permission, setPermission] = useState<PermissionResult | null>(null);
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [scheduled, setScheduled] = useState<ScheduledReminder[]>([]);
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const palette = getThemePalette(selectedChild?.theme);
  const status = permission?.status ?? "undetermined";
  const copy = PERMISSION_COPY[status];
  const isGranted = permission?.granted === true;
  const isSupported = status !== "unsupported";

  const refresh = useCallback(async () => {
    const [permissionState, settings, scheduledReminders] = await Promise.all([
      getPermissionState(),
      getNotificationSettings(),
      getScheduledRoutineNotifications(),
    ]);

    setPermission(permissionState);
    setMasterEnabled(settings.routineReminders);
    setScheduled(scheduledReminders);
  }, []);

  // Re-reads on every focus, so a trip to the system settings and back
  // shows the truth instead of a stale "blockiert".
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  const reminderRoutines = useMemo(
    () =>
      routines.map((routine) => ({
        routine,
        summary: formatReminderSchedule(routine),
        isReady: isReminderReady(routine),
        isEnabled: routine.reminders?.enabled === true,
      })),
    [routines]
  );

  const activeCount = scheduled.length;

  async function handleEnablePermissions() {
    if (isBusy) return;
    setIsBusy(true);

    const result = await ensurePermissions();
    setPermission(result);

    if (result.granted) {
      await syncRoutineReminders(routines);
      toast({ title: "Erinnerungen sind aktiviert" });
    } else if (result.status === "denied") {
      toast({
        title: "Erinnerungen sind blockiert",
        description: "Du kannst sie in den Geräte-Einstellungen wieder erlauben.",
        variant: "destructive",
      });
    }

    await refresh();
    setIsBusy(false);
  }

  function handleOpenSystemSettings() {
    Linking.openSettings().catch(() => {
      toast({
        title: "Einstellungen konnten nicht geöffnet werden",
        variant: "destructive",
      });
    });
  }

  async function handleToggleMaster(next: boolean) {
    if (isBusy) return;
    setIsBusy(true);
    setMasterEnabled(next);
    void triggerFeedback("theme_preview", { disableSound: true });

    await setRoutineRemindersEnabled(next);
    await syncRoutineReminders(routines);
    await refresh();

    toast({
      title: next ? "Routinen-Erinnerungen an" : "Routinen-Erinnerungen aus",
      description: next
        ? "Es werden nur Routinen geplant, die unten eingeschaltet sind."
        : "Alle geplanten Erinnerungen wurden entfernt.",
    });
    setIsBusy(false);
  }

  async function handleToggleRoutine(routineId: string, name: string, next: boolean) {
    if (isBusy) return;
    setIsBusy(true);
    void triggerFeedback("theme_preview", { disableSound: true });

    // The hook rebuilds the schedule for us; wait for that queue before
    // reading the list back, otherwise the parent sees the old state.
    await setRoutineReminderEnabled(routineId, next);
    await whenRemindersSynced();
    await refresh();

    toast({
      title: next ? `Erinnerung für ${name} an` : `Erinnerung für ${name} aus`,
    });
    setIsBusy(false);
  }

  async function handleTestNotification() {
    if (isBusy) return;
    setIsBusy(true);

    const result = await scheduleTestNotification();
    if (result.scheduled) {
      toast({
        title: "Test-Erinnerung unterwegs",
        description: "Sie erscheint in etwa 5 Sekunden.",
      });
    } else {
      toast({
        title: "Test-Erinnerung nicht möglich",
        description: "Erlaube zuerst Mitteilungen für Routine Stars.",
        variant: "destructive",
      });
    }

    await refresh();
    setIsBusy(false);
  }

  function handleToggleSchedule() {
    void triggerFeedback("theme_preview", { disableSound: true });
    setIsScheduleExpanded((current) => !current);
  }

  const ScheduleChevron = isScheduleExpanded ? ChevronUp : ChevronDown;
  const cardStyle = {
    backgroundColor: palette.cardTint,
    borderColor: palette.accentBorder,
    ...shadowPresets.shadowCard,
  };

  return (
    <ThemedScreenBackground
      theme={selectedChild?.theme}
      backgroundSkin={selectedChild?.backgroundSkin}
    >
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-8">
        <Animated.View entering={enterStagger(0)}>
          <SettingsHeroCard
            label="Erinnerungen"
            title={copy.hero}
            description="Routine Stars erinnert direkt auf diesem Gerät — ohne Konto, ohne Server, ohne Nachricht an jemand anderen."
            badges={
              activeCount > 0
                ? [{ value: activeCount, label: "geplant" }]
                : [{ label: "Nichts geplant" }]
            }
            palette={palette}
          />
        </Animated.View>

        {/* Permission master card */}
        <Animated.View entering={enterStagger(1)}>
          <Card className="mb-4 rounded-card" style={cardStyle}>
            <View className="flex-row items-start gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-tile"
                style={{
                  backgroundColor: isGranted
                    ? semanticColors.successSoft
                    : status === "denied"
                      ? semanticColors.warningSoft
                      : palette.heroSurface,
                }}
              >
                {isGranted ? (
                  <CheckCircle2 size={20} color={semanticColors.successStrong} />
                ) : status === "denied" ? (
                  <TriangleAlert size={20} color={semanticColors.warningForeground} />
                ) : status === "unsupported" ? (
                  <BellOff size={20} color={palette.accentStrong} />
                ) : (
                  <Bell size={20} color={palette.accentStrong} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-lg font-headline text-foreground">{copy.title}</Text>
                <Text className="mt-1 text-sm font-body leading-6 text-muted-foreground">
                  {copy.body}
                </Text>
              </View>
            </View>

            {status === "undetermined" ? (
              <Button
                onPress={() => void handleEnablePermissions()}
                disabled={isBusy}
                accessibilityRole="button"
                accessibilityLabel="Erinnerungen aktivieren"
                accessibilityHint="Fragt die Erlaubnis für Mitteilungen an"
                className="mt-4 w-full rounded-card"
                style={{ backgroundColor: palette.button }}
              >
                <View className="flex-row items-center gap-2">
                  <Bell size={18} color={semanticColors.primaryForeground} />
                  <Text
                    className="text-base font-body-semibold text-primary-foreground"
                    maxFontSizeMultiplier={1.3}
                  >
                    Erinnerungen aktivieren
                  </Text>
                </View>
              </Button>
            ) : null}

            {status === "denied" ? (
              <Button
                variant="outline"
                onPress={handleOpenSystemSettings}
                accessibilityRole="button"
                accessibilityLabel="Einstellungen öffnen"
                accessibilityHint="Öffnet die Mitteilungs-Einstellungen des Geräts"
                className="mt-4 w-full rounded-card border"
                style={{
                  borderColor: palette.accentBorder,
                  backgroundColor: "rgba(255,255,255,0.82)",
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Settings size={18} color={palette.accentText} />
                  <Text
                    className="text-base font-body-semibold"
                    style={{ color: palette.accentText }}
                    maxFontSizeMultiplier={1.3}
                  >
                    Einstellungen öffnen
                  </Text>
                </View>
              </Button>
            ) : null}

            {isGranted ? (
              <Button
                variant="outline"
                onPress={() => void handleTestNotification()}
                disabled={isBusy}
                accessibilityRole="button"
                accessibilityLabel="Test-Erinnerung senden"
                accessibilityHint="Zeigt in etwa 5 Sekunden eine Beispiel-Erinnerung"
                className="mt-4 w-full rounded-card border"
                style={{
                  borderColor: palette.accentBorder,
                  backgroundColor: "rgba(255,255,255,0.82)",
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Sparkles size={18} color={palette.accentText} />
                  <Text
                    className="text-base font-body-semibold"
                    style={{ color: palette.accentText }}
                    maxFontSizeMultiplier={1.3}
                  >
                    Test-Erinnerung senden
                  </Text>
                </View>
              </Button>
            ) : null}
          </Card>
        </Animated.View>

        {/* Master switch for all routine reminders */}
        {isSupported ? (
          <Animated.View entering={enterStagger(2)}>
            <Card className="mb-4 rounded-card" style={cardStyle}>
              <View className="min-h-11 flex-row items-center gap-3">
                <View
                  className="h-11 w-11 items-center justify-center rounded-tile"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  {masterEnabled ? (
                    <Bell size={20} color={palette.accentStrong} />
                  ) : (
                    <BellOff size={20} color={palette.accentStrong} />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-base font-body-semibold text-foreground">
                    Routinen-Erinnerungen
                  </Text>
                  <Text className="mt-0.5 text-sm font-body leading-5 text-muted-foreground">
                    Der Hauptschalter. Ist er aus, bleibt jede einzelne Routine stumm.
                  </Text>
                </View>
                <Switch
                  checked={masterEnabled}
                  disabled={isBusy}
                  onCheckedChange={(value) => void handleToggleMaster(value)}
                />
              </View>
            </Card>
          </Animated.View>
        ) : null}

        {/* Per-routine reminders */}
        <Animated.View entering={enterStagger(3)}>
          <Card className="mb-4 overflow-hidden rounded-card p-0" style={cardStyle}>
            <View className="px-4 pt-4">
              <Text className="text-lg font-headline text-foreground">Deine Routinen</Text>
              <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                Eine Erinnerung braucht Wochentage und eine Uhrzeit. Beides legst du in
                „Routinen bearbeiten“ fest.
              </Text>
            </View>

            {isSupported && isGranted && !masterEnabled ? (
              <View className="mx-4 mt-3 flex-row items-start gap-2 rounded-tile bg-warning-soft px-3 py-2.5">
                <TriangleAlert size={16} color={semanticColors.warningForeground} />
                <Text className="flex-1 text-sm font-body leading-5 text-warning-foreground">
                  Der Hauptschalter oben ist aus — diese Auswahl wird gemerkt, aber noch nicht
                  geplant.
                </Text>
              </View>
            ) : null}

            {isSupported && !isGranted ? (
              <View className="mx-4 mt-3 flex-row items-start gap-2 rounded-tile bg-warning-soft px-3 py-2.5">
                <TriangleAlert size={16} color={semanticColors.warningForeground} />
                <Text className="flex-1 text-sm font-body leading-5 text-warning-foreground">
                  Ohne erlaubte Mitteilungen wird deine Auswahl nur gespeichert, aber nicht
                  angezeigt.
                </Text>
              </View>
            ) : null}

            <View className="mt-3">
              {isLoading ? (
                <View
                  className="gap-3 px-4 pb-4"
                  accessibilityLabel="Routinen werden geladen"
                >
                  <SkeletonCard lines={2} />
                  <SkeletonCard lines={2} />
                </View>
              ) : reminderRoutines.length === 0 ? (
                <Text className="px-4 pb-4 text-sm font-body leading-5 text-muted-foreground">
                  Noch keine Routine angelegt. Sobald es eine gibt, kannst du sie hier
                  erinnern lassen.
                </Text>
              ) : (
                reminderRoutines.map(({ routine, summary, isReady, isEnabled }, index) => (
                  <View key={routine.id}>
                    <View className="min-h-11 flex-row items-center px-4 py-3">
                      <View
                        className="h-11 w-11 items-center justify-center rounded-tile"
                        style={{ backgroundColor: palette.heroSurface }}
                      >
                        <CalendarDays size={20} color={palette.accentStrong} />
                      </View>

                      <View className="ml-3 flex-1">
                        <Text
                          className="text-base font-body-semibold text-foreground"
                          numberOfLines={1}
                          maxFontSizeMultiplier={1.3}
                        >
                          {routine.name}
                        </Text>

                        {isReady && summary ? (
                          <View className="mt-1 flex-row items-center gap-1.5">
                            <Clock size={14} color={semanticColors.mutedForeground} />
                            <Text
                              className="text-sm font-body text-muted-foreground"
                              maxFontSizeMultiplier={1.4}
                              numberOfLines={1}
                            >
                              {summary}
                            </Text>
                          </View>
                        ) : (
                          <Text className="mt-1 text-sm font-body leading-5 text-muted-foreground">
                            Lege im Routinen-Editor Wochentage und Uhrzeit fest.
                          </Text>
                        )}
                      </View>

                      {isReady ? (
                        <View className="ml-3">
                          <Switch
                            checked={isEnabled}
                            disabled={isBusy}
                            onCheckedChange={(value) =>
                              void handleToggleRoutine(routine.id, routine.name, value)
                            }
                          />
                        </View>
                      ) : null}
                    </View>

                    {index < reminderRoutines.length - 1 ? <Separator /> : null}
                  </View>
                ))
              )}
            </View>
          </Card>
        </Animated.View>

        {/* What is actually queued on the device */}
        {isSupported ? (
          <Animated.View entering={enterStagger(4)}>
            <Card className="overflow-hidden rounded-card p-0" style={cardStyle}>
              <PressableScale
                onPress={handleToggleSchedule}
                className="min-h-11 flex-row items-center px-4 py-4"
                accessibilityRole="button"
                accessibilityLabel="Geplante Erinnerungen"
                accessibilityHint={isScheduleExpanded ? "Liste schließen" : "Liste öffnen"}
                accessibilityState={{ expanded: isScheduleExpanded }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-tile"
                  style={{ backgroundColor: palette.heroSurface }}
                >
                  <Clock size={20} color={palette.accentStrong} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-body-semibold text-foreground">
                    Geplante Erinnerungen
                  </Text>
                  <Text className="mt-0.5 text-sm font-body leading-5 text-muted-foreground">
                    {activeCount === 0
                      ? "Zurzeit ist nichts geplant."
                      : activeCount === 1
                        ? "1 Erinnerung liegt auf dem Gerät bereit."
                        : `${activeCount} Erinnerungen liegen auf dem Gerät bereit.`}
                  </Text>
                </View>
                <ScheduleChevron
                  size={18}
                  color={palette.accentText}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              </PressableScale>

              {isScheduleExpanded ? (
                <Animated.View entering={enterFade()} exiting={exitFade()} className="pb-2">
                  <Separator />
                  {scheduled.length === 0 ? (
                    <Text className="px-4 py-4 text-sm font-body leading-5 text-muted-foreground">
                      Sobald du oben eine Routine einschaltest, erscheint hier jeder geplante
                      Termin.
                    </Text>
                  ) : (
                    scheduled.map((reminder) => (
                      <View
                        key={reminder.identifier}
                        className="mx-4 mt-3 rounded-tile px-3 py-2.5"
                        style={{ backgroundColor: palette.heroSurface }}
                      >
                        <View className="flex-row items-center justify-between gap-3">
                          <Text
                            className="flex-1 text-base font-body-semibold text-foreground"
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.3}
                          >
                            {reminder.routineName ?? "Routine"}
                          </Text>
                          <Text
                            className="text-base font-body-semibold"
                            style={{ color: palette.accentText }}
                            maxFontSizeMultiplier={1.4}
                          >
                            {reminder.weekday ?? "—"} · {reminder.time ?? "—"}
                          </Text>
                        </View>
                        <Text
                          className="mt-1 text-xs font-body text-muted-foreground"
                          numberOfLines={1}
                          maxFontSizeMultiplier={1.3}
                        >
                          {reminder.identifier}
                        </Text>
                      </View>
                    ))
                  )}
                </Animated.View>
              ) : null}
            </Card>
          </Animated.View>
        ) : null}
      </ScrollView>
    </ThemedScreenBackground>
  );
}
