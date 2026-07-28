# App Review Notes — Routine Stars

Field: **App Store Connect → (Version) → App Review Information → Notes**
Sign-in required: **No** — leave the "Sign-in required" checkbox **unchecked**.
Attachment: not required.

---

## PART 1 — English (primary; paste this into the Notes field)

### What this app is

Routine Stars is a German-language family app that turns morning / school /
bedtime routines into a star-collecting game for children. Parents build the
routines, children tick tasks off and collect stars, stickers and rewards.

**The entire app is in German.** There is no English localisation. The steps below
give you the exact German labels to tap, so no German is required to review it.

### Key facts for review

- **100% local. No account, no sign-in, no server, no network calls.**
  There is no login screen anywhere. On first launch the app goes straight into an
  intro and a setup wizard. Nothing to log into, nothing to request from us.
- **No analytics, no ads, no tracking, no third-party SDKs** of that kind.
  The App Privacy answer is "Data Not Collected".
- **No in-app purchases, no subscriptions.** The app is free and complete.
- **No user-to-user communication, no user-generated content leaving the device.**
- **No WebView / no in-app browser.** The only external links are three fixed
  `routinestars.app` URLs and one `mailto:` address inside
  Settings → "Rechtliches" (Legal) — and that whole section already sits behind
  the parent PIN.
- **Notifications are local only.** No push server, no push token. The app asks
  for notification permission only when a parent explicitly taps
  "Erinnerungen aktivieren" in Settings → "Benachrichtigungen".
- **Photo permission is optional** and used only to set a child's avatar picture.
  The image is copied into the app's own container and never uploaded. You can
  review the entire app without ever granting it — there are 10 illustrated
  avatars and 12 emoji avatars to choose from instead.

### Parental gate — please read this before testing the parent area

Adult-only areas are protected by a **German number-word arithmetic challenge**
before the parent PIN can be created, and by the **4-digit parent PIN** afterwards.

The challenge is shown as a sentence, e.g.:

> **Wie viel ist siebzehn plus sechsundzwanzig?**
> ("How much is seventeen plus twenty-six?" → answer: **43**)

Both operands are two-digit numbers between 12 and 49, spelled out in German
words. Type the sum as digits into the field and tap **"Bestätigen"** (Confirm).

**How to read German number words** — for numbers from 21 upwards the *ones* digit
is spoken **first**, joined by "und" ("and"):
`sechsundzwanzig` = *six-and-twenty* = **26**.

| Word | Value | Word | Value | Word | Value | Word | Value |
|---|---|---|---|---|---|---|---|
| zwölf | 12 | dreizehn | 13 | vierzehn | 14 | fünfzehn | 15 |
| sechzehn | 16 | siebzehn | 17 | achtzehn | 18 | neunzehn | 19 |
| zwanzig | 20 | einundzwanzig | 21 | zweiundzwanzig | 22 | dreiundzwanzig | 23 |
| vierundzwanzig | 24 | fünfundzwanzig | 25 | sechsundzwanzig | 26 | siebenundzwanzig | 27 |
| achtundzwanzig | 28 | neunundzwanzig | 29 | dreißig | 30 | einunddreißig | 31 |
| zweiunddreißig | 32 | dreiunddreißig | 33 | vierunddreißig | 34 | fünfunddreißig | 35 |
| sechsunddreißig | 36 | siebenunddreißig | 37 | achtunddreißig | 38 | neununddreißig | 39 |
| vierzig | 40 | einundvierzig | 41 | zweiundvierzig | 42 | dreiundvierzig | 43 |
| vierundvierzig | 44 | fünfundvierzig | 45 | sechsundvierzig | 46 | siebenundvierzig | 47 |
| achtundvierzig | 48 | neunundvierzig | 49 | | | | |

Building blocks: `eins/ein` 1, `zwei` 2, `drei` 3, `vier` 4, `fünf` 5, `sechs` 6,
`sieben` 7, `acht` 8, `neun` 9 — `zwanzig` 20, `dreißig` 30, `vierzig` 40.

