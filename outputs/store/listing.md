# App-Store-Listing — Routine Stars (de-DE)

Primäre Locale: **Deutsch (Deutschland)**
Bundle ID: `com.routinestars.app`
Version: `1.0.0` (aus `app.json`)

Alle Zeichenzahlen unten wurden gezählt (Skript, UTF-8-Zeichen, Umlaute = 1 Zeichen).
Jede Feature-Behauptung ist gegen den Code geprüft — Herkunft steht in
`## Feature-Nachweis` am Ende.

---

## 1. App-Name (Limit 30)

```
Routine Stars
```

**13 / 30 Zeichen.**

Keine Zusätze wie "Routine Stars — Kinder-Routinen". Begründung: der Name ist auch
der Home-Screen-Name (`app.json` → `expo.name`), er muss zum Icon-Label passen, und
Apple bewertet Keyword-Stuffing im Namen negativ. Die Suchbegriffe stehen im
Untertitel und im Keyword-Feld.

---

## 2. Untertitel (Limit 30)

**Empfehlung:**

```
Kinder-Alltag ohne Diskussion
```

**29 / 30 Zeichen.**

Benefit-led: benennt die Zielgruppe (Kinder) und das Elternversprechen
(weniger Diskussion), nicht die Mechanik. Der Name liefert bereits
"Routine" + "Stars", der Untertitel ergänzt "Kinder" + "Alltag" — beide Felder
werden von Apple gemeinsam indexiert, also keine Wortdopplung.

**Alternativen (falls der Ton zu hart wirkt):**

| Variante | Zeichen | Charakter |
|---|---|---|
| `Der Sterne-Plan für Kinder` | 26 | neutral, beschreibend |
| `Alltag wird zum Sternenspiel` | 28 | warm, kindorientiert |
| `Routinen, Sterne, Belohnungen` | 29 | rein deskriptiv, schwächster Benefit |
| `Kinderroutinen ohne Nörgeln` | 27 | umgangssprachlicher als die Empfehlung |

Wenn eine Alternative gewählt wird: Keywords gegenprüfen, damit sich keine
Wörter doppeln (siehe Abschnitt 5).

---

## 3. Promotional Text (Limit 170)

Ohne neue Review änderbar — daher bewusst kampagnentauglich formuliert.

```
Kein Konto, keine Werbung, kein Tracking: Routine Stars bleibt ganz auf eurem Gerät. Routinen anlegen, Sterne sammeln, Sticker freischalten — und morgens ruhiger werden.
```

**169 / 170 Zeichen.** ✅

(Die naheliegendere Formulierung "… bleibt **komplett** auf eurem Gerät …" liegt
mit 173 Zeichen knapp über dem Limit — daher "ganz" statt "komplett".)

---

## 4. Beschreibung (Limit 4000)

**2 796 / 4000 Zeichen.** ✅ (inkl. Zeilenumbrüchen)

