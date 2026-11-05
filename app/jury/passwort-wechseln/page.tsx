'use client';
import '../JuryPassword.css';
import {useState} from 'react';
import Link from 'next/link';
import {CheckCircle2,Eye,EyeOff,KeyRound,LockKeyhole} from 'lucide-react';

export default function JuryErstpasswortAendern(){
 const [password,setPassword]=useState('');
 const [currentPassword,setCurrentPassword]=useState('');
 const [confirm,setConfirm]=useState('');
 const [show,setShow]=useState(false);
 const [saving,setSaving]=useState(false);
 const [done,setDone]=useState(false);
 const [error,setError]=useState('');
 async function save(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');
  if(password.length<12){setError('Bitte wählen Sie mindestens zwölf Zeichen.');return;}
  if(password!==confirm){setError('Die beiden Eingaben stimmen nicht überein.');return;}
  setSaving(true);
  try{
   const r=await fetch('/api/jury/password/change',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({password,currentPassword}),cache:'no-store'
   });
   const data=await r.json() as {error?:string};
   if(!r.ok)throw new Error(data.error||'Passwort konnte nicht gespeichert werden.');
   setDone(true);setPassword('');setConfirm('');setCurrentPassword('');
  }catch(e){setError(e instanceof Error?e.message:'Fehler bei der Passwortänderung.');}
  finally{setSaving(false);}
 }
 return <main className="jury-password-page">
  <header className="jury-password-header">
   <Link href="/">LANDHEIM AMMERSEE · JUGEND GRÜNDET</Link>
   <span>Persönlicher Juryzugang</span>
  </header>
  <section className="jury-password-card">
   <span className="jury-password-eyebrow"><LockKeyhole size={16}/> SICHERHEIT · ERSTE ANMELDUNG</span>
   {done?<><div className="jury-password-confirm" role="status">
    <CheckCircle2 size={25}/>
    <div><strong>Ihr persönliches Passwort ist eingerichtet.</strong><p>Das bisherige Startpasswort kann nicht mehr verwendet werden.</p></div>
   </div>
    <Link href="/jury" className="jury-password-finish">Mit neuem Passwort anmelden</Link>
   </>:<>
    <h1>Willkommen im Juryportal.</h1>
    <p>Sie haben sich mit Ihrem persönlichen Startpasswort angemeldet.
     Bevor Sie die Unternehmerteams und Juryunterlagen sehen können, legen Sie bitte Ihr eigenes Passwort fest.</p>
    <form onSubmit={save}>
     <label htmlFor="jury-temporary-password">Startpasswort zur Bestätigung</label>
     <input id="jury-temporary-password" type="password" autoComplete="current-password"
      required value={currentPassword} onChange={e=>setCurrentPassword(e.currentTarget.value)}/>
     <label htmlFor="jury-chosen-password">Ihr neues Passwort (mindestens 12 Zeichen)</label>
     <div className="jury-password-field">
      <input id="jury-chosen-password" type={show?'text':'password'} required minLength={12}
       maxLength={128} autoComplete="new-password" value={password}
       onChange={e=>setPassword(e.currentTarget.value)}/>
      <button type="button" aria-label={show?'Passwort verbergen':'Passwort anzeigen'}
       onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button>
     </div>
     <label htmlFor="jury-chosen-confirm">Neues Passwort wiederholen</label>
     <input id="jury-chosen-confirm" type={show?'text':'password'} required minLength={12}
      maxLength={128} autoComplete="new-password" value={confirm}
      onChange={e=>setConfirm(e.currentTarget.value)}/>
     {error&&<p className="jury-password-error" role="alert">{error}</p>}
     <button disabled={saving} type="submit"><KeyRound size={18}/>{saving?'Speichern …':'Mein persönliches Passwort festlegen'}</button>
    </form>
    <p className="jury-password-hint">Ihr Startpasswort gilt nur für die Erstanmeldung. Ihre Wettbewerbsleitung kennt das neue Passwort nicht.</p>
   </>}
  </section>
 </main>;
}
