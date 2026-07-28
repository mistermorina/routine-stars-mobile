# App Store Connect — Ausfüllreihenfolge Schritt für Schritt

Reihenfolge ist nicht beliebig: manche Felder schalten andere erst frei
(Bundle ID vor App-Record, App-Record vor Build-Upload, Build vor Absenden).
Abarbeiten von oben nach unten.

Quellen für die Inhalte:
`listing.md` · `privacy-nutrition.md` · `age-rating.md` · `review-notes.md` · `screenshots-plan.md`

**Abgrenzung:** `outputs/RELEASE_CHECKLIST.md` beschreibt den **gesamten**
Release-Fahrplan (Konten, Legal-Hosting, Builds, Review, Zeitbudget). Das
vorliegende Dokument deckt ausschließlich **Phase D** davon ab: das Ausfüllen der
Formulare in App Store Connect, Feld für Feld. Bei Widersprüchen gilt der
Fahrplan für die Reihenfolge, dieses Dokument für die Feldinhalte.

---

## Schritt 0 — Voraussetzungen (vor App Store Connect)

- [ ] **Apple Developer Program** aktiv (99 USD/Jahr), Rolle mindestens **App Manager**, für den ersten App-Record **Admin** oder **Account Holder**.
- [ ] **Verträge:** Unter *Business* → *Agreements* muss der Vertrag für **kostenlose Apps** aktiv sein. Bank- und Steuerdaten sind für eine kostenlose App **nicht** nötig.
- [ ] **Bundle ID registrieren:** Im Developer-Portal unter *Certificates, Identifiers & Profiles* → *Identifiers* einen App-Identifier **`com.routinestars.app`** anlegen (explizit, kein Wildcard). `eas build` legt ihn auf Wunsch automatisch an — dann diesen Punkt danach nur noch verifizieren.
- [ ] **Impressum-Platzhalter füllen:** `[Name]`, `[Adresse]`, `[E-Mail]` in `lib/legal-content.ts` **und** in den HTML-Dateien unter `outputs/legal-site/`. Sie erscheinen sonst wörtlich in App und Web und sind ein Review-Risiko.
- [ ] **Website live:** `https://routinestars.app` mit `/`, `/privacy`, `/terms`, `/imprint`. Das HTML liegt fertig in `outputs/legal-site/` (WP5.4), inklusive Hosting-Anleitung in dessen `README.md`. Die App verlinkt fest auf diese Pfade (`app/settings/legal.tsx`) — tote Links sind ein Rejection-Grund (2.1).
- [ ] **Support-Postfach** `support@routinestars.app` empfangsbereit (die App verlinkt per `mailto:` darauf).

---

## Schritt 1 — App-Record anlegen

*App Store Connect → Apps → **+** → Neue App*

| Feld | Wert |
|---|---|
| Plattform | **iOS** |
| Name | **Routine Stars** |
| Primäre Sprache | **Deutsch (Deutschland)** |
| Bundle-ID | **com.routinestars.app** (aus der Auswahlliste; erscheint nur, wenn Schritt 0 erledigt ist) |
| SKU | frei wählbar, z. B. `ROUTINESTARS-IOS-001` — nur intern, nie sichtbar, nicht änderbar |
| Benutzerzugriff | Vollzugriff |

⚠️ **Name und primäre Sprache sind nach der Veröffentlichung nur eingeschränkt
änderbar.** Vor dem Klick auf "Erstellen" beides gegenlesen.

---

## Schritt 2 — App-Informationen (versionsunabhängig)

*Menü links: **Allgemein → App-Informationen***

- [ ] **Untertitel:** `Kinder-Alltag ohne Diskussion` (29/30) — Variante vorher bestätigen, siehe `listing.md` Abschnitt 2.
- [ ] **Kategorie primär:** Bildung
- [ ] **Kategorie sekundär:** Produktivität
- [ ] **Nutzungsrechte an Inhalten (Content Rights):** Die Frage lautet *"Enthält, zeigt
      oder greift Ihre App auf Inhalte Dritter zu?"* → **Nein** ankreuzen.
      (Alle Grafiken, Sticker, Sounds und Texte stammen aus dem Projekt. Nicht mit der
      gegenteilig formulierten Checkbox verwechseln — maßgeblich ist die Frage im Formular.)
- [ ] **Lizenzvereinbarung:** Apples Standard-EULA belassen (keine eigene EULA nötig)
- [ ] **Altersfreigabe → "Bearbeiten":** Fragebogen exakt nach `age-rating.md` ausfüllen.
      Alle Inhaltskategorien **Keine**, uneingeschränkter Webzugriff **Nein**,
      Glücksspiel **Nein**, **Made for Kids: NEIN**.
      Ergebnis muss **4+** anzeigen — falls nicht, steht eine Zeile versehentlich
      auf "Selten oder schwach".

---

## Schritt 3 — Preis und Verfügbarkeit

*Menü links: **Preisgestaltung und Verfügbarkeit***

