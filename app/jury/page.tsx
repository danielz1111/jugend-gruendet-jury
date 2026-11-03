'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,LockKeyhole,ShieldCheck,CalendarDays,Mail} from 'lucide-react';

const messages:Record<string,string>={
 google:'Die Google-Anmeldung konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut.',
 oauth:'Die Google-Anmeldung ist abgelaufen oder die Weiterleitung ist noch nicht eingerichtet.',
 configuration:'Die Anmeldung ist derzeit nicht vollständig eingerichtet.',
 permission:'Die Juryberechtigung konnte nicht geprüft werden.',
 not_allowed:'Dieses Google-Konto ist noch nicht als Jurymitglied freigeschaltet.'
};

export default function JuryLogin(){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [google,setGoogle]=useState<boolean|null>(null);
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const reason=params.get('error');
  if(reason)setError(messages[reason]||'Die Anmeldung konnte nicht abgeschlossen werden.');
  let active=true;
  fetch('/api/jury/providers',{cache:'no-store'})
   .then(r=>r.ok?r.json():null)
   .then((data:{google?:boolean}|null)=>{if(active)setGoogle(data?.google===true)})
   .catch(()=>{if(active)setGoogle(false)});
  return()=>{active=false};
 },[]);

 async function login(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');
  try{
   const response=await fetch('/api/jury/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password}),cache:'no-store'});
   const data=await response.json() as {error?:string;redirect?:string};
   if(!response.ok)throw new Error(data.error||'Anmeldung fehlgeschlagen.');
   window.location.assign('/jury/dashboard');
  }catch(cause){
   setError(cause instanceof Error?cause.message:'Anmeldung fehlgeschlagen.');
   setBusy(false);
  }
 }

 return <main className="demo jury-login-page">
  <header className="demo-header">
   <Link href="/"><ArrowLeft size={17}/> Zur Website</Link>
   <strong>JUGEND GRÜNDET <span>/ JURYPORTAL</span></strong>
   <span className="demo-status"><LockKeyhole size={15}/> Geschützter Zugang</span>
  </header>
  <div className="jury-login-layout">
   <section className="jury-login-intro">
    <span className="demo-overline">LANDHEIM AMMERSEE · JUGEND GRÜNDET 2026/27</span>
    <h1>Willkommen<br/><em>in der Jury.</em></h1>
    <p>Ein geschützter Raum für die Vorbereitung, die Unternehmenspräsentationen und Ihre persönliche Bewertung.</p>
    <div className="jury-login-features">
     <span><ShieldCheck size={19}/> Persönlicher und vertraulicher Zugang</span>
     <span><CalendarDays size={19}/> Wettbewerbstag: 15. Januar 2027</span>
    </div>
   </section>
   <section className="jury-login-panel">
    <span className="demo-overline">PERSÖNLICHE ANMELDUNG</span>
    <h2>Juryportal öffnen</h2>
    <p>Bitte melden Sie sich mit Ihrem freigeschalteten Konto an. Nach der Anmeldung gelangen Sie direkt zu Ihrer Jury-Startseite.</p>
    {google===true&&<>
     <a href="/api/jury/google" className="jury-google-login">
      <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24">
       <path fill="#4285F4" d="M21.35 12.19c0-.73-.06-1.43-.19-2.1H12v3.97h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.7 2.91-4.2 2.91-7.25Z"/>
       <path fill="#34A853" d="M12 21.7c2.62 0 4.81-.87 6.42-2.36l-3.14-2.44c-.87.58-1.98.92-3.28.92-2.52 0-4.65-1.7-5.41-3.99H3.35v2.5a9.7 9.7 0 0 0 8.65 5.37Z"/>
       <path fill="#FBBC05" d="M6.59 13.83a5.78 5.78 0 0 1 0-3.66v-2.5H3.35a9.72 9.72 0 0 0 0 8.66l3.24-2.5Z"/>
       <path fill="#EA4335" d="M12 6.18c1.43 0 2.71.49 3.72 1.46l2.79-2.8A9.27 9.27 0 0 0 12 2.3a9.7 9.7 0 0 0-8.65 5.37l3.24 2.5c.76-2.29 2.89-3.99 5.41-3.99Z"/>
      </svg>
      Mit Google anmelden <ArrowRight size={17}/>
     </a>
     <div className="jury-login-divider"><span>oder mit E-Mail und Passwort</span></div>
    </>}
    {google===false&&<p className="jury-provider-note"><Mail size={17}/> Die Google-Anmeldung ist für dieses Portal derzeit noch nicht freigeschaltet. Der bisherige E-Mail-Zugang bleibt verfügbar.</p>}
    <form onSubmit={login} className="jury-login-form">
     <label htmlFor="jury-email">E-Mail-Adresse</label>
     <input id="jury-email" type="email" autoComplete="username" required value={email} onChange={event=>setEmail(event.target.value)} placeholder="name@beispiel.de"/>
     <label htmlFor="jury-password">Passwort</label>
     <input id="jury-password" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)} placeholder="Ihr Passwort"/>
     {error&&<p role="alert" className="jury-login-error">{error}</p>}
     <button type="submit" disabled={busy} className="jury-login-submit">{busy?'Anmeldung wird geprüft …':'Sicher anmelden'} <ArrowRight size={17}/></button>
    </form>
    <small className="jury-login-footnote">Eine öffentliche Registrierung ist nicht möglich. Nur persönlich freigeschaltete Jurymitglieder erhalten Zugang.</small>
   </section>
  </div>
 </main>;
}
