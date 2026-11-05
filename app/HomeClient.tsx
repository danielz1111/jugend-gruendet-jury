'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import './TeamReveal.css';
import './HomepagePolish.css';
import './HeaderIdentity.css';
import './HomepageFinalTouches.css';
import './HomeResponsive.css';
import JuryShowcase from './JuryShowcase';
import JourneyTimeline from './JourneyTimeline';
import InformationLinks from './InformationLinks';
import {
  ArrowRight, ArrowUpRight, CalendarDays, ChevronDown, Clock3, Compass,
  ExternalLink, Lightbulb, LockKeyhole, MapPin, Menu, Presentation,
  UsersRound, X, Eye, EyeOff
} from 'lucide-react';

type PublishedTeam = { id: string; name: string; position: number; tagline?: string | null; description?: string | null };

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
  const [headerCompact, setHeaderCompact] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [rememberJury, setRememberJury] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [daysUntilPitch, setDaysUntilPitch] = useState<number | null>(null);
  const sealRef = useRef<HTMLDivElement | null>(null);
  const [animatedStats, setAnimatedStats] = useState({ classes: 0, students: 0, teams: 0 });
  // Aggregated project figures; no student-identifying information is published.
  const classCount = 7;
  const studentCount = 42;
  const teams = [...publishedTeams]
    .filter(team => team.id && team.name?.trim())
    .sort((a, b) => a.position - b.position)
    .slice(0, 9);


  useEffect(() => {
    // Supabase can send invitations to the configured Site URL if no redirect
    // override was supplied. Carry the one-use fragment to our password page.
    const fragment=new URLSearchParams(window.location.hash.replace(/^#/,''));
    const kind=fragment.get('type');
    if(fragment.has('access_token')&&(['invite','recovery','magiclink','signup'].includes(kind||''))){
      window.location.replace('/jury/passwort-neu'+window.location.hash);
    }
  },[]);

  useEffect(() => {
    // A compact navigation stays visible after the large identity scrolls away.
    const onScroll = () => setHeaderCompact(window.scrollY > 140);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  useEffect(() => {
    const node = sealRef.current;
    if (!node) return;
    const duration = 1500;
    let frame = 0;
    let inView = false;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !inView) {
        inView = true;
        window.cancelAnimationFrame(frame);
        if (reducedMotion) {
          setAnimatedStats({ classes: classCount, students: studentCount, teams: teams.length });
          return;
        }
        const started = performance.now();
        setAnimatedStats({ classes: 0, students: 0, teams: 0 });
        const advance = (now: number) => {
          if (!inView) return;
          const progress = Math.min((now - started) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setAnimatedStats({
            classes: Math.round(classCount * eased),
            students: Math.round(studentCount * eased),
            teams: Math.round(teams.length * eased)
          });
          if (progress < 1) frame = window.requestAnimationFrame(advance);
        };
        frame = window.requestAnimationFrame(advance);
      } else if (!entry.isIntersecting && inView) {
        inView = false;
        window.cancelAnimationFrame(frame);
        setAnimatedStats({ classes: 0, students: 0, teams: 0 });
      }
    }, { threshold: 0.35 });
    observer.observe(node);
    return () => { inView = false; observer.disconnect(); window.cancelAnimationFrame(frame); };
  }, [teams.length]);

  // The public page receives approved teams only; the displayed
  // aggregate does not reveal individual student information.

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
        body: JSON.stringify({ email, password, remember: rememberJury }),
        cache: 'no-store'
      });
      const result = await response.json() as { error?: string; redirect?: string };
      if (!response.ok) throw new Error(result.error || 'Die Anmeldung ist fehlgeschlagen.');
      setPassword('');
      window.location.assign(result.redirect||'/jury/dashboard');
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

      <header className={headerCompact ? "lm-header lm-header-compact" : "lm-header"}>
        <div className="lm-container lm-header-inner">
          <a className="lm-wordmark" href="#top" onClick={closeMenu} aria-label="Jugend gründet am Landheim Ammersee, zur Startseite">
            <span className="lm-official-mark"><Image
              src="https://www.landheim-ammersee.de/themes/master_theme/logo.svg"
              width={222}
              height={67}
              unoptimized
              alt="Landheim Ammersee"
              className="lm-official-logo"
              priority
            /></span>
            <span className="lm-wordmark-type lm-competition-wordmark">
              <span className="lm-compact-school-name">LANDHEIM AMMERSEE</span>
              <strong>Fachschaft<br className="lm-fachschaft-break"/> Wirtschaft und Recht</strong>
              <small>JUGEND GRÜNDET · 2026/27</small>
            </span>
          </a>
          <nav id="lm-mobile-navigation" className={menuOpen ? 'lm-nav lm-nav-open' : 'lm-nav'} aria-label="Hauptnavigation">
            <a href="#idee" onClick={closeMenu}>Die Idee</a>
            <a href="#weg" onClick={closeMenu}>Unser Weg</a>
            <a href="#teams" onClick={closeMenu}>Die Teams</a>
            <a href="#jury-vorstellung" onClick={closeMenu}>Unsere Jury</a>
            <a href="#pitch" onClick={closeMenu}>Pitch-Tag</a>
            <a href="#jury" className="lm-nav-jury" onClick={closeMenu}>Anmeldung <ArrowUpRight size={16} aria-hidden="true"/></a>
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
              <a className="lm-quiet-cta" href="#jury">Zur Anmeldung <ArrowRight size={18}/></a>
            </div>
          </div>
          <div ref={sealRef} className="lm-hero-seal lm-hero-seal-stats lm-hero-seal-triple lm-hero-seal-editorial"
            aria-label={classCount+' Klassen, '+studentCount+' Schülerinnen und Schüler in '+teams.length+' Gründerteams. Pitch am 15. Januar 2027.'}>
            <span className="lm-hero-seal-overline lm-seal-brand-heading"><span>LANDHEIM</span><span>ENTREPRENEURS</span></span>
            <div className={'lm-seal-stat-block lm-seal-stat-classes' + (animatedStats.classes === classCount ? ' lm-count-done' : '')} aria-hidden="true">
              <strong className="lm-seal-stat-number">{String(animatedStats.classes).padStart(2, '0')}</strong>
              <span className="lm-seal-stat-label">KLASSEN</span>
              <span className="lm-seal-progress" aria-hidden="true"><span style={{width: (classCount > 0 ? Math.min(100, Math.round(animatedStats.classes / classCount * 100)) : 0) + '%'}}/></span>
            </div>
            <div className={'lm-seal-stat-block lm-seal-stat-students' + (animatedStats.students === studentCount ? ' lm-count-done' : '')} aria-hidden="true">
              <strong className="lm-seal-stat-number">{animatedStats.students}</strong>
              <span className="lm-seal-stat-label">SCHÜLERINNEN<br/>UND SCHÜLER</span>
              <span className="lm-seal-progress" aria-hidden="true"><span style={{width: (studentCount > 0 ? Math.min(100, Math.round(animatedStats.students / studentCount * 100)) : 0) + '%'}}/></span>
            </div>
            <div className={'lm-seal-stat-block lm-seal-stat-teams' + (animatedStats.teams === teams.length ? ' lm-count-done' : '')} aria-hidden="true">
              <strong className="lm-seal-stat-number">{String(animatedStats.teams).padStart(2, '0')}</strong>
              <span className="lm-seal-stat-label">GRÜNDERTEAMS</span>
              <span className="lm-seal-progress" aria-hidden="true"><span style={{width: (teams.length > 0 ? Math.min(100, Math.round(animatedStats.teams / teams.length * 100)) : 0) + '%'}}/></span>
            </div>
            <span className="lm-seal-divider" aria-hidden="true"/>
            <span className="lm-seal-pitch-label">UNSER PITCH-TAG</span>
            <span className="lm-seal-date">15. JANUAR 2027</span>
            {daysUntilPitch !== null && daysUntilPitch > 0 && <span className="lm-seal-countdown">NOCH <strong>{daysUntilPitch}</strong> TAGE</span>}
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
        <div className="lm-place-image" role="img" aria-label="Luftaufnahme des Landheim-Campus mit Blick auf den Ammersee"/>
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

      <JourneyTimeline />

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

      <style>{`
        .lm-page .lm-login-password-field {position:relative}
        .lm-page .lm-login-password-field input {width:100%;padding-right:54px}
        .lm-page .lm-login-password-field .lm-login-password-toggle {position:absolute;right:7px;top:50%;transform:translateY(-50%);width:42px;height:42px;display:grid;place-items:center;background:transparent;border:0;color:#48695e;cursor:pointer}
        .lm-page .lm-login-password-toggle:focus-visible,.lm-page .lm-team-card:focus-visible {outline:3px solid #789672;outline-offset:3px}
        .lm-page .lm-team-card:focus-visible .lm-team-card-art-slogan {opacity:1;transform:translateY(0)}
        .lm-page .lm-team-card .lm-team-card-slogan {display:block!important}
      `}</style>
      <style>{`
        .lm-page .lm-team-card-art .lm-team-card-art-slogan {position:absolute;inset:0;z-index:6;display:flex;align-items:center;justify-content:center;padding:27px;text-align:center;background:#26473f;color:white;font:500 27px/1.24 Georgia,serif;opacity:0;transform:translateY(11px);transition:opacity .35s ease,transform .35s ease}
        .lm-page .lm-team-card .lm-team-card-slogan {font-weight:700;color:#466d64;margin:0 0 12px}
        @media (hover:hover) and (pointer:fine) {.lm-page .lm-team-card:hover .lm-team-card-art-slogan {opacity:1;transform:none}.lm-page .lm-team-card .lm-team-card-slogan {display:none}}
        @media (hover:none), (pointer:coarse) {.lm-page .lm-team-card-art .lm-team-card-art-slogan {display:none}}
        @media (prefers-reduced-motion:reduce) {.lm-page .lm-team-card-art .lm-team-card-art-slogan {transition:none}}
      `}</style>
      <section className="lm-teams lm-section" id="teams" aria-labelledby="lm-teams-title">
        <div className="lm-container">
          <div className="lm-section-heading lm-heading-split">
            <div><div className="lm-section-index"><span>04</span><span>DIE UNTERNEHMERTEAMS</span></div><h2 id="lm-teams-title">Neun Teams.<br/><em>Neun Perspektiven.</em></h2></div>
            <p>Jede Idee beginnt mit Menschen, die etwas verändern möchten. Entdecken Sie hier die öffentlich freigegebenen Gründerteams – ihre Kurzprofile wachsen mit dem Projekt.</p>
          </div>
          {teams.length > 0 ? (
            <div className="lm-team-grid" aria-label="Freigegebene Unternehmerteams">
              {teams.map(team => {
                const number = String(team.position).padStart(2, '0');
                const short = team.tagline?.trim() || '';
                const description = team.description?.trim() || '';
                const initials = team.name.split(/[\s-]+/).filter(Boolean).slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
                return (
                  <article className={'lm-team-card '+(description?'lm-team-card-has-idea':'lm-team-card-empty')} key={team.id} aria-labelledby={'team-' + team.id} tabIndex={description?0:undefined}>
                    <div className="lm-team-card-art" aria-hidden="true">
                      <span className="lm-team-card-initials">{initials||'JG'}</span>
                      <span className="lm-team-card-art-folio">GRÜNDERTEAM / {number}</span>
                    </div>
                    <div className="lm-team-card-bottom">
                      <span className="lm-team-card-eyebrow">JUGEND GRÜNDET <span>· TEAM {number}</span></span>
                      <h3 id={'team-' + team.id}>{team.name}</h3>
                      <p className={short?'lm-team-card-slogan':'lm-team-card-slogan lm-team-card-slogan-pending'}>{short||'Slogan folgt'}</p>
                      {description&&<p className="lm-team-card-description-accessible">{description}</p>}
                      <div className="lm-team-card-foot">
                        <span className="lm-team-card-footline" aria-hidden="true"/>
                        <span>{description?'GESCHÄFTSIDEE ENTDECKEN':'GESCHÄFTSIDEE FOLGT'}</span>
                      </div>
                    </div>
                    {description&&<div className="lm-team-card-reveal" aria-hidden="true">
                      <span className="lm-team-card-reveal-eyebrow">DIE GESCHÄFTSIDEE · TEAM {number}</span>
                      <strong>{team.name}</strong>
                      <p>{description}</p>
                      <span className="lm-team-card-reveal-foot">JUGEND GRÜNDET · LANDHEIM AMMERSEE</span>
                    </div>}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="lm-team-empty" role="status">
              <span>UNTERNEHMERTEAMS 2026/27</span>
              <h3>Die Teamvorstellungen folgen.</h3>
              <p>Sobald öffentlich freigegebene Teamprofile vorliegen, erscheinen sie automatisch an dieser Stelle.</p>
            </div>
          )}
          <div className="lm-teams-note"><UsersRound size={22} strokeWidth={1.5}/><span>Auf dieser Seite erscheinen nur freigegebene Teamangaben. Personenbezogene Informationen, Fotos und Unterlagen bleiben im geschützten Juryportal, sofern sie nicht gesondert für die Öffentlichkeit freigegeben wurden.</span></div>
        </div>
      </section>

      <JuryShowcase />

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
            <div className="lm-section-index lm-index-light"><span>06</span><span>GESCHÜTZTE ZUGÄNGE</span></div>
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
              <div className="lm-login-password-field"><input id="lm-login-password" type={showPassword?'text':'password'} autoComplete="current-password" required value={password} onChange={event=>{setPassword(event.currentTarget.value);setLoginError('')}} placeholder="Ihr persönliches Passwort"/><button className="lm-login-password-toggle" type="button" aria-label={showPassword?'Passwort verbergen':'Passwort anzeigen'} aria-pressed={showPassword} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={18} aria-hidden="true"/>:<Eye size={18} aria-hidden="true"/>}</button></div>
              <a className="lm-jury-password-help" href="/jury/passwort-vergessen">Passwort vergessen? Administration kontaktieren</a>
              <label className="lm-jury-remember" style={{display:'flex',alignItems:'center',gap:9,fontSize:13,color:'#e7ebe0',cursor:'pointer',margin:'13px 0'}}><input type="checkbox" checked={rememberJury} onChange={event=>setRememberJury(event.currentTarget.checked)} style={{width:17,height:17,accentColor:'#bad639'}}/> Auf diesem Gerät angemeldet bleiben (7 Tage)</label>
              {loginError && <p role="alert" className="lm-login-error">{loginError}</p>}
              <button type="submit" disabled={loginBusy} aria-busy={loginBusy}>{loginBusy ? 'Anmeldung wird geprüft …' : 'Zum persönlichen Juryportal'} <ArrowUpRight size={19}/></button>
            </form>
           
            <div className="lm-login-footer"><LockKeyhole size={14}/><span>Geschützter Zugang · Nur für freigeschaltete Jurymitglieder</span></div>
            <aside className="lm-parent-access-cta" aria-labelledby="lm-parent-access-title">
              <span className="lm-parent-access-overline">FÜR ELTERN</span>
              <h4 id="lm-parent-access-title">Einblick in das Unternehmen Ihres Kindes.</h4>
              <p>Als Eltern haben Sie die Möglichkeit, Zugang zum geschützten Elternbereich zu erhalten. Nach Ihrer Registrierung können Sie die Freischaltung des Unternehmens Ihres Kindes beantragen.</p>
              <div className="lm-parent-access-actions">
                <a href="/eltern">Eltern-Anmeldung <ArrowUpRight size={15} aria-hidden="true"/></a>
                <a href="/eltern?zugang=registrieren">Registrieren <ArrowUpRight size={15} aria-hidden="true"/></a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <footer className="lm-footer">
        <div className="lm-container">
          <div className="lm-footer-main">
            <div><span className="lm-footer-brand">LANDHEIM AMMERSEE</span><strong>JUGEND GRÜNDET</strong><p>Junge Menschen gestalten die Zukunft.</p></div>
            <div><span>WETTBEWERB 2026/27</span><a href="#idee">Das Projekt</a><a href="#teams">Die Teams</a><a href="#jury-vorstellung">Unsere Jury</a><a href="#meilensteine">Projektfahrplan</a><a href="#pitch">Pitch-Tag</a><a href="#jury">Anmeldung</a></div>
            <div><span>MEHR ENTDECKEN</span><a href="/eltern">Elternportal <ArrowUpRight size={14}/></a><a href="https://www.landheim-ammersee.de/de" target="_blank" rel="noopener noreferrer">Landheim Ammersee <ArrowUpRight size={14}/></a><a href="https://www.jugend-gruendet.de/wettbewerb/" target="_blank" rel="noopener noreferrer">Jugend gründet <ArrowUpRight size={14}/></a></div>
          </div>
          <div className="lm-footer-bottom">
            <span>© 2026/27 · Jugend gründet am Landheim Ammersee</span>
            <span className="lm-footer-credit">Konzeption, Projektleitung und technische Umsetzung: Daniel Zech</span>
            <InformationLinks />
            <a href="#top">NACH OBEN ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