```
Routine Stars macht aus Morgen-, Schul- und Abendabläufen ein kleines Erfolgsspiel. Kinder sehen, was als Nächstes dran ist, haken es selbst ab und sammeln dafür Sterne. Eltern müssen weniger erinnern und behalten trotzdem den Überblick.

Alles bleibt auf dem Gerät. Kein Konto, keine Anmeldung, keine Werbung, kein Tracking.

ROUTINEN, DIE ZUM FAMILIENALLTAG PASSEN
• Routinen aus Vorlagen übernehmen oder frei zusammenstellen
• Jede Aufgabe bekommt ein eigenes Symbol und einen eigenen Sternwert
• Wochentage frei wählen: täglich, nur Wochentage, nur Wochenende oder einzelne Tage
• Optionale Startzeit mit lokaler Erinnerung, die direkt auf dem Gerät entsteht

STERNE, DIE SICHTBAR WERDEN
• Jede erledigte Aufgabe schickt einen Stern quer über den Bildschirm ins Sternenkonto
• Aufgaben lassen sich zurücknehmen, die Sterne werden dabei sauber wieder abgezogen
• Im Elternbereich sind Sterne korrigierbar, mit Grund und nachvollziehbarem Eintrag

BELOHNUNGEN MIT ECHTEM ZIEL
• 47 Vorschläge in 7 Kategorien, von Hörspiel hören bis Familien-Spieleabend
• Oder eigene Belohnungen mit frei gewähltem Sternpreis anlegen
• Kinder sehen sofort, wie weit die nächste Belohnung noch entfernt ist
• Einlösen zieht die Sterne ab und feiert den Moment

STICKER-SAMMLUNG
• 98 Sticker in 11 Themenwelten: Tierfreunde, Weltraum, Magie, Fahrzeuge, Natur, Helden, Essen, Musik, Sport, Meer und Gute Nacht
• Ein neuer Sticker nach jeder abgeschlossenen Routine, wahlweise erst am Ende des ganzen Tages
• Das Kind sucht sich selbst aus, welcher Sticker ins Album wandert

AUFGABEN MIT TIMER
• Zähneputzen, Aufräumen, Üben: Aufgaben mit Timer laufen sichtbar mit
• Wer durchhält, bekommt Bonus-Sterne obendrauf
• Am Ende bestätigt der Eltern-Check, damit die Bonus-Sterne echt bleiben

ÜBERBLICK FÜR ELTERN
• Statistiken zu Sternen, erledigten Aufgaben, aktiven Tagen und Serien
• Monatskalender zeigt, an welchen Tagen etwas geschafft wurde
• Bester Tag und letzter Fortschritt auf einen Blick

FÜR MEHRERE KINDER
• Eigene Profile mit Name, Altersgruppe, Avatar und Farbwelt
• Foto-Avatar optional; das Bild bleibt in der App auf dem Gerät
• Eigene Hintergrund-Motive pro Kind

ELTERNBEREICH GESCHÜTZT
• Vierstelliger Eltern-PIN, sicher im Schlüsselbund des Geräts hinterlegt
• Vor der ersten PIN-Vergabe steht eine ausgeschriebene Rechenaufgabe
• Nach mehreren Fehlversuchen legt die Eingabe eine Pause ein

EURE DATEN BLEIBEN EURE
• Kein Konto, keine Registrierung, keine Cloud-Synchronisierung
• Kein Analyse-Werkzeug, keine Werbung, keine Weitergabe an Dritte
• Datenexport als JSON-Datei, nur wenn ihr ihn selbst startet
• "Alles zurücksetzen" löscht sämtliche Daten und Fotos vom Gerät

Datenschutzerklärung, Nutzungsbedingungen und Impressum stehen vollständig in der App.

Routine Stars ist auf Deutsch.
```

### Was bewusst NICHT in der Beschreibung steht

| Nicht erwähnt | Grund |
|---|---|
| iCloud-/Geräte-Sync | existiert nicht |
| Premium, Abo, In-App-Käufe | kein Kauf-Code im Projekt; die Nutzungsbedingungen erwähnen zwar *geplante* Premium-Funktionen (`lib/legal-content.ts:160`), das ist aber kein auslieferbares Feature |
| "wissenschaftlich belegt", ADHS, Therapie | Gesundheitsversprechen, nicht belegbar, Review-Risiko |
| Android-/Web-Version | nicht Gegenstand dieser Einreichung |
| Sprachausgabe, KI-Vorschläge | nicht vorhanden (die Aufgabenvorschläge sind eine statische Liste) |
| Familienfreigabe / mehrere Geräte | nicht vorhanden, Daten sind gerätelokal |

---

## 5. Keywords (Limit 100 Zeichen inkl. Kommas)

```
sterne,belohnung,aufgaben,morgenroutine,abendroutine,tagesplan,familie,eltern,sticker,kita,erziehung
```

**100 / 100 Zeichen.** ✅

Regeln, die dabei eingehalten wurden:
- Keine Leerzeichen nach den Kommas (jedes Leerzeichen kostet ein Zeichen).
- Keine Wiederholung von Wörtern aus App-Name und Untertitel — Apple indexiert
  Name + Untertitel + Keywords gemeinsam. Bereits abgedeckt und deshalb hier
  nicht mehr enthalten: `routine`, `stars`, `kinder`, `alltag`.
- Keine Kategorienamen ("Bildung", "Lifestyle") — die kommen aus der Kategorie.
- Keine Konkurrenz-Markennamen.
- Singular, weil Apple im Deutschen kaum stemmt; Komposita stehen ausgeschrieben
  (`morgenroutine`), weil genau so gesucht wird.

**Reserve-Set** (falls ein anderer Untertitel gewählt wird und `kinder` frei wird):

```
sterne,belohnung,aufgaben,morgenroutine,abendroutine,tagesplan,familie,eltern,sticker,kind,plan
```
**95 / 100 Zeichen.**

