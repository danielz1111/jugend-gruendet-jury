import type { Metadata } from 'next';
import { LegalPage } from '../LegalInformation';

export const metadata: Metadata = { title: 'Kontakt | Jugend gründet am Landheim Ammersee' };
export default function Page() { return <LegalPage topic="kontakt" />; }
