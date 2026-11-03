# Jugend gründet – Juryplattform 2026/27
## Ziel
Hochwertige öffentliche Veranstaltungswebsite („Landheim trifft Startup“) und geschütztes Juryportal für den Pitch am 15. Januar 2027, 13:15–17:30 Uhr im Vortragssaal.
## Festlegungen
- 9 Unternehmerteams; Namen sind bis zur endgültigen Freigabe Platzhalter.
- ZIP-Import: Ein Ordner pro Team. Unterstützte Dateien: PDF, Office, Bilder, Videos, Quellcode-Archive; Webseiten und Apps als kontrollierte externe Links. Keine automatische Ausführung von hochgeladenem Code.
- Import als Vorschau mit Bestätigung, Dateityp-/Größenprüfung, sichere Pfadnormalisierung, Versionsvergleich und keine Löschung vorhandener Jurybewertungen.
- Persönlicher Jurylogin über Supabase Auth, serverseitige Zugriffskontrolle / Row Level Security; private Storage-Buckets.
- Jury bewertet nur **Präsentation** und **Juryfragen**; kurze Orientierungshilfen.
- Persönliche Notizen je Jurymitglied, auch zu einzelnen Teammitgliedern; **keine individuellen Schüler-Punktebewertungen**.
- Teamwechsel zentral gesteuert, freie Navigation bleibt möglich.
- Öffentliche Website zeigt nur freigegebene Inhalte.
- Kein Einsatz von Schülerbildern oder personenbezogenen Unterlagen in öffentlichem GitHub-Repository.
## Entwicklungsstand
- Next.js-Startseite mit Designgrundlage und Platzhaltern.
- /jury-demo als ausdrücklich nicht persistente Designvorschau, ohne Authentifizierung und ohne echte Daten.
## Nächste Schritte
1. Freigegebene Landheim-Fotodateien und Original-Logo in public/images integrieren; Rechte und Bildnachweise dokumentieren.
2. Supabase-Projekt/Umgebungsvariablen einrichten; Datenmodell für Teams, Medien, Jury, Bewertungen, Notizen und Veranstaltungssteuerung.
3. Authentifizierung, Zugriffskontrolle und automatische Speicherung implementieren.
4. ZIP-Import und Admin-Freigabe entwickeln.
5. Qualitäts- und Sicherheitstests sowie vollständiges Impressum/Datenschutzerklärung vor Freigabe.