Note: **a new question is generated after every wrong answer** — so the sentence
changing between attempts is expected, not a glitch. After **3** wrong answers the
challenge additionally pauses for **10 seconds** before accepting input again. Both
behaviours are intentional.

The challenge appears in exactly three places:
1. before creating the parent PIN for the first time,
2. before switching to a different child profile,
3. as the "Eltern-Check" (parent check) that confirms a completed timer task.

### Suggested test path (fresh install, ~4 minutes)

1. **Launch the app.** An intro sequence appears. Tap through it, or tap the
   **"Setup"** button in the top-right corner to jump straight to the wizard.
2. **Setup wizard, step 1 — child profile.** Enter any name, pick an age group
   (3-5 / 6-8 / 9-12), pick an avatar and a colour world.
   Tap **"Weiter: Routinen wählen"** (Next: choose routines).
3. **Setup wizard, step 2 — routines.** Under the heading
   **"Starter-Routine wählen"** pick any suggested template and confirm it.
   Then tap **"Weiter: Belohnungen"** (Next: rewards).
4. **Setup wizard, step 3 — rewards.** Tap **"Starterpaket wählen"** (use the
   starter pack), then **"In die App"** at the bottom right to finish setup.
5. **Dashboard ("Routinen" tab).** Tap a task row. A star flies into the counter
   at the top and the task is marked done. Tapping a completed task again offers
   **"Aufgabe zurücknehmen?"** (undo) and removes the stars again.
   *A task with a clock icon opens a timer instead — see step 8.*
6. **Redeem a reward.** Switch to the **"Belohnungen"** tab. Any reward whose star
   price is covered is tappable; tapping it redeems it, deducts the stars and
   shows a celebration.
7. **Parent area.** Tap the lock/settings icon in the top-right of the dashboard
   header. On a fresh install you now get the **arithmetic challenge** described
   above. Solve it, then choose a 4-digit PIN and confirm it. You are now in
   "Einstellungen" (Settings) with statistics, child management, notifications,
   legal texts and the data export.
8. **(Optional) Timer task + parent check.** On the dashboard, tap a task that
   shows a clock icon. The timer runs; at the end the **"Eltern-Check"** challenge
   appears — same arithmetic gate — and confirms the bonus stars.
9. **(Optional) Reset.** Settings → "Eltern-Bereich & Sicherheit" →
   "Zurücksetzen" wipes all local data and photos and returns the app to the
   first-launch state, so you can repeat the flow.

### Notes on specific guidelines

- **5.1.1 / account deletion:** not applicable — there is no account. All local
  data can still be deleted completely from within the app
  (Settings → "Eltern-Bereich & Sicherheit" → "Zurücksetzen").
- **Simulated gambling:** none. Stars per task are fixed values; stickers are
  **chosen by the child** from the remaining catalogue — there is no random draw,
  no loot box and no chance mechanic anywhere in the app. The "rarity" wording on
  a sticker is a decorative label only and does not affect availability.
- **Kids Category:** deliberately **not** used. The app targets the whole family;
  routine creation, scheduling, statistics, PIN and data export are parent
  features behind the PIN. The rating is a regular 4+.
- **1.3 / adult content behind a gate:** all outbound links live in
  Settings → "Rechtliches" and are therefore already behind the parent PIN.
- **2.1 / completeness:** privacy policy, terms and imprint are shipped in full
  **inside** the app (Settings → "Rechtliches"), not only as web links.

### Contact

⚠️ Fill in before submitting: first name, last name, phone number and e-mail of
the person Apple should contact. Recommended e-mail: `support@routinestars.app`.

---

## PART 2 — Deutsch (Kurzfassung für die interne Ablage)

### Worum es geht

