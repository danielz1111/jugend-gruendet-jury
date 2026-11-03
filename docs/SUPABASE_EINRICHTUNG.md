# Supabase-Einrichtung – Jugend gründet
## Status
Die SQL-Dateien sind im GitHub-Repository vorbereitet, aber **noch nicht ausgeführt**. Es existieren noch keine bestätigten Storage-Buckets oder aktivierten Logins.
## Vorbereitung
1. In Supabase ein eigenes Projekt für die Juryplattform wählen/erstellen (EU-Region und schulische Datenschutzvorgaben prüfen).
2. Unter **Project Settings → API** die Projekt-URL und den öffentlichen (publishable/anon) Schlüssel ermitteln.
3. Diese Werte ausschließlich in **Vercel → Project → Settings → Environment Variables** als `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` hinterlegen. Keine Secrets im GitHub-Repository speichern.
4. SQL-Dateien **in Reihenfolge** prüfen und im Supabase SQL Editor ausführen:
   - `supabase/migrations/202611030001_initial_schema.sql`
   - `supabase/migrations/202611030002_storage.sql`
5. Auth-Benutzer für Jury persönlich einladen. `jury_members`-Einträge nur durch Admin/gesicherten Verwaltungsprozess anlegen; es gibt absichtlich keine öffentliche Selbstregistrierung.
6. Vor Echtdaten mit Testkonten prüfen: öffentliche Besucher dürfen keine privaten Dateien sehen; Jurymitglieder nur ihre eigenen Notizen und Bewertungen; Admin darf Dateien hochladen.
## Bildstrategie
- Landheim-Originalbilder, Logo: `public/images/`, versioniert im GitHub-Repository, automatisch durch Vercel bereitgestellt.
- Öffentliche Teamlogos und ausdrücklich freigegebene Fotos: `team-public`.
- Interne Teamfotos und Unterlagen: `team-private` bzw. `jury-private`.
- Originaldateien separat sichern; Veranstaltungsunterlagen für den Pitch-Tag zusätzlich lokal vorhalten.
## Sicherheit
- Der Supabase-Schlüssel für Server-Adminrechte (service_role/secret) darf **niemals** in `NEXT_PUBLIC_...` stehen.
- Private Dateien nicht als öffentliche URLs ausgeben.
- Die Storage-Regeln sind eine Grundlage, keine abgeschlossene Sicherheitsprüfung.
- Für den späteren ZIP-Import sind zusätzlich Dateityp-, Pfad-, Größen- und Inhaltsprüfungen nötig.
- Veröffentlichen von Minderjährigenfotos nur nach dokumentierter Einwilligung/Freigabe.
