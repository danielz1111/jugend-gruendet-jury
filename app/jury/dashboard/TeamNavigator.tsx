'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,FileText,Users,Presentation,LockKeyhole} from 'lucide-react';
type Team={id:string;name:string;position:number;tagline:string|null;description:string|null};
type Member={id:string;team_id:string;display_name:string;expert_role:string|null;display_order:number};
export default function TeamNavigator({teams,members}:{teams:Team[];members:Member[]}){
 const [selected,setSelected]=useState(0);
 if(!teams.length)return <section className="demo-score"><h2>Teamdaten noch nicht eingerichtet</h2><p>In Supabase ist derzeit kein Unternehmerteam für die Jury sichtbar. Bitte zunächst die vorbereitete Teamnamen-Migration ausführen. Es werden keine Demo-Teams als echte Daten ausgegeben.</p></section>;
 const team=teams[selected];
 const teamMembers=members.filter(m=>m.team_id===team.id);
 return <div className="demo-shell" style={{minHeight:600,marginTop:32,border:'1px solid #e4e0d9'}}>
 <aside className="demo-sidebar"><span className="demo-overline">UNTERNEHMERTEAMS · {teams.length}</span>{teams.map((t,i)=><button key={t.id} className={selected===i?'selected':''} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{String(t.position).padStart(2,'0')}</span>{t.name}</button>)}</aside>
 <section className="demo-main"><div className="demo-heading"><div><span className="demo-overline">TEAM {String(team.position).padStart(2,'0')} · JURYANSICHT</span><h1>{team.name}</h1><p>{team.tagline||'Unternehmerteam · Jugend gründet 2026/27'}</p></div><div className="demo-pagination"><button disabled={selected===0} onClick={()=>setSelected(v=>v-1)} aria-label="Vorheriges Team"><ArrowLeft size={18}/></button><button disabled={selected===teams.length-1} onClick={()=>setSelected(v=>v+1)} aria-label="Nächstes Team"><ArrowRight size={18}/></button></div></div>
 {team.description&&<p style={{lineHeight:1.8,color:'#526575'}}>{team.description}</p>}
 <div className="demo-score" style={{marginTop:24}}><div className="demo-score-heading"><h2>Teammitglieder und Expertenbereiche</h2><span>NUR FÜR DIE JURY</span></div><div style={{background:'#f5f3ee',border:'1px dashed #d8d4cd',padding:'38px 16px',textAlign:'center',margin:'18px 0 22px'}}><Users size={28} style={{margin:'0 auto 8px',color:'#a88b5f'}}/><p style={{fontSize:13,margin:0}}>Gemeinsames Teamfoto wird nach Einwilligungsprüfung hochgeladen.</p></div>{teamMembers.length?<div style={{display:'grid',gap:10}}>{teamMembers.map(m=><div key={m.id} style={{display:'flex',justifyContent:'space-between',gap:16,padding:'13px 0',borderBottom:'1px solid #e7e4df'}}><strong>{m.display_name}</strong><span style={{fontSize:13,color:'#667480',textAlign:'right'}}>{m.expert_role||'Expertenbereich noch nicht eingetragen'}</span></div>)}</div>:<p>Für dieses Team wurden noch keine Mitglieder hinterlegt. Die bestätigten Zuordnungen werden geschützt ergänzt.</p>}</div>
 <div className="demo-resources"><div><Users size={20}/><strong>Teammitglieder</strong><small><LockKeyhole size={12} style={{display:'inline'}}/> {teamMembers.length} Mitglieder hinterlegt</small></div><div><FileText size={20}/><strong>Businessplan</strong><small>Vertrauliche Unterlagen folgen</small></div><div><Presentation size={20}/><strong>Präsentation</strong><small>Wird zum Wettbewerb ergänzt</small></div></div>
 <div className="demo-score"><div className="demo-score-heading"><h2>Bewertung</h2><span>NOCH NICHT AKTIV</span></div><p>Bewertet werden ausschließlich Präsentation und Juryfragen. Die persönliche Punktevergabe wird nach Prüfung der Zugriffsrechte aktiviert.</p></div>
 <div className="demo-notes"><h2>Persönliche Notizen</h2><p>Private Notizen werden im nächsten Schritt ergänzt. Derzeit werden keine Daten erfasst oder gespeichert.</p></div>
 </section></div>;
}
