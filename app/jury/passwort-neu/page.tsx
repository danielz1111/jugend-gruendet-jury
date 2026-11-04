'use client';
import '../JuryPassword.css';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {CheckCircle2,Eye,EyeOff,LockKeyhole} from 'lucide-react';

export default function JuryPasswortNeu(){
 const [token,setToken]=useState<string|null>(null);
 const [badLink,setBadLink]=useState('');
 const [password,setPassword]=useState('');
 const [confirm,setConfirm]=useState('');
 const [visible,setVisible]=useState(false);
 const [busy,setBusy]=useState(false);
 const [done,setDone]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  const fragment=new URLSearchParams(window.location.hash.replace(/^#/,''));
  const access=fragment.get('access_token');
  const kind=fragment.get('type');
  const errorText=fragment.get('error_description')||new URLSearchParams(window.location.search).get('error_description');
  // Remove the bearer token from the address bar as soon as it is read.
  window.history.replaceState(null,'',window.location.pathname);
  if(access&&(kind==='recovery'||kind==='invite')){
   setToken(access);
  }else{
   setBadLink(errorText||'Dieser Einladungs- oder Wiederherstellungslink ist ungültig oder abgelaufen.');
  }
 },[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');
  if(!token){setError('Der Link ist ungültig oder abgelaufen.');return;}
  if(password.length<12){setError('Bitte mindestens zwölf Zeichen verwenden.');return;}
  if(password!==confirm){setError('Die beiden Passwörter stimmen nicht überein.');return;}
  setBusy(true);
  try{
   const response=await fetch('/api/jury/password/update',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({accessToken:token,password}),cache:'no-store'
   });
   const result=await response.json() as {error?:string};
   if(!response.ok)throw Error(result.error||'Speichern fehlgeschlagen.');
   setDone(true);setToken(null);setPassword('');setConfirm('');
  }catch(e){setError(e instanceof Error?e.message:'Passwort konnte nicht gespeichert werden.');}
  finally{setBusy(false);}
 }
 return <main className="jury-password-page">
  <header className="jury-password-header">
   <Link href="/" aria-label="Zur Landheim-Startseite"><img src="https://www.landheim-ammersee.de/themes/master_theme/logo.svg"
    alt="Landheim Ammersee" width="180" height="60"/></Link>
   <span>Fachschaft Wirtschaft und Recht · JUGEND GRÜNDET</span>
  </header>
  <section className="jury-password-card">
   <span className="jury-password-eyebrow"><LockKeyhole size={15}/> PERSÖNLICHER JURYZUGANG</span>
   <h1>Eigenes Passwort festlegen.</h1>
   {done?<div className="jury-password-confirm" role="status"><CheckCircle2 size={24}/>
    <div><strong>Ihr Passwort wurde geändert.</strong>
     <p>Sie können sich jetzt mit Ihrer E-Mail-Adresse und Ihrem neuen Passwort anmelden.</p>
     <Link href="/jury" className="jury-password-finish">Zur Jury-Anmeldung</Link>
    </div>
   </div>:token?<form onSubmit={submit}>
    <p>Wählen Sie ein persönliches Passwort. Niemand von der Wettbewerbsleitung muss dieses Passwort kennen.</p>
    <label htmlFor="jury-new-password">Neues Passwort (mindestens zwölf Zeichen)</label>
    <div className="jury-password-field">
     <input id="jury-new-password" type={visible?'text':'password'} autoComplete="new-password"
      minLength={12} maxLength={128} value={password} required
      onChange={e=>setPassword(e.currentTarget.value)}/>
     <button type="button" aria-label={visible?'Passwort verbergen':'Passwort anzeigen'} onClick={()=>setVisible(v=>!v)}>
      {visible?<EyeOff size={19}/>:<Eye size={19}/>}
     </button>
    </div>
    <label htmlFor="jury-confirm-password">Passwort wiederholen</label>
    <input id="jury-confirm-password" type={visible?'text':'password'} autoComplete="new-password"
      minLength={12} maxLength={128} required value={confirm} onChange={e=>setConfirm(e.currentTarget.value)}/>
    {error&&<p role="alert" className="jury-password-error">{error}</p>}
    <button type="submit" disabled={busy}>{busy?'Wird sicher gespeichert …':'Mein Passwort speichern'}</button>
   </form>:<div className="jury-password-invalid" role="alert">
    <p>{badLink||'Der Einladungslink wird überprüft …'}</p>
    <Link href="/jury/passwort-vergessen">Neuen Link anfordern</Link>
   </div>}
  </section>
 </main>;
}
