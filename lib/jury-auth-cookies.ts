import {NextResponse} from 'next/server';

export type JuryAuthTokens={access_token:string;refresh_token?:string;expires_in?:number};

const secure=process.env.NODE_ENV==='production';

export function setJuryAuthCookies(response:NextResponse,tokens:JuryAuthTokens){
 response.cookies.set('jury_access',tokens.access_token,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:Math.max(60,Math.min(tokens.expires_in||3600,3600))});
 if(tokens.refresh_token){
  response.cookies.set('jury_refresh',tokens.refresh_token,{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:60*60*24*30});
 }
 response.headers.set('Cache-Control','no-store');
}
export function clearJuryAuthCookies(response:NextResponse){
 for(const name of ['jury_access','jury_refresh']){
  response.cookies.set(name,'',{httpOnly:true,secure,sameSite:'lax',path:'/',maxAge:0});
 }
 response.headers.set('Cache-Control','no-store');
}
