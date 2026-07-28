# Screenshot-Plan — Routine Stars

Dieses Dokument beschreibt **was** aufgenommen wird und **womit**.
Die Screenshots selbst entstehen erst in **Phase 6** mit dem finalen Datenstand —
hier wird bewusst nichts erzeugt.

---

## 1. Pflichtgröße und Gerät

App Store Connect verlangt für iPhone verpflichtend die **6,9-Zoll-Größe**:

| | Wert |
|---|---|
| Auflösung Hochformat | **1320 × 2868 px** |
| Auflösung Querformat | 2868 × 1320 px (für diese App irrelevant, `orientation: "portrait"`) |
| Anzahl | 3–10 Screenshots, empfohlen: **6** |
| Format | PNG oder JPEG, sRGB oder P3, kein Alphakanal |

Aus der 6,9"-Größe leitet App Store Connect die kleineren iPhone-Größen automatisch
ab — es müssen also **keine** separaten 6,5"- oder 5,5"-Sets geliefert werden.

### Verifiziertes Simulator-Gerät

Auf dieser Maschine **empirisch geprüft** (nicht aus der Dokumentation übernommen):
der Simulator **iPhone 17 Pro Max** (iOS 26.2) liefert exakt **1320 × 2868 px** im
Hochformat.

Prüfvorgehen, zweifach:

1. Simulator gebootet, `xcrun simctl io … screenshot` gezogen, Pixelmaße mit `sips`
   ausgelesen → `pixelWidth: 1320`, `pixelHeight: 2868`.
2. Gegenprobe im Gerätprofil
   `/Library/Developer/CoreSimulator/Profiles/DeviceTypes/iPhone 17 Pro Max.simdevicetype/Contents/Resources/profile.plist`
   → `mainScreenWidth = 1320`, `mainScreenHeight = 2868`, `mainScreenScale = 3.0`
   (entspricht 440 × 956 Punkten).

**Ebenfalls geprüft:** `iPhone 16 Pro Max` liefert dieselben 1320 × 2868 px und ist
damit gleichwertig verwendbar. **Nicht** geeignet sind `iPhone 17` und
`iPhone 17 Pro` — beide liefern 1206 × 2622 px (6,3-Zoll-Klasse) und werden von
App Store Connect im 6,9"-Slot abgelehnt. Entscheidend ist die Pixelausgabe, nicht
der Gerätename: vor der Aufnahme immer mit `sips` gegenprüfen.

### Befehle (Klartext, zum Kopieren)

Verfügbare Simulatoren samt UDID auflisten:

```
xcrun simctl list devices available
```

Zielgerät starten (UDID aus der Liste einsetzen):

```
xcrun simctl boot UDID
xcrun simctl bootstatus UDID -b
```

Screenshot aufnehmen:

```
xcrun simctl io UDID screenshot shot.png
```

Pixelmaße gegenprüfen:

```
sips -g pixelWidth -g pixelHeight shot.png
```

Simulator wieder herunterfahren:

```
xcrun simctl shutdown UDID
```

Die UDID ist maschinenspezifisch. Auf der aktuellen Maschine lautet sie für
**iPhone 17 Pro Max**: `8801DDBC-4B2E-46F7-841F-1B03BFA64371`.
Statt der UDID funktioniert auch `booted`, wenn genau **ein** Simulator läuft:
`xcrun simctl io booted screenshot shot.png`.

### iPad-Screenshots: nicht erforderlich

`app.json` setzt inzwischen **`ios.supportsTablet: false`** (Stand beim Erstellen
dieses Plans geprüft). Damit ist die App keine iPad-App, App Store Connect zeigt
den 13-Zoll-iPad-Slot gar nicht erst an, und es wird **nur** das
iPhone-6,9"-Set gebraucht. Auf iPads läuft die App als skalierte iPhone-App.

Für den Fall, dass die Entscheidung später zurückgedreht wird, hier die auf
dieser Maschine bereits verifizierte Zahl: Simulator **iPad Pro 13-inch (M5)**
liefert **2064 × 2752 px** im Hochformat (UDID hier:
`45CD1646-5FD8-4027-A8EC-FF1521FAB10E`) — eine der beiden von Apple akzeptierten
13"-Auflösungen, die andere ist 2048 × 2732 von den älteren 12,9"-Modellen.
Wird `supportsTablet` wieder auf `true` gesetzt, sind **alle sechs Motive
zusätzlich** auf dem iPad aufzunehmen, und jeder Screen muss vorher einmal auf
iPad-Breite gesichtet werden. Die App ist darauf teilweise vorbereitet
(`components/stickers/sticker-wall.tsx` schaltet oberhalb einer Breitenschwelle
auf mehr Spalten), geprüft ist es aber nicht.

