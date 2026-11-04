'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Clock3, Compass,
  ExternalLink, Lightbulb, LockKeyhole, MapPin, Menu, Presentation,
  UsersRound, X
} from 'lucide-react';

type PublishedTeam = { id: string; name: string; position: number };
type LandingTeam = { id: string; name: string; position: number; published: boolean };

const heroSlides = [
  {
    image: 'https://www.landheim-ammersee.de/sites/default/files/media/images/landheim-ammersee-og-image-ueber-das-landheim-luftbild.jpg',
    label: 'Landheim-Campus mit Blick auf den Ammersee',
    position: 'center 48%'
  },
  {
    image: 'https://www.landheim-ammersee.de/sites/default/files/media/images/1-lebendiges-lernen-Landheim-Lernorte-1149.jpg',
    label: 'Gemeinsam lernen und Ideen entwickeln',
    position: 'center 43%'
  },
  {
    image: 'https://www.landheim-ammersee.de/sites/default/files/media/images/Landheim-Ammersee-Handwerk%20-%20Stolz%20auf%20das%20Selbstgemacht%20-%20Schreinerei%20-%20Jan%20Greune%20-%20Landhein%20Ammersee_107818.jpg',
    label: 'Ideen praktisch umsetzen in der Landheim-Werkstatt',
    position: 'center 47%'
  }
] as const;

const phases = [
  {
    number: '01',
    icon: Lightbulb,
    eyebrow: 'DIE IDEE',
    title: 'Ein Problem erkennen.',
    description: 'Am Anfang steht die Frage: Was könnte besser sein? Aus Beobachtungen entstehen Ideen mit echtem Nutzen.'
  },
  {
    number: '02',
    icon: Compass,
    eyebrow: 'DAS KONZEPT',
    title: 'Eine Lösung gestalten.',
    description: 'Die Teams entwickeln Geschäftsmodelle, untersuchen Zielgruppen und treffen unternehmerische Entscheidungen.'
  },
  {
    number: '03',
    icon: Presentation,
    eyebrow: 'DER PITCH',
    title: 'Menschen überzeugen.',
    description: 'Vor einer externen Jury vertreten die Jugendlichen ihre Ideen und stellen sich kritischen Fragen.'
  }
];

