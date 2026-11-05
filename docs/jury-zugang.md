# Juryzugänge – manuelle Startpasswörter (ohne SMTP)

## Gewünschter Ablauf

Die Wettbewerbsleitung versendet **eine gemeinsame persönliche E-Mail** über
das eigene Landheim-Postfach mit dem Link zur Juryplattform.

Im geschützten Juryportal → **Verwaltung → Persönliche Juryzugänge** werden
für die fünf vorab freigegebenen Juryadressen individuelle Startpasswörter
erzeugt. Es werden hierbei keinerlei automatisierte E-Mails versendet.

Die Wettbewerbsleitung kopiert das pro Konto nur einmal angezeigte
zufällige Startpasswort und gibt es dem betreffenden Mitglied vertraulich
weiter (am besten über einen von der gemeinsamen E-Mail getrennten Kanal).
Es gibt **keine Passwortliste in der Jury-Datenbank** und kein öffentliches
Formular zur Jura-Registrierung.

Das Jurymitglied meldet sich mit der hinterlegten E-Mail-Adresse und
dem Startpasswort an. Es wird unmittelbar zu
`/jury/passwort-wechseln` geleitet, um ein eigenes Passwort (mind. 12 Zeichen)
zu vergeben. Erst danach darf es seine vertraulichen Teams,
Bewertungen und Notizen sehen.

Bei vergessenem Passwort setzt die Wettbewerbsleitung das bestehende
Jurykonto auf ein neues zufälliges Startpasswort zurück. Die Pflicht zur
Passwortänderung wird erneut gesetzt.

## Sicherheitsarchitektur

- Supabase Auth speichert ausschließlich die Passwort-Hashes.
- Supabase Edge Function `jury-access-admin` besitzt allein den
  Supabase-Service-Schlüssel; kein Geheimschlüssel in Vercel oder im Client.
- Die Funktion überprüft auf jedem Aufruf die Supabase-Auth-Identität.
  Der Adminteil erfordert zusätzlich `jury_members.is_admin = true`.
  Für Useranlage/-reset werden ausschließlich E-Mails aus der
  vorab genehmigten Liste `jury_authorized_emails` zugelassen.
- Nie automatisch Administratorrechte für Jurymitglieder.
- `must_change_password` blockiert den serverseitigen Juryzugang sowie
  die RLS-Lese- und Schreibrechte für vertrauliche Bewertungen und Notizen
  während der temporären Anmeldung, auch wenn ein älteres JWT gültig ist.
- Das neue Passwort kann nur der angemeldete Kontoinhaber selbst festlegen;
  die Edge Function nimmt hierfür ausschließlich dessen validiertes JWT.
- Ein Passwort-Reset sperrt zuerst den Juryzugang über
  `must_change_password=true`, dann ersetzt Supabase Auth das Passwort.
  Ältere JWTs können bis zum Ablauf technisch bestehen bleiben, erfüllen
  aber die neue Jury-Berechtigungsprüfung nicht mehr.
- Das Startpasswort erscheint nur in der erfolgreichen einmaligen
  Admin-Antwort und wird nicht in lokalen Datenbanken gespeichert.

## Durchführung

1. Nach abgeschlossenem **Preview-Test** beim Admin einloggen.
2. Verwaltung → **Persönliche Juryzugänge** öffnen. Status je Mitglied prüfen.
3. Beim gewünschten Mitglied **Startpasswort erzeugen** anklicken.
4. Das angezeigte Einmal-Passwort sicher übernehmen und persönlich senden.
   Einmaliges Anzeigen heißt: Bei Verlust ein neues Passwort erzeugen.
5. Jurymitglied meldet sich unter `/jury` an, legt sein eigenes Passwort
   fest und meldet sich danach neu an.
6. Beim Zurücksetzen in derselben Verwaltung **Passwort zurücksetzen** wählen.

## Tests vor Freigabe / Versand

- Admin-Ansicht ist nur für Adminzugänge sichtbar.
- Eine unbekannte E-Mail erhält keine Juryrechte.
- Keine Jury-E-Mail wird durch die Plattform versendet.
- Erstellung eines echten Testkontos ohne Maildienst.
- Anmeldung mit Startpasswort → zwingender Passwortwechsel.
- Vor Passwortänderung kein Zugriff auf Juryunterlagen oder Bewertungen.
- Nach Passwortänderung Login mit neuem Passwort möglich; altes unwirksam.
- Admin-Reset verlangt erneut Passwortänderung.
- Elternanmeldung, Juryberechtigungen und Notizen getrennt.
- Mobile Ansicht der Admin-Dialoge prüfen.

**Wichtig:** In der Vorschau dürfen noch keine Passwörter für die echten
Jurymitglieder angelegt oder verändert werden, bevor der komplette
Test mit einem dafür vorgesehenen Testkonto erfolgreich abgeschlossen ist.
