import {NextResponse} from 'next/server';
export const dynamic='force-dynamic';
/* Temporary read-only color audit of the official Landheim domain.
   No arbitrary URLs accepted. Remove after brand tokens are confirmed. */
export async function GET(){
 const base='https://www.landheim-ammersee.de';
 const ua='Mozilla/5.0 (compatible; LandheimStyleAudit/1.0)';
 try{
  const htmlRes=await fetch(base+'/de',{headers:{'User-Agent':ua},cache:'no-store',signal:AbortSignal.timeout(12000)});
  const html=await htmlRes.text();
  const urls=[...html.matchAll(/<link[^>]+href=["']([^"']+\.css(?:\?[^"']*)?)["']/gi)].map(m=>m[1]);
  const limited=[...new Set(urls)].slice(0,12);
  const files=[];
  for(const path of limited){
   try{
    const url=new URL(path,base);
    if(url.hostname!=='www.landheim-ammersee.de')continue;
    const response=await fetch(url.toString(),{headers:{'User-Agent':ua},cache:'no-store',signal:AbortSignal.timeout(8500)});
    const css=(await response.text()).slice(0,800000);
    const tokens=[...css.matchAll(/(?:background(?:-color)?|border(?:-color)?|fill|stroke|color|--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)].map(m=>m[1].toLowerCase());
    const counts:Record<string,number>={};
    for(const t of tokens)counts[t]=(counts[t]||0)+1;
    files.push({path:url.pathname,status:response.status,length:css.length,
     colors:Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,100),
     greenContexts:[...css.matchAll(/.{0,80}(?:background(?:-color)?|color|fill|stroke)\s*:\s*#[789abcABCdefDEF][0-9a-fA-F]{5}.{0,55}/g)].slice(0,24).map(x=>x[0])
    });
   }catch(e){files.push({path,error:String(e)})}
  }
  const svgRes=await fetch(base+'/themes/master_theme/logo.svg',{headers:{'User-Agent':ua},signal:AbortSignal.timeout(9000),cache:'no-store'});
  const svg=(await svgRes.text()).slice(0,50000);
  return NextResponse.json({homeStatus:htmlRes.status,htmlLength:html.length,cssLinks:limited,files,
   logoStatus:svgRes.status,logoColors:[...new Set(svg.match(/#[0-9a-fA-F]{3,8}/g)||[])],logoStart:svg.slice(0,1800)});
 }catch(e){return NextResponse.json({error:String(e)},{status:502})}
}
