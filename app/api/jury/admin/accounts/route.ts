import {NextRequest,NextResponse} from 'next/server';
import {getJurySession} from '../../../../../lib/jury-session';

function edge(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 return url&&key?{url:url+'/functions/v1/jury-access-admin',key}:null;
}
async function forward(token:string,method:'GET'|'POST',body?:object){
 const config=edge();
 if(!config)return NextResponse.json({error:'Zugangsverwaltung nicht konfiguriert.'},{status:503});
 try{
  const r=await fetch(config.url,{
   method,headers:{apikey:config.key,Authorization:'Bearer '+token,'Content-Type':'application/json'},
   ...(body?{body:JSON.stringify(body)}:{}),cache:'no-store'
  });
  const data=await r.json().catch(()=>({error:'Antwort der Zugangsverwaltung ungültig.'}));
  return NextResponse.json(data,{status:r.status,headers:{'Cache-Control':'no-store'}});
 }catch{return NextResponse.json({error:'Zugangsverwaltung nicht erreichbar.'},{status:503})}
}
export async function GET(){
 const session=await getJurySession();
 if(!session?.isAdmin)return NextResponse.json({error:'Nur für Administratoren.'},{status:403});
 return forward(session.token,'GET');
}
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:'Ungültige Anfrage.'},{status:403});
 const session=await getJurySession();
 if(!session?.isAdmin)return NextResponse.json({error:'Nur für Administratoren.'},{status:403});
 const body=await request.json().catch(()=>({})) as {action?:unknown;email?:unknown};
 if(!['create','reset'].includes(String(body.action))||
   typeof body.email!=='string'||body.email.length>254)
  return NextResponse.json({error:'Ungültige Aktion.'},{status:400});
 return forward(session.token,'POST',{action:body.action,email:body.email});
}
