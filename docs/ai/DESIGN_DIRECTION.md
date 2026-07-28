# Design Direction — „Soft Glass + Kawaii" (freigegeben 2026-06-11, abgeglichen mit Code 2026-07-28)

Nordstern: Mockup-Serie des Users (warmes Glas-UI mit Kawaii-3D-Stern-Maskottchen).
Referenz-Look im Repo: `assets/review/reference-style-v1/contact-sheets/*` und die
integrierten Illustrationen (`assets/images/*`). Die Mockups existieren nur im Chat —
dieses Dokument beschreibt sie verbindlich.

Umsetzungs-Rezepte (Copy-Paste-Snippets, Haptik-Tabelle, No-Gos) stehen in
`.claude/skills/routine-stars-polish/SKILL.md`. Dieses Dokument definiert das *Was*,
die Skill das *Wie*.

## Grundsatz: Zwei Dialekte, ein System
- **Kind-Screens** (Routinen, Belohnungen, Profil): warm, verspielt, Glas-Pastell,
  Maskottchen-Illustrationen, sichtbare Belohnung. Modern durch Disziplin: viel Weißraum,
  EINE große Headline pro Screen, wenige Akzente, weiche diffuse Gradients.
- **Eltern-Bereich** (Settings, Statistiken, PIN): editorial-ruhig. Gedeckte Farben,
  Weißraum, dünne Progress-Elemente, keine Maskottchen. Seriös, nicht steril.

## Layout-Sprache Kind-Screens (aus Mockups abgeleitet)
1. **Screen-Header:** große Headline (`text-2xl`–`text-3xl`, 24–30px Poppins Bold) +
   einzeilige Subline mit ✨; rechts Stern-Pill (Zähler). KEIN Mail/Inbox-Icon (Feature existiert nicht).
2. **Segmented Chips** unter dem Header (z. B. Heute/Morgen/Abend/Alle bzw.
   Verfügbar/Freigeschaltet): Pill-Leiste auf Karte, aktives Segment weiß mit Schatten + Akzenttext.
3. **Hero-Karte** pro Screen: Gradient-Fläche (palette.screenGradient-Töne), links Text +
   Pill-CTA, rechts Illustration/Asset. Radius `rounded-card`.
