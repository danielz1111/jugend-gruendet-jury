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
  const user=await userResponse.json() as {id?:string;email?:string;email_confirmed_at?:string|null};
  if(!user.id||!user.email||!user.email_confirmed_at)
   return NextResponse.json({error:'Die E-Mail-Adresse ist noch nicht bestätigt.'},{status:401});
  // Confirm that this personal token belongs to an already admitted juror
  // or to an owner of an explicitly approved jury email inbox.
  const normalizedEmail=user.email.toLowerCase();
  const [memberResponse,allowResponse]=await Promise.all([
   fetch(url+'/rest/v1/jury_members?select=user_id&user_id=eq.'+encodeURIComponent(user.id),{
    headers,cache:'no-store'
   }),
   fetch(url+'/rest/v1/jury_authorized_emails?select=display_name&enabled=eq.true&email=eq.'+encodeURIComponent(normalizedEmail),{
    headers,cache:'no-store'
   })
  ]);
  if(!memberResponse.ok||!allowResponse.ok)
   return NextResponse.json({error:'Juryberechtigung konnte nicht geprüft werden.'},{status:503});
  const members=await memberResponse.json() as Array<{user_id:string}>;
  const approved=await allowResponse.json() as Array<{display_name:string}>;
  if(!members.some(j=>j.user_id===user.id)&&!approved.length)
   return NextResponse.json({error:'Diese E-Mail-Adresse ist nicht für das Juryportal freigeschaltet.'},{status:403});
  // Enroll only the current authenticated user's own ID. RLS additionally
  // verifies the confirmed email, exact display name and is_admin=false.
  if(!members.some(j=>j.user_id===user.id)){
   const enrolled=await fetch(url+'/rest/v1/jury_members',{
    method:'POST',headers:{...headers,'Content-Type':'application/json',Prefer:'return=representation'},
    body:JSON.stringify({user_id:user.id,display_name:approved[0].display_name,is_admin:false}),
    cache:'no-store'
   });
   if(!enrolled.ok)
    return NextResponse.json({error:'Ihr Juryzugang konnte noch nicht aktiviert werden.'},{status:503});
  }
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
