# Routine Stars Mobile - Expo React Native App

## Projektübersicht

Native mobile Version von **Routine Stars** — eine kinderfreundliche iOS-App für Kinder-Routinen mit Sternen-Belohnungssystem. Basiert auf dem Next.js-Web-Projekt in `studio/src/`, portiert auf Expo + React Native.

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
│   ├── _layout.tsx               # Root: Fonts, Providers, Stack
│   ├── index.tsx                 # Auth-Redirect
│   ├── parent-login.tsx          # PIN-Modal
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx             # Login/Signup
│   │   └── onboarding.tsx        # 3-Schritt-Wizard
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Bottom Tabs
│   │   ├── index.tsx             # Dashboard (Haupt-Screen)
│   │   ├── rewards.tsx           # Belohnungen
│   │   └── star-account.tsx      # Sterne-Konto
│   └── settings/
│       ├── _layout.tsx
│       ├── index.tsx             # Einstellungen-Menü
│       ├── children.tsx          # Kinder verwalten
│       ├── progress.tsx          # Fortschritt
│       ├── stats.tsx             # Statistiken
│       ├── account.tsx           # Konto
│       ├── notifications.tsx     # Benachrichtigungen
│       ├── billing.tsx           # Abrechnung
│       └── legal.tsx             # Rechtliches
├── components/
│   ├── ui/                       # Basis-UI (Button, Card, Dialog, etc.)
│   ├── routine-stars/            # App-Komponenten (Header, TaskItem, etc.)
│   ├── onboarding/               # Onboarding-Schritte
│   └── settings/                 # Settings-Komponenten
├── lib/
│   ├── types.ts                  # Alle Typen (Child, Task, Routine, Reward, etc.)
│   ├── storage.ts                # AsyncStorage-Wrapper mit KEYS
│   ├── data.ts                   # Mock-Daten
│   ├── icons.tsx                 # Icon-Registry (String → Component)
│   └── utils.ts                  # cn() Helper
├── hooks/
│   ├── use-children.ts           # Kinder CRUD + Sterne
│   ├── use-activity-logs.ts      # Aktivitäts-Logging
│   ├── use-auth.ts               # Auth-State
│   └── use-toast.ts              # Toast-Benachrichtigungen
├── contexts/
│   └── auth-context.tsx          # Auth-Provider (In-Memory)
└── assets/
    └── fonts/                    # Poppins (400, 600, 700)
```

## Konventionen

### Sprache
- **UI-Texte**: Deutsch (Morgenroutine, Belohnungen, Sterne, etc.)
- **Code**: Englisch (Variablen, Funktionen, Typen)

### Styling
- NativeWind v4 `className` Strings (gleiche Tailwind-Klassen wie Web)
- `cn()` aus `lib/utils.ts` für bedingte Klassen (clsx + tailwind-merge)
- Keine Inline-`style`-Objekte, außer für dynamische Werte (Farben, Animationen)

### Design-System
| Token | Wert | Verwendung |
|-------|------|------------|
| Primary | `#F3E5AB` (Vanilla Yellow) | Buttons, Akzente |
| Background | `#F8E9D7` (Light Apricot) | Hintergrund |
| Accent | `#87CEEB` (Sky Blue) | Sekundäre Akzente |
| Gold | `#FFD700` | Sterne, Premium |
| Foreground | `#1a1a2e` | Text |
| Font | Poppins 400/600/700 | Überall |

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
- `lib/storage.ts` bietet typisierte AsyncStorage-Wrapper
- Storage-Keys: `CHILDREN`, `LAST_SELECTED_CHILD_ID`, `ACTIVITY_LOGS`, `CUSTOM_ROUTINES`, `CUSTOM_REWARDS`, `HAS_ONBOARDED`
- Auth-State ist In-Memory (React Context), nicht persistiert

### Animationen
- `react-native-reanimated` v4 (useSharedValue, useAnimatedStyle, withSpring, withTiming)
- Kein Framer Motion (das ist die Web-Variante)

### Navigation
- Expo Router file-based routing
- Bottom Tabs: Routinen, Belohnungen, Sterne
- Stack: Auth, Onboarding, Settings
- Modal: Parent Login (PIN)

## Befehle

```bash
npx expo start           # Dev-Server starten
npx expo start --clear   # Cache leeren + starten
npm run typecheck         # TypeScript prüfen
npm run lint              # ESLint
npx expo install --fix    # Dependency-Versionen korrigieren
```

## Referenz

Die ursprüngliche Web-Implementierung liegt in `studio/src/`. Bei Unklarheiten über UI-Texte, Logik oder Layout dort nachschauen.
