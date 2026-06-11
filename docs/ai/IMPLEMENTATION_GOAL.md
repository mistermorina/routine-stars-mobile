# Implementation Goal — Design & Feel Upgrade v2 (Basis: main @ 38697c8)

Designsprache: siehe `docs/ai/DESIGN_DIRECTION.md` (verbindlich).
Arbeitsmodus: 4 Wellen. Nach JEDER Welle: Commit + typecheck/lint + User testet auf Gerät.
Nächste Welle erst nach User-Freigabe. Kleine, reversible Änderungen; keine Feature-Umbauten.

## Projektziel
Die App auf das Niveau der freigegebenen Mockups heben: ruhigeres modernes Layout,
state-reiche Karten, spürbares Feedback (Press/Haptik/Sound), Eltern-Bereich editorial.
Informationsarchitektur (3 Tabs, PIN-Elternbereich) und Datenmodell bleiben unverändert.

## Welle A — Routinen-Screen + Tab-Bar (Aushängeschild)
**Dateien:** `app/(tabs)/index.tsx` (24K, vorsichtig!), `app/(tabs)/_layout.tsx`,
`components/routine-stars/{header,routine-card,task-item,daily-mission-card}.tsx`,
neu: `components/routine-stars/tab-bar.tsx`, `components/ui/pressable-scale.tsx`,
`lib/motion.ts`, `tailwind.config.ts` (Radius-System).
**Inhalt:**
1. Header-Zone: große Headline „Routinen" + Subline; Stern-Pill; Kind-Switcher +
   Collapse-Verhalten und Settings-Zugang FUNKTIONAL ERHALTEN (nur restylen).
2. Filter-Chips Heute/Morgen/Abend/Alle — Mapping über `Routine.schedule`/Template-`timeOfDay`;
   Routinen ohne Zeitangabe erscheinen unter „Alle" (Default-Auswahl: Heute zeigt alles Fällige,
   Fallback = alle). Kein Datenmodell-Umbau: rein lesende Ableitung, bei dünner Datenlage Chips
   ausblenden statt leerer Listen.
3. Hero-Karte „Nächste Routine": Name, „X von Y Aufgaben", Pill-CTA „Starten" (scrollt zur
   Karte/expandiert sie), Illustration aus vorhandenen Assets (theme-passend, z. B. theme-*.png).
4. Routine-Karten + Task-Rows im neuen Row-Stil (Squircle-Icon, Status-Affordance rechts:
   Play=Timer, Ring=teilweise, Haken=fertig; Stern-Chip statt Rating).
5. Summary-Footer-Karte (Sterne heute, Routinen X/Y) — Daten aus vorhandenen Hooks.
6. Tab-Bar: 3 Tabs restylen (Pill-Active, Bounce, vorhandenes `tab_focus`-Feedback anbinden).
**Akzeptanz:** Alle bisherigen Funktionen erreichbar (Kind-Wechsel, Timer, Sticker-Banner,
Missionen); ein Screen-Durchlauf ohne Layout-Sprünge; Reduced-Motion-Pfad ohne Entrances.

## Welle B — Belohnungen + Profil-Hero
**Dateien:** `app/(tabs)/rewards.tsx`, `components/routine-stars/rewards-overview.tsx`,
`app/(tabs)/star-account.tsx`, `components/profile/*`, `hooks/use-child-progression.ts` (nur lesen).
**Inhalt:**
1. Rewards-Hero „Nächste Belohnung" mit `reward-star-gift(-soft).png` + Progressbar „X/Y".
2. Segmented Verfügbar/Freigeschaltet (Wunschliste NUR falls Datenmodell Wunsch-Status bereits
   führt — prüfen; sonst 2 Segmente).
3. Reward-Karten 2-Spalten mit Zustands-System (siehe DESIGN_DIRECTION §6), Einlöse-Flow unverändert.
4. Profil-Hero: Avatar, Name, Level-Pill, XP-Bar, Stats-Row; Meilenstein-Badges aus
   use-child-progression-Daten (nur visualisieren, keine neue Logik). Kalender + Sticker-Wand bleiben.
