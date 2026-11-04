import {NextRequest,NextResponse} from 'next/server';

const result={ok:true,message:'Falls für diese E-Mail-Adresse ein Konto besteht, erhalten Sie einen Link zum Festlegen eines neuen Passworts.'};
export async function POST(request:NextRequest){
 const origin=request.headers.get('origin');
 if(origin&&origin!==request.nextUrl.origin)
  return NextResponse.json({error:'Ungültige Anfrage.'},{status:403});
 const data=await request.json().catch(()=>({})) as {email?:unknown};
 const email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  return NextResponse.json({error:'Bitte eine gültige E-Mail-Adresse eingeben.'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Der E-Mail-Dienst ist nicht eingerichtet.'},{status:503});
 try{
  const redirectTo=new URL('/jury/passwort-neu',request.nextUrl.origin).toString();
  const response=await fetch(url+'/auth/v1/recover?redirect_to='+encodeURIComponent(redirectTo),{
   method:'POST',
   headers:{apikey:key,'Content-Type':'application/json'},
   body:JSON.stringify({email}),cache:'no-store'
  });
  if(response.status===429)return NextResponse.json({error:'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'},{status:429});
  if(response.status>=500)return NextResponse.json({error:'Der E-Mail-Dienst ist vorübergehend nicht erreichbar.'},{status:503});
  // All other outcomes intentionally have the same answer to avoid account enumeration.
  return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
 }catch{
  return NextResponse.json({error:'Der E-Mail-Dienst ist vorübergehend nicht erreichbar.'},{status:503});
 }
}