**Nicht verwendete, aber notierte Kandidaten** für spätere ASO-Iterationen:
`wochenplan`, `checkliste`, `struktur`, `motivation`, `schulkind`, `vorschule`,
`hausaufgaben`, `zähneputzen`, `selbstständig`, `punkte`, `offline`.
ASO ist iterativ: nach 4–6 Wochen anhand der App-Analytics-Suchbegriffe tauschen.

---

## 6. URLs

| Feld | Wert | Status |
|---|---|---|
| Datenschutz-URL (Pflicht) | `https://routinestars.app/privacy` | ✅ HTML liegt in `outputs/legal-site/privacy.html` — muss nur noch gehostet werden |
| Support-URL (Pflicht) | `https://routinestars.app/imprint` | ⚠️ siehe Hinweis unten |
| Marketing-URL (optional) | `https://routinestars.app` | ✅ `outputs/legal-site/index.html` |

Die App verlinkt bereits fest auf diese Domain (`app/settings/legal.tsx`):
`https://routinestars.app/privacy`, `/terms`, `/imprint` sowie
`mailto:support@routinestars.app`.
**Konsequenz:** Diese vier Ziele müssen zum Release live sein, sonst laufen die
In-App-Links ins Leere — ein eigenständiger Rejection-Grund
(Guideline 2.1, "broken links").

**Zum Support-URL-Feld:** Die von WP5.4 gelieferte Seitensammlung
(`outputs/legal-site/`) enthält `index.html`, `privacy.html`, `terms.html` und
`imprint.html` — **aber keine `/support`-Seite**. Zwei Wege:

- **Minimal (empfohlen für 1.0):** `https://routinestars.app/imprint` als
  Support-URL eintragen. Das Impressum enthält nach dem Füllen der Platzhalter
  Name, Adresse und E-Mail — Apple akzeptiert eine Kontaktseite als Support-Ziel.
- **Sauberer:** eine kleine `/support`-Seite ergänzen (Kontakt-E-Mail, ein paar
  häufige Fragen, Hinweis auf die vollständigen Rechtstexte in der App). Dann
  `https://routinestars.app/support` eintragen.

Solange die Domain `routinestars.app` nicht existiert, funktioniert für das
Datenschutz-Pflichtfeld auch eine kostenlose Hosting-URL (GitHub Pages, Netlify).
Die **In-App-Links** zeigen jedoch fest auf `routinestars.app` — für sie hilft nur
die echte Domain oder eine Änderung in `app/settings/legal.tsx`. Details dazu in
`outputs/legal-site/README.md` (WP5.4).

---

## 7. Copyright-Zeile

App Store Connect erwartet das Format `Jahr Rechteinhaber` (ohne "©", Apple setzt
das Zeichen selbst).

```
2026 [Name]
```

⚠️ **Nutzeraktion:** `[Name]` durch den echten Rechteinhaber ersetzen — identisch
mit dem Verantwortlichen im Impressum (`lib/legal-content.ts`, Platzhalter
`legalPlaceholders.name`). Hier wird bewusst kein Name erfunden.

---

## 8. Kategorien

| Feld | Empfehlung | Begründung |
|---|---|---|
| Primäre Kategorie | **Bildung** (Education) | Der Kern ist Selbstständigkeit und Alltagsstruktur; die Kategorie ist für Routine-/Belohnungs-Apps für Kinder die übliche und wettbewerbsfähigste. |
| Sekundäre Kategorie | **Produktivität** (Productivity) | Zweitrelevant über den Eltern-Nutzen (Planung, Wochentage, Erinnerungen). |

Alternative, falls die Positionierung stärker Richtung Eltern gehen soll:
primär **Produktivität**, sekundär **Bildung**. Nicht empfohlen: "Lifestyle"
(kaum Suchvolumen für dieses Thema).

> ❗ **Wichtig:** Die Kategorie "Kinder" (Kids) wird **bewusst nicht** gewählt.
> Begründung in `age-rating.md`.

---

## 9. "Neue Funktionen" (What's New) — Version 1.0.0

Bei einer Erstveröffentlichung ist das Feld optional; App Store Connect zeigt
stattdessen die Beschreibung. Falls es dennoch befüllt werden soll:

```
Erste Version von Routine Stars.
```

---

## Feature-Nachweis

