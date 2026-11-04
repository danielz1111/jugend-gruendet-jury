# Landheim-Startseite: gebündelte Gestaltungsversion 2.0
Stand: 4. November 2026

## Konzept
Der hochwertige Auftakt bleibt. Schiefergrau / Landheim-Grün, sanfte Animationen,
neue Teamkarten-Akzente und ein dezenter Pitch-Countdown führen die Seite
näher an den institutionellen Auftritt des Landheims.

## Freigaben und Assets
Nach Angabe der Projektverantwortung liegen die Bildfreigaben vor.
Die offizielle Original-Logodatei und freigegebene Bilddateien müssen noch
in das Repository übernommen werden; ein provisorisches Monogramm bleibt
bis dahin bestehen. Keine fremde Logografik wird nachgebaut.
Derzeitige Campusbilder sind noch von der Schulwebsite extern referenziert.

## Datenschutz und bestehende Funktionen
Keine Änderung am Jury-Login, der Berechtigungsprüfung, Supabase oder Datenbank.
Kein Zugang zu privaten Teams oder Medien auf der öffentlichen Startseite.
Keine individuellen Schülerbewertungen.

## Abschlussprüfung vor Veröffentlichung
Original-Logodatei, lokale Bilder, Responsivität, Lesbarkeit, Build und
Jury-Anmeldung prüfen; dann Änderungen in einem einzigen Branch-Update bündeln.


## Bildwechsel in der Startseite (als Paket vorbereitet)
- Drei authentische, öffentlich sichtbare Landheim-Motive aus der offiziellen Fotosektion:
  Landheim-Campus mit Ammersee, gemeinsames Arbeiten am Laptop im Freien, praktische Arbeit in der Schreinerei.
- Automatischer Wechsel alle 8 Sekunden; sanfte Überblendung von ca. 1,45 Sekunden.
- Überschrift, Handlungsbuttons und Jury-Zugang bewegen sich nicht.
- Drei Tastatur- und Touch-bedienbare Bildindikatoren mit verständlicher Beschriftung.
- Bei reduzierter Bewegung kein automatischer Wechsel, aber manuelle Bildwahl möglich.
- Fotografische Rechte wurden vom Projektverantwortlichen nach eigener Aussage freigegeben.
- Bilddateien sind aktuell externe, offizielle URL-Quellen; vor finaler Freigabe bei
  Bedarf als optimierte lokale Dateien übernehmen, um Abhängigkeiten zu reduzieren.


## Überarbeitete Bildauswahl – 4. November 2026
Die bisherige Bildfolge aus zwei Architekturmotiven und einem leeren Steg wurde
zugunsten eines für den Gründerwettbewerb aussagekräftigeren Bildbogens ersetzt:
1. ORT: Campus und Ammersee – Identität und Wiedererkennung.
2. IDEEN: Schülerinnen und Schüler lernen kollaborativ mit Laptop – Teamarbeit.
3. UMSETZUNG: Landheim-Schreinerei – »Macht's selber«, greifbare Ergebnisse.

Es handelt sich um drei tatsächliche, öffentlich abrufbare Aufnahmen der offiziellen
Landheim-Website. Die Schreinerei-Originaldatei ist 8640 × 5760 Pixel groß;
vor Veröffentlichung unbedingt technisch optimieren oder als passende
Web-Variante bereitstellen, um mobile Ladezeiten zu schützen.
Die Originaldatei des Laptop-Fotos ist 1920 × 1080 Pixel groß.
Der Bildwechsel benötigt keine zusätzlichen personenbezogenen Angaben.
Die Freigaben für Bilder wurden vom Projektverantwortlichen bestätigt.

## Bildoptimierung vor dem ersten Deployment
- Alle drei offiziellen Bildquellen werden über Next.js Image mit sizes=100vw,
  Qualitätsstufe 75 und WebP-Ausgabe angeboten; das erste Motiv wird priorisiert.
- Der externe Bildhost ist in next.config.mjs explizit eingeschränkt.
- Vor der finalen Freigabe im Preview bei allen drei Punkten überprüfen, dass
  optimierte Bilder erfolgreich geladen werden; bei Fehlern passende lizenzierte
  lokale Bilddateien verwenden.
