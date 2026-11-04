# Jurykonten und persönliche Passwörter – Einrichtung

## Grundsatz

Jurymitglieder werden **nur auf Einladung durch die Wettbewerbsleitung** zugelassen.
Ein persönliches Passwort wird ausschließlich vom Jurymitglied selbst festgelegt.
Es gibt keine öffentliche Juryregistrierung und keine Liste einsehbarer Passwörter.
Nach einer Einladung oder Passwort-Wiederherstellung öffnet sich die Seite
`/jury/passwort-neu` über einen befristeten Supabase-E-Mail-Link.

## Einmalige Einrichtung in Supabase

1. In **Authentication → URL Configuration** die tatsächliche öffentliche Website als
   **Site URL** eintragen. Weiterleitungsziele `https://<eigene-domain>/jury/passwort-neu`
   unter **Redirect URLs** erlauben. Für Tests außerdem die *genaue* Preview-Adresse
   `https://<preview-host>/jury/passwort-neu` erlauben. Nicht pauschal fremde Domains
   per `*.vercel.app` freischalten.
2. Unter **Authentication → Email Templates** sowohl **Invite user** als auch
   **Reset password** kontrollieren. Die Vorlagen sollen `{{ .ConfirmationURL }}`
   enthalten und zum persönlichen Link führen.
3. Unter **Authentication → SMTP Settings** prüfen, ob die Plattform Einladungen
   und Passwortmails an beliebige externe Empfänger versenden kann. Die
   Supabase-Standard-E-Mail-Zustellung ist für Produktion eingeschränkt; bei Bedarf
   einen eigenen SMTP-Anbieter einrichten.
4. Echte E-Mail-Adresse und Mailzustellung mit einem ausdrücklich eingeladenen
   Testkonto prüfen, bevor eine externe Jury eingeladen wird.

## Neues Jurymitglied einladen (derzeit im Supabase-Dashboard)

1. **Authentication → Users → Add user → Send invitation** auswählen.
   Die E-Mail-Adresse des Jurymitglieds eintragen. Die Einladung verschickt
   einen Link zum selbstständigen Festlegen eines Passworts.
2. Die neu erstellte User-ID in **Table Editor → public.jury_members** als
   `user_id` mit `display_name` und `is_admin = false` eintragen.
   **Wichtig:** Ohne diesen Eintrag bleibt der Zugang zum geschützten Jurybereich
   gesperrt. Die Rolle wird nicht durch Registrierungsdaten zugewiesen.
3. Das Jurymitglied klickt in seiner E-Mail auf den Einladungslink, wählt auf
   `/jury/passwort-neu` ein Passwort und meldet sich bei der Jury an.
   Ist in Supabase keine `redirectTo`-Adresse für Einladungen gesetzt, wird
   zum konfigurierten **Site URL** zurückgeleitet; die Startseite erkennt
   `#type=invite` und leitet zur Passwortseite weiter.
4. Passwörter weder abfragen noch in E-Mails verteilen.

## Passwort vergessen

- Auf der Startseite beim Juryformular oder auf `/jury` den Link
  **„Passwort vergessen oder erstmalig festlegen?“** anklicken.
- E-Mail-Adresse eintragen → Supabase sendet bei vorhandenem Konto einen
  Link. Der Dienst bestätigt aus Datenschutzgründen nicht, ob ein Konto besteht.
- Link öffnen → neues Passwort (mindestens zwölf Zeichen) zweimal eingeben.
  Danach ist eine erneute Anmeldung nötig.
- Bei Problemen die erlaubten Redirect-URLs, die E-Mail-Vorlage und SMTP
  prüfen. Der Test mit künstlichen E-Mail-Domains ist nicht aussagekräftig.

## Vor der Veröffentlichung noch prüfen

- Einladung eines neuen, echten Testkontos und Passwortwahl über den Mail-Link.
- Anmeldung als freigeschaltetes Jurymitglied funktioniert.
- Anmeldung mit nicht freigeschalteter Auth-ID wird verweigert.
- Passwort-Wiederherstellung, Ablauf des Links und falsche Eingaben.
- Jury-/Elternberechtigungen bleiben getrennt.

Derzeit ist kein Supabase-Geheimschlüssel in Vercel hinterlegt. Daher ist
**die Einladung neuer Jurymitglieder bewusst noch keine Funktion im Juryportal**,
sondern erfolgt sicher über das Supabase-Dashboard. Eine spätere Admin-Oberfläche
würde eine serverseitig geschützte Admin-API sowie Rollenprüfung benötigen.
