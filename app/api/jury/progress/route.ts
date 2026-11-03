import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';
export async function GET(req:Request){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 const teamId=new URL(req.url).searchParams.get('team_id');
 if(!teamId||!/^[0-9a-f-]{36}$/i.test(teamId))return NextResponse.json({error:'Ungültiges Team'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const res=await fetch(url+'/rest/v1/rpc/jury_team_progress',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+session.token,'Content-Type':'application/json'},body:JSON.stringify({p_team_id:teamId}),cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Fortschritt nicht verfügbar'},{status:502});
 const rows=await res.json() as Array<{submitted_count:number;total_jurors:number;others_average:number|null;own_submitted:boolean}>;
 return NextResponse.json(rows[0]??null,{headers:{'Cache-Control':'no-store'}});
}
