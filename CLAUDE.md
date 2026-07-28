# Routine Stars Mobile - Expo React Native App

## Projektübersicht

Native mobile Version von **Routine Stars** — eine kinderfreundliche iOS-App für Kinder-Routinen mit Sternen-Belohnungssystem. Ursprünglich portiert aus dem Next.js-Web-Projekt (`studio/src/`), inzwischen eigenständig weiterentwickelt: local-only, ohne Accounts und ohne Backend.

- **App Name**: Routine Stars
- **Bundle ID**: `com.routinestars.app`
- **Expo SDK**: 54
- **React Native**: 0.81.5

## Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | Expo SDK 54 + Expo Router (file-based routing) |
| Styling | NativeWind v4 (Tailwind CSS für RN) |
| Animations | react-native-reanimated v4 |
| Icons | lucide-react-native + Icon-Registry (`lib/icons.tsx`) |
| Persistenz | @react-native-async-storage/async-storage |
| Drag & Drop | react-native-draggable-flatlist |
| SVG | react-native-svg |
| Bilder | expo-image |

## Projektstruktur

```
mobile/
├── app/                          # Expo Router Screens
│   ├── _layout.tsx               # Root: Fonts, Provider, Stack, ErrorBoundary
│   ├── index.tsx                 # Einstiegs-Redirect (Welcome / Onboarding / Tabs)
│   ├── parent-login.tsx          # Parental Gate + PIN-Modal
│   ├── sticker-album.tsx         # Sticker-Album (Modal)
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx           # Erstkontakt (KEIN Login — local-only, ADR-006)
│   │   └── onboarding.tsx        # Onboarding-Wizard
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom Tabs (Routinen, Belohnungen, Profil)
│   │   ├── index.tsx             # Dashboard (Haupt-Screen)
│   │   ├── rewards.tsx           # Belohnungen
│   │   └── star-account.tsx      # Sterne-Konto / Profil
│   └── settings/                 # Eltern-Bereich (hinter Parental Gate + PIN)
│       ├── _layout.tsx
│       ├── index.tsx             # Einstellungen-Menü
│       ├── children.tsx          # Kinder verwalten
│       ├── routines.tsx          # Routinen verwalten + Scheduling
│       ├── rewards.tsx           # Belohnungen verwalten
│       ├── stickers.tsx          # Sticker-Belohnungen konfigurieren
│       ├── background.tsx        # Hintergrund-Skins
│       ├── progress.tsx          # Fortschritt (Monatskalender)
│       ├── stats.tsx             # Statistiken (Insights)
│       ├── account.tsx           # Gerät & Daten (Export, Reset)
│       ├── notifications.tsx     # Erinnerungen (Opt-in)
│       └── legal.tsx             # Rechtliches
├── components/
│   ├── ui/                       # Basis-UI (Button, Card, Dialog, ConfirmDialog,
│   │                             #   PressableScale, Skeleton, Toast, ErrorState, …)
│   ├── routine-stars/            # App-Komponenten (Header, TaskItem, TabBar, …)
│   ├── routine-templates/        # Template-Selector + -Card
│   ├── rewards/                  # Reward-Browser + -Kategorien
│   ├── stickers/                 # Sticker-Wall + Unlock-Sheet
│   ├── profile/                  # Profil-Hero, Meilensteine, Album, Insights
│   ├── onboarding/               # Onboarding-Schritte
│   ├── settings/                 # Settings-Komponenten
│   ├── parent-gate-challenge.tsx # Rechenaufgabe vor dem PIN (ADR-008)
│   └── error-boundary.tsx
├── lib/
│   ├── types.ts                  # Alle Typen (Child, Task, Routine, Reward, …)
│   ├── storage.ts                # AsyncStorage-Wrapper mit KEYS + SCHEMA_VERSION
│   ├── theme.ts                  # themePalettes, semanticColors, shadowPresets
│   ├── motion.ts                 # springs / durations / enter- + exit-Builder
│   ├── feedback.ts               # triggerFeedback() — Haptik + Sound (nie expo-haptics direkt)
│   ├── sound-adapter.ts          # Sound-Ausgabe für lib/feedback.ts
│   ├── notifications.ts          # Lokale Routine-Erinnerungen (ADR-007)
│   ├── backup.ts                 # JSON-Export + Teilen (T13)
│   ├── reset.ts                  # resetAppData() — alle Storage-Keys leeren
│   ├── parent-access.ts          # PIN (SecureStore) + Sperre + Gate (ADR-008)
│   ├── legal-content.ts          # Datenschutz / Nutzungsbedingungen / Impressum
│   ├── local-date.ts             # getLocalIsoDate() — nie UTC
│   ├── activity-insights.ts      # Wochen-/Monats-Auswertung, Streak
│   ├── child-progression.ts      # Level, XP, Meilensteine, Sticker-Unlocks
│   ├── background-skins.ts       # Skin-Registry + normalizeBackgroundSkin()
│   ├── icons.tsx / icon-registry.ts  # Icon-Registry (String → Component)
│   └── utils.ts                  # cn() Helper
├── hooks/
│   ├── use-children.ts           # dünner Reexport auf contexts/children-context
│   ├── use-routines.ts           # Templates + Pro-Kind-Fortschritt
│   ├── use-rewards.ts            # Belohnungen
│   ├── use-activity-logs.ts      # Aktivitäts-Logging
│   ├── use-child-progression.ts  # Level / XP / Meilensteine
│   ├── use-sticker-wall.ts       # Sticker-Wall-State
│   ├── use-reduced-motion.ts     # Reduced-Motion-Gate
│   ├── use-collapsible-header.ts
│   ├── use-auth.ts               # Eltern-Gate-State (kein User-Login)
│   └── use-toast.ts              # Toast-Benachrichtigungen
├── contexts/
│   ├── children-context.tsx      # Kinder-Roster + normalizeChild (echte Implementierung)
│   ├── auth-context.tsx          # Eltern-Gate (In-Memory, re-lockt beim Neustart)
│   └── star-flight-target.tsx    # Landepunkt für die Stern-Flug-Animation
├── scripts/                      # Guardrails + Generatoren (siehe „Befehle")
└── assets/
    └── fonts/                    # Poppins (400, 600, 700)
```

