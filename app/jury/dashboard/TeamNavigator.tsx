'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,FileText,Users,Presentation,LockKeyhole} from 'lucide-react';
type Team={id:string;name:string;position:number;tagline:string|null;description:string|null};
type Member={id:string;team_id:string;display_name:string;expert_role:string|null;display_order:number};
type Score={team_id:string;idea_score:number|null;economics_score:number|null;pitch_score:number|null;answers_score:number|null;team_score:number|null};
const criteria=[{key:'idea_score',name:'Geschäftsidee & Kundennutzen',weight:20},{key:'economics_score',name:'Wirtschaftliche Plausibilität',weight:20},{key:'pitch_score',name:'Präsentation & Auftreten',weight:25},{key:'answers_score',name:'Juryfragen',weight:25},{key:'team_score',name:'Teamleistung & Gesamteindruck',weight:10}] as const;
export default function TeamNavigator({teams,members,initialScores}:{teams:Team[];members:Member[];initialScores:Score[]}){
 const [selected,setSelected]=useState(0);
 const [scores,setScores]=useState<Record<string,Record<string,number>>>(()=>Object.fromEntries(initialScores.map(s=>[s.team_id,Object.fromEntries(criteria.filter(c=>s[c.key]!==null).map(c=>[c.key,s[c.key] as number]))])));
 const [status,setStatus]=useState<Record<string,'open'|'saving'|'saved'|'error'>>({});
 const [pending,setPending]=useState<Record<string,number>>({});
 async function save(teamId:string,field:string,value:number){
  const id=teamId+':'+field;
  setStatus(old=>({...old,[id]:'saving'}));
  try{
   const response=await fetch('/api/jury/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({team_id:teamId,field,score:value})});
   if(!response.ok)throw new Error('Speichern fehlgeschlagen');
   setScores(old=>({...old,[teamId]:{...(old[teamId]||{}),[field]:value}}));
   setStatus(old=>({...old,[id]:'saved'}));
   setPending(old=>{const next={...old};delete next[id];return next});
  }catch{setStatus(old=>({...old,[id]:'error'}))}
 }
 if(!teams.length)return <section className="demo-score"><h2>Teamdaten noch nicht eingerichtet</h2><p>In Supabase ist derzeit kein Unternehmerteam für die Jury sichtbar. Bitte zunächst die vorbereitete Teamnamen-Migration ausführen. Es werden keine Demo-Teams als echte Daten ausgegeben.</p></section>;
 const team=teams[selected];
 const teamMembers=members.filter(m=>m.team_id===team.id);
 return <div className="demo-shell" style={{minHeight:600,marginTop:32,border:'1px solid #e4e0d9'}}>
 <aside className="demo-sidebar"><span className="demo-overline">UNTERNEHMERTEAMS · {teams.length}</span>{teams.map((t,i)=><button key={t.id} className={selected===i?'selected':''} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{String(t.position).padStart(2,'0')}</span>{t.name}</button>)}</aside>
 <section className="demo-main"><div className="demo-heading"><div><span className="demo-overline">TEAM {String(team.position).padStart(2,'0')} · JURYANSICHT</span><h1>{team.name}</h1><p>{team.tagline||'Unternehmerteam · Jugend gründet 2026/27'}</p></div><div className="demo-pagination"><button disabled={selected===0} onClick={()=>setSelected(v=>v-1)} aria-label="Vorheriges Team"><ArrowLeft size={18}/></button><button disabled={selected===teams.length-1} onClick={()=>setSelected(v=>v+1)} aria-label="Nächstes Team"><ArrowRight size={18}/></button></div></div>
 {team.description&&<p style={{lineHeight:1.8,color:'#526575'}}>{team.description}</p>}
 <div className="demo-score" style={{marginTop:24}}><div className="demo-score-heading"><h2>Teammitglieder und Expertenbereiche</h2><span>NUR FÜR DIE JURY</span></div><div style={{background:'#f5f3ee',border:'1px dashed #d8d4cd',padding:'38px 16px',textAlign:'center',margin:'18px 0 22px'}}><Users size={28} style={{margin:'0 auto 8px',color:'#a88b5f'}}/><p style={{fontSize:13,margin:0}}>Gemeinsames Teamfoto wird nach Einwilligungsprüfung hochgeladen.</p></div>{teamMembers.length?<div style={{display:'grid',gap:10}}>{teamMembers.map(m=><div key={m.id} style={{display:'flex',justifyContent:'space-between',gap:16,padding:'13px 0',borderBottom:'1px solid #e7e4df'}}><strong>{m.display_name}</strong><span style={{fontSize:13,color:'#667480',textAlign:'right'}}>{m.expert_role||'Expertenbereich noch nicht eingetragen'}</span></div>)}</div>:<p>Für dieses Team wurden noch keine Mitglieder hinterlegt. Die bestätigten Zuordnungen werden geschützt ergänzt.</p>}</div>
 <div className="demo-resources"><div><Users size={20}/><strong>Teammitglieder</strong><small><LockKeyhole size={12} style={{display:'inline'}}/> {teamMembers.length} Mitglieder hinterlegt</small></div><div><FileText size={20}/><strong>Businessplan</strong><small>Vertrauliche Unterlagen folgen</small></div><div><Presentation size={20}/><strong>Präsentation</strong><small>Wird zum Wettbewerb ergänzt</small></div></div>
 <div className="demo-score">
 <div className="demo-score-heading"><h2>Jurybewertung · 1–10 Punkte</h2><span>AUTOMATISCHE SPEICHERUNG</span></div>
 <p style={{fontSize:13,color:'#667480'}}>Grau: offen · Gelb: speichert · Grün: gespeichert · Rot: Fehler</p>
 {criteria.map(c=>{
  const id=team.id+':'+c.key;
  const saved=scores[team.id]?.[c.key];
  const current=pending[id]??saved;
  const state=status[id]||(saved!==undefined?'saved':'open');
  const color=state==='saved'?'#18794e':state==='saving'?'#9c6b16':state==='error'?'#b42318':'#77828b';
  return <div key={c.key} style={{border:'1px solid '+color,borderRadius:8,padding:14,marginTop:12,background:state==='saved'?'#f0faf3':state==='saving'?'#fff9e9':state==='error'?'#fff3f2':'#f7f8f9'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><strong>{c.name}</strong><span style={{fontSize:12,color}}>{state==='saved'?'✓ Gespeichert':state==='saving'?'Speichert …':state==='error'?'Fehler':'Offen'}</span></div>
   <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
    <input type="range" min={1} max={10} step={1} value={current??5} aria-label={c.name} style={{width:'100%',accentColor:color}}
     onChange={event=>{const value=Number(event.currentTarget.value);setPending(old=>({...old,[id]:value}));setStatus(old=>({...old,[id]:'open'}))}}
     onPointerUp={event=>{const value=Number(event.currentTarget.value);if(value!==saved)void save(team.id,c.key,value)}}
     onKeyUp={event=>{if(['ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key)){const value=Number(event.currentTarget.value);if(value!==saved)void save(team.id,c.key,value)}}}
    />
    <strong style={{minWidth:44,textAlign:'right'}}>{current===undefined?'–':current+'/10'}</strong>
   </div>
   <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#667480'}}><span>Gewichtung {c.weight} %</span>{state==='error'&&<button type="button" onClick={()=>void save(team.id,c.key,current??5)}>Erneut speichern</button>}</div>
  </div>
 })}
 <p style={{marginTop:16,fontWeight:600}}>Gesamt: {criteria.every(c=>scores[team.id]?.[c.key]!==undefined)?(criteria.reduce((sum,c)=>sum+(scores[team.id]?.[c.key]??0)*c.weight,0)/100).toFixed(2)+'/10':'Noch nicht vollständig bewertet'}</p>
 </div>
 <div className="demo-notes"><h2>Persönliche Notizen</h2><p>Private Notizen werden im nächsten Schritt ergänzt. Derzeit werden keine Daten erfasst oder gespeichert.</p></div>
 </section></div>;
}
