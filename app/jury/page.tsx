import {redirect} from 'next/navigation';
import {getJurySession} from '../../lib/jury-session';
import JuryLoginClient from './JuryLoginClient';

export const dynamic='force-dynamic';

export default async function JuryEntry(){
 const session=await getJurySession();
 if(session)redirect('/jury/dashboard');
 return <JuryLoginClient/>;
}
