import Link from 'next/link';
import InformationContent, { informationTitles, type InformationKind } from './InformationContent';
import './Information.css';
export default function InformationPage({ kind }: { kind: InformationKind }) {
  return <main className="lm-info-page"><div className="lm-info-page-inner">
    <Link className="lm-info-back" href="/">← Zurück zur Startseite</Link>
    <article className="lm-info-paper"><header className="lm-info-header"><div><span>LANDHEIM AMMERSEE · JUGEND GRÜNDET</span><h1>{informationTitles[kind]}</h1></div></header><div className="lm-info-body"><InformationContent kind={kind}/></div></article>
    <nav className="lm-info-page-nav" aria-label="Weitere Informationen">{(Object.keys(informationTitles) as InformationKind[]).map(item => <Link key={item} href={'/' + item} aria-current={item === kind ? 'page' : undefined}>{informationTitles[item]}</Link>)}</nav>
  </div></main>;
}
