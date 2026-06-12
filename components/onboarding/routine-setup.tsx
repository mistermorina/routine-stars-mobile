import React, { useState, useCallback } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { GripVertical, Plus, Trash2, Check, ChevronDown, Sparkles, Star } from "lucide-react-native";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { TemplateSelector } from "@/components/routine-templates/template-selector";
import { TemplateCard } from "@/components/routine-templates/template-card";
import { getRecommendedRoutineTemplates } from "@/lib/routine-templates";
import { getThemePalette } from "@/lib/theme";
import type { RoutineTemplate, ChildProfile } from "@/lib/types";

interface TaskItem {
  id: string;
  title: string;
  iconName: string;
  stars: number;
  timerInMinutes?: number;
  bonusStars?: number;
}

export interface SavedRoutine {
  id: string;
  name: string;
  tasks: TaskItem[];
  dailyRepeat: boolean;
  color?: string;
}

interface RoutineSetupProps {
  onNext: (data: { savedRoutines: SavedRoutine[] }) => void;
  onBack: () => void;
  formData: {
    children: ChildProfile[];
    savedRoutines?: SavedRoutine[];
  };
}

export function RoutineSetup({ onNext, onBack, formData }: RoutineSetupProps) {
  // Saved routines list
  const [savedRoutines, setSavedRoutines] = useState<SavedRoutine[]>(
    formData.savedRoutines ?? []
  );

  // Current routine being edited
  const [routineName, setRoutineName] = useState("");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>();
  const [selectedTemplateColor, setSelectedTemplateColor] = useState<string | undefined>();
  const [newTask, setNewTask] = useState("");
  const [dailyRepeat] = useState(true);
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const primaryChild = formData.children[0];
  const palette = getThemePalette(primaryChild?.theme);
  const recommendedTemplates = getRecommendedRoutineTemplates(primaryChild?.ageGroup);

  const handleSelectTemplate = useCallback((template: RoutineTemplate) => {
    setSelectedTemplateId(template.id);
    setSelectedTemplateColor(template.color);
    setRoutineName(template.name);
    setShowCustomizer(true);
    setTasks(
      template.tasks.map((t, i) => ({
        id: `task-${Date.now()}-${i}`,
        title: t.title,
        iconName: t.iconName,
        stars: t.stars,
        timerInMinutes: t.timerInMinutes,
        bonusStars: t.bonusStars,
      }))
    );
  }, []);

  const handleAddTask = () => {
    const trimmed = newTask.trim();
    if (trimmed) {
      setTasks((prev) => [
        ...prev,
        {
          id: `task-${Date.now()}`,
          title: trimmed,
          iconName: "circle-check",
          stars: 1,
          timerInMinutes: undefined,
          bonusStars: undefined,
        },
      ]);
      setShowCustomizer(true);
      setNewTask("");
    }
  };

  const handleRemoveTask = useCallback((idToRemove: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== idToRemove));
  }, []);

  const handleSaveRoutine = () => {
    if (tasks.length === 0 || !routineName.trim()) return;
    const routine: SavedRoutine = {
      id: `routine-${Date.now()}`,
      name: routineName.trim(),
      tasks,
      dailyRepeat,
      color: selectedTemplateColor,
    };
    setSavedRoutines((prev) => [...prev, routine]);
    // Reset form for next routine
    setRoutineName("");
    setTasks([]);
    setSelectedTemplateId(undefined);
    setSelectedTemplateColor(undefined);
    setNewTask("");
    setShowCustomizer(false);
    setShowAllTemplates(false);
  };

  const handleRemoveRoutine = useCallback((idToRemove: string) => {
    setSavedRoutines((prev) => prev.filter((r) => r.id !== idToRemove));
  }, []);

  const handleSubmit = () => {
    // If user has tasks in the form but hasn't saved yet, auto-save
    let allRoutines = [...savedRoutines];
    if (tasks.length > 0 && routineName.trim()) {
      allRoutines.push({
        id: `routine-${Date.now()}`,
        name: routineName.trim(),
        tasks,
        dailyRepeat,
        color: selectedTemplateColor,
      });
    }
    onNext({ savedRoutines: allRoutines });
  };

  const hasUnsavedRoutine = tasks.length > 0 && routineName.trim().length > 0;
  const canProceed = savedRoutines.length > 0 || hasUnsavedRoutine;

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<TaskItem>) => (
      <ScaleDecorator>
        <View
          className={cn(
            "flex-row items-center gap-2 rounded-lg bg-secondary p-3 mb-2",
            isActive && "opacity-80"
          )}
        >
          <Pressable
            onLongPress={drag}
            className="h-11 w-11 items-center justify-center rounded-full"
            accessibilityRole="button"
            accessibilityLabel="Aufgabe verschieben"
            hitSlop={4}
          >
            <GripVertical size={20} color="#737373" />
          </Pressable>
          <Text
            className="min-w-0 flex-1 text-base font-body text-foreground"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <Pressable
            onPress={() => handleRemoveTask(item.id)}
            className="h-11 w-11 items-center justify-center rounded-full"
            accessibilityRole="button"
            accessibilityLabel={`Aufgabe ${item.title} entfernen`}
            hitSlop={4}
          >
            <Trash2 size={18} color="#ef4444" />
          </Pressable>
        </View>
      </ScaleDecorator>
    ),
    [handleRemoveTask]
  );

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-8"
    >
      <View
        className="mb-4 rounded-[24px] border px-4 py-4"
        style={{
          borderColor: palette.accentBorder,
          backgroundColor: palette.heroSurface,
        }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: "#FFFFFF" }}
          >
            <Star size={20} color={palette.chartPrimary} fill={palette.chartPrimary} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-base font-body-semibold leading-5 text-foreground">
              Kleine Schritte zählen sofort.
            </Text>
            <Text className="mt-1 text-xs font-body leading-5 text-muted-foreground">
              Eine gute Routine hat wenige klare Aufgaben. Dein Kind sammelt Sterne,
              sobald ein Schritt geschafft ist.
            </Text>
          </View>
        </View>
      </View>

      {/* Saved routines */}
      {savedRoutines.length > 0 && (
        <View className="mb-4 gap-2">
          <Label>Gespeicherte Routinen ({savedRoutines.length})</Label>
          {savedRoutines.map((routine) => (
            <View
              key={routine.id}
              className="flex-row items-center rounded-lg bg-[#87CEEB]/10 border border-[#87CEEB] p-3 gap-3"
            >
              <Check size={18} color="#87CEEB" />
              <View className="min-w-0 flex-1">
                <Text
                  className="text-sm font-headline text-foreground"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {routine.name}
                </Text>
                <Text className="text-xs font-body text-muted-foreground">
                  {routine.tasks.length} Aufgaben
                </Text>
              </View>
              <Pressable
                onPress={() => handleRemoveRoutine(routine.id)}
                className="h-11 w-11 items-center justify-center rounded-full"
                accessibilityRole="button"
                accessibilityLabel={`Routine ${routine.name} entfernen`}
                hitSlop={4}
              >
                <Trash2 size={16} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {savedRoutines.length > 0 ? "Weitere Routine hinzufügen" : "Starter-Routine wählen"}
          </CardTitle>
          <CardDescription>
            Wir schlagen passende Vorlagen für{" "}
            {formData.children.length === 1 ? formData.children[0].name : "deine Familie"}{" "}
            vor. Du kannst jeden Schritt danach anpassen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <View className="gap-5">
            <View
              className="rounded-2xl border px-4 py-4"
              style={{
                borderColor: palette.accentBorder,
                backgroundColor: palette.accentSoft,
              }}
            >
              <View className="flex-row items-center">
                <View
                  className="h-11 w-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: palette.surface }}
                >
                  <Sparkles size={20} color={palette.accentStrong} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-body-semibold text-foreground">
                    Sanfter Start für {primaryChild?.name || "dein Kind"}
                  </Text>
                  <Text className="text-base font-body leading-6" style={{ color: palette.accentText }}>
                    Alter {primaryChild?.ageGroup ?? "6-8"} • wenige klare Aufgaben
                  </Text>
                </View>
              </View>

              <View className="gap-3 pt-4">
                {recommendedTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onSelect={handleSelectTemplate}
                    isSelected={template.id === selectedTemplateId}
                    theme={primaryChild?.theme}
                  />
                ))}
              </View>
            </View>

            <Pressable
              onPress={() => setShowAllTemplates((previous) => !previous)}
              className="flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
            >
              <View>
                <Text className="text-base font-body-semibold text-foreground">
                  Alle Vorlagen ansehen
                </Text>
                <Text className="mt-0.5 text-xs font-body text-muted-foreground">
                  Morgen, Abend, Schule, Haushalt und besondere Momente
                </Text>
              </View>
              <ChevronDown
                size={18}
                color="#737373"
                style={{
                  transform: [{ rotate: showAllTemplates ? "180deg" : "0deg" }],
                }}
              />
            </Pressable>

            {showAllTemplates ? (
              <TemplateSelector
                onSelectTemplate={handleSelectTemplate}
                selectedTemplateId={selectedTemplateId}
                theme={primaryChild?.theme}
              />
            ) : null}

            {!showCustomizer && tasks.length === 0 ? (
              <Button
                variant="outline"
                onPress={() => setShowCustomizer(true)}
                style={{ borderColor: palette.accent }}
              >
                <Text className="text-sm font-body-semibold" style={{ color: palette.accent }}>
                  Eigene Routine erstellen
                </Text>
              </Button>
            ) : null}

            {showCustomizer ? (
              <View className="gap-4">
                {/* Routine name */}
                <View className="gap-2">
                  <Label>Name der Routine</Label>
                  <Input
                    value={routineName}
                    onChangeText={setRoutineName}
                    placeholder="Zum Beispiel Morgenroutine"
                  />
                </View>

                {/* Task list */}
                <View className="gap-2">
                  <Label>Aufgaben ({tasks.length})</Label>
                  {tasks.length > 0 ? (
                    <DraggableFlatList
                      data={tasks}
                      keyExtractor={(item) => item.id}
                      renderItem={renderItem}
                      onDragEnd={({ data }) => setTasks(data)}
                      scrollEnabled={false}
                    />
                  ) : (
                    <View className="rounded-xl bg-secondary/50 py-4 items-center">
                      <Text className="text-sm font-body text-muted-foreground">
                        Wähle eine Vorlage oder füge den ersten eigenen Schritt hinzu.
                      </Text>
                    </View>
                  )}

                  {/* Add new task */}
                  <View className="flex-row gap-2 mt-1">
                    <View className="flex-1">
                      <Input
                        value={newTask}
                        onChangeText={setNewTask}
                        placeholder="Zum Beispiel Schlafanzug anziehen"
                        returnKeyType="done"
                        onSubmitEditing={handleAddTask}
                      />
                    </View>
                    <Button
                      size="icon"
                      onPress={handleAddTask}
                      disabled={!newTask.trim()}
                      className="h-11 w-11"
                      style={{ backgroundColor: palette.button }}
                      accessibilityRole="button"
                      accessibilityLabel="Aufgabe hinzufügen"
                    >
                      <Plus size={20} color="#FFFFFF" />
                    </Button>
                  </View>
                </View>

                {/* Save routine button */}
                {tasks.length > 0 ? (
                  <Button
                    variant="outline"
                    onPress={handleSaveRoutine}
                    disabled={tasks.length === 0 || !routineName.trim()}
                    className="min-h-12 px-3"
                    style={{ borderColor: palette.accent }}
                  >
                    <Text
                      className="text-center text-sm font-body-semibold"
                      style={{ color: palette.accent }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.76}
                    >
                      {savedRoutines.length > 0
                        ? "Routine speichern"
                        : "Starter-Routine speichern"}
                    </Text>
                  </Button>
                ) : null}
              </View>
            ) : null}

            {!canProceed ? (
              <View
                className="rounded-[18px] px-4 py-3"
                style={{ backgroundColor: palette.heroSurface }}
              >
                <Text className="text-sm font-body leading-5" style={{ color: palette.accentText }}>
                  Wähle eine Vorlage oder erstelle eine eigene Routine. Eine Routine reicht für den Start.
                </Text>
              </View>
            ) : null}

            {/* Navigation buttons */}
            <View className="flex-row justify-between pt-2">
              <Button variant="outline" onPress={onBack} className="min-w-[100px]">
                Zurück
              </Button>
              <Button
                onPress={handleSubmit}
                disabled={!canProceed}
                className="min-w-[100px]"
                style={{ backgroundColor: palette.button }}
              >
                Weiter: Belohnungen
              </Button>
            </View>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}
