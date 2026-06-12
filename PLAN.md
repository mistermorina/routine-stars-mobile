# PLAN.md — Spec & Aufgabenliste

> **Rolle im Loop:** Das ist die Spec + die geordnete Aufgabenliste. Der Loop
> nimmt jede Runde die oberste offene (`[ ]`) Aufgabe. Je schärfer die
> Definition-of-Done, desto besser läuft der Loop. Erledigtes wird hier
> abgehakt (`[x]`), der ausführliche Verlauf steht in `PROGRESS.md`.

## Vision

Routine Stars Mobile ist die native Expo-/React-Native-Version der Kinder-App
„Routine Stars": kinderfreundliche Routinen mit Sternen-Belohnung und
Sticker-System. UI auf Deutsch, Code auf Englisch. Ziel ist eine reibungslose,
spielerische Eltern-und-Kind-Experience ohne Blank-Slate-Frust.

## Definition of Done (global, für jede Aufgabe)

Eine Aufgabe gilt erst als erledigt, wenn **alle** folgenden Punkte zutreffen:

- `npm run typecheck` läuft fehlerfrei.
- `npm run lint` bringt keine **neuen** Fehler (2 bekannte Vorwarnungen in
  `lib/routine-visuals.ts` sind toleriert, siehe `LEARNINGS.md`).
- Die zur Domäne passenden Smoke-Tests laufen grün (Liste siehe `PROMPT.md`).
- Neue Daten-Typen liegen in `lib/types.ts`; Persistenz läuft über
  `lib/storage.ts` (kein direkter AsyncStorage-Zugriff in Komponenten).
- UI-Texte sind auf Deutsch, Icons werden per `iconName: string` referenziert.
- Ergebnis ist in `PROGRESS.md` eingetragen und die Aufgabe hier abgehakt.

## Status-Referenz (bereits fertig — nicht erneut bauen)

Siehe `Agents.md` (Execution-Log) und `PROGRESS.md` für Details.

- ✅ Sprint 1 + 2 (Tasks 1–6): Routine-Templates, Reward-Vorschläge,
  Icon-Picker, verbessertes Onboarding, Smart-Suggestions-Engine, bessere
  Standardwerte. Hooks `use-routines.ts` / `use-rewards.ts` lesen aus
  AsyncStorage statt Mocks.
- ✅ Sticker-Reward-System inkl. V3- und V4-Packs (98 Katalog-Einträge), Album,
  `test:stickers`.

---

## Backlog (geordnet — oben = als Nächstes)

> Quelle: `TASKS Kopie.md`, Sprint 3+ („Erweiterte Features"), abgeglichen mit
> dem tatsächlichen Codebase-Stand. Reihenfolge = Baureihenfolge. Vor dem Start
> einer Aufgabe prüfen, ob Teile davon schon existieren, und ggf. anpassen statt
> neu bauen.

### Priorität 1 — Erweiterte Inhalte & Personalisierung

- [ ] **T7 — Routine-Empfehlungen nach Alter.** Beim Anlegen/Bearbeiten eines
  Kindes werden Routine-Templates passend zur Altersgruppe (`AgeGroup`: 3–5,
  6–8, 9–12) vorgefiltert und priorisiert vorgeschlagen.
  *DoD:* `lib/routine-templates.ts` liefert eine Filter-/Sortierfunktion nach
  `AgeGroup`; `components/routine-templates/template-selector.tsx` zeigt für das
  aktive Kind passende Templates zuerst; Smoke-Check oder Unit-Assertion deckt
  die Filterlogik ab.

- [ ] **T8 — Saisonale & besondere Templates.** Zusätzliche Templates für
  Anlässe (z. B. Koffer packen, Geburtstag vorbereiten, Ferienroutine) und
  optional saisonale Sets.
  *DoD:* neue Einträge in `lib/routine-templates.ts` mit `RoutineCategory`;
  im Template-Selector als eigene Kategorie filterbar; bestehende Tests bleiben grün.

### Priorität 2 — Gamification & Workflows

- [ ] **T9 — Reward-Inspiration & Gamification.** Sterne-Meilensteine bzw.
  Streaks sichtbar machen (z. B. „3 Tage in Folge"), an das bestehende
  Sticker-Unlock-System angebunden.
  *DoD:* Logik in `lib/sticker-reward-logic.ts` / `lib/child-progression.ts`
  erweitert; UI in `components/routine-stars/` zeigt den Fortschritt;
  `test:stickers` + `test:progress-smoke` grün.

- [ ] **T10 — Routine-Kombinationen / Workflows.** Mehrere Routinen zu einem
  Tagesablauf verketten (z. B. Morgen → Schule → Abend).
  *DoD:* Typ-Erweiterung in `lib/types.ts`; Persistenz über `lib/storage.ts`;
  Dashboard (`app/(tabs)/index.tsx`) stellt den verketteten Ablauf dar.

### Priorität 3 — Reichweite & Datensicherheit

- [ ] **T11 — Smart Reminders / Notifications.** Lokale Erinnerungen zur
  jeweiligen Tageszeit (`TimeOfDay`) der Routine.
  *DoD:* `expo-notifications` integriert (Dependency ergänzen via
  `npx expo install`); Opt-in in `app/settings/notifications.tsx`; kein Crash
  bei verweigerter Berechtigung.

- [ ] **T12 — Erweiterte Statistiken & Insights.** Wochen-/Monats-Auswertung
  pro Kind auf Basis der Activity-Logs.
  *DoD:* Auswertung in `lib/activity-insights.ts`; Darstellung in
  `app/settings/stats.tsx` bzw. `components/profile/`; Datumslogik nutzt
  `lib/local-date.ts` (kein UTC); `test:progress-smoke` grün.

- [ ] **T13 — Export & Backup.** Kinder-, Routinen- und Reward-Daten als JSON
  exportieren und wieder importieren.
  *DoD:* Export/Import über `expo-file-system`; ausgelöst aus
  `app/settings/account.tsx` oder `billing.tsx`; Round-Trip (Export →
  frischer Import) ergibt identischen State.

### Priorität 4 — Qualität & Barrierefreiheit

- [ ] **T14 — Accessibility-Pass.** `accessibilityLabel`/Rollen für
  interaktive Elemente, ausreichende Touch-Targets, Respektieren von
  `use-reduced-motion`.
  *DoD:* zentrale interaktive Komponenten in `components/ui/` mit Labels;
  `test:contrast-smoke` grün; Reduced-Motion in Animationen berücksichtigt.

- [ ] **T15 — `check-onboarding-flow` als npm-Test verdrahten.** Es existiert
  `scripts/check-onboarding-flow.mjs`, ist aber nicht in `package.json`
  registriert.
  *DoD:* Script-Eintrag `test:onboarding` in `package.json`; Test läuft grün;
  in `PROMPT.md`-Testliste aufnehmen (Hinweis in `PROGRESS.md`).

---

## Pflege-Hinweise

- Neue Aufgaben unten anhängen oder nach Priorität einsortieren — Reihenfolge
  ist die Bauanleitung für den Loop.
- Wird eine Aufgabe zu groß, in kleinere `[ ]`-Teilaufgaben splitten.
- `DONE` (in `PROGRESS.md`) erst, wenn **alle** Kästchen hier `[x]` sind.
