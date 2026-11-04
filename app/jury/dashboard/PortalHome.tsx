'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import {
  ArrowRight, BookOpen, Building2, CalendarDays, CheckCircle2,
  ClipboardCheck, Clock3, FileText, LogOut, MapPin, Presentation,
  Settings, ShieldCheck, Users
} from 'lucide-react';
import TeamNavigator from './TeamNavigator';
import LiveEventPanel from './LiveEventPanel';
import PublicTeamEditor from './PublicTeamEditor';
import ParentAccessAdmin from './ParentAccessAdmin';
import './JuryStructure.css';

type Team = {
  id:string;name:string;position:number;tagline:string|null;
  description:string|null;jury_photo_path:string|null;is_public:boolean
};
type Member = {id:string;team_id:string;display_name:string;expert_role:string|null;display_order:number};
type Score = {team_id:string;[key:string]:string|number|null};
type Area = 'overview'|'rating'|'companies'|'admin';

const navigation = [
  {id:'overview' as const,title:'Überblick',label:'01',icon:CalendarDays},
  {id:'companies' as const,title:'Unternehmen & Start-ups',label:'02',icon:Building2},
  {id:'rating' as const,title:'Jurybewertung',label:'03',icon:ClipboardCheck}
];

export default function PortalHome({
  displayName,teams,members,scores,isAdmin
}:{
  displayName:string;teams:Team[];members:Member[];scores:Score[];isAdmin:boolean
}){
  const [area,setArea]=useState<Area>('overview');
  const [activeTeamId,setActiveTeamId]=useState<string|null>(teams[0]?.id||null);
  const [headerCompact,setHeaderCompact]=useState(false);
  const [headerHeight,setHeaderHeight]=useState(148);
  const [detailTarget,setDetailTarget]=useState<'profile'|'materials'|null>(null);
  const headerRef=useRef<HTMLElement|null>(null);
  const selectedTeam=teams.find(team=>team.id===activeTeamId)||teams[0]||null;
  const salutation=displayName.trim().replace(/[.!]+$/,'');
  const greeting=/^(Herr|Frau)\b/i.test(salutation)
    ?salutation:/^D\.\s*Zech$/i.test(salutation)?'Herr Zech':salutation;
  const welcome=/^Frau\b/i.test(greeting)
    ?'liebe '+greeting:/^Herr\b/i.test(greeting)?'lieber '+greeting:greeting;
  // Match the public homepage's compact masthead on scrolling.
  useEffect(()=>{
    const onScroll=()=>setHeaderCompact(window.scrollY>140);
    onScroll();
    window.addEventListener('scroll',onScroll,{passive:true});
    return ()=>window.removeEventListener('scroll',onScroll);
  },[]);

  // Keep the left-hand section navigation below both sticky header rows.
  useEffect(()=>{
    const header=headerRef.current;
    if(!header)return;
    const measure=()=>setHeaderHeight(Math.ceil(header.getBoundingClientRect().height));
    measure();
    if(typeof ResizeObserver==='undefined'){
      window.addEventListener('resize',measure);
      return ()=>window.removeEventListener('resize',measure);
    }
    const observer=new ResizeObserver(measure);
    observer.observe(header);
    return ()=>observer.disconnect();
  },[]);

  useEffect(()=>{
    if(area!=='companies'||!detailTarget)return;
    const timer=window.setTimeout(()=>{
      const sectionId=detailTarget==='materials'?'jury-company-materials':'jury-company-profile';
      document.getElementById(sectionId)?.scrollIntoView({behavior:'smooth',block:'start'});
      setDetailTarget(null);
    },130);
    return ()=>window.clearTimeout(timer);
  },[area,detailTarget]);
  // Renew the optional remembered jury session while the page is in use.
  useEffect(()=>{
    const renew=()=>{if(!document.hidden)void fetch('/api/jury/refresh',{method:'POST',cache:'no-store'}).catch(()=>undefined)};
    const interval=window.setInterval(renew,25*60*1000);
    return ()=>window.clearInterval(interval);
  },[]);
  const navigate=(next:Area)=>{
    setArea(next);
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const showCompanySection=(section:'profile'|'materials')=>{
    setArea('companies');
    setDetailTarget(section);
  };
  const openLiveTeam=(teamId:string)=>{
    setActiveTeamId(teamId);
    navigate('rating');
  };

  return (
    <div className="jury-v3" id="jury-top" style={{'--jury-header-height':headerHeight+'px'} as CSSProperties}>
      <header ref={headerRef} className={headerCompact?'jury-v3-header jury-v3-header--compact':'jury-v3-header'}>
        <div className="jury-v3-header-inner">
          <a href="/" className="jury-v3-identity" aria-label="Zur Jugend-gründet-Startseite">
            <span className="jury-v3-logo-wrap">
              <Image
                src="https://www.landheim-ammersee.de/themes/master_theme/logo.svg"
                alt="Landheim Ammersee"
                width={182} height={58} unoptimized priority
                className="jury-v3-logo"
              />
            </span>
            <span className="jury-v3-brand">
              <strong>Landheim Ammersee</strong>
              <span>Fachschaft Wirtschaft und Recht</span>
              <small>JUGEND GRÜNDET · JURYPORTAL</small>
            </span>
          </a>
          <nav className="jury-v3-header-nav" aria-label="Juryportal – Hauptbereiche">
            {navigation.map(item=><button key={item.id} type="button"
              onClick={()=>navigate(item.id)}
              className={area===item.id?'jury-v3-nav-link active':'jury-v3-nav-link'}
              aria-current={area===item.id?'page':undefined}>
              <span className="jury-v3-nav-number">{item.label}</span>
              <span>{item.title}</span>
            </button>)}
            {isAdmin&&<button type="button" onClick={()=>navigate('admin')}
              className={area==='admin'?'jury-v3-nav-link jury-v3-admin-tab active':'jury-v3-nav-link jury-v3-admin-tab'}
              aria-current={area==='admin'?'page':undefined}>
              <Settings size={16} aria-hidden="true"/> Verwaltung
            </button>}
          </nav>
          <form method="post" action="/api/jury/logout" className="jury-v3-logout">
            <button type="submit" title="Vom Juryportal abmelden">
              <LogOut size={17} aria-hidden="true"/><span>Abmelden</span>
            </button>
          </form>
        </div>
      </header>

      <div className="jury-v3-content">
        {area==='overview'&&<section className="jury-v3-welcome" aria-labelledby="jury-v3-welcome-title">
          <div className="jury-v3-welcome-copy">
            <span className="jury-v3-overline">IHR PERSÖNLICHER JURYZUGANG · LANDHEIM AMMERSEE</span>
            <h1 id="jury-v3-welcome-title">
              Herzlich willkommen,<br/><em>{welcome}.</em>
            </h1>
            <p>Schön, dass Sie unsere Gründerteams begleiten. Ihre Erfahrung und Ihre Fragen
              geben den Ideen der Schülerinnen und Schüler wertvolle Impulse.</p>
            <div className="jury-v3-welcome-foot">
              <span><ShieldCheck size={16} aria-hidden="true"/> Geschützter Bereich</span>
              <span><Users size={16} aria-hidden="true"/> {teams.length} Unternehmerteams</span>
            </div>
          </div>
          <div className="jury-v3-welcome-image" role="img" aria-label="Luftbild des Landheim-Campus am Ammersee">
            <span>LANDHEIM AMMERSEE · SCHONDORF</span>
          </div>
        </section>}

        <section className="jury-v3-section" aria-live="polite">
          {area==='rating'&&<>
            <div className="jury-v3-heading">
              <span className="jury-v3-overline">03 / IHR JURYURTEIL</span>
              <h2>Bewertung.</h2>
              <p>Wählen Sie ein Team und bewerten Sie dessen Präsentation und die Antworten
                auf die Juryfragen. Ihre Punkte und persönlichen Notizen sind vertraulich.
                Die Businesspläne dienen zur Vorbereitung – nicht als eigene Vorabbewertung.</p>
            </div>
          </>}
          {area==='companies'&&<>
            <div className="jury-v3-heading">
              <span className="jury-v3-overline">02 / DIE JUNGEN UNTERNEHMEN</span>
              <h2>Unsere Unternehmen &amp; Start-ups.</h2>
              <p>Lernen Sie die neun Geschäftsideen, Unternehmensprofile und Teammitglieder
                kennen. Die eingereichten Businesspläne und Anlagen finden Sie
                im geschützten Unterlagenbereich des jeweils ausgewählten Teams.</p>
            </div>
          </>}

          {/* Keep the workspace mounted when changing sections so locally held
              assessment state is not discarded. Switch its active inner tab. */}
          <div className={area==='companies'
            ?'jury-v3-workspace jury-v3-company-workspace'
            :area==='rating'?'jury-v3-workspace jury-v3-rating-workspace':'jury-v3-workspace'}
            hidden={area!=='rating'&&area!=='companies'}>
            {(area==='companies'||area==='rating')&&
              <aside className={area==='rating'?'jury-v3-rating-rail':'jury-v3-company-rail'}
                aria-label={area==='rating'?'Navigation zur Jurybewertung':'Navigation im Unternehmensbereich'}>
                <span>{area==='rating'?'IHRE JURYBEWERTUNG':'UNTERNEHMEN & START-UPS'}</span>
                <label className="jury-v3-rail-team-label" htmlFor="jury-v3-selected-team">
                  Ausgewähltes Unternehmen
                </label>
                <select id="jury-v3-selected-team" className="jury-v3-rail-team-select"
                  disabled={teams.length===0}
                  value={selectedTeam?.id||''}
                  onChange={event=>setActiveTeamId(event.currentTarget.value)}>
                  {teams.length===0&&<option value="">Keine Unternehmen</option>}
                  {teams.map(team=><option key={team.id} value={team.id}>{team.name}</option>)}
                </select>
                {area==='companies'?<>
                  <a href="#jury-company-profile">Unternehmensprofil</a>
                  <a href="#jury-company-materials">Unterlagen</a>
                  <button type="button" onClick={()=>navigate('rating')}>Zur Jurybewertung <ArrowRight size={14}/></button>
                </>:<>
                  <a href="#jury-rating-form">Jurybewertung · 1–10 Punkte</a>
                  <a href="#jury-rating-questions">Juryfragen</a>
                  <a href="#jury-rating-notes">Persönliche Notizen</a>
                  <a href="#jury-rating-release">Bewertung freigeben</a>
                  <button type="button" onClick={()=>showCompanySection('profile')}>Zum Unternehmensprofil <ArrowRight size={14}/></button>
                </>}
                <a href="#jury-top" className="jury-v3-rail-back">Zurück nach oben ↑</a>
              </aside>}
            <TeamNavigator
              teams={teams} members={members} initialScores={scores}
              isAdmin={isAdmin}
              initialSection={area==='companies'?'company':'pitch'}
              onGoToCompany={()=>showCompanySection('profile')}
              onTeamSelected={setActiveTeamId}
              activeTeamId={activeTeamId}
            />
          </div>

          {area==='overview'&&<>
            <div className="jury-v3-heading">
              <span className="jury-v3-overline">01 / HERZLICH WILLKOMMEN IM LANDHEIM</span>
              <h2>Alles Wichtige für Ihren Jurytag.</h2>
              <p>Termin, Ablauf, Ort und die wichtigsten Informationen für
                Ihren Einsatz als Jurymitglied – übersichtlich auf einer Seite.</p>
            </div>
            <div className="jury-v3-rail-layout">
              <aside className="jury-v3-overview-rail" aria-label="Abschnitte auf dieser Seite">
                <span>IHR WEGWEISER</span>
                <a href="#jury-arrival">Ankommen</a>
                <a href="#jury-program">Ablauf</a>
                <a href="#jury-live">Aktueller Teamaufruf</a>
                <a href="#jury-background">Hintergrund & Landheim</a>
                <a href="#jury-evaluation-help">Bewertung & Unterlagen</a>
                <a href="#jury-top" className="jury-v3-rail-back">Zurück nach oben ↑</a>
              </aside>
              <div className="jury-v3-rail-main">
            <div className="jury-v3-event" id="jury-arrival">
              <div className="jury-v3-event-date">
                <CalendarDays size={26} aria-hidden="true"/>
                <strong>15.</strong>
                <span>JANUAR 2027</span>
                <small>FREITAG</small>
              </div>
              <div className="jury-v3-event-details">
                <span className="jury-v3-overline">UNSER SCHULINTERNER PITCH-TAG</span>
                <h3>Die Bühne gehört den Ideen.</h3>
                <div className="jury-v3-event-facts">
                  <p><Clock3 size={20} aria-hidden="true"/> 13:15–17:30 Uhr</p>
                  <p><MapPin size={20} aria-hidden="true"/> Vortragssaal · Landheim Ammersee</p>
                </div>
              </div>
            </div>

            <div className="jury-v3-info-grid" id="jury-program">
              <article>
                <span>01 / ANKOMMEN</span>
                <Clock3 size={24} aria-hidden="true"/>
                <h3>Beginn um 13:15 Uhr</h3>
                <p>Begrüßung, organisatorische Hinweise und Vorstellung der Jury.</p>
              </article>
              <article>
                <span>02 / PITCHES</span>
                <Presentation size={24} aria-hidden="true"/>
                <h3>Neun Teams präsentieren</h3>
                <p>Präsentationen und anschließende Fragen. Die Teamreihenfolge
                  und die Einzelzeiten werden noch ergänzt.</p>
              </article>
              <article>
                <span>03 / ABSCHLUSS</span>
                <CheckCircle2 size={24} aria-hidden="true"/>
                <h3>Juryberatung bis 17:30 Uhr</h3>
                <p>Gemeinsamer Abschluss. Genaue Zeiten folgen nach
                  Festlegung des Veranstaltungsablaufs.</p>
              </article>
            </div>

            <div id="jury-live"><LiveEventPanel teams={teams} isAdmin={isAdmin} onOpenTeam={openLiveTeam}/></div>

            <div className="jury-v3-essential-bottom">
              <article id="jury-background">
                <BookOpen size={23} aria-hidden="true"/>
                <div>
                  <h3>Worum geht es bei Jugend gründet?</h3>
                  <p>Die Schülerinnen und Schüler entwickeln eigenständige Geschäftsideen,
                    arbeiten in Teams an Businessplänen und trainieren unternehmerisches Denken.
                    Die Jury beurteilt am Pitch-Tag die Präsentation und die Antworten
                    auf ihre Fragen.</p>
                  <a href="https://www.jugend-gruendet.de/wettbewerb/"
                    target="_blank" rel="noopener noreferrer">
                    Hintergrund zum Wettbewerb <ArrowRight size={16} aria-hidden="true"/>
                  </a>
                </div>
              </article>
              <article id="jury-evaluation-help">
                <FileText size={23} aria-hidden="true"/>
                <div>
                  <h3>Unterlagen und Bewertungen</h3>
                  <p>Businesspläne und Anlagen sind im Bereich „Unternehmen & Start-ups“
                    je Team hinterlegt. Die persönlichen Bewertungsbögen befinden sich
                    ausschließlich im Bereich „Bewertung“.</p>
                  <button type="button" onClick={()=>navigate('companies')}>
                    Unternehmen ansehen <ArrowRight size={16} aria-hidden="true"/>
                  </button>
                </div>
              </article>
            </div>
              </div>
            </div>
          </>}

          {area==='admin'&&isAdmin&&<>
            <div className="jury-v3-heading">
              <span className="jury-v3-overline">NUR FÜR DIE WETTBEWERBSLEITUNG</span>
              <h2>Verwaltung.</h2>
              <p>Öffentliche Teamprofile und vertrauliche Juryunterlagen verwalten.
                Änderungen an den Teamprofilen werden erst nach dem Speichern veröffentlicht.</p>
            </div>
            <div className="jury-v3-admin-content">
              <ParentAccessAdmin teams={teams}/>
              <PublicTeamEditor teams={teams}/>
              <div className="jury-v3-admin-divider">
                <span className="jury-v3-overline">VERTRAULICHE DOKUMENTE</span>
                <h3>Businesspläne und Juryunterlagen</h3>
                <p>Uploads und ZIP-Importe bleiben im geschützten Administrationsbereich.</p>
              </div>
              <TeamNavigator teams={teams} members={members}
                initialScores={scores} isAdmin={isAdmin} adminMode/>
            </div>
          </>}
        </section>

        <footer className="jury-v3-footer">
          <span>LANDHEIM AMMERSEE · FACHSCHAFT WIRTSCHAFT UND RECHT</span>
          <a href="/">Zur öffentlichen Projektseite <ArrowRight size={16} aria-hidden="true"/></a>
        </footer>
      </div>
    </div>
  );
}
