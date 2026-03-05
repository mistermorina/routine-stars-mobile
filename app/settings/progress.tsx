import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, Star } from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  // JS: 0 = Sunday, we want 0 = Monday
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatMonth(year: number, month: number): string {
  const months = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember",
  ];
  return `${months[month]} ${year}`;
}

export default function ProgressSettings() {
  const router = useRouter();
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const { getLogsForChild } = useActivityLogs();

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // Gather real completed days from logs
  const completedDays = useMemo(() => {
    if (selectedChildId) {
      const logs = getLogsForChild(selectedChildId);
      const daysFromLogs = new Set<number>();
      logs.forEach((log) => {
        const logDate = new Date(log.date);
        if (
          logDate.getFullYear() === currentYear &&
          logDate.getMonth() === currentMonth
        ) {
          daysFromLogs.add(logDate.getDate());
        }
      });
      return daysFromLogs;
    }
    return new Set<number>();
  }, [selectedChildId, currentYear, currentMonth, getLogsForChild]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  const isCurrentMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

  // Build calendar grid
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }
  // Fill remaining cells to complete last row
  while (calendarCells.length % 7 !== 0) {
    calendarCells.push(null);
  }

  const completedCount = completedDays.size;
  const totalDaysUpToToday = isCurrentMonth
    ? today.getDate()
    : daysInMonth;
  const completionRate =
    totalDaysUpToToday > 0
      ? Math.round((completedCount / totalDaysUpToToday) * 100)
      : 0;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-4 pb-8">
      {/* Child selector */}
      {children.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerClassName="gap-2"
        >
          {children.map((child) => (
            <Pressable
              key={child.id}
              onPress={() => selectChild(child.id)}
              className={cn(
                "flex-row items-center rounded-full px-4 py-2",
                selectedChildId === child.id
                  ? "bg-primary"
                  : "bg-card border border-border"
              )}
            >
              <Text className="text-lg mr-1.5">{child.avatar}</Text>
              <Text
                className={cn(
                  "text-sm font-body-semibold",
                  selectedChildId === child.id
                    ? "text-primary-foreground"
                    : "text-foreground"
                )}
              >
                {child.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* Month navigation */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable
          onPress={prevMonth}
          className="h-10 w-10 items-center justify-center rounded-lg active:bg-secondary"
        >
          <ChevronLeft size={24} color="#1a1a2e" />
        </Pressable>
        <Text className="text-lg font-headline text-foreground">
          {formatMonth(currentYear, currentMonth)}
        </Text>
        <Pressable
          onPress={nextMonth}
          className="h-10 w-10 items-center justify-center rounded-lg active:bg-secondary"
        >
          <ChevronRight size={24} color="#1a1a2e" />
        </Pressable>
      </View>

      {completedCount === 0 ? (
        <Card className="mb-4 items-center py-8">
          <Text className="text-lg font-headline text-foreground text-center">
            Noch kein Fortschritt vorhanden
          </Text>
          <Text className="mt-2 text-sm font-body text-muted-foreground text-center">
            Sobald Aufgaben erledigt werden, erscheint hier der echte Monatsverlauf.
          </Text>
          <Button className="mt-5" onPress={() => router.push("/(tabs)")}>
            Zu den Routinen
          </Button>
        </Card>
      ) : (
        <>
          {/* Calendar grid */}
          <Card className="mb-4">
        {/* Weekday headers */}
        <View className="flex-row mb-2">
          {WEEKDAY_LABELS.map((day) => (
            <View key={day} className="flex-1 items-center">
              <Text className="text-xs font-body-semibold text-muted-foreground">
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Day cells */}
        {Array.from({ length: calendarCells.length / 7 }).map((_, rowIdx) => (
          <View key={rowIdx} className="flex-row">
            {calendarCells.slice(rowIdx * 7, rowIdx * 7 + 7).map((day, colIdx) => {
              const isToday =
                isCurrentMonth && day === today.getDate();
              const isCompleted = day !== null && completedDays.has(day);
              const isFuture =
                day !== null &&
                new Date(currentYear, currentMonth, day) > today;

              return (
                <View
                  key={`${rowIdx}-${colIdx}`}
                  className="flex-1 items-center py-1.5"
                >
                  {day !== null ? (
                    <View
                      className={cn(
                        "h-10 w-10 items-center justify-center rounded-full",
                        isToday && "border-2 border-primary"
                      )}
                    >
                      {isCompleted ? (
                        <Star
                          size={20}
                          color="#FFD700"
                          fill="#FFD700"
                        />
                      ) : (
                        <Text
                          className={cn(
                            "text-sm font-body",
                            isFuture
                              ? "text-muted-foreground/50"
                              : "text-foreground"
                          )}
                        >
                          {day}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View className="h-10 w-10" />
                  )}
                </View>
              );
            })}
          </View>
        ))}
          </Card>

          {/* Stats summary */}
          <Card>
            <View className="flex-row items-center justify-around">
              <View className="items-center">
                <Text className="text-2xl font-headline text-foreground">
                  {completedCount}
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Tage erledigt
                </Text>
              </View>
              <View className="h-10 w-px bg-border" />
              <View className="items-center">
                <Text className="text-2xl font-headline text-foreground">
                  {completionRate}%
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Abschlussrate
                </Text>
              </View>
              <View className="h-10 w-px bg-border" />
              <View className="items-center">
                <Text className="text-2xl font-headline text-foreground">
                  {Math.max(totalDaysUpToToday - completedCount, 0)}
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  Tage übrig
                </Text>
              </View>
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  );
}
