import {NextRequest,NextResponse} from 'next/server';
const cookieBase={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/' as const};
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');
 if(origin&&origin!==req.nextUrl.origin)return NextResponse.json({error:'Ungültige Anfrage.'},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Anmeldung nicht verfügbar.'},{status:503});
 const data=await req.json().catch(()=>({})) as {action?:string;email?:string;password?:string};
 if(data.action==='logout'){
  const response=NextResponse.json({ok:true});
  response.cookies.set('parent_access','',{...cookieBase,maxAge:0});
  response.headers.set('Cache-Control','no-store');
  return response;
 }
 const email=typeof data.email==='string'?data.email.trim().toLowerCase():'';
 const password=typeof data.password==='string'?data.password:'';
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<10||password.length>128)
  return NextResponse.json({error:'Bitte gültige E-Mail und ein Passwort mit mindestens zehn Zeichen verwenden.'},{status:400});
 if(data.action!=='register'&&data.action!=='login')
  return NextResponse.json({error:'Ungültige Anmeldung.'},{status:400});
 if(data.action==='register'){
  const signup=await fetch(url+'/auth/v1/signup?redirect_to='+encodeURIComponent(req.nextUrl.origin+'/eltern'),{
   method:'POST',headers:{apikey:key,'Content-Type':'application/json'},
   body:JSON.stringify({email,password}),cache:'no-store'
  });
  if(!signup.ok){
   const message=signup.status===429?'Zu viele Versuche. Bitte später erneut versuchen.':
    'Die Registrierung konnte nicht abgeschlossen werden. Möglicherweise besteht bereits ein Konto.';
   return NextResponse.json({error:message},{status:signup.status===429?429:400});
  }
  return NextResponse.json({ok:true,message:'Bitte bestätigen Sie Ihre E-Mail-Adresse über den zugesandten Link. Anschließend können Sie sich anmelden.'});
 }
 const login=await fetch(url+'/auth/v1/token?grant_type=password',{
  method:'POST',headers:{apikey:key,'Content-Type':'application/json'},
  body:JSON.stringify({email,password}),cache:'no-store'
 });
 if(!login.ok)return NextResponse.json({error:'Anmeldung nicht möglich. Bitte Zugangsdaten und E-Mail-Bestätigung prüfen.'},{status:401});
 const auth=await login.json() as {access_token?:string;expires_in?:number;user?:{email_confirmed_at?:string|null}};
 if(!auth.access_token||!auth.user?.email_confirmed_at)
  return NextResponse.json({error:'Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse.'},{status:403});
 const response=NextResponse.json({ok:true});
 response.cookies.set('parent_access',auth.access_token,{...cookieBase,maxAge:Math.min(auth.expires_in||3600,3600)});
 response.headers.set('Cache-Control','no-store');
 return response;
}
