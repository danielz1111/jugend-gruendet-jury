import {NextRequest,NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const db=()=>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 return url&&key?{url,key}:null;
};
export async function GET(){
 const session=await getJurySession();
 if(!session?.isAdmin)return NextResponse.json({error:'Keine Berechtigung.'},{status:403});
 const config=db();
 if(!config)return NextResponse.json({error:'Keine Datenbankverbindung.'},{status:503});
 const res=await fetch(config.url+'/rest/v1/parent_access_requests?select=id,team_id,parent_name,child_name,parent_email,status,created_at,decided_at&order=created_at.desc&limit=200',{
  headers:{apikey:config.key,Authorization:'Bearer '+session.token},cache:'no-store'
 });
 if(!res.ok)return NextResponse.json({error:'Anträge konnten nicht geladen werden.'},{status:502});
 return NextResponse.json({requests:await res.json()},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');
 if(origin&&origin!==req.nextUrl.origin)return NextResponse.json({error:'Ungültige Anfrage.'},{status:403});
 const session=await getJurySession();
 if(!session?.isAdmin)return NextResponse.json({error:'Keine Berechtigung.'},{status:403});
 const data=await req.json().catch(()=>({})) as {id?:unknown;status?:unknown};
 const id=typeof data.id==='string'?data.id:'';
 if(!uuid.test(id)||!['approved','rejected'].includes(String(data.status)))
  return NextResponse.json({error:'Ungültiger Antrag oder Status.'},{status:400});
 const config=db();
 if(!config)return NextResponse.json({error:'Keine Datenbankverbindung.'},{status:503});
 const res=await fetch(config.url+'/rest/v1/parent_access_requests?id=eq.'+id,{
  method:'PATCH',
  headers:{apikey:config.key,Authorization:'Bearer '+session.token,'Content-Type':'application/json',Prefer:'return=representation'},
  body:JSON.stringify({status:data.status,decided_at:new Date().toISOString(),decided_by:session.userId}),
  cache:'no-store'
 });
 if(!res.ok)return NextResponse.json({error:'Freigabe konnte nicht gespeichert werden.'},{status:502});
 const rows=await res.json() as Array<{id:string}>;
 if(rows.length!==1)return NextResponse.json({error:'Antrag nicht gefunden.'},{status:404});
 return NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
}