---

## 2. Bildaufbau (gilt für alle sechs Shots)

- **Reine Gerätescreenshots ohne Rahmen und ohne Marketing-Overlay** als Basis.
  Falls später Text-Overlays und Farbflächen dazukommen: Der Screenshot muss die
  App weiterhin wahrheitsgemäß zeigen (Guideline 2.3.3) — keine erfundenen
  Screens, keine Features, die es nicht gibt.
- **Statusleiste:** vor der Aufnahme vereinheitlichen, sonst steht auf jedem Bild
  eine andere Uhrzeit und ein anderer Akkustand:
  ```
  xcrun simctl status_bar UDID override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3
  ```
  Zurücksetzen mit:
  ```
  xcrun simctl status_bar UDID clear
  ```
  Die Flags und ihre Wertebereiche wurden gegen `xcrun simctl status_bar` (Hilfetext)
  geprüft: `--wifiBars` akzeptiert **0–3**, `--cellularBars` **0–4**, `--batteryLevel`
  **0–100**, `--batteryState` eines von `charging` / `charged` / `discharging`.
  Höhere Werte lässt das Tool nicht zu — die Zeile oben nutzt bereits die Maxima.
- **Reihenfolge = Erzählung.** Shot 1 wird in der Suche als Vorschau angezeigt und
  entscheidet über den Klick. Deshalb steht das Dashboard vorn.
- **Ein Datenstand für alle Shots.** Erst den kompletten Zustand aufbauen, dann
  alle sechs Bilder in einem Durchgang ziehen. Sonst springen Sternstand,
  Kindername und Datum von Bild zu Bild.
- **Sprache:** Simulator auf Deutsch stellen, damit Systemelemente (Datum,
  Tastatur, Freigabedialog) zur App passen.
- **Erscheinungsbild:** Die App ist auf `userInterfaceStyle: "light"` festgelegt —
  Dark Mode ist kein Thema.

### Gemeinsamer Datenstand (einmal aufbauen)

| Element | Empfehlung | Warum |
|---|---|---|
| Kind 1 | **Mia**, Altersgruppe 6-8, illustrierter Avatar, Theme "sterne" | kurzer Name, passt auch in schmale Chips |
| Kind 2 | **Jonas**, Altersgruppe 3-5, anderer Avatar, Theme "tiere" | belegt sichtbar die Mehr-Kind-Fähigkeit im Header |
| Foto-Avatar | **nicht** verwenden | ein echtes Kinderfoto darf nicht in den Store; ein Stock-Foto wäre irreführend |
| Sternstand Mia | **48** | zweistellig, wirkt "verdient", und liegt über dem Preis mindestens einer Belohnung |
| Routinen | 3 Stück aus den mitgelieferten Vorlagen (`lib/routine-templates.ts`, 15 Stück): **"Morgenroutine (Schultag)"**, **"Hausaufgaben"**, **"Abendroutine (mit Bad)"** | genug Fülle, ohne dass die Karte scrollt — und die Namen entsprechen exakt dem, was die App ausliefert |
| Erledigt am Aufnahmetag | Morgenroutine 3 von 5 | zeigt Fortschrittsbalken in Bewegung statt 0 % oder 100 % |
| Belohnungen | 4–5 Stück, Preise gemischt (z. B. 20 / 35 / 50 / 80) | mindestens eine freigeschaltet, mindestens eine noch entfernt |
| Sticker | **9–12 gesammelte** Sticker aus mehreren Themenwelten | volles Album wirkt unglaubwürdig, leeres verkauft nicht |
| Aktivitätsverlauf | ca. **3 Wochen** Historie mit Lücken | Statistiken und Monatskalender brauchen echte Streuung; ein durchgehend perfekter Monat wirkt gestellt |
| Uhrzeit im System | 9:41 | Apple-Konvention, ruhig |

---

## 3. Die sechs Hero-Shots

### Shot 1 — Dashboard mit Routinen
**Screen:** `app/(tabs)/index.tsx`, Tab "Routinen", Filter **"Heute"**

