import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";
import { useActivityLogs } from "@/hooks/use-activity-logs";
import { useChildren } from "@/hooks/use-children";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Separator } from "@/components/ui/separator";
import { SettingsHeroCard } from "@/components/settings/settings-hero-card";
import { AvatarImage } from "@/components/ui/avatar-image";
import {
  areAvatarValuesEqual,
  avatarCategories,
  DEFAULT_AVATAR_VALUE,
} from "@/lib/avatars";
import { pickAvatarPhotoAsync } from "@/lib/avatar-photo-picker";
import { useRoutines } from "@/hooks/use-routines";
import { useRewards } from "@/hooks/use-rewards";
import { triggerFeedback } from "@/lib/feedback";
import {
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Check,
  X,
  Sparkles,
  Star,
  Palette,
  ImagePlus,
  getIcon,
} from "@/lib/icons";
import { getThemePalette, semanticColors } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { AgeGroup, AvatarValue, Child, ChildTheme } from "@/lib/types";

const THEME_OPTIONS: { value: ChildTheme; label: string; iconName: string }[] = [
  { value: "sterne", label: "Sterne", iconName: "star" },
  { value: "tiere", label: "Tiere", iconName: "paw-print" },
  { value: "galaxy", label: "Galaxy", iconName: "rocket" },
];

const AGE_GROUP_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: "3-5", label: "3-5" },
  { value: "6-8", label: "6-8" },
  { value: "9-12", label: "9-12" },
];

const STAR_ADJUST_REASONS = [
  "Bonus",
  "Ausgleich",
  "Versehen korrigiert",
  "Sonstiges",
] as const;

type StarAdjustReason = (typeof STAR_ADJUST_REASONS)[number];

/** Upper bound for one correction. Larger moves are applied in several steps. */
const MAX_STAR_ADJUSTMENT = 50;

/**
 * Task id every manual parent correction is logged under.
 *
 * No routine task can ever carry this id, so `countCompletedRoutinesForDate`
 * in `lib/child-progression.ts` — which matches logged `taskId`s against the
 * task ids of a routine — can never mistake a correction for a finished
 * routine. The `first_routine` sticker stays tied to real completions.
 */
const MANUAL_ADJUSTMENT_TASK_ID = "manual-adjustment";

function formatStarCount(amount: number) {
  return `${amount} ${amount === 1 ? "Stern" : "Sterne"}`;
}

function formatSignedStars(delta: number) {
  return `${delta > 0 ? "+" : delta < 0 ? "-" : "±"}${Math.abs(delta)}`;
}

/** A correction may never push a balance below zero, and never above the cap. */
function clampStarDraft(value: number, currentStars: number) {
  return Math.max(-currentStars, Math.min(MAX_STAR_ADJUSTMENT, value));
}

