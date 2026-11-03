import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function connection(token:string){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return null;
 return {url,headers:{apikey:key,Authorization:'Bearer '+token}};
}
export async function GET(){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 const db=connection(session.token);
 if(!db)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const res=await fetch(db.url+'/rest/v1/event_state?select=active_team_id,updated_at&singleton=eq.true&limit=1',{headers:db.headers,cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Teamstatus nicht verfügbar'},{status:502});
 const rows=await res.json() as Array<{active_team_id:string|null;updated_at:string|null}>;
 return NextResponse.json(rows[0]??{active_team_id:null,updated_at:null},{headers:{'Cache-Control':'private, no-store'}});
}
export async function POST(req:Request){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 if(!session.isAdmin)return NextResponse.json({error:'Nur Administration'},{status:403});
 const origin=req.headers.get('origin');
 const host=req.headers.get('host');
 if(origin&&(!host||new URL(origin).host!==host))return NextResponse.json({error:'Herkunft nicht zulässig'},{status:403});
 const payload=await req.json().catch(()=>null) as {team_id?:unknown}|null;
 const teamId=payload?.team_id;
 if(typeof teamId!=='string'||!uuid.test(teamId))return NextResponse.json({error:'Ungültiges Team'},{status:400});
 const db=connection(session.token);
 if(!db)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const target=await fetch(db.url+'/rest/v1/teams?select=id&id=eq.'+teamId+'&limit=1',{headers:db.headers,cache:'no-store'});
 if(!target.ok||!(await target.json() as unknown[]).length)return NextResponse.json({error:'Team nicht gefunden'},{status:404});
 const res=await fetch(db.url+'/rest/v1/event_state?singleton=eq.true',{method:'PATCH',headers:{...db.headers,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({active_team_id:teamId,updated_at:new Date().toISOString()}),cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Teamwechsel nicht möglich'},{status:502});
 const rows=await res.json() as Array<{active_team_id:string|null;updated_at:string|null}>;
 if(rows.length!==1)return NextResponse.json({error:'Teamwechsel nicht bestätigt'},{status:409});
 return NextResponse.json({active_team_id:rows[0].active_team_id,updated_at:rows[0].updated_at},{headers:{'Cache-Control':'private, no-store'}});
}