**Vorzubereitender Datenstand**
- Mia ist das aktive Profil, Sternzähler im Header zeigt **48**.
- Drei Routinekarten sichtbar; die oberste (Morgenroutine) ist **aufgeklappt** und
  zeigt 5 Aufgaben, davon 3 abgehakt.
- Der Header ist **ausgeklappt** (nicht der kollabierte Scroll-Zustand), damit
  Avatar, Name und Sternzähler zu sehen sind.
- Die Tagesmissions-Karte sichtbar und **nicht** erfüllt (Fortschritt in Bewegung).
- Kein Dialog, kein Toast, kein Konfetti im Bild.

**Caption-Vorschlag (deutsch, kurz)**
> **Der Tag auf einen Blick**
> Jede Routine, jede Aufgabe, ein klarer nächster Schritt.

---

### Shot 2 — Der Moment nach der erledigten Aufgabe
**Screen:** `app/(tabs)/index.tsx` — Stern-Flug bzw. Routine-Abschluss-Dialog
(`components/routine-stars/routine-complete-dialog.tsx`)

**Vorzubereitender Datenstand**
- **Variante A (bevorzugt):** letzte offene Aufgabe der Morgenroutine antippen und
  den Abschluss-Dialog aufnehmen: Überschrift **"Super!"**, Unterzeile
  "Alle Aufgaben geschafft. Die Sterne sind gesichert.", Badge
  "Routine komplett", Konfetti-Ring im Bild.
- **Variante B:** den Stern-Flug im Flug erwischen (Timing-Sache, mehrere
  Versuche einplanen). Wirkt lebendiger, ist aber schwerer reproduzierbar.
- In beiden Fällen: Reduce Motion am Simulator **aus**, sonst laufen die
  Animationen nicht.

**Caption-Vorschlag**
> **Geschafft fühlt sich gut an**
> Jede erledigte Aufgabe bringt sofort einen Stern.

---

### Shot 3 — Belohnungen
**Screen:** `app/(tabs)/rewards.tsx`, Tab "Belohnungen"

**Vorzubereitender Datenstand**
- Mit 48 Sternen sind mindestens zwei Belohnungen freigeschaltet und mindestens
  zwei noch nicht — der Unterschied zwischen "erreichbar" und "Ziel" muss im Bild
  sichtbar sein.
- Die Karte für die nächste Belohnung (`nextReward`) oben mit Restdistanz.
- Belohnungstitel aus den mitgelieferten Vorschlägen wählen
  (`lib/reward-suggestions.ts`), z. B. **"Hörspiel hören"**, **"Familien-Spieleabend"**,
  **"Einen Film schauen"**, **"Familienausflug planen"** — alltagsnah und
  **nichts Käufliches**, sonst entsteht der falsche Eindruck von In-App-Käufen.
- Kein Einlöse-Overlay im Bild (die Feier gehört zu Shot 2).

**Caption-Vorschlag**
> **Sterne werden zu echten Momenten**
> Belohnungen bestimmt ihr — nicht die App.

---

### Shot 4 — Sticker-Album
**Screen:** `app/sticker-album.tsx` (`components/stickers/sticker-wall.tsx`)

**Vorzubereitender Datenstand**
- 9–12 gesammelte Sticker aus **mindestens vier** verschiedenen Themenwelten, so
  verteilt, dass die Motivvielfalt sofort erkennbar ist (z. B. Tier, Rakete,
  Einhorn, Feuerwehr, Regenbogen, Wal).
- Der Rest des Rasters bleibt als "noch nicht gesammelt" sichtbar — das ist der
  Sammelanreiz.
- Alternativ, falls die Auswahl schöner wirkt: das
  Sticker-Auswahl-Sheet nach einer abgeschlossenen Routine
  (`components/stickers/sticker-reward-sheet.tsx`, Badge "Routine geschafft").
  Vorteil: zeigt, dass das Kind **auswählt** statt zieht.

**Caption-Vorschlag**
> **98 Sticker in 11 Welten**
> Nach jeder Routine sucht sich dein Kind einen aus.

---

### Shot 5 — Eltern-Statistiken
**Screen:** `app/settings/stats.tsx` ("Einstellungen → Statistiken")

**Vorzubereitender Datenstand**
- Historie über ca. drei Wochen, damit die Kacheln plausible Zahlen zeigen:
  "Aus Aufgaben" (Sterne), "Aktivitäten", "Aktive Tage", "Serie".
