# Legal-Site — Veröffentlichung

Vier statische Seiten, komplett self-contained: kein externer Request, kein
Webfont-Download, kein Build-Schritt, kein JavaScript. Einfach hochladen.

```
outputs/legal-site/
├── index.html     Übersicht + Datenschutz-Kurzfassung, verlinkt die drei Dokumente
├── privacy.html   Datenschutzerklärung   → App Store Connect: "Privacy Policy URL"
├── terms.html     Nutzungsbedingungen    → optional: "License Agreement / EULA"
├── imprint.html   Impressum              → Pflicht in DE (§ 5 DDG)
└── README.md      diese Anleitung (nicht mit hochladen nötig, schadet aber nicht)
```

Inhalt gespiegelt aus `lib/legal-content.ts` (Stand: Juli 2026). **Beide Quellen
müssen identisch bleiben** — die App-Texte und die Web-Texte sind derselbe Text.

---

## 0. Vorher: Platzhalter ausfüllen

In allen drei Dokumenten stehen `[Name]`, `[Adresse]`, `[E-Mail]` — gelb markiert
und mit `<!-- AUSFUELLEN ... -->`-Kommentaren im Quelltext.

```bash
grep -rn "\[Name\]\|\[Adresse\]\|\[E-Mail\]" outputs/legal-site/*.html lib/legal-content.ts
```

Pro Fund:

1. Text ersetzen.
2. Die Auszeichnung `<span class="ph">…</span>` entfernen (nur den Tag, nicht den Inhalt).
3. Den `<!-- AUSFUELLEN … -->`-Kommentar löschen.

Danach zusätzlich entfernen:

- den `.hinweis`-Block ("Angaben in eckigen Klammern sind Platzhalter …") in allen vier HTML-Dateien,
- in `imprint.html` den kompletten Abschnitt **„Noch auszufüllen“**,
- in `lib/legal-content.ts`: denselben Abschnitt im `impressum`-Array, die drei
  `hasPlaceholders: true`-Flags und den `TODO(betreiber)`-Kommentar im Kopf.

Das Ziel ist ein sauberer `grep` ohne Treffer. Solange auch nur ein Platzhalter
steht, ist das Impressum rechtlich unvollständig.

> Hinweis zum Namen: eine **ladungsfähige Anschrift** ist Pflicht, ein Postfach
> genügt nicht. Wer keine Privatadresse veröffentlichen will, nutzt üblicherweise
> eine ladungsfähige Geschäftsadresse (z. B. Impressumsservice). Das ist eine
> Entscheidung des Betreibers — hier wird bewusst nichts erfunden.

---

## Option A — GitHub Pages (kostenlos, empfohlen)

### A1. Repository anlegen und Dateien hochladen

**Weg über die Weboberfläche (ohne Terminal):**

