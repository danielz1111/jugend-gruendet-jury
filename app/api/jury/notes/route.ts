import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
async function context(){
 const session=await getJurySession();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!session||!url||!key)return null;
 return {session,url,headers:{apikey:key,Authorization:'Bearer '+session.token,'Content-Type':'application/json'}};
}
export async function GET(req:Request){
 const ctx=await context();if(!ctx)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 const teamId=new URL(req.url).searchParams.get('team_id');
 if(!teamId||!uuid.test(teamId))return NextResponse.json({error:'Ungültiges Team'},{status:400});
 const res=await fetch(ctx.url+'/rest/v1/jury_notes?select=id,team_id,member_id,content,updated_at&team_id=eq.'+teamId+'&juror_id=eq.'+ctx.session.userId,{headers:ctx.headers,cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Notizen konnten nicht geladen werden'},{status:502});
 return NextResponse.json(await res.json(),{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request){
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return NextResponse.json({error:'Ungültige Herkunft'},{status:403});
 const ctx=await context();if(!ctx)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 let body:Record<string,unknown>;try{body=await req.json()}catch{return NextResponse.json({error:'Ungültige Anfrage'},{status:400})}
 const teamId=body.team_id,memberId=body.member_id,content=body.content;
 if(typeof teamId!=='string'||!uuid.test(teamId)||!(memberId===null||(typeof memberId==='string'&&uuid.test(memberId)))||typeof content!=='string'||content.length>10000)return NextResponse.json({error:'Ungültige Notiz'},{status:400});
 if(memberId!==null){
  const check=await fetch(ctx.url+'/rest/v1/team_members?select=id&id=eq.'+memberId+'&team_id=eq.'+teamId,{headers:ctx.headers,cache:'no-store'});
  if(!check.ok||!(await check.json() as unknown[]).length)return NextResponse.json({error:'Person gehört nicht zum Team'},{status:400});
 }
 const query='team_id=eq.'+teamId+'&juror_id=eq.'+ctx.session.userId+'&member_id='+(memberId===null?'is.null':'eq.'+memberId);
 const existing=await fetch(ctx.url+'/rest/v1/jury_notes?select=id&'+query,{headers:ctx.headers,cache:'no-store'});
 if(!existing.ok)return NextResponse.json({error:'Notiz konnte nicht geprüft werden'},{status:502});
 const rows=await existing.json() as Array<{id:string}>;
 const data={content,updated_at:new Date().toISOString()};
 const target=rows.length?ctx.url+'/rest/v1/jury_notes?id=eq.'+rows[0].id:ctx.url+'/rest/v1/jury_notes';
 const payload=rows.length?data:{...data,team_id:teamId,member_id:memberId,juror_id:ctx.session.userId};
 const res=await fetch(target,{method:rows.length?'PATCH':'POST',headers:{...ctx.headers,Prefer:'return=representation'},body:JSON.stringify(payload),cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Notiz konnte nicht gespeichert werden'},{status:502});
 return NextResponse.json({saved:true});
}
