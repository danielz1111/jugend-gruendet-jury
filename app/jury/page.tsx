'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,LockKeyhole,Eye,EyeOff} from 'lucide-react';

export default function JuryLogin(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[showPassword,setShowPassword]=useState(false),[remember,setRemember]=useState(false);
 useEffect(()=>{void fetch('/api/jury/refresh',{method:'POST',cache:'no-store'}).then(res=>{if(res.ok)window.location.replace('/jury/dashboard')}).catch(()=>undefined)},[]);
 async function login(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError('');
  try{
   const res=await fetch('/api/jury/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password,remember}),cache:'no-store'});
   const data=await res.json() as {error?:string;redirect?:string};
   if(!res.ok)throw new Error(data.error||'Anmeldung fehlgeschlagen.');
   window.location.assign('/jury/dashboard');
  }catch(e){setError(e instanceof Error?e.message:'Anmeldung fehlgeschlagen.');setBusy(false);}
 }
 return <main className="demo"><header className="demo-header"><Link href="/"><ArrowLeft size={18}/> Zur Startseite</Link><strong>JUGEND GRÜNDET <span> / JURYPORTAL</span></strong><span className="demo-status"><LockKeyhole size={14}/> Geschützter Bereich</span></header><div style={{maxWidth:480,margin:'64px auto',padding:'0 20px'}}><span className="demo-overline">JURYPORTAL · LANDHEIM AMMERSEE</span><h1>Persönliche Anmeldung</h1><p>Der Zugang ist ausschließlich für freigeschaltete Jurymitglieder vorgesehen.</p><form onSubmit={login} style={{display:'grid',gap:16,marginTop:28}}><label>E-Mail-Adresse<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:12,marginTop:8}}/></label><label>Passwort<div style={{position:'relative'}}><input type={showPassword?'text':'password'} autoComplete="current-password" required value={password} onChange={e=>{setPassword(e.target.value);setError('')}} style={{display:'block',width:'100%',padding:'12px 56px 12px 12px',marginTop:8}}/><button type="button" aria-label={showPassword?'Passwort verbergen':'Passwort anzeigen'} aria-pressed={showPassword} onClick={()=>setShowPassword(value=>!value)} style={{position:'absolute',right:5,top:5,background:'transparent',border:0,padding:10,cursor:'pointer',color:'#284850'}}>{showPassword?<EyeOff size={20}/>:<Eye size={20}/>}</button></div></label><label style={{display:'flex',alignItems:'center',gap:10,fontSize:13,cursor:'pointer'}}><input type="checkbox" checked={remember} onChange={e=>setRemember(e.currentTarget.checked)}/> Auf diesem Gerät angemeldet bleiben (7 Tage)</label>{error&&<p role="alert" style={{color:'#b42318'}}>{error}</p>}<button type="submit" disabled={busy} style={{padding:14,background:'#102b42',color:'white',border:0,borderRadius:6,cursor:'pointer'}}>{busy?'Anmeldung wird geprüft …':'Anmelden'}</button></form><p style={{marginTop:24,fontSize:13}}>Jurymitglieder erhalten ihre persönlichen Zugänge über die Wettbewerbsleitung. Keine öffentliche Juryregistrierung.</p>
 <aside aria-label="Elternzugang" style={{marginTop:29,padding:'21px 20px',background:'#f0f5e8',borderTop:'3px solid #bad639',color:'#294940'}}>
  <strong style={{display:'block',fontSize:17,marginBottom:9}}>Elternzugang</strong>
  <p style={{fontSize:13,lineHeight:1.7,margin:'0 0 16px'}}>Eltern können sich separat anmelden oder registrieren und anschließend die Freischaltung des Unternehmens ihres Kindes beantragen.</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
   <Link href="/eltern" style={{display:'inline-block',padding:'10px 12px',background:'#223e42',color:'white',fontWeight:750,fontSize:12}}>Eltern-Anmeldung</Link>
   <Link href="/eltern?zugang=registrieren" style={{display:'inline-block',padding:'10px 12px',background:'white',color:'#294940',border:'1px solid #c5d8b7',fontWeight:750,fontSize:12}}>Registrieren</Link>
  </div>
 </aside></div></main>
}