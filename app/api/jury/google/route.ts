import {createHash,randomBytes} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';

export async function GET(request:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.redirect(new URL('/jury?error=configuration',request.url));
 const verifier=randomBytes(32).toString('base64url');
 const challenge=createHash('sha256').update(verifier).digest('base64url');
 const callback=new URL('/api/jury/google/callback',request.nextUrl.origin);
 const authorize=new URL(url+'/auth/v1/authorize');
 authorize.searchParams.set('provider','google');
 authorize.searchParams.set('redirect_to',callback.toString());
 authorize.searchParams.set('code_challenge',challenge);
 authorize.searchParams.set('code_challenge_method','s256');
 const response=NextResponse.redirect(authorize);
 response.cookies.set('jury_oauth_pkce',verifier,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/api/jury/google',maxAge:600});
 response.headers.set('Cache-Control','no-store');
 return response;
}
