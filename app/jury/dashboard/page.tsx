import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getJurySession} from '../../../lib/jury-session';
import TeamNavigator from './TeamNavigator';
export const dynamic='force-dynamic';
type Team={id:string;name:string;position:number;tagline:string|null;description:string|null};
type Member={id:string;team_id:string;display_name:string;expert_role:string|null;display_order:number};
type Score={team_id:string;[key:string]:string|number|null};
async function getScores(token:string):Promise<Score[]>{const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw new Error('Supabase nicht konfiguriert');const res=await fetch(url+'/rest/v1/evaluations?select=team_id,submitted_at,expert_a_score,expert_b_score,expert_c_score,expert_d_score,expert_e_score,presentation_impact_score,questions_quality_score,questions_confidence_score,questions_reasoning_score',{headers:{apikey:key,Authorization:'Bearer '+token},cache:'no-store'});if(!res.ok)throw new Error('Bewertungen konnten nicht geladen werden');return await res.json() as Score[];}
async function getTeams(token:string):Promise<Team[]>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)throw new Error('Supabase nicht konfiguriert');
 const res=await fetch(url+'/rest/v1/teams?select=id,name,position,tagline,description&order=position.asc',{headers:{apikey:key,Authorization:'Bearer '+token},cache:'no-store'});
 if(!res.ok)throw new Error('Teamdaten konnten nicht geladen werden');
 return await res.json() as Team[];
}
async function getMembers(token:string):Promise<Member[]>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)throw new Error('Supabase nicht konfiguriert');
 const res=await fetch(url+'/rest/v1/team_members?select=id,team_id,display_name,expert_role,display_order&order=display_order.asc',{headers:{apikey:key,Authorization:'Bearer '+token},cache:'no-store'});
 if(!res.ok)throw new Error('Mitglieder konnten nicht geladen werden');
 return await res.json() as Member[];
}
export default async function Dashboard(){
 const session=await getJurySession();
 if(!session)redirect('/jury');
 let teams:Team[]=[];let members:Member[]=[];let scores:Score[]=[];let error=false;
 try{[teams,members,scores]=await Promise.all([getTeams(session.token),getMembers(session.token),getScores(session.token)])}catch{error=true}
 return <main className="demo"><header className="demo-header"><Link href="/">← Startseite</Link><strong>JUGEND GRÜNDET <span> / JURYPORTAL</span></strong><form action="/api/jury/logout" method="post"><button style={{background:'transparent',color:'white',border:'1px solid #c9a66b',padding:'10px 16px',cursor:'pointer'}}>Abmelden</button></form></header><section style={{maxWidth:1200,margin:'0 auto',padding:'48px 24px'}}><span className="demo-overline">GESCHÜTZTER JURYBEREICH · {session.isAdmin?'ADMINISTRATOR':'JURYMITGLIED'}</span><h1 style={{fontSize:'clamp(38px,5vw,58px)',margin:'16px 0'}}>Willkommen, {session.displayName}.</h1><p>Wähle ein Unternehmerteam. Die Navigation ist unabhängig von der späteren zentralen Wettbewerbssteuerung.</p>{error?<div role="alert" className="demo-score"><h2>Verbindung vorübergehend nicht verfügbar</h2><p>Die Teamdaten konnten nicht aus Supabase geladen werden. Bitte später erneut versuchen.</p></div>:<TeamNavigator teams={teams} members={members} initialScores={scores}/>}<p style={{fontSize:12,color:'#667480',marginTop:25}}>Teamnamen werden aus Supabase geladen. Mitgliederlisten sind nur für angemeldete Jurymitglieder abrufbar. Teamfotos und Notizen folgen. Bewertungen werden nur für das jeweilige Jurymitglied gespeichert. Die Sitzung läuft nach spätestens einer Stunde ab.</p></section></main>;
}
