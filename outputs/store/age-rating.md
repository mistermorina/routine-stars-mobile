# Altersfreigabe — Fragebogen für App Store Connect

Pfad: **App Store Connect → Apps → Routine Stars → (Version) → Altersfreigabe / Age Rating → "Bearbeiten"**

**Zielergebnis: 4+ — und ausdrücklich NICHT die Kids Category.**

---

## 1. Inhaltsfragen — alle "Keine" / "None"

Apple hat den Fragebogen 2025 überarbeitet: die Häufigkeitsskala lautet jetzt
**Keine / Selten oder schwach / Häufig oder stark**
("None / Infrequent or Mild / Frequent or Intense"), und es gibt neue Fragen
zu Fähigkeiten und Kontrollen. Beide Fassungen sind unten abgedeckt, weil die
Oberfläche je nach Account-Rollout leicht abweichen kann.

| Kategorie | Antwort | Warum |
|---|---|---|
| Comic- oder Fantasy-Gewalt | **Keine** | Sticker-Motive sind Tiere, Fahrzeuge, Natur, Musik, Sport, Essen, Meer, "Helden" im Sinne von Cape/Schild/Medaille. Keine Waffen, kein Kampf, keine Konfliktdarstellung |
| Realistische Gewalt | **Keine** | — |
| Anhaltende, grafische oder sadistische realistische Gewalt | **Keine** | — |
| Vulgäre Sprache oder derber Humor | **Keine** | Sämtliche Texte sind kindgerechtes Deutsch |
| Anzügliche Themen / Themen für Erwachsene | **Keine** | — |
| Horror- oder Angstthemen | **Keine** | Warme Pastellfarben, ruhige Animationen, keine Schock- oder Fail-Momente. Auch bei Fehlern bleibt die Tonalität freundlich |
| Medizinische Informationen / Behandlungsinformationen | **Keine** | Zahnputz- und Hygiene-Aufgaben sind Alltagsroutinen, keine medizinischen Ratschläge. Es gibt keine Gesundheitsversprechen, keine Symptom- oder Therapietexte |
| Alkohol, Tabak, Drogen — Nutzung oder Erwähnung | **Keine** | — |
| Simuliertes Glücksspiel | **Keine** | ⚠️ siehe Abschnitt 3 — bewusste, begründete Antwort |
| Sexuelle Inhalte oder Nacktheit | **Keine** | — |
| Grafische sexuelle Inhalte und Nacktheit | **Keine** | — |
| Gewinnspiele / Wettbewerbe (Contests) | **Keine** | Es gibt keine Verlosung, keinen Preis, keine Bestenliste gegen andere Nutzer |

---

## 2. Fähigkeiten und Zugriff

| Frage | Antwort | Warum |
|---|---|---|
| **Uneingeschränkter Webzugriff** (Unrestricted Web Access) | **NEIN** | Die App hat keinen eingebauten Browser und kein WebView. Die einzigen externen Links stehen in "Einstellungen → Rechtliches" (`app/settings/legal.tsx`): drei feste Adressen auf `routinestars.app` plus eine `mailto:`-Adresse. Sie öffnen den System-Browser, sind nicht frei eingebbar — und liegen bereits **hinter dem Eltern-PIN**, weil der gesamte Einstellungsbereich PIN-geschützt ist (`app/settings/_layout.tsx`) |
| **Glücksspiel mit echtem Geld** (Gambling) | **NEIN** | Keine Wette, kein Einsatz, kein Geld irgendwo in der App |
| **Enthält Werbung** | **NEIN** | Kein Werbe-SDK, keine Hauswerbung, keine Cross-Promotion |
| **In-App-Käufe** | **NEIN** | Kein StoreKit-Code, keine IAP-Dependency |
| **Nutzergenerierte Inhalte, die andere sehen** | **NEIN** | Namen, Aufgaben und Fotos bleiben auf dem Gerät. Kein Upload, kein Feed, keine Moderation nötig |
| **Chat / Kommunikation zwischen Nutzern** | **NEIN** | Kein Messaging, kein Multiplayer, keine Freundesliste |
| **Standortzugriff / Standortfreigabe** | **NEIN** | Keine Location-API im Projekt |
| **Häufige oder starke Anreize zum Kauf** | **NEIN** | Es gibt nichts zu kaufen |
| **Kontrollen für Eltern vorhanden?** | **JA** | Eltern-PIN (vierstellig, im Schlüsselbund) plus vorgelagerte Rechenaufgabe — Details in `review-notes.md` |

---

## 3. Warum "Simuliertes Glücksspiel = Keine" belastbar ist

Bei Belohnungs-Apps für Kinder ist das die einzige Frage, die im Review Rückfragen
auslösen kann. Die Antwort hält stand, weil in der App **an keiner Stelle ein
Zufallselement über einen Gewinn entscheidet**:

- **Sterne** sind fest pro Aufgabe hinterlegt (`Task.stars`). Gleiche Aufgabe,
  gleiche Sternzahl — jedes Mal.
- **Bonus-Sterne** (`Task.bonusStars`) hängen ausschließlich daran, ob die
  Timer-Aufgabe durchgehalten und vom Eltern-Check bestätigt wurde.