- [ ] **Preis: 0,00 € / Free.** Preisplan auf "Kostenlos" setzen, keine Sonderpreise, kein Zeitplan.
- [ ] **Keine In-App-Käufe** anlegen (es gibt keine).
- [ ] **Vorbestellung:** aus.
- [ ] **Verfügbarkeit: weltweit** — mit einer bewussten Ausnahme, siehe unten.

### Warum weltweit, obwohl die App nur Deutsch kann

- Die primäre Locale **de-DE** ist die einzige Lokalisierung. In Storefronts ohne
  deutsche Lokalisierung zeigt Apple automatisch die **primäre Sprache** — die
  Seite ist also überall vollständig, nur eben auf Deutsch. Es entsteht kein
  leerer oder kaputter Eintrag.
- **Deutschsprachige Nutzer leben nicht nur in DE/AT/CH.** Eine Beschränkung auf
  drei Storefronts schließt Luxemburg, Belgien, Südtirol, deutsche Auslandsschulen
  und Familien im Ausland aus — genau die Zielgruppe, die eine deutsche
  Routine-App sucht. Die Store-Region hängt am Apple-Account, nicht am Aufenthaltsort.
- **Es gibt kein regulatorisches Gegenargument:** keine Datenerhebung, keine
  Konten, keine In-App-Käufe, keine altersbeschränkten Inhalte, keine
  Nutzerkommunikation. Damit fällt der übliche Grund für Länderbeschränkungen
  (lokale Datenschutz- oder Jugendschutzauflagen) weg.
- **Realistisches Risiko:** vereinzelte schlechte Bewertungen von Nutzern, die
  Deutsch nicht lesen. Gegenmittel steht bereits in der Beschreibung: der
  Schlusssatz *"Routine Stars ist auf Deutsch."*
- **Später jederzeit erweiterbar:** weitere Lokalisierungen lassen sich ohne
  neuen App-Record ergänzen.

### Die eine Ausnahme

- [ ] **Festland-China abwählen.** Für die Distribution in Mainland China verlangt
      Apple eine **ICP-Filing-Nummer** (chinesische Betreiber-Registrierung). Ohne
      sie wird die Einreichung für diese Storefront zurückgewiesen. Da es dort
      ohnehin keine Zielgruppe für eine deutschsprachige App gibt, ist Abwählen
      der reibungsärmste Weg.

---

## Schritt 4 — App-Datenschutz

*Menü links: **App-Datenschutz***

- [ ] **Datenschutzrichtlinien-URL:** `https://routinestars.app/privacy`
      (muss zum Prüfzeitpunkt erreichbar sein — **Blocker**)
- [ ] **Datenerfassung:** "Nein, wir erfassen keine Daten aus dieser App"
- [ ] Ergebnis kontrollieren: das Label muss **"Keine Daten erfasst"** zeigen
- [ ] Details und Begründungen: `privacy-nutrition.md`

Dieser Schritt kommt **vor** dem Absenden zur Prüfung — App Store Connect lässt
eine Version ohne ausgefülltes Datenschutzformular nicht abschicken.

---

## Schritt 5 — Versionsseite 1.0 befüllen (ohne Build)

*Menü links: **iOS-App → 1.0 Vorbereitung für die Einreichung***

Reihenfolge innerhalb der Seite ist egal, Vollständigkeit nicht.

- [ ] **Screenshots iPhone 6,9":** 6 Bilder, je 1320 × 2868 px — siehe `screenshots-plan.md`
- [ ] **Screenshots iPad:** **entfällt** — `app.json` setzt `ios.supportsTablet: false`,
      App Store Connect zeigt den iPad-Slot dann gar nicht an
- [ ] **App-Vorschauvideos:** optional, für 1.0 auslassen
- [ ] **Werbetext (Promotional Text):** aus `listing.md` Abschnitt 3 (169/170)
- [ ] **Beschreibung:** aus `listing.md` Abschnitt 4 (2 796/4000)
- [ ] **Keywords:** aus `listing.md` Abschnitt 5 (100/100)
- [ ] **Support-URL:** `https://routinestars.app/imprint` (oder eine eigene `/support`-Seite — siehe `listing.md` Abschnitt 6)
- [ ] **Marketing-URL:** `https://routinestars.app` (optional — leer lassen, wenn die Seite nicht live ist)
- [ ] **Copyright:** `2026 [Name]` → echten Rechteinhaber eintragen
- [ ] **Routing-App-Abdeckungsdatei:** entfällt
- [ ] **Version:** `1.0.0` (muss zu `app.json` → `expo.version` passen)

---

## Schritt 6 — Build hochladen

- [ ] `eas build --platform ios --profile production` (Profil `production` liegt in `eas.json`)
- [ ] EAS legt Distributionszertifikat und Provisioning-Profil an bzw. verwendet vorhandene
- [ ] `eas submit --platform ios --profile production` (oder Transporter mit der `.ipa`)
- [ ] **Export Compliance:** bereits erledigt — `app.json` setzt
      `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`. App Store Connect
      fragt dadurch nicht mehr pro Build nach. Nur prüfen, dass die Frage
      tatsächlich ausbleibt
