import {cookies} from 'next/headers';
import {cache} from 'react';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const getJurySession=cache(async()=>{
 const token=(await cookies()).get('jury_access')?.value;
 if(!token||!url||!key)return null;
 const headers={apikey:key,Authorization:'Bearer '+token};
 // Verify the authenticated user first. Admins can SELECT all jury profiles;
 // an unfiltered LIMIT 1 could otherwise return somebody else's profile.
 const userRes=await fetch(url+'/auth/v1/user',{headers,cache:'no-store'});
 if(!userRes.ok)return null;
 const user=await userRes.json() as {id?:string};
 if(!user.id)return null;
 const juryRes=await fetch(
  url+'/rest/v1/jury_members?select=user_id,display_name,is_admin,must_change_password,welcome_address&user_id=eq.'+encodeURIComponent(user.id)+'&limit=1',
  {headers,cache:'no-store'}
 );
 if(!juryRes.ok)return null;
 const jury=await juryRes.json() as Array<{user_id:string;display_name:string;is_admin:boolean;must_change_password:boolean;welcome_address:string|null}>;
 if(!user.id||jury.length!==1||jury[0].user_id!==user.id||jury[0].must_change_password)return null;
 return {userId:user.id,displayName:jury[0].display_name,welcomeAddress:jury[0].welcome_address,isAdmin:jury[0].is_admin,token};
});
