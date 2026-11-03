'use client';
import {useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,LockKeyhole} from 'lucide-react';

type AuthResponse={access_token?:string;error?:string;error_description?:string;msg?:string};
export default function JuryLogin(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[authorized,setAuthorized]=useState(false);
 async function login(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');setAuthorized(false);
  try{
   const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
   if(!url||!key)throw new Error('Die Jury-Anmeldung ist noch nicht konfiguriert.');
   const res=await fetch(url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json',apikey:key},body:JSON.stringify({email,password})});
   const data:AuthResponse=await res.json();
   if(!res.ok||!data.access_token)throw new Error('Anmeldung fehlgeschlagen. Bitte Zugangsdaten prüfen.');
   // Authorize against the protected jury_members table, enforced by Supabase RLS.
   const profile=await fetch(url+'/rest/v1/jury_members?select=display_name,is_admin&limit=1',{headers:{apikey:key,Authorization:'Bearer '+data.access_token},cache:'no-store'});
   if(!profile.ok)throw new Error('Die Juryberechtigung konnte nicht überprüft werden.');
   const profiles=await profile.json() as Array<{display_name:string;is_admin:boolean}>;
   if(profiles.length===0)throw new Error('Dieses Konto ist noch nicht als Jurymitglied freigeschaltet.');
   setAuthorized(true);setPassword('');
   // Access token is intentionally NOT stored in localStorage, sessionStorage or URL.
  }catch(e){setError(e instanceof Error?e.message:'Anmeldung fehlgeschlagen.');}
  finally{setBusy(false);}
 }
 return <main className="demo"><header className="demo-header"><Link href="/"><ArrowLeft size={18}/> Zur Startseite</Link><strong>JUGEND GRÜNDET <span> / JURYPORTAL</span></strong><span className="demo-status"><LockKeyhole size={14}/> Geschützter Bereich</span></header><div style={{maxWidth:480,margin:'64px auto',padding:'0 20px'}}><span className="demo-overline">JURYPORTAL · LANDHEIM AMMERSEE</span><h1>Persönliche Anmeldung</h1><p>Der Zugang ist ausschließlich für freigeschaltete Jurymitglieder vorgesehen.</p>{authorized?<div role="status"><h2>Anmeldung erfolgreich</h2><p>Deine Juryberechtigung wurde geprüft. Die geschützte Bewertungsansicht wird im nächsten Schritt aktiviert. Bis dahin werden keine Bewertungen oder Notizen erfasst.</p></div>:<form onSubmit={login} style={{display:'grid',gap:16,marginTop:28}}><label>E-Mail-Adresse<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:12,marginTop:8}}/></label><label>Passwort<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:12,marginTop:8}}/></label>{error&&<p role="alert" style={{color:'#b42318'}}>{error}</p>}<button type="submit" disabled={busy} style={{padding:14,background:'#102b42',color:'white',border:0,borderRadius:6,cursor:'pointer'}}>{busy?'Anmeldung wird geprüft …':'Anmelden'}</button></form>}<p style={{marginTop:24,fontSize:13}}>Zugänge werden durch die Wettbewerbsleitung persönlich freigeschaltet. Keine öffentliche Registrierung.</p></div></main>
}