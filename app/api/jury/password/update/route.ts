import {NextResponse} from 'next/server';
// Replaced by /api/jury/password/change, which uses a verified login session
// and an admin-managed initial-password flag. Legacy email-token changes
// cannot bypass the compulsory first-login flow.
export async function POST(){
 return NextResponse.json({
  error:'Diese Passwortfunktion wurde abgelöst. Bitte melden Sie sich mit dem Startpasswort an.'
 },{status:410,headers:{'Cache-Control':'no-store'}});
}
