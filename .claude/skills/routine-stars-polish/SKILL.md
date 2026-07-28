---
name: routine-stars-polish
description: Token contract + motion recipes for Routine Stars implementation agents
---

# Routine Stars — Polish Contract

Binding for every UI change in this repo. The *what* lives in
`docs/ai/DESIGN_DIRECTION.md`; this file is the *how*. If a value is not in a
table below, it does not go into a component.

---

## 1. Token contract

### 1.1 Colors

Never a raw hex in a component. Three sources, in this order: **Tailwind classes** →
**`getThemePalette(child.theme)`** for anything child/theme dependent (`accent`,
`screenGradient`, `heroSurface`, `cardTint`, `tabActiveBg`, `celebrationColors`, …) →
**`semanticColors`** when a raw string is unavoidable (SVG `fill`, icon `color`,
animated styles). Tailwind and `semanticColors` are the same values, kebab vs camel.

| Token / class | Hex | Use |
|---|---|---|
| `background` / `foreground` | `#F8E9D7` / `#1a1a2e` | App background, primary text |
| `card` / `cardForeground` | `#FFFFFF` / `#1a1a2e` | Surfaces + text on them |
| `muted` / `mutedForeground` | `#F5F5F5` / `#737373` | Inactive fills, secondary text |
| `border` | `#E5E5E5` | Hairlines |
| `primary` / `primaryForeground` | `#F3E5AB` / `#1a1a2e` | Brand CTA |
| `accent` / `accentForeground` | `#245A74` / `#FFFFFF` | Secondary CTA, links |
| `gold` / `goldDeep` / `goldText` | `#FFD700` / `#F7A313` / `#B97E0B` | Star fill / stroke / label |
| `success` | `#4FD17A` | Fill + indicators only — **never text** |
| `successSoft` | `#ECFDF5` | "done" tinted surface |
| `successForeground` | `#1F8A4C` | 4.38:1 — only ≥14px bold or ≥18px |
| `successStrong` | `#18773F` | 5.60:1 — small success text on white |
| `warning` | `#F7A313` | Fill / icon |
| `warningSoft` | `#FEF3C7` | Hint surface |
| `warningForeground` | `#92400E` | 7.09:1 on white — hint text |
| `destructive` | `#EF4444` | Fill / icon — **not** behind white text (3.76:1) |
| `destructiveSoft` | `#FDECEC` | Danger surface |
| `destructiveStrong` | `#8A1F1F` | 9.14:1 — destructive CTAs and text |

### 1.2 Radius

| Class | px | Use |
|---|---|---|
| `rounded-card` | 22 | Cards, dialogs, sheets, hero surfaces |
| `rounded-tile` | 18 | Icon squircles, inputs, tiles, in-card buttons |
| `rounded-chip` | 14 | Chips, pills, badges, segments |
| `rounded-full` | — | Avatars, star circles, CTA pills |

`rounded-lg` / `md` / `sm` and `rounded-xl` / `2xl` / `[22px]` are **deprecated**:
they still compile for legacy code, never write new ones.

### 1.3 Shadows

Only `shadowPresets` from `lib/theme.ts`, spread into `style`:

| Preset | Color | Opacity / radius / offset | Use |
|---|---|---|---|
| `shadowSubtle` | `ambient #9DB8D8` | 0.06 / 8 / (0,3) | Chips, pills, segments, tiles |
| `shadowCard` | `ambient #9DB8D8` | 0.08 / 16 / (0,8) | List rows, hero + reward cards |
| `shadowFloating` | `deep #2E3A68` | 0.08 / 28 / (0,14) | Dialogs, sheets, toasts |

```tsx
import { shadowPresets } from "@/lib/theme";

<View className="rounded-card bg-card p-4" style={shadowPresets.shadowCard} />
```

No `shadow-lg`/`shadow-md` utilities, no ad-hoc shadow objects, no real blur.

### 1.4 Type scale

Poppins only: `font-body` (400) · `font-body-semibold` (600) ·
`font-body-bold` = `font-headline` (700).

| Class | px | Use |
|---|---|---|
| `text-3xl` | 30 | Screen headline, max one per screen |
| `text-xl` | 20 | Dialog title, section headline |
| `text-lg` | 18 | Card title |
| `text-base` | 16 | Body, button labels, inputs |
| `text-sm` | 14 | Secondary text, sublines |
| `text-xs` | 12 | **Floor.** Meta only: badges, chips, counters, captions |

Body and every interactive label ≥14px. Touch targets ≥44×44pt.
Add `maxFontSizeMultiplier` where Dynamic Type would break a pill or counter.

---

## 2. Motion recipes (Reanimated v4)

Import tokens from `@/lib/motion` — never hand-write a spring config.
Vocabulary: `springs.{playful,bouncy,gentle,press,modal,sheet}`,
`modalSpring` / `sheetSpring` / `pressSpring`, `durations`, `easings`, `timings`,
`enterStagger` / `enterFade`, `exitFade` / `exitSlideDown`.

### 2.1 List entrance stagger

```tsx
import Animated from "react-native-reanimated";
import { enterStagger } from "@/lib/motion";

{tasks.map((task, index) => (
  <Animated.View key={task.id} entering={enterStagger(index)}>
    <TaskItem task={task} />
  </Animated.View>
))}
```

40ms per item, capped at 240ms total, `ReduceMotion.System` baked in.
Build one builder per node — never hoist `enterStagger(0)` into a shared const.

### 2.2 Press feedback — use the primitive

