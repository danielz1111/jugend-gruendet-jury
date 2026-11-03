'use client';
import {useEffect,useState} from 'react';
import {ArrowLeft,ArrowRight,FileText,Users,Presentation,LockKeyhole} from 'lucide-react';
type Team={id:string;name:string;position:number;tagline:string|null;description:string|null};
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
const gradeGuide='1–2: kaum erfüllt · 3–4: eher schwach · 5–6: teilweise erfüllt · 7–8: gut erfüllt · 9–10: hervorragend erfüllt';
type Material={id:string;title:string;original_filename:string;media_type:string;created_at:string};
type Progress={submitted_count:number;total_jurors:number;others_average:number|null;own_submitted:boolean};
export default function TeamNavigator({teams,members,initialScores,isAdmin}:{teams:Team[];members:Member[];initialScores:Score[];isAdmin:boolean}){
 const [selected,setSelected]=useState(0);
 const [enlargedImage,setEnlargedImage]=useState<Material|null>(null);
 const [mainTab,setMainTab]=useState<'business'|'pitch'>('business');
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
 const activeCriteria=criteria.filter(c=>!(isFour&&c.key==='expert_e_score'));
 const weightFor=(key:string)=>isFour&&key.startsWith('expert_')?12.5:criteria.find(c=>c.key===key)?.weight??0;
 return <div className="demo-shell" style={{minHeight:600,marginTop:32,border:'1px solid #e4e0d9'}}>
 <aside className="demo-sidebar"><span className="demo-overline">UNTERNEHMERTEAMS · {teams.length}</span>{teams.map((t,i)=><button key={t.id} className={selected===i?'selected':''} aria-pressed={selected===i} onClick={()=>{setSelected(i);setMainTab('business');setExpertTab('A');setAttachmentTab('all')}}><span>{String(t.position).padStart(2,'0')}</span>{t.name}</button>)}</aside>
 <section className="demo-main"><div className="demo-heading"><div><span className="demo-overline">TEAM {String(team.position).padStart(2,'0')} · JURYANSICHT</span><h1>{team.name}</h1><p>{team.tagline||'Unternehmerteam · Jugend gründet 2026/27'}</p></div><div className="demo-pagination"><button disabled={selected===0} onClick={()=>{setSelected(v=>v-1);setMainTab('business');setExpertTab('A');setAttachmentTab('all')}} aria-label="Vorheriges Team"><ArrowLeft size={18}/></button><button disabled={selected===teams.length-1} onClick={()=>{setSelected(v=>v+1);setMainTab('business');setExpertTab('A');setAttachmentTab('all')}} aria-label="Nächstes Team"><ArrowRight size={18}/></button></div></div>
 <div role="tablist" aria-label="Bereiche des Juryportals" style={{display:'flex',gap:10,margin:'24px 0 12px',flexWrap:'wrap'}}>
 <button type="button" role="tab" aria-selected={mainTab==='business'} onClick={()=>setMainTab('business')} style={{padding:'12px 20px',borderRadius:8,background:mainTab==='business'?'#173d53':'#eef1f2',color:mainTab==='business'?'white':'#173d53',fontWeight:700}}>Businessplan</button>
 <button type="button" role="tab" aria-selected={mainTab==='pitch'} onClick={()=>setMainTab('pitch')} style={{padding:'12px 20px',borderRadius:8,background:mainTab==='pitch'?'#173d53':'#eef1f2',color:mainTab==='pitch'?'white':'#173d53',fontWeight:700}}>Pitch &amp; Juryfragen</button>
 </div>
 {mainTab==='business'&&<div className="demo-score" style={{marginTop:12}}>
 <h2>Unternehmensübersicht</h2>
 <p>{team.description||'Eine geprüfte Zusammenfassung aus dem eingereichten Businessplan wird ergänzt.'}</p>
 <h3 style={{marginTop:20}}>Expertenbereiche</h3>
 <p>Alle Teams haben dieselbe Gliederung. Die Inhalte werden aus dem Original-Businessplan übernommen.</p>
 <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'14px 0'}}>{expertSections.filter(x=>!(isFour&&x.id==='E')).map(x=><button key={x.id} type="button" aria-pressed={expertTab===x.id} onClick={()=>setExpertTab(x.id)} style={{padding:'10px 12px',borderRadius:7,background:expertTab===x.id?'#173d53':'#eef1f2',color:expertTab===x.id?'white':'#173d53'}}>{isFour&&x.id==='D'?'D/E · Umsetzung & Organisation':x.label}</button>)}</div>
 <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) minmax(0,1fr)',gap:12,marginTop:16}}>
 <div style={{border:'1px solid #d8d4cd',borderRadius:9,padding:15,background:'#fff'}}>
 <h3>{isFour&&expertTab==='D'?'D/E · Umsetzung und Organisation':expertSections.find(x=>x.id===expertTab)?.label}</h3>
 <p>{isSlimpower?review[0]:'Inhaltliche Zusammenfassung folgt nach Prüfung des Businessplans.'}</p>
 {isSlimpower&&<p style={{color:'#a16a16',fontSize:20}} aria-label={review[4]+' von 5 Sternen'}>{'★'.repeat(review[4])}{'☆'.repeat(5-review[4])} <span style={{fontSize:12,color:'#667480'}}>Vorläufig · {review[4]}/5</span></p>}
 </div>
 <div style={{display:'grid',gap:10}}>
 <div style={{background:'#eff9f2',border:'1px solid #a8d5ba',padding:14,borderRadius:9}}><strong style={{color:'#17633c'}}>Besonders stark</strong><p>{isSlimpower?review[1]:'Wird nach Prüfung ergänzt.'}</p></div>
 <div style={{background:'#fff7e9',border:'1px solid #e6c58c',padding:14,borderRadius:9}}><strong style={{color:'#875513'}}>Schwachstellen und offene Fragen</strong><p>{isSlimpower?review[2]:'Wird nach Prüfung ergänzt.'}</p></div>
 <div style={{background:'#f0f6fa',border:'1px solid #cddce5',padding:14,borderRadius:9}}><strong>Mögliche Juryfrage</strong><p>{isSlimpower?review[3]:'Wird nach Prüfung ergänzt.'}</p></div>
 </div></div>
 <h3 style={{marginTop:24}}>Vollständiger Businessplan</h3>
 {(materials[team.id]||[]).filter(m=>m.media_type==='application/pdf').length?<ul>{(materials[team.id]||[]).filter(m=>m.media_type==='application/pdf').map(m=><li key={m.id}><a href={'/api/jury/materials/'+m.id} target="_blank" rel="noopener noreferrer">{m.title} · Original-PDF öffnen</a></li>)}</ul>:<p>Der vollständige Businessplan wurde noch nicht hinterlegt.</p>}
 <h3 style={{marginTop:24}}>Produkt- und Werbematerial</h3>
 <p>Originalbilder des Teams. Zum Vergrößern ein Bild anklicken.</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:14}}>
 {(materials[team.id]||[]).filter(m=>m.media_type.startsWith('image/')&&/visualis|produkt|werbung|marketing/i.test(m.title+' '+m.original_filename)).map(m=><button key={m.id} type="button" onClick={()=>setEnlargedImage(m)} style={{padding:0,textAlign:'left',border:'1px solid #d8d4cd',borderRadius:8,overflow:'hidden',background:'white',cursor:'zoom-in'}}><img src={'/api/jury/materials/'+m.id} alt={m.title} loading="lazy" style={{width:'100%',height:220,objectFit:'contain',background:'#f5f3ee'}}/><span style={{display:'block',padding:10,fontWeight:600}}>{m.title} · Vergrößern</span></button>)}
 </div>
 <h3 style={{marginTop:24}}>Weitere Anlagen</h3>
 <div style={{display:'flex',flexWrap:'wrap',gap:8,margin:'14px 0'}}>{attachmentSections.filter(x=>!(isFour&&x.id==='E')).map(x=><button key={x.id} type="button" aria-pressed={attachmentTab===x.id} onClick={()=>setAttachmentTab(x.id)} style={{padding:'9px 12px',borderRadius:7,background:attachmentTab===x.id?'#173d53':'#eef1f2',color:attachmentTab===x.id?'white':'#173d53'}}>{isFour&&x.id==='D'?'D/E · Umsetzung & Organisation':x.label}</button>)}</div>
 {(()=>{const items=(materials[team.id]||[]).filter(m=>m.media_type!=='application/pdf'&&!/visualis|produkt|werbung|marketing/i.test(m.title+' '+m.original_filename)&&(attachmentTab==='all'||attachmentCategory(m)===attachmentTab||(isFour&&attachmentTab==='D'&&attachmentCategory(m)==='E')));
 return items.length?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14}}>{items.map(m=><a key={m.id} href={'/api/jury/materials/'+m.id} target="_blank" rel="noopener noreferrer" style={{display:'block',border:'1px solid #d8d4cd',borderRadius:8,overflow:'hidden',color:'inherit',textDecoration:'none'}}>{m.media_type.startsWith('image/')&&<img src={'/api/jury/materials/'+m.id} alt={m.title} loading="lazy" style={{width:'100%',height:170,objectFit:'contain',background:'#f5f3ee'}}/>}<span style={{display:'block',padding:10,fontWeight:600,fontSize:13}}>{m.title}</span></a>)}</div>:<p>{materials[team.id]===undefined?'Anlagen werden geladen …':'In dieser Kategorie sind noch keine Anlagen hinterlegt.'}</p>})()}
 </div>}
 {mainTab==='pitch'&&<>
 <div className="demo-score" style={{marginTop:24}}><div className="demo-score-heading"><h2>Teammitglieder und Expertenbereiche</h2><span>NUR FÜR DIE JURY</span></div><div style={{background:'#f5f3ee',border:'1px dashed #d8d4cd',padding:'38px 16px',textAlign:'center',margin:'18px 0 22px'}}><Users size={28} style={{margin:'0 auto 8px',color:'#a88b5f'}}/><p style={{fontSize:13,margin:0}}>Gemeinsames Teamfoto wird nach Einwilligungsprüfung hochgeladen.</p></div>{teamMembers.length?<div style={{display:'grid',gap:10}}>{teamMembers.map(m=><div key={m.id} style={{display:'flex',justifyContent:'space-between',gap:16,padding:'13px 0',borderBottom:'1px solid #e7e4df'}}><strong>{m.display_name}</strong><span style={{fontSize:13,color:'#667480',textAlign:'right'}}>{m.expert_role||'Expertenbereich noch nicht eingetragen'}</span></div>)}</div>:<p>Für dieses Team wurden noch keine Mitglieder hinterlegt. Die bestätigten Zuordnungen werden geschützt ergänzt.</p>}</div>
 <div className="demo-resources"><div><Users size={20}/><strong>Teammitglieder</strong><small><LockKeyhole size={12} style={{display:'inline'}}/> {teamMembers.length} Mitglieder hinterlegt</small></div><div><FileText size={20}/><strong>Businessplan</strong><small>{materials[team.id]?.length?materials[team.id].length+" PDF-Datei(en) hinterlegt":"Noch keine PDF hinterlegt"}</small></div><div><Presentation size={20}/><strong>Präsentation</strong><small>Wird zum Wettbewerb ergänzt</small></div></div>
 <div className="demo-score" style={{marginTop:20}}>
 <h2>Vertrauliche Businesspläne</h2>
 <p>Die PDF-Dateien sind nur für angemeldete Jurymitglieder zugänglich.</p>
 {materialsError[team.id]&&<p role="alert" style={{color:'#b42318'}}>{materialsError[team.id]}</p>}
 {materials[team.id]===undefined?<p>Unterlagen werden geladen …</p>:materials[team.id].length===0?<p>Für dieses Team sind noch keine Unterlagen hinterlegt.</p>:<>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:14,margin:'18px 0'}}>
 {materials[team.id].filter(m=>m.media_type.startsWith('image/')).map(m=><a key={m.id} href={'/api/jury/materials/'+m.id} target="_blank" rel="noopener noreferrer" style={{display:'block',border:'1px solid #d8d4cd',borderRadius:8,overflow:'hidden',textDecoration:'none',color:'inherit'}}>
 <img src={'/api/jury/materials/'+m.id} alt={m.title} loading="lazy" style={{width:'100%',height:170,objectFit:'contain',background:'#f5f3ee'}}/>
 <span style={{display:'block',padding:10,fontSize:13,fontWeight:600}}>{m.title}</span></a>)}
 </div>
 <ul>{materials[team.id].filter(m=>m.media_type==='application/pdf').map(m=><li key={m.id} style={{margin:'10px 0'}}><a href={'/api/jury/materials/'+m.id} target="_blank" rel="noopener noreferrer">{m.title} · PDF öffnen</a></li>)}</ul>
 </>}
 {isAdmin&&<form onSubmit={event=>{event.preventDefault();void uploadMaterial(team.id,event.currentTarget)}} style={{marginTop:18,padding:16,background:'#f7f8f9',borderRadius:8}}>
 <strong>Businessplan oder Bildanlage hochladen (Administration)</strong>
 <div style={{display:'grid',gap:10,marginTop:12}}>
 <input name="title" type="text" required maxLength={120} defaultValue="Businessplan" aria-label="Dokumenttitel" style={{padding:10}}/>
 <input name="file" type="file" required accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" aria-label="Businessplan als PDF auswählen"/>
 <button type="submit" disabled={uploading} style={{padding:'10px 16px',background:'#173d53',color:'white',borderRadius:6}}>{uploading?'Lädt hoch …':'Datei sicher hochladen'}</button>
 </div></form>}
 </div>
 <div className="demo-score">
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
 return <><div style={{height:16,background:'#e7ded0',borderRadius:12,overflow:'hidden'}}><div style={{height:'100%',width:result*10+'%',background:'#c49a45'}}/></div><p><strong>{result.toFixed(2)} / 10</strong> · Automatisch berechnet</p></>;
 })():<p>Noch nicht vollständig bewertet</p>}
 </div>
 <div style={{marginTop:16,padding:18,background:'#eef5f9',border:'1px solid #408dab',borderRadius:10}}>
 <h3>Durchschnitt der anderen Juroren</h3>
 <p><strong>{progress[team.id]?progress[team.id].submitted_count+' von '+progress[team.id].total_jurors+' abgegeben':'Abgabestand wird geladen …'}</strong></p>
 {progress[team.id]?.own_submitted?progress[team.id].others_average!==null?<>
 <div style={{height:16,background:'#d8e6ef',borderRadius:12,overflow:'hidden'}}><div style={{height:'100%',width:Number(progress[team.id].others_average)*10+'%',background:'#408dab'}}/></div>
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
 <label htmlFor={'note-'+key} style={{display:'block',fontWeight:700,marginBottom:8}}>{person.display_name}</label>
 <textarea id={'note-'+key} value={notes[key]||''} maxLength={10000} rows={3} onChange={event=>setNotes(old=>({...old,[key]:event.target.value}))} placeholder="Private Beobachtungen festhalten …" style={{width:'100%',padding:12,border:'1px solid #cdd5d9',borderRadius:8,resize:'vertical',font:'inherit'}}/>
 <div style={{display:'flex',alignItems:'center',gap:12,marginTop:6}}>
 <button type="button" disabled={notesSaving[key]} onClick={()=>void saveNote(team.id,person.id)} style={{background:'#173d53',color:'white',padding:'8px 14px',borderRadius:6,cursor:'pointer'}}>{notesSaving[key]?'Speichert …':'Notiz speichern'}</button>
 {notesError[key]&&<span role="alert" style={{color:'#b42318',fontSize:13}}>{notesError[key]}</span>}
 </div></div>;
 })}
 </>}
 </div>
 </>}
 {enlargedImage&&<div role="presentation" onClick={()=>setEnlargedImage(null)} style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(8,19,28,.88)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
 <div role="dialog" aria-modal="true" aria-label={enlargedImage.title} onClick={e=>e.stopPropagation()} style={{maxWidth:'min(960px,96vw)',width:'100%',maxHeight:'94vh',display:'flex',flexDirection:'column',gap:10}}>
 <button type="button" autoFocus onClick={()=>setEnlargedImage(null)} style={{alignSelf:'flex-end',padding:'8px 14px',background:'white',borderRadius:6}}>Schließen ×</button>
 <img src={'/api/jury/materials/'+enlargedImage.id} alt={enlargedImage.title} style={{maxWidth:'100%',maxHeight:'75vh',objectFit:'contain',background:'white',borderRadius:8}}/>
 <p style={{color:'white',margin:0}}>{enlargedImage.title}</p>
 </div></div>}
 </section></div>;
}