- [ ] Warten, bis der Build in App Store Connect von *Processing* auf **Ready to Submit** springt (typisch 5–30 Minuten)
- [ ] **Build auf der Versionsseite auswählen** (Abschnitt "Build" → **+**)

**Bekannte, harmlose Meldung:** Wenn im gebauten Paket das
`aps-environment`-Entitlement steckt (kann durch das `expo-notifications`-Plugin
entstehen), schickt Apple eventuell den Hinweis "missing push notification
entitlement". Die App nutzt ausschließlich **lokale** Mitteilungen, registriert
kein Push-Token und braucht keinen Push-Key — die Mail ist kein Prüfungsergebnis
und blockiert nichts. Wer sie vermeiden will, entfernt das Entitlement im Build.

---

## Schritt 7 — Angaben zur App-Prüfung

*Auf derselben Versionsseite, Abschnitt **Informationen zur App-Prüfung***

- [ ] **Anmeldung erforderlich: NICHT ankreuzen** (es gibt kein Konto)
- [ ] **Kontakt:** Vorname, Nachname, Telefonnummer, E-Mail — Pflichtfelder
- [ ] **Anmerkungen:** Teil 1 (Englisch) aus `review-notes.md` einfügen. Enthält die
      Zahlwort-Tabelle für das Eltern-Gate — ohne sie bleibt ein nicht
      deutschsprachiges Review daran hängen
- [ ] **Anhang:** nicht nötig

---

## Schritt 8 — Freigabe und Absenden

- [ ] **Versionsfreigabe: "Diese Version manuell freigeben"**
      Empfehlung für 1.0: nach bestandener Prüfung selbst entscheiden, wann die
      App live geht (Website, Support-Postfach, Kommunikation vorbereitet).
- [ ] **Phased Release:** für 1.0 irrelevant (greift erst bei Updates)
- [ ] **"Zur Prüfung hinzufügen" → "Absenden"**
- [ ] Status wandert: *Warten auf Prüfung* → *In Prüfung* → *Ausstehende Entwicklerfreigabe*
- [ ] Nach der Freigabe: den echten Store-Eintrag auf iPhone **und** iPad gegenlesen (Umbrüche, Screenshot-Reihenfolge, Links)

---

## Blocker-Kurzliste

Wenn eines davon fehlt, kommt die Einreichung nicht durch:

1. **Datenschutz-URL nicht erreichbar** → Formular nicht abschickbar / Rejection
2. **Impressum-Platzhalter `[Name]`/`[Adresse]`/`[E-Mail]` noch in App oder Website** → Review-Risiko, und die Texte sind rechtlich unbrauchbar
3. **In-App-Links (`/privacy`, `/terms`, `/imprint`, `mailto:`) tot** → Guideline 2.1
4. **Altersfreigabe-Fragebogen nicht abgeschickt** → Version nicht absendbar
5. **Copyright-Feld leer oder mit Platzhalter** → Version nicht absendbar
6. **Weniger als 3 Screenshots im 6,9"-Slot** → Version nicht absendbar

---

## Bereits geprüft und in Ordnung

| Punkt | Stand |
|---|---|
| App-Icon | `assets/icon.png` = 1024 × 1024 px, **kein Alphakanal**, RGB — entspricht der Store-Anforderung |
| Bundle-ID im Projekt | `app.json` → `ios.bundleIdentifier` = `com.routinestars.app` ✅ |
| Version / Build | `version` = `1.0.0`, `ios.buildNumber` = `1` |
| Export Compliance | `ios.infoPlist.ITSAppUsesNonExemptEncryption` = `false` ✅ |
| iPad | `ios.supportsTablet` = `false` → kein iPad-Screenshot-Set nötig ✅ |
| Ausrichtung | `portrait` — passt zu einem reinen Hochformat-Screenshot-Set |
| Foto-Berechtigungstext | auf Deutsch, doppelt abgesichert: `expo-image-picker.photosPermission` **und** `locales/de.json` → `NSPhotoLibraryUsageDescription` |
| Anzeigename | `locales/de.json` → `CFBundleDisplayName` = `Routine Stars` |
| Build-Profile | `eas.json` enthält `production` (Build) und `submit.production` |
| Build-Größe | `.easignore` schließt `assets/review/`, `assets/sticker-masters/`, `outputs/`, `docs/`, `scripts/` aus — die ~151 MB Design-Assets landen nicht im Build |

---

## Offene Nutzeraktionen aus diesem Dokument

1. Impressum-Platzhalter in `lib/legal-content.ts` **und** in `outputs/legal-site/*.html` füllen.
2. `https://routinestars.app` inkl. `/`, `/privacy`, `/terms`, `/imprint` live stellen.
3. Support-URL festlegen (`/imprint` oder eigene `/support`-Seite).
4. `support@routinestars.app` einrichten.
5. Rechteinhaber für die Copyright-Zeile festlegen.
6. Kontaktdaten für die App-Prüfung bereitlegen (Name, Telefon, E-Mail).
7. `eas.json` → `submit.production` um `appleId`, `ascAppId` und `appleTeamId` ergänzen, sobald der App-Record existiert (sonst fragt `eas submit` bei jedem Lauf interaktiv nach).
