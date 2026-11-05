import type { Metadata } from 'next';
import { LegalPage } from '../LegalInformation';

export const metadata: Metadata = { title: 'Impressum | Jugend gründet am Landheim Ammersee' };
export default function Page() { return <LegalPage topic="impressum" />; }
