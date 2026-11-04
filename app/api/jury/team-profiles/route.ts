import {NextResponse} from 'next/server';
import {getJurySession} from '../../../../lib/jury-session';

export const dynamic='force-dynamic';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Input={id?:unknown;name?:unknown;tagline?:unknown;description?:unknown;is_public?:unknown};
type Team={id:string;name:string;position:number;tagline:string|null;description:string|null;is_public:boolean};
const noCache={'Cache-Control':'no-store'};
function error(message:string,status:number) {
  return NextResponse.json({error:message},{status,headers:noCache});
}
export async function PATCH(request:Request) {
  const session=await getJurySession();
  if(!session)return error('Nicht angemeldet.',401);
  if(!session.isAdmin)return error('Nur die Wettbewerbsleitung kann öffentliche Profile ändern.',403);
  let payload:Input;
  try {
    const body=await request.json() as unknown;
    if(!body||typeof body!=='object'||Array.isArray(body))return error('Ungültige Eingabe.',400);
    payload=body as Input;
  }catch{return error('Ungültiges JSON.',400)}
  if(typeof payload.id!=='string'||!uuid.test(payload.id))return error('Ungültige Team-ID.',400);
  if(typeof payload.name!=='string'||payload.name.trim().length<2||payload.name.trim().length>80)return error('Der Teamname muss 2 bis 80 Zeichen enthalten.',400);
  if(typeof payload.tagline!=='string'||payload.tagline.trim().length>160)return error('Der Slogan darf höchstens 160 Zeichen enthalten.',400);
  if(typeof payload.description!=='string'||payload.description.trim().length>2000)return error('Die Beschreibung darf höchstens 2.000 Zeichen enthalten.',400);
  if(typeof payload.is_public!=='boolean')return error('Die Freigabeangabe fehlt.',400);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)return error('Datenbank nicht eingerichtet.',503);
  const headers={
    apikey:key,
    Authorization:'Bearer '+session.token,
    'Content-Type':'application/json',
    Prefer:'return=representation'
  };
  const save=await fetch(url.replace(/\/$/,'')+'/rest/v1/teams?id=eq.'+payload.id+'&select=id,name,position,tagline,description,is_public',{
    method:'PATCH',headers,cache:'no-store',
    body:JSON.stringify({
      name:payload.name.trim(),
      tagline:payload.tagline.trim()||null,
      description:payload.description.trim()||null,
      is_public:payload.is_public
    })
  }).catch(()=>null);
  if(!save)return error('Datenbank ist vorübergehend nicht erreichbar.',503);
  if(!save.ok)return error('Teamprofil konnte nicht gespeichert werden.',502);
  const rows=await save.json().catch(()=>null) as Team[]|null;
  if(!Array.isArray(rows)||rows.length!==1)return error('Kein passendes Teamprofil gefunden.',404);
  return NextResponse.json({team:rows[0]},{headers:noCache});
}
