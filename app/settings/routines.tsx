import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import {
  Check,
  ChevronDown,
  GripVertical,
  Minus,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconPicker } from "@/components/ui/icon-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TemplateSelector } from "@/components/routine-templates/template-selector";
import { ToastOverlay } from "@/components/ui/toast";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { useRoutines } from "@/hooks/use-routines";
import { getDefaultRoutineColor } from "@/lib/default-values";
import { getIcon } from "@/lib/icons";
import { getThemePalette } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { Routine, RoutineTemplate, Task } from "@/lib/types";

const ROUTINE_COLORS = [
  "#F59E0B",
  "#8B5CF6",
  "#3B82F6",
  "#14B8A6",
  "#F97316",
  "#EF4444",
] as const;

function createTask(title = ""): Task {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    iconName: "circle-check",
    completed: false,
    stars: 1,
    timerInMinutes: undefined,
    bonusStars: undefined,
  };
}

function createRoutine(): Routine {
  return {
    id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    color: getDefaultRoutineColor("morning"),
    tasks: [createTask("")],
  };
}

export default function RoutinesSettingsScreen() {
  const { width } = useWindowDimensions();
  const isCompactWidth = width < 380;
  const { children } = useChildren();
  const { routines, addRoutine, updateRoutine, removeRoutine, isLoading } = useRoutines();
  const { toasts, toast, dismiss } = useToast();
  const familyTheme = children[0]?.theme ?? "sterne";
  const palette = getThemePalette(familyTheme);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [draftRoutine, setDraftRoutine] = useState<Routine | null>(null);
  const [showIconPickerForTaskId, setShowIconPickerForTaskId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();

  const activeTaskIcon = useMemo(
    () => draftRoutine?.tasks.find((task) => task.id === showIconPickerForTaskId)?.iconName ?? "circle-check",
    [draftRoutine, showIconPickerForTaskId]
  );

  const openEditor = (routine: Routine, templateId?: string) => {
    setEditingRoutineId(routine.id);
    setDraftRoutine({
      ...routine,
      tasks: routine.tasks.map((task) => ({ ...task })),
    });
    setShowSuggestions(false);
    setSelectedTemplateId(templateId);
  };

  const resetEditor = () => {
    setEditingRoutineId(null);
    setDraftRoutine(null);
    setShowIconPickerForTaskId(null);
    setShowSuggestions(false);
    setSelectedTemplateId(undefined);
  };

  const handleCreateRoutine = async () => {
    const routine = createRoutine();
    await addRoutine(routine);
    openEditor(routine);
    toast({
      title: "Neue Routine angelegt",
      description: "Gib ihr jetzt einen Namen und passende Aufgaben.",
    });
  };

  const handleCreateFromTemplate = async (template: RoutineTemplate) => {
    const routine: Routine = {
      id: `routine-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: template.name,
      color: template.color,
      tasks: template.tasks.map((task, index) => ({
        id: `task-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        title: task.title,
        iconName: task.iconName,
        completed: false,
        stars: task.stars,
        timerInMinutes: task.timerInMinutes,
        bonusStars: task.bonusStars,
      })),
    };

    await addRoutine(routine);
    openEditor(routine, template.id);
    toast({
      title: "Vorlage übernommen",
      description: `${template.name} ist jetzt als neue Routine angelegt und kann angepasst werden.`,
    });
  };

  const updateDraftTask = (taskId: string, updates: Partial<Task>) => {
    setDraftRoutine((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
      };
    });
  };

  const addDraftTask = () => {
    setDraftRoutine((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: [...prev.tasks, createTask("")],
      };
    });
  };

  const removeDraftTask = (taskId: string) => {
    setDraftRoutine((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.tasks.filter((task) => task.id !== taskId);
      return {
        ...prev,
        tasks: updatedTasks.length > 0 ? updatedTasks : [createTask("")],
      };
    });
  };

  const saveRoutine = async () => {
    if (!draftRoutine) return;

    const sanitizedName = draftRoutine.name.trim();
    const sanitizedTasks = draftRoutine.tasks
      .map((task) => ({
        ...task,
        title: task.title.trim(),
        stars: Math.max(1, task.stars),
        timerInMinutes:
          task.timerInMinutes && task.timerInMinutes > 0 ? task.timerInMinutes : undefined,
        bonusStars:
          task.bonusStars && task.bonusStars > 0 ? task.bonusStars : undefined,
      }))
      .filter((task) => task.title.length > 0);

    if (!sanitizedName || sanitizedTasks.length === 0) {
      toast({
        title: "Routine noch unvollständig",
        description: "Bitte vergib einen Namen und mindestens eine Aufgabe.",
        variant: "destructive",
      });
      return;
    }

    await updateRoutine(draftRoutine.id, {
      ...draftRoutine,
      name: sanitizedName,
      tasks: sanitizedTasks,
    });
    toast({
      title: "Routine gespeichert",
      description: `${sanitizedName} wurde aktualisiert.`,
    });
    resetEditor();
  };

  const confirmDeleteRoutine = (routine: Routine) => {
    Alert.alert(
      "Routine löschen",
      `Möchtest du "${routine.name}" wirklich entfernen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            await removeRoutine(routine.id);
            if (editingRoutineId === routine.id) {
              resetEditor();
            }
            toast({
              title: "Routine entfernt",
              description: `${routine.name} wurde gelöscht.`,
            });
          },
        },
      ]
    );
  };

  const renderTaskRow = ({ item, drag, isActive }: RenderItemParams<Task>) => {
    const Icon = getIcon(item.iconName);

    return (
      <ScaleDecorator>
        <View
          className={cn(
            "mb-3 rounded-[20px] border px-3.5 py-3.5",
            isActive && "opacity-80"
          )}
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: palette.accentBorder,
          }}
        >
          <View className="flex-row items-start gap-3">
            <Pressable
              onLongPress={drag}
              className="h-11 w-11 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Aufgabe verschieben"
            >
              <GripVertical size={18} color="#737373" />
            </Pressable>

            <View className="flex-1 gap-2.5">
              <View className="gap-1.5">
                <Label>Aufgabe</Label>
                <Input
                  value={item.title}
                  onChangeText={(value) => updateDraftTask(item.id, { title: value })}
                  placeholder="Zähne putzen"
                  className="h-12 px-3"
                  style={{ fontSize: 16, lineHeight: 20 }}
                />
              </View>

              <View className={isCompactWidth ? "gap-2.5" : "flex-row gap-2.5"}>
                <View className="flex-1 gap-1.5">
                  <Label>Icon</Label>
                  <Pressable
                    onPress={() => setShowIconPickerForTaskId(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Icon ändern"
                    className="h-12 flex-row items-center justify-between rounded-lg border border-input bg-card px-3"
                  >
                    <Icon size={18} color={palette.accentStrong} />
                    <Text className="text-sm font-body-semibold uppercase tracking-[0.2px] text-muted-foreground" numberOfLines={1}>
                      Ändern
                    </Text>
                  </Pressable>
                </View>

                <View className={isCompactWidth ? "gap-1.5" : "w-[120px] gap-1.5"}>
                  <Label>Sterne</Label>
                  <View className="h-12 flex-row items-center justify-between rounded-lg border border-input bg-card px-1">
                    <Pressable
                      onPress={() => updateDraftTask(item.id, { stars: Math.max(1, item.stars - 1) })}
                      className="h-11 w-11 items-center justify-center rounded-full"
                      accessibilityRole="button"
                      accessibilityLabel="Sternwert verringern"
                    >
                      <Minus size={18} color="#737373" />
                    </Pressable>
                    <Text className="text-base font-body-semibold text-foreground">{item.stars}</Text>
                    <Pressable
                      onPress={() => updateDraftTask(item.id, { stars: Math.min(5, item.stars + 1) })}
                      className="h-11 w-11 items-center justify-center rounded-full"
                      accessibilityRole="button"
                      accessibilityLabel="Sternwert erhöhen"
                    >
                      <Plus size={18} color={palette.accentStrong} />
                    </Pressable>
                  </View>
                </View>
              </View>

              <View className={isCompactWidth ? "gap-2.5" : "flex-row gap-2.5"}>
                <View className="flex-1 gap-1.5">
                  <Label>Timer (Min.)</Label>
                  <View className="h-12 flex-row items-center justify-between rounded-lg border border-input bg-card px-1">
                    <Pressable
                      onPress={() =>
                        updateDraftTask(item.id, {
                          timerInMinutes: Math.max(0, (item.timerInMinutes ?? 0) - 1) || undefined,
                        })
                      }
                      className="h-11 w-11 items-center justify-center rounded-full"
                      accessibilityRole="button"
                      accessibilityLabel="Timer verringern"
                    >
                      <Minus size={18} color="#737373" />
                    </Pressable>
                    <View className="items-center">
                      <Text className="text-base font-body-semibold text-foreground">
                        {item.timerInMinutes ?? 0}
                      </Text>
                      <Text className="text-xs font-body text-muted-foreground" numberOfLines={1}>
                        {item.timerInMinutes ? "aktiv" : "aus"}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        updateDraftTask(item.id, {
                          timerInMinutes: Math.min(30, (item.timerInMinutes ?? 0) + 1),
                        })
                      }
                      className="h-11 w-11 items-center justify-center rounded-full"
                      accessibilityRole="button"
                      accessibilityLabel="Timer erhöhen"
                    >
                      <Plus size={18} color={palette.accentStrong} />
                    </Pressable>
                  </View>
                </View>

                <View className="flex-1 gap-1.5">
                  <Label>Bonus</Label>
                  <View className="h-12 flex-row items-center justify-between rounded-lg border border-input bg-card px-1">
                    <Pressable
                      onPress={() =>
                        updateDraftTask(item.id, {
                          bonusStars: Math.max(0, (item.bonusStars ?? 0) - 1) || undefined,
                        })
                      }
                      className="h-11 w-11 items-center justify-center rounded-full"
                      accessibilityRole="button"
                      accessibilityLabel="Bonus verringern"
                    >
                      <Minus size={18} color="#737373" />
                    </Pressable>
                    <View className="items-center">
                      <Text className="text-base font-body-semibold text-foreground">
                        {item.bonusStars ?? 0}
                      </Text>
                      <Text className="text-xs font-body text-muted-foreground" numberOfLines={1}>extra</Text>
                    </View>
                    <Pressable
                      onPress={() =>
                        updateDraftTask(item.id, {
                          bonusStars: Math.min(5, (item.bonusStars ?? 0) + 1),
                        })
                      }
                      className="h-11 w-11 items-center justify-center rounded-full"
                      accessibilityRole="button"
                      accessibilityLabel="Bonus erhöhen"
                    >
                      <Plus size={18} color={palette.accentStrong} />
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => removeDraftTask(item.id)}
              className="h-11 w-11 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel={`Aufgabe ${item.title || "ohne Titel"} entfernen`}
            >
              <Trash2 size={18} color="#ef4444" />
            </Pressable>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-10">
        <Card className="overflow-hidden rounded-[30px] border p-0">
          <View className="rounded-[30px] bg-secondary/70 px-4 py-5">
            <View className="gap-3">
              <View className="flex-row flex-wrap items-center gap-2">
                <Text className="text-xs font-body-semibold uppercase tracking-[0.8px] text-muted-foreground">
                  Familienroutinen
                </Text>
                <View className="rounded-full bg-white/85 px-3 py-1.5">
                  <Text className="text-xs font-body-semibold uppercase tracking-[0.7px] text-foreground">
                    {isLoading ? "..." : `${routines.length} Routinen`}
                  </Text>
                </View>
              </View>
              <Text className="text-[32px] font-headline leading-[38px] text-foreground">
                Routinen wirklich pflegen
              </Text>
              <Text className="text-base font-body leading-6 text-muted-foreground">
                Hier bearbeitest du Namen, Aufgaben, Sterne, Timer und Bonuswerte fuer alle
                Kinder in eurer Familie.
              </Text>
            </View>
          </View>
        </Card>

        <Button
          onPress={handleCreateRoutine}
          className="mt-4 w-full"
          style={{ backgroundColor: palette.button }}
        >
          <View className="flex-row items-center gap-2">
            <Plus size={18} color="#FFFFFF" />
            <Text className="text-base font-body-semibold text-white">Neue Routine anlegen</Text>
          </View>
        </Button>

        <Card
          className="mt-5 rounded-[22px] border px-5 py-5"
          style={{ borderColor: palette.accentBorder, backgroundColor: palette.accentSoft }}
        >
          <View className="flex-row items-start gap-3">
            <View
              className="mt-0.5 h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <Sparkles size={18} color={palette.accentStrong} />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-headline" style={{ color: palette.accentText }}>
                Mit Vorlage starten
              </Text>
              <Text className="mt-2 text-sm font-body leading-6 text-muted-foreground">
                Hier kannst du dieselben vorgefertigten Routinen wie im Onboarding direkt
                für eure Familie übernehmen und danach anpassen.
              </Text>
            </View>
          </View>

          <View className="mt-5">
            <TemplateSelector
              onSelectTemplate={(template) => {
                void handleCreateFromTemplate(template);
              }}
              selectedTemplateId={selectedTemplateId}
              theme={familyTheme}
            />
          </View>

          <View
            className="mt-5 rounded-[16px] px-3.5 py-3"
            style={{ backgroundColor: "rgba(255,255,255,0.68)" }}
          >
            <Text className="text-base font-body leading-6 text-muted-foreground">
              Tipp: Beim Antippen wird sofort eine neue Routine aus der Vorlage angelegt und
              unten im Editor geöffnet.
            </Text>
          </View>
        </Card>

        {routines.length === 0 ? (
          <Card className="mt-4 rounded-[28px] px-5 py-8">
            <Text className="text-center text-lg font-headline text-foreground">
              Noch keine Routinen vorhanden
            </Text>
            <Text className="mt-2 text-center text-sm font-body text-muted-foreground">
              Lege hier neue Familienroutinen an oder starte mit einer einfachen Morgenroutine.
            </Text>
          </Card>
        ) : (
          routines.map((routine) => {
            const isEditing = editingRoutineId === routine.id;
            const routineDraft = isEditing ? draftRoutine : null;

            return (
              <Card key={routine.id} className="mt-4 overflow-hidden rounded-[28px] border p-0">
                <View className="px-4 py-4">
                  <View className="flex-row items-start gap-3">
                    <View
                      className="mt-1 h-4 w-4 rounded-full"
                      style={{ backgroundColor: routine.color || ROUTINE_COLORS[0] }}
                    />
                    <View className="flex-1">
                      <Text className="text-lg font-headline text-foreground">{routine.name}</Text>
                      <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                        {routine.tasks.length} Aufgaben • familienweit aktiv
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => (isEditing ? resetEditor() : openEditor(routine))}
                      className="rounded-full px-3 py-1.5"
                      style={{ backgroundColor: isEditing ? "#FDECEC" : palette.tabActiveBg }}
                    >
                      <Text
                        className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                        style={{ color: isEditing ? "#B91C1C" : palette.accentText }}
                      >
                        {isEditing ? "Schliessen" : "Bearbeiten"}
                      </Text>
                    </Pressable>
                  </View>

                  {!isEditing ? (
                    <View className="mt-4 gap-2">
                      {routine.tasks.slice(0, 4).map((task) => {
                        const Icon = getIcon(task.iconName);
                        return (
                          <View key={task.id} className="min-h-11 flex-row items-center px-1 py-1.5">
                            <Icon size={16} color={palette.accentStrong} />
                            <Text className="ml-2 flex-1 text-base font-body leading-6 text-foreground">
                              {task.title}
                            </Text>
                            <Text className="text-sm font-body text-muted-foreground">
                              {task.stars} Sterne
                            </Text>
                          </View>
                        );
                      })}
                      {routine.tasks.length > 4 ? (
                        <Text className="px-1 text-sm font-body text-muted-foreground">
                          +{routine.tasks.length - 4} weitere Aufgaben
                        </Text>
                      ) : null}
                    </View>
                  ) : routineDraft ? (
                    <View className="mt-5 gap-4">
                      <View className="gap-1.5">
                        <Label>Name der Routine</Label>
                        <Input
                          value={routineDraft.name}
                          onChangeText={(value) =>
                            setDraftRoutine((prev) => (prev ? { ...prev, name: value } : prev))
                          }
                          placeholder="Zum Beispiel Morgenroutine"
                        />
                      </View>

                      <View className="gap-2">
                        <Label>Farbe</Label>
                        <View className="flex-row flex-wrap gap-3">
                          {ROUTINE_COLORS.map((color) => (
                            <Pressable
                              key={color}
                              onPress={() =>
                                setDraftRoutine((prev) => (prev ? { ...prev, color } : prev))
                              }
                              className={cn(
                                "h-10 w-10 items-center justify-center rounded-full border-2",
                                routineDraft.color === color ? "border-foreground" : "border-transparent"
                              )}
                              style={{ backgroundColor: color }}
                            >
                              {routineDraft.color === color ? (
                                <Check size={18} color="#FFFFFF" />
                              ) : null}
                            </Pressable>
                          ))}
                        </View>
                      </View>

                      <View className="rounded-[24px] border px-4 py-4" style={{ borderColor: palette.accentBorder, backgroundColor: palette.accentSoft }}>
                        <Pressable
                          onPress={() => setShowSuggestions((prev) => !prev)}
                          className="flex-row items-center justify-between"
                        >
                          <View className="mr-3 flex-1">
                            <Text className="text-sm font-body-semibold" style={{ color: palette.accentText }}>
                              Kurzhinweise fuer gute Routinen
                            </Text>
                            <Text className="mt-1 text-base font-body leading-6 text-muted-foreground">
                              4-6 Aufgaben, klare Titel, Timer nur dort, wo er spielerisch hilft.
                            </Text>
                          </View>
                          <ChevronDown
                            size={18}
                            color={palette.accentStrong}
                            style={{ transform: [{ rotate: showSuggestions ? "180deg" : "0deg" }] }}
                          />
                        </Pressable>
                        {showSuggestions ? (
                          <View className="mt-3 gap-2">
                            {[
                              "Morgenroutine: kurze Schritte vor Schule oder Kita.",
                              "Abendroutine: lieber ruhig und ohne zu viele Aufgaben.",
                              "Bonus-Timer nur fuer motivierende Mini-Challenges nutzen.",
                            ].map((hint) => (
                              <View key={hint} className="flex-row items-start gap-2">
                                <Sparkles size={14} color={palette.accentStrong} style={{ marginTop: 2 }} />
                                <Text className="flex-1 text-base font-body leading-6 text-muted-foreground">
                                  {hint}
                                </Text>
                              </View>
                            ))}
                          </View>
                        ) : null}
                      </View>

                      <View className="gap-2">
                        <View className="flex-row items-center justify-between">
                          <Label>Aufgaben</Label>
                          <Pressable
                            onPress={addDraftTask}
                            className="rounded-full px-3 py-1.5"
                            style={{ backgroundColor: palette.tabActiveBg }}
                          >
                            <Text className="text-xs font-body-semibold uppercase tracking-[0.6px]" style={{ color: palette.accentText }}>
                              Aufgabe hinzufügen
                            </Text>
                          </Pressable>
                        </View>

                        <DraggableFlatList
                          data={routineDraft.tasks}
                          keyExtractor={(item) => item.id}
                          renderItem={renderTaskRow}
                          onDragEnd={({ data }) =>
                            setDraftRoutine((prev) => (prev ? { ...prev, tasks: data } : prev))
                          }
                          scrollEnabled={false}
                        />
                      </View>

                      <View className={isCompactWidth ? "gap-3" : "flex-row gap-3"}>
                        <Button variant="outline" onPress={resetEditor} className="flex-1">
                          Abbrechen
                        </Button>
                        <Button
                          onPress={() => {
                            void saveRoutine();
                          }}
                          className="flex-1"
                          style={{ backgroundColor: palette.button }}
                        >
                          Speichern
                        </Button>
                      </View>

                      <Button
                        variant="destructive"
                        onPress={() => confirmDeleteRoutine(routine)}
                        className="w-full"
                      >
                        <View className="flex-row items-center gap-2">
                          <Trash2 size={18} color="#FFFFFF" />
                          <Text className="text-base font-body-semibold text-white">
                            Routine löschen
                          </Text>
                        </View>
                      </Button>
                    </View>
                  ) : null}
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>

      <IconPicker
        visible={!!showIconPickerForTaskId}
        value={activeTaskIcon}
        onSelect={(iconName) => {
          if (showIconPickerForTaskId) {
            updateDraftTask(showIconPickerForTaskId, { iconName });
          }
        }}
        onClose={() => setShowIconPickerForTaskId(null)}
      />

      <ToastOverlay toasts={toasts} onDismiss={dismiss} />
    </View>
  );
}
