# Routine Stars — Release-Fahrplan (iOS)

Von „App ist fertig gebaut" zu „App ist im App Store". Chronologisch: die
Phasen bauen aufeinander auf, innerhalb einer Phase ist die Reihenfolge
gedacht, aber nicht immer zwingend.

**Legende**

| Symbol | Bedeutung |
|--------|-----------|
| 👤 | Nur der Betreiber kann das — Konten, Zahlungen, Rechtsangaben, Apple-Formulare |
| 🤖 | Kann ein Agent/Skript erledigen oder vorbereiten |
| 👤🤖 | Agent bereitet vor, Betreiber bestätigt/klickt |

**Zeitbudget grob**

| Phase | Aktive Arbeit | Wartezeit |
|-------|---------------|-----------|
| A — Konten | ~45 Min | 1–3 Tage (Apple-Prüfung) |
| B — Legal | ~1–2 Std | 0–24 Std (DNS, nur bei eigener Domain) |
| C — Builds | ~30 Min | 30–120 Min pro Build (EAS-Queue) |
| D — App Store Connect | ~3–4 Std | ~1 Std (Build-Processing) |
| E — Review | ~15 Min | 24 Std – 7 Tage |

Realistisch: **eine gute Woche** vom Start bis zur Freigabe, wenn nichts
zurückkommt.

---

## Ausgangslage (Stand: Phase 5)

Was bereits erledigt ist und **nicht** mehr auf dieser Liste steht:

- App ist feature-complete, motion-poliert, Token-konsistent (Phasen 0–4).
- Rechtstexte existieren auf Deutsch in `lib/legal-content.ts` und werden in
  der App unter *Einstellungen → Rechtliches* angezeigt.
- `expo-notifications`, `expo-secure-store` und
  `@react-native-community/datetimepicker` sind als Config-Plugins in
  `app.json` verdrahtet.
- Icon und Splash liegen in `assets/`.
- Testsuite: `npm run test:all` (Typecheck, Lint, UI-Quality, Kontrast,
  Background-Skins, Modal-Order, Tages-Progress, Onboarding).

---

## PHASE A — Konten und Zugänge (einmalig)

Kann parallel zu Phase B laufen. **Zuerst starten**, weil die Apple-Prüfung
Tage dauern kann und alles andere blockiert.

### ☐ A1 — Apple Developer Program beitreten

**Wer:** 👤 · **Dauer:** 20 Min Formular + 24–48 Std Prüfung (kann länger dauern)

