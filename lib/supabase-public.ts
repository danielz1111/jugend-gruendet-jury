/** Server-side Supabase REST access. Never import this module into a client component. */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/**
 * Read publicly approved teams only. The database's RLS is the final
 * authorization boundary; this function deliberately uses the anon key.
 * Do not use service-role credentials here.
 */
export async function getPublicTeams(): Promise<Array<{
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  position: number;
}>> {
  if (!url || !anonKey) return [];
  const response = await fetch(
    `${url.replace(/\/$/, '')}/rest/v1/teams?select=id,name,tagline,description,position&is_public=eq.true&order=position.asc`,
    {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      next: { revalidate: 60 },
    }
  );
  if (!response.ok) throw new Error('Could not load public teams');
  return response.json();
}
