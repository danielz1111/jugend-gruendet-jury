'use client';
import {useEffect,useState} from 'react';
import {Check,LockKeyhole,RefreshCcw,UserCheck,X} from 'lucide-react';
import './ParentAccessAdmin.css';
type Request={
 id:string;team_id:string;parent_name:string;child_name:string;parent_email:string;
 status:'pending'|'approved'|'rejected';created_at:string;decided_at:string|null;
};
export default function ParentAccessAdmin({teams}:{teams:Array<{id:string;name:string}>}){
 const [requests,setRequests]=useState<Request[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 const names=Object.fromEntries(teams.map(t=>[t.id,t.name]));
 const load=async()=>{
  setLoading(true);setMessage('');
  try{
   const res=await fetch('/api/jury/parent-requests',{cache:'no-store'});
   const json=await res.json() as {requests?:Request[];error?:string};
   if(!res.ok)throw new Error(json.error||'Fehler');
   setRequests(json.requests||[]);
  }catch(error){setMessage(error instanceof Error?error.message:'Anträge konnten nicht geladen werden.')}
  finally{setLoading(false)}
 };
 useEffect(()=>{void load()},[]);
 const decide=async(id:string,status:'approved'|'rejected')=>{
  setBusy(id);setMessage('');
  try{
   const res=await fetch('/api/jury/parent-requests',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id,status}),cache:'no-store'
   });
   const json=await res.json() as {error?:string};
   if(!res.ok)throw new Error(json.error||'Änderung nicht gespeichert');
   await load();
  }catch(error){setMessage(error instanceof Error?error.message:'Antrag konnte nicht geändert werden.')}
  finally{setBusy(null)}
 };
 return <section className="jury-parent-admin" aria-labelledby="jury-parent-admin-title">
   <div className="jury-parent-admin-header">
    <div>
     <span className="jury-v3-overline">ADMINISTRATION · ELTERNZUGANG</span>
     <h2 id="jury-parent-admin-title">Elternanträge freischalten.</h2>
     <p>Nur von Ihnen bestätigte Eltern erhalten Einsicht in das vollständige Profil des zugeordneten Unternehmens. Juryunterlagen und Bewertungen bleiben gesperrt.</p>
    </div>
    <button type="button" onClick={()=>void load()} disabled={loading}><RefreshCcw size={17}/> Aktualisieren</button>
   </div>
   {message&&<p role="alert" className="jury-parent-admin-error">{message}</p>}
   {loading?<p>Elternanträge werden geladen …</p>:requests.length===0?<p className="jury-parent-admin-empty"><LockKeyhole size={18}/> Noch keine Elternanträge eingegangen.</p>:
   <div className="jury-parent-admin-list">{requests.map(r=><article key={r.id} className="jury-parent-admin-card">
     <div className="jury-parent-admin-card-info">
      <strong>{r.parent_name}</strong>
      <span>{r.parent_email}</span>
      <span><b>Kind:</b> {r.child_name}</span>
      <span><b>Unternehmen:</b> {names[r.team_id]||'Team wird geladen'}</span>
      <small>Eingereicht: {new Date(r.created_at).toLocaleDateString('de-DE')}</small>
     </div>
     <div className="jury-parent-admin-card-actions">
      <span className={'jury-parent-status jury-parent-'+r.status}>{r.status==='pending'?'Zur Prüfung':r.status==='approved'?'Freigeschaltet':'Abgelehnt / gesperrt'}</span>
      {r.status!=='approved'&&<button type="button" disabled={busy===r.id}
       onClick={()=>void decide(r.id,'approved')} className="jury-parent-approve"><UserCheck size={16}/> Freischalten</button>}
      {r.status!=='rejected'&&<button type="button" disabled={busy===r.id}
       onClick={()=>void decide(r.id,'rejected')} className="jury-parent-reject"><X size={16}/> {r.status==='approved'?'Zugriff entziehen':'Ablehnen'}</button>}
     </div>
   </article>)}</div>}
 </section>
}