**Kein Login, kein Abo:** `app/(auth)/login.tsx` und `app/settings/billing.tsx`
gibt es nicht mehr — Routine Stars ist local-only (ADR-006 in `DECISIONS.md`).

## Konventionen

### Sprache
- **UI-Texte**: Deutsch (Morgenroutine, Belohnungen, Sterne, etc.)
- **Code**: Englisch (Variablen, Funktionen, Typen)

### Styling
- NativeWind v4 `className` Strings (gleiche Tailwind-Klassen wie Web)
- `cn()` aus `lib/utils.ts` für bedingte Klassen (clsx + tailwind-merge)
- Keine Inline-`style`-Objekte, außer für dynamische Werte (Farben, Animationen)

### Design-System

Verbindlich: `docs/ai/DESIGN_DIRECTION.md` (das *Was*) und
`.claude/skills/routine-stars-polish/SKILL.md` (das *Wie*, mit Copy-Paste-Rezepten).
`npm run test:ui-quality` erzwingt den Contract maschinell (ADR-009).

| Token | Wert | Verwendung |
|-------|------|------------|
| Primary | `#F3E5AB` (Vanilla Yellow) | Marken-CTA |
| Background | `#F8E9D7` (Light Apricot) | App-Hintergrund |
| Accent | `#245A74` (Deep Teal) | Sekundäre CTA, Links — **nicht** mehr Sky Blue |
| Gold | `#FFD700` | Sterne (`semanticColors.gold`) |
| Foreground | `#1a1a2e` | Text |
| Font | Poppins 400/600/700 | Überall |

Dazu Status-Token (`success`/`warning`/`destructive` je mit `soft`, `foreground`,
`strong`) — Kontrastwerte stehen in `DESIGN_DIRECTION.md`.

**Farbregel (keine Ausnahme):** nie ein rohes Hex in einer Komponente. Quellen in
dieser Reihenfolge: Tailwind-Token → `getThemePalette(child.theme)` →
`semanticColors` aus `lib/theme.ts`. Der eingefrorene Alt-Bestand steht in
`scripts/hex-allowlist.json` und darf nur schrumpfen.

| Radius | px | Verwendung |
|--------|----|------------|
| `rounded-card` | 22 | Karten, Dialoge, Sheets |
| `rounded-tile` | 18 | Icon-Squircles, Inputs, Tiles |
| `rounded-chip` | 14 | Chips, Pills, Badges |

`rounded-lg`/`md`/`sm`/`xl`/`2xl` und `rounded-[22px]` sind deprecated.
Schatten nur über `shadowPresets` (`shadowSubtle`/`shadowCard`/`shadowFloating`,
alle ≤ 0.08 Opazität). Type-Floor 12px, interaktiv und Fließtext ≥ 14px,
Touch-Targets ≥ 44×44pt.

### Icons
- Standard-Icons: `lucide-react-native`
- Custom-Icons (z.B. ToothIcon): `react-native-svg` in `lib/icons.tsx`
- Icons werden per **String-Name** referenziert (`iconName: string`), nicht als Component
- `getIcon(name)` aus `lib/icons.tsx` zum Auflösen

### Typen
- Alle Typen in `lib/types.ts`
- `iconName: string` statt `icon: ComponentType` (serialisierbar für AsyncStorage)
- Wichtige Typen: `Child`, `Task`, `Routine`, `Reward`, `ActivityLog`

### Datenpersistenz
- `lib/storage.ts` bietet typisierte AsyncStorage-Wrapper; **kein** direkter
  AsyncStorage-Zugriff in Komponenten
