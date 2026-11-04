'use client';

import {useState} from 'react';
import './JuryShowcase.css';
import {ArrowRight,ArrowUpRight,X} from 'lucide-react';

type JuryProfile = {
  name:string;
  role:string;
  perspective:string;
  initials:string;
  photo?:string;
  photoCredit?:string;
  biography:string;
  topics:string[];
  source?:string;
};

const members:JuryProfile[] = [
  {
    name:'Rüdiger Häusler',
    role:'Stiftungsleiter · Landheim Ammersee',
    perspective:'Bildung & Verantwortung',
    initials:'RH',
    photo:'https://www.landheim-ammersee.de/sites/default/files/media/images/landheim-ammersee-person-ruediger-haeusler.jpg',
    photoCredit:'Landheim Ammersee',
    biography:'Rüdiger Häusler leitet die Stiftung Landheim Ammersee seit 2016. Er steht für die Verbindung von unternehmerischer Verantwortung, Bildung und Persönlichkeitsentwicklung.',
    topics:['Schulentwicklung und Bildung','Verantwortung und Führung','Persönlichkeitsentwicklung'],
    source:'https://www.landheim-ammersee.de/de/ueber-das-landheim/leitung-und-organisation'
  },
  {
    name:'Dr. Holger Bingmann',
    role:'Unternehmer · Präsident ICC Germany',
    perspective:'Wirtschaft & internationaler Handel',
    initials:'HB',
    photo:'https://www.dnv-online.net/_data/Bingmann__Holger_2015.jpg',
    photoCredit:'DNV / Porträt Dr. Holger Bingmann',
    biography:'Dr. Holger Bingmann ist Unternehmer und Präsident von ICC Germany, dem deutschen Nationalkomitee der Internationalen Handelskammer. Er bringt Erfahrung aus Unternehmertum und internationalen Wirtschaftsbeziehungen ein.',
    topics:['Unternehmerische Praxis','Internationale Märkte','Geschäftsmodelle und Handel'],
    source:'https://www.iccgermany.de/ueber-icc-germany/'
  },
  {
    name:'Miriam Schmitter, PhD',
    role:'Managing Director · CF Private Equity',
    perspective:'Investment & Finanzierung',
    initials:'MS',
    photo:'https://www.cfprivateequity.com/hubfs/00%20Commonfund.org/05%20About/Our%20Teams/Headshots/miriam.schmitter.jpg',
    photoCredit:'CF Private Equity',
    biography:'Miriam Schmitter ist Managing Director bei CF Private Equity und verantwortet dort Buyout- und Wachstumsinvestitionen außerhalb der USA. Ihre Perspektive ergänzt die Jury um Fragen der Finanzierung und wirtschaftlichen Tragfähigkeit.',
    topics:['Investitionen und Finanzierung','Wachstumsstrategien','Wirtschaftliche Tragfähigkeit'],
    source:'https://www.cfprivateequity.com/team'
  },
  {
    name:'Sabine Walter',
    role:'Unternehmerin · Managementberaterin und Coach',
    perspective:'Führung & Kommunikation',
    initials:'SW',
    photo:'https://managementberatung-coaching.de/wp-content/uploads/unternehmerin_sabinewalter.webp',
    photoCredit:'Foto: Ruth Schmoldt',
    biography:'Sabine Walter begleitet als Unternehmerin, Managementberaterin und Executive Coach Menschen und Organisationen in ihrer Entwicklung. Beim Präsentationsseminar am 21. November unterstützt sie die Teams dabei, ihre Geschäftsideen überzeugend vorzustellen.',
    topics:['Präsentation und Auftritt','Körpersprache und Kommunikation','Unternehmensführung und Coaching'],
    source:'https://managementberatung-coaching.de/sabine-walter-executive-coach/'
  },
  {
    name:'Luise Bingmann',
    role:'Schülerin der Q13 · Landheim Ammersee',
    perspective:'Die junge Perspektive',
    initials:'LB',
    biography:'Luise Bingmann besucht die Q13 am Landheim Ammersee. Sie erweitert die Jury um den direkten Blick einer Schülerin auf die Verständlichkeit, Relevanz und Überzeugungskraft der Geschäftsideen.',
    topics:['Schülerperspektive','Kundennutzen aus Sicht junger Menschen','Überzeugende Ideen']
  },
  {
    name:'Daniel Zech',
    role:'Fachlehrer Wirtschaft und Recht · Projektleitung',
    perspective:'Wirtschaft & Gründungspädagogik',
    initials:'DZ',
    biography:'Daniel Zech unterrichtet Wirtschaft und Recht am Landheim Ammersee und begleitet die schulische Umsetzung von JUGEND GRÜNDET. Er verbindet fachliches Lernen, die Entwicklung von Geschäftsmodellen und die Organisation des Jurytages.',
    topics:['Wirtschaftliche Grundlagen','Projekt- und Gründungspädagogik','Organisation von JUGEND GRÜNDET']
  }
];

