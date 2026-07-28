# DECISIONS.md — Architektur-Entscheidungen

> **Rolle im Loop:** Festgehaltene Entscheidungen, damit der Loop konsistent
> bleibt und nicht jede Runde neu entscheidet. Neue Entscheidung = neuer
> Eintrag (nicht alte überschreiben; bei Umkehr „Ersetzt durch …" vermerken).
>
> Ergänzt das bestehende `Agents.md` (Execution-Log mit der Umsetzungs-Historie)
> — `DECISIONS.md` hält das **Warum** kurz fest, `Agents.md` das **Was wann**.

## Format

```
### ADR-NNN — <Titel>
- Datum: YYYY-MM-DD
- Status: akzeptiert | ersetzt durch ADR-MMM
- Kontext: <Problem/Zwang>
- Entscheidung: <was gewählt wurde>
- Konsequenz: <Folgen, Trade-offs>
```

---

### ADR-001 — Expo Router (file-based routing)
- Datum: 2026-03-02
- Status: akzeptiert
- Kontext: Navigation für native App nötig, Web-Variante nutzt Next.js-Routing.
- Entscheidung: Expo Router mit Bottom-Tabs (Routinen, Belohnungen, Sterne),
  Stacks für Auth/Onboarding/Settings, Modal für Parent-Login (PIN).
- Konsequenz: Screens leben als Dateien unter `app/`; Routing-Struktur folgt dem
  Verzeichnisbaum.

### ADR-002 — NativeWind v4 statt StyleSheet
- Datum: 2026-03-02
- Status: akzeptiert
- Kontext: Konsistenz mit der Tailwind-basierten Web-Variante gewünscht.
- Entscheidung: Styling über NativeWind-`className`; `cn()` für bedingte Klassen.
- Konsequenz: Gleiche Tailwind-Klassen wie im Web; Inline-`style` nur für
  dynamische Werte.

### ADR-003 — Icons als String-Referenz
- Datum: 2026-03-02
- Status: akzeptiert
- Kontext: Routinen/Tasks werden in AsyncStorage persistiert und müssen
  serialisierbar sein.
- Entscheidung: `iconName: string` in Typen; Auflösung zur Laufzeit über
  `getIcon()` aus einer zentralen Icon-Registry.
- Konsequenz: Keine Component-Referenzen in persistierten Daten; neue Icons
  müssen in `lib/icons.tsx` + `lib/icon-registry.ts` registriert werden.

### ADR-004 — Auth-State In-Memory
- Datum: 2026-03-02
- Status: ersetzt durch ADR-006
- Kontext: MVP ohne Backend; Fokus auf lokale Familien-Daten.
- Entscheidung: Auth läuft über React Context (`contexts/auth-context.tsx`),
  nicht persistiert; nur fachliche Daten gehen in AsyncStorage.
- Konsequenz: Login geht bei App-Neustart verloren — bewusst akzeptiert für den
  aktuellen Stand; bei späterem Backend neu zu bewerten.

### ADR-005 — Lokale Kalendertag-Logik
- Datum: 2026-06-02
- Status: akzeptiert
- Kontext: Tagesfortschritt war zeitzonen-anfällig (UTC-Sprünge um Mitternacht).
- Entscheidung: Zentrale `getLocalIsoDate()` in `lib/local-date.ts` für alle
  tagesbezogenen Vergleiche; per `test:progress-smoke` erzwungen.
- Konsequenz: Kein direktes `toISOString()` für Datumsschlüssel mehr erlaubt.

### ADR-006 — Local-only: keine Accounts, kein Sign-in
- Datum: 2026-07-28 (umgesetzt in Phase 1, Commit `bbbaf17`)
- Status: akzeptiert — ersetzt ADR-004
- Kontext: ADR-004 hielt einen In-Memory-„Login" als Platzhalter für ein späteres
  Backend vor. Damit blieb ein Konto-Screen (`app/(auth)/login.tsx`) plus ein
  Abrechnungs-Screen (`app/settings/billing.tsx`) im Baum, für die es weder
  Backend noch Geschäftsmodell gab. Für eine Kinder-App ist das zusätzlich ein
  Datenschutz-Risiko: erhobene Konto-Daten, die niemand braucht.
- Entscheidung: Routine Stars ist **ausdrücklich local-only**. Es gibt keine
  Accounts, keine Registrierung, keinen Sync und kein Abo. Alle Daten liegen auf
  dem Gerät (AsyncStorage über `lib/storage.ts`, PIN in SecureStore).
  `app/(auth)/login.tsx` und `app/settings/billing.tsx` wurden entfernt;
  `app/(auth)/welcome.tsx` ersetzt den Login-Einstieg.
  `contexts/auth-context.tsx` bleibt bestehen, modelliert aber **nur noch das
  Eltern-Gate** (`isParentAuthorized` / `authorizeParent` / `deauthorizeParent`),
  nicht mehr einen Benutzer.
- Konsequenz: Kein Geräte-Wechsel und keine Wiederherstellung ohne manuelles
  Backup — dafür existiert der JSON-Export in `lib/backup.ts` (PLAN T13), der
  Restore-Pfad ist als T16 offen. Ein späteres Backend wäre ein neuer ADR, kein
  Wiederbeleben von ADR-004.

### ADR-007 — Notifications-Engine: lokale Trigger, ein Sync-Punkt
- Datum: 2026-07-28 (umgesetzt in Phase 2, Commit `e0186ef`)
- Status: akzeptiert
- Kontext: Routine-Erinnerungen sollen zur `TimeOfDay` der jeweiligen Routine
  feuern. Ohne Backend fällt Push aus; gleichzeitig darf ein verweigertes
  Berechtigungs-Dialogfeld nichts kaputt machen, und verwaiste Notifications aus
  gelöschten Routinen dürfen nicht liegenbleiben.
- Entscheidung: `expo-notifications` mit **rein lokalen** Kalender-Triggern,
  gekapselt in `lib/notifications.ts`. Kein Komponenten-Code ruft
  `expo-notifications` direkt auf. Die Engine ist deklarativ: `syncRoutineReminders(routines)`
  ist der einzige Schreibpfad — sie storniert alle App-eigenen Reminder und plant
  aus dem aktuellen Routinen-Stand neu, statt inkrementell zu diffen.
  Berechtigungen laufen über `getPermissionState()` / `ensurePermissions()` mit
  explizitem `"unsupported"`-Zustand (Simulator/Web), Opt-in in
  `app/settings/notifications.tsx`.
- Konsequenz: Idempotent und selbstheilend — ein voller Sync räumt Altlasten
  automatisch weg; dafür ist er teurer als ein Diff (unkritisch bei der
  Größenordnung). Verweigerte Berechtigung ist ein regulärer Rückgabewert, kein
  Fehlerfall. Erinnerungen feuern nur, solange die App installiert bleibt.

### ADR-008 — Eltern-PIN in SecureStore + Parental Gate
- Datum: 2026-07-28 (umgesetzt in Phase 1, Commit `bbbaf17`)
- Status: akzeptiert
- Kontext: Der Eltern-Bereich (Einstellungen, Kinder, Statistiken, Reset, Export)
  muss vor dem Kind geschützt sein. Ein PIN im AsyncStorage liegt im Klartext im
  App-Container. Zusätzlich verlangen die App-Store-Richtlinien für Kinder-Apps,
  dass elternspezifische Aktionen hinter einer Schranke liegen, die ein Kind
  nicht trivial überwindet.
- Entscheidung: Zwei getrennte Schichten in `lib/parent-access.ts`:
  1. **PIN** (4-stellig, `PARENT_PIN_LENGTH`) — gehasht in
     `expo-secure-store` (iOS Keychain / Android Keystore), AsyncStorage nur als
     Fallback, wenn SecureStore nicht verfügbar ist. Fehlversuche laufen in eine
     Sperre (`getLockState()` / `ParentPinLockState`) mit Backoff, statt
     unbegrenzt raten zu lassen.
  2. **Parental Gate** — eine Rechenaufgabe vor dem PIN-Dialog, die Nicht-Leser
     aussperrt.
  Der freigeschaltete Zustand lebt in `contexts/auth-context.tsx` und ist
  **bewusst nicht persistiert**: nach Neustart ist wieder zu.
- Konsequenz: Ein vergessener PIN ist ohne App-Reset nicht wiederherstellbar
  (`lib/reset.ts`) — akzeptiert, weil ein Recovery-Pfad ohne Backend genau die
  Schranke wäre, die er schützen soll. Eltern-Feedback läuft mit
  `{ disableSound: true }`, damit der Eltern-Bereich ruhig bleibt.

### ADR-009 — Token-Contract maschinell erzwungen statt nur dokumentiert
- Datum: 2026-07-28 (umgesetzt in Phase 4)
- Status: akzeptiert
- Kontext: `docs/ai/DESIGN_DIRECTION.md` (das *Was*) und
  `.claude/skills/routine-stars-polish/SKILL.md` (das *Wie*) beschreiben Farben,
  Radien, Schatten und Typo verbindlich. Rein dokumentierte Regeln haben sich
  über die Waves A–D trotzdem aufgeweicht: ~230 rohe Hex-Literale, ~130
  willkürliche Radien und Inline-Schatten bis `shadowOpacity: 0.26`. Über mehrere
  parallele Agenten hinweg ist Disziplin allein keine Durchsetzung.
- Entscheidung: Der Contract wird von `scripts/check-ui-quality.mjs` geprüft
  (`npm run test:ui-quality`, Teil von `npm run test:all`): keine neuen
  Hex-Literale in `app/` + `components/`, `fontSize` ≥ 12 (ohne Ausnahmen,
  auch nicht für Tab-Labels), inline `shadowOpacity` ≤ 0.08, kein
  `animationType="fade"`, kein `text-[<14px]`, keine horizontalen ScrollViews,
  keine Touch-Targets < 44×44. Der Alt-Bestand wird **nicht** amnestiert,
  sondern als expliziter Schuldenposten in `scripts/hex-allowlist.json`
  eingefroren: pro Datei ein Occurrence-Budget, das nur sinken darf.
  `lib/theme.ts` und `tailwind.config.ts` sind die Farbquellen und per Pfad
  ausgenommen.
- Konsequenz: Neue Design-Schuld kann nicht mehr unbemerkt einfließen; ein
  bewusster Sweep muss die Allowlist per `npm run guardrails:hex-allowlist`
  neu schreiben, was den Zuwachs im Diff sichtbar macht. Trade-off: die
  Prüfung ist rein textuell und kennt keinen Kontext — eine wirklich
  einmalige SVG-Illustrationsfarbe braucht einen Allowlist-Eintrag statt
  einer Diskussion.

---

_(neue Entscheidungen unten anhängen)_
