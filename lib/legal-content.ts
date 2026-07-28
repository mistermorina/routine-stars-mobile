/**
 * In-app legal texts (German, parent-facing).
 *
 * Rendered by app/settings/legal.tsx. Kept as plain data (no JSX) so the same
 * content can later feed an export, a web page or a store listing.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TODO(betreiber): Vor der Veröffentlichung im App Store MÜSSEN die Platzhalter
 * `[Name]`, `[Adresse]` und `[E-Mail]` durch die echten Angaben des
 * Verantwortlichen ersetzt werden (siehe `legalPlaceholders` unten). Sie stehen
 * absichtlich sichtbar im Text — es wird hier bewusst kein Unternehmen und
 * keine Anschrift erfunden. Dokumente mit `hasPlaceholders: true` zeigen in der
 * App einen Hinweis an.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export type LegalDocumentId = "datenschutz" | "nutzungsbedingungen" | "impressum";

export interface LegalDocument {
  id: LegalDocumentId;
  title: string;
  /** One-line summary shown on the collapsed accordion row. */
  summary: string;
  sections: LegalSection[];
  /** True while `[Name]`/`[Adresse]`/`[E-Mail]` are still unfilled. */
  hasPlaceholders?: boolean;
}

/** Single source of truth for the fields the operator still has to fill in. */
export const legalPlaceholders = {
  name: "[Name]",
  address: "[Adresse]",
  email: "[E-Mail]",
} as const;

/** Update whenever one of the texts below changes. */
export const legalLastUpdated = "Juli 2026";