- Die "Serie" sollte **nicht** 0 sein, aber auch nicht absurd hoch — 4 bis 6 wirkt
  echt.
- Die Kopfkarte "Eltern-Detailansicht / Statistiken" mit im Bild.
- Der Wechsel auf `app/settings/progress.tsx` (Monatskalender) ist die
  Alternative, falls der Kalender im finalen Design stärker wirkt — dann Caption
  entsprechend anpassen.

**Caption-Vorschlag**
> **Fortschritt, den Eltern sehen**
> Sterne, aktive Tage und Serien — alles lokal berechnet.

---

### Shot 6 — Schedule-Editor
**Screen:** `components/routine-stars/schedule-editor.tsx`, erreichbar über
"Einstellungen → Routinen bearbeiten" (`app/settings/routines.tsx`)

**Vorzubereitender Datenstand**
- Eine Routine (z. B. **"Hausaufgaben"**) im Bearbeiten-Modus.
- Wochentags-Chips: **Mo–Fr aktiv**, Sa/So inaktiv — das erklärt die Funktion
  ohne ein Wort Text. Preset-Chip "Wochentage" ist dadurch markiert.
- Uhrzeit gesetzt, z. B. **07:15 Uhr**.
- Erinnerungs-Schalter **an**, damit die Zusammenfassungszeile vollständig
  lesbar ist. Sie lautet dann exakt:
  **"Mo Di Mi Do Fr • 07:15 Uhr • Erinnerung an"**
  (`formatWeekdaySummary` in `lib/local-date.ts` reiht die Kürzel mit Leerzeichen
  aneinander; nur bei allen sieben Tagen steht dort "Täglich").
- Kein geöffneter Zeit-Picker im Bild (verdeckt die Chips).

**Caption-Vorschlag**
> **Passt sich eurer Woche an**
> Wochentage, Startzeit und Erinnerung — direkt auf dem Gerät.

---

## 4. Reihenfolge und Alternativen

**Empfohlene Store-Reihenfolge:** 1 Dashboard → 2 Erfolgsmoment → 3 Belohnungen →
4 Sticker → 5 Statistiken → 6 Schedule.

Begründung: Die ersten beiden Bilder verkaufen an das **Kind-Erlebnis** (das ist
die emotionale Klammer), Bild 3 und 4 zeigen den Sammel- und Zielmechanismus,
Bild 5 und 6 holen die **Eltern** ab, die den Download tatsächlich auslösen.

**Reserve-Motive**, falls ein Shot im finalen Design nicht trägt:
- Kinderprofil-Auswahl im Header (Mehr-Kind-Fähigkeit)
- Timer-Modal mit laufendem Ring und Bonus-Stern-Hinweis
- Monatskalender aus `app/settings/progress.tsx`
- Eltern-Bereich mit "Alles bleibt auf diesem Gerät" (Datenschutz als Argument)

---

## 5. Checkliste vor dem Upload

- [ ] Alle Bilder exakt 1320 × 2868 px (mit `sips` gegengeprüft, nicht geschätzt)
- [ ] Statusleiste auf allen Bildern identisch (9:41, voller Akku, voller Empfang)
- [ ] Kein echtes Kinderfoto, kein Klarname einer realen Person
- [ ] Keine Platzhalter im Bild (`[Name]`, "Lorem", "Test 123")
- [ ] Keine Debug-Elemente, kein Expo-Dev-Menü, kein Red Box
- [ ] Kein Feature abgebildet, das es nicht gibt (Guideline 2.3.3)
- [ ] Sternstände, Kindernamen und Datum über alle sechs Bilder konsistent
- [ ] `ios.supportsTablet` steht weiterhin auf `false` — sonst wird zusätzlich ein 13"-iPad-Set fällig

---

## Offene Nutzeraktionen aus diesem Dokument

1. Kindernamen für die Screenshots freigeben (Vorschlag: Mia und Jonas — frei erfunden, keine reale Person).
2. Entscheiden, ob die Screenshots reine Gerätebilder bleiben oder Text-Overlays bekommen (beeinflusst den Aufwand in Phase 6 erheblich).
3. Bestätigen, dass es bei `ios.supportsTablet: false` bleibt — die iPad-Entscheidung fällt vor Phase 6, nicht danach.
