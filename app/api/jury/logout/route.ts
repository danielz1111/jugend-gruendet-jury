import {NextResponse} from 'next/server';
import {clearJuryAuthCookies} from '../../../../lib/jury-auth-cookies';
export async function POST(){
 const response=NextResponse.redirect(new URL('/jury',process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:'http://localhost:3000'),303);
 clearJuryAuthCookies(response);
 return response;
}
