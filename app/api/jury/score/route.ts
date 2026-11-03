import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';
const keys=['expert_a_score','expert_b_score','expert_c_score','expert_d_score','expert_e_score','presentation_impact_score','questions_quality_score','questions_confidence_score','questions_reasoning_score'] as const;
export async function POST(req:Request){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return NextResponse.json({error:'Ungültige Anfrage'},{status:400})}
 const team_id=body.team_id,field=body.field,score=body.score;
 if(typeof team_id!=='string'||!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(team_id)||!keys.some(k=>k===field)||!Number.isInteger(score)||Number(score)<1||Number(score)>10)return NextResponse.json({error:'Ungültige Bewertung'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const headers={apikey:key,Authorization:'Bearer '+session.token,'Content-Type':'application/json'};
 const lookup=await fetch(url+'/rest/v1/evaluations?select=id,'+keys.join(',')+'&team_id=eq.'+encodeURIComponent(team_id)+'&juror_id=eq.'+session.userId,{headers,cache:'no-store'});
 if(!lookup.ok)return NextResponse.json({error:'Bewertung konnte nicht geprüft werden'},{status:502});
 const existing=await lookup.json() as Array<{id:string}&Record<string,number|null>>;
 const complete=keys.every(k=>k===field||existing[0]?.[k]!=null);
 const submitted_at=complete?new Date().toISOString():null;
 const payload=existing.length?{[field as string]:score,submitted_at,updated_at:new Date().toISOString()}:{team_id,juror_id:session.userId,[field as string]:score,submitted_at};
 const target=existing.length?url+'/rest/v1/evaluations?id=eq.'+existing[0].id:url+'/rest/v1/evaluations';
 const res=await fetch(target,{method:existing.length?'PATCH':'POST',headers:{...headers,Prefer:'return=representation'},body:JSON.stringify(payload),cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Speichern fehlgeschlagen. Bitte erneut versuchen.'},{status:502});
 return NextResponse.json({saved:true,field,score});
}
