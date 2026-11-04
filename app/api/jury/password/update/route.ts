import {NextRequest,NextResponse} from 'next/server';

export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 if(origin&&origin!==request.nextUrl.origin)
  return NextResponse.json({error:'Ungültige Anfrage.'},{status:403});
 const body=await request.json().catch(()=>({})) as {accessToken?:unknown;password?:unknown};
 const token=typeof body.accessToken==='string'?body.accessToken:'';
 const password=typeof body.password==='string'?body.password:'';
 if(token.length<40||token.length>10000)
  return NextResponse.json({error:'Dieser Link ist ungültig oder abgelaufen. Bitte fordern Sie einen neuen an.'},{status:401});
 if(password.length<12||password.length>128)
  return NextResponse.json({error:'Bitte ein Passwort mit mindestens zwölf Zeichen wählen.'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Passwortänderung derzeit nicht verfügbar.'},{status:503});
 try{
  const headers={apikey:key,Authorization:'Bearer '+token};
  const userResponse=await fetch(url+'/auth/v1/user',{headers,cache:'no-store'});
  if(!userResponse.ok)return NextResponse.json({error:'Der Link ist abgelaufen oder ungültig. Fordern Sie einen neuen an.'},{status:401});
  const user=await userResponse.json() as {id?:string};
  if(!user.id)return NextResponse.json({error:'Ungültiger Zugang.'},{status:401});
  // The token is the user's personal Supabase session. The password can
  // only be changed for that same account; no admin secret is used.
  const changed=await fetch(url+'/auth/v1/user',{
   method:'PUT',headers:{...headers,'Content-Type':'application/json'},
   body:JSON.stringify({password}),cache:'no-store'
  });
  if(!changed.ok){
   if(changed.status===401)return NextResponse.json({error:'Der Link ist abgelaufen oder ungültig.'},{status:401});
   const detail=await changed.json().catch(()=>({})) as {code?:string;error_code?:string};
   const reason=detail.code||detail.error_code||'';
   return NextResponse.json({error:reason==='same_password'?'Bitte wählen Sie ein anderes Passwort.':'Das Passwort konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.'},{status:400});
  }
  const response=NextResponse.json({ok:true,message:'Ihr persönliches Passwort wurde gespeichert. Sie können sich jetzt damit im Juryportal anmelden.'});
  // Enforce a fresh jury login after changing a password; never keep an old session in this browser.
  const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/' as const,maxAge:0};
  response.cookies.set('jury_access','',cookieOptions);
  response.cookies.set('jury_refresh','',cookieOptions);
  response.headers.set('Cache-Control','no-store');
  return response;
 }catch{
  return NextResponse.json({error:'Verbindung fehlgeschlagen. Bitte versuchen Sie es später erneut.'},{status:503});
 }
}
