'use client';

import {useEffect,useState} from 'react';
import {ArrowRight,CheckCircle2,Eye,EyeOff,Save,ShieldCheck} from 'lucide-react';

type Team = {
  id:string;
  name:string;
  position:number;
  tagline:string|null;
  description:string|null;
  is_public:boolean;
};

type Draft = {name:string;tagline:string;description:string;is_public:boolean};
type Suggestion={team_id:string;tagline:string|null;description:string|null;source_filename:string|null};
function draftFrom(team:Team):Draft {
  return {
    name:team.name,
    tagline:team.tagline||'',
    description:team.description||'',
    is_public:team.is_public
  };
}
export default function PublicTeamEditor({teams}:{teams:Team[]}) {
  const [saved,setSaved]=useState<Team[]>(()=>teams.slice().sort((a,b)=>a.position-b.position));
  const [activeId,setActiveId]=useState<string|null>(teams[0]?.id||null);
  const current=saved.find(team=>team.id===activeId);
  const [draft,setDraft]=useState<Draft>(()=>teams[0]?draftFrom(teams[0]):{name:'',tagline:'',description:'',is_public:false});
  const [approved,setApproved]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [preview,setPreview]=useState(true);
  const [suggestions,setSuggestions]=useState<Record<string,Suggestion>>({});
  useEffect(()=>{
    const handler=(event:Event)=>{
      const value=(event as CustomEvent<Suggestion>).detail;
      if(value&&typeof value.team_id==='string')setSuggestions(old=>({...old,[value.team_id]:value}));
    };
    window.addEventListener('jury:profile-suggestion',handler);
    return ()=>window.removeEventListener('jury:profile-suggestion',handler);
  },[]);

  const dirty=!!current&&(draft.name!==current.name||draft.tagline!==(current.tagline||'')||draft.description!==(current.description||'')||draft.is_public!==current.is_public);

  function choose(team:Team) {
    if(busy||team.id===activeId)return;
    if(dirty&&!window.confirm('Nicht gespeicherte Änderungen verwerfen und zu einem anderen Team wechseln?'))return;
    setActiveId(team.id);setDraft(draftFrom(team));setApproved(false);setNotice('');setError('');
  }
  async function save(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!current||busy||!dirty)return;
    setError('');setNotice('');
    if(draft.is_public&&!approved){
      setError('Bestätigen Sie bitte die öffentliche Freigabe der Angaben.');
      return;
    }
    setBusy(true);
    try{
      const response=await fetch('/api/jury/team-profiles',{
        method:'PATCH',cache:'no-store',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({id:current.id,...draft})
      });
      const body=await response.json() as {error?:string;team?:Team};
      if(!response.ok||!body.team)throw new Error(body.error||'Teamprofil konnte nicht gespeichert werden.');
      const savedTeam=body.team;
      setSaved(previous=>previous.map(team=>team.id===savedTeam.id?{...team,...savedTeam}:team));
      setDraft(draftFrom(savedTeam));setApproved(false);
      setNotice(draft.is_public?'Profil gespeichert. Die Angaben sind für die öffentliche Anzeige freigegeben.':'Profil gespeichert. Das Team ist für die öffentliche Anzeige gesperrt.');
    }catch(problem){
      setError(problem instanceof Error?problem.message:'Speichern fehlgeschlagen.');
    }finally{setBusy(false)}
  }
  if(!current)return <div className="jury-profile-editor"><p>Es sind noch keine Teams zur Bearbeitung vorhanden.</p></div>;
  const initials=draft.name.split(/[\s-]+/).filter(Boolean).slice(0,2).map(w=>w.charAt(0)).join('').toUpperCase()||'JG';
  const pending=!(draft.tagline.trim()||draft.description.trim());
  return <div className="jury-profile-editor">
    <div className="jury-profile-sidebar">
      <span className="demo-overline">TEAM AUSWÄHLEN</span>
      <div className="jury-profile-team-list" role="group" aria-label="Teamprofile auswählen">
        {saved.map(team=><button type="button" key={team.id} disabled={busy} aria-pressed={team.id===activeId} className={team.id===activeId?'selected':''} onClick={()=>choose(team)}>
          <span className="jury-profile-team-index">{String(team.position).padStart(2,'0')}</span>
          <span className="jury-profile-team-title">{team.name}</span>
          <span className="jury-profile-team-visibility" title={team.is_public?'Öffentlich':'Nicht öffentlich'}>{team.is_public?<Eye size={16}/>:<EyeOff size={16}/>}</span>
        </button>)}
      </div>
      <p className="jury-profile-side-note"><ShieldCheck size={16}/> Nur die Wettbewerbsleitung darf diese Angaben bearbeiten.</p>
    </div>
    <form className="jury-profile-form" onSubmit={save}>
      <div className="jury-profile-form-title"><div><span className="demo-overline">UNTERNEHMERTEAM {String(current.position).padStart(2,'0')}</span><h2>Öffentliches Profil</h2></div><button type="button" onClick={()=>setPreview(value=>!value)} className="jury-profile-preview-toggle">{preview?'Vorschau ausblenden':'Vorschau einblenden'} <Eye size={16}/></button></div>
      {suggestions[current.id]&&<div role="status" style={{border:'1px solid #a8c09d',background:'#f0f6ed',padding:18,marginBottom:24}}>
        <strong>Neue Profilangaben aus der ZIP-Datei erkannt</strong>
        <p style={{fontSize:12}}>{suggestions[current.id].source_filename}</p>
        {suggestions[current.id].tagline&&<p><b>Slogan:</b> {suggestions[current.id].tagline}</p>}
        {suggestions[current.id].description&&<p><b>Geschäftsidee:</b> {suggestions[current.id].description}</p>}
        <button type="button" style={{padding:'11px 14px',background:'#23463f',color:'white',border:0}} onClick={()=>{
          if(dirty&&!window.confirm('Ungespeicherte Änderungen überschreiben?'))return;
          const suggestion=suggestions[current.id];
          setDraft(old=>({...old,tagline:suggestion.tagline??old.tagline,description:suggestion.description??old.description}));
          setApproved(false);
          setNotice('Vorschlag übernommen. Bitte prüfen, Freigabe bestätigen und speichern.');
          setSuggestions(old=>{const updated={...old};delete updated[current.id];return updated;});
        }}>Vorschlag ins Formular übernehmen</button>
      </div>}
      <label htmlFor="jury-profile-name">Name des Unternehmerteams</label>
      <input id="jury-profile-name" value={draft.name} onChange={event=>setDraft(old=>({...old,name:event.target.value}))} maxLength={80} required minLength={2} disabled={busy}/>
      <label htmlFor="jury-profile-tagline">Kurzzeile / Slogan <small>(optional, maximal 160 Zeichen)</small></label>
      <input id="jury-profile-tagline" value={draft.tagline} onChange={event=>setDraft(old=>({...old,tagline:event.target.value}))} maxLength={160} placeholder="Ein Satz, der die Idee auf den Punkt bringt" disabled={busy}/>
      <label htmlFor="jury-profile-description">Beschreibung der Geschäftsidee <small>(optional, maximal 2.000 Zeichen)</small></label>
      <textarea id="jury-profile-description" rows={5} maxLength={2000} value={draft.description} onChange={event=>setDraft(old=>({...old,description:event.target.value}))} placeholder="Welches Problem löst das Team? Wie funktioniert die Idee?" disabled={busy}/>
      <span className="jury-profile-char-count">{draft.description.length} / 2.000 Zeichen</span>
      <div className="jury-profile-publish">
        <label><input type="checkbox" checked={draft.is_public} disabled={busy} onChange={event=>{setDraft(old=>({...old,is_public:event.target.checked}));setApproved(false)}}/><span><strong>Dieses Team öffentlich anzeigen</strong><small>Nur für freigegebene Teamangaben. Ist die Option ausgeschaltet, erscheint dieses Team nicht auf der öffentlichen Homepage.</small></span></label>
      </div>
      {draft.is_public&&<label className="jury-profile-approval"><input type="checkbox" checked={approved} onChange={event=>setApproved(event.target.checked)} disabled={busy}/><span>Ich bestätige, dass Teamname und Texte für die öffentliche Darstellung freigegeben sind.</span></label>}
      {preview&&<div className="jury-profile-preview"><span className="demo-overline">VORSCHAU · {draft.is_public?'ÖFFENTLICH FREIGEGEBEN':'NICHT VERÖFFENTLICHT'}</span><div className="jury-profile-preview-card"><div aria-hidden="true">{initials}</div><h3>{draft.name.trim()||'Teamname'}</h3><p>{draft.tagline.trim()||draft.description.trim()||'Das öffentliche Kurzprofil wird ergänzt.'}</p></div><small>Die Vorschau zeigt nur Text. Fotos und Logos werden nach gesonderter Bildfreigabe ergänzt.</small></div>}
      {error&&<p role="alert" className="jury-profile-error">{error}</p>}
      {notice&&<p role="status" className="jury-profile-success"><CheckCircle2 size={17}/>{notice}</p>}
      <div className="jury-profile-actions"><span>{dirty?'Ungespeicherte Änderungen':pending?'Kurzprofil noch nicht ausgefüllt':'Profil auf aktuellem Stand'}</span><button type="submit" disabled={busy||!dirty||!draft.name.trim()||draft.name.trim().length<2||(draft.is_public&&!approved)}><Save size={17}/>{busy?'Wird gespeichert …':'Änderungen speichern'} <ArrowRight size={15}/></button></div>
    </form>
  </div>
}