```tsx
import { PressableScale } from "@/components/ui/pressable-scale";

<PressableScale
  className="rounded-chip bg-primary px-4 py-3"
  accessibilityRole="button"
  accessibilityLabel="Belohnung einlösen"
  onPress={redeem}
>
  <Text className="font-body-semibold text-base text-primary-foreground">Einlösen</Text>
</PressableScale>
```

For a non-pressable surface that must react to a parent's press:

```tsx
const scale = useSharedValue(1);
const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

// onPressIn / onPressOut
scale.value = withSpring(0.96, pressSpring);
scale.value = withSpring(1, pressSpring);
```

### 2.3 Exit fade on unmount

```tsx
import { enterFade, exitFade } from "@/lib/motion";

{hasError ? (
  <Animated.View entering={enterFade()} exiting={exitFade()}>
    <ErrorState onRetry={reload} />
  </Animated.View>
) : null}
```

Use `exitSlideDown()` instead when the element should leave downward
(removed list rows, dismissed sheets).

### 2.4 Bottom-sheet slide-in

```tsx
import { sheetSpring, timings } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const reduceMotion = useReducedMotion();
const translateY = useSharedValue(SHEET_HEIGHT);
const opacity = useSharedValue(0);

useEffect(() => {
  if (!visible) {
    translateY.value = SHEET_HEIGHT;
    opacity.value = 0;
    return;
  }
  translateY.value = reduceMotion ? 0 : withSpring(0, sheetSpring);
  opacity.value = reduceMotion ? 1 : withTiming(1, timings.fast);
}, [opacity, reduceMotion, translateY, visible]);

const sheetStyle = useAnimatedStyle(() => ({
  opacity: opacity.value,
  transform: [{ translateY: translateY.value }],
}));
```

Centered dialogs use `modalSpring` on a small `translateY` lift (12 → 0) instead —
see `components/ui/confirm-dialog.tsx`.

### 2.5 Celebration burst

```tsx
import { durations, easings, springs, timings } from "@/lib/motion";
import { triggerFeedback } from "@/lib/feedback";

const scale = useSharedValue(0.6);
const lift = useSharedValue(0);
const opacity = useSharedValue(0);

function celebrate() {
  void triggerFeedback("routine_complete");
  if (reduceMotion) return; // haptic/sound still fires, visuals do not

  opacity.value = withSequence(
    withTiming(1, timings.fast),
    withTiming(0, { duration: durations.celebration - durations.fast, easing: easings.out })
  );
  scale.value = withSequence(withTiming(1.4, timings.fast), withSpring(0.6, springs.bouncy));
  lift.value = withTiming(-80, { duration: durations.celebration, easing: easings.out });
}
```

Flying a star into the header counter? Read the landing point from
`useStarFlightTarget().getTarget()` (`contexts/star-flight-target.tsx`) and skip the
flight when it returns `null`.

---

## 3. Haptics & sound

**NEVER `import * as Haptics from "expo-haptics"`.** Always
`triggerFeedback(event, options?)` from `@/lib/feedback` — it throttles, honours the
global haptics switch, and routes the sound adapter.

| Event | Fire when |
|---|---|
| `task_complete` | A single task is checked off |
| `stars_added` | Star counter increases without a full routine finishing |
| `routine_complete` | Last task of a routine done — pairs with the celebration |
| `reward_redeemed` | Reward exchanged for stars |
| `mission_complete` | Daily mission finished; also the parent-gate success tick |
| `sticker_unlocked` | New sticker lands on the sticker wall |
| `streak_up` | Streak counter grows by a day |
| `tab_focus` | Bottom-tab switch |
| `theme_preview` | Theme/avatar/icon selection tick, and wrong-answer nudges |
| `profile_milestone` | Level-up or milestone badge earned |

Pass `{ disableSound: true }` for quiet contexts (parent area, settings, gates).

---

## 4. Reduced motion

- Every Reanimated config in `lib/motion.ts` already carries `ReduceMotion.System`;
  inherit it by using the tokens instead of literals.
- **Decorative** motion — confetti, infinite loops, mascot wiggle, count-ups, bursts —
  must additionally gate on `useReducedMotion()` from `@/hooks/use-reduced-motion`
  and render the end state directly.
- Feedback (haptics/sound) still fires under reduced motion; only visuals are dropped.
- Never leave a `withRepeat(..., -1)` running without a reduced-motion check.

---

## 5. No-Gos

- No `width` / `height` / `margin` / layout animations — `transform` and `opacity` only.
- No new hex literals in components. Tokens, palette or `semanticColors`.
- No `Alert.alert` — use `components/ui/confirm-dialog.tsx`.
- No `fontSize` below 12; body and interactive labels ≥14.
- No touch target below 44×44pt.
- No raw `Pressable` for primary actions — `PressableScale` or `Button`.
- No `shadow-lg`/`shadow-md`, no ad-hoc shadow objects, no blur layers.
- No horizontal `ScrollView` in visible UI (`test:ui-quality` fails the build).
- No deprecated radii (`rounded-lg`/`md`/`sm`/`xl`/`2xl`) in new code.

---

## 6. Verification

Run before reporting done:

```bash
npm run typecheck
npm run lint
npm run test:ui-quality
npm run test:contrast-smoke
npm run test:background-skins
npm run test:stickers
npm run test:smoke
npm run test:progress-smoke
npm run test:onboarding
```

`test:ui-quality` enforces the 44pt / 12px / no-horizontal-ScrollView rules,
`test:contrast-smoke` guards theme and icon-picker contrast.
