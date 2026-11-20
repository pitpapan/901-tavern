        // ISOLATED synthetic interfaces only. Never included in the runtime package.
        const labState=JSON.parse(fsClinic.readFileSync('dialogue-lab-state.json','utf8'));
        const texts={
          A:'黄泉把目光从门外收回，对御临风说：“西侧栈桥暂时停用。”她把话说得清楚，御临风听见了。布莱特正在另一间屋里整理行装，没有听见这段谈话。门边的灯仍亮着，桌上那杯水也没有人动。',
          B:'黄泉对御临风和布莱特说：“交货地点改到南岗。”她停下话头，两人各自看着门外。刚才的话有一人没有听清，但这段记录不能指出是谁；也没有人复述消息。桌边仍留着原来的空位。',
          next:'黄泉收住话头，给眼前的谈话留出余地。布莱特仍在原处，没有另作解释。'
        };
        const flat=JSON.stringify(requestBody.messages);
        const kind=flat.includes('本次使用dialogue-reception/2')?'reception':flat.includes('只判断本次请求是否实际依赖某条待核消息')?'dependency':flat.includes('你是901行动分类器')?'classification':'narration';
        fsClinic.mkdirSync('dialogue-integration-ingress',{recursive:true});fsClinic.writeFileSync('dialogue-integration-ingress/'+Date.now()+'-'+kind+'.json',JSON.stringify(requestBody,null,2));
        let answer;
        const input=requestBody.messages.map(m=>{try{return JSON.parse(m.content);}catch{return null;}}).find(v=>v?.contextRef||v?.inputRef);
        if(kind==='classification')answer={status:'NO_CHECK',basis:'ordinary_dialogue',reason:'本地合成路径控制，非模型分类'};
        if(kind==='narration'){answer=labState.narrations===0?texts[labState.scenario]:texts.next;labState.narrations++;fsClinic.writeFileSync('dialogue-lab-state.json',JSON.stringify(labState));}
        if(kind==='dependency'){
          const relevant=['请按刚才说的交货地点安排送货。'].includes(input.request.text);
          if(!relevant&&!['我们谈谈午饭的口味。'].includes(input.request.text))return response.status(418).json({error:{message:'UNDECLARED_LOCAL_DEPENDENCY_FIXTURE'}});
          answer={inputRef:input.inputRef,required:relevant?input.pending.map(p=>p.id):[]};
        }
        if(kind==='reception'){
          const text=input.sourceAnchor.text,matches=t=>text===t||text===t+'\n\n<StatusPlaceHolderImpl/>',at=q=>({documentId:'current',start:text.indexOf(q),end:text.indexOf(q)+q.length,quote:q});
          const unit={id:'turn',status:'extracted',claims:[],utterances:[],unresolved:[],coverage:{status:'none',evidence:at(text),reason:'合成接口夹具，本段无新消息'}};
          if(matches(texts.A)||matches(texts.B)){
            const a=matches(texts.A),content=a?'西侧栈桥暂时停用。':'交货地点改到南岗。',evidence=a?'御临风听见了':'刚才的话有一人没有听清，但这段记录不能指出是谁';
            const recipients=a?['player']:['player','bright'];
            unit.utterances=[{claim:{id:'lab.speech',type:'utterance',args:{speaker:'黄泉',content},argumentSpans:{speaker:at('黄泉'),content:at(content)},mode:'asserted',scope:{time:null,condition:null,attribution:null},scopeSpans:{time:null,condition:null,attribution:null},anchor:at(text)},
              receptions:[{id:'lab.receipt',speakerId:'huang',recipientIds:recipients,recipientSpans:recipients.map(id=>at(input.actors[id])),evidence:at(evidence),status:a?'received':'uncertain',propositionRef:null,reason:a?'':'两人中一人未听清，无法指认；合成夹具不替玩家判断'}]}];
            unit.coverage={status:a?'recorded':'uncertain',evidence:at(text),reason:'本地合成接收夹具，非模型语义效果'};
          }else if(!matches(texts.next))return response.status(418).json({error:{message:'UNDECLARED_LOCAL_RECEPTION_FIXTURE'}});
          answer={schemaVersion:'dialogue-reception/2',contextRef:input.contextRef,inputRef:input.assertion.inputRef,units:[unit]};
        }
        const content=typeof answer==='string'?answer:JSON.stringify(answer);
        fsClinic.mkdirSync('dialogue-integration-captures',{recursive:true});
        fsClinic.writeFileSync('dialogue-integration-captures/'+Date.now()+'-'+kind+'.json',JSON.stringify({kind,scenario:labState.scenario,requestBody,content,synthetic:true,upstreamCalls:0},null,2));
        return response.json({choices:[{message:{role:'assistant',content},finish_reason:'stop'}],model:'LOCAL-SYNTHETIC-NOT-MODEL'});
