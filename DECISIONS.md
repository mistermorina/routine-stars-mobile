# DECISIONS.md — Architektur-Entscheidungen

> **Rolle im Loop:** Festgehaltene Entscheidungen, damit der Loop konsistent
> bleibt und nicht jede Runde neu entscheidet. Neue Entscheidung = neuer
> Eintrag (nicht alte überschreiben; bei Umkehr „Ersetzt durch …" vermerken).
>
> Ergänzt das bestehende `Agents.md` (Execution-Log mit der Umsetzungs-Historie)
> — `DECISIONS.md` hält das **Warum** kurz fest, `Agents.md` das **Was wann**.

## Format

```
### ADR-NNN — <Titel>
- Datum: YYYY-MM-DD
- Status: akzeptiert | ersetzt durch ADR-MMM
- Kontext: <Problem/Zwang>
- Entscheidung: <was gewählt wurde>
- Konsequenz: <Folgen, Trade-offs>
```

---

### ADR-001 — Expo Router (file-based routing)
- Datum: 2026-03-02
- Status: akzeptiert
- Kontext: Navigation für native App nötig, Web-Variante nutzt Next.js-Routing.
- Entscheidung: Expo Router mit Bottom-Tabs (Routinen, Belohnungen, Sterne),
  Stacks für Auth/Onboarding/Settings, Modal für Parent-Login (PIN).
- Konsequenz: Screens leben als Dateien unter `app/`; Routing-Struktur folgt dem
  Verzeichnisbaum.

### ADR-002 — NativeWind v4 statt StyleSheet
- Datum: 2026-03-02
- Status: akzeptiert
- Kontext: Konsistenz mit der Tailwind-basierten Web-Variante gewünscht.
- Entscheidung: Styling über NativeWind-`className`; `cn()` für bedingte Klassen.
- Konsequenz: Gleiche Tailwind-Klassen wie im Web; Inline-`style` nur für
  dynamische Werte.

### ADR-003 — Icons als String-Referenz
- Datum: 2026-03-02
- Status: akzeptiert
- Kontext: Routinen/Tasks werden in AsyncStorage persistiert und müssen
  serialisierbar sein.
- Entscheidung: `iconName: string` in Typen; Auflösung zur Laufzeit über
  `getIcon()` aus einer zentralen Icon-Registry.
- Konsequenz: Keine Component-Referenzen in persistierten Daten; neue Icons
  müssen in `lib/icons.tsx` + `lib/icon-registry.ts` registriert werden.

### ADR-004 — Auth-State In-Memory
- Datum: 2026-03-02
- Status: akzeptiert
- Kontext: MVP ohne Backend; Fokus auf lokale Familien-Daten.
- Entscheidung: Auth läuft über React Context (`contexts/auth-context.tsx`),
  nicht persistiert; nur fachliche Daten gehen in AsyncStorage.
- Konsequenz: Login geht bei App-Neustart verloren — bewusst akzeptiert für den
  aktuellen Stand; bei späterem Backend neu zu bewerten.

### ADR-005 — Lokale Kalendertag-Logik
- Datum: 2026-06-02
- Status: akzeptiert
- Kontext: Tagesfortschritt war zeitzonen-anfällig (UTC-Sprünge um Mitternacht).
- Entscheidung: Zentrale `getLocalIsoDate()` in `lib/local-date.ts` für alle
  tagesbezogenen Vergleiche; per `test:progress-smoke` erzwungen.
- Konsequenz: Kein direktes `toISOString()` für Datumsschlüssel mehr erlaubt.

---

_(neue Entscheidungen unten anhängen)_
