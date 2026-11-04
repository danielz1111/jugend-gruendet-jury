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
  biographyAdditional?:string[];
  topics:string[];
  source?:string;
};

const members:JuryProfile[] = [
  {
    name:'Rüdiger Häusler',
    role:"Stiftungsleiter · Landheim Ammersee",
    perspective:"Bildung, Führung & Verantwortung",
    initials:'RH',
    photo:'https://www.landheim-ammersee.de/sites/default/files/media/images/landheim-ammersee-person-ruediger-haeusler.jpg',
    photoCredit:'Landheim Ammersee',
    biography:"Rüdiger Häusler leitet seit 2016 die Stiftung Landheim Ammersee. In dieser Funktion verantwortet er die Entwicklung einer Schule, die akademische Bildung mit Persönlichkeitsentwicklung, Gemeinschaft und eigenverantwortlichem Handeln verbindet.",
    biographyAdditional:["Zuvor war er rund 15 Jahre an der Schule Schloss Salem tätig und übernahm dort verschiedene Leitungsfunktionen in der Internatspädagogik. Als Dozent und Ausbilder engagierte er sich zudem in unterschiedlichen Bereichen handlungsorientierter Bildung und begleitet unter anderem das Pilotprojekt „Klassenzimmer auf der Alm“ als ehrenamtlicher pädagogischer Leiter.","Seit 2025 steht er der Internate Vereinigung als Vorsitzender vor. In diesem Zusammenhang setzt er sich für moderne, kompetenzorientierte Internats- und Schulbildung ein und bringt die Perspektive eines überregionalen Netzwerks unabhängiger Internate ein.","Auch am Landheim ist die Verbindung von Unterricht, außerschulischem Lernen und gesellschaftlicher Verantwortung ein zentraler Bestandteil seines Bildungsverständnisses. Bei „Jugend gründet“ interessiert ihn insbesondere, wie Schülerinnen und Schüler Verantwortung übernehmen, kooperieren und Ideen aus eigener Initiative in die Praxis übertragen."],
    topics:["Stiftungsführung und Schulentwicklung","Internatspädagogik und kompetenzorientierte Bildung","Verantwortung, Teamarbeit und Initiative","Handlungsorientiertes Lernen"],
    source:"https://www.die-internate-vereinigung.de/arbeitskreise-und-fachgruppen/vorstand-und-geschaeftsstelle/"
  },
  {
    name:'Dr. Holger Bingmann',
    role:"Unternehmer · Präsident ICC Germany",
    perspective:"Unternehmertum & internationaler Handel",
    initials:'HB',
    photo:'https://www.dnv-online.net/_data/Bingmann__Holger_2015.jpg',
    photoCredit:'DNV / Porträt Dr. Holger Bingmann',
    biography:"Dr. Holger Bingmann ist Unternehmer, promovierter Betriebswirt und Präsident von ICC Germany, dem deutschen Nationalkomitee der Internationalen Handelskammer. Seine Laufbahn verbindet Unternehmensführung, internationalen Handel, Digitalisierung und wirtschaftspolitische Verbandsarbeit.",
    biographyAdditional:["Nach seinem Studium der Betriebswirtschaftslehre an der Ludwig-Maximilians-Universität München und seiner Promotion an der Freien Universität Berlin war er zunächst für Daimler-Benz in Brüssel tätig. Anschließend übernahm er Führungsaufgaben im Presse- und Medienvertrieb und baute unternehmerische Aktivitäten in den Bereichen Handel, Medien und Logistik aus.","Als langjähriger geschäftsführender Gesellschafter der MELO-Gruppe sammelte er umfassende Erfahrung beim Aufbau und der Weiterentwicklung von Geschäftsmodellen. Von 2017 bis 2020 war er Präsident des Bundesverbandes Großhandel, Außenhandel, Dienstleistungen (BGA); darüber hinaus engagiert er sich in internationalen Wirtschaftsorganisationen.","Mit der Mitgründung der Digital Business University of Applied Sciences setzte er auch Impulse in der digitalen Wirtschaftsbildung. In der Jugend-gründet-Jury steht er für den Praxisblick auf Marktchancen, Unternehmensstrategie, internationale Perspektiven und die Fähigkeit, eine Idee unter realen Wettbewerbsbedingungen umzusetzen."],
    topics:["Unternehmerische Führung und Geschäftsmodelle","Internationaler Handel und Märkte","Digitalisierung und Innovation","Wirtschaftliche Umsetzbarkeit"],
    source:"https://www.iccgermany.de/magazin-post/icc-und-digitalisierung-bingmann//"
  },
  {
    name:'Miriam Schmitter, PhD',
    role:"Managing Director · CF Private Equity",
    perspective:"Investitionen, Finanzierung & Wachstum",
    initials:'MS',
    photo:'https://www.cfprivateequity.com/hubfs/00%20Commonfund.org/05%20About/Our%20Teams/Headshots/miriam.schmitter.jpg',
    photoCredit:'CF Private Equity',
    biography:"Miriam Schmitter, PhD, ist Managing Director bei CF Private Equity in München und leitet dort den Bereich Buyout- und Wachstumsinvestitionen außerhalb der USA. Sie gehört dem Investment Committee sowie der Senior Executive Group des Unternehmens an.",
    biographyAdditional:["Ihr fachlicher Schwerpunkt liegt in der Prüfung und Auswahl von Beteiligungsinvestitionen, im Aufbau von Portfolios und in der Begleitung von Private-Equity-Programmen. Dazu zählen Primärfonds, Sekundärmarkttransaktionen und Co-Investments. Auch an Strategien in den Bereichen Venture Capital und Real Assets wirkt sie mit.","Vor ihrer heutigen Tätigkeit war sie Managing Director und Leiterin der internationalen Private-Equity-Research bei Cambridge Associates in London. Zuvor arbeitete sie im Private-Equity-Umfeld von Allianz Private Equity Partners und Deutsche Bank sowie in der Finanzanalyse und Due Diligence bei Deloitte & Touche.","Sie studierte Betriebswirtschaftslehre an der Universität Mannheim und promovierte an der Technischen Universität Darmstadt. Für „Jugend gründet“ bringt sie einen analytischen Blick darauf mit, wie aus überzeugenden Geschäftsideen wirtschaftlich belastbare, finanzierbare und langfristig tragfähige Vorhaben entstehen."],
    topics:["Private Equity und Wachstumsinvestitionen","Investitionsanalyse und Due Diligence","Finanzierung und Portfolioaufbau","Wirtschaftliche Tragfähigkeit"],
    source:"https://www.cfprivateequity.com/team"
  },
  {
    name:'Sabine Walter',
    role:"Unternehmerin · Managementberaterin & Executive Coach",
    perspective:"Führung, Kommunikation & Entwicklung",
    initials:'SW',
    photo:'https://managementberatung-coaching.de/wp-content/uploads/unternehmerin_sabinewalter.webp',
    photoCredit:'Foto: Ruth Schmoldt',
    biography:"Sabine Walter ist Unternehmerin, Managementberaterin und ICF-zertifizierter Executive Coach. Sie berät mittelständische Unternehmen und Führungskräfte zu Unternehmensentwicklung, Veränderungsprozessen, Führungswirksamkeit und wirkungsvoller Kommunikation.",
    biographyAdditional:["Nach ihrem betriebswirtschaftlichen Studium in Deutschland und Frankreich übernahm sie unterschiedliche Fach- und Führungsaufgaben in der Industrie. Besonders prägend war ihre Tätigkeit im Turnaround-Management bei arvato services, einem Unternehmen des Bertelsmann-Konzerns, wo sie Teams durch anspruchsvolle Veränderungsprozesse führte.","Seit 2008 ist sie selbstständig unternehmerisch tätig und führt das Netzwerk „netzwerk managementberatung | coaching“. Eine Ausbildung zum Business Coach, Trainer und Moderator schloss sie 2008 ab; seit 2013 ist sie ICF-zertifizierte Coach. In ihrer Beratung verbindet sie strategisches Denken mit der Entwicklung von Teams und Führungspersönlichkeiten.","Ihr besonderes Interesse gilt der Frage, wie Menschen überzeugend auftreten und komplexe Inhalte verständlich vermitteln. Im Umfeld von „Jugend gründet“ unterstützt sie die Schülerinnen und Schüler dabei, ihre Geschäftsideen strukturiert zu präsentieren, sicher aufzutreten und kritische Rückfragen konstruktiv aufzugreifen."],
    topics:["Unternehmensführung und Transformation","Executive Coaching und Teamentwicklung","Präsentation, Stimme und Körpersprache","Souveräner Umgang mit kritischen Fragen"],
    source:"https://managementberatung-coaching.de/sabine-walter-executive-coach/"
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
    role:"Wirtschaftspädagoge (M.Sc.) · Initiator & Projektleiter",
    perspective:"Wirtschaftspädagogik & Entrepreneurship",
    initials:'DZ',
    photo:'/images/d-zech-portrait.webp',
    photoCredit:'Porträt: privat',
    biography:"Daniel Zech ist Wirtschaftspädagoge (M.Sc.) und Lehrkraft für Wirtschaft und Recht sowie Wirtschaftsinformatik am Landheim Ammersee. Er studierte an der Ludwig-Maximilians-Universität München mit Schwerpunkten in Management, Personalentwicklung und empirischer Bildungsforschung.",
    biographyAdditional:["In seiner mit 1,0 bewerteten Masterarbeit entwickelte und überprüfte er eigenständig ein empirisches Messinstrument zur Erfassung interreligiöser Kompetenzen. Dazu nutzte er probabilistische Testtheorie, das Rasch-Modell sowie statistische Analysen mit R und Acer ConQuest. Sein wissenschaftlicher Schwerpunkt verbindet Theorieentwicklung, Testkonstruktion und empirische Kompetenzmessung.","Seine berufliche Laufbahn umfasst Tätigkeiten in Wirtschaft und öffentlicher Verwaltung sowie langjährige Unterrichtserfahrung an allgemeinbildenden und beruflichen Schulen. Zudem war er über viele Jahre Mitglied kaufmännischer Prüfungsausschüsse der IHK München und Oberbayern und wirkte damit an der Beurteilung beruflicher Kompetenzen mit.","Am Landheim initiierte er „Jugend gründet“ und begleitet die jungen Gründerteams von der Entwicklung ihrer Geschäftsideen über die Businessplanung bis zum Pitch vor einer externen Fachjury. Weitere Schwerpunkte seiner Arbeit sind der Börsenclub und das W-Seminar „Börse hautnah“. Sein Ansatz verbindet fundierte wirtschaftliche Bildung mit unternehmerischer Praxis und eigenverantwortlichem Handeln."],
    topics:["Wirtschaftspädagogik und Entrepreneurship","Empirische Bildungsforschung und Rasch-Modell","Wirtschafts- und Finanzbildung","IHK-Prüfungspraxis und Projektleitung"],
    source:undefined
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
          <div className="jury-showcase-biography"><p>{member.biography}</p>{member.biographyAdditional?.map((paragraph,i)=><p key={i}>{paragraph}</p>)}</div>
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
