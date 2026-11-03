'use client';
import {useState} from 'react';
import {ArrowLeft,ArrowRight,FileText,Users,Presentation,LockKeyhole} from 'lucide-react';
type Team={id:string;name:string;position:number;tagline:string|null;description:string|null};
export default function TeamNavigator({teams}:{teams:Team[]}){
 const [selected,setSelected]=useState(0);
 if(!teams.length)return <section className="demo-score"><h2>Teamdaten noch nicht eingerichtet</h2><p>In Supabase ist derzeit kein Unternehmerteam für die Jury sichtbar. Bitte zunächst die vorbereitete Teamnamen-Migration ausführen. Es werden keine Demo-Teams als echte Daten ausgegeben.</p></section>;
 const team=teams[selected];
 return <div className="demo-shell" style={{minHeight:600,marginTop:32,border:'1px solid #e4e0d9'}}>
 <aside className="demo-sidebar"><span className="demo-overline">UNTERNEHMERTEAMS · {teams.length}</span>{teams.map((t,i)=><button key={t.id} className={selected===i?'selected':''} aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{String(t.position).padStart(2,'0')}</span>{t.name}</button>)}</aside>
 <section className="demo-main"><div className="demo-heading"><div><span className="demo-overline">TEAM {String(team.position).padStart(2,'0')} · JURYANSICHT</span><h1>{team.name}</h1><p>{team.tagline||'Unternehmerteam · Jugend gründet 2026/27'}</p></div><div className="demo-pagination"><button disabled={selected===0} onClick={()=>setSelected(v=>v-1)} aria-label="Vorheriges Team"><ArrowLeft size={18}/></button><button disabled={selected===teams.length-1} onClick={()=>setSelected(v=>v+1)} aria-label="Nächstes Team"><ArrowRight size={18}/></button></div></div>
 {team.description&&<p style={{lineHeight:1.8,color:'#526575'}}>{team.description}</p>}
 <div className="demo-resources"><div><Users size={20}/><strong>Teammitglieder</strong><small><LockKeyhole size={12} style={{display:'inline'}}/> Geschützte Mitgliederliste folgt</small></div><div><FileText size={20}/><strong>Businessplan</strong><small>Vertrauliche Unterlagen folgen</small></div><div><Presentation size={20}/><strong>Präsentation</strong><small>Wird zum Wettbewerb ergänzt</small></div></div>
 <div className="demo-score"><div className="demo-score-heading"><h2>Bewertung</h2><span>NOCH NICHT AKTIV</span></div><p>Bewertet werden ausschließlich Präsentation und Juryfragen. Die persönliche Punktevergabe wird nach Prüfung der Zugriffsrechte aktiviert.</p></div>
 <div className="demo-notes"><h2>Persönliche Notizen</h2><p>Private Notizen werden im nächsten Schritt ergänzt. Derzeit werden keine Daten erfasst oder gespeichert.</p></div>
 </section></div>;
}
