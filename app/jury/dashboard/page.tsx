import Link from 'next/link';
import {redirect} from 'next/navigation';
import {getJurySession} from '../../../lib/jury-session';
import TeamNavigator from './TeamNavigator';
export const dynamic='force-dynamic';
type Team={id:string;name:string;position:number;tagline:string|null;description:string|null};
async function getTeams(token:string):Promise<Team[]>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)throw new Error('Supabase nicht konfiguriert');
 const res=await fetch(url+'/rest/v1/teams?select=id,name,position,tagline,description&order=position.asc',{headers:{apikey:key,Authorization:'Bearer '+token},cache:'no-store'});
 if(!res.ok)throw new Error('Teamdaten konnten nicht geladen werden');
 return await res.json() as Team[];
}
export default async function Dashboard(){
 const session=await getJurySession();
 if(!session)redirect('/jury');
 let teams:Team[]=[];let error=false;
 try{teams=await getTeams(session.token)}catch{error=true}
 return <main className="demo"><header className="demo-header"><Link href="/">← Startseite</Link><strong>JUGEND GRÜNDET <span> / JURYPORTAL</span></strong><form action="/api/jury/logout" method="post"><button style={{background:'transparent',color:'white',border:'1px solid #c9a66b',padding:'10px 16px',cursor:'pointer'}}>Abmelden</button></form></header><section style={{maxWidth:1200,margin:'0 auto',padding:'48px 24px'}}><span className="demo-overline">GESCHÜTZTER JURYBEREICH · {session.isAdmin?'ADMINISTRATOR':'JURYMITGLIED'}</span><h1 style={{fontSize:'clamp(38px,5vw,58px)',margin:'16px 0'}}>Willkommen, {session.displayName}.</h1><p>Wähle ein Unternehmerteam. Die Navigation ist unabhängig von der späteren zentralen Wettbewerbssteuerung.</p>{error?<div role="alert" className="demo-score"><h2>Verbindung vorübergehend nicht verfügbar</h2><p>Die Teamdaten konnten nicht aus Supabase geladen werden. Bitte später erneut versuchen.</p></div>:<TeamNavigator teams={teams}/>}<p style={{fontSize:12,color:'#667480',marginTop:25}}>Teamnamen werden aus Supabase geladen. Schülernamen, Notizen und Bewertungen sind noch nicht eingebunden. Die Sitzung läuft nach spätestens einer Stunde ab.</p></section></main>;
}
