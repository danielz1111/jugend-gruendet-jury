import {cookies} from 'next/headers';
import {cache} from 'react';
export const getParentSession=cache(async()=>{
 const token=(await cookies()).get('parent_access')?.value;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!token||!url||!key)return null;
 try{
  const res=await fetch(url+'/auth/v1/user',{
   headers:{apikey:key,Authorization:'Bearer '+token},cache:'no-store'
  });
  if(!res.ok)return null;
  const user=await res.json() as {id?:string;email?:string;email_confirmed_at?:string|null};
  if(!user.id||!user.email||!user.email_confirmed_at)return null;
  return {userId:user.id,email:user.email,token};
 }catch{return null}
});
