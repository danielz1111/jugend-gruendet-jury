'use client';
import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,FileText,Users,Presentation,LockKeyhole} from 'lucide-react';
import {teamProfiles} from '../../../lib/company-profiles';
type Team={id:string;name:string;position:number;tagline:string|null;description:string|null;jury_photo_path:string|null};
type Member={id:string;team_id:string;display_name:string;expert_role:string|null;display_order:number};
type Score={team_id:string;[key:string]:string|number|null};
const criteria=[{"key":"expert_a_score","name":"A · Markt und Zielgruppe","weight":10},{"key":"expert_b_score","name":"B · Marketing und Vertrieb","weight":10},{"key":"expert_c_score","name":"C · Finanzen und Wirtschaftlichkeit","weight":10},{"key":"expert_d_score","name":"D · Umsetzung und Realisierbarkeit","weight":10},{"key":"expert_e_score","name":"E · Organisation und Rechtsform","weight":10},{"key":"presentation_impact_score","name":"Überzeugungskraft der Präsentation","weight":20},{"key":"questions_quality_score","name":"Fachliche Qualität der Antworten","weight":10},{"key":"questions_confidence_score","name":"Souveränität und Sicherheit","weight":10},{"key":"questions_reasoning_score","name":"Argumentation und Reaktionsfähigkeit","weight":10}] as const;
const hints:Record<string,string>={
 expert_a_score:'Sind Zielgruppe, Kundenproblem und Markt nachvollziehbar beschrieben?',
 expert_b_score:'Ist klar, wie das Produkt bekannt gemacht und verkauft werden soll?',
 expert_c_score:'Sind Kosten, Preisgestaltung, Finanzierung und Ertrag plausibel?',
 expert_d_score:'Ist die Umsetzung technisch und organisatorisch realistisch?',
 expert_e_score:'Sind Aufgabenverteilung, Organisation und Rechtsform nachvollziehbar?',
 presentation_impact_score:'Ist der Pitch verständlich, überzeugend, gut strukturiert und adressatengerecht?',
 questions_quality_score:'Werden die gestellten Fragen fachlich korrekt und konkret beantwortet?',
 questions_confidence_score:'Reagiert das Team ruhig, sicher und respektvoll auf Nachfragen?',
 questions_reasoning_score:'Werden Aussagen schlüssig begründet und Einwände überzeugend aufgegriffen?'
};
const slimpowerReview=[["Das Kundenproblem und Wettbewerber Baseus/INIU werden genannt.","Konkrete Wettbewerber und ein verständliches Alltagsproblem.","Breite Zielgruppe; Marktgröße und Validierung nicht ausreichend ausgewertet.","Welche Ergebnisse zeigen echte Kaufbereitschaft?",2],["Eigener Onlineshop und Elektronikgeschäfte; Slogan und Werbegrafik vorhanden.","Slogan, Werbemotiv und Vertriebskanäle sind benannt.","Werbebudget und konkrete Kundengewinnung fehlen.","Wie gewinnt ihr eure ersten 100 Kunden?",2],["50.000 € Gründungskosten; Umsatz- und Absatzplanung im dritten Jahr nicht belastbar ausgefüllt.","Kapitalbedarf wird genannt.","Kosten nicht aufgeschlüsselt; Preis, Umsatz und Gewinn nicht nachvollziehbar.","Wie setzen sich die 50.000 € zusammen?",1],["Bestehende MagSafe-Powerbank mit eigenem, möglicherweise 3D-gedrucktem Gehäuse.","Greifbarer Prototypansatz durch Nutzung vorhandener Technik.","Messwerte für Dicke, Ladeleistung und Sicherheitsnachweise fehlen.","Was ist messbar besser als bei der Konkurrenz?",2],["Teamaufgaben und mögliche externe Entwicklungs- und Prüfpartner werden genannt.","Externe technische und sicherheitsbezogene Anforderungen erkannt.","Partnerzusagen, Zeitplan und Rechtsform nicht belegt.","Welche Partner wurden tatsächlich kontaktiert?",2]] as const;
const missing='An dieser Stelle noch keine Angaben vorhanden.';
const expertEvidence:Record<string,Partial<Record<'A'|'B'|'C'|'D'|'E',[string|null,string|null,string|null,string|null]>>>={"alpinex":{"A":["Problem der unterbrochenen Orientierung auf Skipisten, Informationsbedarf zu Wetter, Pisten und Liften sowie zwei Zielgruppen (Wintersportler und Skigebiete) sind beschrieben.","Problem, Anwendungssituation und zwei Kundengruppen sind nachvollziehbar benannt.","Belegquellen zum Bedarf, Marktgröße und eigene Validierung fehlen.","Wie groß ist die zahlungsbereite Zielgruppe und wie wurde der Bedarf überprüft?"],"B":["Verkauf der Skibrille, Premium-App-Funktionen und Kooperationsgebühren von Skigebieten sind als Einnahmequellen genannt. Eine App mit Pisten-, Schnee- und Liftinformationen wird beschrieben.","Mehrere mögliche Einnahmequellen und ein klarer Nutzungskontext sind vorhanden.","Konkurrenzanalyse, belegte Differenzierung und konkreter Marketing- beziehungsweise Vertriebsplan fehlen.","Welche Informationen erhält die Brille zuverlässig in Echtzeit und wie unterscheidet sich das von bestehenden Ski-Apps?"],"C":[null,null,null,null],"D":["Vernetzte Skibrille und App mit Anzeige von Wetter, Pistenstatus und Liftinformationen sind als Produktkonzept beschrieben.","Die Kernfunktion des geplanten Produkts wird verständlich erläutert.","Technische Umsetzung, Datenquellen, Funktionsnachweis und Prototyp sind nicht ausgearbeitet.","Wie werden aktuelle Lift- und Pistendaten technisch in das Sichtfeld übertragen?"],"E":[null,null,null,null]},"akkuwakku":{"A":["Kurze Smartphone-Akkulaufzeiten und sperrige Powerbanks werden als Problem beschrieben; angesprochen werden Menschen mit intensiver Handynutzung.","Alltagsproblem und potenzielle Nutzer sind benannt.","Bedarfsbelege, Marktgröße und eigene Kundenvalidierung fehlen.","Wie viele potenzielle Kunden wünschen sich gerade eine Akkuhülle statt einer Powerbank?"],"B":["Eine schlanke Handyhülle mit integriertem Akku wird vorgeschlagen. Als Geschäftsmodell steht bislang nur „Family Abo“; eine Werbegrafik wurde eingereicht.","Produktidee und Werbegrafik sind vorhanden.","Abo-Leistungen, Preis, Vertrieb und systematischer Wettbewerbsvergleich fehlen.","Was genau erhalten Kunden beim Family-Abo und warum würden sie regelmäßig bezahlen?"],"C":[null,null,null,null],"D":["Das Team nennt einen integrierten Akku und ein möglichst leichtes, schmales Gehäuse als Merkmale.","Gewünschte Produkteigenschaften sind benannt.","Technische Nachweise, Maße, Kapazität, Sicherheit und Prototyp fehlen.","Wie viel Zusatzkapazität lässt sich bei der gewünschten geringen Dicke realisieren?"],"E":[null,null,null,null]},"clickwatch":{"A":["Der Businessplan beschreibt den Konflikt zwischen Smartwatch-Funktionen und klassischem Uhrendesign. Er nennt differenzierte Zielgruppen und verweist auf Bitkom-Studien sowie eine eigene Validierungsanlage.","Kundensituation, Zielgruppensegmente und Quellen sind vergleichsweise ausführlich dokumentiert.","Die Aussagekraft der eigenen Validierung muss anhand der gesonderten Anlage geprüft werden.","Welche konkreten Ergebnisse der eigenen Validierung belegen die Kaufbereitschaft zum geplanten Preis?"],"B":["Starterset 349 €, Analogblatt 149 €, weitere Designblätter und Armbänder 39 € sowie App-Abo 24 € jährlich sind genannt. Vertrieb über eigenen Shop und Juweliere ist vorgesehen; Wettbewerber wie Withings werden verglichen.","Preisstruktur, Zusatzverkäufe, Vertriebskanäle und Wettbewerber sind konkret beschrieben.","Ob die Abgrenzung technisch und wirtschaftlich tragfähig ist, ist noch nachzuweisen.","Warum sollten Käufer Clickwatch statt einer bestehenden Hybriduhr wählen?"],"C":["Der Plan nennt 307.000 € Finanzierungsbedarf, davon 61.400 € Eigenmittel und 90.000 € Kickstarter. Investitions-, Kosten- und Umsatzpositionen für das dritte Jahr sind aufgeführt.","Konkrete Finanzierungsquellen, Beträge und Umsatzannahmen sind dokumentiert.","Finanzierungszusagen und die Belastbarkeit der Absatzprognosen sind nicht nachgewiesen.","Welche Annahmen stützen die geplanten Stückzahlen und was geschieht bei geringeren Verkäufen?"],"D":["Modulares Gehäuse mit Pulssensor, austauschbarem Digital- und Analogblatt sowie Bluetooth, Akku und Bewegungssensorik wird detailliert beschrieben; mehrere Visualisierungen sind eingereicht.","Aufbau, Austauschprinzip und Produktvarianten werden anschaulich erläutert.","Ein funktionsfähiger technischer Nachweis beziehungsweise Prototyp ist aus den Unterlagen nicht belegt.","Wie bleibt die kontinuierliche Messung beim Wechsel des Zifferblatts zuverlässig erhalten?"],"E":["Teamaufgaben, externe Entwicklungsbedarfe, Material- und Nachhaltigkeitsüberlegungen sowie mögliche zukünftige Module sind beschrieben.","Organisation, Partnerbedarf und Zukunftsperspektiven werden konkret angesprochen.","Externe Partnerschaften und die Realisierbarkeit der Entwicklungsplanung sind noch nicht belegt.","Welche Entwicklungsschritte übernimmt das Team selbst, und welche müssen verbindlich extern vergeben werden?"]},"fridgebuddy":{"A":["Lebensmittelverschwendung, Doppelkäufe und Essensplanung werden als Probleme beschrieben. Zielgruppen umfassen junge Erwachsene, Berufstätige, Familien und preisbewusste Haushalte; eine Destatis-Quelle wird genannt.","Problem und verschiedene Nutzungssituationen sind nachvollziehbar ausgearbeitet.","Eine eigene Validierung und belastbare Nachfragezahlen für die konkrete App fehlen.","Wie wurde geprüft, ob Nutzer ihre Lebensmittel tatsächlich regelmäßig in der App erfassen?"],"B":["Kostenlose Basisversion und Premium-Abo mit 4,99 € monatlich sind genannt. Der Vertrieb soll über App-Stores erfolgen; Vorrats- und Rezept-Apps werden als Konkurrenz beschrieben.","Preismodell, Vertriebskanal und bestehende Alternativen sind erkennbar.","Werbekonzept und nachgewiesene Zahlungsbereitschaft für das Premium-Abo fehlen.","Welchen Mehrwert bietet die Bezahlversion gegenüber kostenlosen Alternativen?"],"C":[null,null,null,null],"D":["Bestandserfassung manuell oder per Barcode, Erinnerungen, KI-Rezepte und Einkaufslisten sind beschrieben; spätere Sensorintegration ist vorgesehen.","Funktionsumfang und Erweiterungsideen sind konkret erläutert.","Technischer Prototyp, Aufwand und zuverlässige Datenerfassung sind nicht belegt.","Wie verhindert die App fehlerhafte Bestandsdaten, wenn Nutzer Entnahmen nicht eintragen?"],"E":["Der Businessplan benennt technische Unterstützung für Programmierung, Datenbank und KI; außerdem Nachhaltigkeit durch weniger Lebensmittelabfälle und spätere Erweiterungen.","Externer Unterstützungsbedarf und ökologische Zielsetzung werden benannt.","Eine verbindliche Partnerzusage und ein konkreter Umsetzungszeitplan fehlen.","Welche Kernfunktionen lassen sich ohne externe Partner tatsächlich zuerst umsetzen?"]},"musikcares":{"A":[null,null,null,null],"B":["Im Steckbrief werden Helmkopfhörer sowie Produktverkauf, Werbung und Sponsorenkooperationen genannt.","Grundidee und mögliche Einnahmequellen sind benannt.","Zielgruppen, Konkurrenz, Preise, Vertriebsweg und Belege fehlen.","Wer ist der erste konkrete Käufer und wie soll er erreicht werden?"],"C":[null,null,null,null],"D":["Das Team beschreibt Kopfhörer, die sich in unterschiedlichen Helmen befestigen lassen sollen.","Ein Produktansatz ist vorhanden.","Technische Befestigung, Sicherheit, Kompatibilität und Prototyp sind nicht beschrieben.","Wie wird eine sichere Befestigung in verschiedenen Helmmodellen gewährleistet?"],"E":[null,null,null,null]},"nexorasecurity":{"A":["Das Team nennt verlorene Schlüssel als Anlass für eine Fingerabdruck-Schließlösung.","Ein konkretes Alltagsproblem wird im Ideensteckbrief angesprochen.","Eine gesonderte Problemanalyse, Zielgruppe und Kundenvalidierung fehlen.","Für welche Nutzergruppe ist das Verlieren von Schlüsseln besonders relevant?"],"B":[null,null,null,null],"C":[null,null,null,null],"D":["Das Öffnen von Türen und Schlössern per Fingerabdruck ist als Kernfunktion genannt.","Die grundlegende Produktfunktion ist verständlich.","Technische Umsetzung, Sicherheit, Ausfallszenarien und Prototyp fehlen.","Wie lässt sich das Schloss bei Stromausfall oder nicht erkanntem Fingerabdruck öffnen?"],"E":[null,null,null,null]},"pastein":{"A":[null,null,null,null],"B":["Der Verkauf einer Zahnbürste und austauschbarer Zahnpastapatronen wird als Einnahmequelle beschrieben.","Ein wiederkehrender Verkauf von Verbrauchsmaterial ist als Geschäftsansatz erkennbar.","Preise, Vertrieb, Zielgruppe, Werbung und Konkurrenzanalyse fehlen.","Wie teuer sollen Bürste und Patronen sein und warum würden Kunden wechseln?"],"C":[null,null,null,null],"D":["Die Zahnbürste soll eine austauschbare Zahnpastapatrone besitzen und Zahnpasta per Knopfdruck abgeben.","Die Bedienidee ist im Steckbrief verständlich erklärt.","Technische Funktionsweise, Hygiene, Patronenwechsel und Prototyp fehlen.","Wie wird die Zahnpasta hygienisch und zuverlässig bis zum Bürstenkopf transportiert?"],"E":[null,null,null,null]},"packzack":{"A":[null,null,null,null],"B":[null,null,null,null],"C":[null,null,null,null],"D":[null,null,null,null],"E":[null,null,null,null]}};

