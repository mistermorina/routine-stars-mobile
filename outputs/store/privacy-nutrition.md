# App Privacy ("Nutrition Label") — exakte Antworten für App Store Connect

Pfad in App Store Connect: **App Store Connect → Apps → Routine Stars → App-Datenschutz (App Privacy)**

Ergebnis in einem Satz: **Für keine einzige Datenkategorie wird "Erfasst" (Collected)
angekreuzt.** Das Label zeigt am Ende "**Keine Daten erfasst**" / "Data Not Collected".

---

## 1. Die Einstiegsfrage

> **"Erfasst diese App Daten oder Ihr Drittanbieter-Partner?"**
> ("Do you or your third-party partners collect data from this app?")

**Antwort: NEIN** → im Dialog **"Nein, wir erfassen keine Daten aus dieser App"**
("No, we do not collect data from this app").

Danach ist die Kategorien-Matrix erledigt — App Store Connect blendet sie aus und
setzt das Label auf "Keine Daten erfasst".

⚠️ Wichtig: Diese Antwort ist eine **Zusicherung gegenüber Apple**. Sie muss ab
dem Moment, in dem ein Analytics-, Crash- oder Werbe-SDK eingebaut wird, sofort
korrigiert werden. Siehe Abschnitt 6.

---

## 2. Warum "Nicht erfasst" hier korrekt ist — Apples eigene Definition

Apple definiert "collect" als: *Daten der App verlassen das Gerät und werden für
mehr als die aktuell angeforderte Nutzeraktion aufbewahrt.*
Daten, die **ausschließlich auf dem Gerät** bleiben, gelten ausdrücklich **nicht**
als erfasst. Genau das ist der Fall.

### Begründungs-Walkthrough (Punkt für Punkt gegen den Code geprüft)

**a) Alles liegt lokal, nichts geht raus.**
Der gesamte App-Zustand liegt in AsyncStorage auf dem Gerät
(`lib/storage.ts`, Schlüssel: `children`, `activityLogs`, `customRoutines`,
`customRewards`, `routineProgress`, `childProgressState`, `stickerCollection`,
`notificationSettings`, `legalPreferences`, `soundEnabled`, `hapticsEnabled`,
`schemaVersion`).
Ein Grep über `app/`, `lib/`, `components/`, `hooks/`, `contexts/` findet **keinen
einzigen** Aufruf von `fetch(`, `axios`, `XMLHttpRequest` oder `WebSocket`.
Es gibt keinen Backend-Endpunkt, keine Basis-URL, keinen API-Key im Projekt.

**b) Kein Analytics-, Crash- oder Attributions-SDK.**
`package.json` enthält kein Firebase, Sentry, Amplitude, Mixpanel, PostHog,
Segment, AppsFlyer, Adjust, Branch, Facebook SDK und kein Werbenetzwerk.
Die Dependencies sind ausschließlich Expo-/React-Native-Bausteine
(Router, Reanimated, SVG, Image, Audio, Haptics, Notifications, SecureStore,
FileSystem, Sharing, ImagePicker, AsyncStorage, NativeWind).

**c) Kein Konto, keine Identität.**
`lib/auth-flow.ts` hält es im Modulkommentar selbst fest: kein Account,
kein Sign-in, keine Serversession. Der Kaltstart entscheidet allein danach, ob
lokal bereits Kinderprofile existieren. Es gibt keine Registrierung, kein
Login-Formular, kein OAuth, kein "Sign in with Apple".

**d) Der Eltern-PIN verlässt das Gerät nicht — und wird nie im Klartext gespeichert.**
`lib/parent-access.ts` legt einen gesalzenen, 60 000-fach iterierten SHA-256-Hash
in `expo-secure-store` (iOS-Schlüsselbund) ab. Kein Versand, keine Wiederherstellung
über einen Server.

**e) Foto-Avatare bleiben im App-Container.**
`lib/avatar-photo-picker.ts` kopiert ein ausgewähltes Bild nach
`<documentDirectory>/avatar-photos/` und speichert nur den **relativen** Pfad.
Es wird nichts hochgeladen. Die Fotomediathek wird nur nach ausdrücklicher
System-Erlaubnis gelesen, ausgelöst durch einen Tap der Eltern; der Foto-Avatar
ist optional (Alternativen: 10 illustrierte Helden-Avatare und 12 Emoji-Avatare
aus `lib/avatars.ts`).
Der Permission-Text steht auf Deutsch in `app.json`
(`expo-image-picker` → `photosPermission`).

