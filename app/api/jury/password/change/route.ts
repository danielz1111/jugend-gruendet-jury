import {cookies} from 'next/headers';
import {NextRequest,NextResponse} from 'next/server';

export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:'Ungültige Anfrage.'},{status:403});
 const body=await request.json().catch(()=>({})) as {password?:unknown};
 const password=typeof body.password==='string'?body.password:'';
 if(password.length<12||password.length>128)return NextResponse.json({error:'Mindestens zwölf Zeichen verwenden.'},{status:400});
 const token=(await cookies()).get('jury_access')?.value;
 if(!token)return NextResponse.json({error:'Bitte zunächst mit Ihrem Startpasswort anmelden.'},{status:401});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Zugangsdienst nicht konfiguriert.'},{status:503});
 try{
  const changed=await fetch(url+'/functions/v1/jury-access-admin',{
   method:'POST',headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json'},
   body:JSON.stringify({action:'change',password}),cache:'no-store'
  });
  const data=await changed.json().catch(()=>({error:'Unbekannte Antwort.'}));
  const response=NextResponse.json(data,{status:changed.status});
  response.headers.set('Cache-Control','no-store');
  if(changed.ok){
   const cookieBase={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/' as const,maxAge:0};
   response.cookies.set('jury_access','',cookieBase);
   response.cookies.set('jury_refresh','',cookieBase);
  }
  return response;
 }catch{return NextResponse.json({error:'Passwortdienst nicht erreichbar.'},{status:503})}
}
