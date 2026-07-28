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
- `npm run lint` läuft fehler- **und warnungsfrei** („No issues found").
- `npm run test:all` ist grün (typecheck + lint + alle nur lesenden Guardrails).
  Die beiden TypeScript-kompilierenden Checks laufen separat:
  `npm run test:stickers` und `npm run test:streak`.
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

## Produktions-Waves 0–4 (Design-/Feel-Upgrade v2)

Parallel zum Backlog unten lief das mehrphasige Design- und Härtungs-Programm.
Jede Phase ist **ein Commit** — der Verlauf ist die Quelle der Wahrheit:

```bash
git log --oneline --grep="^feat: phase"
```

| Phase | Commit | Inhalt |
|-------|--------|--------|
| 0 — Toolkit & Contracts | `e11d91c` | `lib/motion.ts`, `lib/theme.ts` (semanticColors, shadowPresets), Radius-Token `card`/`tile`/`chip`, `PressableScale`, `ConfirmDialog`, `docs/ai/DESIGN_DIRECTION.md` + `.claude/skills/routine-stars-polish/SKILL.md` als verbindlicher Token-Contract |
| 1 — Fundament & Korrektheit | `bbbaf17` | `contexts/children-context.tsx` (geteilter Kinder-State statt Hook-lokaler Kopien), `lib/parent-access.ts` mit SecureStore-PIN + Parental Gate, Login/Billing-Screens entfernt |
| 2 — Notifications, Scheduling, Export | `e0186ef` | `lib/notifications.ts` (Routine-Reminder), Scheduling im Routine-Editor, Undo, `lib/backup.ts` (Export/Share), Sterne-Korrektur |
| 3 — Motion & Delight | `89ad813` | Reanimated-Rezepte aus der Skill (Stagger, Celebration, Sheets), Sound-Adapter, Reduced-Motion-Gate |
| 4 — Konsistenz & A11y-Sweep | _dieser Lauf_ | Hex→Token, Radien→Token, Shadow-Presets, Type-Floor 12px, `maxFontSizeMultiplier`, `accessibilityRole`/`Label`, `Alert.alert`→`ConfirmDialog`, Guardrail-Skripte |

Offen danach: **Phase 5 — Store-Readiness** und **Phase 6 — Release-Candidate-QA**.

Vor der Umsetzung einer UI-Aufgabe unten gilt der Token-Contract in
`.claude/skills/routine-stars-polish/SKILL.md`; `npm run test:ui-quality`
erzwingt ihn maschinell (Hex-Allowlist, Type-Floor, Shadow-Opacity,
Touch-Targets, horizontale ScrollViews).

---

## Backlog (geordnet — oben = als Nächstes)

> Diese Datei ist die **einzige** Aufgabenquelle. (Die frühere Parallelliste
> `TASKS Kopie.md` widersprach ihr und wurde entfernt.) Reihenfolge =
> Baureihenfolge. Vor dem Start einer Aufgabe prüfen, ob Teile davon schon
> existieren, und ggf. anpassen statt neu bauen.
>
> Legende: `[ ]` offen · `[~]` teilweise (Stand-Notiz nennt den Rest) · `[x]` fertig.

### Priorität 1 — Erweiterte Inhalte & Personalisierung

- [~] **T7 — Routine-Empfehlungen nach Alter.** *(teilweise)* Beim
  Anlegen/Bearbeiten eines Kindes werden Routine-Templates passend zur
  Altersgruppe (`AgeGroup`: 3–5, 6–8, 9–12) vorgefiltert und priorisiert
  vorgeschlagen.
  *DoD:* `lib/routine-templates.ts` liefert eine Filter-/Sortierfunktion nach
  `AgeGroup`; `components/routine-templates/template-selector.tsx` zeigt für das
  aktive Kind passende Templates zuerst; Smoke-Check oder Unit-Assertion deckt
  die Filterlogik ab.
  *Stand:* `getRecommendedRoutineTemplates(ageGroup, limit)` existiert und wird
  in `components/onboarding/routine-setup.tsx` mit `primaryChild?.ageGroup`
  aufgerufen. **Offen:** `template-selector.tsx` importiert weiterhin
  `routineTemplates` ungefiltert und sortiert nicht nach Alter; es gibt keinen
  Smoke-Check für die Filterlogik.

- [x] **T8 — Saisonale & besondere Templates.** Zusätzliche Templates für
  Anlässe (z. B. Koffer packen, Geburtstag vorbereiten, Ferienroutine) und
  optional saisonale Sets.
  *DoD:* neue Einträge in `lib/routine-templates.ts` mit `RoutineCategory`;
  im Template-Selector als eigene Kategorie filterbar; bestehende Tests bleiben grün.
  *Stand:* 16 Templates, davon `special` ×2 und `weekend` ×1;
  `template-selector.tsx` hat die Filter-Chips „Besonders" und „Wochenende".

### Priorität 2 — Gamification & Workflows

- [x] **T9 — Reward-Inspiration & Gamification.** Sterne-Meilensteine bzw.
  Streaks sichtbar machen (z. B. „3 Tage in Folge"), an das bestehende
  Sticker-Unlock-System angebunden.
  *DoD:* Logik in `lib/sticker-reward-logic.ts` / `lib/child-progression.ts`
  erweitert; UI in `components/routine-stars/` zeigt den Fortschritt;
  `test:stickers` + `test:progress-smoke` grün.
  *Stand:* `getCurrentStreak()` in `lib/activity-insights.ts`,
  Level/XP/Meilensteine in `lib/child-progression.ts` + `hooks/use-child-progression.ts`;
  UI in `components/profile/profile-hero-card.tsx` (Streak-Stat) und
  `components/profile/milestone-badges.tsx` (`streak-3`, `streak-7`, Sterne-,
  Sticker-Meilensteine).

- [ ] **T10 — Routine-Kombinationen / Workflows.** Mehrere Routinen zu einem
  Tagesablauf verketten (z. B. Morgen → Schule → Abend).
  *DoD:* Typ-Erweiterung in `lib/types.ts`; Persistenz über `lib/storage.ts`;
  Dashboard (`app/(tabs)/index.tsx`) stellt den verketteten Ablauf dar.

### Priorität 3 — Reichweite & Datensicherheit

- [x] **T11 — Smart Reminders / Notifications.** Lokale Erinnerungen zur
  jeweiligen Tageszeit (`TimeOfDay`) der Routine.
  *DoD:* `expo-notifications` integriert (Dependency ergänzen via
  `npx expo install`); Opt-in in `app/settings/notifications.tsx`; kein Crash
  bei verweigerter Berechtigung.
  *Stand (Phase 2, `e0186ef`):* `lib/notifications.ts` mit
  `ensurePermissions()`, `setRoutineRemindersEnabled()`,
  `syncRoutineReminders()`, `cancelAllRoutineReminders()`,
  `scheduleTestNotification()` und `formatReminderSchedule()`;
  `expo-notifications ~0.32.17` in `package.json`; Opt-in-Screen zeigt
  `PermissionState` (`granted` | `denied` | `undetermined` | `unsupported`) —
  bei Ablehnung wird nur der Hinweis gerendert, nichts geworfen.

- [x] **T12 — Erweiterte Statistiken & Insights.** Wochen-/Monats-Auswertung
  pro Kind auf Basis der Activity-Logs.
  *DoD:* Auswertung in `lib/activity-insights.ts`; Darstellung in
  `app/settings/stats.tsx` bzw. `components/profile/`; Datumslogik nutzt
  `lib/local-date.ts` (kein UTC); `test:progress-smoke` grün.
  *Stand:* `getActivityInsights()` / `buildDailySummaries()` /
  `getCurrentStreak()` in `lib/activity-insights.ts`; genutzt in
  `app/settings/stats.tsx`, `app/settings/progress.tsx` und
  `components/profile/monthly-completion-calendar.tsx`.

- [x] **T13 — Export & Backup.** Kinder-, Routinen- und Reward-Daten als JSON
  exportieren und wieder importieren.
  *DoD:* Export/Import über `expo-file-system`; ausgelöst aus
  `app/settings/account.tsx` oder `billing.tsx`; Round-Trip (Export →
  frischer Import) ergibt identischen State.
  *Stand (Phase 2, `e0186ef`):* `lib/backup.ts` → `exportAppData()` schreibt
  alle Storage-Keys als JSON (fehlende Keys bewusst als `null`, damit die
  Form stabil bleibt) über `expo-file-system` und teilt sie per
  `expo-sharing`; ausgelöst aus `app/settings/account.tsx`. `billing.tsx`
  existiert nicht mehr (kein Abo-Modell, siehe ADR-006).
  **Einschränkung:** der Import-Pfad ist bewusst nicht gebaut — Export ist
  ein Sicherungs-/Weitergabe-Feature. Der Round-Trip-Teil der ursprünglichen
  DoD ist damit **bewusst nach T16 verschoben**, nicht stillschweigend erfüllt.

### Priorität 4 — Qualität & Barrierefreiheit

- [x] **T14 — Accessibility-Pass.** `accessibilityLabel`/Rollen für
  interaktive Elemente, ausreichende Touch-Targets, Respektieren von
  `use-reduced-motion`.
  *DoD:* zentrale interaktive Komponenten in `components/ui/` mit Labels;
  `test:contrast-smoke` grün; Reduced-Motion in Animationen berücksichtigt.
  *Stand (Phase 4, dieser Lauf):* `accessibilityRole` + deutsche
  `accessibilityLabel` (plus `accessibilityState`, wo zustandsbehaftet) auf
  allen Pressables der drei Sweep-Zonen, `hitSlop ≥ 8` auf kleinen Zielen,
  dekorative Grafiken auf `accessibilityElementsHidden`,
  `maxFontSizeMultiplier` in fixen Containern, Type-Floor 12px /
  interaktiv ≥ 14px. Reduced-Motion-Gate kam in Phase 3
  (`hooks/use-reduced-motion.ts` + `ReduceMotion.System` in `lib/motion.ts`).
  Maschinell abgesichert über `npm run test:ui-quality` und
  `npm run test:contrast-smoke`.

- [x] **T15 — `check-onboarding-flow` als npm-Test verdrahten.** Es existiert
  `scripts/check-onboarding-flow.mjs`, ist aber nicht in `package.json`
  registriert.
  *DoD:* Script-Eintrag `test:onboarding` in `package.json`; Test läuft grün;
  in `PROMPT.md`-Testliste aufnehmen (Hinweis in `PROGRESS.md`).
  *Stand:* `"test:onboarding": "node scripts/check-onboarding-flow.mjs"` ist
  verdrahtet und Teil von `npm run test:all`.

### Priorität 5 — Nachgezogen aus Phase 4

- [ ] **T16 — Import / Restore für Backups.** Gegenstück zu T13: eine
  exportierte JSON-Datei wieder einlesen.
  *DoD:* Import in `lib/backup.ts` (Datei wählen, Schema + Version prüfen,
  über `lib/storage.ts` schreiben, danach `reload()` auf
  `contexts/children-context.tsx`); ausgelöst aus `app/settings/account.tsx`
  hinter `ConfirmDialog` (überschreibt lokale Daten); Round-Trip-Assertion
  Export → Import → identischer State als Smoke-Check.

---

## Pflege-Hinweise

- Neue Aufgaben unten anhängen oder nach Priorität einsortieren — Reihenfolge
  ist die Bauanleitung für den Loop.
- Wird eine Aufgabe zu groß, in kleinere `[ ]`-Teilaufgaben splitten.
- `DONE` (in `PROGRESS.md`) erst, wenn **alle** Kästchen hier `[x]` sind.
