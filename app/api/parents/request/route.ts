import {NextRequest,NextResponse} from 'next/server';
import {getParentSession} from '../../../../lib/parent-session';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');
 if(origin&&origin!==req.nextUrl.origin)return NextResponse.json({error:'Ungültige Anfrage.'},{status:403});
 const session=await getParentSession();
 if(!session)return NextResponse.json({error:'Bitte melden Sie sich mit bestätigter E-Mail an.'},{status:401});
 const data=await req.json().catch(()=>({})) as {teamId?:unknown;parentName?:unknown;childName?:unknown};
 const teamId=typeof data.teamId==='string'?data.teamId:'';
 const parentName=typeof data.parentName==='string'?data.parentName.trim():'';
 const childName=typeof data.childName==='string'?data.childName.trim():'';
 if(!uuid.test(teamId)||parentName.length<2||parentName.length>120||childName.length<2||childName.length>120)
  return NextResponse.json({error:'Bitte alle Angaben vollständig ausfüllen.'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Anfrage vorübergehend nicht möglich.'},{status:503});
 const res=await fetch(url+'/rest/v1/parent_access_requests',{
  method:'POST',headers:{apikey:key,Authorization:'Bearer '+session.token,'Content-Type':'application/json',Prefer:'return=minimal'},
  body:JSON.stringify({
   parent_user_id:session.userId,team_id:teamId,parent_name:parentName,
   child_name:childName,parent_email:session.email,status:'pending'
  }),cache:'no-store'
 });
 if(!res.ok){
  const error=await res.json().catch(()=>({})) as {code?:string};
  return NextResponse.json({error:error.code==='23505'?'Für dieses Unternehmen liegt bereits ein Antrag vor.':'Der Antrag konnte nicht gespeichert werden. Bitte das ausgewählte Unternehmen prüfen.'},{status:error.code==='23505'?409:400});
 }
 return NextResponse.json({ok:true});
}
