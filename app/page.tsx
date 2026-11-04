import HomeClient from './HomeClient';
import {getPublicTeams} from '../lib/supabase-public';

export default async function Home() {
  let publishedTeams: Awaited<ReturnType<typeof getPublicTeams>> = [];
  try {
    publishedTeams = await getPublicTeams();
  } catch (error) {
    console.error('Public team loading failed', error);
  }
  return <HomeClient publishedTeams={publishedTeams}/>;
}
