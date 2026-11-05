import type { Metadata } from 'next';
import InformationPage from '../InformationPage';
export const metadata: Metadata = { title: 'Impressum | Jugend gründet · Landheim Ammersee' };
export default function Page() { return <InformationPage kind="impressum"/>; }
