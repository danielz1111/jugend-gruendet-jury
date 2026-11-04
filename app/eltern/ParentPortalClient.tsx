'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,Building2,CalendarDays,CheckCircle2,FileText,LockKeyhole,Mail,ShieldCheck,Users} from 'lucide-react';
import './ParentPortal.css';
import './ParentResponsive.css';

type RequestRow={id:string;team_id:string;status:'pending'|'approved'|'rejected';created_at:string};
type Company={id:string;name:string;tagline:string|null;description:string|null;position:number;
 problem:string|null;solution:string|null;audience:string|null;model:string|null;
 members:Array<{id:string;display_name:string;expert_role:string|null}>};
type Team={id:string;name:string};
export default function ParentPortalClient({userEmail,teams,requests,companies,error}:{
 userEmail:string|null;teams:Team[];requests:RequestRow[];companies:Company[];error:string
}){
 const [mode,setMode]=useState<'login'|'register'>('login');
 const [headerCompact,setHeaderCompact]=useState(false);
 useEffect(()=>{
   if(new URLSearchParams(window.location.search).get('zugang')==='registrieren')setMode('register');
   const onScroll=()=>setHeaderCompact(window.scrollY>140);
   onScroll();
   window.addEventListener('scroll',onScroll,{passive:true});
   return ()=>window.removeEventListener('scroll',onScroll);
 },[]);
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [parentName,setParentName]=useState(''),[childName,setChildName]=useState(''),[teamId,setTeamId]=useState('');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[failed,setFailed]=useState(false);
 async function auth(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');setFailed(false);
  try{
   const res=await fetch('/api/parents/auth',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action:mode,email,password}),cache:'no-store'});
   const data=await res.json() as {error?:string;message?:string};
   if(!res.ok)throw new Error(data.error||'Anmeldung nicht möglich');
   if(mode==='login')window.location.assign('/eltern');
   else{setMode('login');setMessage(data.message||'Bitte bestätigen Sie Ihre E-Mail-Adresse.')}
  }catch(e){setFailed(true);setMessage(e instanceof Error?e.message:'Anmeldung fehlgeschlagen.')}
  finally{setBusy(false)}
 }
 async function requestAccess(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setMessage('');setFailed(false);
  try{
   const res=await fetch('/api/parents/request',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({teamId,parentName,childName}),cache:'no-store'});
   const data=await res.json() as {error?:string};
   if(!res.ok)throw new Error(data.error||'Antrag nicht möglich');
   window.location.reload();
  }catch(e){setFailed(true);setMessage(e instanceof Error?e.message:'Antrag konnte nicht gespeichert werden.');setBusy(false)}
 }
 async function logout(){
  await fetch('/api/parents/auth',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({action:'logout'}),cache:'no-store'});
  window.location.assign('/eltern');
 }
 return <main className="parent-portal" id="parent-top">
  <header className={headerCompact?'parent-header parent-header--compact':'parent-header'}><div className="parent-header-inner">
   <Link href="/" className="parent-brand" aria-label="Landheim Ammersee · Jugend gründet – zur Startseite">
     <span className="parent-official-mark"><img
       src="https://www.landheim-ammersee.de/themes/master_theme/logo.svg"
       width="222" height="67" alt="Landheim Ammersee" className="parent-official-logo"
     /></span>
     <span className="parent-brand-details">
       <span className="parent-compact-school">LANDHEIM AMMERSEE</span>
       <strong>Fachschaft Wirtschaft und Recht</strong>
       <small>JUGEND GRÜNDET · 2026/27</small>
     </span>
   </Link>
   <div className="parent-header-actions">
     <Link href="/#jury">Anmeldung</Link>
     <span>ELTERNPORTAL</span>
     {userEmail&&<button type="button" onClick={()=>void logout()}>Abmelden</button>}
   </div>
  </div></header>
  <div className="parent-main">
   <section className="parent-intro">
    <div><span className="parent-overline">LANDHEIM AMMERSEE · SCHULJAHR 2026/27</span>
     <h1>Unsere Ideen.<br/><em>Ihr Einblick.</em></h1>
     <p>Begleiten Sie die unternehmerischen Ideen Ihres Kindes. Informationen zum Wettbewerb
      sind hier verfügbar; das vollständige Unternehmensprofil öffnen wir nach einer persönlichen Freigabe.</p>
    </div>
    <div className="parent-intro-decoration"><ShieldCheck size={54}/><strong>Geschützter<br/>Elternbereich</strong></div>
   </section>
   <section className="parent-essentials" aria-labelledby="parent-info-title">
    <span className="parent-overline">ALLES WICHTIGE IN KÜRZE</span>
    <h2 id="parent-info-title">Der Pitch-Tag auf einen Blick.</h2>
    <div className="parent-info-grid">
     <article><CalendarDays size={25}/><strong>15. Januar 2027</strong><span>Freitag · 13:15–17:30 Uhr</span></article>
     <article><Building2 size={25}/><strong>Landheim Ammersee</strong><span>Vortragssaal · Schondorf</span></article>
     <article><Users size={25}/><strong>Neun Gründerteams</strong><span>Schülerinnen und Schüler präsentieren ihre Geschäftsideen und stellen sich Juryfragen.</span></article>
    </div>
    <p className="parent-info-note">Die genaue Reihenfolge der Präsentationen wird bekanntgegeben, sobald der Ablauf feststeht.</p>
   </section>
   <section className="parent-access" aria-labelledby="parent-access-title">
    <span className="parent-overline">PERSÖNLICHER ELTERNZUGANG</span>
    <h2 id="parent-access-title">{userEmail?'Ihr Unternehmenszugang.':'Zugang beantragen.'}</h2>
    {!userEmail?<div className="parent-auth-layout">
     <div className="parent-auth-desc"><h3>Das Unternehmen Ihres Kindes kennenlernen.</h3>
      <p>Nach Registrierung und E-Mail-Bestätigung können Sie einen Zugang zum
       Unternehmen Ihres Kindes beantragen. Die Wettbewerbsleitung prüft die
       Zuordnung und schaltet das vollständige Profil persönlich frei.</p>
      <div className="parent-auth-privacy"><LockKeyhole size={18}/>
       <span>Businesspläne, interne Juryunterlagen, persönliche Jury-Notizen und Bewertungen bleiben für Eltern grundsätzlich gesperrt.</span></div>
     </div>
     <form onSubmit={auth} className="parent-auth-form">
      <div className="parent-auth-tabs">
       <button type="button" className={mode==='login'?'active':''} onClick={()=>{setMode('login');setMessage('')}}>Anmelden</button>
       <button type="button" className={mode==='register'?'active':''} onClick={()=>{setMode('register');setMessage('')}}>Registrieren</button>
      </div>
      <label>E-Mail-Adresse<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@beispiel.de"/></label>
      <label>Passwort<input type="password" autoComplete={mode==='register'?'new-password':'current-password'} minLength={10} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mindestens 10 Zeichen"/></label>
      {message&&<p className={failed?'parent-error':'parent-success'} role="status">{message}</p>}
      <button type="submit" disabled={busy} className="parent-submit">{busy?'Einen Moment …':mode==='register'?'Registrierung starten':'Anmelden'}<ArrowRight size={17}/></button>
      <small>{mode==='register'?'Bitte bestätigen Sie anschließend Ihre E-Mail-Adresse.':'Bereits registriert? Melden Sie sich mit Ihrer bestätigten E-Mail-Adresse an.'}</small>
     </form>
    </div>:<div className="parent-logged-in">
     <div className="parent-account"><Mail size={19}/> Angemeldet als <strong>{userEmail}</strong></div>
     {error&&<p className="parent-error" role="alert">{error}</p>}
     {requests.length>0&&<div className="parent-request-list">
      <h3>Ihre bisherigen Anträge</h3>{requests.map(r=><div className="parent-request-row" key={r.id}>
       <strong>{teams.find(t=>t.id===r.team_id)?.name||companies.find(c=>c.id===r.team_id)?.name||'Unternehmen'}</strong>
       <span className={'parent-request-status parent-status-'+r.status}>{r.status==='approved'?'Freigeschaltet':r.status==='pending'?'Wird geprüft':'Nicht freigeschaltet'}</span>
      </div>)}
     </div>}
     <div className="parent-approved-companies">
      {companies.map(company=><article className="parent-company" key={company.id}>
       <div className="parent-company-heading"><span className="parent-overline">FREIGESCHALTETES UNTERNEHMEN</span>
        <h3>{company.name}</h3><p>{company.tagline||company.description||'Ein junges Gründerteam am Landheim Ammersee.'}</p></div>
       <div className="parent-company-profile">
        <h4>Das Unternehmen auf einen Blick</h4><p>{company.description||'Eine Beschreibung wird ergänzt.'}</p>
        <div className="parent-profile-grid">
         {([{title:'Kundenproblem',value:company.problem},{title:'Die Lösung',value:company.solution},{title:'Zielgruppe',value:company.audience},{title:'Geschäftsmodell',value:company.model}] as const).map(item=><div key={item.title}><strong>{item.title}</strong><p>{item.value||'Wird noch ergänzt.'}</p></div>)}
        </div>
        <h4>Das Gründerteam</h4><div className="parent-member-grid">
         {company.members.map(member=><div key={member.id}><Users size={18}/><span><strong>{member.display_name}</strong><small>{member.expert_role||'Mitglied des Gründerteams'}</small></span></div>)}
        </div>
       </div>
      </article>)}
     </div>
     <div className="parent-request-form-wrap"><h3>Freischaltung eines Unternehmens beantragen</h3>
      <p>Wählen Sie das Unternehmen Ihres Kindes aus. Der Antrag wird der Wettbewerbsleitung zur persönlichen Prüfung vorgelegt.</p>
      <form className="parent-request-form" onSubmit={requestAccess}>
       <label>Ihr vollständiger Name<input value={parentName} onChange={e=>setParentName(e.target.value)} minLength={2} maxLength={120} required placeholder="Vor- und Nachname"/></label>
       <label>Name Ihres Kindes<input value={childName} onChange={e=>setChildName(e.target.value)} minLength={2} maxLength={120} required placeholder="Vor- und Nachname"/></label>
       <label>Unternehmen<select required value={teamId} onChange={e=>setTeamId(e.target.value)}>
        <option value="">Unternehmen auswählen</option>
        {teams.filter(t=>!requests.some(r=>r.team_id===t.id)).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
       </select></label>
       {message&&<p className={failed?'parent-error':'parent-success'} role="status">{message}</p>}
       <button type="submit" className="parent-submit" disabled={busy||teams.every(t=>requests.some(r=>r.team_id===t.id))}>{busy?'Antrag wird gespeichert …':'Freischaltung beantragen'}<ArrowRight size={17}/></button>
      </form>
     </div>
    </div>}
   </section>
   <section className="parent-locked" aria-labelledby="parent-locked-title"><LockKeyhole size={26}/>
    <div><h2 id="parent-locked-title">Interne Juryunterlagen</h2><p>Businesspläne, eingereichte Anlagen und Jurybewertungen sind nur für die Jury zugänglich.</p></div>
    <span><LockKeyhole size={15}/> Nur für die Jury freigegeben</span>
   </section>
   <footer className="parent-footer"><Link href="/"><ArrowLeft size={16}/> Zurück zur Projektseite</Link><span>Landheim Ammersee · Jugend gründet 2026/27</span></footer>
  </div>
 </main>;
}
