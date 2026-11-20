// Disposable local experiment evidence only; no product endpoint.
router.post('/clinic-natural-evidence', async (request,response)=>{
 const lab=JSON.parse(fsClinic.readFileSync('clinic-natural-config.json','utf8'));
 const label=request.body.label;
 if(!/^(01-before|02-received|03-reopened|failure)-[a-z0-9-]+$/.test(label))return response.sendStatus(400);
 fsClinic.writeFileSync(lab.evidenceDir+'/'+label+'.json',JSON.stringify(request.body,null,2));
 lab.phase=label.split('-').slice(0,2).join('-');
 if(lab.phase!=='failure')fsClinic.writeFileSync('clinic-natural-config.json',JSON.stringify(lab));
 response.json({saved:true,label});
});