1. Apple ID vorbereiten: [appleid.apple.com](https://appleid.apple.com) →
   **Zwei-Faktor-Authentifizierung aktivieren** (ohne 2FA geht gar nichts).
2. [developer.apple.com/programs/enroll](https://developer.apple.com/programs/enroll/)
   → Enrollment starten.
3. Entity Type wählen:
   - **Individual / Sole Proprietor** — schnell, keine D-U-N-S-Nummer nötig.
   - **Organization** — braucht eine **D-U-N-S-Nummer**; die zu beantragen
     dauert allein 5–14 Werktage.
4. Bezahlen: **99 € / Jahr**, Verlängerung automatisch.
5. Identitätsprüfung abwarten. Apple ruft in Einzelfällen an oder fordert
   einen Ausweis-Scan an.

**Stolperfallen**

- ⚠️ **Der Entity Type bestimmt den Verkäufernamen im Store.** Als *Individual*
  erscheint der **bürgerliche Name** öffentlich als Anbieter. Das ist dieselbe
  Entscheidung wie beim Impressum (Phase B) — einmal überlegen, dann konsistent
  durchziehen.
- ⚠️ Die verwendete Apple ID ist später schwer wechselbar. Eine dauerhaft
  erreichbare Adresse nehmen, keine Wegwerf-Adresse.
- ⚠️ Nicht die private iCloud-Familien-Apple-ID eines Kindes verwenden.

### ☐ A2 — Expo-Account und `eas-cli`

**Wer:** 👤 (Account) / 🤖 (Installation) · **Dauer:** 10 Min · **Kosten:** 0 €

```bash
npm install -g eas-cli      # oder ohne Installation: npx eas-cli@latest <cmd>
eas login                   # Account ggf. vorher auf expo.dev anlegen
eas whoami                  # muss den Usernamen ausgeben
```

**Stolperfallen**

- ⚠️ Der **Free-Tier** hat eine gemeinsame Build-Queue: Wartezeiten von
  30–120 Minuten sind normal, in Stoßzeiten mehr. Für einen einzelnen Release
  reicht das völlig — nur nicht am Abgabetag zum ersten Mal ausprobieren.
- ⚠️ Node-Version: `.nvmrc` im Repo beachten (`nvm use`), sonst weicht die
  lokale Umgebung vom Build ab.

### ☐ A3 — `eas init` im Projekt

**Wer:** 👤🤖 · **Dauer:** 5 Min

```bash
cd <repo-root>
eas init
```

Legt das Projekt auf expo.dev an und schreibt die Projekt-ID in `app.json`:

```json
"extra": { "eas": { "projectId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" } }
```

- ☐ **Diese Änderung committen.** Ohne die `projectId` im Repo baut kein
  anderer Rechner und kein CI dasselbe Projekt.
- ☐ `eas.json` prüfen (siehe Cross-Check am Ende) — Profile:
  `development-simulator`, `preview`, `production`.

**Stolperfalle:** ⚠️ `eas init` fragt nach dem Account/Owner. Wird versehentlich
ein anderer Account gewählt, hängt das Projekt dort fest; korrigierbar nur über
`extra.eas.projectId` löschen und neu initialisieren.

---

## PHASE B — Rechtstexte und Legal-Site

Blockiert Phase D (App Store Connect verlangt eine Privacy-Policy-URL).
Kann sofort starten, unabhängig von Phase A.

### ☐ B1 — Platzhalter in `lib/legal-content.ts` füllen

**Wer:** 👤 (Inhalt) / 🤖 (Einbau) · **Dauer:** 30 Min + Bedenkzeit

Zu ersetzen: `[Name]`, `[Adresse]`, `[E-Mail]` — sie stehen bewusst sichtbar im
Text, es wurde **keine Anschrift erfunden**.

Nach dem Ersetzen zusätzlich:

- ☐ `hasPlaceholders: true` bei allen drei Dokumenten entfernen (blendet den
  gelben Hinweis in der App aus)
- ☐ Abschnitt **„Noch auszufüllen"** aus dem `impressum`-Array löschen
- ☐ `TODO(betreiber)`-Kommentar im Dateikopf löschen
- ☐ `legalLastUpdated` auf den echten Veröffentlichungsmonat setzen

**Stolperfallen**

- ⚠️ **Impressumspflicht:** eine **ladungsfähige Anschrift** ist Pflicht
  (§ 5 DDG), ein Postfach genügt nicht. Wer die Privatadresse nicht
  veröffentlichen will, braucht eine ladungsfähige Geschäftsadresse. Das ist
  eine Entscheidung mit Kosten — nicht erst am Einreichungstag angehen.
- ⚠️ Die Kontakt-E-Mail muss echt und erreichbar sein: sowohl Nutzer als auch
  Apple schreiben dorthin.
- ⚠️ Texte in `lib/legal-content.ts` sind **im Binary** — jede spätere Änderung
  braucht einen neuen Build und ein neues Review. Die Web-Version (B2) lässt
  sich dagegen jederzeit aktualisieren.

### ☐ B2 — Dieselben Platzhalter in `outputs/legal-site/*.html` füllen

**Wer:** 👤🤖 · **Dauer:** 15 Min

Anleitung Schritt 0 in `outputs/legal-site/README.md`. Prüfbefehl:

```bash
grep -rn "\[Name\]\|\[Adresse\]\|\[E-Mail\]" outputs/legal-site/*.html lib/legal-content.ts
```

Muss am Ende **leer** sein.

**Stolperfalle:** ⚠️ App-Text und Web-Text müssen identisch bleiben. Zwei
Fassungen desselben Dokuments, die sich unterscheiden, sind ein echtes
Rechtsrisiko — nicht nur Kosmetik.

### ☐ B3 — Legal-Site veröffentlichen

**Wer:** 👤 · **Dauer:** 15 Min (GitHub Pages) bis 2 Std (eigene Domain + DNS)

Vollständige Anleitung: `outputs/legal-site/README.md`
(Option A GitHub Pages, Option B beliebiger Static Host).

- ☐ Saubere URLs `/privacy`, `/terms`, `/imprint` sicherstellen
  (Ordner-Trick in README A3) — die App verlinkt ohne `.html`.

### ☐ B4 — URLs testen

**Wer:** 👤 · **Dauer:** 5 Min

- ☐ `/privacy`, `/terms`, `/imprint` im **Privatfenster** öffnen (kein Login,
  keine Fehlerseite)
- ☐ Einmal vom Handy im **Mobilfunknetz** öffnen (nicht nur im WLAN)
- ☐ `https` funktioniert, kein Zertifikatswarnhinweis
- ☐ URLs notieren — sie werden in Phase D eingetragen

### ☐ B5 — Entscheidung: eigene Domain oder `github.io`?

**Wer:** 👤 · **Dauer:** 10 Min Entscheidung

Die App verlinkt fest auf `https://routinestars.app/privacy|terms|imprint`
(`app/settings/legal.tsx`). Zwei saubere Wege:

- **Domain vor dem Production-Build aufsetzen** (Phase C) → nichts zu ändern.
- **Ohne Domain releasen** → die vier URLs in `app/settings/legal.tsx` auf die
  tatsächliche Adresse ändern, **bevor** gebaut wird.

⚠️ **Nicht offenlassen.** Tote Links in der ausgelieferten App sind der
häufigste vermeidbare Review-Rückläufer und lassen sich nur mit einem neuen
Build reparieren. Für App Store Connect selbst genügt jede erreichbare URL —
auch `username.github.io/...`.

---

## PHASE C — Builds

Setzt Phase A voraus (Apple-Account aktiv, `eas init` gelaufen).

### ☐ C0 — Build-Vorbereitung

**Wer:** 🤖 · **Dauer:** 20 Min

- ☐ `npm run test:all` grün
- ☐ `npx expo-doctor` ohne kritische Befunde
- ☐ **`.easignore` prüfen** — `assets/review/` (96 MB) und
  `assets/sticker-masters/` (55 MB) sind bewusst im Git, dürfen aber **nicht
  ins Binary**. Ohne `.easignore` gehen 151 MB in jeden Upload und die App wird
  unnötig groß. Die Datei existiert (Phase 5) und schließt beide Ordner aus.
  Gegenprobe nach dem Build: **App-Größe deutlich unter 100 MB.**
  ⚠️ `.easignore` ersetzt `.gitignore` vollständig — wird `.gitignore` ergänzt,
  muss der obere Block in `.easignore` mitgezogen werden (steht als Kommentar
  in der Datei).
- ☐ `version` = `1.0.0`, `ios.buildNumber` = `"1"` (beides gesetzt)
- ☐ Bundle Identifier `com.routinestars.app` — muss zu Phase D passen

⚠️ **Build-Nummern werden nicht automatisch hochgezählt.** `eas.json` steht auf
`cli.appVersionSource: "local"` und `production.autoIncrement: false` — die
Nummer kommt also ausschließlich aus `app.json`. **Vor jedem weiteren Upload
`ios.buildNumber` von Hand erhöhen** (`"1"` → `"2"` → …), sonst weist App Store
Connect den Upload ab. Das ist Absicht: so steht die ausgelieferte Build-Nummer
nachvollziehbar im Repo statt in einem Server-Zähler.

### ☐ C1 — Simulator-Build (Verifikation)

**Wer:** 👤🤖 · **Dauer:** 5 Min Start + 30–90 Min Queue

```bash
eas build --platform ios --profile development-simulator
```

Das ist der **erste** Build, weil er ohne Apple-Signierung auskommt und genau
das prüft, was in Expo Go nicht prüfbar ist:

- ☐ **App-Icon** erscheint nativ auf dem Homescreen (nicht das Expo-Icon)
- ☐ **Splash Screen** über das `expo-splash-screen`-Plugin mit
  `#F8E9D7`-Hintergrund, kein weißes Aufblitzen
- ☐ **Benachrichtigungen** (`expo-notifications`) — Permission-Dialog auf
  Deutsch, geplante Erinnerung wird ausgelöst
- ☐ **SecureStore** — Eltern-PIN übersteht einen App-Neustart
- ☐ **DateTimePicker** — nativer Picker öffnet sich
- ☐ **Foto-Avatar** — Permission-Text erscheint wörtlich wie in
  `locales/de.json` (`NSPhotoLibraryUsageDescription`)
- ☐ **App-Name unter dem Icon** = „Routine Stars" (`CFBundleDisplayName` aus
  `locales/de.json`); Simulator-Sprache dafür auf Deutsch stellen

Installation: `.tar.gz` von der EAS-Seite laden, entpacken, in den laufenden
Simulator ziehen (oder `eas build:run -p ios`).

➡️ **Diese Verifikation ist Aufgabe von Phase 6 (Release-Candidate-QA).**

**Stolperfallen**

- ⚠️ Der Simulator-Build ist **nicht** einreichbar — er läuft ausschließlich im
  Simulator, nie auf einem echten Gerät.
- ⚠️ Benachrichtigungen im Simulator sind nur ein Vorabtest. Der belastbare
  Test läuft in Phase D auf echter Hardware.

### ☐ C2 — Production-Build

**Wer:** 👤 (Credentials-Prompts) · **Dauer:** 10 Min Interaktion + 30–120 Min Queue

```bash
eas build --platform ios --profile production
```

Beim ersten Mal fragt EAS nach den Credentials:

| Frage | Empfohlene Antwort |
|-------|--------------------|
| „Do you want EAS to handle your credentials?" | **Ja** — EAS erzeugt und verwaltet Distribution Certificate und Provisioning Profile |
| Apple-Login | Apple ID aus A1, mit 2FA-Code |
| Bundle Identifier registrieren | **Ja** — legt `com.routinestars.app` im Developer-Portal an |
| Push-Notification-Key erstellen | **Nein** — die App nutzt nur **lokale** Benachrichtigungen, kein APNs/Push-Server |

**Stolperfallen**

- ⚠️ **Managed Signing nehmen.** Manuelle Zertifikate sind die häufigste
  Fehlerquelle bei Erst-Releases. Wer schon Zertifikate hat: `eas credentials`
  zum Prüfen, nicht raten.
- ⚠️ Der 2FA-Code läuft schnell ab — Handy bereithalten, sonst muss der ganze
  Prompt-Durchlauf neu.
- ⚠️ Ein Apple-Account darf nur begrenzt viele Distribution Certificates haben.
  Bei „maximum number of certificates" alte im Developer-Portal widerrufen.
- ⚠️ Build-Nummer: jeder Upload zu App Store Connect braucht eine **höhere**
  `buildNumber` als alle vorherigen. Doppelte Nummer = Ablehnung beim Upload,
  nicht erst im Review.

---

## PHASE D — App Store Connect

Setzt C2 (fertiger Production-Build) und B4 (erreichbare URLs) voraus.

### ☐ D1 — App-Record anlegen

**Wer:** 👤 · **Dauer:** 20 Min

[appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → **+**

- Plattform: iOS · Name: **Routine Stars** · Primärsprache: **Deutsch**
- Bundle ID: `com.routinestars.app` (erscheint erst, nachdem C2 sie registriert hat)
- SKU: frei wählbar, z. B. `routinestars-ios-001`

➡️ **Fertige Metadaten zum Kopieren: `outputs/store/listing.md`**
(Name, Untertitel, Beschreibung, Keywords, Was-ist-neu — alle mit geprüfter
Zeichenzahl).
➡️ **Feld-für-Feld-Ablauf in App Store Connect: `outputs/store/checklist-connect.md`**

**Stolperfallen**

- ⚠️ Der **App-Name ist reserviert, sobald er eingetragen ist** — und
  weltweit eindeutig. Ist „Routine Stars" vergeben, sofort eine Alternative
  festlegen; das zieht sich durch Screenshots und Beschreibung.
- ⚠️ Primärsprache **Deutsch** setzen. Steht dort Englisch, erwartet Apple
  englische Metadaten und Screenshots.
- ⚠️ Kategorie: primär **Bildung**, sekundär **Produktivität** (Begründung und
  Alternative in `outputs/store/listing.md`, Abschnitt 8). „Lifestyle" ist dort
  ausdrücklich **nicht** empfohlen — zu wenig Suchvolumen für dieses Thema. Und
  auf keinen Fall „Kids": siehe „Bewusste Entscheidungen" am Ende.

### ☐ D2 — Screenshots hochladen

**Wer:** 👤🤖 · **Dauer:** 1–2 Std

➡️ **Motive, Geräteklassen und Reihenfolge: `outputs/store/screenshots-plan.md`**

- ☐ iPhone-Set in der von Apple geforderten Größe (aktuelle Anforderung im
  Upload-Dialog gegenprüfen, sie ändert sich zwischen iOS-Generationen)
- ☐ **Kein iPad-Set nötig**, solange `supportsTablet: false` bleibt
- ☐ Screenshots zeigen echte Inhalte, keine Platzhalter, keine Lorem-Namen

**Stolperfallen**

- ⚠️ Screenshots mit Statusleiste voller Debug-Anzeigen oder „Expo Go"-Branding
  werden abgelehnt.
- ⚠️ Reine Marketing-Grafiken ohne erkennbare App-UI sind ein Ablehnungsgrund.
- ⚠️ Deutsche UI-Sprache in den Screenshots — sie müssen zur Primärsprache passen.

### ☐ D3 — Build zuordnen

**Wer:** 👤 · **Dauer:** 5 Min + ~1 Std Processing

- ☐ Nach `eas submit --platform ios --profile production` (oder Upload über
  Transporter) erscheint der Build unter **TestFlight**
- ☐ **Export-Compliance-Frage** — sollte **nicht mehr gestellt werden**:
  `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` steht in `app.json` und
  landet im Binary. Korrekt, weil die App nur Standard-Verschlüsselung des
  Betriebssystems nutzt (Keychain/SecureStore). Erscheint die Frage trotzdem:
  **keine nicht-exemptierte Verschlüsselung**.
- ☐ Build in der Version-Ansicht auswählen

**Stolperfalle:** ⚠️ Processing dauert nach dem Upload noch 15–60 Minuten. Vorher
ist der Build nirgends auswählbar — das ist kein Fehler, nur Wartezeit.

### ☐ D4 — TestFlight auf **echtem Gerät**

**Wer:** 👤 · **Dauer:** 1 Std · **Nicht überspringen.**

- ☐ TestFlight-App auf dem eigenen iPhone, Build installieren
- ☐ **Benachrichtigungen end-to-end**: Erinnerung planen → App schließen →
  Gerät sperren → Benachrichtigung kommt zur richtigen Zeit mit deutschem Text
- ☐ Onboarding von Null durchlaufen (App vorher löschen = frischer Zustand)
- ☐ Eltern-PIN setzen, App neu starten, PIN verifizieren
- ☐ Foto-Avatar aus der echten Fotomediathek wählen
- ☐ Datenexport → Share-Sheet → Datei landet in Dateien/Mail
- ☐ „Alles zurücksetzen" → App ist wirklich leer
- ☐ Haptik und Sound auf echter Hardware (im Simulator nicht prüfbar)

**Stolperfallen**

- ⚠️ **Benachrichtigungen sind das größte Risiko dieses Releases.** Zeitzonen,
  Sperrbildschirm und Berechtigungen verhalten sich auf echter Hardware anders
  als im Simulator. Mindestens eine Erinnerung über einen echten Tageswechsel
  hinweg testen.
- ⚠️ Der Eltern-PIN-Schutz hat **keine Standard-PIN** — der Reviewer legt beim
  ersten Öffnen selbst eine an. Das gehört ausdrücklich in die Review-Notes,
  sonst wirkt der Bereich für den Reviewer wie gesperrt.

### ☐ D5 — App-Privacy-Angaben

**Wer:** 👤 · **Dauer:** 20 Min

App Store Connect → **App-Datenschutz**:

➡️ **Klick-für-Klick-Antworten auf den Datenschutz-Fragebogen:
`outputs/store/privacy-nutrition.md`**
➡️ **Antworten auf den Altersfreigabe-Fragebogen: `outputs/store/age-rating.md`**

- ☐ **„Es werden keine Daten erfasst"** (Data Not Collected) — korrekt, weil
  nichts das Gerät verlässt: keine Analyse, keine Werbung, kein Konto, kein Server
- ☐ Datenschutzrichtlinien-URL aus B4 eintragen
- ☐ Altersfreigabe-Fragebogen → Ergebnis **4+**, Kids Category **nein**

**Stolperfallen**

- ⚠️ „Data Not Collected" ist nur zulässig, weil auch die **Foto-Auswahl** rein
  lokal bleibt. Wird jemals ein SDK ergänzt, das Daten sendet, muss dieser
  Fragebogen zwingend geändert werden.
- ⚠️ Der Fragebogen fragt nach *Erfassung durch dich oder Dritte* — Bibliotheken
  zählen mit. Aktuell ist keine Analytics-Bibliothek im Projekt; vor jedem
  Release erneut prüfen.

### ☐ D6 — Restliche Pflichtfelder

**Wer:** 👤 · **Dauer:** 30 Min

- ☐ Support-URL (darf die Legal-Site sein) und Marketing-URL (optional)
- ☐ Kontaktdaten für den Review (Name, Telefon, E-Mail — Apple ruft im Zweifel an)
- ☐ **Anmeldedaten nicht nötig** — die App hat kein Konto; Feld
  „Anmeldung erforderlich" auf **nein**
- ☐ Copyright-Zeile, Preis: **kostenlos**, Verfügbarkeit: mindestens Deutschland,
  Österreich, Schweiz
- ☐ Notizen für den Reviewer aus `outputs/store/review-notes.md` eintragen

### ☐ D7 — Zur Prüfung einreichen

**Wer:** 👤 · **Dauer:** 5 Min

- ☐ Release-Typ: **„Manuell freigeben"** wählen (siehe Phase E)
- ☐ **Add for Review** → **Submit**

---

## PHASE E — Nach der Einreichung

### ☐ E1 — Review begleiten

**Wer:** 👤 · **Dauer:** 24 Std – 7 Tage Wartezeit

- ☐ Status beobachten: *Waiting for Review* → *In Review* → *Pending Developer
  Release*
- ☐ Bei Rückfragen im **Resolution Center** antworten — Argumente und
  Formulierungen stehen in `outputs/store/review-notes.md`
- ☐ Rückläufer sind normal. Metadaten-Ablehnungen brauchen **keinen** neuen
  Build, nur korrigierte Texte oder Screenshots

**Wahrscheinlichste Rückfragen bei dieser App**

| Thema | Antwort |
|-------|---------|
| „Wo sind die Anmeldedaten?" | Kein Konto vorhanden, alles lokal. Eltern-PIN legt der Nutzer beim ersten Start selbst fest. |
| „Ist das eine Kinder-App?" | Nein — für **Eltern** gebaut, Einrichtung durch Erwachsene, PIN-geschützter Elternbereich. Deshalb bewusst nicht in der Kids-Kategorie. |
| „Warum Fotozugriff?" | Ausschließlich für ein selbst gewähltes Profilbild; das Bild wird lokal kopiert, nie hochgeladen. |
| „Privacy-Policy-URL nicht erreichbar" | URL aus B4 gegenprüfen — meist ein Tippfehler oder eine noch nicht propagierte Domain. |

### ☐ E2 — Freigabe

**Wer:** 👤 · **Dauer:** 5 Min + bis zu 24 Std bis zur Sichtbarkeit

- ☐ Bei *Pending Developer Release*: **„Diese Version freigeben"** klicken
- ☐ Manuell freigeben ist Absicht — so entscheidet der Betreiber den Zeitpunkt
  und kann eine kurzfristig entdeckte Panne noch stoppen
- ☐ Nach der Freigabe: bis zu 24 Std, bis die App in allen Regionen sichtbar ist

### ☐ E3 — Danach

**Wer:** 👤 · **Dauer:** laufend

- ☐ App-Store-Link in die Legal-Site und ggf. in die App-Beschreibung aufnehmen
- ☐ Support-Postfach beobachten (Adresse aus B1)
- ☐ Für jedes Update: `version` **und** `buildNumber` erhöhen, sonst lehnt der
  Upload ab
- ☐ Kalendereintrag: **Apple-Developer-Mitgliedschaft verlängert sich jährlich.**
  Läuft sie aus, verschwindet die App aus dem Store.

---

## Bewusste Entscheidungen

Diese Punkte sehen wie Lücken aus, sind aber Absicht. Wenn im Review oder von
außen danach gefragt wird, ist das hier die Begründung.

### `supportsTablet: false` — kein iPad-Support

Die App ist auf Hochkant-Nutzung am Telefon ausgelegt: Sterne-Header,
Tab-Navigation und Task-Karten sind für eine Handbreite gestaltet. Ein
gestrecktes iPhone-Layout auf dem iPad wäre schlechter als kein iPad-Support.
**Nebeneffekt:** kein iPad-Screenshot-Set nötig (spart Aufwand in D2).
Nachrüstbar, sobald es ein eigenes Tablet-Layout gibt.

### Deutsch als einzige Sprache

Die Zielgruppe ist der deutschsprachige Familienalltag; die Rechtstexte sind auf
deutsches Recht (DDG, MStV, DSGVO) geschrieben. Halbe Übersetzungen — englische
UI mit deutschen Rechtstexten — wirken unfertig. Weitere Sprachen sind ein
eigenes Vorhaben inklusive eigener Rechtstexte.

### Fotos nicht im Export-JSON

`lib/backup.ts` exportiert alle Storage-Keys als JSON. **Bewusst nicht enthalten:**

- **Avatar-Fotos** — sie liegen als Bilddateien unter
  `<documentDirectory>/avatar-photos/` und müssten als Base64 eingebettet
  werden. Das würde Kinderfotos in eine teilbare Datei schreiben, die per
  Share-Sheet leicht irgendwo landet.
- **Die Eltern-PIN** — die aktuelle liegt im SecureStore, der Alt-Hash ist
  ungesalzen. Eine geteilte Datei würde eine vierstellige PIN weiterreichen.

Beide Ausnahmen stehen im `hinweis`-Feld der Exportdatei, sie erklärt sich also
selbst. Der Import-Pfad ist bewusst noch nicht gebaut (PLAN.md, T16).

### Keine Kids-Kategorie

Routine Stars ist eine **Eltern-App mit Kinderoberfläche**: Erwachsene richten
Profile, Routinen und Belohnungen ein, der Elternbereich ist PIN-geschützt.
Die Kids-Kategorie zieht einen eigenen, deutlich strengeren Regelsatz nach sich
(Parental Gates vor jedem externen Link, Sonderregeln für Berechtigungen,
längere und strengere Reviews). Für eine App ohne Netzwerk, ohne Werbung und
ohne Analyse bringt das keinen Schutzgewinn, sondern nur Ablehnungsrisiko.
Altersfreigabe: normale **4+**.

### Impressumspflicht

Die App wird von einer in Deutschland ansässigen Person angeboten, damit gilt
§ 5 DDG. Ein Impressum mit ladungsfähiger Anschrift ist Pflicht — **auch für
eine kostenlose App**. Deshalb steht das Impressum in der App **und** auf der
Legal-Site, und deshalb sind die Platzhalter absichtlich sichtbar geblieben,
statt eine plausible Fantasieadresse einzusetzen.

---

## Cross-Check gegen `app.json` / `eas.json`

Geprüft am Ende von Phase 5 gegen den tatsächlichen Stand von `app.json`,
`eas.json` und `.easignore`. **Nur notiert, nicht korrigiert** — diese Dateien
gehören zu anderen Arbeitspaketen.

### Passt

| # | Punkt | Stand |
|---|-------|-------|
| 1 | `ios.supportsTablet` | `false` — deckt sich mit der Entscheidung „kein iPad", also kein iPad-Screenshot-Set in D2 |
| 2 | `eas.json`-Profile | genau die drei erwarteten: `development-simulator` (mit `ios.simulator: true`), `preview`, `production` |
| 3 | `ios.buildNumber` | `"1"` gesetzt |
| 4 | Export-Compliance | `ios.infoPlist.ITSAppUsesNonExemptEncryption: false` — beantwortet die Frage in D3 dauerhaft |
| 5 | `.easignore` | schließt `assets/review/` **und** `assets/sticker-masters/` aus (die 151 MB), zusätzlich `outputs/`, `docs/`, `scripts/`, `.claude/` |
| 6 | Deutsche System-Texte | `locales/de.json` liefert `CFBundleDisplayName` und `NSPhotoLibraryUsageDescription` — passt zur Entscheidung „deutsch-only" |

### Offen (kein Fehler, aber vor C2 zu klären)

| # | Punkt | Befund | Wer |
|---|-------|--------|-----|
| 7 | `extra.eas.projectId` | fehlt noch in `app.json` — entsteht erwartungsgemäß erst durch `eas init` (Schritt A3) und **muss dann committet werden** | Betreiber |
| 8 | Build-Nummer | `cli.appVersionSource: "local"` + `production.autoIncrement: false` → jede weitere Einreichung braucht eine **manuell erhöhte** `ios.buildNumber`. Bewusste Wahl, aber leicht zu vergessen (siehe C0) | Betreiber |
| 9 | Legal-Links in der App | `app/settings/legal.tsx` zeigt fest auf `https://routinestars.app/privacy|terms|imprint`; die Domain existiert noch nicht. Ohne Domain sind das **vier tote Links im ausgelieferten Binary** | Betreiber, Entscheidung in B5 |
| 10 | Support-Adresse | `app/settings/legal.tsx` verlinkt fest `mailto:support@routinestars.app`, während `lib/legal-content.ts` noch `[E-Mail]` führt. Beide müssen dieselbe, echte Adresse nennen | Betreiber, zusammen mit B1 |
| 11 | `.easignore` schließt `scripts/` aus | korrekt, solange `package.json` keinen `eas-build-*`-Lifecycle-Hook bekommt. Wird je einer ergänzt, muss `scripts/` wieder rein (steht als Kommentar in der Datei) | künftige Änderungen |

Vor dem Production-Build (C2) die Punkte 7–10 abhaken — 9 und 10 landen sonst
unveränderlich im ausgelieferten Binary und lassen sich nur mit einem neuen
Build und einem neuen Review reparieren.
