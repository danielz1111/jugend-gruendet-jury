import '../JuryPassword.css';
import Link from 'next/link';
import {ArrowLeft,KeyRound,LockKeyhole} from 'lucide-react';

export default function PasswortHilfe(){
 return <main className="jury-password-page">
  <header className="jury-password-header">
   <Link href="/">LANDHEIM AMMERSEE · JUGEND GRÜNDET</Link>
   <span>Juryportal</span>
  </header>
  <section className="jury-password-card">
   <span className="jury-password-eyebrow"><LockKeyhole size={15}/> GESCHÜTZTER JURYZUGANG</span>
   <h1>Passwort vergessen?</h1>
   <p>Für Ihr Jurykonto erhalten Sie von der Wettbewerbsleitung ein persönliches Startpasswort.
    Bitte kontaktieren Sie die Wettbewerbsleitung über Ihre bekannte schulische Kontaktadresse,
    wenn Sie Ihr Passwort vergessen haben.</p>
   <p><KeyRound size={17}/> Die Wettbewerbsleitung kann Ihr Passwort zurücksetzen.
    Anschließend melden Sie sich mit dem neuen Startpasswort an und legen sofort
    wieder ein eigenes Passwort fest.</p>
   <p>Sie benötigen dafür weder ein eigenes Gmail-Konto noch eine automatische Passwort-E-Mail.</p>
   <Link href="/jury" className="jury-password-back"><ArrowLeft size={17}/> Zur Jury-Anmeldung</Link>
  </section>
 </main>;
}
