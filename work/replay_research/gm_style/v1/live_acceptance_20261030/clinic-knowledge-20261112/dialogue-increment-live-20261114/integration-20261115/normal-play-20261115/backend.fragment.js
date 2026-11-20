        // Normal play acceptance: every actual request is captured; no synthetic completion.
        const play=JSON.parse(fsClinic.readFileSync('dialogue-live-config.json','utf8'));
        const flat=JSON.stringify(requestBody.messages);
        const kind=requestBody.response_format?.json_schema?.name?.startsWith('dialogue_reception_')?'reception':flat.includes('只判断本次请求是否实际依赖某条待核消息')?'dependency':flat.includes('你是901行动分类器')?'classification':'narration-or-memory';
        const id='play.'+String(++play.sequence).padStart(3,'0')+'.'+kind;
        fsClinic.mkdirSync(play.captureDir,{recursive:true});
        fsClinic.writeFileSync(play.captureDir+'/'+id+'.request.json',JSON.stringify(requestBody),{flag:'wx'});
        fsClinic.writeFileSync(play.captureDir+'/'+id+'.capture.json',JSON.stringify({id,kind,at:new Date().toISOString(),synthetic:false,upstreamCallsFromBrowser:0}),{flag:'wx'});
        fsClinic.writeFileSync('dialogue-live-config.json',JSON.stringify(play));
        const until=Date.now()+600000;
        while(Date.now()<until){
          const path=play.liveDir+'/'+id+'.release.json';
          if(fsClinic.existsSync(path)){
            const release=JSON.parse(fsClinic.readFileSync(path,'utf8'));
            if(!release.rawResponse)return response.status(418).json({error:{message:'PLAY_STOPPED_WITHOUT_REPLY'}});
            const sent=fsClinic.readFileSync(play.liveDir+'/'+id+'.request.json','utf8');
            if(JSON.stringify(JSON.parse(sent))!==JSON.stringify(requestBody))return response.status(409).json({error:{message:'FROZEN_REQUEST_MISMATCH'}});
            const raw=fsClinic.readFileSync(play.liveDir+'/'+id+'.raw-response.txt','utf8');
            fsClinic.writeFileSync(play.captureDir+'/'+id+'.delivered.json',JSON.stringify({rawReplay:true,synthetic:false,upstreamCallsFromBrowser:0}));
            return response.type('application/json').send(raw);
          }
          await new Promise(resolve=>setTimeout(resolve,250));
        }
        return response.status(408).json({error:{message:'PLAY_WAIT_EXPIRED'}});
