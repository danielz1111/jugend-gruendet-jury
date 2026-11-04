# Juryzugang: Ein gemeinsamer Link, individuelle Passwortvergabe

## Ablauf

Die Wettbewerbsleitung schickt **eine eigene persönliche E-Mail** mit dem gemeinsamen
Link `https://<endgueltige-domain>/jury/passwort-vergessen` an die Jury.

1. Das Jurymitglied trägt seine bereits hinterlegte E-Mail-Adresse ein.
2. Supabase sendet ausschließlich an diese Adresse einen zeitlich begrenzten
   persönlichen Magic-Link bzw. bei bestehenden Konten einen Recovery-Link.
3. Das Mitglied öffnet den Link, wählt auf `/jury/passwort-neu` ein eigenes
   Passwort mit mindestens 12 Zeichen und bestätigt es.
4. Dabei wird der Zugriff für die bereits freigegebene E-Mail-Adresse über
   eine strenge Supabase-RLS-Policy aktiviert. Der neue Account ist **kein Administrator**.
5. Die Anmeldung erfolgt über die E-Mail-Adresse und das selbst gesetzte Passwort.
   Bei vergessenem Passwort wird derselbe gemeinsame Einstieg verwendet.

**Keine E-Mail an die Jury wurde beim Vorbereiten der fünf Freigaben gesendet.**
Es werden keine vorläufigen Passwörter benötigt. Das eigene Passwort wird
nicht in der Juryanwendung gespeichert; Supabase Auth verarbeitet es.

## Berechtigung

Die Tabelle `public.jury_authorized_emails` enthält ausschließlich von der
Wettbewerbsleitung vorher genehmigte E-Mail-Adressen. Der Öffentlichkeit ist
keine Liste zugänglich. Die schmale anonyme RPC
`public.jury_email_preapproved(p_email)` beantwortet nur die Ja/Nein-Frage;
sie dient im Server als Schranke gegen beliebige Neu-Anmeldungen.
Supabase-Rate-Limits reduzieren Versandmissbrauch.

Beim tatsächlichen Festlegen des Passworts muss das Auth-Token aus der
persönlichen E-Mail stammen und eine bestätigte E-Mail-Adresse nachweisen.
Eine `INSERT`-RLS-Policy erlaubt ausschließlich dem Besitzer dieser E-Mail
den selbstbezogenen Eintrag in `jury_members`, mit exakt dem vordefinierten
Anzeigenamen und `is_admin=false`. Die schon vorhandene Admin-Kennung
bleibt unverändert.

Eine Antwort des Aktivierungsformulars verrät ausdrücklich nicht, ob eine
E-Mail-Adresse bereits in der Juryliste steht.

## Einmalige Einrichtung vor dem E-Mail-Versand

1. In Supabase **Authentication → URL Configuration** die endgültige Site URL
   auf die öffentliche Website setzen und `https://<endgueltige-domain>/jury/passwort-neu`
   als Redirect URL eintragen. Für den Test zusätzlich die konkrete Vorschau-URL
   `https://<vorschau-host>/jury/passwort-neu` erlauben. Keine generische
   Wildcard für fremde Vercel-Domains verwenden.
2. Unter **Authentication → Email Templates** die Vorlagen
   **Magic Link / Confirm signup** sowie **Reset password** prüfen;
   sie müssen einen funktionierenden Link mit `{{ .ConfirmationURL }}` verschicken.
3. Unter **Authentication → SMTP Settings** E-Mail-Zustellung an externe Empfänger
   sicherstellen. Der Supabase-Standardversand ist häufig eingeschränkt.
4. Vor Versand an echte Jurymitglieder einen ausdrücklich als TEST markierten
   Benutzer mit erreichbarer, eigener E-Mail hinzufügen und **den kompletten Ablauf**
   von Antrag bis Juryanmeldung erproben; Test anschließend entfernen.

## Sicherheits- und Funktionstests

- Unbekannte E-Mail führt zu keiner Juryberechtigung.
- Freigegebene E-Mail bekommt ihren persönlichen Link, bestätigt Identität.
- Passwort kann erst nach Bestätigung gesetzt werden.
- Nur eigene Jurybewertungen und Notizen sichtbar.
- Adminrechte werden niemals bei Selbstaktivierung vergeben.
- Passwort-Reset eines bestehenden Mitglieds funktioniert.
- Abgelaufener/ungültiger Link wird zurückgewiesen.
- Freischaltung Eltern/Jury bleibt strikt getrennt.

**Betriebshinweis:** Die fünf Mitglieder sind zunächst nur **vorberechtigt**,
keine Auth-Konten. Der Auth-Datensatz entsteht bei der ersten Linkbestätigung.
Das Verfahren benötigt keinen Supabase Service-Role-Key in Vercel.
Vor dem Produktivstart ist eine vollständige E-Mail-End-to-End-Prüfung verpflichtend.