**Akzeptanz:** Einlösen + Sticker-Flows unverändert funktional; jede Reward-Karte zeigt Distanz zum Ziel.

## Welle C — Feel-Pass (App-weit)
**Dateien:** `components/ui/pressable-scale.tsx` (aus A) auf CTAs ausrollen; `lib/feedback.ts`
(Sound-Adapter), `app/_layout.tsx` (Adapter registrieren), neu `lib/sound-adapter.ts`,
`assets/sounds/*` (Skript synthetisiert), `app/settings/index.tsx` (Toggles),
`components/ui/skeleton.tsx` + Lade-Stellen, `task-timer-modal.tsx` + `routine-complete-dialog.tsx`
(Hardcodes → Palette), Reduced-Motion-Nachrüstung (Konfetti, Header-Spring, Missions, Timer).
**Inhalt:** 1) expo-audio installieren (`npx expo install expo-audio -- --legacy-peer-deps`),
4–6 Chimes generieren (Skript-Vorlage existierte: Bell-Synthese, 22.05kHz WAV), Adapter an
`setFeedbackSoundAdapter()` hängen, Settings-Toggles Sound/Haptik (Storage-Keys neu, Default an).
2) PressableScale auf Einlösen/Starten/Sticker/Chips. 3) Skeletons statt „Laden…" (Layout spiegeln).
4) Theme-Brüche fixen (#071A49, #F7B633 u. a. → palette/semanticColors). 5) Reduced-Motion-Lücken.
**Akzeptanz:** typecheck/lint 0 Errors; Sound aus = komplett still; iOS-Stummschalter respektiert;
Reduced Motion → keine Loops/Konfetti.

## Welle D — Eltern-Bereich editorial
**Dateien:** `app/settings/index.tsx`, `app/settings/stats.tsx`, ggf. `app/settings/progress.tsx`.
**Inhalt:** Editorial-Stil (DESIGN_DIRECTION Dialekt 2): ruhige Typo-Hierarchie, dünne
Progressbars, Wochen-Ring + Wochenverlauf (Vorlage: Fortschritt-Mockup), gedeckte Akzente.
Settings-Liste: Sektionen, konsistente Icons, Blau/Rot-Hardcodes raus.
**Akzeptanz:** kein Maskottchen/Konfetti im Elternbereich; Datenanzeige unverändert korrekt.

## Out of Scope (alle Wellen)
Tab-Anzahl/Navigation, Datenmodell & Storage-Logik (außer additive Sound/Haptik-Keys),
Sticker-Vergabelogik, neue Features (Ziele, Familie & Betreuung, Inbox, Subtasks),
Asset-Ersatz, Onboarding-Umbau, `studio/`.

## Technik-Anforderungen
NativeWind-Klassen bevorzugen; Animation nur transform/opacity über lib/motion-Tokens;
keine neuen Dependencies außer expo-audio (Welle C); expo-image für Bild-Assets;
Listen mit FlatList/Memo wo bestehend; kein echter Blur.

## Accessibility
accessibilityRole/Label (deutsch) auf alle neuen Interaktiven; Touch-Targets ≥ 44pt;
ReduceMotion.System in allen Tokens + use-reduced-motion für Dekoratives;
Kontrast: accentText-Töne auf Soft-Flächen (keine Gold-auf-Weiß-Labels).

## Validierung (jede Welle)
`npm run typecheck` · `npm run lint` (0 neue Errors/Warnings) · `rtk git diff` Review ·
Diff-Review-Agent (Fokus: Regressionen, tote Props, Theme-Bypässe) · Geräte-Test durch User
(Expo Go) als Gate zur nächsten Welle.

## Finaler Report (nach letzter Welle)
Geänderte Dateien · umgesetzte Mockup-Elemente je Screen · Checks ✓/✗ · bekannte Grenzen ·
empfohlene nächste Schritte. Erkenntnisse fortlaufend in docs/ai dokumentieren.
