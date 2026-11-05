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
 const team_id=body.team_id,field=body.field,score=body.score;
 if(typeof team_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(team_id)||!keys.some(k=>k===field)||!Number.isInteger(score)||Number(score)<1||Number(score)>10)return NextResponse.json({error:'Ungültige Bewertung'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const headers={apikey:key,Authorization:'Bearer '+session.token,'Content-Type':'application/json'};
 const lookup=await fetch(url+'/rest/v1/evaluations?select=id,submitted_at,'+keys.join(',')+'&team_id=eq.'+encodeURIComponent(team_id)+'&juror_id=eq.'+session.userId,{headers,cache:'no-store'});
 if(!lookup.ok)return NextResponse.json({error:'Bewertung konnte nicht geprüft werden'},{status:502});
 const membersResponse=await fetch(url+'/rest/v1/team_members?select=id&team_id=eq.'+encodeURIComponent(team_id),{headers,cache:'no-store'});
 if(!membersResponse.ok)return NextResponse.json({error:'Teamgröße konnte nicht geprüft werden'},{status:502});
 const memberRows=await membersResponse.json() as Array<{id:string}>;
 if(memberRows.length!==4&&memberRows.length!==5)return NextResponse.json({error:'Teamgröße ist nicht eindeutig'},{status:409});
 const existing=await lookup.json() as Array<{id:string;submitted_at:string|null}&Record<string,number|null>>;
 if(existing[0]?.submitted_at)return NextResponse.json({error:'Bewertung bereits freigegeben'},{status:409});
 const values:Record<string,number|string|null>={[field as string]:Number(score)};
 const payload=existing.length?{...values,updated_at:new Date().toISOString()}:{team_id,juror_id:session.userId,...values};
 const target=existing.length?url+'/rest/v1/evaluations?id=eq.'+existing[0].id+'&submitted_at=is.null':url+'/rest/v1/evaluations';
 const res=await fetch(target,{method:existing.length?'PATCH':'POST',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(payload),cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Speichern fehlgeschlagen. Bitte erneut versuchen.'},{status:502});
 const written=await res.json() as unknown[];
 if(written.length!==1)return NextResponse.json({error:'Bewertung wurde bereits freigegeben oder verändert. Bitte neu laden.'},{status:409});
 return NextResponse.json({saved:true,field,score});
}
