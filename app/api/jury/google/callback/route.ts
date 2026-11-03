import {NextRequest,NextResponse} from 'next/server';
import {setJuryAuthCookies} from '../../../../../lib/jury-auth-cookies';

export async function GET(request:NextRequest){
 const redirect=(reason:string)=>NextResponse.redirect(new URL('/jury?error='+encodeURIComponent(reason),request.nextUrl.origin));
 const code=request.nextUrl.searchParams.get('code');
 const verifier=request.cookies.get('jury_oauth_pkce')?.value;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(request.nextUrl.searchParams.has('error'))return redirect('google');
 if(!code||!verifier||!url||!key)return redirect('oauth');
 try{
  const auth=await fetch(url+'/auth/v1/token?grant_type=pkce',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({auth_code:code,code_verifier:verifier}),cache:'no-store'});
  if(!auth.ok)return redirect('oauth');
  const data=await auth.json() as {access_token?:string;refresh_token?:string;expires_in?:number;user?:{id?:string}};
  if(!data.access_token||!data.user?.id)return redirect('oauth');
  const member=await fetch(url+'/rest/v1/jury_members?select=user_id&limit=1',{headers:{apikey:key,Authorization:'Bearer '+data.access_token},cache:'no-store'});
  if(!member.ok)return redirect('permission');
  const profiles=await member.json() as Array<{user_id:string}>;
  if(profiles.length!==1||profiles[0].user_id!==data.user.id)return redirect('not_allowed');
  const response=NextResponse.redirect(new URL('/jury/dashboard',request.nextUrl.origin));
  setJuryAuthCookies(response,{access_token:data.access_token,refresh_token:data.refresh_token,expires_in:data.expires_in});
  response.cookies.set('jury_oauth_pkce','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/jury/google',maxAge:0});
  return response;
 }catch{return redirect('oauth')}
}
