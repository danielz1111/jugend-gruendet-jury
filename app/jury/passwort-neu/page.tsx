import '../JuryPassword.css';
import Link from 'next/link';
import {KeyRound,ArrowLeft} from 'lucide-react';
export default function PasswortNeuHinweis(){
 return <main className="jury-password-page">
  <header className="jury-password-header"><Link href="/">LANDHEIM AMMERSEE · JUGEND GRÜNDET</Link></header>
  <section className="jury-password-card">
   <span className="jury-password-eyebrow"><KeyRound size={16}/> PERSÖNLICHER JURYZUGANG</span>
   <h1>Persönliches Passwort festlegen</h1>
   <p>Sie erhalten von der Wettbewerbsleitung ein eigenes Startpasswort.
    Melden Sie sich damit im Juryportal an. Danach werden Sie automatisch
    zur sicheren Vergabe Ihres persönlichen Passworts weitergeleitet.</p>
   <Link href="/jury" className="jury-password-back"><ArrowLeft size={17}/> Zur Jury-Anmeldung</Link>
  </section>
 </main>;
}
