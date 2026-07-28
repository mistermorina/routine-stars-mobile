# PROGRESS.md — Gedächtnis zwischen den Durchläufen

> **Rolle im Loop:** Das ist der State, der den Loop vorwärtsbringt. Er ändert
> sich **jeden Durchlauf** (`PROMPT.md` nie). Trag hier ein, was erledigt ist,
> was fehlschlug und welche Dateien sich geändert haben. Das DONE-Signal ganz
> unten beendet den Loop.

## Format pro Eintrag

```
### YYYY-MM-DD — <Task-ID aus PLAN.md>: <Kurztitel>
- Status: erledigt | teilweise | fehlgeschlagen
- Geänderte Dateien: <Pfade>
- Tests: <welche Befehle, Ergebnis>
- Notizen: <Kontext für die nächste Runde>
```

---

## Aktueller Stand

Bereits fertiggestellt **vor** dem Produktions-Programm (siehe `Agents.md` für
die volle Historie):

- ✅ Sprint 1 + 2 (PLAN-Tasks-Vorläufer 1–6): Routine-Template-Bibliothek,
  Reward-Vorschläge (47 in 7 Kategorien), Smart-Task-Suggestions (41 Tasks),
  Icon-Picker (70 Icons, 55 kategorisiert), verbessertes Onboarding,
  bessere Standardwerte. Dashboard/Rewards lesen aus AsyncStorage statt Mocks.
- ✅ Sticker-Reward-System: V3- + V4-Packs, 98 Katalog-Einträge, Sticker-Album,
  Sticker-Wall.

Danach lief das mehrphasige Design-/Härtungs-Programm. **Phasen 0–4 sind durch,
Phasen 5–6 stehen aus.** Jede Phase ist ein Commit — Detailtabelle in `PLAN.md`
(Abschnitt „Produktions-Waves 0–4"):

| Phase | Commit | Status |
|-------|--------|--------|
| 0 — Toolkit & Contracts | `e11d91c` | ✅ durch |
| 1 — Fundament & Korrektheit | `bbbaf17` | ✅ durch |
| 2 — Notifications, Scheduling, Export | `e0186ef` | ✅ durch |
| 3 — Motion & Delight | `89ad813` | ✅ durch |
| 4 — Konsistenz & A11y-Sweep | dieser Lauf | ✅ durch |
| 5 — Store-Readiness | — | ⬜ offen |
| 6 — Release-Candidate-QA | — | ⬜ offen |

Backlog-Stand laut `PLAN.md`: T8, T9, T11, T12, T13, T14, T15 abgehakt;
**offen: T7 (teilweise — `template-selector.tsx` filtert noch nicht nach
Altersgruppe), T10 (Routine-Verkettung), T16 (Backup-Import/Restore)**.

## Letzter Lauf

**Phase 4 — Konsistenz- & A11y-Sweep** (4 parallele Agenten, verzeichnis-partitioniert).
Mechanische Normalisierung gegen den Token-Contract, ohne Verhaltens- oder
Feature-Änderung: Hex-Literale → Tailwind-Token / `getThemePalette()` /
`semanticColors`, willkürliche Radien → `rounded-card|tile|chip`, Inline-Shadows
→ `shadowPresets`, Type-Floor 12px (interaktiv ≥ 14px), `maxFontSizeMultiplier`
in fixen Containern, `accessibilityRole`/`-Label`/`-State` + `hitSlop`,
`Alert.alert` → `ConfirmDialog`, `ActivityIndicator` → `Skeleton`.
Einzige bewusst sichtbare Änderung: Schatten sind leichter (Presets deckeln
`shadowOpacity` bei 0.08).

Guardrails in diesem Lauf ergänzt (WP4.4):

- `scripts/check-ui-quality.mjs` prüft jetzt zusätzlich **neue Hex-Literale**
  (gegen `scripts/hex-allowlist.json`), `fontSize` < 12, inline
  `shadowOpacity` > 0.08 und `animationType="fade"`.
- `scripts/check-background-skins.mjs` prüft die Normalisierung wieder an der
  echten Implementierung (`contexts/children-context.tsx` statt der
  Kompatibilitäts-Reexport-Datei `hooks/use-children.ts`).
- `npm run test:all` bündelt typecheck + lint + alle nur lesenden Guardrails.
- `TASKS Kopie.md` entfernt (widersprach `PLAN.md`).

## Verlauf

_(neueste Einträge oben anhängen)_

## Offene Fragen / Blocker

- **Hex-Allowlist ist ein Schuldenposten, kein Freibrief.** `scripts/hex-allowlist.json`
  wurde aus dem Ist-Stand generiert. Jeder Eintrag ist Design-Schuld; die Liste
  darf nur schrumpfen. Regenerieren ausschließlich nach einem bewussten Sweep:
  `npm run guardrails:hex-allowlist`.
- **`components/routine-templates/template-selector.tsx`** ignoriert die
  Altersgruppe (T7) — bewusst offen, nicht vergessen.
- **Lint-Warnung offen:** `components/ui/progress.tsx:55` — `percent` wird
  berechnet, aber nicht verwendet (`@typescript-eslint/no-unused-vars`).
  ESLint endet bei Warnungen mit Exit-Code 0, `test:all` bleibt deshalb grün.
  Erst entfernen, dann in `package.json` `eslint … --max-warnings 0` setzen,
  damit die Nulltoleranz aus der DoD auch maschinell gilt.

---

<!--
STOP-SIGNAL: Wenn ALLE Aufgaben in PLAN.md abgehakt sind UND alle Checks grün
laufen, ersetze die nächste Zeile durch genau:  DONE
-->
NICHT FERTIG — Phasen 0–4 durch, Phasen 5–6 offen (Backlog: T7, T10, T16)
