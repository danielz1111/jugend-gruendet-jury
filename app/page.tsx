import HomeClient from './HomeClient';
import {getPublicTeams} from '../lib/supabase-public';

export default async function Home() {
  let publishedTeams: Array<{id:string;name:string;position:number}> = [];
  try {
    publishedTeams = await getPublicTeams();
  } catch (error) {
    console.error('Public team loading failed', error);
  }
  return <HomeClient publishedTeams={publishedTeams}/>;
}