export default function HomeClient({ publishedTeams = [] }: { publishedTeams: PublishedTeam[] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [daysUntilPitch, setDaysUntilPitch] = useState<number | null>(null);

  useEffect(() => {
    const updateCountdown = () => {
      const milliseconds = new Date('2027-01-15T12:15:00.000Z').getTime() - Date.now();
      setDaysUntilPitch(milliseconds > 0 ? Math.ceil(milliseconds / 86400000) : 0);
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveSlide(current => (current + 1) % heroSlides.length);
    }, 8000);
    return () => window.clearInterval(timer);
  }, []);

  const teams: LandingTeam[] = publishedTeams.length
    ? [...publishedTeams].sort((a, b) => a.position - b.position).map(team => ({ ...team, published: true }))
    : Array.from({ length: 9 }, (_, index) => ({
        id: 'placeholder-' + index,
        name: 'Unternehmerteam ' + String(index + 1).padStart(2, '0'),
        position: index + 1,
        published: false
      }));

  function closeMenu() { setMenuOpen(false); }

  async function submitJuryLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loginBusy) return;
    setLoginBusy(true);
    setLoginError('');
    try {
      const response = await fetch('/api/jury/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        cache: 'no-store'
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Die Anmeldung ist fehlgeschlagen.');
      setPassword('');
      window.location.assign('/jury/dashboard');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Die Anmeldung ist fehlgeschlagen.');
      setLoginBusy(false);
    }
  }

  return (
    <main className="lm-page" id="top">
      <div className="lm-utility">
        <div className="lm-container lm-utility-inner">
          <span>LANDHEIM AMMERSEE <span className="lm-utility-dot">·</span> INTERNATSSCHULEN SEIT 1905</span>
          <span>GRÜNDERWETTBEWERB <span className="lm-utility-dot">·</span> SCHULJAHR 2026/27</span>
        </div>
      </div>

      <header className="lm-header">
        <div className="lm-container lm-header-inner">
          <a className="lm-wordmark" href="#top" onClick={closeMenu} aria-label="Jugend gründet am Landheim Ammersee, zur Startseite">
            <span className="lm-emblem" aria-hidden="true"><span>L</span><i/></span>
            <span className="lm-wordmark-type"><strong>LANDHEIM AMMERSEE</strong><small>JUGEND GRÜNDET · 2026/27</small></span>
          </a>
          <nav id="lm-mobile-navigation" className={menuOpen ? 'lm-nav lm-nav-open' : 'lm-nav'} aria-label="Hauptnavigation">
            <a href="#idee" onClick={closeMenu}>Die Idee</a>
            <a href="#weg" onClick={closeMenu}>Unser Weg</a>
            <a href="#teams" onClick={closeMenu}>Die Teams</a>
            <a href="#pitch" onClick={closeMenu}>Pitch-Tag</a>
            <a href="#jury" className="lm-nav-jury" onClick={closeMenu}>Jury-Anmeldung <ArrowUpRight size={16} aria-hidden="true"/></a>
          </nav>
          <button className="lm-menu-button" aria-label={menuOpen ? 'Menü schließen' : 'Menü öffnen'} aria-expanded={menuOpen} aria-controls="lm-mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={25}/> : <Menu size={25}/>}
          </button>
        </div>
      </header>

      <section className="lm-hero" aria-labelledby="lm-hero-title">
        <div className="lm-hero-gallery" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <Image
              key={slide.label}
              src={slide.image}
              alt=""
              fill
              sizes="100vw"
              quality={75}
              priority={index === 0}
              className={'lm-hero-photo lm-hero-slide' + (index === activeSlide ? ' lm-hero-slide-active' : '')}
              style={{ objectPosition: slide.position }}
            />
          ))}
        </div>
        <div className="lm-hero-shade" aria-hidden="true"/>
        <div className="lm-hero-rule" aria-hidden="true"/>
        <div className="lm-container lm-hero-inner">
          <div className="lm-hero-copy">
            <div className="lm-kicker lm-kicker-light"><span className="lm-kicker-line"/> JUGEND GRÜNDET AM LANDHEIM AMMERSEE</div>
            <h1 id="lm-hero-title">Die Zukunft<br/>beginnt <em>mit uns.</em></h1>
            <p className="lm-hero-lead">Neun Unternehmerteams. Neun eigene Ideen. Und die Chance, zu zeigen, was in jungen Menschen steckt.</p>
            <div className="lm-hero-actions">
              <a className="lm-primary-cta" href="#idee">Das Projekt entdecken <ArrowUpRight size={19}/></a>
              <a className="lm-quiet-cta" href="#jury">Zum Juryportal <ArrowRight size={18}/></a>
            </div>
          </div>
          <div className="lm-hero-seal" aria-label="Neun Teams beim Pitch-Tag">
            <span className="lm-hero-seal-overline">LANDHEIM ENTREPRENEURS</span>
            <strong>09</strong>
            <span className="lm-hero-seal-caption">TEAMS.<br/>UNZÄHLIGE MÖGLICHKEITEN.</span>
            <span className="lm-seal-divider"/>
            <span className="lm-seal-date">15. JANUAR 2027</span>
            {daysUntilPitch !== null && daysUntilPitch > 0 && <span className="lm-seal-countdown">Noch {daysUntilPitch} Tage</span>}
          </div>
        </div>
        <div className="lm-hero-bottom">
          <div className="lm-container lm-hero-bottom-inner">
            <span>01 / 05 <span className="lm-hero-bottom-divider"/> DER ANFANG VON ETWAS GROSSEM</span>
            <a href="#idee">WEITER ENTDECKEN <ChevronDown size={16}/></a>
            <div className="lm-hero-controls" role="group" aria-label="Landheim-Bilder auswählen">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.label}
                  type="button"
                  className={'lm-hero-dot' + (index === activeSlide ? ' lm-hero-dot-active' : '')}
                  aria-label={'Bild ' + (index + 1) + ': ' + slide.label}
                  aria-pressed={index === activeSlide}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
            <span className="lm-photo-credit">Fotos: Landheim Ammersee</span>
          </div>
        </div>
      </section>

      <div className="lm-ribbon" aria-label="Projektüberblick">
        <div className="lm-container lm-ribbon-grid">
          <div><strong>09</strong><span>JUNGE GRÜNDUNGSTEAMS</span></div>
          <div><strong>01</strong><span>GEMEINSAMER PITCH-TAG</span></div>
          <div><strong>2027</strong><span>IDEEN FÜR DIE ZUKUNFT</span></div>
          <a href="#pitch">15. JANUAR · SAVE THE DATE <ArrowUpRight size={18}/></a>
        </div>
      </div>

      <section id="idee" className="lm-intro lm-section" aria-labelledby="lm-intro-title">
        <div className="lm-container lm-intro-layout">
          <div>
            <div className="lm-section-index"><span>01</span><span>UNSER ANSPRUCH</span></div>
            <h2 id="lm-intro-title">„Macht’s<br/><em>selber.“</em></h2>
            <div className="lm-handwritten">Ein Gedanke, der Zukunft macht.</div>
          </div>
          <div className="lm-intro-body">
            <div className="lm-accent-bar"/>
            <p className="lm-intro-lead">Im Landheim ist Eigenverantwortung nicht nur ein Wort. Sie wird gelebt.</p>
            <p>Beim Wettbewerb <strong>Jugend gründet</strong> werden Schülerinnen und Schüler der 9. Klassen selbst zu Unternehmerinnen und Unternehmern auf Zeit: Sie entdecken Probleme, entwickeln Ideen und gestalten daraus tragfähige Konzepte.</p>
            <p>Sie lernen, Entscheidungen zu treffen, Verantwortung zu übernehmen und ihre Überzeugungen vor Menschen mit Erfahrung aus Wirtschaft und Unternehmertum zu vertreten.</p>
            <a className="lm-text-cta" href="https://www.landheim-ammersee.de/de/ueber-das-landheim" target="_blank" rel="noopener noreferrer">Die Idee des Landheims entdecken <ArrowUpRight size={18}/></a>
          </div>
        </div>
      </section>

      <section className="lm-values" aria-label="Was die Jugendlichen lernen">
        <div className="lm-container lm-values-grid">
          <div><span className="lm-value-number">01 /</span><h3>Mut.</h3><p>Den ersten Schritt gehen, auch wenn noch nicht alles feststeht.</p></div>
          <div><span className="lm-value-number">02 /</span><h3>Verantwortung.</h3><p>Gemeinsam entscheiden, Fehler reflektieren und Lösungen finden.</p></div>
          <div><span className="lm-value-number">03 /</span><h3>Wirkung.</h3><p>Aus einer Idee etwas machen, das für andere Menschen zählt.</p></div>
        </div>
      </section>

      <section className="lm-place" aria-labelledby="lm-place-title">
        <div className="lm-place-image" role="img" aria-label="Gebäude auf dem Campus des Landheims Ammersee"/>
        <div className="lm-place-panel">
          <span className="lm-small-label">LANDHEIM AMMERSEE · SCHONDORF</span>
          <h2 id="lm-place-title">Ein besonderer Ort.<br/><em>Für große Gedanken.</em></h2>
          <p>Hier verbinden sich Tradition und Aufbruch. Praktisches Lernen, persönliche Entwicklung und der Mut, Dinge selbst in die Hand zu nehmen, gehören seit Generationen zusammen.</p>
          <a href="https://www.landheim-ammersee.de/de" target="_blank" rel="noopener noreferrer">Unser Landheim kennenlernen <ArrowUpRight size={18}/></a>
        </div>
        <div className="lm-place-folio" aria-hidden="true">LANDHEIM / SEIT 1905</div>
      </section>

      <section className="lm-process lm-section" id="weg" aria-labelledby="lm-process-title">
        <div className="lm-container">
          <div className="lm-section-heading lm-heading-split">
            <div><div className="lm-section-index"><span>02</span><span>DER WEG ZUM UNTERNEHMEN</span></div><h2 id="lm-process-title">Aus Gedanken<br/>werden <em>Geschäftsideen.</em></h2></div>
            <p>Unternehmerisches Denken beginnt mit Neugier – und wächst durch Ausprobieren, Planen und Überzeugen.</p>
          </div>
          <div className="lm-process-grid">
            {phases.map((phase) => {
              const Icon = phase.icon;
              return <article className="lm-process-card" key={phase.number}>
                <div className="lm-process-top"><span>{phase.number}</span><Icon size={26} strokeWidth={1.4} aria-hidden="true"/></div>
                <small>{phase.eyebrow}</small>
                <h3>{phase.title}</h3>
                <p>{phase.description}</p>
                <span className="lm-process-footer"><ArrowRight size={22} aria-hidden="true"/></span>
              </article>;
            })}
          </div>
          <a className="lm-text-cta" href="https://www.jugend-gruendet.de/wettbewerb/" target="_blank" rel="noopener noreferrer">Über den bundesweiten Wettbewerb <ExternalLink size={17}/></a>
        </div>
      </section>

      <section id="pitch" className="lm-event" aria-labelledby="lm-event-title">
        <div className="lm-container lm-event-inner">
          <div className="lm-event-left">
            <div className="lm-section-index lm-index-light"><span>03</span><span>DER HÖHEPUNKT</span></div>
            <div className="lm-event-date" aria-label="15. Januar 2027"><strong>15</strong><span>JANUAR<br/>2027</span></div>
            <div className="lm-event-date-line"/>
            <p>FREITAG <span>·</span> 13:15 – 17:30 UHR</p>
            {daysUntilPitch !== null && daysUntilPitch > 0 && <div className="lm-event-countdown"><Clock3 size={18} strokeWidth={1.5} aria-hidden="true"/><span>NOCH <strong>{daysUntilPitch}</strong> TAGE BIS ZUM PITCH</span></div>}
          </div>
          <div className="lm-event-right">
            <div className="lm-kicker lm-kicker-light"><span className="lm-kicker-line"/> DER PITCH-TAG</div>
            <h2 id="lm-event-title">Die Bühne<br/>gehört <em>den Ideen.</em></h2>
            <p>Neun Teams stellen ihre Konzepte einer Jury aus erfahrenen Persönlichkeiten vor. Hier zählen klare Gedanken, überzeugende Präsentationen und die Fähigkeit, kritische Fragen souverän zu beantworten.</p>
            <div className="lm-event-facts">
              <div><CalendarDays size={23} strokeWidth={1.6}/><span><small>TERMIN</small>Freitag, 15. Januar 2027</span></div>
              <div><MapPin size={23} strokeWidth={1.6}/><span><small>ORT</small>Vortragssaal · Landheim Ammersee</span></div>
            </div>
          </div>
        </div>
        <span className="lm-event-watermark" aria-hidden="true">PITCH</span>
      </section>

      <section className="lm-teams lm-section" id="teams" aria-labelledby="lm-teams-title">
        <div className="lm-container">
          <div className="lm-section-heading lm-heading-split">
            <div><div className="lm-section-index"><span>04</span><span>DIE UNTERNEHMERTEAMS</span></div><h2 id="lm-teams-title">Neun Teams.<br/><em>Neun Perspektiven.</em></h2></div>
            <p>Jede Idee beginnt mit Menschen, die etwas verändern möchten. Hier erhalten die Teams nach ihrer öffentlichen Freigabe ihren Platz.</p>
          </div>
          <div className="lm-team-grid">
            {teams.map((team, index) => (
              <article className="lm-team-card" key={team.id}>
                <span className="lm-team-card-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="lm-team-card-art" aria-hidden="true"><span>{String(index + 1).padStart(2, '0')}</span></div>
                <div className="lm-team-card-bottom">
                  <span>{team.published ? 'UNTERNEHMERTEAM' : 'VORSTELLUNG FOLGT'}</span>
                  <h3>{team.name}</h3>
                  <p>{team.published ? 'Ein junges Unternehmen stellt sich vor.' : 'Nach öffentlicher Freigabe erfährst du hier mehr.'}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="lm-teams-note"><UsersRound size={22} strokeWidth={1.5}/><span>Unterlagen und persönliche Informationen sind ausschließlich im geschützten Juryportal zugänglich.</span></div>
        </div>
      </section>

      <section className="lm-manifesto" aria-label="Motto des Wettbewerbs">
        <div className="lm-container">
          <span>LANDHEIM AMMERSEE × JUGEND GRÜNDET</span>
          <p>Wer etwas verändern will,<br/><em>muss anfangen.</em></p>
          <div className="lm-manifesto-line"/>
        </div>
      </section>

      <section id="jury" className="lm-jury lm-section" aria-labelledby="lm-jury-title">
        <div className="lm-container lm-jury-layout">
          <div className="lm-jury-copy">
            <div className="lm-section-index lm-index-light"><span>05</span><span>GESCHÜTZTER JURYBEREICH</span></div>
            <div className="lm-jury-symbol"><LockKeyhole size={28} strokeWidth={1.5}/></div>
            <h2 id="lm-jury-title">Ihre Erfahrung.<br/><em>Ihr Blick.</em><br/>Ihre Bewertung.</h2>
            <p>Im persönlichen Juryportal finden Sie die Unternehmerteams, ihre Unterlagen und die digitale Bewertung für den Pitch-Tag – klar strukturiert und vertraulich.</p>
            <div className="lm-jury-perks"><span>01 / Teamprofile</span><span>02 / Businesspläne</span><span>03 / Digitale Bewertung</span></div>
          </div>
          <div className="lm-login-panel">
            <span className="lm-login-overline">LANDHEIM AMMERSEE · JURYPORTAL</span>
            <h3>Willkommen<br/><em>zurück.</em></h3>
            <p>Melden Sie sich mit Ihren persönlichen Jury-Zugangsdaten an.</p>
            <form onSubmit={submitJuryLogin}>
              <label htmlFor="lm-login-email">E-MAIL-ADRESSE</label>
              <input id="lm-login-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.currentTarget.value)} placeholder="name@beispiel.de"/>
              <label htmlFor="lm-login-password">PASSWORT</label>
              <input id="lm-login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.currentTarget.value)} placeholder="Ihr persönliches Passwort"/>
              {loginError && <p role="alert" className="lm-login-error">{loginError}</p>}
              <button type="submit" disabled={loginBusy} aria-busy={loginBusy}>{loginBusy ? 'Anmeldung wird geprüft …' : 'Zum persönlichen Juryportal'} <ArrowUpRight size={19}/></button>
            </form>
            <div className="lm-login-footer"><LockKeyhole size={14}/><span>Geschützter Zugang · Nur für freigeschaltete Jurymitglieder</span></div>
          </div>
        </div>
      </section>

      <footer className="lm-footer">
        <div className="lm-container">
          <div className="lm-footer-main">
            <div><span className="lm-footer-brand">LANDHEIM AMMERSEE</span><strong>JUGEND GRÜNDET</strong><p>Junge Menschen gestalten die Zukunft.</p></div>
            <div><span>WETTBEWERB 2026/27</span><a href="#idee">Das Projekt</a><a href="#teams">Die Teams</a><a href="#pitch">Pitch-Tag</a><a href="#jury">Juryportal</a></div>
            <div><span>MEHR ENTDECKEN</span><a href="https://www.landheim-ammersee.de/de" target="_blank" rel="noopener noreferrer">Landheim Ammersee <ArrowUpRight size={14}/></a><a href="https://www.jugend-gruendet.de/wettbewerb/" target="_blank" rel="noopener noreferrer">Jugend gründet <ArrowUpRight size={14}/></a></div>
          </div>
          <div className="lm-footer-bottom">
            <span>© 2026/27 · Schulprojekt am Landheim Ammersee</span>
            <span>Designvorschau · Bildrechte, Impressum und Datenschutz vor öffentlicher Veröffentlichung abstimmen.</span>
            <a href="#top">NACH OBEN ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
