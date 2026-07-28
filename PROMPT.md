# PROMPT.md — Loop-Instruktion (unveränderlich)

> Diese Datei ändert sich **nie**. Sie ist die wortgleiche Instruktion, die der
> Loop jede Runde schickt. Aller veränderlicher State lebt in `PLAN.md`,
> `PROGRESS.md` und `LEARNINGS.md` — nicht im Chat.

---

Du arbeitest am Projekt **Routine Stars Mobile** (Expo / React Native). Lies
**immer zuerst** in dieser Reihenfolge:

1. `CLAUDE.md` — Projektkontext, Stack, Konventionen (wird automatisch geladen).
2. `PLAN.md` — Spec und geordnete Aufgabenliste. Was gebaut wird, woran „fertig" erkennbar ist.
3. `PROGRESS.md` — was erledigt ist, was zuletzt fehlschlug, das DONE-Signal.
4. `LEARNINGS.md` — frühere Fehler und Erkenntnisse. Wiederhole keine bekannten Fehler.
5. `DECISIONS.md` — getroffene Architektur-Entscheidungen. Bleib konsistent dazu.

Dann führe **genau einen** Durchlauf aus:

1. **Nächste Aufgabe wählen.** Nimm die oberste noch offene (`[ ]`) Aufgabe aus
   `PLAN.md`, die nicht durch eine offene Abhängigkeit blockiert ist. Falls in
   `PROGRESS.md` ein fehlgeschlagener Lauf vermerkt ist, hat dessen Behebung
   Vorrang.
2. **Umsetzen.** Implementiere nur diese eine Aufgabe. Halte dich an die
   Konventionen aus `CLAUDE.md` (Deutsch im UI, Englisch im Code, NativeWind
   `className`, `iconName: string`, AsyncStorage über `lib/storage.ts`,
   reanimated v4 statt Framer Motion). Keine ungefragten Zusatz-Refactorings.
3. **Verifizieren.** Führe die relevanten Checks aus und bring sie auf grün:

   ```bash
   npm run typecheck          # tsc --noEmit — muss fehlerfrei sein
   npm run lint               # eslint — keine neuen Fehler
   npm run test:stickers      # Sticker-Katalog + PNG-Assets
   npm run test:smoke         # Task-Timer-Modal-Reihenfolge
   npm run test:progress-smoke# Local-Day-Progress (kein UTC)
   npm run test:contrast-smoke# Farb-Kontrast
   npm run test:background-skins
   ```

   Führe mindestens `typecheck` + `lint` jede Runde aus, plus die Smoke-Tests,
   die zur geänderten Domäne passen. Bei größeren Änderungen zusätzlich:
   `npx expo export --platform ios --output-dir /tmp/rs-export` (muss durchlaufen).
   Schlägt etwas fehl: beheben, bis grün — die Aufgabe ist erst dann erledigt.
4. **State fortschreiben.** Trag das Ergebnis in `PROGRESS.md` ein (Datum,
   Aufgabe, geänderte Dateien, Testresultat). Hake die Aufgabe in `PLAN.md` ab
   (`[ ]` → `[x]`). Neue Erkenntnis oder vermiedene Falle → eine Zeile in
   `LEARNINGS.md`. Architektur-Entscheidung getroffen → ein Eintrag in
   `DECISIONS.md`.
5. **Abbruch prüfen.** Wenn **alle** Aufgaben in `PLAN.md` abgehakt sind und
   alle Checks grün laufen, schreibe `DONE` als letzte Zeile in `PROGRESS.md`
   und stoppe. Sonst endet der Durchlauf hier — die nächste Runde startet frisch.

**Regeln**

- Genau eine Aufgabe pro Durchlauf. Keine Aufgabe als erledigt markieren,
  solange Tests rot sind oder die Umsetzung unvollständig ist.
- State steht in Dateien, nicht im Chat — der Verlauf ist nächste Runde weg.
- Niemals `node_modules`, `ios/Pods` oder generierte Assets committen, die nicht
  zur Aufgabe gehören.
- Bei echter Blockade (fehlende Info, widersprüchliche Spec): in `PROGRESS.md`
  unter „Offene Fragen / Blocker" notieren statt zu raten.
