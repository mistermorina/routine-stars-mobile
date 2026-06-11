# Design Direction — „Soft Glass + Kawaii" (freigegeben 2026-06-11)

Nordstern: Mockup-Serie des Users (warmes Glas-UI mit Kawaii-3D-Stern-Maskottchen).
Referenz-Look im Repo: `assets/review/reference-style-v1/contact-sheets/*` und die
integrierten Illustrationen (`assets/images/*`). Die Mockups existieren nur im Chat —
dieses Dokument beschreibt sie verbindlich.

## Grundsatz: Zwei Dialekte, ein System
- **Kind-Screens** (Routinen, Belohnungen, Profil): warm, verspielt, Glas-Pastell,
  Maskottchen-Illustrationen, sichtbare Belohnung. Modern durch Disziplin: viel Weißraum,
  EINE große Headline pro Screen, wenige Akzente, weiche diffuse Gradients.
- **Eltern-Bereich** (Settings, Statistiken, PIN): editorial-ruhig. Gedeckte Farben,
  Weißraum, dünne Progress-Elemente, keine Maskottchen. Seriös, nicht steril.

## Layout-Sprache Kind-Screens (aus Mockups abgeleitet)
1. **Screen-Header:** große Headline (`text-4xl`-Klasse ~34-36px Poppins Bold) +
   einzeilige Subline mit ✨; rechts Stern-Pill (Zähler). KEIN Mail/Inbox-Icon (Feature existiert nicht).
2. **Segmented Chips** unter dem Header (z. B. Heute/Morgen/Abend/Alle bzw.
   Verfügbar/Freigeschaltet): Pill-Leiste auf Karte, aktives Segment weiß mit Schatten + Akzenttext.
3. **Hero-Karte** pro Screen: Gradient-Fläche (palette.screenGradient-Töne), links Text +
   Pill-CTA, rechts Illustration/Asset. Radius lg.
4. **List-Rows (Tasks):** weiße Karte, links 56px-Squircle (Pastell-Tint, Icon),
   Titel + Subline + Stern-Chip („+3 ⭐", KEINE Rating-Optik), rechts Status-Affordance:
   - Timer-Task offen → Play-Kreis (Akzent)
   - Routine teilweise erledigt → Fortschrittsring
   - erledigt → grüner Haken-Kreis, Karte grünlich getönt (`semantic success soft`)
5. **Summary-Footer-Karte:** „Heute geschafft: X Sterne" + „Y/Z Routinen" mit Mini-Progress.
6. **Reward-Karten (2-Spalten-Grid):** Zustands-System ist Pflicht —
   a) zu teuer/fern: „Bald frei"-Badge, b) nah: Mini-Progressbar + „Nur X Sterne entfernt",
   c) erschwinglich: „Einlösen"-Pill, d) eingelöst: grün „Freigeschaltet". Keine Nummerierung.
7. **Profil-Hero:** Avatar, Name, Level-Pill + XP-Bar (use-child-progression),
   Stats-Row (Streak / Belohnungen / Wochen-%). Darunter Meilenstein-Badges
   (7-Tage-Streak, 25 Sterne …). Familie/Erinnerungen/Settings bleiben im PIN-Eltern-Bereich.
8. **Tab-Bar (3 Tabs: Routinen, Belohnungen, Profil):** weiß, weiche Icons, aktiver Tab =
   Pastell-Pill hinter Icon + Akzent-Label, Bounce beim Fokuswechsel, Haptik (`tab_focus` existiert).

## Farben & Themes
- Warm (Marken-Default) = Mockup-Warmvariante. Die kühle Lavendel/Blau-Variante der Mockups
  entsteht über Kind-Themes `sterne`/`galaxy` — KEINE zweite Designwelt bauen, themePalettes nutzen
  (screenGradient, heroSurface, cardTint, tabActiveBg, motif*, celebrationColors sind vorhanden).
- Hex-Werte NIE hart in Komponenten; immer `getThemePalette()` / Tailwind-Tokens / `semanticColors`.

## Radius- & Spacing-System
- Radius: sm 14 / md 18 / lg 22 (Tailwind borderRadius überschreiben; Buttons = Pill bei CTAs, sonst md).
- Spacing: 4-pt-Grid; Screen-Padding px-5; Kartenabstand gap-3/gap-4.
- Schatten: weich, groß, niedrige Opazität (shadow-color Akzent-nah, opacity ≤ 0.08); kein echter Blur (GPU).

## Motion (Tokens verbindlich, lib/motion.ts)
- springs: playful d12/s250 · bouncy d9/s220 · gentle d20/s180 · press d15/s300
- durations: 150/250/400/700 · Entrances: FadeInDown-Stagger 40ms
- Nur transform/opacity. Alles mit ReduceMotion.System; Dekoratives (Konfetti, Loops, Maskottchen-Wiggle)
  zusätzlich über `hooks/use-reduced-motion.ts` ganz aus.

## Explizite No-Gos
Mail/Inbox-Icon · 5 Tabs (Home/Fortschritt-Tabs) · Task-Sterne als Rating-Reihe ·
Subtask-Zähler („3/4") ohne Datenbasis · neue Features (Ziele, Familie & Betreuung, Wunschliste
nur falls Datenmodell sie schon trägt) · echte Blur-Layer · Ersetzen vorhandener Assets.
