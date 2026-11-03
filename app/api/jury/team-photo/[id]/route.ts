import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../../lib/jury-session';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){
 const session=await getJurySession();
 if(!session)return NextResponse.json({error:'Nicht angemeldet'},{status:401});
 const {id}=await params;
 if(!uuid.test(id))return NextResponse.json({error:'Ungültiges Team'},{status:400});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});
 const headers={apikey:key,Authorization:'Bearer '+session.token};
 const metadata=await fetch(url+'/rest/v1/teams?select=jury_photo_path&id=eq.'+id+'&limit=1',{headers,cache:'no-store'});
 if(!metadata.ok)return NextResponse.json({error:'Teamfoto nicht verfügbar'},{status:502});
 const rows=await metadata.json() as Array<{jury_photo_path:string|null}>;
 const path=rows[0]?.jury_photo_path;
 if(!path||!/^team-photos\/[a-zA-Z0-9/_-]+\.(jpg|jpeg|png|webp)$/i.test(path)||path.includes('..'))return NextResponse.json({error:'Kein freigegebenes Teamfoto hinterlegt'},{status:404});
 const mediaType=path.toLowerCase().endsWith('.png')?'image/png':path.toLowerCase().endsWith('.webp')?'image/webp':'image/jpeg';
 const res=await fetch(url+'/storage/v1/object/authenticated/team-private/'+path,{headers,cache:'no-store'});
 if(!res.ok)return NextResponse.json({error:'Teamfoto nicht verfügbar'},{status:404});
 return new NextResponse(res.body,{headers:{'Content-Type':mediaType,'Cache-Control':'private, no-store','Content-Disposition':'inline','X-Content-Type-Options':'nosniff'}});
}