- **Sticker** werden **nicht gezogen**. Nach einer abgeschlossenen Routine öffnet
  sich eine Auswahl, und das Kind **sucht sich einen Sticker selbst aus**
  (`selectionMode: "child_choice"` in `lib/sticker-reward-logic.ts`;
  `hooks/use-sticker-wall.ts` → `availableStickers` = alle noch nicht gesammelten
  Sticker). Es gibt **keine** Lootbox, **keinen** Zufallsgenerator, **keine**
  Seltenheits-Ziehung. Die `rarity`-Angabe an einem Sticker ist reine
  Anzeige-Beschriftung ("Normal", "Besonders", "Selten", "Episch") und beeinflusst
  die Verfügbarkeit nicht.
- **Belohnungen** kosten einen von den Eltern festgelegten Sternpreis
  (`Reward.cost`) und werden abgezogen — ein Tausch, keine Wette.
- Es gibt **kein** Glücksrad, **keine** Slot-Mechanik, **keine** Kartenpakete,
  **keine** virtuelle Währung, die mit echtem Geld erwerbbar wäre.

Falls das Review dennoch nachfragt, steht der Kernsatz in `review-notes.md`:
*"Stickers are chosen by the child from the remaining catalogue — there is no
random draw anywhere in the app."*

---

## 4. Made for Kids / Kids Category — bewusste Entscheidung: **NEIN**

Im Bereich **"Made for Kids" / Kids-Kategorie** wird der Schalter **nicht**
aktiviert und **keine** Altersspanne (5 und jünger / 6–8 / 9–11) gewählt.

Das ist eine bewusste Produktentscheidung, keine Nachlässigkeit:

1. **Die App richtet sich an die ganze Familie, nicht nur an das Kind.**
   Große Teile — Routinen anlegen, Wochentage und Uhrzeiten setzen, Belohnungen
   definieren, Statistiken lesen, PIN verwalten, Daten exportieren — sind
   ausdrücklich Elternfunktionen und liegen hinter dem PIN. Die Kids Category ist
   für Apps gedacht, deren **primäre** Zielgruppe Kinder sind. Ein Positionierungs-
   und Marketing-Argument, kein Compliance-Trick.
2. **Die Kids Category zieht dauerhafte Zusatzpflichten nach sich**
   (Guideline 1.3 und 5.1.4): strengere Prüfung bei jedem Update, verpflichtender
   Elternschutz vor Links und Käufen, engere Vorgaben für Analytik und Werbung
   Dritter, und ein separates Auffindbarkeits-Regime. Für eine kostenlose,
   werbefreie, komplett lokale App bringt das keinen Vorteil, aber laufende
   Reibung.
3. **Auffindbarkeit.** In der Kids Category konkurriert die App mit Spielen und
   Lern-Apps; die suchenden Personen sind aber **Eltern** ("Morgenroutine Kind",
   "Belohnungssystem"). Die reguläre Einstufung mit primärer Kategorie *Bildung*
   trifft diese Suche besser.
4. **Der Schutz ist trotzdem da.** Ohne Kids-Category-Pflicht setzt die App
   freiwillig auf ein echtes Erwachsenen-Gate: eine in Zahlwörtern ausgeschriebene
   zweistellige Additionsaufgabe mit Übertrag, mit Fehlversuchszähler und
   Abkühlphase (`components/parent-gate-challenge.tsx`). Es steht vor der ersten
   PIN-Vergabe, vor dem Profilwechsel und vor dem Eltern-Check am Timer-Ende.
   Alle externen Links liegen zusätzlich hinter dem PIN.

**Ergebnis: reguläre Einstufung, Altersfreigabe 4+.**

Konsequenz, die im Blick bleiben muss: Ohne Kids Category gelten für die App die
normalen Regeln. Sollte später Werbung oder Drittanbieter-Analytik einziehen,
wäre das zwar erlaubt, würde aber das Privacy-Label und die Beschreibung brechen —
siehe `privacy-nutrition.md`, Abschnitt 6.

---

## 5. Erwartetes Ergebnis

| Store | Erwartung |
|---|---|
| App Store (global) | **4+** |
| Deutschland (USK-Angleichung durch Apple) | ohne Altersbeschränkung |
| Brasilien / Korea / weitere regionale Systeme | Apple leitet aus 4+ ab; keine Sonderangaben nötig |

Sollte App Store Connect nach dem Absenden **nicht** 4+ zeigen, wurde eine der
Inhaltsfragen versehentlich auf "Selten oder schwach" gestellt — Fragebogen
erneut öffnen und alle Zeilen auf "Keine" prüfen.

---

## Offene Nutzeraktionen aus diesem Dokument

1. Entscheidung "keine Kids Category" bestätigen (sie ist nach der Veröffentlichung nur mit einem neuen Review änderbar).
2. Beim Ausfüllen darauf achten, dass **jede** Inhaltszeile aktiv auf "Keine" steht — App Store Connect lässt den Fragebogen nicht mit leeren Zeilen abschicken, füllt aber auch nichts automatisch vor.
