import {NextResponse} from 'next/server';
export async function POST(){
 const response=NextResponse.redirect(new URL('/jury',process.env.VERCEL_URL?'https://'+process.env.VERCEL_URL:'http://localhost:3000'),303);
 response.cookies.set('jury_access','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});
 response.headers.set('Cache-Control','no-store');
 return response;
}
