import React, { useCallback, useMemo, useState } from "react";
import { Modal, Platform, Text, TextInput, View } from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Animated from "react-native-reanimated";

import { PressableScale } from "@/components/ui/pressable-scale";
import { Switch } from "@/components/ui/switch";
import { triggerFeedback } from "@/lib/feedback";
import { Bell, Clock, X } from "@/lib/icons";
import { WEEKDAY_ORDER, formatWeekdaySummary } from "@/lib/local-date";
import { enterFade, exitFade } from "@/lib/motion";
import {
  getThemePalette,
  semanticColors,
  shadowPresets,
  type ThemePalette,
} from "@/lib/theme";
import type { Routine, Weekday } from "@/lib/types";

/**
 * Long weekday names for screen readers. The Mo→So ORDER itself lives in
 * lib/local-date.ts (`WEEKDAY_ORDER`) — never redeclare it here.
 */
const WEEKDAY_NAMES: Record<Weekday, string> = {
  Mo: "Montag",
  Di: "Dienstag",
  Mi: "Mittwoch",
  Do: "Donnerstag",
  Fr: "Freitag",
  Sa: "Samstag",
  So: "Sonntag",
};

const WORKDAYS: Weekday[] = ["Mo", "Di", "Mi", "Do", "Fr"];
const WEEKEND: Weekday[] = ["Sa", "So"];

const QUICK_SELECTS: { id: string; label: string; days: Weekday[] }[] = [
  { id: "daily", label: "Täglich", days: [...WEEKDAY_ORDER] },
  { id: "workdays", label: "Wochentage", days: WORKDAYS },
  { id: "weekend", label: "Wochenende", days: WEEKEND },
];

/** Matches "HH:mm" in 24h notation — the only accepted persisted format. */
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DEFAULT_HOUR = 7;
const DEFAULT_MINUTE = 30;
const CHIP_GAP = 8;
const CHIPS_PER_ROW = 5;
const MIN_CHIP_SIZE = 44;

export const REMINDER_MESSAGE_MAX_LENGTH = 80;

/* ------------------------------------------------------------------ *
 * Pure helpers — exported so the routine editor can reuse them in its
 * save path instead of re-implementing the same validation.
 * ------------------------------------------------------------------ */

export function isValidScheduleTime(value: unknown): value is string {
  return typeof value === "string" && TIME_PATTERN.test(value);
}

/** Omits `time` entirely instead of persisting an `undefined` key. */
function buildSchedule(days: Weekday[], time: string | undefined): NonNullable<Routine["schedule"]> {
  return time ? { days, time } : { days };
}

function buildReminders(
  enabled: boolean,
  message: string | undefined
): NonNullable<Routine["reminders"]> {
  return message ? { enabled, message } : { enabled };
}

function readDays(schedule: Routine["schedule"]): Weekday[] {
  const days = schedule?.days;
  const list = Array.isArray(days) ? days : [];
  // Filtering the canonical order in one pass validates, dedupes and sorts.
  return WEEKDAY_ORDER.filter((day) => list.includes(day));
}

function sameDays(a: Weekday[], b: Weekday[]): boolean {
  return a.length === b.length && a.every((day, index) => day === b[index]);
}

/** Drops unknown weekdays, dedupes, sorts Mo→So and validates the time. */
export function sanitizeSchedule(schedule: Routine["schedule"]): Routine["schedule"] {
  const days = readDays(schedule);
  const time = isValidScheduleTime(schedule?.time) ? schedule.time : undefined;
  if (days.length === 0 && !time) return undefined;
  return buildSchedule(days, time);
}

/** Trims + caps the message, drops the object entirely when nothing is set. */
export function sanitizeReminders(reminders: Routine["reminders"]): Routine["reminders"] {
  const enabled = reminders?.enabled === true;
  const raw = typeof reminders?.message === "string" ? reminders.message.trim() : "";
  const message = raw.length > 0 ? raw.slice(0, REMINDER_MESSAGE_MAX_LENGTH) : undefined;
  if (!enabled && !message) return undefined;
  return buildReminders(enabled, message);
}

