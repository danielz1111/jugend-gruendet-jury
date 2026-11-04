'use client';

import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {ArrowRight,CalendarDays,Check,ChevronDown,Clock3,Presentation,Users} from 'lucide-react';
import './JourneyTimeline.css';

type Milestone={
  id:string;start:string;date:string;short:string;title:string;
  description:string;details:string[];category:string;special?:boolean;
};

const milestones:Milestone[]=[
  {
    id:'auftakt',start:'2026-10-01',date:'OKTOBER 2026',short:'Ideen & Teams',
    title:'Aus Ideen werden Unternehmungen.',
    category:'PROJEKTSTART',
    description:'Die Schülerinnen und Schüler entwickeln erste Geschäftsideen, finden sich in Gründerteams zusammen und machen aus einem Alltagsproblem eine unternehmerische Fragestellung.',
    details:['Was soll durch die Idee besser werden?','Für wen entwickelt das Team seine Lösung?','Wie lässt sich die Idee als Geschäftsmodell erklären?']
  },
  {
    id:'experten',start:'2026-11-02',date:'02.–20. NOV',short:'Expertenarbeit',
    title:'Aus der Idee wird ein Geschäftsmodell.',
    category:'AKTUELLE ARBEITSPHASE',
    description:'Die Teams vertiefen ihre Geschäftsideen und übernehmen Verantwortung für unterschiedliche Expertenbereiche. Markt, Zielgruppe, Marketing, Finanzierung und Umsetzung werden Schritt für Schritt durchdacht.',
    details:['Expertenbereiche A–E: Markt und Zielgruppe, Marketing, Finanzen, Umsetzung sowie Organisation und Rechtsform','Bei Viererteams werden die Bereiche D und E verbunden.','Die Ergebnisse bilden die Grundlage für den späteren Businessplan.']
  },
  {
    id:'seminar',start:'2026-11-21',date:'21. NOVEMBER',short:'Präsentationsseminar',
    title:'Sicher auftreten. Überzeugend präsentieren.',
    category:'BESONDERER PROGRAMMPUNKT',special:true,
    description:'Am Samstag, 21. November 2026, ist ein Präsentationstraining mit Sabine Walter vorgesehen. Die Jugendlichen üben, ihre Ideen auf den Punkt zu bringen und vor anderen selbstbewusst zu vertreten.',
    details:['Körpersprache, Stimme und ein überzeugender persönlicher Auftritt','Lampenfieber, Blackouts und der souveräne Umgang mit kritischen Fragen','Vom Alltagsgegenstand über eine Argumentationsstruktur zum eigenen Gründungsthema']
  },
  {
    id:'businessplan',start:'2026-11-22',date:'NOV–DEZ 2026',short:'Businessplan',
    title:'Ein stimmiges unternehmerisches Gesamtkonzept.',
    category:'VERTIEFUNG & DOKUMENTATION',
    description:'Jetzt führen die Teams ihre fachlichen Überlegungen zu einem Businessplan zusammen. Die Aufgabenbereiche werden abgestimmt und die Tragfähigkeit der Geschäftsidee überprüft.',
    details:['Zielgruppen, Marketing, Kosten, Finanzierung und Organisation zusammenführen','Annahmen begründen und offene Fragen erkennbar machen','Die schriftliche Arbeit auf den Pitch vorbereiten']
  },
  {
    id:'abgabe',start:'2026-12-18',date:'18. DEZEMBER',short:'Abgabetermin',
    title:'Meilenstein: Businessplan abgegeben.',
    category:'VERBINDLICHER TERMIN',special:true,
    description:'Am 18. Dezember 2026 endet die Businessplanphase. Die eingereichten Konzepte bilden eine wichtige Grundlage für die Vorbereitung auf die Präsentationen.',
    details:['Abgabe der Businesspläne am 18. Dezember 2026','Die Businesspläne dienen der Jury als Hintergrundinformation.','Beim schulischen Pitch werden die Präsentation und die Antworten auf die Juryfragen bewertet.']
  },
  {
    id:'vorbereitung',start:'2027-01-01',date:'JANUAR 2027',short:'Pitchvorbereitung',
    title:'Aus dem Businessplan wird eine überzeugende Geschichte.',
    category:'PRÄSENTATIONSVORBEREITUNG',
    description:'Die Teams verdichten ihre Ideen zu einer verständlichen Präsentation. Sie üben den Auftritt, die Zusammenarbeit und den Umgang mit Nachfragen.',
    details:['Die Geschäftsidee für Zuhörerinnen und Zuhörer verständlich machen','Präsentation, Stimme und Körpersprache aufeinander abstimmen','Antworten auf fachliche und kritische Fragen trainieren']
  },
  {
    id:'pitch',start:'2027-01-15',date:'15. JANUAR 2027',short:'Großer Pitch-Tag',
    title:'Die Bühne gehört den Ideen.',
    category:'DER HÖHEPUNKT',special:true,
    description:'Neun Unternehmerteams stellen ihre Ideen vor einer Jury vor. Sie zeigen, was sie entwickelt haben, und beantworten Fragen zu ihren Entscheidungen.',
    details:['Freitag, 15. Januar 2027 · 13:15–17:30 Uhr','Veranstaltungsort: Vortragssaal am Landheim Ammersee','Die Teamreihenfolge und die genauen Einzelzeiten werden gesondert ergänzt.']
  },
  {
    id:'planspiel',start:'2027-02-20',date:'2. HALBJAHR 2027',short:'Unternehmensplanspiel',
    title:'Unternehmen führen. Entscheidungen erleben.',
    category:'NÄCHSTE WETTBEWERBSPHASE',
    description:'Nach dem schulischen Pitch lernen die Schülerinnen und Schüler unternehmerische Entscheidungen im virtuellen Unternehmensplanspiel kennen.',
    details:['Strategische Entscheidungen unter wechselnden Bedingungen treffen','Wirtschaftliche Zusammenhänge anhand ihrer Auswirkungen erkennen','Der Zeitplan dieser Phase wird im zweiten Schulhalbjahr konkretisiert.']
  }
];

