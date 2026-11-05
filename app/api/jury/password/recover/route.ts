import {NextResponse} from 'next/server';
// The jury deliberately uses administrator-issued temporary passwords.
// No automatic mail provider or public account enrollment is enabled.
export async function POST(){
 return NextResponse.json({
  error:'Bitte wenden Sie sich an die Wettbewerbsleitung. Dort erhalten Sie persönlich ein neues Startpasswort.'
 },{status:410,headers:{'Cache-Control':'no-store'}});
}