4. **List-Rows (Tasks):** weiße Karte, links 52–56px-Squircle (Pastell-Tint, Icon),
   Titel + Subline + Stern-Chip („+3 ⭐", KEINE Rating-Optik), rechts Status-Affordance:
   - Timer-Task offen → Play-Kreis (Akzent)
   - Routine teilweise erledigt → Fortschrittsring
   - erledigt → grüner Haken-Kreis, Karte grünlich getönt (`bg-success-soft`)
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
- **Hex-Werte NIE hart in Komponenten.** Quellen, in dieser Reihenfolge:
  1. Tailwind-Token (`bg-card`, `text-muted-foreground`, `bg-success-soft`, `rounded-card`)
  2. `getThemePalette(child.theme)` für alles Kind-/Theme-Abhängige
  3. `semanticColors` aus `lib/theme.ts`, wenn ein roher String nötig ist
     (SVG-`fill`, Icon-`color`, animierte Styles)
- Status-Tokens (Tailwind + `semanticColors` sind 1:1 identisch):

| Token | Wert | Verwendung |
|-------|------|------------|
| `success` | `#4FD17A` | Nur Flächen/Indikatoren, nie Text |
| `success-soft` | `#ECFDF5` | Getönte Fläche „erledigt" |
| `success-foreground` | `#1F8A4C` | Text ≥14px bold auf soft/weiß (4.38:1) |
| `success-strong` | `#18773F` | Kleiner Text auf Weiß (5.60:1) |
| `warning` | `#F7A313` | Fläche/Icon-Fill |
| `warning-soft` | `#FEF3C7` | Getönte Hinweis-Fläche |
| `warning-foreground` | `#92400E` | Hinweis-Text (7.09:1 auf Weiß) |
| `destructive` | `#EF4444` | Fläche/Icon, **nicht** hinter weißem Text (3.76:1) |
| `destructive-soft` | `#FDECEC` | Getönte Warnfläche |
| `destructive-strong` | `#8A1F1F` | Destruktive CTAs + destruktiver Text (9.14:1) |

## Radius-System (verbindlich)

| Klasse | Wert | Verwendung |
|--------|------|------------|
| `rounded-card` | 22 | Karten, Dialoge, Sheets, Hero-Flächen |
| `rounded-tile` | 18 | Icon-Squircles, Inputs, Tiles, Buttons in Karten |
| `rounded-chip` | 14 | Chips, Pills, Badges, Segment-Buttons |
| `rounded-full` | — | Avatare, Sternkreise, CTA-Pills |

`rounded-lg` (12) / `rounded-md` (10) / `rounded-sm` (8) bleiben in der Config, damit
Bestandscode nicht bricht, sind aber **deprecated**: kein neuer Code darf sie verwenden,
der Phase-4-Sweep ersetzt die Altbestände. Ebenso raus: `rounded-xl`/`rounded-2xl`/
`rounded-[22px]` — dafür gibt es die drei Token oben.

## Spacing & Typografie
- 4-pt-Grid. **Screen-Padding ist `px-4` / `mx-4`** (76× im Code vs. 12× `px-5`) —
  `px-5` ist Altbestand, nicht kopieren. Karten-Innenabstand `p-4`, großzügige Hero-Karten `p-5`.
- Kartenabstand `gap-3` (kompakt) / `gap-4` (Sektionen).
- Type-Scale (Poppins, `font-body` 400 · `font-body-semibold` 600 · `font-body-bold`/`font-headline` 700):

| Klasse | px | Verwendung |
|--------|----|------------|
| `text-3xl` | 30 | Screen-Headline (max. eine pro Screen) |
| `text-xl` | 20 | Dialog-Titel, Sektions-Headline |
| `text-lg` | 18 | Karten-Titel |
| `text-base` | 16 | Body, Button-Labels, Eingaben |
| `text-sm` | 14 | Sekundärtext, Sublines |
| `text-xs` | 12 | **Minimum.** Nur Meta: Badges, Chips, Zähler, Captions |

- Unter 12px gibt es nichts — kein `text-[10px]`, kein `text-[11px]`.
  Alles Interaktive und aller Fließtext ist ≥14px.
- Touch-Targets ≥ 44×44pt (`PressableScale` bringt `minHeight: 44` mit, `Button` ist `h-12`).
- `maxFontSizeMultiplier` setzen, wo Dynamic Type ein Layout sprengen würde (Pills, Zähler).

## Schatten
- Ausschließlich `shadowPresets` aus `lib/theme.ts`: `shadowSubtle` (Chips/Tiles),
  `shadowCard` (Karten/Rows), `shadowFloating` (Dialoge/Sheets/Toasts).
- `shadowOpacity ≤ 0.08`, Farbe aus `shadowColors` (`ambient #9DB8D8`, `deep #2E3A68`),
  jedes Preset bringt `elevation` für Android mit.
- Keine `shadow-lg`/`shadow-md`-Utilities, keine Ad-hoc-Shadow-Objekte, kein echter Blur (GPU).

## Motion (Tokens verbindlich, `lib/motion.ts`)
- **springs:** playful d12/s250 · bouncy d9/s220 · gentle d20/s180 · press d15/s300 ·
  modal d14/s180 · sheet d15/s200 (Aliase: `modalSpring`, `sheetSpring`, `pressSpring`).
- **durations:** 150 / 250 / 400 / 700 · **timings:** fast/base/slow (Easing.out cubic).
- **Entrances:** `enterStagger(index)` (FadeInDown, 40ms Versatz, gedeckelt bei 240ms),
  `enterFade(delay)`. **Exits:** `exitFade()`, `exitSlideDown()`.
- Nur `transform`/`opacity` animieren — nie `width`/`height`/`margin`.
- Alles trägt `ReduceMotion.System`; Dekoratives (Konfetti, Loops, Maskottchen-Wiggle)
  zusätzlich über `hooks/use-reduced-motion.ts` ganz aus.
- Haptik/Sound nur über `triggerFeedback(event)` aus `lib/feedback.ts` — nie `expo-haptics` direkt.

## Explizite No-Gos
Mail/Inbox-Icon · 5 Tabs (Home/Fortschritt-Tabs) · Task-Sterne als Rating-Reihe ·
Subtask-Zähler („3/4") ohne Datenbasis · neue Features (Ziele, Familie & Betreuung, Wunschliste
nur falls Datenmodell sie schon trägt) · echte Blur-Layer · Ersetzen vorhandener Assets ·
`Alert.alert` (stattdessen `components/ui/confirm-dialog.tsx`) · horizontale ScrollViews.
