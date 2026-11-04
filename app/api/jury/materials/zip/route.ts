import {NextResponse} from 'next/server';
import JSZip from 'jszip';
import {extractPublicFields, type ProfileSuggestion} from '../../../../../lib/businessplan-extract';
import {getJurySession} from '../../../../../lib/jury-session';
export const runtime='nodejs';
export const maxDuration=60;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ZIP=20*1024*1024,MAX_FILE=20*1024*1024,MAX_TOTAL=60*1024*1024;
function fileInfo(name:string,bytes:Uint8Array){
 const ext=name.toLowerCase().split('.').pop();
 if(ext==='pdf'&&String.fromCharCode(...bytes.slice(0,5))==='%PDF-')return {type:'application/pdf',ext:'pdf'};
 if((ext==='jpg'||ext==='jpeg')&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return {type:'image/jpeg',ext:'jpg'};
 if(ext==='png'&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n))return {type:'image/png',ext:'png'};
 return null;
}
function titleFor(name:string){
 const simple=name.split('/').pop()||name;
 if(/\.pdf$/i.test(simple))return 'Vollständiger Businessplan';
 if(/validier/i.test(simple))return 'Validierung · '+(simple.match(/018[0-9]+/)?.[0]||'Nachweis');
 if(/visualis|produkt/i.test(simple))return 'Produktvisualisierung';
 if(/werbung|marketing/i.test(simple))return 'Werbematerial';
 return simple.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ').slice(0,120);
}
export async function POST(req:Request){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 if(!session.isAdmin)return NextResponse.json({error:'Nur Administratoren dürfen ZIP-Dateien importieren'},{status:403});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Supabase ist nicht eingerichtet'},{status:503});
 const form=await req.formData().catch(()=>null);
 const teamId=form?.get('team_id'),archive=form?.get('file');
 if(typeof teamId!=='string'||!uuid.test(teamId)||!(archive instanceof File)||archive.size<1||archive.size>MAX_ZIP||!/\.zip$/i.test(archive.name))return NextResponse.json({error:'Bitte ein Team und eine ZIP-Datei bis 20 MB auswählen'},{status:400});
 const headers={apikey:key,Authorization:'Bearer '+session.token};
 const teamResponse=await fetch(url+'/rest/v1/teams?select=id,name&id=eq.'+teamId,{headers,cache:'no-store'});
 if(!teamResponse.ok)return NextResponse.json({error:'Teamprüfung fehlgeschlagen'},{status:502});
 const teamRows=await teamResponse.json() as Array<{id:string;name:string}>;
 if(!teamRows.length)return NextResponse.json({error:'Team nicht gefunden'},{status:404});
 const bytes=new Uint8Array(await archive.arrayBuffer());
 if(bytes[0]!==80||bytes[1]!==75)return NextResponse.json({error:'Keine gültige ZIP-Datei'},{status:400});
 let zip:JSZip;
 try{zip=await JSZip.loadAsync(bytes,{checkCRC32:true});}
 catch{return NextResponse.json({error:'ZIP-Datei beschädigt oder nicht lesbar'},{status:400});}
 const entries=Object.values(zip.files).filter(x=>!x.dir&&!x.name.startsWith('__MACOSX/')&&!x.name.split('/').pop()?.startsWith('.'));
 const selected=entries.filter(x=>/\.(pdf|jpe?g|png)$/i.test(x.name));
 if(!selected.length||selected.length>20||entries.length>40)return NextResponse.json({error:'ZIP muss 1 bis 20 PDF- oder Bilddateien enthalten (maximal 40 Einträge)'},{status:400});
 // Reject archive paths that could be used for traversal, even though no files are written locally.
 if(entries.some(x=>x.name.includes('\\')||x.name.split('/').includes('..')))return NextResponse.json({error:'Ungültiger Dateipfad im ZIP'},{status:400});
 const extracted:Array<{name:string;data:Uint8Array;type:string;ext:string}>=[];
 let total=0;
 for(const entry of selected){
  const data=await entry.async('uint8array');
  total+=data.byteLength;
  if(!data.byteLength||data.byteLength>MAX_FILE||total>MAX_TOTAL)return NextResponse.json({error:'Dateien im ZIP sind zu groß (maximal 20 MB pro Datei, 60 MB insgesamt)'},{status:400});
  const info=fileInfo(entry.name,data);
  if(!info)return NextResponse.json({error:'Dateiinhalt stimmt nicht mit dem Dateiformat überein: '+entry.name},{status:400});
  extracted.push({name:entry.name,data,...info});
 }
 const existingRes=await fetch(url+'/rest/v1/team_materials?select=id,original_filename,object_path&team_id=eq.'+teamId,{headers,cache:'no-store'});
 if(!existingRes.ok)return NextResponse.json({error:'Vorhandene Dateien konnten nicht geprüft werden'},{status:502});
 const existing=new Map((await existingRes.json() as Array<{id:string;original_filename:string;object_path:string}>).map(row=>[row.original_filename,row]));
 let imported=0,replaced=0,skipped=0;
 const errors:string[]=[];
 let suggestion:ProfileSuggestion|null=null;
 let sourceFilename:string|null=null;
 for(const item of extracted){
  const filename=item.name.split('/').pop()||item.name;
  const previous=existing.get(filename);
  const objectPath='businessplans/'+teamId+'/'+crypto.randomUUID()+'.'+item.ext;
  const upload=await fetch(url+'/storage/v1/object/team-private/'+objectPath,{
   method:'POST',headers:{...headers,'Content-Type':item.type,'x-upsert':'false'},
   body:Buffer.from(item.data)
  });
  if(!upload.ok){errors.push(filename+': Upload fehlgeschlagen');continue;}
  const record={team_id:teamId,title:titleFor(filename),object_path:objectPath,original_filename:filename,media_type:item.type};
  const metadata=await fetch(previous?url+'/rest/v1/team_materials?id=eq.'+previous.id:url+'/rest/v1/team_materials',{
   method:previous?'PATCH':'POST',
   headers:{...headers,'Content-Type':'application/json',Prefer:'return=representation'},
   body:JSON.stringify(previous?{title:record.title,object_path:record.object_path,media_type:record.media_type,created_at:new Date().toISOString()}:record)
  });
  if(!metadata.ok){
   await fetch(url+'/storage/v1/object/team-private/'+objectPath,{method:'DELETE',headers}).catch(()=>{});
   errors.push(filename+': Zuordnung fehlgeschlagen');continue;
  }
  const rows=await metadata.json().catch(()=>[]) as Array<{id:string}>;
  if(rows.length!==1){
   await fetch(url+'/storage/v1/object/team-private/'+objectPath,{method:'DELETE',headers}).catch(()=>{});
   errors.push(filename+': Dateieintrag konnte nicht bestätigt werden');continue;
  }
  if(previous){
   replaced++;
   if(previous.object_path!==objectPath){
    await fetch(url+'/storage/v1/object/team-private/'+previous.object_path,{method:'DELETE',headers}).catch(()=>{});
   }
  }else{imported++;}
  existing.set(filename,{id:rows[0].id,original_filename:filename,object_path:objectPath});
  if(item.type==='application/pdf'&&/businessplan/i.test(filename)&&!suggestion){
   const extractedFields=await extractPublicFields(item.data);
   if(extractedFields){suggestion=extractedFields;sourceFilename=filename;}
  }
 }
 return NextResponse.json({
  team:teamRows[0].name,imported,replaced,skipped,errors,complete:errors.length===0,
  suggested_profile:suggestion?{team_id:teamId,source_filename:sourceFilename,...suggestion}:null
 });
}
