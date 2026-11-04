import {NextRequest,NextResponse} from 'next/server';

const generic={ok:true,message:'Falls diese E-Mail-Adresse für den Juryzugang vorgesehen ist, erhalten Sie einen persönlichen Link zur Passwortvergabe.'};
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 if(origin&&origin!==request.nextUrl.origin)
  return NextResponse.json({error:'Ungültige Anfrage.'},{status:403});
 const body=await request.json().catch(()=>({})) as {email?:unknown};
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  return NextResponse.json({error:'Bitte eine gültige E-Mail-Adresse eingeben.'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Der E-Mail-Dienst ist nicht eingerichtet.'},{status:503});
 const headers={apikey:key,'Content-Type':'application/json'};
 try{
  // Read the preapproval table through a narrowly scoped boolean RPC.
  // The full jury email list is not sent to public website visitors.
  const preapproval=await fetch(url+'/rest/v1/rpc/jury_email_preapproved',{
   method:'POST',headers:{...headers,'x-jury-requested-email':email},body:JSON.stringify({p_email:email}),cache:'no-store'
  });
  if(!preapproval.ok)return NextResponse.json({error:'Der Zugangsdienst ist vorübergehend nicht erreichbar.'},{status:503});
  const approved=(await preapproval.json())===true;
  const redirectTo=new URL('/jury/passwort-neu',request.nextUrl.origin).toString();
  // For one of the five preapproved email addresses, Supabase sends a
  // one-time email link and creates the Auth identity at first confirmation.
  // Every other address uses recovery only, so no new account is created.
  const endpoint=approved?'/auth/v1/otp':'/auth/v1/recover';
  const requestBody=approved?{email,create_user:true}:{email};
  const sent=await fetch(url+endpoint+'?redirect_to='+encodeURIComponent(redirectTo),{
   method:'POST',headers,body:JSON.stringify(requestBody),cache:'no-store'
  });
  if(sent.status===429)return NextResponse.json({error:'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'},{status:429});
  if(sent.status>=500)return NextResponse.json({error:'Der E-Mail-Dienst ist vorübergehend nicht erreichbar.'},{status:503});
  // Never reveal whether an individual email is listed or already registered.
  return NextResponse.json(generic,{headers:{'Cache-Control':'no-store'}});
 }catch{
  return NextResponse.json({error:'Der E-Mail-Dienst ist vorübergehend nicht erreichbar.'},{status:503});
 }
}
