'use client';
import {useEffect,useState} from 'react';
import {CheckCircle2,ClipboardCopy,KeyRound,LockKeyhole,RefreshCcw,ShieldCheck,UserPlus} from 'lucide-react';
import './JuryAccountAdmin.css';

type Status='not_created'|'auth_exists'|'password_change_required'|'active';
type Member={email:string;name:string;status:Status};
type Generated={email:string;name:string;temporaryPassword:string};
const labels:Record<Status,string>={
 not_created:'Noch nicht eingerichtet',
 auth_exists:'Konto ohne Juryrolle – prüfen',
 password_change_required:'Startpasswort vergeben / Änderung ausstehend',
 active:'Aktiviert'
};
export default function JuryAccountAdmin(){
 const [members,setMembers]=useState<Member[]>([]);
 const [loading,setLoading]=useState(true);
 const [working,setWorking]=useState<string|null>(null);
 const [error,setError]=useState('');
 const [generated,setGenerated]=useState<Generated|null>(null);
 const [copied,setCopied]=useState(false);
 async function load(){
  setLoading(true);setError('');
  try{
   const r=await fetch('/api/jury/admin/accounts',{cache:'no-store'});
   const data=await r.json() as {members?:Member[];error?:string};
   if(!r.ok)throw Error(data.error||'Konten konnten nicht geladen werden.');
   setMembers(data.members||[]);
  }catch(e){setError(e instanceof Error?e.message:'Fehler beim Laden.');}
  finally{setLoading(false);}
 }
 useEffect(()=>{void load()},[]);
 async function prepare(m:Member){
  const action=m.status==='not_created'?'create':'reset';
  const prompt=action==='create'
   ?'Für '+m.name+' ein eigenes Jurykonto mit zufälligem Startpasswort anlegen? Es wird keine E-Mail verschickt.'
   :'Das bisherige Passwort von '+m.name+' durch ein neues Startpasswort ersetzen? Die Person muss es beim nächsten Login ändern.';
  if(!window.confirm(prompt))return;
  setWorking(m.email);setError('');setGenerated(null);
  try{
   const r=await fetch('/api/jury/admin/accounts',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({action,email:m.email}),cache:'no-store'
   });
   const data=await r.json() as {error?:string;name?:string;email?:string;temporaryPassword?:string};
   if(!r.ok||!data.temporaryPassword||!data.name||!data.email)
    throw Error(data.error||'Passwort konnte nicht erstellt werden.');
   setGenerated({email:data.email,name:data.name,temporaryPassword:data.temporaryPassword});
   await load();
  }catch(e){setError(e instanceof Error?e.message:'Fehler beim Erzeugen.');}
  finally{setWorking(null);}
 }
 async function copy(){
  if(!generated)return;
  try{await navigator.clipboard.writeText(generated.temporaryPassword);setCopied(true)}
  catch{setError('Kopieren nicht möglich. Bitte das Passwort manuell übernehmen.');}
 }
 return <section className="jury-accounts" aria-labelledby="jury-accounts-title">
  <header className="jury-accounts-header">
   <div>
    <span className="jury-v3-overline">ADMINISTRATION · JURYZUGÄNGE</span>
    <h2 id="jury-accounts-title">Persönliche Juryzugänge.</h2>
    <p>Jedes Jurymitglied erhält von Ihnen persönlich ein eigenes Startpasswort.
     Beim ersten Login muss es ein selbst gewähltes Passwort festlegen.
     Alle Passwörter werden von Supabase Auth verwaltet.</p>
   </div>
   <button onClick={()=>void load()} disabled={loading} type="button"><RefreshCcw size={17}/> Aktualisieren</button>
  </header>
  {error&&<p role="alert" className="jury-accounts-error">{error}</p>}
  {loading&&members.length===0?<p>Juryzugänge werden geladen …</p>:
   <div className="jury-accounts-list">
    {members.map(m=><article className="jury-accounts-person" key={m.email}>
     <div>
      <strong>{m.name}</strong>
      <span>{m.email}</span>
      <small className={'jury-accounts-status '+m.status}>
       {m.status==='active'?<CheckCircle2 size={14}/>:<LockKeyhole size={14}/>}
       {labels[m.status]}</small>
     </div>
     {m.status!=='auth_exists'&&<button type="button" disabled={working!==null}
      onClick={()=>void prepare(m)}>
      {m.status==='not_created'?<UserPlus size={17}/>:<KeyRound size={17}/>}
      {working===m.email?'Bitte warten …':m.status==='not_created'?'Startpasswort erzeugen':'Passwort zurücksetzen'}
     </button>}
    </article>)}
   </div>}
  <div className="jury-accounts-tip"><ShieldCheck size={19}/>
   <p>Das Startpasswort wird nur einmal angezeigt und nicht in der Jury-Datenbank gespeichert.
    Übermitteln Sie es persönlich. Bewahren Sie keine Passwortliste in ungeschützten Dateien auf.
    Bei Verlust können Sie ein neues Startpasswort erzeugen.</p>
  </div>
  {generated&&<div className="jury-accounts-overlay" role="presentation">
   <section role="dialog" aria-modal="true" aria-labelledby="jury-accounts-generated" className="jury-accounts-dialog">
    <span className="jury-v3-overline">VERTRAULICH · EINMALIGE ANZEIGE</span>
    <h3 id="jury-accounts-generated">Startpasswort für {generated.name}</h3>
    <p>Benutzername: <strong>{generated.email}</strong></p>
    <div className="jury-accounts-secret">{generated.temporaryPassword}</div>
    <button type="button" className="jury-accounts-copy" onClick={()=>void copy()}>
     <ClipboardCopy size={16}/>{copied?'Kopiert':'Passwort kopieren'}
    </button>
    <p>Teilen Sie dieses Passwort ausschließlich dem betreffenden Jurymitglied mit.
     Nach dem ersten Login wird eine Passwortänderung erzwungen.</p>
    <button type="button" className="jury-accounts-close"
     onClick={()=>{setGenerated(null);setCopied(false)}}>
     Ich habe das Passwort sicher übernommen · Schließen
    </button>
   </section>
  </div>}
 </section>;
}
