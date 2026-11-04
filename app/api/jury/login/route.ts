import {NextRequest,NextResponse} from 'next/server';
export async function POST(request:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Anmeldung nicht konfiguriert.'},{status:503});
 const {email,password,remember}=await request.json().catch(()=>({email:'',password:'',remember:false}));
 if(typeof email!=='string'||typeof password!=='string'||!email||!password)return NextResponse.json({error:'Bitte E-Mail und Passwort eingeben.'},{status:400});
 const auth=await fetch(url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({email,password}),cache:'no-store'});
 if(!auth.ok)return NextResponse.json({error:'Anmeldung fehlgeschlagen.'},{status:401});
 const data=await auth.json() as {access_token?:string;refresh_token?:string;expires_in?:number;user?:{id?:string}};
 if(!data.access_token||!data.user?.id)return NextResponse.json({error:'Ungültige Anmeldung.'},{status:401});
 const headers={apikey:key,Authorization:'Bearer '+data.access_token};
 const member=await fetch(url+'/rest/v1/jury_members?select=user_id,is_admin&limit=1',{headers,cache:'no-store'});
 if(!member.ok)return NextResponse.json({error:'Berechtigung konnte nicht geprüft werden.'},{status:503});
 const profiles=await member.json() as Array<{user_id:string;is_admin:boolean}>;
 if(profiles.length!==1||profiles[0].user_id!==data.user.id)return NextResponse.json({error:'Dieses Konto ist nicht als Jurymitglied freigeschaltet.'},{status:403});
 const response=NextResponse.json({ok:true,redirect:'/jury/dashboard'});
 response.cookies.set('jury_access',data.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:Math.min(data.expires_in||3600,3600)});
 if(remember===true&&data.refresh_token){
   response.cookies.set('jury_refresh',data.refresh_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:7*24*60*60});
 }else{
   response.cookies.set('jury_refresh','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});
 }
 response.headers.set('Cache-Control','no-store');
 return response;
}
