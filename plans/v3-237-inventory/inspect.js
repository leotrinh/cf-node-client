"use strict";
(async()=>{
 const html=await (await fetch('https://v3-apidocs.cloudfoundry.org/version/3.237.0/')).text();
 for(const anchor of ['create-a-service-instance','get-a-service-instance','get-platform-info','share-a-route-with-other-spaces-experimental']) {
  const start=html.indexOf('id="'+anchor+'"');
  const end=html.indexOf('<h3 ',start+10);
  const segment=html.slice(start,end);
  console.log(anchor,segment.slice(segment.indexOf('Example Response')-100,segment.indexOf('Example Response')+650));
 }
})().catch(e=>{console.error(e);process.exitCode=1});