Jede in Untertitel, Promotional Text und Beschreibung aufgestellte Behauptung,
mit der Codestelle, die sie belegt.

| Behauptung | Nachweis |
|---|---|
| Routinen aus Vorlagen | `lib/routine-templates.ts` — 15 Vorlagen in den Kategorien hygiene, school, household, meals, sport, evening, weekend, special |
| Eigenes Symbol + Sternwert je Aufgabe | `lib/types.ts` → `Task { iconName, stars }`; `components/ui/icon-picker.tsx` |
| Wochentage frei wählbar, inkl. Presets | `components/routine-stars/schedule-editor.tsx` — Presets "Täglich", "Wochentage", "Wochenende" + Einzelchips Mo–So |
| Optionale Startzeit | `Schedule.time` als `"HH:mm"`; Zeitwahl über `@react-native-community/datetimepicker` |
| Lokale Erinnerung, kein Server | `lib/notifications.ts` — Modulkommentar: "Everything here is LOCAL scheduling — no push server, no token, no network"; ein wöchentlich wiederholender Trigger je (Routine × Wochentag) |
| Stern fliegt in den Zähler | `components/routine-stars/star-flight.tsx` + `app/(tabs)/index.tsx` (`launchStarFlight`, Bezier-Bogen ins Header-Pill) |
| Aufgabe zurücknehmen, Sterne zurück | `app/(tabs)/index.tsx:1114` — Dialog "Aufgabe zurücknehmen?" / "Die Sterne werden wieder abgezogen." |
| Sternkorrektur mit Grund + Eintrag | `app/settings/children.tsx` — ±1/±5, Deckel 50 je Korrektur, Gründe "Bonus", "Ausgleich", "Versehen korrigiert", "Sonstiges", Log-Eintrag `Sterne angepasst: …` |
| **47 Belohnungsvorschläge in 7 Kategorien** | `lib/reward-suggestions.ts` — `rewardSuggestions` (47 Einträge, gezählt) und `rewardCategories` (7: Bildschirmzeit, Aktivitäten, Leckereien, Privilegien, Soziales, Materielles, Besonderes). Eingebunden in `app/settings/rewards.tsx`; genannte Beispiele "Hörspiel hören" und "Familien-Spieleabend" sind wörtliche Titel aus dieser Datei |
| Eigene Belohnungen mit freiem Sternpreis | `app/settings/rewards.tsx` — Titel und `cost` frei eingebbar, gespeichert unter `KEYS.CUSTOM_REWARDS` |
| Belohnungen mit Sternpreis, Einlösen zieht ab | `lib/types.ts` → `Reward { title, cost, iconName }`; `app/(tabs)/rewards.tsx` → `deductStars(child.id, reward.cost)` + Toast "Belohnung eingelöst!" |
| Fortschritt zur nächsten Belohnung sichtbar | `app/(tabs)/rewards.tsx` — `nextReward`-Karte |
| **98 Sticker** | `lib/animal-stickers.ts` (48 Einträge) + `lib/generated-stickers-v4.ts` (`V4_STICKERS`, 50 Einträge) = 98, zusammengeführt in `STICKER_CATALOG` |
| **11 Themenwelten** | `lib/types.ts` → `StickerThemeWorld`; Labels in `getStickerThemeWorldLabel()`: Tierfreunde (10), Weltraum (4), Gute Nacht (4), Magie (10), Fahrzeuge (10), Natur (10), Essen (10), Helden (10), Musik (10), Meer (10), Sport (10) |
| Sticker je Routine ODER je Tag | `lib/sticker-reward-logic.ts` → `rewardMode: "routine_complete" \| "daily_complete"`; umschaltbar in `app/settings/stickers.tsx` |
| Kind wählt den Sticker selbst | `selectionMode: "child_choice"`; `components/stickers/sticker-reward-sheet.tsx` zeigt die Auswahl, `hooks/use-sticker-wall.ts` → `availableStickers` = alle noch nicht gesammelten. **Keine Zufallsziehung** (relevant für die Altersfreigabe) |
| Timer-Aufgaben | `lib/types.ts` → `Task.timerInMinutes`; `components/routine-stars/task-timer-modal.tsx` |
| Bonus-Sterne | `Task.bonusStars`; Anzeige "+N Bonus-Sterne!" im Timer-Modal |
| Eltern-Check am Timer-Ende | `task-timer-modal.tsx:895` → `<ParentGateChallenge title="Eltern-Check" …>` |
| Statistiken Sterne/Aufgaben/aktive Tage/Serie | `app/settings/stats.tsx` — Kacheln "Aus Aufgaben", "Aktivitäten", "Aktive Tage", "Serie" |
| Monatskalender | `app/settings/progress.tsx` — "Monatsfortschritt", Monatsnavigation |
| Bester Tag / letzter Fortschritt | `app/(tabs)/star-account.tsx` — `insights.bestDay`, `latestActivity`; Logik in `lib/activity-insights.ts` |
| Mehrere Kinderprofile | `hooks/use-children.ts`, `app/settings/children.tsx` (`addChild`) |
| Altersgruppe, Avatar, Farbwelt | `lib/types.ts` → `AgeGroup` (3-5, 6-8, 9-12), `AvatarValue`, `ChildTheme` (sterne, tiere, galaxy) |
| Foto-Avatar bleibt auf dem Gerät | `lib/avatar-photo-picker.ts` — Kopie nach `<documentDirectory>/avatar-photos/`, gespeichert als relativer Pfad |
| Hintergrund-Motive pro Kind | `lib/background-skins.ts` — none, space, animals, magic, nature, heroes; `app/settings/background.tsx` |
| Vierstelliger PIN im Schlüsselbund | `lib/parent-access.ts` — `PARENT_PIN_LENGTH = 4`, `expo-secure-store` (iOS Keychain), gesalzener SHA-256 mit 60 000 Iterationen |
| Rechenaufgabe vor erster PIN-Vergabe | `app/parent-login.tsx` — Step `"gate"` → `ParentGateChallenge`; `components/parent-gate-challenge.tsx` |
| Pause nach Fehlversuchen | `lib/parent-access.ts` — 5 Fehlversuche → 30 s Sperre, verdoppelnd bis max. 300 s; zusätzlich im Gate 3 Fehlversuche → 10 s |
| Kein Konto / keine Anmeldung | `lib/auth-flow.ts` — Kommentar: "there is no account, no sign-in and no server session"; Startroute hängt nur an lokal vorhandenen Kinderprofilen |
| Kein Netzwerk, kein Analytics, keine Werbung | Grep über `app/`, `lib/`, `components/`, `hooks/`, `contexts/`: keine Treffer für `fetch(`, `axios`, `XMLHttpRequest`, `WebSocket`, `firebase`, `sentry`, `amplitude`, `mixpanel`, `posthog`, `appsflyer`, `adjust`. `package.json` enthält kein Analytics-, Ad- oder Attributions-SDK |
| Keine In-App-Käufe | kein StoreKit-/IAP-/RevenueCat-Code, keine entsprechende Dependency |
| Datenexport als JSON, nutzerinitiiert | `lib/backup.ts` → `exportAppData()`, ausgelöst per Button in `app/settings/legal.tsx`; Datei geht in den Cache und wird nach dem Teilen gelöscht; **ohne** Avatar-Fotos und **ohne** PIN |
| "Alles zurücksetzen" löscht Daten + Fotos | `app/settings/account.tsx` → `resetAppData()` aus `lib/reset.ts`; Dialog "Alles zurücksetzen?" |
| Rechtstexte vollständig in der App | `lib/legal-content.ts` → `legalDocuments` (Datenschutzerklärung, Nutzungsbedingungen, Impressum), gerendert in `app/settings/legal.tsx` |
| App ist auf Deutsch | Sämtliche UI-Strings sind deutsch; keine i18n-Bibliothek, keine weitere Locale im Projekt |

---

## Offene Nutzeraktionen aus diesem Dokument

1. **Copyright-Rechteinhaber** festlegen und `[Name]` ersetzen (identisch mit dem Impressum).
2. **`https://routinestars.app`** mit den Pfaden `/`, `/privacy`, `/terms`, `/imprint` live stellen — die App verlinkt bereits darauf (HTML liegt in `outputs/legal-site/`).
3. **Support-URL entscheiden:** `/imprint` verwenden oder eine `/support`-Seite ergänzen.
4. **`mailto:support@routinestars.app`** als empfangsbereites Postfach einrichten (In-App-Link).
5. **Untertitel-Variante** bestätigen (Empfehlung: `Kinder-Alltag ohne Diskussion`) — bei Abweichung Keywords gegenprüfen.
6. **Kategorie** bestätigen (Empfehlung: Bildung / Produktivität).