export default function ChildrenSettings() {
  const router = useRouter();
  const params = useLocalSearchParams<{ preview?: string | string[] }>();
  const { children, addChild, updateChild, removeChild, addStars, deductStars } = useChildren();
  const { toast } = useToast();
  const { logActivity } = useActivityLogs();
  const { routines } = useRoutines();
  const { rewards } = useRewards();
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState("");
  const [showAvatarPicker, setShowAvatarPicker] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAvatar, setNewChildAvatar] = useState<AvatarValue>(DEFAULT_AVATAR_VALUE);
  const [newChildTheme, setNewChildTheme] = useState<ChildTheme>("sterne");
  const [newChildAgeGroup, setNewChildAgeGroup] = useState<AgeGroup>("6-8");
  // Only one child card is expanded at a time, so a single draft is enough —
  // it is reset whenever the expanded card changes.
  const [starDraft, setStarDraft] = useState(0);
  const [starReason, setStarReason] = useState<StarAdjustReason | null>(null);
  const [starConfirmChildId, setStarConfirmChildId] = useState<string | null>(null);
  const [childPendingDeletion, setChildPendingDeletion] = useState<Child | null>(null);
  const newChildNameInputRef = useRef<RNTextInput>(null);

  const allAvatars = Object.entries(avatarCategories);
  const newChildPalette = getThemePalette(newChildTheme);
  const previewMode = Array.isArray(params.preview) ? params.preview[0] : params.preview;
  const totalStars = useMemo(
    () => children.reduce((sum, child) => sum + child.stars, 0),
    [children]
  );
  const childCountLabel = `${children.length} ${children.length === 1 ? "Kind" : "Kinder"}`;
  const starConfirmChild = children.find((child) => child.id === starConfirmChildId);

  useEffect(() => {
    if (!__DEV__) return;

    if (previewMode === "add") {
      setShowAddForm(true);
      setExpandedChildId(null);
      setEditingNameId(null);
      setShowAvatarPicker(null);
      return;
    }

    if ((previewMode === "expanded" || previewMode === "name" || previewMode === "avatar") && children.length > 0) {
      setExpandedChildId(children[0].id);
      setShowAddForm(false);
      setEditingNameId(previewMode === "name" ? children[0].id : null);
      setEditNameValue(previewMode === "name" ? children[0].name : "");
      setShowAvatarPicker(previewMode === "avatar" ? children[0].id : null);
    }
  }, [children, previewMode]);

  useEffect(() => {
    if (!showAddForm) return;

    const timeout = setTimeout(() => {
      newChildNameInputRef.current?.focus();
    }, 220);

    return () => clearTimeout(timeout);
  }, [showAddForm]);

  function getThemeLabel(theme: Child["theme"]) {
    if (theme === "tiere") return "Tiere";
    if (theme === "galaxy") return "Galaxy";
    return "Sterne";
  }

  function toggleExpanded(childId: string) {
    setExpandedChildId((prev) => (prev === childId ? null : childId));
    setEditingNameId(null);
    setShowAvatarPicker(null);
    resetStarAdjustment();
  }

  function resetStarAdjustment() {
    setStarDraft(0);
    setStarReason(null);
    setStarConfirmChildId(null);
  }

  function changeStarDraft(child: Child, delta: number) {
    const next = clampStarDraft(starDraft + delta, child.stars);
    if (next === starDraft) return;

    setStarDraft(next);
    void triggerFeedback("theme_preview", { disableSound: true });
  }

  function selectStarReason(reason: StarAdjustReason) {
    setStarReason(reason);
    void triggerFeedback("theme_preview", { disableSound: true });
  }

  /**
   * Applies the pending correction to the balance and writes an audit entry.
   *
   * The log entry carries `stars: 0` on purpose. `child.stars` is the balance
   * and is moved by `addStars`/`deductStars`; the activity log is the record of
   * stars *earned by completing tasks*, which every statistic, the daily
   * mission "Fünf Sterne sammeln" and `getCumulativeEarnedStars` read. Booking
   * the delta there would let a parent correction move the child's mission and
   * sticker progress, and a negative value would render as "+-2" in
   * `app/settings/stats.tsx` and pull day totals below zero. The signed delta
   * lives in the label instead, so the correction stays fully traceable.
   */
  async function applyStarAdjustment(child: Child) {
    const delta = clampStarDraft(starDraft, child.stars);
    const reason = starReason;

    setStarConfirmChildId(null);

    if (delta === 0 || reason === null) return;

    const amount = Math.abs(delta);
    const isAddition = delta > 0;

    if (isAddition) {
      await addStars(child.id, amount);
    } else {
      await deductStars(child.id, amount);
    }

    await logActivity(child.id, {
      id: MANUAL_ADJUSTMENT_TASK_ID,
      title: `Sterne angepasst: ${formatSignedStars(delta)} (${reason})`,
      iconName: "star",
      completed: true,
      stars: 0,
    });

    // Parent area stays quiet — haptics only, no sound.
    void triggerFeedback(isAddition ? "stars_added" : "reward_redeemed", {
      disableSound: true,
    });

    toast({
      title: `${formatStarCount(amount)} ${isAddition ? "hinzugefügt" : "abgezogen"}`,
      description: `Grund: ${reason} · Neues Guthaben: ${formatStarCount(child.stars + delta)}`,
    });

    setStarDraft(0);
    setStarReason(null);
  }

  function startEditName(child: Child) {
    setEditingNameId(child.id);
    setEditNameValue(child.name);
  }

  async function saveEditName(childId: string) {
    if (editNameValue.trim()) {
      await updateChild(childId, { name: editNameValue.trim() });
      toast({ title: "Name aktualisiert" });
    }
    setEditingNameId(null);
  }

  async function handleConfirmDeleteChild() {
    const child = childPendingDeletion;
    if (!child) return;

    setChildPendingDeletion(null);
    await removeChild(child.id);
    toast({ title: `${child.name} wurde entfernt`, variant: "destructive" });
    if (expandedChildId === child.id) {
      setExpandedChildId(null);
    }
  }

  async function handleAddChild() {
    if (!newChildName.trim()) return;
    const newChild: Child = {
      id: `child-${Date.now()}`,
      name: newChildName.trim(),
      avatar: newChildAvatar,
      stars: 0,
      theme: newChildTheme,
      backgroundSkin: "none",
      ageGroup: newChildAgeGroup,
    };
    await addChild(newChild);
    toast({ title: `${newChild.name} wurde hinzugefügt` });
    setNewChildName("");
    setNewChildAvatar(DEFAULT_AVATAR_VALUE);
    setNewChildTheme("sterne");
    setNewChildAgeGroup("6-8");
    setShowAddForm(false);
  }

  async function selectAvatar(childId: string, avatar: AvatarValue) {
    await updateChild(childId, { avatar });
    setShowAvatarPicker(null);
    toast({ title: "Avatar aktualisiert" });
  }

  async function pickExistingChildPhoto(childId: string) {
    const result = await pickAvatarPhotoAsync();

    if (result.status === "selected") {
      await updateChild(childId, { avatar: result.avatar });
      setShowAvatarPicker(null);
      toast({ title: "Profilbild aktualisiert" });
      return;
    }

    if (result.status === "denied") {
      toast({
        title: "Fotozugriff benötigt",
        description: "Erlaube den Zugriff auf deine Fotomediathek, um ein eigenes Profilbild zu wählen.",
        variant: "destructive",
      });
    }
  }

  async function pickNewChildPhoto() {
    const result = await pickAvatarPhotoAsync();

    if (result.status === "selected") {
      setNewChildAvatar(result.avatar);
      return;
    }

    if (result.status === "denied") {
      toast({
        title: "Fotozugriff benötigt",
        description: "Erlaube den Zugriff auf deine Fotomediathek, um ein eigenes Profilbild zu wählen.",
        variant: "destructive",
      });
    }
  }

  async function selectTheme(childId: string, theme: ChildTheme) {
    await updateChild(childId, { theme });
    toast({ title: "Theme aktualisiert" });
  }

  async function selectAgeGroup(childId: string, ageGroup: AgeGroup) {
    await updateChild(childId, { ageGroup });
    toast({ title: "Altersgruppe aktualisiert" });
  }

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 96 : 0}
      >
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4 pb-8"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      >
      <SettingsHeroCard
        label="Familie"
        title="Kinderprofile"
        description="Profile bleiben lokal auf diesem Gerät und wechseln direkt zurück in den Kindermodus."
        badges={[{ label: childCountLabel }, { label: `${totalStars} Sterne` }]}
      />

      {/* Children list */}
      {children.length === 0 && !showAddForm && (
        <Card className="mb-3 items-center rounded-[28px] px-5 py-10">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-card bg-secondary">
            <Sparkles size={28} color={semanticColors.accent} />
          </View>
          <Text className="text-center text-lg font-headline text-foreground">
            Noch keine Kinder
          </Text>
          <Text className="mt-2 text-center text-sm font-body text-muted-foreground">
            Füge dein erstes Profil hinzu, damit Dashboard, Belohnungen und Profilansicht direkt
            damit arbeiten können.
          </Text>
        </Card>
      )}

      {children.map((child) => {
        const childPalette = getThemePalette(child.theme);
        const starPreview = Math.max(0, child.stars + starDraft);
        const canDecreaseStars = child.stars + starDraft > 0;
        const canIncreaseStars = starDraft < MAX_STAR_ADJUSTMENT;
        const canApplyStars = starDraft !== 0 && starReason !== null;
        const canResetStars = starDraft !== 0 || starReason !== null;

        return (
          <Animated.View
            key={child.id}
            layout={Layout.springify()}
            entering={FadeInDown.duration(300)}
            exiting={FadeOutUp.duration(200)}
            className="mb-3"
          >
            <Card
              className="overflow-hidden rounded-[28px] border p-0"
              style={{ borderColor: childPalette.accentBorder, backgroundColor: childPalette.cardTint }}
            >
              <View
                className="absolute inset-x-0 top-0 h-24"
                style={{ backgroundColor: childPalette.heroSurface }}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
              <View
                className="absolute right-[-18px] top-[-10px] h-24 w-24 rounded-full"
                style={{ backgroundColor: childPalette.motifSecondary, opacity: 0.28 }}
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
              />
            {/* Child header (always visible) */}
            <Pressable
              onPress={() => toggleExpanded(child.id)}
              className="flex-row items-center px-4 py-4 active:bg-secondary/50"
              accessibilityRole="button"
              accessibilityLabel={`${child.name}, ${child.stars} Sterne`}
              accessibilityHint={
                expandedChildId === child.id ? "Profil schließen" : "Profil bearbeiten"
              }
              accessibilityState={{ expanded: expandedChildId === child.id }}
            >
              <View
                className="h-14 w-14 items-center justify-center rounded-[20px]"
                style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
              >
                <AvatarImage
                  avatar={child.avatar}
                  size={56}
                  borderRadius={20}
                  backgroundColor="transparent"
                  accessibilityLabel={`${child.name} Avatar`}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-lg font-headline text-foreground" maxFontSizeMultiplier={1.3}>
                  {child.name}
                </Text>
                <View className="mt-1 flex-row flex-wrap items-center gap-2">
                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
                  >
                    <Text
                      className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                      style={{ color: childPalette.accentText }}
                      maxFontSizeMultiplier={1.3}
                    >
                      {getThemeLabel(child.theme)}
                    </Text>
                  </View>
                  {child.ageGroup ? (
                    <View
                      className="rounded-full px-2.5 py-1"
                      style={{ backgroundColor: "rgba(255,255,255,0.85)" }}
                    >
                      <Text
                        className="text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground"
                        maxFontSizeMultiplier={1.3}
                      >
                        {child.ageGroup}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View className="mr-3 items-end">
                <View
                  className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
                  style={{ backgroundColor: childPalette.tabActiveBg }}
                >
                  <Star size={14} color={semanticColors.goldDeep} fill={semanticColors.gold} />
                  <Text
                    className="text-sm font-body-bold"
                    style={{ color: childPalette.accentText }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {child.stars}
                  </Text>
                </View>
              </View>
              <Animated.View
                style={{
                  transform: [
                    { rotate: expandedChildId === child.id ? "90deg" : "0deg" },
                  ],
                }}
              >
                <ChevronRight
                  size={20}
                  color={semanticColors.mutedForeground}
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                />
              </Animated.View>
            </Pressable>

            {/* Expanded content */}
            {expandedChildId === child.id && (
              <Animated.View
                entering={FadeInDown.duration(200)}
                exiting={FadeOutUp.duration(150)}
              >
                <Separator />
                <View className="p-4 gap-4">
                  {/* Edit name */}
                  <View
                    className="rounded-card border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: childPalette.accentSoft }}
                  >
                    <View className="mb-3 flex-row items-center gap-2">
                      <Sparkles size={16} color={childPalette.accentStrong} />
                      <Text
                        className="text-sm font-body-semibold"
                        style={{ color: childPalette.accentText }}
                        accessibilityRole="header"
                        maxFontSizeMultiplier={1.3}
                      >
                        Name
                      </Text>
                    </View>
                    {editingNameId === child.id ? (
                      <View className="flex-row items-center gap-2">
                        <Input
                          value={editNameValue}
                          onChangeText={setEditNameValue}
                          autoFocus
                          className="flex-1"
                          onSubmitEditing={() => saveEditName(child.id)}
                        />
                        <PressableScale
                          onPress={() => saveEditName(child.id)}
                          className="h-12 w-12 items-center justify-center rounded-tile bg-primary"
                          accessibilityRole="button"
                          accessibilityLabel="Namen speichern"
                        >
                          <Check size={20} color={semanticColors.foreground} />
                        </PressableScale>
                        <PressableScale
                          onPress={() => setEditingNameId(null)}
                          className="h-12 w-12 items-center justify-center rounded-tile bg-secondary"
                          accessibilityRole="button"
                          accessibilityLabel="Namensänderung abbrechen"
                        >
                          <X size={20} color={semanticColors.mutedForeground} />
                        </PressableScale>
                      </View>
                    ) : (
                      <PressableScale
                        onPress={() => startEditName(child)}
                        className="min-h-12 flex-row items-center justify-between rounded-tile border border-input bg-card px-4 py-3"
                        accessibilityRole="button"
                        accessibilityLabel={`Namen bearbeiten, aktuell ${child.name}`}
                      >
                        <Text className="text-base font-body text-foreground" maxFontSizeMultiplier={1.3}>
                          {child.name}
                        </Text>
                        <Text
                          className="text-sm font-body-semibold"
                          style={{ color: childPalette.accentText }}
                          maxFontSizeMultiplier={1.3}
                        >
                          Bearbeiten
                        </Text>
                      </PressableScale>
                    )}
                  </View>

                  {/* Avatar picker */}
                  <View
                    className="rounded-card border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <View className="mb-3 flex-row items-center gap-2">
                      <Palette size={16} color={childPalette.accentStrong} />
                      <Text
                        className="text-sm font-body-semibold"
                        style={{ color: childPalette.accentText }}
                        accessibilityRole="header"
                        maxFontSizeMultiplier={1.3}
                      >
                        Avatar
                      </Text>
                    </View>
                    {showAvatarPicker === child.id ? (
                      <View className="gap-3">
                        <ScrollView
                          nestedScrollEnabled
                          showsVerticalScrollIndicator={false}
                          className="max-h-[240px] rounded-card"
                          contentContainerClassName="gap-3 pb-1"
                        >
                          {allAvatars.map(([category, avatars]) => (
                            <View key={category}>
                              <Text
                                className="mb-1.5 text-xs font-body-semibold text-muted-foreground"
                                maxFontSizeMultiplier={1.3}
                              >
                                {category}
                              </Text>
                              <View className="flex-row flex-wrap gap-2">
                                {avatars.map((avatar) => (
                                  <PressableScale
                                    key={avatar.id}
                                    onPress={() =>
                                      selectAvatar(child.id, avatar.value)
                                    }
                                    className={cn(
                                      "h-12 w-12 items-center justify-center rounded-chip",
                                      areAvatarValuesEqual(child.avatar, avatar.value)
                                        ? "bg-primary/40 border-2 border-primary"
                                        : "bg-secondary"
                                    )}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Avatar ${avatar.label} auswählen`}
                                    accessibilityState={{
                                      selected: areAvatarValuesEqual(child.avatar, avatar.value),
                                    }}
                                  >
                                    <AvatarImage
                                      avatar={avatar.value}
                                      size={44}
                                      borderRadius={14}
                                      backgroundColor="transparent"
                                      accessibilityElementsHidden
                                    />
                                  </PressableScale>
                                ))}
                              </View>
                            </View>
                          ))}
                        </ScrollView>
                        <PressableScale
                          onPress={() => pickExistingChildPhoto(child.id)}
                          className="min-h-12 flex-row items-center justify-center rounded-tile border px-4 py-3"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.78)",
                            borderColor: childPalette.accentBorder,
                          }}
                          accessibilityRole="button"
                          accessibilityLabel="Eigenes Foto aus der Fotomediathek auswählen"
                        >
                          <ImagePlus size={18} color={childPalette.accentStrong} />
                          <Text
                            className="ml-2 text-sm font-body-semibold"
                            style={{ color: childPalette.accentText }}
                            maxFontSizeMultiplier={1.3}
                          >
                            Eigenes Foto auswählen
                          </Text>
                        </PressableScale>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={() => setShowAvatarPicker(null)}
                          accessibilityRole="button"
                          accessibilityLabel="Avatarauswahl schliessen"
                        >
                          Schliessen
                        </Button>
                      </View>
                    ) : (
                      <PressableScale
                        onPress={() => setShowAvatarPicker(child.id)}
                        className="min-h-12 flex-row items-center justify-between rounded-tile border border-input bg-card px-4 py-3"
                        accessibilityRole="button"
                        accessibilityLabel={`Avatar von ${child.name} ändern`}
                      >
                        <View className="flex-row items-center gap-2">
                          <AvatarImage
                            avatar={child.avatar}
                            size={34}
                            borderRadius={12}
                            accessibilityElementsHidden
                          />
                          <Text
                            className="text-base font-body text-foreground"
                            maxFontSizeMultiplier={1.3}
                          >
                            Aktueller Avatar
                          </Text>
                        </View>
                        <Text
                          className="text-sm font-body-semibold"
                          style={{ color: childPalette.accentText }}
                          maxFontSizeMultiplier={1.3}
                        >
                          Ändern
                        </Text>
                      </PressableScale>
                    )}
                  </View>

                  <View
                    className="rounded-card border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <View className="mb-3 flex-row items-center gap-2">
                      <Palette size={16} color={childPalette.accentStrong} />
                      <Text
                        className="text-sm font-body-semibold"
                        style={{ color: childPalette.accentText }}
                        accessibilityRole="header"
                        maxFontSizeMultiplier={1.3}
                      >
                        Welt & Alter
                      </Text>
                    </View>

                    <Text
                      className="text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground"
                      maxFontSizeMultiplier={1.3}
                    >
                      Theme
                    </Text>
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {THEME_OPTIONS.map((option) => {
                        const optionPalette = getThemePalette(option.value);
                        const isActive = child.theme === option.value;
                        const OptionIcon = getIcon(option.iconName);

                        return (
                          <PressableScale
                            key={option.value}
                            onPress={() => selectTheme(child.id, option.value)}
                            className="min-h-11 flex-row items-center gap-2 rounded-tile border px-3 py-2"
                            accessibilityRole="button"
                            accessibilityState={{ selected: isActive }}
                            accessibilityLabel={`${option.label} Theme auswählen`}
                            style={{
                              backgroundColor: isActive ? optionPalette.heroSurface : "rgba(255,255,255,0.76)",
                              borderColor: isActive ? optionPalette.accent : childPalette.accentBorder,
                            }}
                          >
                            <OptionIcon
                              size={16}
                              color={isActive ? optionPalette.accentText : semanticColors.foreground}
                            />
                            <Text
                              className="text-sm font-body-semibold"
                              style={{
                                color: isActive ? optionPalette.accentText : semanticColors.foreground,
                              }}
                              maxFontSizeMultiplier={1.3}
                            >
                              {option.label}
                            </Text>
                          </PressableScale>
                        );
                      })}
                    </View>

                    <Text
                      className="mt-4 text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground"
                      maxFontSizeMultiplier={1.3}
                    >
                      Altersgruppe
                    </Text>
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {AGE_GROUP_OPTIONS.map((option) => {
                        const isActive = child.ageGroup === option.value;

                        return (
                          <PressableScale
                            key={option.value}
                            onPress={() => selectAgeGroup(child.id, option.value)}
                            className="min-h-11 justify-center rounded-full border px-3 py-2"
                            style={{
                              backgroundColor: isActive ? childPalette.tabActiveBg : "rgba(255,255,255,0.76)",
                              borderColor: isActive ? childPalette.accent : childPalette.accentBorder,
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={`Altersgruppe ${option.label} auswählen`}
                            accessibilityState={{ selected: isActive }}
                          >
                            <Text
                              className="text-sm font-body-semibold"
                              style={{
                                color: isActive ? childPalette.accentText : semanticColors.foreground,
                              }}
                              maxFontSizeMultiplier={1.3}
                            >
                              {option.label}
                            </Text>
                          </PressableScale>
                        );
                      })}
                    </View>
                  </View>

                  {/* Star correction */}
                  <View
                    className="rounded-card border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <View className="mb-1 flex-row items-center gap-2">
                      <Star size={16} color={childPalette.accentStrong} />
                      <Text
                        className="text-sm font-body-semibold"
                        style={{ color: childPalette.accentText }}
                        accessibilityRole="header"
                        maxFontSizeMultiplier={1.3}
                      >
                        Sterne anpassen
                      </Text>
                    </View>
                    <Text
                      className="mb-3 text-xs font-body text-muted-foreground"
                      maxFontSizeMultiplier={1.3}
                    >
                      Korrekturen landen mit Grund im Verlauf.
                    </Text>

                    <View
                      className="flex-row items-center justify-between rounded-tile px-4 py-3"
                      style={{ backgroundColor: childPalette.tabActiveBg }}
                    >
                      <Text
                        className="text-sm font-body text-muted-foreground"
                        maxFontSizeMultiplier={1.3}
                      >
                        Aktuelles Guthaben
                      </Text>
                      <View className="flex-row items-center gap-1.5">
                        <Star size={18} color={semanticColors.goldDeep} fill={semanticColors.gold} />
                        <Text
                          className="text-lg font-headline"
                          style={{ color: childPalette.accentText }}
                          maxFontSizeMultiplier={1.4}
                        >
                          {child.stars}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-3 flex-row items-center justify-between gap-2">
                      <PressableScale
                        onPress={() => changeStarDraft(child, -5)}
                        disabled={!canDecreaseStars}
                        className="h-12 min-w-[52px] items-center justify-center rounded-tile border px-3"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.78)",
                          borderColor: childPalette.accentBorder,
                          opacity: canDecreaseStars ? 1 : 0.4,
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Fünf Sterne abziehen"
                        accessibilityState={{ disabled: !canDecreaseStars }}
                      >
                        <Text
                          className="text-sm font-body-semibold"
                          style={{ color: childPalette.accentText }}
                          maxFontSizeMultiplier={1.3}
                        >
                          -5
                        </Text>
                      </PressableScale>

                      <PressableScale
                        onPress={() => changeStarDraft(child, -1)}
                        disabled={!canDecreaseStars}
                        className="h-12 w-12 items-center justify-center rounded-tile border"
                        style={{
                          backgroundColor: childPalette.accentSoft,
                          borderColor: childPalette.accent,
                          opacity: canDecreaseStars ? 1 : 0.4,
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Einen Stern abziehen"
                        accessibilityState={{ disabled: !canDecreaseStars }}
                      >
                        <Minus size={20} color={childPalette.accentStrong} />
                      </PressableScale>

                      <View className="flex-1 items-center">
                        <Text
                          className="text-xl font-headline"
                          style={{
                            color:
                              starDraft === 0
                                ? semanticColors.mutedForeground
                                : childPalette.accentText,
                          }}
                          maxFontSizeMultiplier={1.3}
                        >
                          {formatSignedStars(starDraft)}
                        </Text>
                        <Text
                          className="mt-0.5 text-xs font-body text-muted-foreground"
                          maxFontSizeMultiplier={1.4}
                        >
                          Neu: {starPreview}
                        </Text>
                      </View>

                      <PressableScale
                        onPress={() => changeStarDraft(child, 1)}
                        disabled={!canIncreaseStars}
                        className="h-12 w-12 items-center justify-center rounded-tile border"
                        style={{
                          backgroundColor: childPalette.accentSoft,
                          borderColor: childPalette.accent,
                          opacity: canIncreaseStars ? 1 : 0.4,
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Einen Stern hinzufügen"
                        accessibilityState={{ disabled: !canIncreaseStars }}
                      >
                        <Plus size={20} color={childPalette.accentStrong} />
                      </PressableScale>

                      <PressableScale
                        onPress={() => changeStarDraft(child, 5)}
                        disabled={!canIncreaseStars}
                        className="h-12 min-w-[52px] items-center justify-center rounded-tile border px-3"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.78)",
                          borderColor: childPalette.accentBorder,
                          opacity: canIncreaseStars ? 1 : 0.4,
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="Fünf Sterne hinzufügen"
                        accessibilityState={{ disabled: !canIncreaseStars }}
                      >
                        <Text
                          className="text-sm font-body-semibold"
                          style={{ color: childPalette.accentText }}
                          maxFontSizeMultiplier={1.3}
                        >
                          +5
                        </Text>
                      </PressableScale>
                    </View>

                    <Text
                      className="mt-4 text-xs font-body-semibold uppercase tracking-[0.6px] text-muted-foreground"
                      maxFontSizeMultiplier={1.3}
                    >
                      Grund (Pflicht)
                    </Text>
                    <View className="mt-2 flex-row flex-wrap gap-2">
                      {STAR_ADJUST_REASONS.map((reason) => {
                        const isActive = starReason === reason;

                        return (
                          <PressableScale
                            key={reason}
                            onPress={() => selectStarReason(reason)}
                            className="min-h-11 justify-center rounded-chip border px-3 py-2"
                            style={{
                              backgroundColor: isActive
                                ? childPalette.tabActiveBg
                                : "rgba(255,255,255,0.76)",
                              borderColor: isActive ? childPalette.accent : childPalette.accentBorder,
                            }}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isActive }}
                            accessibilityLabel={`Grund ${reason} auswählen`}
                          >
                            <Text
                              className="text-sm font-body-semibold"
                              style={{
                                color: isActive ? childPalette.accentText : semanticColors.foreground,
                              }}
                              maxFontSizeMultiplier={1.3}
                            >
                              {reason}
                            </Text>
                          </PressableScale>
                        );
                      })}
                    </View>

                    {starDraft !== 0 && starReason === null ? (
                      <Text
                        className="mt-2 text-xs font-body text-muted-foreground"
                        accessibilityLiveRegion="polite"
                        maxFontSizeMultiplier={1.3}
                      >
                        Wähle einen Grund, damit die Anpassung nachvollziehbar bleibt.
                      </Text>
                    ) : null}

                    <View className="mt-4 flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onPress={resetStarAdjustment}
                        disabled={!canResetStars}
                        accessibilityRole="button"
                        accessibilityLabel="Anpassung verwerfen"
                        style={{
                          borderColor: childPalette.accentBorder,
                          opacity: canResetStars ? 1 : 0.5,
                        }}
                      >
                        Verwerfen
                      </Button>
                      <Button
                        className="flex-1"
                        onPress={() => setStarConfirmChildId(child.id)}
                        disabled={!canApplyStars}
                        accessibilityRole="button"
                        accessibilityLabel="Sternenanpassung übernehmen"
                        style={{ opacity: canApplyStars ? 1 : 0.5 }}
                      >
                        Übernehmen
                      </Button>
                    </View>
                  </View>

                  {/* Routines overview */}
                  <View
                    className="rounded-card border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <View className="mb-2 flex-row items-center justify-between gap-3">
                      <View className="flex-1">
                        <Text
                          className="text-sm font-body-semibold"
                          style={{ color: childPalette.accentText }}
                          accessibilityRole="header"
                          maxFontSizeMultiplier={1.3}
                        >
                          Routinen
                        </Text>
                        <Text
                          className="mt-0.5 text-xs font-body text-muted-foreground"
                          maxFontSizeMultiplier={1.3}
                        >
                          Familienweit fuer alle Kinder
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-2.5 py-1"
                        style={{ backgroundColor: childPalette.tabActiveBg }}
                      >
                        <Text
                          className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                          style={{ color: childPalette.accentText }}
                        >
                          Familienweit
                        </Text>
                      </View>
                    </View>
                    {routines.length === 0 ? (
                      <Text className="text-sm font-body text-muted-foreground">
                        Noch keine Routinen angelegt.
                      </Text>
                    ) : (
                      routines.map((routine) => (
                        <View
                          key={routine.id}
                          className="flex-row items-center py-2 px-1"
                        >
                          <View
                            className="h-3 w-3 rounded-full mr-2"
                            style={{
                              backgroundColor: routine.color || semanticColors.primary,
                            }}
                            accessibilityElementsHidden
                            importantForAccessibility="no-hide-descendants"
                          />
                          <Text
                            className="flex-1 text-sm font-body text-foreground"
                            maxFontSizeMultiplier={1.3}
                          >
                            {routine.name}
                          </Text>
                          <Text
                            className="text-xs font-body text-muted-foreground"
                            maxFontSizeMultiplier={1.3}
                          >
                            {routine.tasks.length} Aufgaben
                          </Text>
                        </View>
                      ))
                    )}
                    <Button
                      variant="outline"
                      onPress={() => router.push("/settings/routines" as never)}
                      className="mt-3 w-full"
                      accessibilityRole="button"
                      accessibilityLabel="Routinen bearbeiten"
                      style={{
                        borderColor: childPalette.accentBorder,
                        backgroundColor: semanticColors.card,
                      }}
                    >
                      <Text
                        className="text-sm font-body-semibold"
                        style={{ color: childPalette.accentText }}
                        maxFontSizeMultiplier={1.3}
                      >
                        Routinen bearbeiten
                      </Text>
                    </Button>
                  </View>

                  {/* Rewards overview */}
                  <View
                    className="rounded-card border px-4 py-4"
                    style={{ borderColor: childPalette.accentBorder, backgroundColor: "rgba(255,255,255,0.84)" }}
                  >
                    <View className="mb-2 flex-row items-center justify-between gap-3">
                      <View className="flex-1">
                        <Text
                          className="text-sm font-body-semibold"
                          style={{ color: childPalette.accentText }}
                          accessibilityRole="header"
                          maxFontSizeMultiplier={1.3}
                        >
                          Belohnungen
                        </Text>
                        <Text
                          className="mt-0.5 text-xs font-body text-muted-foreground"
                          maxFontSizeMultiplier={1.3}
                        >
                          Familienweit fuer alle Kinder
                        </Text>
                      </View>
                      <View
                        className="rounded-full px-2.5 py-1"
                        style={{ backgroundColor: childPalette.tabActiveBg }}
                      >
                        <Text
                          className="text-xs font-body-semibold uppercase tracking-[0.6px]"
                          style={{ color: childPalette.accentText }}
                        >
                          Familienweit
                        </Text>
                      </View>
                    </View>
                    {rewards.length === 0 ? (
                      <Text className="text-sm font-body text-muted-foreground">
                        Noch keine Belohnungen angelegt.
                      </Text>
                    ) : (
                      rewards.map((reward) => {
                        const Icon = getIcon(reward.iconName);
                        return (
                          <View
                            key={reward.id}
                            className="flex-row items-center py-2 px-1"
                          >
                            <Icon
                              size={16}
                              color={semanticColors.mutedForeground}
                              accessibilityElementsHidden
                              importantForAccessibility="no-hide-descendants"
                            />
                            <Text
                              className="flex-1 ml-2 text-sm font-body text-foreground"
                              maxFontSizeMultiplier={1.3}
                            >
                              {reward.title}
                            </Text>
                            <Text
                              className="text-xs font-body text-muted-foreground"
                              maxFontSizeMultiplier={1.3}
                            >
                              {reward.cost} Sterne
                            </Text>
                          </View>
                        );
                      })
                    )}
                    <Button
                      variant="outline"
                      onPress={() => router.push("/settings/rewards" as never)}
                      className="mt-3 w-full"
                      accessibilityRole="button"
                      accessibilityLabel="Belohnungen bearbeiten"
                      style={{
                        borderColor: childPalette.accentBorder,
                        backgroundColor: semanticColors.card,
                      }}
                    >
                      <Text
                        className="text-sm font-body-semibold"
                        style={{ color: childPalette.accentText }}
                        maxFontSizeMultiplier={1.3}
                      >
                        Belohnungen bearbeiten
                      </Text>
                    </Button>
                  </View>

                  {/* Delete button */}
                  <Separator />
                  <Button
                    variant="destructive"
                    size="sm"
                    onPress={() => setChildPendingDeletion(child)}
                    className="self-start"
                    accessibilityRole="button"
                    accessibilityLabel={`${child.name} entfernen`}
                  >
                    <View className="flex-row items-center gap-2">
                      <Trash2 size={16} color={semanticColors.destructiveForeground} />
                      <Text
                        className="text-sm font-body-semibold text-destructive-foreground"
                        maxFontSizeMultiplier={1.3}
                      >
                        Kind entfernen
                      </Text>
                    </View>
                  </Button>
                </View>
              </Animated.View>
            )}
            </Card>
          </Animated.View>
        );
      })}

      {/* Add child form */}
      {showAddForm ? (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Card className="mt-2 overflow-hidden rounded-[28px] border p-0">
            <View
              className="px-4 py-4"
              style={{ backgroundColor: newChildPalette.heroSurface }}
            >
              <Text className="text-lg font-headline text-foreground">
                Neues Kind hinzufügen
              </Text>
              <Text className="mt-1 text-sm font-body text-muted-foreground">
                Name, Welt, Alter und Avatar reichen für einen guten Start.
              </Text>
            </View>

            <View className="gap-4 px-4 py-4">
              <View
                className="rounded-card border px-4 py-4"
                style={{
                  borderColor: newChildPalette.accentBorder,
                  backgroundColor: newChildPalette.cardTint,
                }}
              >
                <Text
                  className="text-xs font-body-semibold uppercase tracking-[0.7px] text-muted-foreground"
                  maxFontSizeMultiplier={1.3}
                >
                  Vorschau
                </Text>
                <View className="mt-3 flex-row items-center">
                  <View
                    className="h-16 w-16 items-center justify-center rounded-card"
                    style={{ backgroundColor: "rgba(255,255,255,0.8)" }}
                  >
                    <AvatarImage
                      avatar={newChildAvatar}
                      size={64}
                      borderRadius={22}
                      backgroundColor="transparent"
                      accessibilityLabel="Avatar Vorschau"
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xl font-headline text-foreground">
                      {newChildName.trim() || "Neues Kind"}
                    </Text>
                    <Text
                      className="mt-1 text-sm font-body"
                      style={{ color: newChildPalette.accentText }}
                      maxFontSizeMultiplier={1.3}
                    >
                      {getThemeLabel(newChildTheme)} · {newChildAgeGroup}
                    </Text>
                  </View>
                </View>
              </View>

              <View>
                <Text
                  className="text-sm font-body-semibold text-muted-foreground mb-2"
                  accessibilityRole="header"
                  maxFontSizeMultiplier={1.3}
                >
                  Name
                </Text>
                <Pressable
                  accessible={false}
                  onPress={() => newChildNameInputRef.current?.focus()}
                >
                  <Input
                    ref={newChildNameInputRef}
                    value={newChildName}
                    onChangeText={setNewChildName}
                    placeholder="Name des Kindes"
                    returnKeyType="done"
                  />
                </Pressable>
              </View>

              <View>
                <Text
                  className="text-sm font-body-semibold text-muted-foreground mb-2"
                  accessibilityRole="header"
                  maxFontSizeMultiplier={1.3}
                >
                  Theme
                </Text>
                <View className="flex-row flex-wrap gap-2">
                      {THEME_OPTIONS.map((option) => {
                        const optionPalette = getThemePalette(option.value);
                        const isActive = newChildTheme === option.value;
                        const OptionIcon = getIcon(option.iconName);

                        return (
                          <PressableScale
                            key={option.value}
                            onPress={() => setNewChildTheme(option.value)}
                            className="min-h-11 flex-row items-center gap-2 rounded-tile border px-3 py-2"
                            accessibilityRole="button"
                            accessibilityState={{ selected: isActive }}
                            accessibilityLabel={`${option.label} Theme auswählen`}
                            style={{
                              backgroundColor: isActive ? optionPalette.heroSurface : "rgba(255,255,255,0.76)",
                              borderColor: isActive ? optionPalette.accent : semanticColors.border,
                            }}
                          >
                            <OptionIcon
                              size={16}
                              color={isActive ? optionPalette.accentText : semanticColors.foreground}
                            />
                            <Text
                              className="text-sm font-body-semibold"
                              style={{
                                color: isActive ? optionPalette.accentText : semanticColors.foreground,
                              }}
                              maxFontSizeMultiplier={1.3}
                            >
                              {option.label}
                            </Text>
                          </PressableScale>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text
                  className="text-sm font-body-semibold text-muted-foreground mb-2"
                  accessibilityRole="header"
                  maxFontSizeMultiplier={1.3}
                >
                  Altersgruppe
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {AGE_GROUP_OPTIONS.map((option) => {
                    const isActive = newChildAgeGroup === option.value;

                    return (
                      <PressableScale
                        key={option.value}
                        onPress={() => setNewChildAgeGroup(option.value)}
                        className="min-h-11 justify-center rounded-full border px-3 py-2"
                        style={{
                          backgroundColor: isActive ? newChildPalette.tabActiveBg : "rgba(255,255,255,0.76)",
                          borderColor: isActive ? newChildPalette.accent : semanticColors.border,
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`Altersgruppe ${option.label} auswählen`}
                        accessibilityState={{ selected: isActive }}
                      >
                        <Text
                          className="text-sm font-body-semibold"
                          style={{
                            color: isActive ? newChildPalette.accentText : semanticColors.foreground,
                          }}
                          maxFontSizeMultiplier={1.3}
                        >
                          {option.label}
                        </Text>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text
                  className="text-sm font-body-semibold text-muted-foreground mb-2"
                  accessibilityRole="header"
                  maxFontSizeMultiplier={1.3}
                >
                  Avatar wählen
                </Text>
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  className="max-h-[260px] rounded-card"
                  contentContainerClassName="gap-3 pb-1"
                  keyboardShouldPersistTaps="handled"
                >
                  {allAvatars.map(([category, avatars]) => (
                    <View key={category}>
                      <Text
                        className="mb-1.5 text-xs font-body-semibold text-muted-foreground"
                        maxFontSizeMultiplier={1.3}
                      >
                        {category}
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {avatars.map((avatar) => (
                          <PressableScale
                            key={avatar.id}
                            onPress={() => setNewChildAvatar(avatar.value)}
                            className={cn(
                              "h-12 w-12 items-center justify-center rounded-chip",
                              areAvatarValuesEqual(newChildAvatar, avatar.value)
                                ? "bg-primary/40 border-2 border-primary"
                                : "bg-secondary"
                            )}
                            accessibilityRole="button"
                            accessibilityLabel={`Avatar ${avatar.label} auswählen`}
                            accessibilityState={{
                              selected: areAvatarValuesEqual(newChildAvatar, avatar.value),
                            }}
                          >
                            <AvatarImage
                              avatar={avatar.value}
                              size={44}
                              borderRadius={14}
                              backgroundColor="transparent"
                              accessibilityElementsHidden
                            />
                          </PressableScale>
                        ))}
                      </View>
                    </View>
                  ))}
                </ScrollView>
                <PressableScale
                  onPress={pickNewChildPhoto}
                  containerClassName="mt-3"
                  className="min-h-12 flex-row items-center justify-center rounded-tile border px-4 py-3"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.78)",
                    borderColor: newChildPalette.accentBorder,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Eigenes Foto aus der Fotomediathek auswählen"
                >
                  <ImagePlus size={18} color={newChildPalette.accentStrong} />
                  <Text
                    className="ml-2 text-sm font-body-semibold"
                    style={{ color: newChildPalette.accentText }}
                    maxFontSizeMultiplier={1.3}
                  >
                    Eigenes Foto auswählen
                  </Text>
                </PressableScale>
              </View>

              <View className="flex-row gap-3">
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowAddForm(false);
                    setNewChildName("");
                    setNewChildAvatar(DEFAULT_AVATAR_VALUE);
                    setNewChildTheme("sterne");
                    setNewChildAgeGroup("6-8");
                  }}
                  className="flex-1"
                  accessibilityRole="button"
                  accessibilityLabel="Neues Kind abbrechen"
                >
                  Abbrechen
                </Button>
                <Button
                  onPress={handleAddChild}
                  disabled={!newChildName.trim()}
                  className="flex-1"
                  accessibilityRole="button"
                  accessibilityLabel="Kind anlegen"
                  accessibilityState={{ disabled: !newChildName.trim() }}
                >
                  Kind anlegen
                </Button>
              </View>
            </View>
          </Card>
        </Animated.View>
      ) : (
        <Button
          variant="outline"
          onPress={() => setShowAddForm(true)}
          className="mt-2 rounded-card"
          accessibilityRole="button"
          accessibilityLabel="Kind hinzufügen"
        >
          <View className="flex-row items-center gap-2">
            <Plus size={20} color={semanticColors.foreground} />
            <Text className="text-base font-body-semibold text-foreground" maxFontSizeMultiplier={1.3}>
              Kind hinzufügen
            </Text>
          </View>
        </Button>
      )}
      </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={childPendingDeletion !== null}
        title="Kind entfernen?"
        description={
          childPendingDeletion
            ? `Alle Daten von ${childPendingDeletion.name} — Sterne, Fortschritt und Sticker — gehen dauerhaft verloren.`
            : undefined
        }
        confirmLabel="Entfernen"
        destructive
        onConfirm={() => {
          void handleConfirmDeleteChild();
        }}
        onCancel={() => setChildPendingDeletion(null)}
      />

      <ConfirmDialog
        visible={starConfirmChild !== undefined && starDraft !== 0 && starReason !== null}
        title={
          starDraft < 0
            ? `${formatStarCount(Math.abs(starDraft))} abziehen?`
            : `${formatStarCount(Math.abs(starDraft))} hinzufügen?`
        }
        description={
          starConfirmChild
            ? `${starConfirmChild.name}: ${starConfirmChild.stars} → ${Math.max(
                0,
                starConfirmChild.stars + starDraft
              )} Sterne. Grund: ${starReason}.`
            : undefined
        }
        confirmLabel={starDraft < 0 ? "Abziehen" : "Hinzufügen"}
        onConfirm={() => {
          if (starConfirmChild) {
            void applyStarAdjustment(starConfirmChild);
          }
        }}
        onCancel={() => setStarConfirmChildId(null)}
      />
    </View>
  );
}
