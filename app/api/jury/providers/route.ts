import {NextResponse} from 'next/server';

export async function GET(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({google:false},{headers:{'Cache-Control':'no-store'}});
 try{
  const response=await fetch(url+'/auth/v1/settings',{headers:{apikey:key},cache:'no-store'});
  if(!response.ok)throw new Error('Provider settings unavailable');
  const settings=await response.json() as {external?:{google?:boolean}};
  return NextResponse.json({google:settings.external?.google===true},{headers:{'Cache-Control':'no-store'}});
 }catch{
  return NextResponse.json({google:false},{headers:{'Cache-Control':'no-store'}});
 }
}