export const datenschutz: LegalSection[] = [
  {
    heading: "Kurz gesagt",
    paragraphs: [
      "Routine Stars speichert alle Inhalte ausschließlich auf deinem Gerät. Es gibt keine Benutzerkonten, keine Server und keine Cloud-Synchronisierung.",
      "Es findet keine Analyse statt, es wird keine Werbung ausgeliefert und es werden keine Daten an uns oder an Dritte weitergegeben.",
    ],
  },
  {
    heading: "Verantwortlicher",
    paragraphs: [
      `Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist: ${legalPlaceholders.name}, ${legalPlaceholders.address}, ${legalPlaceholders.email}.`,
      "Da die App keine Daten überträgt, erreichen uns auch keine personenbezogenen Daten aus der Nutzung der App.",
    ],
  },
  {
    heading: "Welche Daten die App speichert",
    paragraphs: [
      "Kinderprofile: Vorname oder Spitzname, gewählter Avatar (Emoji, Illustration oder ein selbst ausgewähltes Foto), Altersgruppe, Farbwelt und Hintergrund.",
      "Familienalltag: Routinen und Aufgaben, erledigte Aufgaben, gesammelte Sterne, Belohnungen, Sticker und der lokale Aktivitätsverlauf.",
      "Einstellungen: Ton, Vibration, Benachrichtigungs-Präferenzen und der Onboarding-Status.",
      "Elternschutz: Die Eltern-PIN wird nur als Prüfwert gespeichert, nicht im Klartext.",
    ],
  },
  {
    heading: "Speicherung auf dem Gerät",
    paragraphs: [
      "Alle genannten Angaben liegen im lokalen App-Speicher deines Geräts. Profilfotos werden zusätzlich in den geschützten Dateibereich der App kopiert.",
      "Es gibt keine Übermittlung an einen Server, keine Weitergabe an Dritte und keine Auftragsverarbeitung.",
      "Wenn dein Gerät ein Backup anlegt (zum Beispiel über iCloud oder Google), kann dieses Backup den App-Speicher enthalten. Das steuerst du in den Einstellungen deines Geräts.",
    ],
  },
  {
    heading: "Fotos für Avatare",
    paragraphs: [
      "Ein Foto wird nur verwendet, wenn du die Fotomediathek ausdrücklich freigibst und selbst ein Bild auswählst.",
      "Das ausgewählte Bild wird in den App-Ordner kopiert und bleibt dort. Es wird nicht hochgeladen, nicht ausgewertet und nicht geteilt.",
      "Du kannst ein Profilfoto jederzeit durch einen anderen Avatar ersetzen oder das Profil löschen.",
    ],
  },
  {
    heading: "Keine Analyse, keine Werbung",
    paragraphs: [
      "Die App enthält keine Analyse- oder Tracking-Bausteine, keine Werbenetzwerke, keine Cookies und kein Profiling.",
      "Statistiken und Fortschritte in der App werden ausschließlich auf dem Gerät aus deinen eigenen Einträgen berechnet.",
    ],
  },
  {
    heading: "Rechtsgrundlage",
    paragraphs: [
      "Die Nutzung findet im Rahmen persönlicher und familiärer Tätigkeiten statt (Art. 2 Abs. 2 lit. c DSGVO). Die Verarbeitung geschieht allein auf deinem Gerät und unter deiner Kontrolle.",
      "Für den Zugriff auf die Fotomediathek gilt zusätzlich deine ausdrückliche Einwilligung, die du in den Systemeinstellungen jederzeit widerrufen kannst.",
    ],
  },
  {
    heading: "Speicherdauer und Löschung",
    paragraphs: [
      "Die Daten bleiben so lange gespeichert, bis du sie löschst. Einzelne Profile, Routinen, Belohnungen oder Sticker kannst du jederzeit im Elternbereich entfernen.",
      "Alle lokalen Daten löschst du im Elternbereich unter „Konto“ mit „Alles zurücksetzen“. Auch das Deinstallieren der App entfernt sämtliche gespeicherten Inhalte.",
      "Gelöschte Daten lassen sich nicht wiederherstellen — auch nicht von uns.",
    ],
  },
  {
    heading: "Betroffenenrechte",
    paragraphs: [
      "Dir stehen die Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch zu (Art. 15 bis 21 DSGVO). Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren.",
      "Weil alle Daten auf deinem Gerät liegen, übst du diese Rechte direkt in der App aus: Du siehst jeden Eintrag, kannst ihn ändern und vollständig löschen.",
      `Für Fragen zum Datenschutz erreichst du uns unter ${legalPlaceholders.email}. Wir können deine lokalen Daten weder einsehen noch herausgeben oder wiederherstellen.`,
    ],
  },
  {
    heading: "Kinder und Familien",
    paragraphs: [
      "Routine Stars ist für die gemeinsame Nutzung in der Familie gedacht. Profile werden von Erwachsenen angelegt, der Elternbereich ist mit einer PIN geschützt.",
      "Wir empfehlen, für Kinderprofile nur Vornamen oder Spitznamen zu verwenden und keine sensiblen Angaben zu hinterlegen.",
    ],
  },
  {
    heading: "Änderungen dieser Erklärung",
    paragraphs: [
      `Diese Datenschutzerklärung wird angepasst, wenn sich Funktionen der App ändern. Stand: ${legalLastUpdated}.`,
    ],
  },
];

