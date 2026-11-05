import type { Metadata } from 'next';

export type LegalTopic = 'kontakt' | 'impressum' | 'datenschutz';

export const legalTitles: Record<LegalTopic, string> = {
  kontakt: 'Kontakt',
  impressum: 'Impressum',
  datenschutz: 'Datenschutz',
};

const schoolImprint = 'https://www.landheim-ammersee.de/de/impressum';
const schoolPrivacy = 'https://www.landheim-ammersee.de/de/datenschutz';

export function LegalInformation({ topic }: { topic: LegalTopic }) {
  return (
    <article className="legal-content">
      <p className="legal-eyebrow">JUGEND GRÜNDET · LANDHEIM AMMERSEE · 2026/27</p>
      <h1 id="legal-heading">{legalTitles[topic]}</h1>

      {topic === 'kontakt' && (
        <>
          <p className="legal-lead">Ihr Kontakt zum Schulprojekt Jugend gründet und zur digitalen Juryplattform.</p>
          <section className="legal-contact-card">
            <span className="legal-kicker">PROJEKTLEITUNG</span>
            <h2>Daniel Zech</h2>
            <p>Projektleitung · Wirtschaft und Recht<br />Landheim Ammersee</p>
            <a className="legal-primary-link" href="mailto:dzech@landheim-ammersee.de?subject=Jugend%20gr%C3%BCndet%20-%20Anfrage">E-Mail schreiben <span aria-hidden="true">↗</span></a>
            <p className="legal-address">dzech@landheim-ammersee.de</p>
          </section>
          <h2>Fragen zum Zugang</h2>
          <p>Bei Schwierigkeiten mit der Anmeldung nennen Sie bitte die verwendete E-Mail-Adresse und beschreiben Sie das Problem kurz. Bitte senden Sie keine Passwörter oder Einmalcodes mit.</p>
          <h2>Allgemeiner Schulkontakt</h2>
          <p>Stiftung Landheim Schondorf am Ammersee · Landheim 1–17 · 86938 Schondorf am Ammersee<br /><a href="mailto:landheim@landheim-ammersee.de">landheim@landheim-ammersee.de</a> · Telefon <a href="tel:+4981928090">08192 809-0</a></p>
        </>
      )}

      {topic === 'impressum' && (
        <>
          <p className="legal-lead">Anbieterinformationen und Ansprechpartner zum Schulprojekt Jugend gründet am Landheim Ammersee.</p>
          <h2>Angaben zum Landheim</h2>
          <p><strong>Stiftung Landheim Schondorf am Ammersee</strong><br />Landheim 1–17<br />86938 Schondorf am Ammersee<br />Telefon: <a href="tel:+4981928090">08192 809-0</a><br />E-Mail: <a href="mailto:landheim@landheim-ammersee.de">landheim@landheim-ammersee.de</a></p>
          <p>Rechtsfähige Stiftung des bürgerlichen Rechts<br />Vertretungsberechtigter Leiter: Rüdiger Häusler<br />Aufsichtsbehörde: Regierung von Oberbayern</p>
          <p><a href={schoolImprint} target="_blank" rel="noopener noreferrer">Offizielles Impressum des Landheims ansehen <span aria-hidden="true">↗</span></a></p>
          <h2>Projektleitung und Ansprechpartner</h2>
          <p><strong>Daniel Zech</strong><br />Projektleitung · Wirtschaft und Recht<br /><a href="mailto:dzech@landheim-ammersee.de">dzech@landheim-ammersee.de</a></p>
          <h2>Konzeption und technische Umsetzung</h2>
          <p>Daniel Zech</p>
          <h2>Über die Plattform</h2>
          <p>Diese Plattform begleitet den Gründerwettbewerb Jugend gründet am Landheim Ammersee im Schuljahr 2026/27. Sie stellt freigegebene Unternehmerteams vor und unterstützt die Vorbereitung und Durchführung des schulischen Pitch-Tages.</p>
          <p className="legal-caution">Die Angaben zur Stiftung stammen aus ihrem offiziellen Impressum. Ob die Stiftung auch rechtlich Anbieterin dieser eigenständigen Projektplattform ist, muss organisatorisch bestätigt werden. Die Nennung des Landheims allein ersetzt diese Klärung nicht.</p>
        </>
      )}

      {topic === 'datenschutz' && (
        <>
          <p className="legal-lead">Informationen zur Verarbeitung personenbezogener Daten auf der Jugend-gründet-Plattform.</p>
          <p>Die öffentliche Startseite und der persönliche, zugangsgeschützte Jurybereich sind voneinander getrennt. Die nachfolgenden Angaben ergänzen die <a href={schoolPrivacy} target="_blank" rel="noopener noreferrer">Datenschutzhinweise des Landheims <span aria-hidden="true">↗</span></a> um plattformspezifische Funktionen.</p>

          <h2>1. Verantwortlichkeit und Ansprechpersonen</h2>
          <p>Das Projekt findet am Landheim Ammersee statt. Angaben zur Stiftung: Stiftung Landheim Schondorf am Ammersee, Landheim 1–17, 86938 Schondorf am Ammersee, <a href="mailto:landheim@landheim-ammersee.de">landheim@landheim-ammersee.de</a>. Ansprechpartner für die Plattform ist Daniel Zech, <a href="mailto:dzech@landheim-ammersee.de">dzech@landheim-ammersee.de</a>.</p>
          <p>Der auf der Landheim-Website genannte Datenschutzbeauftragte ist Felix Platzer, <a href="mailto:fplatzer@landheim-ammersee.de">fplatzer@landheim-ammersee.de</a>. Die verbindliche Zuordnung der datenschutzrechtlichen Verantwortlichkeit für diese eigenständig betriebene Projektplattform ist mit der Schule zu bestätigen.</p>

          <h2>2. Technischer Seitenaufruf</h2>
          <p>Beim Aufruf der Website werden für die Auslieferung und Sicherheit technisch erforderliche Verbindungsdaten verarbeitet. Dazu können insbesondere IP-Adresse, Zeitpunkt des Zugriffs, angeforderte Seite und Browserinformationen gehören. Die Bereitstellung der Website erfolgt über Vercel.</p>

          <h2>3. Persönliche Juryzugänge</h2>
          <p>Für die Anmeldung und Berechtigungsverwaltung werden insbesondere die E-Mail-Adresse, die Benutzerkennung, der Anzeigename und die zugewiesene Rolle verarbeitet. Die Anmeldung wird über Supabase Auth abgewickelt. Für die angemeldete Sitzung werden technisch notwendige Authentifizierungs-Cookies verwendet. Zugangsdaten dürfen nicht an andere Personen weitergegeben werden.</p>

          <h2>4. Schülerteams, Bilder und Unterlagen</h2>
          <p>Es können Teamnamen, Geschäftsideen, Beschreibungen, zugeordnete Schülernamen und freigegebene Bilder verarbeitet werden. Auf der öffentlichen Startseite werden nur zur Veröffentlichung freigeschaltete Teamangaben angezeigt. Businesspläne, Präsentationen und weitere Materialien werden über den geschützten Jurybereich bereitgestellt. Die Veröffentlichung personenbezogener Schülerdaten und Bilder setzt die jeweils erforderliche Freigabe oder Einwilligung voraus.</p>

          <h2>5. Bewertungen und persönliche Notizen</h2>
          <p>Jurymitglieder können Bewertungen zu den Unternehmerteams und eigene Notizen speichern. Die Plattform ordnet diese Inhalte dem jeweiligen Jurykonto zu. Die Einzelnotizen sind für die persönliche Nutzung im geschützten Bereich vorgesehen; die konkreten Zugriffsrechte werden technisch über Konten und Rollen gesteuert.</p>

          <h2>6. Technische Dienstleister</h2>
          <p><strong>Vercel</strong> dient der Bereitstellung und Auslieferung der Website. <strong>Supabase</strong> wird für die Anmeldefunktionen, die Datenbank sowie die geschützte Speicherung hochgeladener Unterlagen verwendet. Serverregionen, Auftragsverarbeitungsverträge, Unterauftragnehmer und mögliche Übermittlungen in Drittländer müssen anhand der tatsächlich eingesetzten Verträge und Projekteinstellungen geprüft werden.</p>

          <h2>7. Zwecke, Rechtsgrundlagen und Aufbewahrung</h2>
          <p>Die Daten dienen der Organisation und Durchführung des schulischen Gründerwettbewerbs, dem Schutz persönlicher Zugänge und der Dokumentation der Juryarbeit. Die jeweils anwendbaren Rechtsgrundlagen nach Art. 6 DSGVO, insbesondere für die Veröffentlichung von Schülerdaten, sowie verbindliche Speicher- und Löschfristen sind durch die verantwortliche Stelle festzulegen und zu bestätigen. Daten sollen nicht länger als für diese Zwecke erforderlich aufbewahrt werden.</p>

          <h2>8. Datenschutzrechte</h2>
          <p>Betroffene können nach Maßgabe der DSGVO insbesondere Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und gegebenenfalls Datenübertragbarkeit oder Widerspruch geltend machen. Außerdem besteht das Recht auf Beschwerde bei der zuständigen Datenschutzaufsichtsbehörde. Für Anfragen können die oben genannten Kontakte genutzt werden.</p>

          <p className="legal-caution">Hinweis zum Stand dieser Informationen: Der tatsächliche technische Einsatz ist beschrieben; die formale Betreiberzuordnung, Rechtsgrundlagen, Dienstleisterverträge, Serverregionen und konkrete Löschfristen bedürfen noch einer verbindlichen Prüfung durch die zuständige Stelle. Diese Ergänzung ersetzt bis dahin keine abschließend freigegebene Datenschutzerklärung.</p>
          <p><a href={schoolPrivacy} target="_blank" rel="noopener noreferrer">Zur offiziellen Datenschutzerklärung des Landheims <span aria-hidden="true">↗</span></a></p>
        </>
      )}
    </article>
  );
}

export function LegalPage({ topic }: { topic: LegalTopic }) {
  return (
    <main className="legal-page">
      <header className="legal-page-bar">
        <a className="legal-page-brand" href="/"><span className="legal-page-monogram">L</span><span>LANDHEIM AMMERSEE<small>JUGEND GRÜNDET</small></span></a>
        <a className="legal-back" href="/">← Zur Startseite</a>
      </header>
      <div className="legal-page-paper"><LegalInformation topic={topic} /></div>
      <nav className="legal-page-navigation" aria-label="Weitere Informationen">
        <a href="/kontakt">Kontakt</a>
        <a href="/impressum">Impressum</a>
        <a href="/datenschutz">Datenschutz</a>
      </nav>
    </main>
  );
}
