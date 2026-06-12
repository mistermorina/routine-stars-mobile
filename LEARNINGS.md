# LEARNINGS.md — Erkenntnisse & vermiedene Fallen

> **Rolle im Loop:** Der Loop liest diese Datei jeden Durchlauf und hängt neue
> Erkenntnisse an. So wird er selbst-verbessernd statt fehler-wiederholend.
> Eine Zeile pro Erkenntnis, neueste oben.

## Bekannte Fallen (Projekt)

- **`lint` hat 2 Vorwarnungen** in `lib/routine-visuals.ts` — bekannt und
  toleriert. Nicht als „neuer Fehler" werten; nur eingreifen, wenn neue
  Warnungen/Fehler dazukommen.
- **Datum immer lokal, nie UTC.** Für tagesbezogene Logik `getLocalIsoDate()`
  aus `lib/local-date.ts` verwenden. `new Date().toISOString().split("T")[0]`
  ist verboten und wird von `test:progress-smoke` aktiv abgelehnt.
- **Icons sind Strings, keine Components.** `iconName: string` in Typen/Storage,
  Auflösung über `getIcon(name)` aus `lib/icons.tsx`. Grund: AsyncStorage muss
  serialisierbar bleiben.
- **`Broom` existiert nicht in `lucide-react-native`** — Custom-SVG `BroomIcon`
  in `lib/icons.tsx` nutzen. Allgemein: vor Verwendung eines lucide-Icons dessen
  Verfügbarkeit prüfen, sonst Custom-SVG ergänzen.
- **Persistenz nur über `lib/storage.ts`.** Keine direkten AsyncStorage-Aufrufe
  in Komponenten. Auth-State ist bewusst In-Memory (React Context), nicht
  persistiert.
- **Animationen:** `react-native-reanimated` v4 (`useSharedValue`,
  `useAnimatedStyle`, `withSpring`, `withTiming`). **Kein** Framer Motion — das
  ist die Web-Variante in `studio/src/`.
- **Styling über NativeWind `className`**, nicht über Inline-`style` (außer für
  dynamische Werte wie Farben/Animationswerte). `cn()` aus `lib/utils.ts` für
  bedingte Klassen.
- **Neue Dependencies** mit `npx expo install <paket>` (nicht blank `npm i`),
  damit die Versionen zu Expo SDK 54 passen. `npx expo install --fix` korrigiert
  Versionskonflikte.

## Loop-Erkenntnisse

_(hier hängt der Loop neue Erkenntnisse an, Format: `YYYY-MM-DD — Erkenntnis`)_
