import {NextRequest,NextResponse} from 'next/server';
import {setJuryAuthCookies} from './lib/jury-auth-cookies';

function tokenExpiresSoon(token:string|undefined){
 if(!token)return true;
 try{
  const middle=token.split('.')[1];
  if(!middle)return true;
  const claims=JSON.parse(atob(middle.replace(/-/g,'+').replace(/_/g,'/'))) as {exp?:number};
  return !claims.exp||claims.exp<Math.floor(Date.now()/1000)+90;
 }catch{return true}
}

export async function middleware(request:NextRequest){
 const path=request.nextUrl.pathname;
 if(/^\/api\/jury\/(?:login|logout|google|providers)(?:\/|$)/.test(path))return NextResponse.next();
 const access=request.cookies.get('jury_access')?.value;
 if(!tokenExpiresSoon(access))return NextResponse.next();
 const refresh=request.cookies.get('jury_refresh')?.value;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!refresh||!url||!key)return NextResponse.next();
 try{
  const result=await fetch(url+'/auth/v1/token?grant_type=refresh_token',{
   method:'POST',headers:{apikey:key,'Content-Type':'application/json'},
   body:JSON.stringify({refresh_token:refresh}),cache:'no-store'
  });
  if(!result.ok)return NextResponse.next();
  const tokens=await result.json() as {access_token?:string;refresh_token?:string;expires_in?:number};
  if(!tokens.access_token||!tokens.refresh_token)return NextResponse.next();
  request.cookies.set('jury_access',tokens.access_token);
  request.cookies.set('jury_refresh',tokens.refresh_token);
  const response=NextResponse.next({request:{headers:request.headers}});
  setJuryAuthCookies(response,{access_token:tokens.access_token,refresh_token:tokens.refresh_token,expires_in:tokens.expires_in});
  return response;
 }catch{return NextResponse.next()}
}
export const config={matcher:['/jury/dashboard/:path*','/api/jury/:path*']};
