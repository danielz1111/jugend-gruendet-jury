import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';
export async function GET(req:Request){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 const teamId=new URL(req.url).searchParams.get('team_id');
 if(!teamId||!/^[0-9a-f-]{36}$/i.test(teamId))return NextResponse.json({error:'Ungültiges Team'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const headers={apikey:key,Authorization:'Bearer '+session.token,'Content-Type':'application/json'};
 const body=JSON.stringify({p_team_id:teamId});
 const [res,statusRes]=await Promise.all([
  fetch(url+'/rest/v1/rpc/jury_team_progress',{method:'POST',headers,body,cache:'no-store'}),
  fetch(url+'/rest/v1/rpc/jury_team_submission_status',{method:'POST',headers,body,cache:'no-store'})
 ]);
 if(!res.ok||!statusRes.ok)return NextResponse.json({error:'Fortschritt nicht verfügbar'},{status:502});
 const [rows,jurors]=await Promise.all([
  res.json() as Promise<Array<{submitted_count:number;total_jurors:number;others_average:number|null;own_submitted:boolean}>>,
  statusRes.json() as Promise<Array<{display_name:string;submitted:boolean;is_current_user:boolean}>>
 ]);
 const progress=rows[0];
 return NextResponse.json(progress?{...progress,jurors}:null,{headers:{'Cache-Control':'no-store'}});
}
