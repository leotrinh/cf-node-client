"use strict";
const fs = require("fs");
(async () => {
 const url="https://v3-apidocs.cloudfoundry.org/version/3.237.0/";
 const response=await fetch(url); if(!response.ok) throw new Error(`Documentation HTTP ${response.status}`);
 const html=await response.text();
 const resourcesStart=html.indexOf('<h1 id="resources">');
 const headings=[...html.slice(resourcesStart).matchAll(/<h3 id="([^"]+)">([^<]+)<\/h3>/g)].map(m=>({index:m.index+resourcesStart,anchor:m[1],title:m[2]}));
 const operations=[];
 for(let i=0;i<headings.length;i++){
  const segment=html.slice(headings[i].index,(headings[i+1]||{index:html.length}).index);
  const canonical=segment.match(/<code class="prettyprint">(GET|POST|PATCH|PUT|DELETE) (\/v3\/[^<]+)<\/code>/);
  if(!canonical) continue;
  const method=canonical[1];
  const path=canonical[2].replace(/[?].*$/," ").trim().replace(/\[([^\]]+)\]/g,"{$1}");
  operations.push({title:headings[i].title.replace(/&amp;/g,"&"),anchor:headings[i].anchor,method,path});
 }
 fs.writeFileSync("plans/v3-237-inventory/operations.json",JSON.stringify({source:url,operations},null,2)+"\n");
 console.log(`Extracted ${operations.length} heading operations; ${new Set(operations.map(o=>o.method+' '+o.path)).size} unique method/path pairs`);
 console.log(operations.slice(0,12));
})().catch(e=>{console.error(e);process.exitCode=1});
