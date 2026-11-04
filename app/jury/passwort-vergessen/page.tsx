'use client';
import '../JuryPassword.css';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,CheckCircle2,LockKeyhole,Mail} from 'lucide-react';

export default function JuryPasswortVergessen(){
 const [email,setEmail]=useState('');
 const [busy,setBusy]=useState(false);
 const [sent,setSent]=useState(false);
 const [error,setError]=useState('');
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');
  try{
   const response=await fetch('/api/jury/password/recover',{
    method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email}),cache:'no-store'
   });
   const data=await response.json() as {error?:string};
   if(!response.ok)throw Error(data.error||'Anfrage konnte nicht gesendet werden.');
   setSent(true);
  }catch(err){setError(err instanceof Error?err.message:'Anfrage fehlgeschlagen.');}
  finally{setBusy(false);}
 }
 return <main className="jury-password-page">
  <header className="jury-password-header">
   <Link href="/" aria-label="Zur Landheim-Startseite"><img
    src="https://www.landheim-ammersee.de/themes/master_theme/logo.svg"
    alt="Landheim Ammersee" width="180" height="60"/></Link>
   <span>Fachschaft Wirtschaft und Recht · JUGEND GRÜNDET</span>
  </header>
  <section className="jury-password-card">
   <span className="jury-password-eyebrow"><LockKeyhole size={15}/> GESCHÜTZTER JURYBEREICH</span>
   <h1>Passwort vergessen?</h1>
   <p>Geben Sie die E-Mail-Adresse Ihres Jurykontos ein. Sie erhalten gegebenenfalls eine E-Mail mit einem sicheren Link, über den Sie selbst ein neues Passwort festlegen können.</p>
   {sent?<div className="jury-password-confirm" role="status">
    <CheckCircle2 size={23}/>
    <div><strong>Bitte prüfen Sie Ihr E-Mail-Postfach.</strong>
     <p>Falls ein Konto mit dieser E-Mail-Adresse besteht, haben wir einen Link zur Passwortvergabe angefordert. Schauen Sie gegebenenfalls auch im Spam-Ordner nach.</p></div>
   </div>:<form onSubmit={submit}>
    <label htmlFor="jury-password-email">E-Mail-Adresse</label>
    <input id="jury-password-email" type="email" autoComplete="email" required
      value={email} onChange={e=>setEmail(e.currentTarget.value)} placeholder="name@beispiel.de"/>
    {error&&<p role="alert" className="jury-password-error">{error}</p>}
    <button type="submit" disabled={busy}><Mail size={18}/>{busy?'Anfrage wird gesendet …':'Link zum Passwort-Festlegen anfordern'}</button>
   </form>}
   <Link href="/jury" className="jury-password-back"><ArrowLeft size={17}/> Zur Jury-Anmeldung</Link>
   <p className="jury-password-hint">Neue Jurymitglieder erhalten ihren erstmaligen Einladungslink direkt von der Wettbewerbsleitung. Eine öffentliche Juryregistrierung ist nicht möglich.</p>
  </section>
 </main>;
}