export const nutzungsbedingungen: LegalSection[] = [
  {
    heading: "Geltungsbereich",
    paragraphs: [
      "Diese Bedingungen gelten für die Nutzung der App Routine Stars auf deinem Gerät.",
    ],
  },
  {
    heading: "Was die App ist",
    paragraphs: [
      "Routine Stars ist ein Hilfsmittel für Familien: Routinen planen, Aufgaben abhaken, Sterne sammeln und Belohnungen vereinbaren.",
      "Die App ist kein medizinisches, therapeutisches oder pädagogisches Fachangebot und ersetzt keine fachliche Beratung.",
    ],
  },
  {
    heading: "Einrichtung durch Erwachsene",
    paragraphs: [
      "Profile, Routinen und Belohnungen werden von einer erziehungsberechtigten Person eingerichtet. Sie entscheidet auch, welche Angaben in den Profilen stehen.",
      "Der Elternbereich ist mit einer PIN geschützt. Bewahre die PIN so auf, dass Kinder sie nicht mitlesen können.",
    ],
  },
  {
    heading: "Deine Daten liegen bei dir",
    paragraphs: [
      "Alle Inhalte werden lokal auf deinem Gerät gespeichert. Es gibt kein Konto, mit dem sich Daten auf ein anderes Gerät übertragen ließen.",
      "Bei Geräteverlust, Zurücksetzen oder Deinstallation sind die Daten verloren. Wir können nichts wiederherstellen.",
    ],
  },
  {
    heading: "Kosten",
    paragraphs: [
      "Die App ist in dieser Version kostenlos nutzbar. Geplante Premium-Funktionen sind noch nicht buchbar; Bereiche, die noch nicht live sind, sind in der App gekennzeichnet.",
    ],
  },
  {
    heading: "Änderungen und Verfügbarkeit",
    paragraphs: [
      "Funktionen können sich mit neuen Versionen ändern, wegfallen oder hinzukommen. Ein Anspruch auf eine bestimmte Funktion oder auf dauerhafte Verfügbarkeit besteht nicht.",
    ],
  },
  {
    heading: "Haftung",
    paragraphs: [
      "Die App wird mit Sorgfalt entwickelt und in der jeweils verfügbaren Fassung bereitgestellt. Es wird nicht zugesichert, dass sie fehlerfrei oder ununterbrochen nutzbar ist.",
      "Die Haftung richtet sich nach den gesetzlichen Vorschriften. Für den Verlust lokal gespeicherter Daten wird nur im Rahmen dieser Vorschriften gehaftet.",
    ],
  },
  {
    heading: "Kontakt",
    paragraphs: [
      `Fragen zur Nutzung: ${legalPlaceholders.email}. Stand: ${legalLastUpdated}.`,
    ],
  },
];

export const impressum: LegalSection[] = [
  {
    heading: "Angaben gemäß § 5 DDG",
    paragraphs: [
      legalPlaceholders.name,
      legalPlaceholders.address,
      `E-Mail: ${legalPlaceholders.email}`,
    ],
  },
  {
    heading: "Verantwortlich für den Inhalt",
    paragraphs: [
      `Nach § 18 Abs. 2 MStV: ${legalPlaceholders.name}, ${legalPlaceholders.address}.`,
    ],
  },
  {
    heading: "Noch auszufüllen",
    paragraphs: [
      "Die Angaben in eckigen Klammern sind Platzhalter und müssen vor der Veröffentlichung durch die echten Daten des Anbieters ersetzt werden.",
    ],
  },
];

export const legalDocuments: LegalDocument[] = [
  {
    id: "datenschutz",
    title: "Datenschutzerklärung",
    summary: "Was gespeichert wird und warum nichts das Gerät verlässt",
    sections: datenschutz,
    hasPlaceholders: true,
  },
  {
    id: "nutzungsbedingungen",
    title: "Nutzungsbedingungen",
    summary: "Kurz und ehrlich: Was die App leistet und was nicht",
    sections: nutzungsbedingungen,
    hasPlaceholders: true,
  },
  {
    id: "impressum",
    title: "Impressum",
    summary: "Anbieterangaben — vor der Veröffentlichung zu ergänzen",
    sections: impressum,
    hasPlaceholders: true,
  },
];

/** Static privacy claim shown at the top of the legal screen. */
export const privacySummary = {
  title: "Datenschutz auf einen Blick",
  statement:
    "Alle Daten bleiben auf diesem Gerät. Keine Analyse, keine Werbung, keine Weitergabe.",
  points: [
    "Speicherung nur lokal — kein Konto, kein Server, keine Synchronisierung.",
    "Keine Analyse-Bausteine, keine Werbung, kein Tracking.",
    "Profilfotos bleiben im geschützten App-Ordner auf dem Gerät.",
  ],
} as const;
