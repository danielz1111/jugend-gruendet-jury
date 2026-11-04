import {cookies} from 'next/headers';
import {NextRequest,NextResponse} from 'next/server';

/**
 * Server-side Supabase refresh-token rotation. No refresh token is ever
 * exposed to JavaScript or copied to localStorage.
 */
const secure=process.env.NODE_ENV==='production';
const cookieOptions={httpOnly:true,secure,sameSite:'lax' as const,path:'/' as const};
const unauthorized=(request:NextRequest,redirect:boolean)=>{
  const response=redirect
    ?NextResponse.redirect(new URL('/jury',request.url),303)
    :NextResponse.json({error:'Anmeldung erforderlich.'},{status:401});
  response.cookies.set('jury_access','',{...cookieOptions,maxAge:0});
  response.cookies.set('jury_refresh','',{...cookieOptions,maxAge:0});
  response.headers.set('Cache-Control','no-store');
  return response;
};
async function refresh(request:NextRequest,redirect:boolean){
  if(!redirect){
    const origin=request.headers.get('origin');
    if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:'Unzulässige Herkunft.'},{status:403});
  }
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const refreshToken=(await cookies()).get('jury_refresh')?.value;
  if(!url||!key||!refreshToken)return unauthorized(request,redirect);
  try{
    const auth=await fetch(url+'/auth/v1/token?grant_type=refresh_token',{
      method:'POST',headers:{apikey:key,'Content-Type':'application/json'},
      body:JSON.stringify({refresh_token:refreshToken}),cache:'no-store'
    });
    if(!auth.ok)return unauthorized(request,redirect);
    const data=await auth.json() as {
      access_token?:string;refresh_token?:string;expires_in?:number;user?:{id?:string}
    };
    if(!data.access_token||!data.refresh_token||!data.user?.id)return unauthorized(request,redirect);
    // Every renewed token must still belong to a registered juror.
    const member=await fetch(url+'/rest/v1/jury_members?select=user_id&limit=1',{
      headers:{apikey:key,Authorization:'Bearer '+data.access_token},cache:'no-store'
    });
    if(!member.ok)return unauthorized(request,redirect);
    const profiles=await member.json() as Array<{user_id:string}>;
    if(profiles.length!==1||profiles[0].user_id!==data.user.id)return unauthorized(request,redirect);
    const response=redirect
      ?NextResponse.redirect(new URL('/jury/dashboard',request.url),303)
      :NextResponse.json({ok:true});
    response.cookies.set('jury_access',data.access_token,{
      ...cookieOptions,maxAge:Math.min(data.expires_in||3600,3600)
    });
    response.cookies.set('jury_refresh',data.refresh_token,{
      ...cookieOptions,maxAge:7*24*60*60
    });
    response.headers.set('Cache-Control','no-store');
    return response;
  }catch{return unauthorized(request,redirect)}
}
export async function GET(request:NextRequest){return refresh(request,true)}
export async function POST(request:NextRequest){return refresh(request,false)}
