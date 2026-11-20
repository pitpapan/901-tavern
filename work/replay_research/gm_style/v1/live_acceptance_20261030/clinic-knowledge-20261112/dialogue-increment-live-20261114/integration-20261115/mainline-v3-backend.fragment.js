        // Isolated UI acceptance only: fixed declared scenes + captured actual
        // model requests. No outbound transport here and no fallback response.
        const liveConfig=JSON.parse(fsClinic.readFileSync('dialogue-live-config.json','utf8'));
        const flat=JSON.stringify(requestBody.messages);
        const kind=requestBody.response_format?.json_schema?.name?.startsWith('dialogue_reception_')?'reception':flat.includes('只判断本次请求是否实际依赖某条待核消息')?'dependency':flat.includes('你是901行动分类器')?'classification':'narration';
        fsClinic.mkdirSync(liveConfig.captureDir,{recursive:true});
        if(kind==='classification'){
          fsClinic.writeFileSync(liveConfig.captureDir+'/'+Date.now()+'-classification.json',JSON.stringify({kind,requestBody,synthetic:true,upstreamCalls:0}));
          return response.json({choices:[{message:{role:'assistant',content:JSON.stringify({status:'NO_CHECK',basis:'ordinary_dialogue',reason:'隔离路径控制，非模型分类'})},finish_reason:'stop'}],model:'LOCAL-CLASSIFICATION-CONTROL'});
        }
        const slot=liveConfig.steps[liveConfig.cursor];
        if(!slot||slot.kind!==kind)return response.status(409).json({error:{message:'UNPLANNED_MAINLINE_SLOT'}});
        const stem=liveConfig.captureDir+'/'+slot.id;
        fsClinic.writeFileSync(stem+'.request.json',JSON.stringify(requestBody),{flag:'wx'});
        if(slot.fixtureText||slot.fixtureNone){
          let content=slot.fixtureText;
          if(slot.fixtureNone){
            const input=JSON.parse(requestBody.messages[1].content),text=input.sourceAnchor.text;
            if(text!==slot.expectedText&&text!==slot.expectedText+'\n\n<StatusPlaceHolderImpl/>')return response.status(409).json({error:{message:'UNDECLARED_NONE_FIXTURE'}});
            content=JSON.stringify({schemaVersion:'dialogue-reception/3',contextRef:input.contextRef,inputRef:input.assertion.inputRef,units:[{id:'turn',status:'extracted',claims:[],utterances:[],unresolved:[],coverage:{status:'none',evidence:{documentId:'current',start:0,end:text.length,quote:text},reason:'声明的纯动作接口夹具，无言说接收；非模型结果'}}]});
          }
          fsClinic.writeFileSync(stem+'.fixture.json',JSON.stringify({kind,content,synthetic:true,upstreamCalls:0}));
          liveConfig.cursor++;fsClinic.writeFileSync('dialogue-live-config.json',JSON.stringify(liveConfig));
          return response.json({choices:[{message:{role:'assistant',content},finish_reason:'stop'}],model:'LOCAL-DECLARED-FIXTURE'});
        }
        const until=Date.now()+600000;
        while(Date.now()<until){
          const releasedPath=liveConfig.liveDir+'/'+slot.id+'.release.json';
          if(fsClinic.existsSync(releasedPath)){
            const released=JSON.parse(fsClinic.readFileSync(releasedPath,'utf8'));
            if(!released.rawResponse)return response.status(418).json({error:{message:'MAINLINE_STOPPED_NO_REPLY'}});
            const sent=fsClinic.readFileSync(liveConfig.liveDir+'/'+slot.id+'.request.json','utf8');
            if(JSON.stringify(JSON.parse(sent))!==JSON.stringify(requestBody))return response.status(409).json({error:{message:'FROZEN_REQUEST_MISMATCH'}});
            const raw=fsClinic.readFileSync(liveConfig.liveDir+'/'+slot.id+'.raw-response.txt','utf8');
            fsClinic.writeFileSync(stem+'.delivered.json',JSON.stringify({rawReplay:true,synthetic:false,upstreamCallsFromBrowser:0}));
            liveConfig.cursor++;fsClinic.writeFileSync('dialogue-live-config.json',JSON.stringify(liveConfig));
            return response.type('application/json').send(raw);
          }
          await new Promise(resolve=>setTimeout(resolve,250));
        }
        return response.status(408).json({error:{message:'MAINLINE_WAIT_EXPIRED'}});
