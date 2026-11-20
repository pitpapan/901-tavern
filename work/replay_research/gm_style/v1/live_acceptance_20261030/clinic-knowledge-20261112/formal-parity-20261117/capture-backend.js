        // Offline preparation: capture the exact real request, never send it.
        const lab901=JSON.parse(fs901.readFileSync('clinic-parity-config.json','utf8'));
        const kind901=requestBody.messages.some(m=>String(m.content??'').includes('你是901行动分类器'))?'classification':'narration';
        const budget901=fs901.existsSync(lab901.evidenceDir+'/../run.json')?JSON.parse(fs901.readFileSync(lab901.evidenceDir+'/../run.json','utf8')):{used:0,cumulative:546};
        const bytes901=Buffer.from(config.body),digest901=hash901('sha256').update(bytes901).digest('hex');
        const prefix901=lab901.captureDir+'/'+lab901.phase+'.'+kind901+'.'+digest901;
        if(!fs901.existsSync(prefix901+'.request.json'))fs901.writeFileSync(prefix901+'.request.json',bytes901,{flag:'wx'});
        if(!fs901.existsSync(prefix901+'.capture.json'))fs901.writeFileSync(prefix901+'.capture.json',JSON.stringify({phase:lab901.phase,kind:kind901,endpoint:endpointUrl,
          requestSha256:digest901,requestBytes:bytes901.length,classificationFixture:false,browserUpstreamCalls:0,externalModelCalls:budget901.used,cumulative:budget901.cumulative,parameters:Object.fromEntries(Object.entries(requestBody).filter(([k])=>k!=='messages'))},null,2),{flag:'wx'});
        lab901.sequence++;fs901.writeFileSync('clinic-parity-config.json',JSON.stringify(lab901));
        const release901=prefix901+'.release.json';
        if(fs901.existsSync(release901)){
          const release=JSON.parse(fs901.readFileSync(release901,'utf8'));
          if(release.requestSha256!==digest901)throw Error('Authorized response request hash mismatch');
          return response.json(release.rawResponse);
        }
        return response.status(418).json({error:{message:'LOCAL_CAPTURE_NOT_SENT: awaiting separately authorized real classification'}});
