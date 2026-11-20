"use strict";
const fs=require('fs'),path=require('path');
const repo=path.resolve(__dirname,'../..');
const operations=require('./operations.json').operations;
const files=fs.readdirSync(path.join(repo,'lib/model/cloudcontroller')).filter(x=>x.endsWith('.js'));
const sources=files.map(f=>({name:f,text:fs.readFileSync(path.join(repo,'lib/model/cloudcontroller',f),'utf8')}));
const rootOf=o=>o.path==='/'?'global-root':o.path==='/v3'?'v3-root':o.path.split('/')[2];
const roots=[...new Set(operations.map(rootOf))];
const matrix=roots.map(resource=>{
 const ops=operations.filter(o=>rootOf(o)===resource);
 const mentions=sources.filter(s=>s.text.includes(`/v3/${resource}`)).map(s=>s.name);
 return {resource,documentedOperations:ops.length,sourceFilesMentioningPath:mentions,coverage:'unverified'};
});
fs.writeFileSync(path.join(__dirname,'coverage.json'),JSON.stringify({source:'https://v3-apidocs.cloudfoundry.org/version/3.237.0/',method:'literal path mention, not verified method coverage',documentedOperations:operations.length,resources:matrix},null,2)+'\n');
console.log(`Documented ${operations.length} operations across ${roots.length} resource roots; ${matrix.filter(x=>!x.sourceFilesMentioningPath.length).length} roots have no literal v3 path mention`);
console.log(matrix.filter(x=>!x.sourceFilesMentioningPath.length).map(x=>x.resource).join(', '));