function Portrait({profile}:{profile:JuryProfile}) {
  return <div className="jury-showcase-image">
    <div aria-hidden="true" className="jury-showcase-initials">{profile.initials}</div>
    {profile.photo && <img
      src={profile.photo}
      alt={'Porträt von '+profile.name}
      loading="lazy"
      decoding="async"
      onError={(e)=>{e.currentTarget.style.display='none';}}
    />}
  </div>;
}

export default function JuryShowcase() {
  const [selected,setSelected]=useState<number|null>(null);
  const member=selected===null?null:members[selected];
  return <section className="jury-showcase" id="jury-vorstellung" aria-labelledby="jury-showcase-title">
    <div className="jury-showcase-inner">
      <div className="section-number">05 / UNSERE JURY</div>
      <div className="jury-showcase-intro">
        <div>
          <span className="jury-showcase-overline">JUGEND GRÜNDET · 15. JANUAR 2027</span>
          <h2 id="jury-showcase-title">Erfahrung trifft<br/><em>Gründergeist.</em></h2>
        </div>
        <p>Sechs Persönlichkeiten, unterschiedliche Perspektiven und ein gemeinsames Anliegen: die Ideen unserer jungen Unternehmerteams ernst nehmen, hinterfragen und mit konstruktivem Feedback begleiten.</p>
      </div>
      <div className="jury-showcase-grid">
        {members.map((p,i)=><article className={'jury-showcase-person '+(selected===i?'is-selected':'')} key={p.name}>
          <Portrait profile={p}/>
          <div className="jury-showcase-person-body">
            <span className="jury-showcase-perspective">{p.perspective}</span>
            <h3>{p.name}</h3>
            <p>{p.role}</p>
          </div>
          <button type="button" className="jury-showcase-open" aria-expanded={selected===i} aria-controls="jury-showcase-details" onClick={()=>setSelected(selected===i?null:i)}>
            <span>{selected===i?'Profil schließen':'Persönlichkeit entdecken'}</span><ArrowRight size={18} aria-hidden="true"/>
          </button>
        </article>)}
      </div>
      {member && <div id="jury-showcase-details" className="jury-showcase-details" aria-live="polite">
        <div className="jury-showcase-details-head">
          <div><span className="jury-showcase-overline">JURYPROFIL · FACHLICHE PERSPEKTIVE</span><h3>{member.name}</h3></div>
          <button type="button" className="jury-showcase-close" onClick={()=>setSelected(null)} aria-label="Juryprofil schließen"><X size={20}/></button>
        </div>
        <div className="jury-showcase-details-body">
          <p>{member.biography}</p>
          <div className="jury-showcase-detail-topics"><strong>Erfahrung und Expertise</strong><ul>{member.topics.map(t=><li key={t}>{t}</li>)}</ul></div>
        </div>
        <div className="jury-showcase-details-footer">
          <div>
            {member.source && <a href={member.source} target="_blank" rel="noopener noreferrer">Offizielles Profil <ArrowUpRight size={14}/></a>}
            {member.photoCredit && <small>{member.photoCredit}</small>}
          </div>
          <button type="button" onClick={()=>setSelected((selected!+1)%members.length)}>Nächstes Jurymitglied <ArrowRight size={15}/></button>
        </div>
      </div>}
      <div className="jury-showcase-reserve">
        <span className="jury-showcase-reserve-monogram">MB</span>
        <div><span className="jury-showcase-overline">ERSATZMITGLIED</span><h3>Matthias Bangert</h3><p>Schulleiter der Gymnasien und stellvertretender Stiftungsleiter des Landheim Ammersee</p></div>
      </div>
      <div className="jury-showcase-note">
        <span className="jury-showcase-overline">DER WETTBEWERBSTAG</span>
        <h3>Große Ideen verdienen gute Fragen.</h3>
        <p>Im Mittelpunkt der Jurybewertung stehen die Präsentationen unserer neun Teams und ihre Antworten auf die Fragen der Jury. Individuelle Bewertungsbögen bleiben im geschützten Juryportal.</p>
      </div>
    </div>
  </section>;
}
