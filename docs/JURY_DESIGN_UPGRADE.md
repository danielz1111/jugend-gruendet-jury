# Juryportal: behutsames Design-Upgrade

Die vorhandenen Farben Dunkelblau, Creme/Weiß und Gold werden beibehalten. Kein neues Dark-Mode-Theme und keine zusätzlichen Beispielteams.

## Funktionen

1. Die bestehenden neun Teamkarten erhalten sanfte Hover-Bewegungen und einen Platz für das geschützte Teamfoto. Ein Foto wird nur angezeigt, wenn `teams.jury_photo_path` gesetzt ist.
2. Alle PDF- und Bildanlagen öffnen in der gleichen, vergrößerbaren Vorschau auf der Website. Die vorhandene geschützte Material-API bleibt maßgeblich.
3. Auf der persönlichen Startseite sieht das Jurymitglied seine abgegebenen Bewertungen und offenen Teams; die Werte werden aus den bereits per RLS gefilterten eigenen Bewertungen berechnet.
4. Die Wettbewerbsleitung kann das aktuelle Team zentral setzen. Dieser Zustand ist in `event_state` gespeichert; alle angemeldeten Jurymitglieder sehen den Stand durch eine ca. 15-sekündliche Aktualisierung und können jedes Team weiterhin unabhängig öffnen.
5. Sanfte Animationen und leichte Glaseffekte ergänzen die bestehenden Karten, ohne die Farbwelt zu ersetzen. `prefers-reduced-motion` wird beachtet.
6. Bewertungsbalken und Speicherzustände erhalten ruhigere Übergänge. Die bestehende Bewertungslogik, persönliche Notizen, RLS und Freigabe bleiben unverändert.

## Geschützte Teamfotos

Teamfotos (nach Prüfung der erforderlichen Einwilligungen) ausschließlich in den privaten Bucket `team-private` unter `team-photos/<team-id>/<dateiname>.jpg` hochladen und den Pfad in `teams.jury_photo_path` eintragen. Es werden keine Schülerbilder in `public/` oder `team-public` veröffentlicht. Der abrufende Endpunkt `/api/jury/team-photo/[id]` prüft die Jurysitzung und den Pfad. Bis zum Upload werden neutrale Platzhalter angezeigt.

## Betrieb

Keine neue Datenbankmigration erforderlich: `event_state`, `teams.jury_photo_path` und private Storage-Richtlinien sind vorhanden. Das Team wird vor dem Wettbewerbstag nicht automatisch aufgerufen. Der Teamstatus wird bewusst als „Vorbereitung“ angezeigt, bis die Wettbewerbsleitung aktiv auswählt.
