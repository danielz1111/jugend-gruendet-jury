import Link from 'next/link';
import type {Metadata} from 'next';
import './jury.css';

export const metadata:Metadata={
 title:'Unsere Jury | Jugend gründet 2027 – Landheim Ammersee',
 description:'Die Jury des Jugend-gründet-Wettbewerbs am Landheim Ammersee am 15. Januar 2027.',
 robots:{index:false,follow:false}
};

type Member={name:string;category:string;role:string;bio:string;more:string;photo?:string;source?:string;credit?:string;focus?:string};
const jury:Member[]=[
 {name:'Rüdiger Häusler',category:'Bildung & Führung',role:'Stiftungsleiter · Landheim Ammersee',bio:'Rüdiger Häusler leitet seit 2016 die Stiftung Landheim Schondorf. Er bringt Erfahrung in Führung, Bildungsentwicklung und der Förderung junger Menschen in den Wettbewerb ein.',more:'Seine Perspektive verbindet die Geschäftsideen der Teams mit Eigenverantwortung, unternehmerischer Haltung und persönlicher Entwicklung.',photo:'https://www.landheim-ammersee.de/sites/default/files/styles/image_free__600_0/public/media/images/rhaeusler_noch_kleinerer_ausschnitt.jpg?itok=nXUxh4ig',source:'https://www.landheim-ammersee.de/de/ueber-das-landheim/leitung-und-organisation',credit:'Landheim Ammersee'},
 {name:'Dr. Holger Bingmann',category:'Unternehmertum & Welthandel',role:'Unternehmer · Präsident von ICC Germany',bio:'Dr. Holger Bingmann ist Unternehmer und Präsident von ICC Germany. Seine Erfahrung umfasst Unternehmensführung, Wirtschaftsverbände und internationalen Handel.',more:'In der Jury bringt er den Blick auf Marktchancen, wirtschaftliche Tragfähigkeit und die überzeugende Darstellung einer Unternehmensidee ein.',photo:'https://www.worldpolicyconference.com/wp-content/uploads/2021/08/bingmann_holger.jpg',source:'https://www.iccgermany.de/',credit:'World Policy Conference',focus:'center 28%'},
 {name:'Miriam Schmitter, PhD',category:'Investitionen & Wachstum',role:'Managing Director · CF Private Equity',bio:'Miriam Schmitter verantwortet internationale Buyout- und Wachstumsinvestitionen außerhalb der USA. Sie verfügt über fundierte Erfahrung bei der Beurteilung und Entwicklung von Unternehmen.',more:'Ihre Schwerpunkte sind Investmentauswahl, Due Diligence, Unternehmensbewertung und Wachstumsstrategien.',photo:'https://www.commonfund.org/hubfs/00%20Commonfund.org/05%20About/Our%20Teams/Headshots/miriam.schmitter.jpg',source:'https://www.cfprivateequity.com/team',credit:'CF Private Equity'},
 {name:'Sabine Walter',category:'Unternehmertum & Kommunikation',role:'Unternehmerin · Managementberaterin · Executive Coach',bio:'Sabine Walter ist Unternehmerin, Managementberaterin und ICF-zertifizierter Executive Coach. Seit 2008 begleitet sie Unternehmen und Führungskräfte in strategischen und persönlichen Entwicklungsprozessen.',more:'Sie verbindet wirtschaftliche Erfahrung mit Expertise in Führung, Kommunikation und überzeugendem Auftreten. Sabine Walter engagiert sich zudem im Elternbeirat des Landheims.',photo:'https://managementberatung-coaching.de/wp-content/uploads/unternehmerin_sabinewalter-768x1152.webp',source:'https://managementberatung-coaching.de/sabine-walter-executive-coach/',credit:'Ruth Schmoldt / Sabine Walter',focus:'center 23%'},
 {name:'Luise Bingmann',category:'Perspektive der Schülerschaft',role:'Schülerin der Q13 · Landheim Ammersee',bio:'Als Schülerin der Q13 bringt Luise Bingmann die Sicht der älteren Schülerschaft in die Jury ein und ergänzt die Perspektiven aus Wirtschaft und Schule.',more:'Ihr Blickwinkel ergänzt die Jury um die Frage, ob Geschäftsideen verständlich, nachvollziehbar und überzeugend vorgestellt werden.'},
 {name:'Daniel Zech',category:'Projektleitung & Wirtschaft',role:'Lehrer für Wirtschaft und Recht · Projektleitung Jugend gründet',bio:'Daniel Zech begleitet die Unternehmerteams im Unterricht und verantwortet die Organisation des Gründungswettbewerbs am Landheim Ammersee.',more:'Er verbindet wirtschaftliches Fachwissen mit der Förderung selbstständigen unternehmerischen Denkens und bringt die wirtschaftsdidaktische Perspektive in die Jury ein. Das freigegebene, eigene Porträt wird vor Veröffentlichung ergänzt.'}
];
const reserve:Member={name:'Matthias Bangert',category:'Ersatzmitglied',role:'Schulleiter und stellvertretender Stiftungsleiter · Landheim Ammersee',bio:'Matthias Bangert gehört zur Schulleitung des Landheims und steht als Ersatzmitglied für die Jury zur Verfügung.',more:'',photo:'https://www.landheim-ammersee.de/sites/default/files/styles/image_free__600_0/public/media/images/matthias-bangert_0.jpg?itok=QQngzOIy',source:'https://www.landheim-ammersee.de/de/ueber-das-landheim/leitung-und-organisation',credit:'Landheim Ammersee'};
function Portrait({person}:{person:Member}){
  const initials=person.name.replace(/^Dr\. /,'').split(/\s+/).filter(Boolean).map(s=>s[0]).slice(0,2).join('');
  return <div className="ji-photo">
    <span className="ji-initials" aria-hidden>{initials}</span>
    {person.photo && <img src={person.photo} alt={'Porträt: '+person.name} loading="lazy" referrerPolicy="no-referrer" style={{objectPosition:person.focus||'center 25%'}} />}
    <span className="ji-photo-label">{person.photo?'Porträt · Freigabe offen':'Foto wird nach Freigabe ergänzt'}</span>
  </div>
}
function Profile({person}:{person:Member}){
  return <article className="ji-card">
    <Portrait person={person}/>
    <div className="ji-card-body">
      <span className="ji-label">{person.category}</span>
      <h3>{person.name}</h3><strong className="ji-role">{person.role}</strong>
      <p>{person.bio}</p>
      <details><summary>Mehr erfahren <span>+</span></summary><div className="ji-more">{person.more}
        {person.source&&<p><a target="_blank" rel="noopener noreferrer" href={person.source}>Berufliches Profil / Fotoquelle ↗</a></p>}
      </div></details>
    </div>
  </article>
}
export default function JuryPage(){
 return <main className="ji">
   <div className="ji-approval">INTERNER FREIGABEENTWURF · Bild- und Textfreigaben stehen aus · Keine allgemeine Veröffentlichung</div>
   <header className="ji-top"><Link href="/" className="ji-brand"><span className="ji-mark">L</span><span><small>LANDHEIM AMMERSEE</small><strong>JUGEND GRÜNDET</strong></span></Link><nav><Link href="/">Startseite</Link><a href="#mitglieder">Unsere Jury</a><a href="#ersatz">Ersatzjury</a><Link href="/jury">Juryportal ↗</Link></nav></header>
   <section className="ji-hero"><div className="ji-kicker">JUGEND GRÜNDET 2026/27 · LANDHEIM AMMERSEE</div><h1>Unsere Jury.<br/><em>Erfahrung trifft auf Ideen.</em></h1><p>Sechs Persönlichkeiten. Unterschiedliche Perspektiven. Ein gemeinsames Ziel: Junge Menschen ermutigen, unternehmerisch zu denken und ihre Ideen überzeugend zu präsentieren.</p></section>
   <div className="ji-metrics"><span><b>06</b> feste Jurymitglieder</span><span><b>09</b> Unternehmerteams</span><span><b>15.01.</b> Pitch-Tag 2027</span></div>
   <section id="mitglieder" className="ji-main"><div className="ji-eyebrow">01 / Die Jurymitglieder</div><h2>Menschen, die Ideen<br/><em>weiterdenken.</em></h2><p className="ji-intro">Unternehmerische Erfahrung, wirtschaftliche Expertise, Kommunikation und die Perspektive der Schülerschaft kommen hier zusammen.</p><div className="ji-grid">{jury.map(p=><Profile key={p.name} person={p}/>)}</div></section>
   <section id="ersatz" className="ji-reserve"><div><div className="ji-eyebrow">02 / Ersatzmitglied</div><h2>Zusätzliche<br/><em>Unterstützung.</em></h2></div><div className="ji-reserve-inner"><Portrait person={reserve}/><div className="ji-reserve-content"><div className="ji-eyebrow">{reserve.category}</div><h3>{reserve.name}</h3><strong>{reserve.role}</strong><p>{reserve.bio}</p><a target="_blank" rel="noopener noreferrer" href={reserve.source}>Profil auf der Landheim-Website ↗</a></div></div></section>
   <section className="ji-end"><div className="ji-kicker">DER WETTBEWERBSTAG</div><h2>Neun Teams.<br/>Ein Nachmittag voller Ideen.</h2><p>Freitag, 15. Januar 2027 · Vortragssaal · 13:15–17:30 Uhr<br/>Gemeinsames Mittagessen im Landheim auf Wunsch ab 12:25 Uhr.</p><Link href="/">Zur Veranstaltungsübersicht ↗</Link></section>
   <aside className="ji-release"><b>Hinweis zur Freigabe:</b> Die Jury-Seite ist noch kein zur Veröffentlichung freigegebener Inhalt. Fünf Porträts werden zur Layoutprüfung von den angegebenen externen beruflichen Profilseiten geladen. Die Fotorechte und Einwilligungen müssen vor Veröffentlichung geprüft werden. Das Porträt von Daniel Zech liegt für die spätere Einbindung vor; für Luise Bingmann wird erst nach entsprechender Freigabe ein Porträt ergänzt.</aside>
   <footer className="ji-footer"><b>LANDHEIM AMMERSEE × JUGEND GRÜNDET</b><span>Jury · Freigabeentwurf 2026/27</span></footer>
 </main>
}