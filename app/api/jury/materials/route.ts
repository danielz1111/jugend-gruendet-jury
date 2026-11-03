import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(req:Request){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 const teamId=new URL(req.url).searchParams.get('team_id');
 if(!teamId||!uuid.test(teamId))return NextResponse.json({error:'Ungültiges Team'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const headers={apikey:key,Authorization:'Bearer '+session.token};
 const res=await fetch(url+'/rest/v1/team_materials?select=id,title,original_filename,media_type,created_at&team_id=eq.'+teamId+'&order=created_at.desc',{headers,cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Unterlagen nicht verfügbar'},{status:502});
 return NextResponse.json(await res.json(),{headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:Request){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 if(!session.isAdmin)return NextResponse.json({error:'Nur Administratoren können Dateien hochladen'},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const form=await req.formData().catch(()=>null);
 const teamId=form?.get('team_id'),file=form?.get('file'),title=form?.get('title');
 if(typeof teamId!=='string'||!uuid.test(teamId)||!(file instanceof File)||typeof title!=='string'||!title.trim()||title.length>120)return NextResponse.json({error:'Ungültige Datei oder Teamzuordnung'},{status:400});
 if(file.size<1||file.size>20*1024*1024||!['application/pdf','image/jpeg','image/png'].includes(file.type)||!(/\.(pdf|jpe?g|png)$/i.test(file.name)))return NextResponse.json({error:'Nur PDF, JPG oder PNG bis 20 MB erlaubt'},{status:400});
 const bytes=new Uint8Array(await file.arrayBuffer());
 const isPdf=file.type==='application/pdf';
 const isJpeg=file.type==='image/jpeg';
 const valid=isPdf?String.fromCharCode(...bytes.slice(0,5))==='%PDF-':isJpeg?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:bytes.slice(0,8).every((b,i)=>b===[137,80,78,71,13,10,26,10][i]);
 if(!valid)return NextResponse.json({error:'Dateiformat stimmt nicht mit dem Inhalt überein'},{status:400});
 const headers={apikey:key,Authorization:'Bearer '+session.token};
 const team=await fetch(url+'/rest/v1/teams?select=id&id=eq.'+teamId,{headers,cache:'no-store'});
 if(!team.ok||!(await team.json() as unknown[]).length)return NextResponse.json({error:'Team nicht gefunden'},{status:404});
 const extension=isPdf?'pdf':isJpeg?'jpg':'png';
 const path='businessplans/'+teamId+'/'+crypto.randomUUID()+'.'+extension;
 const upload=await fetch(url+'/storage/v1/object/team-private/'+path,{method:'POST',headers:{...headers,'Content-Type':file.type,'x-upsert':'false'},body:bytes});
 if(!upload.ok)return NextResponse.json({error:'PDF-Upload fehlgeschlagen'},{status:502});
 const metadata=await fetch(url+'/rest/v1/team_materials',{method:'POST',headers:{...headers,'Content-Type':'application/json',Prefer:'return=representation'},body:JSON.stringify({team_id:teamId,title:title.trim(),object_path:path,original_filename:file.name,media_type:file.type})});
 if(!metadata.ok){
  await fetch(url+'/storage/v1/object/team-private/'+path,{method:'DELETE',headers}).catch(()=>{});
  return NextResponse.json({error:'Datei hochgeladen, aber Zuordnung fehlgeschlagen'},{status:502});
 }
 return NextResponse.json({saved:true});
}
