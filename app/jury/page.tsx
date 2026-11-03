'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,LockKeyhole} from 'lucide-react';

export default function JuryLogin(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function login(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');
  try{
   const res=await fetch('/api/jury/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password}),cache:'no-store'});
   const data=await res.json() as {error?:string;redirect?:string};
   if(!res.ok)throw new Error(data.error||'Anmeldung fehlgeschlagen.');
   window.location.assign('/jury/dashboard');
  }catch(e){setError(e instanceof Error?e.message:'Anmeldung fehlgeschlagen.');setBusy(false);}
 }
 return <main className="demo"><header className="demo-header"><Link href="/"><ArrowLeft size={18}/> Zur Startseite</Link><strong>JUGEND GRÜNDET <span> / JURYPORTAL</span></strong><span className="demo-status"><LockKeyhole size={14}/> Geschützter Bereich</span></header><div style={{maxWidth:480,margin:'64px auto',padding:'0 20px'}}><span className="demo-overline">JURYPORTAL · LANDHEIM AMMERSEE</span><h1>Persönliche Anmeldung</h1><p>Der Zugang ist ausschließlich für freigeschaltete Jurymitglieder vorgesehen.</p><form onSubmit={login} style={{display:'grid',gap:16,marginTop:28}}><label>E-Mail-Adresse<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:12,marginTop:8}}/></label><label>Passwort<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:12,marginTop:8}}/></label>{error&&<p role="alert" style={{color:'#b42318'}}>{error}</p>}<button type="submit" disabled={busy} style={{padding:14,background:'#102b42',color:'white',border:0,borderRadius:6,cursor:'pointer'}}>{busy?'Anmeldung wird geprüft …':'Anmelden'}</button></form><p style={{marginTop:24,fontSize:13}}>Zugänge werden durch die Wettbewerbsleitung persönlich freigeschaltet. Keine öffentliche Registrierung.</p></div></main>
}