1. [github.com/new](https://github.com/new) → Repository-Name z. B. `routinestars-legal`,
   Sichtbarkeit **Public** (GitHub Pages braucht für kostenlose Accounts Public), **Create repository**.
2. Auf der leeren Repo-Seite → **uploading an existing file**.
3. `index.html`, `privacy.html`, `terms.html`, `imprint.html` aus `outputs/legal-site/`
   in das Browserfenster ziehen → **Commit changes**.

**Weg über das Terminal:**

```bash
cd outputs/legal-site
git init
git add index.html privacy.html terms.html imprint.html
git commit -m "Legal pages"
git branch -M main
git remote add origin https://github.com/<username>/routinestars-legal.git
git push -u origin main
```

### A2. Pages einschalten

1. Repo → **Settings** → linke Spalte **Pages**.
2. *Build and deployment* → **Source: Deploy from a branch**.
3. *Branch*: `main`, Ordner `/ (root)` → **Save**.
4. 1–3 Minuten warten. Oben auf derselben Seite erscheint die Live-URL:
   `https://<username>.github.io/routinestars-legal/`

### A3. Saubere URLs ohne `.html` (wichtig)

Die App verlinkt in `app/settings/legal.tsx` auf **`/privacy`, `/terms`, `/imprint`**
— ohne Dateiendung. Damit diese Pfade funktionieren, jede Seite zusätzlich als
`index.html` in einen gleichnamigen Ordner legen:

```bash
cd outputs/legal-site
for p in privacy terms imprint; do mkdir -p "$p" && cp "$p.html" "$p/index.html"; done
touch .nojekyll   # verhindert, dass GitHub die Dateien durch Jekyll schickt
```

Ergebnis: `/privacy` **und** `/privacy.html` funktionieren beide. Die Kopien
mit hochladen. Bei jeder Textänderung beide Fassungen aktualisieren — oder die
Einzeldateien löschen und nur die Ordner-Variante behalten.

> Alternative, falls die Ordner nicht gewollt sind: die vier URLs in
> `app/settings/legal.tsx` auf `…/privacy.html` usw. ändern. Das ist eine
> Code-Änderung und erfordert einen neuen Build — die Ordner-Variante ist
> billiger.

### A4. Custom Domain `routinestars.app` (optional, später)

Erst sinnvoll, wenn die Domain registriert ist. Bis dahin ist die
`github.io`-URL vollkommen ausreichend (siehe unten).

1. Repo → **Settings** → **Pages** → *Custom domain* → `routinestars.app` → **Save**.
   GitHub legt dabei automatisch eine Datei `CNAME` im Repo an.
2. Beim Domain-Anbieter (Registrar) die DNS-Einträge setzen:

   | Typ | Name | Wert |
   |-----|------|------|
   | A | `@` | `185.199.108.153` |
   | A | `@` | `185.199.109.153` |
   | A | `@` | `185.199.110.153` |
   | A | `@` | `185.199.111.153` |
   | AAAA | `@` | `2606:50c0:8000::153` |
   | AAAA | `@` | `2606:50c0:8001::153` |
   | AAAA | `@` | `2606:50c0:8002::153` |
   | AAAA | `@` | `2606:50c0:8003::153` |
   | CNAME | `www` | `<username>.github.io.` |

   (Die IPs sind GitHubs offizielle Pages-Adressen. Vor dem Setzen kurz in der
   GitHub-Doku "Managing a custom domain for your GitHub Pages site" gegenprüfen —
   sie ändern sich selten, aber nicht nie.)
3. DNS-Propagation abwarten: meist 10–60 Minuten, im Extremfall 24 Stunden.
   Solange zeigt GitHub unter *Pages* eine gelbe Warnung — das ist normal.
4. Sobald grün: **Enforce HTTPS** anhaken. Apple verlangt keine, aber erwartet
   erreichbare `https`-URLs; ohne Zertifikat wirkt die Seite unseriös.
5. Danach prüfen: `https://routinestars.app/privacy`, `/terms`, `/imprint`.

`routinestars.app` ist eine `.app`-Domain — die steht komplett auf der
**HSTS-Preload-Liste**, `http://` funktioniert dort grundsätzlich nicht. Erst
nach Schritt 4 ist die Seite erreichbar.

---

## Option B — beliebiger Static Host

Alles, was vier HTML-Dateien ausliefert, genügt. Kein Node, kein PHP, keine
Datenbank. Bewährt:

| Host | Vorgehen | Dauer |
|------|----------|-------|
| **Netlify Drop** | `app.netlify.com/drop` → Ordner `legal-site` ins Fenster ziehen → sofort URL | ~2 Min |
| **Cloudflare Pages** | Dashboard → Workers & Pages → Create → *Upload assets* → Ordner hochladen | ~5 Min |
| **Vercel** | `npx vercel deploy --prod` im Ordner `legal-site` | ~5 Min |
| **Eigener Webspace** | Dateien per FTP/SFTP in ein Unterverzeichnis, z. B. `/legal/` | variabel |

Netlify und Cloudflare Pages liefern `/privacy` automatisch aus `privacy.html`
aus — der Ordner-Trick aus A3 ist dort nicht nötig (schadet aber nicht).
Bei eigenem Webspace (Apache/nginx) den Ordner-Trick verwenden, das ist der
einzige Weg, der ohne Serverkonfiguration überall funktioniert.

Danach in jedem Fall **alle drei URLs im Browser öffnen** — im Privatfenster,
ohne Login, idealerweise einmal vom Handy aus mobilem Netz. Was der Reviewer
nicht öffnen kann, existiert für Apple nicht.

---

## Was App Store Connect wirklich braucht

- **Privacy Policy URL** ist ein Pflichtfeld pro App. Akzeptiert wird **jede
  öffentlich erreichbare URL** — auch
  `https://<username>.github.io/routinestars-legal/privacy`. Es muss **keine**
  eigene Domain sein.
- Also: **nicht auf `routinestars.app` warten.** Erst mit der `github.io`-URL
  einreichen, die Domain später nachziehen und das Feld in App Store Connect
  ändern (das geht jederzeit, auch ohne neuen Build).
- Die URL muss ohne Login, ohne Cookie-Banner-Zwang und ohne Weiterleitung auf
  eine Fehlerseite erreichbar sein — sonst gibt es eine Rückfrage im Review.
- Die URL muss **dauerhaft** erreichbar bleiben, nicht nur zum Review-Zeitpunkt.

**Achtung bei einem späteren Domain-Wechsel:** die Links in der App
(`app/settings/legal.tsx`) zeigen fest auf `https://routinestars.app/...`.
Wird stattdessen dauerhaft auf `github.io` gehostet, laufen diese vier Links in
der ausgelieferten App ins Leere. Entweder die Domain rechtzeitig aufsetzen oder
die URLs im Code anpassen — vor dem Production-Build entscheiden. Siehe dazu den
Cross-Check-Abschnitt in `outputs/RELEASE_CHECKLIST.md`.

---

## Pflege

- Ändert sich ein Text in `lib/legal-content.ts`, denselben Text hier nachziehen
  und `legalLastUpdated` **sowie** die vier `Stand: …`-Angaben in den HTML-Dateien
  aktualisieren (`index.html`, `privacy.html` × 2, `terms.html`, `imprint.html`).
- Die Seiten laden keine Schrift nach: `font-family: Poppins, system-ui, …`. Wer
  Poppins lokal installiert hat, sieht Poppins, alle anderen die System-Schrift.
  Das ist Absicht — kein Google-Fonts-Request, damit die Datenschutz-Seite nicht
  selbst Daten an Dritte sendet.
