/**
 * Extract only two explicitly labelled competition fields from an exported
 * JUGEND GRÜNDET business-plan PDF. Results are proposals for admin review,
 * never public data or a substitute for publication consent.
 */
import {extractText,getDocumentProxy} from 'unpdf';

export type ProfileSuggestion = {
  tagline:string|null;
  description:string|null;
};
const sloganHeading=/^(?:0?2\s*[.):–-]?\s*)?(?:der\s+)?slogan\b\s*[:–-]?\s*(.*)$/i;
const ideaHeading=/^(?:0?3\s*[.):–-]?\s*)?(?:die\s+)?idee\s+kurz\s+und\s+knapp\b\s*[:–-]?\s*(.*)$/i;
const followingHeading=/^(?:0?[4-9]|1[0-9]|2[0-7])\s*[.):–-]?\s*(?:das\s+geschäftsmodell|das\s+problem|die\s+zielgruppen|.+)/i;
const instructions=/\b(formuliere|beschreibe|maximal\s+\d+|höchstpunkte|zeichenlimit|punkte\s*[·:])\b/i;

function cleaned(lines:string[],max:number):string|null {
  const value=lines.map(line=>line.trim()).filter(Boolean).join(' ')
    .replace(/\s+/g,' ').replace(/\s+([.,!?;:])/g,'$1').trim();
  if(!value||value.length>max||instructions.test(value))return null;
  if(/(?:@|https?:\/\/|www\.)/i.test(value))return null;
  return value;
}

/** Conservative, deterministic field parsing; no AI, no guessed values. */
export function parsePublicFields(text:string):ProfileSuggestion|null {
  const lines=text.replace(/\u00ad/g,'').replace(/\r/g,'')
    .split('\n').map(line=>line.replace(/\s+/g,' ').trim()).filter(Boolean);
  let current:'tagline'|'description'|null=null;
  const found:{tagline:string[];description:string[]}={tagline:[],description:[]};
  for(const line of lines){
    const s=line.match(sloganHeading);
    if(s){current='tagline';if(s[1])found.tagline.push(s[1]);continue;}
    const d=line.match(ideaHeading);
    if(d){current='description';if(d[1])found.description.push(d[1]);continue;}
    if(current&&followingHeading.test(line)){current=null;continue;}
    if(current&&/^(?:\d{1,2}[.):–-]\s+[A-ZÄÖÜ]|JUGEND\s+GRÜNDET|businessplan\s*[·|])/i.test(line)){current=null;continue;}
    if(current&&found[current].join(' ').length<1200)found[current].push(line);
  }
  const tagline=cleaned(found.tagline,160);
  const description=cleaned(found.description,700);
  return tagline||description?{tagline,description}:null;
}
export async function extractPublicFields(pdfBytes:Uint8Array):Promise<ProfileSuggestion|null> {
  if(pdfBytes.byteLength>12*1024*1024)return null;
  let doc:Awaited<ReturnType<typeof getDocumentProxy>>|undefined;
  try{
    doc=await getDocumentProxy(pdfBytes,{maxImageSize:16_777_216});
    if(doc.numPages<1||doc.numPages>40)return null;
    const extracted=await extractText(doc,{mergePages:true});
    return parsePublicFields(String(extracted.text).slice(0,75_000));
  }catch{
    return null;
  }finally{
    const cleanup=doc as unknown as {destroy?:()=>Promise<void>}|undefined;
    if(cleanup?.destroy)await cleanup.destroy().catch(()=>{});
  }
}
