import {getParentSession} from '../../lib/parent-session';
import {getPublicTeams} from '../../lib/supabase-public';
import {getCompanyProfile} from '../../lib/company-profiles';
import ParentPortalClient from './ParentPortalClient';

export const dynamic='force-dynamic';
type RequestRow={id:string;team_id:string;status:'pending'|'approved'|'rejected';created_at:string};
type Company={id:string;name:string;tagline:string|null;description:string|null;position:number;
  problem:string|null;solution:string|null;audience:string|null;model:string|null;
  members:Array<{id:string;display_name:string;expert_role:string|null}>};
export default async function ParentsPage(){
 const session=await getParentSession();
 let publicTeams:Awaited<ReturnType<typeof getPublicTeams>>=[];
 try{publicTeams=await getPublicTeams()}catch{}
 let requests:RequestRow[]=[];
 let companies:Company[]=[];
 let error='';
 if(session){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(url&&key){
   const headers={apikey:key,Authorization:'Bearer '+session.token};
   try{
    const r=await fetch(url+'/rest/v1/parent_access_requests?select=id,team_id,status,created_at&order=created_at.desc',{
      headers,cache:'no-store'
    });
    if(!r.ok)throw new Error('Anträge konnten nicht abgerufen werden.');
    requests=await r.json() as RequestRow[];
    const approved=[...new Set(requests.filter(v=>v.status==='approved').map(v=>v.team_id))]
      .filter(id=>/^[0-9a-f-]{36}$/i.test(id));
    if(approved.length){
     const filter=approved.join(',');
     const [teamsRes,membersRes]=await Promise.all([
      fetch(url+'/rest/v1/teams?select=id,name,tagline,description,position&id=in.('+filter+')&order=position.asc',{headers,cache:'no-store'}),
      fetch(url+'/rest/v1/team_members?select=id,team_id,display_name,expert_role&team_id=in.('+filter+')&order=display_order.asc',{headers,cache:'no-store'})
     ]);
     if(!teamsRes.ok||!membersRes.ok)throw new Error('Freigeschaltete Unternehmensprofile konnten nicht geladen werden.');
     const teams=await teamsRes.json() as Array<{id:string;name:string;tagline:string|null;description:string|null;position:number}>;
     const members=await membersRes.json() as Array<{id:string;team_id:string;display_name:string;expert_role:string|null}>;
     companies=teams.map(team=>{
      const details=getCompanyProfile(team.name);
      return {...team,
       problem:details?.problem||null,solution:details?.solution||null,
       audience:details?.audience||null,model:details?.model||null,
       members:members.filter(m=>m.team_id===team.id).map(m=>({id:m.id,display_name:m.display_name,expert_role:m.expert_role}))
      };
     });
    }
   }catch(e){error=e instanceof Error?e.message:'Zugriff derzeit nicht möglich.'}
  }
 }
 return <ParentPortalClient userEmail={session?.email||null}
  teams={publicTeams.map(t=>({id:t.id,name:t.name}))} requests={requests} companies={companies} error={error}/>;
}