/** Builds a "runs every day at HH:mm" schedule, e.g. from a template hint. */
export function createScheduleFromTime(time: string | undefined): Routine["schedule"] {
  return isValidScheduleTime(time) ? buildSchedule([], time) : undefined;
}

/** One-line German summary for collapsed sections and list rows. */
export function describeSchedule(
  schedule: Routine["schedule"],
  reminders?: Routine["reminders"]
): string {
  const dayPart = formatWeekdaySummary(readDays(schedule));
  const timePart = isValidScheduleTime(schedule?.time)
    ? `${schedule.time} Uhr`
    : "ohne Uhrzeit";
  const reminderPart = reminders?.enabled ? "Erinnerung an" : "Erinnerung aus";

  return `${dayPart} • ${timePart} • ${reminderPart}`;
}

function timeToDate(value: string | undefined): Date {
  const match = typeof value === "string" ? TIME_PATTERN.exec(value) : null;
  const next = new Date();
  next.setHours(
    match ? Number(match[1]) : DEFAULT_HOUR,
    match ? Number(match[2]) : DEFAULT_MINUTE,
    0,
    0
  );
  return next;
}

function dateToTime(date: Date): string {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

/* ------------------------------------------------------------------ */

export interface ScheduleEditorProps {
  schedule: Routine["schedule"];
  reminders: Routine["reminders"];
  onChange: (schedule: Routine["schedule"], reminders: Routine["reminders"]) => void;
  /** Family palette so the editor matches the surrounding parent screen. */
  palette?: ThemePalette;
}

/**
 * Weekday chips + time picker + reminder toggle for a routine.
 *
 * Fully controlled: every interaction emits the complete next
 * `schedule` / `reminders` pair. An empty weekday set is meaningful —
 * it means "every day" (same rule the dashboard uses to decide whether a
 * routine is due today), so it is never auto-filled.
 */
export function ScheduleEditor({
  schedule,
  reminders,
  onChange,
  palette = getThemePalette(),
}: ScheduleEditorProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerValue, setPickerValue] = useState(() => timeToDate(schedule?.time));
  const [chipRowWidth, setChipRowWidth] = useState(0);

  const selectedDays = useMemo(() => readDays(schedule), [schedule]);
  const time = isValidScheduleTime(schedule?.time) ? schedule.time : undefined;
  const remindersEnabled = reminders?.enabled === true;
  const reminderMessage =
    typeof reminders?.message === "string" ? reminders.message : "";

  // All seven chips share one width so the 5 + 2 wrap reads as a grid.
  const chipWidth =
    chipRowWidth > 0
      ? Math.max(
          MIN_CHIP_SIZE,
          (chipRowWidth - CHIP_GAP * (CHIPS_PER_ROW - 1)) / CHIPS_PER_ROW
        )
      : undefined;

  const emitSchedule = useCallback(
    (nextDays: Weekday[], nextTime: string | undefined) => {
      const nextSchedule =
        nextDays.length === 0 && !nextTime ? undefined : buildSchedule(nextDays, nextTime);
      onChange(nextSchedule, reminders);
    },
    [onChange, reminders]
  );

  const emitReminders = useCallback(
    (enabled: boolean, message: string) => {
      const nextMessage = message.length > 0 ? message : undefined;
      const nextReminders =
        !enabled && !nextMessage ? undefined : buildReminders(enabled, nextMessage);
      onChange(schedule, nextReminders);
    },
    [onChange, schedule]
  );

  const toggleDay = (day: Weekday) => {
    void triggerFeedback("theme_preview", { disableSound: true });
    const nextDays = selectedDays.includes(day)
      ? selectedDays.filter((entry) => entry !== day)
      : WEEKDAY_ORDER.filter((entry) => entry === day || selectedDays.includes(entry));
    emitSchedule(nextDays, time);
  };

  const applyQuickSelect = (days: Weekday[]) => {
    void triggerFeedback("theme_preview", { disableSound: true });
    // Tapping the active preset again clears it back to "every day".
    emitSchedule(sameDays(selectedDays, days) ? [] : days, time);
  };

  const openPicker = () => {
    setPickerValue(timeToDate(time));
    setPickerVisible(true);
  };

  const clearTime = () => {
    void triggerFeedback("theme_preview", { disableSound: true });
    emitSchedule(selectedDays, undefined);
  };

  const confirmTime = (value: Date) => {
    void triggerFeedback("theme_preview", { disableSound: true });
    emitSchedule(selectedDays, dateToTime(value));
    setPickerVisible(false);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === "set" && date) {
      confirmTime(date);
      return;
    }
    setPickerVisible(false);
  };

  return (
    <View className="gap-5">
      {/* --- Weekdays ------------------------------------------------ */}
      <View className="gap-2.5">
        <Text className="font-body-semibold text-base leading-6 text-foreground">
          Wochentage
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {QUICK_SELECTS.map((preset) => {
            const isActive = sameDays(selectedDays, preset.days);
            return (
              <PressableScale
                key={preset.id}
                onPress={() => applyQuickSelect(preset.days)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Wochentage ${preset.label}`}
                className="min-h-11 items-center justify-center rounded-chip px-4"
                style={{
                  backgroundColor: isActive ? palette.tabActiveBg : semanticColors.card,
                  borderWidth: 1,
                  borderColor: isActive ? palette.accentBorder : semanticColors.border,
                  ...shadowPresets.shadowSubtle,
                }}
              >
                <Text
                  className="font-body-semibold text-sm"
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                  style={{
                    color: isActive ? palette.accentText : semanticColors.mutedForeground,
                  }}
                >
                  {preset.label}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        <View
          className="flex-row flex-wrap gap-2"
          onLayout={(event) => setChipRowWidth(event.nativeEvent.layout.width)}
        >
          {WEEKDAY_ORDER.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <PressableScale
                key={day}
                onPress={() => toggleDay(day)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={WEEKDAY_NAMES[day]}
                containerStyle={chipWidth ? { width: chipWidth } : undefined}
                className="h-11 items-center justify-center rounded-chip"
                style={{
                  minWidth: MIN_CHIP_SIZE,
                  backgroundColor: isSelected ? palette.button : semanticColors.card,
                  borderWidth: 1,
                  borderColor: isSelected ? palette.button : semanticColors.border,
                  ...shadowPresets.shadowSubtle,
                }}
              >
                <Text
                  className="font-body-semibold text-sm"
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.2}
                  style={{
                    color: isSelected
                      ? semanticColors.accentForeground
                      : semanticColors.foreground,
                  }}
                >
                  {day}
                </Text>
              </PressableScale>
            );
          })}
        </View>

        {selectedDays.length === 0 ? (
          <Animated.View entering={enterFade()} exiting={exitFade()}>
            <Text className="font-body text-sm leading-5 text-muted-foreground">
              Ohne Wochentage erscheint die Routine jeden Tag.
            </Text>
          </Animated.View>
        ) : null}
      </View>

      {/* --- Time ---------------------------------------------------- */}
      <View className="gap-2.5">
        <Text className="font-body-semibold text-base leading-6 text-foreground">
          Uhrzeit
        </Text>

        <View className="flex-row items-center gap-2">
          <PressableScale
            onPress={openPicker}
            accessibilityRole="button"
            accessibilityLabel={
              time ? `Uhrzeit ändern, aktuell ${time} Uhr` : "Uhrzeit festlegen"
            }
            containerClassName="flex-1"
            className="min-h-14 flex-row items-center justify-between rounded-tile border border-input bg-card px-4 py-3"
          >
            <View className="mr-3 flex-1 flex-row items-center gap-2.5">
              <Clock size={18} color={palette.accentStrong} />
              <Text
                className="flex-1 font-body text-base leading-6 text-muted-foreground"
                numberOfLines={1}
              >
                {time ? "Startzeit" : "Keine feste Uhrzeit"}
              </Text>
            </View>
            <Text
              className="font-body-semibold text-base"
              maxFontSizeMultiplier={1.3}
              style={{ color: palette.accentText }}
            >
              {time ? `${time} Uhr` : "Wählen"}
            </Text>
          </PressableScale>

          {time ? (
            <PressableScale
              onPress={clearTime}
              accessibilityRole="button"
              accessibilityLabel="Uhrzeit entfernen"
              className="h-11 w-11 items-center justify-center rounded-full bg-muted"
            >
              <X size={18} color={semanticColors.mutedForeground} />
            </PressableScale>
          ) : null}
        </View>
      </View>

      {/* --- Reminder ------------------------------------------------ */}
      <View className="gap-2.5">
        <View className="min-h-14 flex-row items-center justify-between rounded-tile border border-input bg-card px-4 py-3">
          <View className="mr-3 flex-1 flex-row items-center gap-2.5">
            <Bell size={18} color={palette.accentStrong} />
            <Text
              className="flex-1 font-body-semibold text-base leading-6 text-foreground"
              numberOfLines={2}
            >
              Erinnerung senden
            </Text>
          </View>
          <Switch
            checked={remindersEnabled}
            onCheckedChange={(next) => {
              void triggerFeedback("theme_preview", { disableSound: true });
              emitReminders(next, reminderMessage);
            }}
          />
        </View>

        {remindersEnabled ? (
          <Animated.View entering={enterFade()} exiting={exitFade()} className="gap-1.5">
            <TextInput
              value={reminderMessage}
              onChangeText={(value) => emitReminders(true, value)}
              placeholder="Eigene Nachricht (optional)"
              placeholderTextColor={semanticColors.mutedForeground}
              maxLength={REMINDER_MESSAGE_MAX_LENGTH}
              accessibilityLabel="Eigene Erinnerungsnachricht"
              className="min-h-12 rounded-tile border border-input bg-card px-4 py-3"
              style={{
                fontFamily: "Poppins_400Regular",
                fontSize: 16,
                lineHeight: 20,
                color: semanticColors.foreground,
              }}
            />
            <Text className="px-1 font-body text-xs text-muted-foreground">
              {reminderMessage.length}/{REMINDER_MESSAGE_MAX_LENGTH} Zeichen
            </Text>
          </Animated.View>
        ) : null}
      </View>

      {/* --- Time picker surface ------------------------------------- */}
      {pickerVisible && Platform.OS !== "ios" ? (
        <DateTimePicker
          value={pickerValue}
          mode="time"
          display="spinner"
          is24Hour
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === "ios" ? (
        <Modal
          visible={pickerVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPickerVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View
              className="rounded-t-card bg-background px-5 pb-10 pt-5"
              style={shadowPresets.shadowFloating}
            >
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="font-headline text-xl text-foreground">
                  Uhrzeit wählen
                </Text>
                <PressableScale
                  onPress={() => setPickerVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Uhrzeitauswahl schließen"
                  className="h-11 w-11 items-center justify-center rounded-full bg-muted"
                >
                  <X size={20} color={semanticColors.mutedForeground} />
                </PressableScale>
              </View>

              <DateTimePicker
                value={pickerValue}
                mode="time"
                display="spinner"
                locale="de-DE"
                onChange={(_event: DateTimePickerEvent, date?: Date) => {
                  if (date) setPickerValue(date);
                }}
              />

              <PressableScale
                onPress={() => confirmTime(pickerValue)}
                accessibilityRole="button"
                accessibilityLabel="Uhrzeit übernehmen"
                className="mt-2 min-h-14 items-center justify-center rounded-tile"
                style={{ backgroundColor: palette.button }}
              >
                <Text
                  className="font-body-semibold text-base"
                  style={{ color: semanticColors.accentForeground }}
                >
                  Übernehmen
                </Text>
              </PressableScale>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