Routine Stars ist eine deutschsprachige Familien-App: Morgen-, Schul- und
Abendroutinen werden für Kinder zu einem Sternenspiel. Eltern legen die Routinen
an, Kinder haken Aufgaben ab und sammeln Sterne, Sticker und Belohnungen.

### Wichtigste Punkte fürs Review

- **Komplett lokal.** Kein Konto, keine Anmeldung, kein Server, keine
  Netzwerkaufrufe. Es gibt keinen Login-Screen — ein Testzugang ist deshalb weder
  nötig noch möglich.
- **Kein Analytics, keine Werbung, kein Tracking, keine In-App-Käufe.**
- **Kein WebView.** Externe Links gibt es nur in "Einstellungen → Rechtliches"
  (drei feste `routinestars.app`-Adressen und eine `mailto:`-Adresse) — und dieser
  Bereich liegt bereits hinter dem Eltern-PIN.
- **Mitteilungen sind rein lokal geplant** (kein Push-Server, kein Token). Die
  Systemabfrage erscheint nur nach einem ausdrücklichen Tap auf
  "Erinnerungen aktivieren".
- **Fotoberechtigung ist optional** und dient allein dem Avatarbild. Das Bild
  bleibt im App-Container. Alternativ stehen 10 illustrierte Avatare und
  12 Emoji-Avatare bereit.

### Eltern-Gate

Vor der ersten PIN-Vergabe, beim Profilwechsel und beim "Eltern-Check" am
Timer-Ende erscheint eine Rechenaufgabe: zwei zweistellige Zahlen (12–49),
**in Zahlwörtern ausgeschrieben**, mit Übertrag — z. B.
*"Wie viel ist siebzehn plus sechsundzwanzig?"* → **43**.
Nach **jedem** Fehlversuch wird eine neue Aufgabe erzeugt; nach **drei**
Fehlversuchen pausiert das Gate zusätzlich 10 Sekunden. Danach schützt der
vierstellige PIN den Eltern-Bereich (Sperre nach 5 Fehlversuchen, Wartezeit
verdoppelt sich).

### Testpfad

Frische Installation → Intro (überspringbar über den Button "Setup" oben rechts) →
Setup-Assistent (Kind anlegen → "Weiter: Routinen wählen" → Starter-Routine
wählen → "Weiter: Belohnungen" → "Starterpaket wählen" → "In die App") →
Dashboard → Aufgabe antippen (Stern fliegt in den Zähler) → Tab "Belohnungen" →
Belohnung einlösen → Schloss-Symbol oben rechts → Rechenaufgabe lösen → PIN
vergeben → Eltern-Bereich.

Optional: Aufgabe mit Uhr-Symbol öffnet den Timer, am Ende folgt der
"Eltern-Check". Zurücksetzen über "Einstellungen → Eltern-Bereich & Sicherheit →
Zurücksetzen" stellt den Auslieferungszustand wieder her.

### Richtlinienbezug

- **5.1.1 (Kontolöschung):** nicht anwendbar, kein Konto. Vollständige lokale
  Löschung ist trotzdem in der App möglich.
- **Simuliertes Glücksspiel:** keines. Sterne sind feste Werte, Sticker werden vom
  Kind **ausgewählt**, nicht gezogen. Kein Zufall, keine Lootbox.
- **Kids Category:** bewusst nicht gewählt, reguläre Einstufung 4+ (Begründung in
  `age-rating.md`).

---

## Offene Nutzeraktionen aus diesem Dokument

1. **Kontaktdaten** im App-Review-Bereich eintragen (Vorname, Nachname, Telefon, E-Mail) — Pflichtfelder.
2. **"Sign-in required" nicht ankreuzen** — es gibt kein Konto.
3. Vor dem Absenden prüfen, dass die Notes-Fassung (Teil 1, Englisch) unverändert im Feld steht — sie enthält die Zahlwort-Tabelle, ohne die ein nicht deutschsprachiges Review am Eltern-Gate hängen bleibt.
