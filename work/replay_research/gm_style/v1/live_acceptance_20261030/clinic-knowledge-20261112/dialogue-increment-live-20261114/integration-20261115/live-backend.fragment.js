        // Isolated capture / exact raw replay. Outbound networking remains disabled here.
        const liveConfig=JSON.parse(fsClinic.readFileSync('dialogue-live-config.json','utf8'));
        const captureDir=liveConfig.captureDir,liveDir=liveConfig.liveDir;
        const flat=JSON.stringify(requestBody.messages);
        const kind=flat.includes('本次使用dialogue-reception/2')?'reception':flat.includes('只判断本次请求是否实际依赖某条待核消息')?'dependency':flat.includes('你是901行动分类器')?'classification':'narration';
        fsClinic.mkdirSync(captureDir,{recursive:true});
        if(kind==='classification'){
          fsClinic.writeFileSync(captureDir+'/'+Date.now()+'-classification.json',JSON.stringify({kind,requestBody,synthetic:true,upstreamCalls:0}));
          return response.json({choices:[{message:{role:'assistant',content:JSON.stringify({status:'NO_CHECK',basis:'ordinary_dialogue',reason:'本地分类路径控制，非模型分类'})},finish_reason:'stop'}],model:'LOCAL-CLASSIFICATION-CONTROL'});
        }
        const slot=liveConfig.steps[liveConfig.cursor];
        if(!slot||slot.kind!==kind)return response.status(409).json({error:{message:'UNPLANNED_LOCAL_REPLAY_SLOT'}});
        const requestPath=captureDir+'/'+slot.id+'.request.json';
        fsClinic.writeFileSync(requestPath,JSON.stringify(requestBody),{flag:'wx'});
        fsClinic.writeFileSync(captureDir+'/'+slot.id+'.ingress.json',JSON.stringify({id:slot.id,kind,receivedAt:new Date().toISOString(),requestBody}));
        const until=Date.now()+600000;
        while(Date.now()<until){
          if(fsClinic.existsSync(liveDir+'/'+slot.id+'.release.json')){
            const released=JSON.parse(fsClinic.readFileSync(liveDir+'/'+slot.id+'.release.json','utf8'));
            const sent=fsClinic.readFileSync(liveDir+'/'+slot.id+'.request.json','utf8');
            if(JSON.stringify(JSON.parse(sent))!==JSON.stringify(requestBody))return response.status(409).json({error:{message:'FROZEN_REQUEST_MISMATCH_NO_MODEL_CALL'}});
            if(!released.rawResponse)return response.status(418).json({error:{message:'BATCH_STOPPED_NO_REPLY'}});
            const raw=fsClinic.readFileSync(liveDir+'/'+slot.id+'.raw-response.txt','utf8');
            liveConfig.cursor++;fsClinic.writeFileSync('dialogue-live-config.json',JSON.stringify(liveConfig));
            fsClinic.writeFileSync(captureDir+'/'+slot.id+'.delivered.json',JSON.stringify({id:slot.id,rawReplay:true,deliveredAt:new Date().toISOString(),synthetic:false,upstreamCallsFromBrowser:0}));
            return response.type('application/json').send(raw);
          }
          await new Promise(resolve=>setTimeout(resolve,250));
        }
        return response.status(408).json({error:{message:'LOCAL_REPLAY_WAIT_EXPIRED_NO_MODEL_CALL'}});