const gradeGuide='1–2: kaum erfüllt · 3–4: eher schwach · 5–6: teilweise erfüllt · 7–8: gut erfüllt · 9–10: hervorragend erfüllt';
type Material={id:string;title:string;original_filename:string;media_type:string;created_at:string};
type Progress={submitted_count:number;total_jurors:number;others_average:number|null;own_submitted:boolean};
export default function TeamNavigator({teams,members,initialScores,isAdmin,initialSection='pitch',adminMode=false,activeTeamId=null,onGoToRating}:{teams:Team[];members:Member[];initialScores:Score[];isAdmin:boolean;initialSection?:'overview'|'business'|'pitch'|'company';adminMode?:boolean;activeTeamId?:string|null;onGoToRating?:()=>void}){
 const [selected,setSelected]=useState(0);
 useEffect(()=>{if(activeTeamId){const index=teams.findIndex(t=>t.id===activeTeamId);if(index>=0)setSelected(index);}},[activeTeamId,teams]);
 const [enlargedImage,setEnlargedImage]=useState<Material|null>(null);
 useEffect(()=>{if(!enlargedImage)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setEnlargedImage(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[enlargedImage]);
 const [mainTab,setMainTab]=useState<'overview'|'business'|'pitch'|'company'>(initialSection);
 // Top-level portal navigation changes this mode without remounting the score editor.
 useEffect(()=>{setMainTab(initialSection)},[initialSection]);
 const [expertTab,setExpertTab]=useState('A');
 const [attachmentTab,setAttachmentTab]=useState('all');
 const expertSections=[{id:'A',label:'A · Markt und Zielgruppe'},{id:'B',label:'B · Marketing und Vertrieb'},{id:'C',label:'C · Finanzen und Wirtschaftlichkeit'},{id:'D',label:'D · Umsetzung und Realisierbarkeit'},{id:'E',label:'E · Organisation und Rechtsform'}];
 const attachmentSections=[{id:'all',label:'Alle Anlagen'},{id:'A',label:'A · Markt'},{id:'B',label:'B · Marketing'},{id:'C',label:'C · Finanzen'},{id:'D',label:'D · Umsetzung'},{id:'E',label:'E · Organisation'}];
 const attachmentCategory=(m:Material)=>{
  const name=(m.title+' '+m.original_filename).toLowerCase();
  if(/umfrage|validier|markt|zielgruppe|wettbewerb/.test(name))return 'A';
  if(/werbung|marketing|vertrieb|social|plakat/.test(name))return 'B';
  if(/kalkulat|finanz|kosten|preis|umsatz|bilanz|tabelle/.test(name))return 'C';
  if(/visualis|produkt|prototyp|herstell|umsetz/.test(name))return 'D';
  if(/organis|rechtsform|team|aufgaben/.test(name))return 'E';
  return 'other';
 };

 const [materials,setMaterials]=useState<Record<string,Material[]>>({});
 const [materialsError,setMaterialsError]=useState<Record<string,string>>({});
 const [uploading,setUploading]=useState(false);
 const [zipMessage,setZipMessage]=useState('');
 async function uploadZip(teamId:string,form:HTMLFormElement){
  setUploading(true);setZipMessage('');
  try{
   const data=new FormData(form);data.set('team_id',teamId);
   const response=await fetch('/api/jury/materials/zip',{method:'POST',body:data});
   const result=await response.json() as {error?:string;imported?:number;replaced?:number;skipped?:number;errors?:string[];suggested_profile?:{team_id:string;source_filename:string|null;tagline:string|null;description:string|null}|null};
   if(!response.ok)throw new Error(result.error||'ZIP-Import fehlgeschlagen');
   if(result.suggested_profile)window.dispatchEvent(new CustomEvent('jury:profile-suggestion',{detail:result.suggested_profile}));
   setZipMessage((result.imported||0)+' neue Dateien, '+(result.replaced||0)+' vorhandene Versionen ersetzt.'+(result.suggested_profile?' Neue Profilangaben wurden erkannt: oben in der Teamverwaltung prüfen.':'')+(result.errors?.length?' Fehler: '+result.errors.join('; '):''));
   if(!result.errors?.length)form.reset();
   await loadMaterials(teamId);
  }catch(e){setZipMessage(e instanceof Error?e.message:'ZIP-Import fehlgeschlagen');}
  finally{setUploading(false);}
 }


 async function uploadAllZips(files:FileList|null){
  if(!files?.length)return;
  setUploading(true);setZipMessage('');
  const normalized=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
  const aliases:Record<string,string>={alpinex:'alpinex',fridgebuddy:'fridgebuddy',musikcares:'musickares',packampzack:'packzack',pastein:'pastein',nexorasecurity:'nexorasecurity',clickwatch:'clickwatch',akkuwakku:'akkuwakku',slimpower:'slimpower'};
  const reports:string[]=[];
  try{
   for(const file of Array.from(files)){
    const filename=normalized(file.name.replace(/\.zip$/i,'').replace(/^businessplan/i,''));
    const lookup=aliases[filename]||filename;
    const match=teams.find(t=>normalized(t.name)===lookup);
    if(!match){reports.push(file.name+': kein eindeutiges Team gefunden, übersprungen');continue;}
    const data=new FormData();data.set('team_id',match.id);data.set('file',file);
    try{
     const response=await fetch('/api/jury/materials/zip',{method:'POST',body:data});
     const result=await response.json() as {error?:string;imported?:number;replaced?:number;skipped?:number;errors?:string[];suggested_profile?:{team_id:string;source_filename:string|null;tagline:string|null;description:string|null}|null};
     if(!response.ok)throw new Error(result.error||'Import fehlgeschlagen');
     if(result.suggested_profile)window.dispatchEvent(new CustomEvent('jury:profile-suggestion',{detail:result.suggested_profile}));
     reports.push(match.name+': '+(result.imported||0)+' neu, '+(result.replaced||0)+' aktualisiert'+(result.suggested_profile?', Profiltext-Vorschlag erkannt':'')+(result.errors?.length?', Fehler: '+result.errors.join('; '):''));
     await loadMaterials(match.id);
    }catch(e){reports.push(match.name+': FEHLER – '+(e instanceof Error?e.message:'Import fehlgeschlagen'));}
    setZipMessage(reports.join(' | '));
   }
  }finally{setUploading(false);}
 }

 async function loadMaterials(teamId:string){
  try{
   const response=await fetch('/api/jury/materials?team_id='+encodeURIComponent(teamId),{cache:'no-store'});
   if(!response.ok)throw new Error('Unterlagen nicht verfügbar');
   const rows=await response.json() as Material[];
   setMaterials(old=>({...old,[teamId]:rows}));
   setMaterialsError(old=>({...old,[teamId]:''}));
  }catch{setMaterialsError(old=>({...old,[teamId]:'Unterlagen konnten nicht geladen werden.'}));}
 }
 async function uploadMaterial(teamId:string,form:HTMLFormElement){
  const data=new FormData(form);data.set('team_id',teamId);
  setUploading(true);setMaterialsError(old=>({...old,[teamId]:''}));
  try{
   const response=await fetch('/api/jury/materials',{method:'POST',body:data});
   if(!response.ok){const error=await response.json() as {error?:string};throw new Error(error.error||'Upload fehlgeschlagen');}
   form.reset();await loadMaterials(teamId);
  }catch(error){setMaterialsError(old=>({...old,[teamId]:error instanceof Error?error.message:'Upload fehlgeschlagen'}));}
  finally{setUploading(false);}
 }

 const [notes,setNotes]=useState<Record<string,string>>({});
 const [notesLoaded,setNotesLoaded]=useState<Record<string,boolean>>({});
 const [notesError,setNotesError]=useState<Record<string,string>>({});
 const [notesSaving,setNotesSaving]=useState<Record<string,boolean>>({});
 const noteKey=(teamId:string,memberId:string|null)=>teamId+':'+(memberId||'team');
 async function loadNotes(teamId:string){
  try{
   const response=await fetch('/api/jury/notes?team_id='+encodeURIComponent(teamId),{cache:'no-store'});
   if(!response.ok)throw new Error('Notizen konnten nicht geladen werden');
   const rows=await response.json() as Array<{member_id:string|null;content:string}>;
   setNotes(old=>({...old,...Object.fromEntries(rows.map(n=>[noteKey(teamId,n.member_id),n.content]))}));
   setNotesLoaded(old=>({...old,[teamId]:true}));
   setNotesError(old=>({...old,[teamId]:''}));
  }catch{setNotesError(old=>({...old,[teamId]:'Notizen konnten nicht geladen werden.'}));}
 }
 async function saveNote(teamId:string,memberId:string|null){
  const key=noteKey(teamId,memberId);
  setNotesSaving(old=>({...old,[key]:true}));
  setNotesError(old=>({...old,[key]:''}));
  try{
   const response=await fetch('/api/jury/notes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({team_id:teamId,member_id:memberId,content:notes[key]||''})});
   if(!response.ok)throw new Error('Speichern fehlgeschlagen');
  }catch{setNotesError(old=>({...old,[key]:'Speichern fehlgeschlagen. Bitte erneut versuchen.'}));}
  finally{setNotesSaving(old=>({...old,[key]:false}));}
 }

 const [released,setReleased]=useState<Record<string,boolean>>(()=>Object.fromEntries(initialScores.map(s=>[s.team_id,Boolean(s.submitted_at)])));
 const [releasing,setReleasing]=useState(false);
 const [releaseError,setReleaseError]=useState('');
 async function release(teamId:string){
  setReleasing(true);setReleaseError('');
  try{
   const response=await fetch('/api/jury/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({team_id:teamId})});
   if(!response.ok){const data=await response.json() as {error?:string};throw new Error(data.error||'Freigabe fehlgeschlagen');}
   setReleased(old=>({...old,[teamId]:true}));await refreshProgress(teamId);
  }catch(error){setReleaseError(error instanceof Error?error.message:'Freigabe fehlgeschlagen');}
  finally{setReleasing(false);}
 }

 const [progress,setProgress]=useState<Record<string,Progress>>({});
 const [progressError,setProgressError]=useState<Record<string,boolean>>({});
 async function refreshProgress(teamId:string){try{const r=await fetch('/api/jury/progress?team_id='+encodeURIComponent(teamId),{cache:'no-store'});if(!r.ok)throw Error('Progress');const p=await r.json() as Progress;setProgress(old=>({...old,[teamId]:p}));setProgressError(old=>({...old,[teamId]:false}));}catch{setProgressError(old=>({...old,[teamId]:true}));}}
 useEffect(()=>{if(teams[selected]){void refreshProgress(teams[selected].id);void loadNotes(teams[selected].id);void loadMaterials(teams[selected].id);}},[selected,teams]);
 const [scores,setScores]=useState<Record<string,Record<string,number>>>(()=>Object.fromEntries(initialScores.map(s=>[s.team_id,Object.fromEntries(criteria.filter(c=>s[c.key]!==null).map(c=>[c.key,s[c.key] as number]))])));
 const [status,setStatus]=useState<Record<string,'open'|'saving'|'saved'|'error'>>({});
 const [pending,setPending]=useState<Record<string,number>>({});
 async function save(teamId:string,field:string,value:number){
  const id=teamId+':'+field;
  setStatus(old=>({...old,[id]:'saving'}));
  try{
   const response=await fetch('/api/jury/score',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({team_id:teamId,field,score:value})});
   if(!response.ok)throw new Error('Speichern fehlgeschlagen');
   setScores(old=>({...old,[teamId]:{...(old[teamId]||{}),[field]:value}}));
   setStatus(old=>({...old,[id]:'saved'}));
   setPending(old=>{const next={...old};delete next[id];return next});
   void refreshProgress(teamId);
  }catch{setStatus(old=>({...old,[id]:'error'}))}
 }
 if(!teams.length)return <section className="demo-score"><h2>Teamdaten noch nicht eingerichtet</h2><p>In Supabase ist derzeit kein Unternehmerteam für die Jury sichtbar. Bitte zunächst die vorbereitete Teamnamen-Migration ausführen. Es werden keine Demo-Teams als echte Daten ausgegeben.</p></section>;
 const team=teams[selected];
 const isReleased=Boolean(released[team.id]);
 const teamMembers=members.filter(m=>m.team_id===team.id);
 const isFour=teamMembers.length===4;
 const isSlimpower=team.name.toLowerCase().replace(/[^a-z]/g,'')==='slimpower';
 const review=slimpowerReview['ABCDE'.indexOf(expertTab)];
 const profile=teamProfiles.find(p=>p.key===team.name.toLowerCase().replace(/[^a-z]/g,''));
 const baseEvidence=expertEvidence[profile?.key||'']?.[expertTab as 'A'|'B'|'C'|'D'|'E'];
 const combinedEvidence=expertEvidence[profile?.key||'']?.E;
 const evidence=isFour&&expertTab==='D'&&combinedEvidence?([0,1,2,3].map(i=>[baseEvidence?.[i],combinedEvidence?.[i]].filter(Boolean).join(' ')||null) as [string|null,string|null,string|null,string|null]):baseEvidence;
 const profileFields=[profile?.idea,profile?.problem,profile?.solution,profile?.audience,profile?.model];
 const completedFields=profileFields.filter(Boolean).length;
 const productImage=(materials[team.id]||[]).find(m=>m.media_type.startsWith('image/')&&/visualis|produkt/i.test(m.title+' '+m.original_filename));
 const activeCriteria=criteria.filter(c=>!(isFour&&c.key==='expert_e_score'));
 const weightFor=(key:string)=>isFour&&key.startsWith('expert_')?12.5:criteria.find(c=>c.key===key)?.weight??0;
 return <div className="demo-shell jury-wide-shell" style={{minHeight:600,marginTop:24,border:'1px solid #e4e0d9'}}>
 <nav className="jury-team-picker" aria-label="Unternehmerteam auswählen"><div className="jury-team-picker-head"><span className="demo-overline">DIE NEUN UNTERNEHMERTEAMS</span><span>Team auswählen · Profil und Unterlagen öffnen sich direkt</span></div><div className="jury-team-grid">{teams.map((t,i)=><button type="button" key={t.id} className={selected===i?'jury-team-tile active':'jury-team-tile'} aria-pressed={selected===i} onClick={()=>{setSelected(i);setExpertTab('A');setAttachmentTab('all');if(!adminMode)setMainTab(initialSection)}}><small>{String(t.position).padStart(2,'0')}</small><span className="jury-team-photo" aria-hidden="true">{t.jury_photo_path?<img src={'/api/jury/team-photo/'+t.id} alt="" loading="lazy"/>:<Users size={18}/>}</span><strong>{t.name}</strong><ArrowRight size={16}/></button>)}</div></nav>
 <section className="demo-main">
 {initialSection!=='company'&&<nav aria-label="Bereiche des ausgewählten Unternehmens" style={{display:'flex',flexWrap:'wrap',gap:10,padding:'18px 20px 0'}}>
 {([{id:'pitch',label:'01 · Jurybewertung'},{id:'overview',label:'02 · Unternehmensprofil'},{id:'business',label:'03 · Unterlagen'}] as const).map(tab=><button key={tab.id} type="button" aria-current={mainTab===tab.id?'page':undefined} onClick={()=>setMainTab(tab.id)} style={{border:'1px solid #cbd5df',borderRadius:9,padding:'11px 15px',fontWeight:700,background:mainTab===tab.id?'#173d53':'#fff',color:mainTab===tab.id?'#fff':'#173d53'}}>{tab.label}</button>)}
 </nav>}
 <style>{`
 @keyframes juryReveal{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
 @keyframes juryFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
 @keyframes juryStar{0%{opacity:0;transform:scale(.5)}75%{transform:scale(1.16)}100%{opacity:1;transform:scale(1)}}
 .jury-reveal{animation:juryReveal .6s ease both}
 .jury-star{display:inline-block;animation:juryStar .38s ease both}
 .jury-card{transition:transform .2s ease,box-shadow .2s ease}
 .jury-card:hover{transform:translateY(-3px);box-shadow:0 12px 32px #173d5319}
 @media(prefers-reduced-motion:reduce){.jury-reveal,.jury-star{animation:none!important}.jury-card{transition:none!important}}
 `}</style>
 <div className="demo-heading" style={{alignItems:'center'}}>
 <div><span className="demo-overline">JUGEND GRÜNDET · UNTERNEHMERTEAM {String(team.position).padStart(2,'0')} / {String(teams.length).padStart(2,'0')}</span><h1 style={{fontSize:'clamp(2.3rem,5vw,3.7rem)',letterSpacing:'-.045em',margin:'10px 0'}}>{team.name}</h1><p style={{fontSize:'1.1rem',fontStyle:profile?.slogan?'italic':'normal'}}>{team.tagline||profile?.slogan||'Junge Geschäftsidee im Wettbewerb'}</p><p className="jury-team-elevator">{team.description||profile?.idea||'Das Unternehmensprofil wird nach Vorliegen weiterer Angaben ergänzt.'}</p></div>
 <div className="demo-pagination"><button disabled={selected===0} onClick={()=>{setSelected(v=>v-1);setExpertTab('A');setAttachmentTab('all')}} aria-label="Vorheriges Team"><ArrowLeft size={18}/></button><button disabled={selected===teams.length-1} onClick={()=>{setSelected(v=>v+1);setExpertTab('A');setAttachmentTab('all')}} aria-label="Nächstes Team"><ArrowRight size={18}/></button></div></div>
 {!adminMode&&mainTab!=='overview'&&mainTab!=='company'&&<button type="button" onClick={()=>setMainTab('overview')} className="jury-profile-switch"><Users size={16}/> Unternehmensprofil ansehen <ArrowRight size={16}/></button>}
 {!adminMode&&(mainTab==='overview'||mainTab==='company')&&<div id={mainTab==='company'?'jury-company-profile':undefined} key={team.id} className="jury-reveal" style={{display:'grid',gap:22,marginTop:20}}>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:20,alignItems:'center',padding:'clamp(18px,3vw,34px)',borderRadius:18,background:'linear-gradient(125deg,#102f43,#214c61)',color:'#fff'}}>
 <div><span style={{fontSize:11,letterSpacing:2,textTransform:'uppercase',opacity:.75}}>Die Geschäftsidee</span><h2 style={{fontSize:'clamp(1.4rem,3vw,2.15rem)',lineHeight:1.22,margin:'14px 0',color:'#fff'}}>{team.description||profile?.idea||missing}</h2><p style={{opacity:.82,lineHeight:1.6,fontSize:13}}>{team.description?'Kurzbeschreibung aus dem Teamprofil.':'Grundlage: eingereichter Businessplan · keine ergänzten Angaben'}</p></div>
 <div style={{minHeight:210,display:'grid',placeItems:'center',border:'1px solid #ffffff40',borderRadius:14,overflow:'hidden',background:'#ffffff12'}}>
 {productImage?<img src={'/api/jury/materials/'+productImage.id} alt={productImage.title} style={{width:'100%',maxHeight:300,objectFit:'contain'}}/>:<div style={{padding:25,textAlign:'center',opacity:.82}}><FileText size={36} style={{margin:'0 auto 12px'}}/><p>Original-Produktbild noch nicht hinterlegt</p></div>}
 </div></div>
 <div style={{padding:'18px 22px',border:'1px solid #e4e0d9',borderRadius:13,background:'#fff'}}>
 <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}><strong>Angaben im Unternehmensprofil</strong><span style={{fontSize:13,color:'#526471'}}>{completedFields} von 5 Bereichen mit Angaben</span></div>
 <div role="progressbar" aria-valuenow={completedFields} aria-valuemin={0} aria-valuemax={5} aria-label="Vorhandene Profilangaben" style={{height:9,background:'#e9edf0',borderRadius:20,overflow:'hidden',margin:'14px 0 9px'}}><div style={{height:'100%',width:(completedFields/5*100)+'%',background:'#b88a38',transformOrigin:'left',animation:'juryFill 1.1s ease-out both',borderRadius:20}}/></div>
 <p style={{fontSize:12,color:'#647581',margin:0}}>Dokumentationsstand, keine Leistungsbewertung. Fehlende Inhalte werden nicht mit null Punkten bewertet.</p>
 </div>
 <div><h2 style={{fontSize:22,marginBottom:15}}>Das Unternehmen auf einen Blick</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
 {([{label:'Kundenproblem',value:profile?.problem},{label:'Die Lösung',value:profile?.solution},{label:'Zielgruppe',value:profile?.audience},{label:'Geschäftsmodell',value:profile?.model}] as const).map((item,i)=><div key={item.label} className="jury-reveal" style={{animationDelay:(i*.12)+'s',padding:20,border:'1px solid #e4e0d9',borderRadius:12,background:'#fff',minHeight:140}}><span style={{fontSize:11,letterSpacing:1.1,textTransform:'uppercase',color:'#617481',fontWeight:700}}>{item.label}</span><p style={{marginTop:13,lineHeight:1.6,color:item.value?'#173d53':'#73808a'}}>{item.value||missing}</p></div>)}
 </div></div>
 <div className="jury-company-team-list"><h2 style={{fontSize:22,marginBottom:15}}>Wer gehört zum Unternehmen?</h2>
 <p>Teammitglieder und ihre Expertenbereiche.</p>
 <div className="jury-company-members">{teamMembers.length?teamMembers.map(member=><article key={member.id}><span className="jury-company-member-avatar" aria-hidden="true"><Users size={21}/></span><div><strong>{member.display_name}</strong><small>{member.expert_role||'Unternehmerteam'}</small></div></article>):<p>Die Mitglieder werden nach Erfassung hier angezeigt.</p>}</div>
 </div>
 <div><h2 style={{fontSize:22,marginBottom:15}}>Unterlagen und Jurybewertung</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:16}}>
 <button type="button" className="jury-card" onClick={()=>{if(mainTab==='company')document.getElementById('jury-company-materials')?.scrollIntoView({behavior:'smooth'});else setMainTab('business')}} style={{padding:25,textAlign:'left',border:'1px solid #d7dee2',borderRadius:14,background:'#fff',cursor:'pointer',display:'grid',gap:13,color:'#173d53'}}><FileText size={30}/><strong style={{fontSize:21}}>Businessplan</strong><span style={{lineHeight:1.55,color:'#60707c'}}>Expertenbereiche, fachliche Einordnung, Stärken, offene Fragen und Originalunterlagen.</span><span style={{fontWeight:700}}>Businessplan öffnen →</span></button>
 <button type="button" className="jury-card" onClick={()=>{if(mainTab==='company'&&onGoToRating)onGoToRating();else setMainTab('pitch')}} style={{padding:25,textAlign:'left',border:'1px solid #d7dee2',borderRadius:14,background:'#fff',cursor:'pointer',display:'grid',gap:13,color:'#173d53'}}><Presentation size={30}/><strong style={{fontSize:21}}>Pitch &amp; Juryfragen</strong><span style={{lineHeight:1.55,color:'#60707c'}}>Präsentation und Antworten bewerten sowie persönliche Jury-Notizen festhalten.</span><span style={{fontWeight:700}}>Zur Jurybewertung →</span></button>
 </div></div></div>}
 {!adminMode&&(mainTab==='business'||mainTab==='company')&&<div id={mainTab==='company'?'jury-company-materials':undefined} className="demo-score" style={{marginTop:12}}>
 <h2>Geschäftsidee</h2>
 <p>{profile?.idea||missing}</p>
 <h3 style={{marginTop:28}}>Expertenbereiche A–E</h3>
 <p>Die fachliche Einordnung erfolgt ausschließlich anhand eingereichter Angaben. Fehlende Inhalte bleiben ausdrücklich unbewertet.</p>
 <div style={{display:'grid',gridTemplateColumns:'1fr',gap:7,margin:'16px 0',maxWidth:440}}>{expertSections.filter(x=>!(isFour&&x.id==='E')).map(x=><button key={x.id} type="button" aria-pressed={expertTab===x.id} onClick={()=>setExpertTab(x.id)} style={{padding:'10px 12px',textAlign:'left',borderRadius:7,background:expertTab===x.id?'#173d53':'#eef1f2',color:expertTab===x.id?'white':'#173d53'}}>{isFour&&x.id==='D'?'D/E · Umsetzung & Organisation':x.label}</button>)}</div>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,300px),1fr))',gap:14,marginTop:16}}>
 <div style={{border:'1px solid #d8d4cd',borderRadius:9,padding:15,background:'#fff'}}>
 <h3>{isFour&&expertTab==='D'?'D/E · Umsetzung und Organisation':expertSections.find(x=>x.id===expertTab)?.label}</h3>
 <p>{isSlimpower?review[0]:(evidence?.[0]||missing)}</p>
 {isSlimpower?<p style={{color:'#a16a16',fontSize:20}} aria-label={review[4]+' von 5 Sternen'}>{[1,2,3,4,5].map((n)=><span className="jury-star" key={n} style={{animationDelay:(n*.12)+'s'}}>{n<=review[4]?'★':'☆'}</span>)} <span style={{fontSize:12,color:'#667480'}}>Vorläufig · {review[4]}/5</span></p>:<p style={{color:'#687b86',fontSize:13}}>☆☆☆☆☆ · Nicht bewertet – noch keine geprüfte Einschätzung</p>}
 </div>
 <div style={{display:'grid',gap:10}}>
 <div style={{background:'#eff9f2',border:'1px solid #a8d5ba',padding:14,borderRadius:9}}><strong style={{color:'#17633c'}}>Besonders stark</strong><p>{isSlimpower?review[1]:(evidence?.[1]||'Noch nicht beurteilbar – '+missing)}</p></div>
 <div style={{background:'#fff7e9',border:'1px solid #e6c58c',padding:14,borderRadius:9}}><strong style={{color:'#875513'}}>Schwachstellen und offene Fragen</strong><p>{isSlimpower?review[2]:(evidence?.[2]||'Noch nicht beurteilbar – '+missing)}</p></div>
 <div style={{background:'#f0f6fa',border:'1px solid #cddce5',padding:14,borderRadius:9}}><strong>Mögliche Juryfrage</strong><p>{isSlimpower?review[3]:(evidence?.[3]||'Noch nicht beurteilbar – '+missing)}</p></div>
 </div></div>
 <h3 style={{marginTop:24}}>Vollständiger Businessplan</h3>
 {(materials[team.id]||[]).filter(m=>m.media_type==='application/pdf').length?<ul>{(materials[team.id]||[]).filter(m=>m.media_type==='application/pdf').map(m=><li key={m.id}><button type="button" className="jury-pdf-open" onClick={()=>setEnlargedImage(m)}>{m.title} · PDF hier ansehen</button></li>)}</ul>:<p>Der vollständige Businessplan ist im geschützten Portal noch nicht hinterlegt.</p>}
 <h3 style={{marginTop:30}}>Produkt- und Werbematerial · Bildanlagen</h3>
 <p>Originalbilder des Teams. Zum Vergrößern ein Bild anklicken.</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14}}>
 {(materials[team.id]||[]).filter(m=>m.media_type.startsWith('image/')&&/visualis|produkt|werbung|marketing/i.test(m.title+' '+m.original_filename)).map(m=><button key={m.id} type="button" onClick={()=>setEnlargedImage(m)} style={{padding:0,textAlign:'left',border:'1px solid #d8d4cd',borderRadius:8,overflow:'hidden',background:'white',cursor:'zoom-in'}}><img src={'/api/jury/materials/'+m.id} alt={m.title} loading="lazy" style={{width:'100%',height:220,objectFit:'contain',background:'#f5f3ee'}}/><span style={{display:'block',padding:10,fontWeight:600}} >{m.title} · Ansehen</span></button>)}
 </div>
 <h3 style={{marginTop:24}}>Weitere Anlagen</h3>
 <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'14px 0'}}>{attachmentSections.filter(x=>!(isFour&&x.id==='E')).map(x=><button key={x.id} type="button" aria-pressed={attachmentTab===x.id} onClick={()=>setAttachmentTab(x.id)} style={{padding:'9px 12px',borderRadius:7,background:attachmentTab===x.id?'#173d53':'#eef1f2',color:attachmentTab===x.id?'white':'#173d53'}}>{isFour&&x.id==='D'?'D/E · Umsetzung & Organisation':x.label}</button>)}</div>
 {(()=>{const items=(materials[team.id]||[]).filter(m=>m.media_type!=='application/pdf'&&!/visualis|produkt|werbung|marketing/i.test(m.title+' '+m.original_filename)&&(attachmentTab==='all'||attachmentCategory(m)===attachmentTab||(isFour&&attachmentTab==='D'&&attachmentCategory(m)==='E')));
 return items.length?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14}}>{items.map(m=><button type="button" key={m.id} onClick={()=>setEnlargedImage(m)} style={{display:'block',border:'1px solid #d8d4cd',borderRadius:8,overflow:'hidden',color:'inherit',textDecoration:'none'}}>{m.media_type.startsWith('image/')&&<img src={'/api/jury/materials/'+m.id} alt={m.title} loading="lazy" style={{width:'100%',height:170,objectFit:'contain',background:'#f5f3ee'}}/>}<span style={{display:'block',padding:10,fontWeight:600,fontSize:13}}>{m.title} · Vergrößern</span></button>)}</div>:<p>{materials[team.id]===undefined?'Anlagen werden geladen …':'In dieser Kategorie sind noch keine Anlagen hinterlegt.'}</p>})()}
 </div>}
 {isAdmin&&adminMode&&mainTab==='overview'&&<div className="demo-score" style={{marginTop:22}}>
 <h2>Administration · Alle Teamunterlagen importieren</h2>
 <p>Mehrere ZIP-Dateien gleichzeitig auswählen. Die Zuordnung erfolgt ausschließlich bei eindeutigem Teamnamen im Dateinamen; nicht zuordenbare Dateien werden übersprungen. Dateien mit gleichem Namen werden durch die neuere Version ersetzt. Slogan und Geschäftsidee können aus dem neuen Businessplan als Vorschlag erkannt werden.</p>
 <input type="file" accept=".zip,application/zip" multiple disabled={uploading} aria-label="Mehrere Team-ZIP-Dateien auswählen" onChange={event=>{void uploadAllZips(event.currentTarget.files);event.currentTarget.value='';}}/>
 {uploading&&<p role="status">ZIP-Dateien werden nacheinander importiert …</p>}
 {zipMessage&&<p role="status" style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{zipMessage}</p>}
 </div>}
 {isAdmin&&adminMode&&mainTab==='business'&&<div className="demo-score" style={{marginTop:18}}>
 <h2>Administration · Teamunterlagen importieren</h2>
 <p>Eine ZIP-Datei mit Businessplan-PDF, Produktbildern, Werbung und weiteren Anlagen auswählen. Die Dateien werden automatisch dem aktuell ausgewählten Team zugeordnet. Bereits vorhandene Dateien mit gleichem Namen werden ersetzt. Erkannte Änderungen an Slogan und Geschäftsidee erscheinen zur Freigabe in der Teamverwaltung.</p>
 <form onSubmit={event=>{event.preventDefault();void uploadZip(team.id,event.currentTarget)}} style={{display:'grid',gap:12}}>
 <input type="file" name="file" accept=".zip,application/zip,application/x-zip-compressed" required aria-label="ZIP-Datei auswählen"/>
 <button type="submit" disabled={uploading} style={{padding:'12px 16px',background:'#173d53',color:'white',borderRadius:8}}>{uploading?'ZIP wird importiert …':'ZIP für '+team.name+' importieren'}</button>
 </form>
 {zipMessage&&<p role="status">{zipMessage}</p>}
 </div>}
 {isAdmin&&adminMode&&mainTab==='pitch'&&<div className="demo-score"><h2>Administration · Einzeldatei hochladen</h2>{isAdmin&&adminMode&&<form onSubmit={event=>{event.preventDefault();void uploadMaterial(team.id,event.currentTarget)}} style={{marginTop:18,padding:16,background:'#f7f8f9',borderRadius:8}}>
 <strong>Businessplan oder Bildanlage hochladen (Administration)</strong>
 <div style={{display:'grid',gap:10,marginTop:12}}>
 <input name="title" type="text" required maxLength={120} defaultValue="Businessplan" aria-label="Dokumenttitel" style={{padding:10}}/>
 <input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" aria-label="Businessplan als PDF auswählen"/>
 <button type="submit" disabled={uploading} style={{padding:'10px 16px',background:'#173d53',color:'white',borderRadius:6}}>{uploading?'Lädt hoch …':'Datei sicher hochladen'}</button>
 </div></form>}</div>}
{!adminMode&&mainTab==='pitch'&&<>

<section className="jury-assessment-lead"><div><span className="demo-overline">IHR JURYBOGEN · TEAM {String(team.position).padStart(2,'0')}</span><h2>Jetzt ist Ihr Urteil gefragt.</h2><p>Bewerten Sie den Auftritt und die fachlichen Aussagen dieses Teams während des Pitches und der anschließenden Fragerunde. Informationen zum Unternehmen und den Originalunterlagen finden Sie in den weiteren Registern.</p></div><span className="jury-assessment-status">{isReleased?'Verbindlich abgegeben':'Persönlicher Entwurf'}</span></section>
 <div className="demo-score jury-rating-focus" id="jury-rating-form">
 <div className="demo-score-heading"><h2>Jurybewertung · 1–10 Punkte</h2><span>AUTOMATISCHE SPEICHERUNG</span></div>
 <p style={{fontSize:13,color:'#667480'}}>Grau: offen · Gelb: speichert · Grün: gespeichert · Rot: Fehler</p>
 <p style={{fontSize:13,color:'#526575',lineHeight:1.6}}><strong>Bewertungsorientierung:</strong> {gradeGuide}</p>
 {activeCriteria.map((c,i)=>{
  const phaseHeader=i===0?<div style={{marginTop:22}}><h3>1 · Fachbereiche und Präsentation</h3><p>Während des Pitches</p></div>:i===(isFour?5:6)?<div style={{marginTop:24,borderTop:'2px solid #d9d4c9',paddingTop:14}}><h3>2 · Juryfragen</h3><p>Während der Fragerunde</p></div>:null;
  const id=team.id+':'+c.key;
  const saved=scores[team.id]?.[c.key];
  const current=pending[id]??saved;
  const state=status[id]||(saved!==undefined?'saved':'open');
  const color=state==='saved'?'#18794e':state==='saving'?'#9c6b16':state==='error'?'#b42318':'#77828b';
  return <div key={c.key}>{phaseHeader}<div style={{border:'1px solid '+color,borderRadius:8,padding:14,marginTop:12,background:state==='saved'?'#f0faf3':state==='saving'?'#fff9e9':state==='error'?'#fff3f2':'#f7f8f9'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><strong>{isFour&&c.key==='expert_d_score'?'D/E · Umsetzung, Organisation und Rechtsform':c.name}</strong><span style={{fontSize:12,color}}>{state==='saved'?'✓ Gespeichert':state==='saving'?'Speichert …':state==='error'?'Fehler':'Offen'}</span></div>
   <p style={{fontSize:13,color:'#526575',margin:'8px 0 0'}}>{isFour&&c.key==='expert_d_score'?'Sind Umsetzung, Organisation und Rechtsform gemeinsam schlüssig und realistisch?':hints[c.key]}</p>
   <div style={{display:'flex',alignItems:'center',gap:12,marginTop:12}}>
    <input type="range" min={1} max={10} step={1} value={current??5} disabled={isReleased} aria-label={c.name} style={{width:'100%',accentColor:color}}
     onChange={event=>{const value=Number(event.currentTarget.value);setPending(old=>({...old,[id]:value}));setStatus(old=>({...old,[id]:'open'}))}}
     onPointerUp={event=>{const value=Number(event.currentTarget.value);if(value!==saved)void save(team.id,c.key,value)}}
     onKeyUp={event=>{if(['ArrowLeft','ArrowRight','Home','End','PageUp','PageDown'].includes(event.key)){const value=Number(event.currentTarget.value);if(value!==saved)void save(team.id,c.key,value)}}}
    />
    <strong style={{minWidth:44,textAlign:'right'}}>{current===undefined?'–':current+'/10'}</strong>
   </div>
   <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#667480'}}><span>Gewichtung {weightFor(c.key).toLocaleString('de-DE')} %</span>{state==='error'&&<button type="button" onClick={()=>void save(team.id,c.key,current??5)}>Erneut speichern</button>}</div>
  </div></div>
 })}
 <div style={{marginTop:24,padding:18,background:'#f7f0e2',border:'1px solid #c49a45',borderRadius:10}}>
 <h3>Meine Gesamtbewertung</h3>
 {activeCriteria.every(c=>scores[team.id]?.[c.key]!==undefined)?(()=>{
 const result=activeCriteria.reduce((sum,c)=>sum+(scores[team.id]?.[c.key]??0)*weightFor(c.key),0)/100;
 return <><div style={{height:16,background:'#e7ded0',borderRadius:12,overflow:'hidden'}}><div className="jury-meter-fill" style={{height:'100%',width:result*10+'%',background:'#c49a45'}}/></div><p><strong>{result.toFixed(2)} / 10</strong> · Automatisch berechnet</p></>;
 })():<p>Noch nicht vollständig bewertet</p>}
 </div>
 <div style={{marginTop:16,padding:18,background:'#eef5f9',border:'1px solid #408dab',borderRadius:10}}>
 <h3>Durchschnitt der anderen Juroren</h3>
 <p><strong>{progress[team.id]?progress[team.id].submitted_count+' von '+progress[team.id].total_jurors+' abgegeben':'Abgabestand wird geladen …'}</strong></p>
 {progress[team.id]?.own_submitted?progress[team.id].others_average!==null?<>
 <div style={{height:16,background:'#d8e6ef',borderRadius:12,overflow:'hidden'}}><div className="jury-meter-fill" style={{height:'100%',width:Number(progress[team.id].others_average)*10+'%',background:'#408dab'}}/></div>
 <p><strong>{Number(progress[team.id].others_average).toFixed(2)} / 10</strong></p>
 </>:<p>Noch keine andere vollständige Bewertung abgegeben.</p>:<p>Der Vergleich wird nach Abschluss deiner eigenen Bewertung sichtbar.</p>}
 {progressError[team.id]&&<button type="button" onClick={()=>void refreshProgress(team.id)}>Abgabestand erneut laden</button>}
 </div>
 <div style={{marginTop:20,padding:18,border:'1px solid #d8d4cd',borderRadius:10}}>
 <h3>Bewertung freigeben</h3>
 {isReleased?<p style={{color:'#18794e',fontWeight:700}}>✓ Bewertung verbindlich freigegeben. Die Punkte sind jetzt gesperrt.</p>:<>
 <p>Deine Punkte werden als Entwurf gespeichert. Erst mit der Freigabe zählen sie zum Juryergebnis.</p>
 <button type="button" disabled={releasing||!activeCriteria.every(c=>scores[team.id]?.[c.key]!==undefined)||activeCriteria.some(c=>status[team.id+':'+c.key]==='saving'||status[team.id+':'+c.key]==='error'||pending[team.id+':'+c.key]!==undefined)}
 onClick={()=>void release(team.id)} style={{background:'#173d53',color:'white',padding:'12px 20px',borderRadius:8,cursor:'pointer',opacity:releasing?0.6:1}}>
 {releasing?'Freigabe läuft …':'Bewertung verbindlich freigeben'}
 </button>
 {releaseError&&<p role="alert" style={{color:'#b42318'}}>{releaseError}</p>}
 </>}
 </div>
 </div>
 <div className="demo-notes">
 <h2>Persönliche Jurynotizen</h2>
 <p>Nur für dich sichtbar. Diese Notizen fließen nicht in die Punktebewertung ein.</p>
 {notesError[team.id]&&<p role="alert" style={{color:'#b42318'}}>{notesError[team.id]} <button type="button" onClick={()=>void loadNotes(team.id)}>Erneut laden</button></p>}
 {!notesLoaded[team.id]?<p>Notizen werden geladen …</p>:<>
 {[{id:null as string|null,display_name:'Notizen zum gesamten Team'},...teamMembers.map(m=>({id:m.id as string|null,display_name:m.display_name}))].map(person=>{
 const key=noteKey(team.id,person.id);
 return <div key={key} style={{marginTop:18}}>
 <label htmlFor={'note-'+key} style={{display:'flex',alignItems:'center',gap:10,fontWeight:700,marginBottom:8}}>{person.id&&<span className="jury-member-avatar" aria-hidden="true"><Users size={16}/></span>}{person.display_name}</label>
 <textarea id={'note-'+key} value={notes[key]||''} maxLength={10000} rows={3} onChange={event=>setNotes(old=>({...old,[key]:event.target.value}))} placeholder="Private Beobachtungen festhalten …" style={{width:'100%',padding:12,border:'1px solid #cdd5d9',borderRadius:8,resize:'vertical',font:'inherit'}}/>
 <div style={{display:'flex',alignItems:'center',gap:12,marginTop:6}}>
 <button type="button" disabled={notesSaving[key]} onClick={()=>void saveNote(team.id,person.id)} style={{background:'#173d53',color:'white',padding:'8px 14px',borderRadius:6,cursor:'pointer'}}>{notesSaving[key]?'Speichert …':'Notiz speichern'}</button>
 {notesError[key]&&<span role="alert" style={{color:'#b42318',fontSize:13}}>{notesError[key]}</span>}
 </div></div>;
 })}
 </>}
 </div>
 <div className="demo-score" style={{marginTop:24}}><div className="demo-score-heading"><h2>Das Unternehmerteam</h2><span>NUR FÜR DIE JURY</span></div>{team.jury_photo_path?<img className="jury-team-portrait" src={'/api/jury/team-photo/'+team.id} alt={'Teamfoto '+team.name}/>:<div style={{background:'#f5f3ee',border:'1px dashed #d8d4cd',padding:'38px 16px',textAlign:'center',margin:'18px 0 22px'}}><Users size={28} style={{margin:'0 auto 8px',color:'#a88b5f'}}/><p style={{fontSize:13,margin:0}}>Gemeinsames Teamfoto wird nach Einwilligungsprüfung hochgeladen.</p></div>}</div>
 <div className="demo-score" style={{marginTop:20}}>
 <h2>Vertrauliche Businesspläne</h2>
 <p>Die PDF-Dateien sind nur für angemeldete Jurymitglieder zugänglich.</p>
 {materialsError[team.id]&&<p role="alert" style={{color:'#b42318'}}>{materialsError[team.id]}</p>}
 {materials[team.id]===undefined?<p>Unterlagen werden geladen …</p>:materials[team.id].length===0?<p>Für dieses Team sind noch keine Unterlagen hinterlegt.</p>:<>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,margin:'18px 0'}}>
 {materials[team.id].filter(m=>m.media_type.startsWith('image/')).map(m=><button key={m.id} type="button" onClick={()=>setEnlargedImage(m)} style={{display:'block',border:'1px solid #d8d4cd',borderRadius:8,overflow:'hidden',textDecoration:'none',color:'inherit'}}>
 <img src={'/api/jury/materials/'+m.id} alt={m.title} loading="lazy" style={{width:'100%',height:170,objectFit:'contain',background:'#f5f3ee'}}/>
 <span style={{display:'block',padding:10,fontSize:13,fontWeight:600}}>{m.title}</span></button>)}
 </div>
 <ul>{materials[team.id].filter(m=>m.media_type==='application/pdf').map(m=><li key={m.id} style={{margin:'10px 0'}}><button type="button" className="jury-pdf-open" onClick={()=>setEnlargedImage(m)}>{m.title} · PDF hier ansehen</button></li>)}</ul>
 </>}
 
 </div>
 </>}
 {enlargedImage&&<div role="presentation" onClick={()=>setEnlargedImage(null)} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(8,19,28,.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
 <div role="dialog" aria-modal="true" aria-label={enlargedImage.title} onClick={e=>e.stopPropagation()} style={{maxWidth:'min(1200px,96vw)',width:'100%',maxHeight:'94vh',display:'flex',flexDirection:'column',gap:10}}>
 <button type="button" autoFocus onClick={()=>setEnlargedImage(null)} style={{alignSelf:'flex-end',padding:'8px 14px',background:'white',borderRadius:6}}>Schließen ×</button>
 {enlargedImage.media_type==='application/pdf'?<iframe className="jury-document-frame" src={'/api/jury/materials/'+enlargedImage.id} title={enlargedImage.title}/>:<img src={'/api/jury/materials/'+enlargedImage.id} alt={enlargedImage.title} style={{maxWidth:'100%',maxHeight:'75vh',objectFit:'contain',background:'white',borderRadius:8}}/>}
 <p style={{color:'white',margin:0}}>{enlargedImage.title}</p>
 </div></div>}
 </section></div>;
}
