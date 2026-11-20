        const lab=JSON.parse(fsClinic.readFileSync('clinic-natural-config.json','utf8'));
        const flat=JSON.stringify(requestBody.messages);
        const kind=flat.includes('你是901行动分类器')?'classification':requestBody.response_format?.json_schema?.name?.startsWith('dialogue_reception_')?'extraction':'narration';
        const id=lab.phase+'.'+String(++lab.sequence).padStart(2,'0')+'.'+kind;
        fsClinic.mkdirSync(lab.captureDir,{recursive:true});
        const prefix=lab.captureDir+'/'+id;
        fsClinic.writeFileSync(prefix+'.request.json',JSON.stringify(requestBody),{flag:'wx'});
        fsClinic.writeFileSync(prefix+'.capture.json',JSON.stringify({id,kind,endpointUrl,browserUpstreamCalls:0,classificationFixture:kind==='classification',at:new Date().toISOString()}),{flag:'wx'});
        fsClinic.writeFileSync('clinic-natural-config.json',JSON.stringify(lab));
        if(kind==='classification')return response.json({choices:[{message:{role:'assistant',content:JSON.stringify({status:'NO_CHECK',basis:'ordinary_dialogue',reason:'隔离分类控制，非模型输出'})},finish_reason:'stop'}]});
        if(kind!=='narration')return response.status(418).json({error:{message:'EXTRACTION_DISABLED_IN_THIS_EXPERIMENT'}});
        const deadline=Date.now()+240000;
        while(Date.now()<deadline){
          if(fsClinic.existsSync(prefix+'.release.json')){
            const release=JSON.parse(fsClinic.readFileSync(prefix+'.release.json','utf8'));
            if(release.stop)return response.status(418).json({error:{message:'CAPTURE_ONLY_NOT_SENT'}});
            const exact=fsClinic.readFileSync(prefix+'.sent-request.json','utf8');
            if(exact!==JSON.stringify(requestBody))return response.status(409).json({error:{message:'FROZEN_REQUEST_MISMATCH'}});
            return response.type('application/json').send(fsClinic.readFileSync(prefix+'.raw-response.txt','utf8'));
          }
          await new Promise(resolve=>setTimeout(resolve,200));
        }
        return response.status(408).json({error:{message:'LOCAL_RELEASE_WAIT_EXPIRED'}});