- Storage-Keys (`KEYS` in `lib/storage.ts`): `CHILDREN`,
  `LAST_SELECTED_CHILD_ID`, `ACTIVITY_LOGS`, `CUSTOM_ROUTINES`,
  `CUSTOM_REWARDS`, `HAS_ONBOARDED`, `HAS_SEEN_WELCOME`, `ROUTINE_PROGRESS`,
  `CHILD_PROGRESS_STATE`, `STICKER_COLLECTION`, `STICKER_WALL`,
  `STICKER_REWARD_SETTINGS`, `PARENT_PIN_HASH`, `NOTIFICATION_SETTINGS`,
  `LEGAL_PREFERENCES`, `SOUND_ENABLED`, `HAPTICS_ENABLED`, `SCHEMA_VERSION`
- Der Eltern-PIN liegt gehasht in **`expo-secure-store`**, nicht im
  AsyncStorage (ADR-008); `PARENT_PIN_HASH` ist nur der Fallback-Key
- Kinder-State kommt aus `contexts/children-context.tsx` (ein geteilter
  Roster für alle Screens) — `hooks/use-children.ts` ist nur ein Reexport
- Eltern-Gate-State ist In-Memory (React Context), bewusst nicht persistiert
- Es gibt keine Accounts und keinen Sync — alles liegt lokal (ADR-006)

### Animationen
- `react-native-reanimated` v4 (useSharedValue, useAnimatedStyle, withSpring, withTiming)
- Konfigurationen **immer** aus `lib/motion.ts` (`springs`, `durations`,
  `timings`, `enterStagger`, `enterFade`, `exitFade`, `exitSlideDown`) — nie
  handgeschriebene Spring-Configs
- Nur `transform` und `opacity` animieren, nie `width`/`height`/`margin`
- Dekoratives (Konfetti, Loops, Maskottchen) zusätzlich über
  `hooks/use-reduced-motion.ts` abschalten
- Haptik/Sound ausschließlich über `triggerFeedback()` aus `lib/feedback.ts` —
  **nie** `expo-haptics` direkt importieren
- Kein Framer Motion (das ist die Web-Variante)

### Navigation
- Expo Router file-based routing
- Bottom Tabs: Routinen, Belohnungen, Profil (Sterne-Konto)
- Stack: Welcome/Onboarding, Settings (Eltern-Bereich)
- Modal: Parental Gate + PIN (`app/parent-login.tsx`), Sticker-Album

## Befehle

```bash
npx expo start           # Dev-Server starten
npx expo start --clear   # Cache leeren + starten
npx expo install --fix   # Dependency-Versionen korrigieren
```

### Checks

```bash
npm run test:all              # typecheck + lint + alle nur lesenden Guardrails
npm run typecheck             # TypeScript
npm run lint                  # ESLint — muss "No issues found" melden
npm run test:ui-quality       # Token-Contract: Hex, Radien, Type-Floor,
                              #   shadowOpacity, Touch-Targets, ScrollViews
npm run test:contrast-smoke   # Theme- + Icon-Picker-Kontrast
npm run test:background-skins # Skin-Registry + Assets + Normalisierung
npm run test:smoke            # Task-Timer-Modal-Reihenfolge
npm run test:progress-smoke   # Tagesfortschritt, lokale Datumslogik
npm run test:onboarding       # Onboarding-Flow
```

Zwei Checks kompilieren TypeScript in ein Temp-Verzeichnis und laufen deshalb
separat (nicht Teil von `test:all`):

```bash
npm run test:stickers         # Sticker-Katalog + Unlock-Logik
npm run test:streak           # Streak-/Progression-Logik
```

Die Hex-Allowlist nur nach einem bewussten Sweep neu schreiben — der Diff macht
jeden Zuwachs sichtbar:

```bash
npm run guardrails:hex-allowlist   # = node scripts/check-ui-quality.mjs --write-allowlist
```

## Referenz

| Datei | Rolle |
|-------|-------|
| `docs/ai/DESIGN_DIRECTION.md` | Design-Richtung, Token-Tabellen, No-Gos (*Was*) |
| `.claude/skills/routine-stars-polish/SKILL.md` | Umsetzungs-Rezepte, Motion, Haptik (*Wie*) |
| `PLAN.md` | Einzige Aufgabenliste (Backlog + Produktions-Waves) |
| `PROGRESS.md` | Stand zwischen den Durchläufen |
| `DECISIONS.md` | ADRs — warum etwas so ist |
| `LEARNINGS.md` | Bekannte Fallen, nicht zweimal reintappen |
| `Agents.md` | Execution-Log (was wann gebaut wurde) |

Die ursprüngliche Web-Implementierung (`studio/src/`) liegt **nicht** in diesem
Repository. Sie ist historischer Kontext, keine laufende Referenz — bei
Unklarheiten über UI-Texte, Logik oder Layout gelten die Dateien oben und der
Code in diesem Repo.
