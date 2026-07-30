# LEARNINGS.md — Erkenntnisse & vermiedene Fallen

> **Rolle im Loop:** Der Loop liest diese Datei jeden Durchlauf und hängt neue
> Erkenntnisse an. So wird er selbst-verbessernd statt fehler-wiederholend.
> Eine Zeile pro Erkenntnis, neueste oben.

## Bekannte Fallen (Projekt)

- **`lint`: Nulltoleranz, auch für Warnungen.** Zielzustand ist „No issues found".
  Es gibt **keine** tolerierten Alt-Warnungen mehr — die früher hier vermerkten
  zwei Warnungen in `lib/routine-visuals.ts` existieren nicht mehr. Jede Warnung
  ist eine Regression und gehört behoben, nicht vermerkt. Achtung: ESLint endet
  bei reinen Warnungen mit Exit-Code 0, `npm run test:all` läuft also grün durch —
  die Ausgabe trotzdem lesen (bzw. `--max-warnings 0` ergänzen, sobald der Baum
  sauber ist).
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
  damit die Versionen zu Expo SDK 57 passen. `npx expo install --fix` korrigiert
  Versionskonflikte — **hängt dabei aber Config-Plugins an `app.json` an**. Nach
  jedem `expo install` prüfen, ob die neuen `plugins`-Einträge wirklich ein
  Plugin mitbringen (`node_modules/<paket>/app.plugin.js` oder `plugin/build/`);
  ein Eintrag ohne Plugin-Datei verhindert den App-Start komplett.
- **`newArchEnabled` gehört nicht mehr in `app.json`.** Seit SDK 57 ist die neue
  Architektur Pflicht, der Schlüssel ist aus dem Schema gefallen und lässt
  `expo-doctor` fehlschlagen.
- **Keine rohen Hex-Werte in `app/` oder `components/`.** Farbquellen in dieser
  Reihenfolge: Tailwind-Token → `getThemePalette(child.theme)` → `semanticColors`
  aus `lib/theme.ts`. `npm run test:ui-quality` bricht bei neuen Hex-Literalen ab;
  der Alt-Bestand steht als Schuldenposten in `scripts/hex-allowlist.json` und
  darf nur schrumpfen.
- **Schatten nur über `shadowPresets`** (`shadowSubtle`/`shadowCard`/`shadowFloating`)
  aus `lib/theme.ts`. Inline-`shadowOpacity` > 0.08 lässt `test:ui-quality`
  fehlschlagen. Die Presets sind bewusst leichter als der frühere Ad-hoc-Bestand —
  ein sichtbar weicherer Look ist gewollt, kein Bug.
- **Type-Floor:** kein `fontSize` unter 12, kein `text-[9..13px]`; alles
  Interaktive und aller Fließtext ≥ 14px. Maschinell geprüft, ohne Ausnahmen
  (auch nicht für Tab-Labels).
- **Guardrail-Skripte prüfen die echte Implementierung, nicht die Reexport-Datei.**
  `hooks/use-children.ts` ist seit Phase 1 nur noch ein Shim auf
  `contexts/children-context.tsx`; ein `assert.match` gegen den Shim ist grün,
  ohne irgendetwas zu beweisen. Bei Umzügen den Check mitziehen.

## Loop-Erkenntnisse

_(hier hängt der Loop neue Erkenntnisse an, Format: `YYYY-MM-DD — Erkenntnis`)_

- 2026-07-28 — `assert.match` auf eine Datei, die den Bezeichner nur im
  Docstring führt, ist ein stiller Fehlalarm-Blocker: `check-background-skins.mjs`
  war grün, weil `hooks/use-children.ts` „normalizeBackgroundSkin" in einem
  Kommentar erwähnte. Assertions immer an Aufrufstelle **und** Import hängen.
