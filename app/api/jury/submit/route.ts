import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';
const keys=['presentation_impact_score','questions_quality_score','questions_confidence_score','questions_reasoning_score'] as const;
export async function POST(req:Request){
 const origin=req.headers.get('origin');
 if(origin&&origin!==new URL(req.url).origin)return NextResponse.json({error:'Ungültige Herkunft'},{status:403});
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return NextResponse.json({error:'Ungültige Anfrage'},{status:400})}
 const teamId=body.team_id;
 if(typeof teamId!=='string'||!/^[0-9a-f-]{36}$/i.test(teamId))return NextResponse.json({error:'Ungültiges Team'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const headers={apikey:key,Authorization:'Bearer '+session.token,'Content-Type':'application/json'};
 const [scoreResponse,memberResponse]=await Promise.all([
  fetch(url+'/rest/v1/evaluations?select=id,submitted_at,'+keys.join(',')+'&team_id=eq.'+encodeURIComponent(teamId)+'&juror_id=eq.'+session.userId,{headers,cache:'no-store'}),
  fetch(url+'/rest/v1/team_members?select=id&team_id=eq.'+encodeURIComponent(teamId),{headers,cache:'no-store'})
 ]);
 if(!scoreResponse.ok||!memberResponse.ok)return NextResponse.json({error:'Bewertung konnte nicht geprüft werden'},{status:502});
 const rows=await scoreResponse.json() as Array<{id:string;submitted_at:string|null}&Record<string,number|null>>;
 const members=await memberResponse.json() as Array<{id:string}>;
 if(members.length!==4&&members.length!==5)return NextResponse.json({error:'Teamgröße ist nicht eindeutig'},{status:409});
 const entry=rows[0];
 if(!entry)return NextResponse.json({error:'Noch keine Bewertung gespeichert'},{status:409});
 if(entry.submitted_at)return NextResponse.json({submitted:true});
 const required=keys;
 if(!required.every(k=>Number.isInteger(entry[k])&&Number(entry[k])>=1&&Number(entry[k])<=10))return NextResponse.json({error:'Bitte zuerst alle Kriterien bewerten'},{status:409});
 const res=await fetch(url+'/rest/v1/evaluations?id=eq.'+entry.id+'&submitted_at=is.null',{method:'PATCH',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify({submitted_at:new Date().toISOString()}),cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Freigabe fehlgeschlagen'},{status:502});
 const changed=await res.json() as unknown[];
 if(!changed.length)return NextResponse.json({error:'Bewertung wurde inzwischen verändert. Bitte neu laden.'},{status:409});
 return NextResponse.json({submitted:true});
}
