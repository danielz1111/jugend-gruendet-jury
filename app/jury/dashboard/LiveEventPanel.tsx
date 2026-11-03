'use client';
import {useEffect,useState} from 'react';
import {ArrowRight,CalendarDays,Check,Radio,RefreshCw} from 'lucide-react';

type Team={id:string;name:string;position:number};
type EventState={active_team_id:string|null;updated_at:string|null};

export default function LiveEventPanel({teams,isAdmin,onOpenTeam}:{teams:Team[];isAdmin:boolean;onOpenTeam:(id:string)=>void}){
 const [state,setState]=useState<EventState|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [choice,setChoice]=useState('');
 const [saving,setSaving]=useState(false);
 async function refresh(){
  try{
   const response=await fetch('/api/jury/event',{cache:'no-store'});
   if(!response.ok)throw new Error('Status nicht abrufbar');
   setState(await response.json() as EventState);
   setError('');
  }catch{setError('Aktueller Teamstatus vorübergehend nicht verfügbar.');}
  finally{setLoading(false);}
 }
 useEffect(()=>{void refresh();const timer=window.setInterval(()=>{void refresh()},15000);return()=>window.clearInterval(timer);},[]);
 const active=teams.find(team=>team.id===state?.active_team_id);
 async function activate(){
  if(!choice)return;
  setSaving(true);setError('');
  try{
   const response=await fetch('/api/jury/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({team_id:choice})});
   if(!response.ok)throw new Error('Wechsel nicht gespeichert');
   setState(await response.json() as EventState);
  }catch{setError('Teamwechsel fehlgeschlagen. Bitte erneut versuchen.');}
  finally{setSaving(false);}
 }
 return <section className="jury-live-panel" aria-label="Zentrale Teamsteuerung">
  <div className="jury-live-panel-top"><span><Radio size={18}/> AKTUELLER WETTBEWERBSSTATUS</span><span className={active?'jury-live-chip active':'jury-live-chip'}>{active?'Team aufgerufen':'Vorbereitung'}</span></div>
  <div className="jury-live-panel-content">
   <div><h3>{active?active.name:loading?'Status wird geladen …':'Noch kein Team aufgerufen'}</h3>
    <p>{active?'Die Wettbewerbsleitung hat dieses Team ausgewählt. Sie können weiterhin jedes andere Team frei öffnen.':'Sobald die Wettbewerbsleitung ein Team aufruft, erscheint es hier automatisch. Aktualisierung etwa alle 15 Sekunden.'}</p>
    {active&&<button type="button" className="jury-live-open" onClick={()=>onOpenTeam(active.id)}>Dieses Team öffnen <ArrowRight size={17}/></button>}
   </div>
   <div className="jury-live-hint"><CalendarDays size={20}/><span>Wettbewerbstag<br/><strong>15. Januar 2027</strong></span></div>
  </div>
  {isAdmin&&<div className="jury-live-admin"><label htmlFor="jury-active-team">Team zentral aufrufen</label><div>
   <select id="jury-active-team" value={choice} onChange={event=>setChoice(event.currentTarget.value)}>
    <option value="">Team auswählen …</option>
    {teams.map(team=><option value={team.id} key={team.id}>{String(team.position).padStart(2,'0')} · {team.name}</option>)}
   </select>
   <button type="button" onClick={()=>void activate()} disabled={saving||!choice}>{saving?'Speichert …':<><Check size={16}/> Team aufrufen</>}</button>
   <button type="button" title="Aktualisieren" aria-label="Status aktualisieren" onClick={()=>void refresh()}><RefreshCw size={17}/></button>
  </div><small>Nur die Administration kann das zentrale Team ändern. Jurymitglieder können weiterhin frei navigieren.</small></div>}
  {error&&<p className="jury-live-error" role="alert">{error}</p>}
 </section>;
}
