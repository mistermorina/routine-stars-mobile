# Onboarding Flow - Production Ready

Stand: 2026-06-04

## Neue User Journey

Routine Stars startet mit einer warmen 7-Screen-Erklärung vor dem Login. Eltern verstehen zuerst den Nutzen im Familienalltag, Kinder werden über Sterne, Fortschritt und Belohnungen emotional abgeholt. Danach führt der Flow in den lokalen Familienzugang und in das 3-Schritt-Setup.

## Story-Screens

1. **Willkommen** - Kernidee: Aus Alltag wird ein kleines Erfolgsspiel.
2. **Für Eltern** - weniger Erinnern, mehr Begleiten.
3. **Für Kinder** - kleine Missionen, sofortige Erfolgsmomente.
4. **Sterne & Routinen** - Aufgaben abhaken und Sterne sammeln.
5. **Belohnungen** - Fortschritt sichtbar machen und motivierend einlösen.
6. **Elternbereich** - Kinderwelt und Verwaltung klar trennen, lokal starten.
7. **Bereit** - Profil, Starter-Routine und Belohnungen einrichten.

## Setup-Screens

1. **Profil** - Name, Alter, Avatar und Theme.
2. **Routinen** - passende Vorlagen, eigene Routine und leerer Auswahlzustand.
3. **Belohnungen** - Starterpaket, manuelle Auswahl, leerer Auswahlzustand und Speicherzustand.

## Geänderte Dateien

- `app/(auth)/welcome.tsx`
- `app/(auth)/onboarding.tsx`
- `components/onboarding/child-setup.tsx`
- `components/onboarding/routine-setup.tsx`
- `components/onboarding/reward-setup.tsx`
- `lib/onboarding-journey.ts`
- `scripts/check-onboarding-flow.mjs`
- `docs/onboarding-production-ready.md`

## Neue oder angepasste Komponenten

- `lib/onboarding-journey.ts` zentralisiert Screen-Reihenfolge, Copy, CTAs, Highlights und visuelle Motive.
- `WelcomeScreen` rendert die 7-Screen-Journey datengetrieben mit Fortschritt, Dots, vorhandenen Bildassets und klaren CTAs.
- `OnboardingScreen` hat präzisere Schritt-Header, Abschluss-Ladezustand und Fehlerhinweis.
- `ChildSetup`, `RoutineSetup` und `RewardSetup` wurden textlich und visuell geschärft.

## Designentscheidungen

- Bestehende Designsprache bleibt erhalten: Poppins, warme helle Flächen, runde Formen, weiche Theme-Farben und vorhandene Routine-Stars-Assets.
- Der Welcome-Flow ist ruhig und fokussiert: ein Hauptgedanke pro Screen, zwei kurze Highlights, ein klarer Primary CTA.
- Kleine Screens zeigen weniger Prinzip-Chips, größere mobile Screens zeigen alle fünf Kernprinzipien.
- Setup-Screens erklären direkt den Zweck des jeweiligen Schritts, ohne den eigentlichen Formularfluss zu blockieren.

## Prüfungen

- `node scripts/check-onboarding-flow.mjs`
- `npm run typecheck`
- `npm run lint` - 0 Fehler, 2 bestehende Warnungen in `lib/routine-visuals.ts`
- `npm run test:smoke`
- `npm run test:progress-smoke`
- `npm run test:contrast-smoke`
- `npm run test:stickers`
- `npx expo export --platform web --output-dir /tmp/routine-stars-onboarding-export`
- Browser-Check: Welcome-Journey auf 360px und 430px, Navigation 1/7 bis 7/7, Übergang Login, Profil-Setup und Routinen-Setup.

## Empfehlungen

- Optional für die nächste Iteration: echte iOS-Simulator-Prüfung ergänzen, sobald ein Simulator-Ziel festgelegt ist.
- Optional: später Screenshots aus User-Tests mit Eltern/Kinderfeedback gegen die Journey legen und einzelne Formulierungen A/B testen.
