import { NextResponse } from 'next/server';
import { getJurySession } from '../../../../lib/jury-session';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json({error:'Ungültige Herkunft'},{status:403});
  const session = await getJurySession();
  if (!session) return NextResponse.json({error:'Nicht angemeldet'},{status:401});
  let body: {team_id?: unknown};
  try { body = await request.json(); }
  catch { return NextResponse.json({error:'Ungültige Anfrage'},{status:400}); }
  const teamId = body.team_id;
  if (typeof teamId !== 'string' || !/^[0-9a-f-]{36}$/i.test(teamId))
    return NextResponse.json({error:'Ungültiges Team'},{status:400});

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!baseUrl || !apiKey)
    return NextResponse.json({error:'Datenbank nicht eingerichtet'},{status:503});

  const url = baseUrl + '/rest/v1/evaluations?team_id=eq.' + encodeURIComponent(teamId)
    + '&juror_id=eq.' + encodeURIComponent(session.userId)
    + '&submitted_at=not.is.null';
  const response = await fetch(url, {
    method:'PATCH',
    headers:{
      apikey:apiKey,
      Authorization:'Bearer '+session.token,
      'Content-Type':'application/json',
      Prefer:'return=representation'
    },
    body:JSON.stringify({submitted_at:null,updated_at:new Date().toISOString()}),
    cache:'no-store'
  });
  if (!response.ok)
    return NextResponse.json({error:'Bewertung konnte nicht erneut geöffnet werden.'},{status:502});
  const updated = await response.json() as Array<{id:string}>;
  if (updated.length !== 1)
    return NextResponse.json({error:'Die Bewertung war bereits zurückgenommen. Bitte neu laden.'},{status:409});
  return NextResponse.json({reopened:true},{headers:{'Cache-Control':'no-store'}});
}