**f) Der Export ist rein nutzerinitiiert und geht nirgendwohin automatisch.**
`lib/backup.ts` → `exportAppData()` läuft ausschließlich, wenn ein Elternteil im
Eltern-Bereich auf "Daten exportieren" tippt. Die JSON-Datei wird ins
Cache-Verzeichnis geschrieben, an das **System-Share-Sheet** übergeben und danach
gelöscht. Wohin sie geht, entscheidet allein die Person am Gerät (AirDrop, Mail,
Dateien …). Bewusst **nicht** enthalten: Avatar-Fotos und der PIN.
Das ist im Sinne des Nutrition Labels keine Erfassung — es ist ein Systemdialog
unter voller Nutzerkontrolle, ohne Empfänger auf unserer Seite.

**g) Mitteilungen sind lokal geplant, nicht gepusht.**
`lib/notifications.ts` (Modulkommentar): "Everything here is LOCAL scheduling — no
push server, no token, no network". Es wird **kein** Push-Token angefordert und
keiner registriert. Pro (Routine × Wochentag) entsteht ein wöchentlich
wiederholender lokaler Trigger auf dem Gerät.

**h) Keine Werbung, keine Werbe-ID.**
Kein Ad-SDK, kein `AppTrackingTransparency`, kein Zugriff auf die IDFA. Es gibt
keine Tracking-Funktion im Sinne von Apples Definition (Verknüpfung mit Daten
Dritter für Werbung oder Messung).

**i) Keine In-App-Käufe, keine Zahlungsdaten.**
Kein StoreKit-Code, keine IAP-Dependency, kein Kaufabwicklungs-Flow.

---

## 3. Falls App Store Connect die Matrix trotzdem anzeigt

Manche Konten sehen die vollständige Kategorienliste, bevor die "Nein"-Antwort
greift. Dann gilt für **jede** Kategorie: **nicht ankreuzen**.

| Kategorie | Erfasst? |
|---|---|
| Kontaktdaten (Name, E-Mail, Telefon, Adresse, sonstige Kontaktdaten) | Nein |
| Gesundheit & Fitness | Nein |
| Finanzdaten (Zahlungen, Bonität, sonstige) | Nein |
| Standort (genau / grob) | Nein |
| Sensible Daten | Nein |
| Kontakte (Adressbuch) | Nein |
| Benutzerinhalte (Fotos/Videos, Audio, Gameplay-Inhalte, Kundensupport, sonstige) | **Nein** — Fotos und Inhalte bleiben ausschließlich auf dem Gerät |
| Browserverlauf | Nein |
| Suchverlauf | Nein |
| Kennungen (User-ID, Geräte-ID) | Nein |
| Käufe (Kaufhistorie) | Nein |
| Nutzungsdaten (Produktinteraktion, Werbedaten, sonstige) | **Nein** — die Statistiken werden lokal berechnet und nie übertragen |
| Diagnose (Absturzdaten, Performance, sonstige) | **Nein** — kein Crash-SDK eingebunden |
| Sonstige Daten | Nein |

Der Punkt "Benutzerinhalte" ist der einzige, bei dem man ins Grübeln kommt
(Kindernamen, Foto-Avatare). Er bleibt trotzdem korrekt "Nein": Apple fragt nach
Daten, die **vom Gerät gesammelt werden**. Diese Inhalte werden erzeugt, lokal
gespeichert und nie gesendet.

---

## 4. Datenschutz-URL

```
https://routinestars.app/privacy
```

⚠️ **Blocker vor der Einreichung:** Diese URL ist ein Pflichtfeld und muss zum
Zeitpunkt der Prüfung **öffentlich erreichbar** sein (kein Login, kein 404, keine
Baustellenseite) — und danach dauerhaft erreichbar bleiben. Eine tote
Datenschutz-URL ist ein direkter Rejection-Grund.

