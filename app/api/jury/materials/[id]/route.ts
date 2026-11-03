import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../../lib/jury-session';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 const {id}=await params;
 if(!uuid.test(id))return NextResponse.json({error:'Ungültige Datei'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const headers={apikey:key,Authorization:'Bearer '+session.token};
 const metadata=await fetch(url+'/rest/v1/team_materials?select=object_path,original_filename,media_type&id=eq.'+id,{headers,cache:'no-store'});
 if(!metadata.ok)return NextResponse.json({error:'Datei nicht verfügbar'},{status:502});
 const rows=await metadata.json() as Array<{object_path:string;original_filename:string;media_type:string}>;
 const item=rows[0];
 if(!item||!item.object_path.startsWith('businessplans/')||!item.object_path.endsWith('.pdf'))return NextResponse.json({error:'Datei nicht gefunden'},{status:404});
 const res=await fetch(url+'/storage/v1/object/authenticated/team-private/'+item.object_path,{headers,cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'PDF konnte nicht geladen werden'},{status:502});
 const filename=item.original_filename.replace(/[\r\n"\\]/g,'_').slice(0,120);
 return new NextResponse(res.body,{headers:{'Content-Type':'application/pdf','Content-Disposition':'inline; filename="'+filename+'"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
