export const config = { runtime: 'edge' };
const CORS = {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type'};
const CHROME = {'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36','Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8','Accept-Language':'en-US,en;q=0.9','Accept-Encoding':'identity','Cache-Control':'no-cache','Sec-Fetch-Dest':'document','Sec-Fetch-Mode':'navigate','Sec-Fetch-Site':'none'};
export default async function handler(req) {
  if (req.method==='OPTIONS') return new Response(null,{status:204,headers:CORS});
  if (req.method!=='POST') return respond({error:'Method not allowed'},405);
  let body; try{body=await req.json()}catch{return respond({error:'Invalid JSON'},400)}
  const rawUrl=(body.url||'').trim();
  if(!rawUrl) return respond({error:'Missing url'},400);
  let base=rawUrl;
  if(!/^https?:\/\//i.test(base)) base='https://'+base;
  base=base.replace(/\/+$/,'').replace(/\/sitemap[^/]*$/i,'');
  const isWww=/^https?:\/\/www\./i.test(base);
  const alt=isWww?base.replace('://www.','://'):base.replace('://','://www.');
  const paths=['/sitemap.xml','/sitemap_index.xml','/sitemap-index.xml','/wp-sitemap.xml','/sitemap/sitemap.xml','/sitemaps/sitemap.xml','/news-sitemap.xml','/post-sitemap.xml','/product-sitemap.xml'];
  const candidates=[];
  for(const b of [base,alt]){
    try{
      const rt=await serverFetch(b+'/robots.txt',5000);
      if(rt){for(const m of rt.matchAll(/^Sitemap:\s*(.+)$/gim)){const s=m[1].trim();if(s&&!candidates.includes(s))candidates.push(s)}}
    }catch{}
  }
  for(const p of paths){for(const b of [base,alt]){const u=b+p;if(!candidates.includes(u))candidates.push(u)}}
  for(const candidate of candidates){
    const text=await serverFetch(candidate,10000);
    if(!text) continue;
    if(text.includes('<sitemapindex')){
      const childUrls=[...text.matchAll(/<loc>\s*(https?[^<]+)\s*<\/loc>/gi)].map(m=>m[1].trim()).filter(u=>/sitemap/i.test(u)).slice(0,10);
      let merged='';
      if(childUrls.length){
        const results=await Promise.allSettled(childUrls.map(u=>serverFetch(u,8000)));
        for(const r of results){if(r.status==='fulfilled'&&r.value){for(const m of r.value.matchAll(/<url>[\s\S]*?<\/url>/gi))merged+=m[0]+'\n'}}
      }
      const finalXml=merged?`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${merged}</urlset>`:text;
      return respond({xml:finalXml,source:candidate,type:merged?'Sitemap Index (merged)':'Sitemap Index',urlCount:(finalXml.match(/<loc>/g)||[]).length});
    }
    return respond({xml:text,source:candidate,type:'URL Set',urlCount:(text.match(/<loc>/g)||[]).length});
  }
  return respond({error:`No sitemap found after trying ${candidates.length} URLs.`,tried:candidates.slice(0,10)},404);
}
async function serverFetch(url,ms=10000){
  const ctrl=new AbortController();
  const tid=setTimeout(()=>ctrl.abort(),ms);
  try{
    const res=await fetch(url,{headers:CHROME,redirect:'follow',signal:ctrl.signal});
    clearTimeout(tid);
    if(!res.ok) return null;
    const text=await res.text();
    return(text.includes('<urlset')||text.includes('<sitemapindex')||text.includes('<url>')||text.includes('Sitemap:'))?text:null;
  }catch{clearTimeout(tid);return null}
}
function respond(data,status=200){return new Response(JSON.stringify(data),{status,headers:{...CORS,'Content-Type':'application/json'}})}
