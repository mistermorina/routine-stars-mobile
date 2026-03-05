import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Star, Clock, BarChart3 } from "lucide-react-native";
import { useChildren } from "@/hooks/use-children";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivityLog } from "@/lib/types";

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.getTime() === today.getTime()) return "Heute";
  if (date.getTime() === yesterday.getTime()) return "Gestern";

  const dayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const monthNames = [
    "Jan", "Feb", "Mär", "Apr", "Mai", "Jun",
    "Jul", "Aug", "Sep", "Okt", "Nov", "Dez",
  ];

  return `${dayNames[date.getDay()]}, ${date.getDate()}. ${monthNames[date.getMonth()]}`;
}

interface GroupedLogs {
  date: string;
  label: string;
  entries: ActivityLog[];
  totalStars: number;
}

export default function StatsSettings() {
  const router = useRouter();
  const { children, selectedChild, selectedChildId, selectChild } = useChildren();
  const { getLogsForChild } = useActivityLogs();

  const groupedLogs = useMemo<GroupedLogs[]>(() => {
    if (!selectedChildId) return [];

    const logs = getLogsForChild(selectedChildId);

    // Sort logs by date descending
    const sorted = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group by date
    const groups: Map<string, ActivityLog[]> = new Map();
    sorted.forEach((log) => {
      const existing = groups.get(log.date) || [];
      existing.push(log);
      groups.set(log.date, existing);
    });

    return Array.from(groups.entries()).map(([date, entries]) => ({
      date,
      label: formatDateLabel(date),
      entries,
      totalStars: entries.reduce((sum, e) => sum + e.stars, 0),
    }));
  }, [selectedChildId, getLogsForChild]);

  const totalStarsAllTime = groupedLogs.reduce((s, g) => s + g.totalStars, 0);
  const totalActivities = groupedLogs.reduce((s, g) => s + g.entries.length, 0);

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

      {/* Summary card */}
      {selectedChild && groupedLogs.length > 0 && (
        <Card className="mb-4">
          <View className="flex-row items-center justify-around">
            <View className="items-center">
              <View className="flex-row items-center gap-1">
                <Star size={18} color="#FFD700" fill="#FFD700" />
                <Text className="text-xl font-headline text-foreground">
                  {totalStarsAllTime}
                </Text>
              </View>
              <Text className="text-xs font-body text-muted-foreground">
                Sterne verdient
              </Text>
            </View>
            <View className="h-10 w-px bg-border" />
            <View className="items-center">
              <View className="flex-row items-center gap-1">
                <BarChart3 size={18} color="#87CEEB" />
                <Text className="text-xl font-headline text-foreground">
                  {totalActivities}
                </Text>
              </View>
              <Text className="text-xs font-body text-muted-foreground">
                Aktivitäten
              </Text>
            </View>
            <View className="h-10 w-px bg-border" />
            <View className="items-center">
              <View className="flex-row items-center gap-1">
                <Clock size={18} color="#737373" />
                <Text className="text-xl font-headline text-foreground">
                  {groupedLogs.length}
                </Text>
              </View>
              <Text className="text-xs font-body text-muted-foreground">
                Tage aktiv
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Activity log list */}
      {groupedLogs.length === 0 ? (
        <View className="items-center justify-center py-16">
          <BarChart3 size={48} color="#D4D4D4" />
          <Text className="mt-4 text-lg font-headline text-foreground text-center">
            Noch keine Aktivitäten
          </Text>
          <Text className="mt-2 text-sm font-body text-muted-foreground text-center">
            Sobald Aufgaben erledigt werden, erscheinen hier die echten Einträge.
          </Text>
          <Button className="mt-5" onPress={() => router.push("/(tabs)")}>
            Zu den Routinen
          </Button>
        </View>
      ) : (
        groupedLogs.map((group) => (
          <View key={group.date} className="mb-4">
            {/* Date header */}
            <View className="flex-row items-center justify-between mb-2 px-1">
              <Text className="text-sm font-headline text-foreground">
                {group.label}
              </Text>
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text className="text-sm font-body-semibold text-muted-foreground">
                  {group.totalStars}
                </Text>
              </View>
            </View>

            <Card className="p-0 overflow-hidden">
              {group.entries.map((entry, idx) => (
                <View key={entry.id}>
                  <View className="flex-row items-center px-4 py-3">
                    <View className="flex-1">
                      <Text className="text-base font-body text-foreground">
                        {entry.taskTitle}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Star size={14} color="#FFD700" fill="#FFD700" />
                      <Text className="text-sm font-body-semibold text-foreground">
                        +{entry.stars}
                      </Text>
                    </View>
                  </View>
                  {idx < group.entries.length - 1 && <Separator />}
                </View>
              ))}
            </Card>
          </View>
        ))
      )}
    </ScrollView>
  );
}
