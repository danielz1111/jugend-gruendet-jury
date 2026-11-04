'use client';

import {useEffect,useMemo,useState} from 'react';
import {ArrowRight,CheckCircle2,Eye,EyeOff,Save,ShieldCheck} from 'lucide-react';
import './ProfileEditor.css';

type Team={id:string;name:string;position:number;tagline:string|null;description:string|null;is_public:boolean};
type Draft={name:string;tagline:string;description:string;is_public:boolean};
type Suggestion={team_id:string;source_filename:string|null;tagline:string|null;description:string|null};

function toDraft(team:Team):Draft{
 return {name:team.name,tagline:team.tagline||'',description:team.description||'',is_public:team.is_public};
}
function hasChanges(team:Team,draft:Draft):boolean{
 return draft.name!==team.name||draft.tagline!==(team.tagline||'')||
  draft.description!==(team.description||'')||draft.is_public!==team.is_public;
}

export default function PublicTeamEditor({teams,onTeamsChange}:{teams:Team[];onTeamsChange?:(teams:Team[])=>void}){
 const [saved,setSaved]=useState<Team[]>(()=>teams.slice().sort((a,b)=>a.position-b.position));
 const [drafts,setDrafts]=useState<Record<string,Draft>>(()=>Object.fromEntries(teams.map(team=>[team.id,toDraft(team)])));
 const [selectedId,setSelectedId]=useState<string>(teams[0]?.id||'');
 const [busy,setBusy]=useState(false);
 const [done,setDone]=useState(0);
 const [error,setError]=useState('');
 const [message,setMessage]=useState('');
 const [sources,setSources]=useState<Record<string,Suggestion>>({});
 const selected=saved.find(team=>team.id===selectedId);
 const draft=selected?drafts[selected.id]:undefined;
 const changes=useMemo(()=>saved.filter(team=>drafts[team.id]&&hasChanges(team,drafts[team.id])),[saved,drafts]);
 const ideas=saved.filter(team=>Boolean(drafts[team.id]?.description.trim())).length;
 const slogans=saved.filter(team=>Boolean(drafts[team.id]?.tagline.trim())).length;

 useEffect(()=>{
  const onSuggestion=(event:Event)=>{
   const suggestion=(event as CustomEvent<Suggestion>).detail;
   if(!suggestion||typeof suggestion.team_id!=='string')return;
   const target=saved.find(team=>team.id===suggestion.team_id);
   if(!target)return;
   setSources(old=>({...old,[target.id]:suggestion}));
   setDrafts(old=>{
    const current=old[target.id];
    if(!current||hasChanges(target,current))return old;
    return {...old,[target.id]:{
     ...current,
     tagline:suggestion.tagline??current.tagline,
     description:suggestion.description??current.description
    }};
   });
   setSelectedId(target.id);
   setMessage('Neue Angaben für '+target.name+' erkannt. Bitte prüfen und gemeinsam speichern.');
  };
  window.addEventListener('jury:profile-suggestion',onSuggestion);
  return ()=>window.removeEventListener('jury:profile-suggestion',onSuggestion);
 },[saved]);

 function update<K extends keyof Draft>(key:K,value:Draft[K]){
  if(!selected)return;
  setDrafts(old=>({...old,[selected.id]:{...old[selected.id],[key]:value}}));
  setError('');setMessage('');
 }
 function undoAll(){
  if(!changes.length||busy)return;
  if(!window.confirm('Alle ungespeicherten Änderungen verwerfen?'))return;
  setDrafts(Object.fromEntries(saved.map(team=>[team.id,toDraft(team)])));
  setSources({});setError('');setMessage('');
 }
 async function saveAll(){
  if(!changes.length||busy)return;
  for(const team of changes){
   const item=drafts[team.id];
   if(item.name.trim().length<2||item.name.trim().length>80||item.tagline.length>160||item.description.length>2000){
    setError('Die Eingaben für '+team.name+' überschreiten die erlaubte Länge.');setSelectedId(team.id);return;
   }
  }
  if(!window.confirm('Änderungen an '+changes.length+' Teamprofilen speichern?\\n\\n'+changes.map(team=>team.name).join(', ')+'\\n\\nÖffentlich markierte Angaben erscheinen anschließend auf der Homepage.'))return;
  setBusy(true);setDone(0);setError('');setMessage('');
  const succeeded:Team[]=[];const failed:string[]=[];
  for(const team of changes){
   const value=drafts[team.id];
   try{
    const response=await fetch('/api/jury/team-profiles',{
     method:'PATCH',cache:'no-store',headers:{'Content-Type':'application/json'},
     body:JSON.stringify({id:team.id,...value})
    });
    const body=await response.json() as {team?:Team;error?:string};
    if(!response.ok||!body.team)throw Error(body.error||'Speichern fehlgeschlagen');
    succeeded.push(body.team);
   }catch{failed.push(team.name);}
   setDone(succeeded.length+failed.length);
  }
  const next=saved.map(team=>succeeded.find(t=>t.id===team.id)||team);
  setSaved(next);
  setDrafts(old=>{
   const result={...old};
   for(const team of succeeded)result[team.id]=toDraft(team);
   return result;
  });
  setSources(old=>{
   const result={...old};
   for(const team of succeeded)delete result[team.id];
   return result;
  });
  onTeamsChange?.(next);
  if(succeeded.length)setMessage(succeeded.length+' Profil(e) gespeichert. Die Homepage aktualisiert sich automatisch.');
  if(failed.length)setError('Diese Änderungen konnten nicht gespeichert werden: '+failed.join(', ')+'.');
  setBusy(false);
 }
 if(!selected||!draft)return <p>Es sind noch keine Unternehmerteams vorhanden.</p>;
 return <section className="jury-simple-profiles" aria-label="Öffentliche Teamprofile">
  <div className="jury-simple-header">
   <div><span className="demo-overline">DIE TEAMPROFILE</span><h2>Alle Teams. Einmal speichern.</h2>
    <p>Wählen Sie ein Team, bearbeiten Sie die Angaben und wechseln Sie beliebig zwischen den Profilen. Alle Änderungen werden am Ende gemeinsam gespeichert.</p>
   </div>
   <div className="jury-simple-stats">
    <span><strong>{ideas}/{saved.length}</strong>Kurzprofile</span>
    <span><strong>{slogans}/{saved.length}</strong>Slogans</span>
   </div>
  </div>
  <div className="jury-simple-layout">
   <nav className="jury-simple-list" aria-label="Unternehmerteam wählen">
    {saved.map(team=>{
     const item=drafts[team.id];
     return <button type="button" key={team.id} disabled={busy} className={team.id===selectedId?'active':''} aria-current={team.id===selectedId?'true':undefined} onClick={()=>setSelectedId(team.id)}>
      <span className="jury-simple-number">{String(team.position).padStart(2,'0')}</span>
      <span className="jury-simple-team-name"><strong>{item?.name||team.name}</strong><small>{item?.description.trim()?'Geschäftsidee hinterlegt':'Geschäftsidee fehlt'}{item?.tagline.trim()?' · Slogan':''}</small></span>
      {hasChanges(team,item)&&<span className="jury-simple-dot" title="Ungespeicherte Änderung" aria-label="Ungespeicherte Änderung">●</span>}
     </button>;
    })}
   </nav>
   <div className="jury-simple-workspace">
    <div className="jury-simple-workspace-top">
     <span className="demo-overline">TEAM {String(selected.position).padStart(2,'0')}</span>
     <h3>{draft.name||selected.name}</h3>
     {sources[selected.id]&&<p className="jury-simple-import"><CheckCircle2 size={17}/> Neuer Businessplan erkannt. Bitte die vorgeschlagenen Angaben prüfen.</p>}
    </div>
    <div className="jury-simple-fields">
     <label htmlFor="team-name">Teamname</label>
     <input id="team-name" value={draft.name} maxLength={80} disabled={busy} onChange={event=>update('name',event.target.value)}/>
     <label htmlFor="team-slogan">Slogan</label>
     <input id="team-slogan" value={draft.tagline} maxLength={160} disabled={busy} placeholder="Noch kein Slogan vorhanden" onChange={event=>update('tagline',event.target.value)}/>
     <label htmlFor="team-description">Was macht das Unternehmen?</label>
     <textarea id="team-description" rows={5} maxLength={2000} disabled={busy} value={draft.description} placeholder="Die Geschäftsidee in ein bis zwei verständlichen Sätzen" onChange={event=>update('description',event.target.value)}/>
     <div className="jury-simple-visibility">
      <div><strong>Sichtbarkeit auf der Homepage</strong><small>Nur Teamname, Slogan und Geschäftsidee – keine Schülernamen oder privaten Anlagen.</small></div>
      <select value={draft.is_public?'public':'hidden'} onChange={event=>update('is_public',event.target.value==='public')} disabled={busy} aria-label={'Sichtbarkeit für '+draft.name}>
       <option value="public">Öffentlich</option><option value="hidden">Verborgen</option>
      </select>
     </div>
    </div>
    <div className="jury-simple-preview">
     <span className="demo-overline">VORSCHAU DER TEAMKARTE</span>
     <div className="jury-simple-preview-card"><span>{draft.name}</span><strong>{draft.tagline||'Slogan noch nicht vorhanden'}</strong><p>{draft.description||'Beschreibung folgt.'}</p></div>
    </div>
   </div>
  </div>
  <div className="jury-simple-footer">
   <div><strong>{changes.length?changes.length+' ungespeicherte Teamprofile':'Alle Profile auf aktuellem Stand'}</strong><small>Es werden nur tatsächlich geänderte Profile gespeichert.</small></div>
   <div className="jury-simple-actions">
    {changes.length>0&&<button type="button" className="jury-simple-discard" disabled={busy} onClick={undoAll}>Verwerfen</button>}
    <button type="button" className="jury-simple-save" disabled={busy||changes.length===0} onClick={()=>void saveAll()}><Save size={18}/>{busy?'Speichere '+done+' von '+changes.length+' …':changes.length?'Alle Änderungen speichern':'Keine Änderungen offen'}<ArrowRight size={17}/></button>
   </div>
  </div>
  {message&&<p role="status" className="jury-simple-success"><CheckCircle2 size={18}/>{message}</p>}
  {error&&<p role="alert" className="jury-simple-error">{error}</p>}
  <p className="jury-simple-privacy"><ShieldCheck size={16}/> Änderungen sind zunächst nur im geschützten Portal sichtbar. Beim Speichern werden öffentlich markierte Teamtexte für die Homepage freigegeben. <Eye size={15}/> Öffentliche Teams <EyeOff size={15}/> verborgene Teams</p>
 </section>;
}