const weeklyPlan=[
  {period:'02.–20. NOVEMBER',title:'Arbeiten in Expertenbereichen',description:'Recherche, betriebswirtschaftliche Fragen, Markt und Zielgruppe, Organisation und Umsetzung'},
  {period:'21. NOVEMBER',title:'Präsentationsseminar mit Sabine Walter',description:'Auftritt, überzeugende Strukturen und Umgang mit Lampenfieber und Juryfragen'},
  {period:'NOVEMBER–17. DEZEMBER',title:'Businessplan erstellen',description:'Ergebnisse zu einem nachvollziehbaren Unternehmenskonzept zusammenführen'},
  {period:'JANUAR 2027',title:'Pitchvorbereitung',description:'Präsentieren, Nachfragen beantworten und die gemeinsame Darstellung üben'}
];

function berlinToday():string{
 const parts=new Intl.DateTimeFormat('de-DE',{timeZone:'Europe/Berlin',
   year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const get=(type:string)=>parts.find(p=>p.type===type)?.value||'01';
 return get('year')+'-'+get('month')+'-'+get('day');
}
function currentMilestone(date:string):number{
 for(let i=milestones.length-1;i>=0;i--){
   if(date>=milestones[i].start)return i;
 }
 return 0;
}

export default function JourneyTimeline(){
 const [active,setActive]=useState<number|null>(null);
 const [hovered,setHovered]=useState<number|null>(null);
 const [pinned,setPinned]=useState<number|null>(null);
 const [weeklyOpen,setWeeklyOpen]=useState(false);
 const [revealed,setRevealed]=useState(false);
 const hoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const trackRef=useRef<HTMLDivElement|null>(null);
 const sectionRef=useRef<HTMLElement|null>(null);

 useEffect(()=>{
   const sync=()=>setActive(currentMilestone(berlinToday()));
   sync();
   const timer=window.setInterval(sync,60*60*1000);
   return ()=>window.clearInterval(timer);
 },[]);
 useEffect(()=>{
   const node=sectionRef.current;
   if(!node)return;
   if(!('IntersectionObserver' in window)){setRevealed(true);return;}
   const observer=new IntersectionObserver(entries=>{
     if(entries.some(e=>e.isIntersecting)){setRevealed(true);observer.disconnect();}
   },{threshold:.13});
   observer.observe(node);
   return ()=>observer.disconnect();
 },[]);

 useEffect(()=>{
   const track=trackRef.current;
   if(!track||active===null)return;
   const itemWidth=track.scrollWidth/milestones.length;
   const offset=(active+.5)*itemWidth-track.clientWidth/2;
   track.scrollTo({left:Math.max(0,offset),behavior:'auto'});
 },[active]);

 const show=(index:number)=>{
   if(hoverTimer.current!==null)clearTimeout(hoverTimer.current);
   if(pinned!==null)return;
   hoverTimer.current=setTimeout(()=>setHovered(index),170);
 };
 const clearHover=()=>{
   if(hoverTimer.current!==null)clearTimeout(hoverTimer.current);
   hoverTimer.current=null;
   setHovered(null);
 };
 const choose=(index:number)=>{
   clearHover();
   setPinned(old=>old===index?null:index);
 };
 const chosen=pinned??hovered??active??0;
 const milestone=milestones[chosen];
 const progress=active===null?0:(active/(milestones.length-1))*100;

 return (
  <section className="lm-journey lm-section" id="meilensteine"
    aria-labelledby="lm-journey-title" ref={sectionRef}>
   <div className="lm-container">
    <div className="lm-journey-heading">
     <div>
      <div className="lm-section-index lm-journey-index">
       <span>DER PROJEKTFAHRPLAN</span><span>2026 / 2027</span>
      </div>
      <h2 id="lm-journey-title">Unser Weg<br/>zum <em>großen Pitch.</em></h2>
     </div>
     <div className="lm-journey-heading-aside">
      <p>Von der ersten Geschäftsidee bis zum Auftritt vor der Jury: Begleiten Sie unsere neun Gründerteams auf ihrem Weg.</p>
      <span><span className="lm-journey-key-dot" aria-hidden="true"/> Die aktuelle Etappe ist automatisch markiert.</span>
     </div>
    </div>

    <div className="lm-journey-timeline-shell">
     <div className="lm-journey-track" ref={trackRef}
       aria-label="Interaktive Meilensteine der Gründungsreise"
       onMouseLeave={clearHover}>
      <ol className={revealed?'lm-journey-steps is-revealed':'lm-journey-steps'}
       style={{'--journey-progress':progress+'%'} as CSSProperties}>
       {milestones.map((item,index)=>{
        const current=index===active;
        const selected=index===chosen;
        const past=active!==null&&index<active;
        const upper=index%2===0;
        return <li key={item.id} className={[
          'lm-journey-step',upper?'is-upper':'is-lower',
          current?'is-current':'',past?'is-past':'',
          selected?'is-selected':'',item.special?'is-special':''
         ].filter(Boolean).join(' ')}>
          <span className="lm-journey-step-label">
           <small>{item.date}</small><strong>{item.short}</strong>
          </span>
          <button type="button" className="lm-journey-point"
           aria-label={item.date+': '+item.title+(current?' – aktuell':'')}
           aria-expanded={selected}
           aria-controls="lm-journey-detail"
           onMouseEnter={()=>show(index)}
           onFocus={()=>show(index)}
           onBlur={()=>{if(pinned===null)clearHover()}}
           onClick={()=>choose(index)}>
           {past?<Check size={15} strokeWidth={2.5} aria-hidden="true"/>:
             <span className="lm-journey-point-core" aria-hidden="true"/>}
          </button>
          <span className="lm-journey-step-index">{String(index+1).padStart(2,'0')}</span>
         </li>;
       })}
      </ol>
     </div>
     <p className="lm-journey-mobile-hint">Die Zeitschiene lässt sich seitlich verschieben. Tippen Sie einen Punkt für die Details an.</p>
    </div>

    <div className="lm-journey-detail" id="lm-journey-detail" aria-live="polite" key={milestone.id}>
     <div className="lm-journey-detail-lead">
      <span className="lm-journey-detail-category">
       <CalendarDays size={15} aria-hidden="true"/> {milestone.category}
      </span>
      <div className="lm-journey-detail-date">{milestone.date}</div>
      <h3>{milestone.title}</h3>
      <p>{milestone.description}</p>
     </div>
     <div className="lm-journey-detail-more">
      <span className="lm-journey-detail-kicker">DAS STEHT AN</span>
      <ul>{milestone.details.map((detail,i)=><li key={i}>
       <span>{String(i+1).padStart(2,'0')}</span><p>{detail}</p>
      </li>)}</ul>
      {milestone.id==='seminar'&&<span className="lm-journey-special-note">
        <Presentation size={17} aria-hidden="true"/> Besonderes Training mit Sabine Walter
      </span>}
      {milestone.id==='pitch'&&<a className="lm-journey-to-pitch" href="#pitch">
        Zum Pitch-Tag <ArrowRight size={16} aria-hidden="true"/>
      </a>}
     </div>
    </div>

    <div className="lm-journey-weeks">
     <div className="lm-journey-weeks-summary">
      <div><span className="lm-journey-weeks-overline">EINBLICK IN DIE PROJEKTARBEIT</span>
       <h3>Was passiert in den einzelnen Phasen?</h3>
       <p>Ein vorläufiger Arbeitsplan – die Unterrichtsschwerpunkte können sich im Projektverlauf anpassen.</p>
      </div>
      <button type="button" aria-expanded={weeklyOpen} aria-controls="lm-journey-weeks-content"
       onClick={()=>setWeeklyOpen(v=>!v)}>Wochenfahrplan {weeklyOpen?'schließen':'ansehen'}
       <ChevronDown size={18} className={weeklyOpen?'is-open':''} aria-hidden="true"/>
      </button>
     </div>
     {weeklyOpen&&<div className="lm-journey-week-grid" id="lm-journey-weeks-content">
      {weeklyPlan.map((week,index)=><article key={week.period}>
       <span>{String(index+1).padStart(2,'0')} / {week.period}</span>
       <h4>{week.title}</h4><p>{week.description}</p>
      </article>)}
     </div>}
    </div>

    <p className="lm-journey-footnote">
     <Clock3 size={14} aria-hidden="true"/>
     Die feststehenden Termine sind hervorgehoben. Die übrigen Phasen zeigen den geplanten Projektverlauf.
    </p>
   </div>
  </section>
 );
}