- Das HTML liegt fertig in **`outputs/legal-site/privacy.html`** (WP5.4), erzeugt
  aus `lib/legal-content.ts`, damit In-App-Text und Web-Text identisch sind.
  Hosting-Anleitung: `outputs/legal-site/README.md`.
- Die App verlinkt zusätzlich auf `/terms` und `/imprint`
  (`app/settings/legal.tsx`) sowie auf `mailto:support@routinestars.app`.
  Auch diese Ziele müssen live sein, sonst greift Guideline 2.1 (defekte Links).
- Für das **Pflichtfeld allein** genügt jede öffentlich erreichbare URL, auch eine
  GitHub-Pages- oder Netlify-Adresse. Die **In-App-Links** zeigen dagegen fest auf
  `routinestars.app` — dafür braucht es die echte Domain oder eine Codeänderung.

---

## 5. Verwandte Felder im selben Formularbereich

| Feld | Antwort | Anmerkung |
|---|---|---|
| **Werbe-ID (IDFA) verwenden?** | Nein | kein Werbe-SDK, kein ATT-Prompt |
| **Tracking im Sinne der ATT?** | Nein | keine Verknüpfung mit Daten Dritter |
| **Sign in with Apple erforderlich?** | Entfällt | die App hat gar kein Login |
| **Konto-Löschung im Sinne von Guideline 5.1.1(v)** | Entfällt | ohne Konto gibt es nichts zu löschen. Trotzdem vorhanden: "Alles zurücksetzen" in `app/settings/account.tsx` löscht sämtliche lokalen Daten und Fotos — das ist im Review-Notes-Dokument erwähnt |
| **Export Compliance / Verschlüsselung** | ✅ bereits erledigt | `app.json` setzt `ios.infoPlist.ITSAppUsesNonExemptEncryption: false`. Sachlich korrekt: es kommen nur ein SHA-256-**Hash** (keine Verschlüsselung) und der System-Schlüsselbund über `expo-secure-store` zum Einsatz — beides ausgenommen. Die Frage entfällt dadurch pro Build |
| **Content Rights: Inhalte Dritter?** | Nein | alle Grafiken, Sticker, Sounds und Texte stammen aus dem Projekt |

---

## 6. Was die "Keine Daten erfasst"-Zusicherung künftig ungültig macht

Diese Liste gehört ins Release-Runbook. Sobald **eines** dieser Dinge einzieht,
muss das Privacy-Label **vor** dem nächsten Release aktualisiert werden:

1. Crash-Reporting (Sentry, Crashlytics, Bugsnag) — dann: *Diagnose → Absturzdaten*.
2. Analytics jeder Art, auch "anonym" (Firebase, Amplitude, PostHog, TelemetryDeck)
   — dann: *Nutzungsdaten → Produktinteraktion*.
3. Expo-Push-Notifications mit Token-Registrierung — dann: *Kennungen → Geräte-ID*.
4. Cloud-Sync, Backup-Server oder Familienfreigabe über ein Konto.
5. Werbung oder Attribution jeder Art.
6. In-App-Käufe / Abos — dann: *Käufe* (und zusätzlich Guideline 3.1.2 für Abos)
   sowie die Beschreibung anpassen. Die Nutzungsbedingungen erwähnen bereits
   *geplante* Premium-Funktionen (`lib/legal-content.ts:160`) — solange nichts
   buchbar ist, ändert das an dieser Einreichung nichts.
7. Ein serverseitiges Kontaktformular statt `mailto:` auf der Support-Seite.

---

## Offene Nutzeraktionen aus diesem Dokument

1. **`https://routinestars.app/privacy` live stellen** — Pflichtfeld, blockiert die Einreichung (HTML liegt in `outputs/legal-site/`).
2. `/`, `/terms`, `/imprint` ebenfalls erreichbar machen (In-App-Links).
3. `support@routinestars.app` als Postfach einrichten.
4. Impressum-Platzhalter `[Name]`, `[Adresse]`, `[E-Mail]` in `lib/legal-content.ts` **und** in `outputs/legal-site/*.html` füllen — sie erscheinen sonst wörtlich in der App und auf der Website.
5. Nach jedem Dependency-Update kurz gegenprüfen, dass kein Analytics-/Crash-SDK eingezogen ist (Abschnitt 6).
