        // Capture the actual assembled wire request. This path has no release or forward operation.
        const lab = JSON.parse(fs901.readFileSync('clinic-topic-config.json', 'utf8'));
        const kind = requestBody.messages.some(m => String(m.content ?? '').includes('你是901行动分类器')) ? 'classification' : 'narration';
        const bytes = Buffer.from(config.body);
        const digest = hash901('sha256').update(bytes).digest('hex');
        const prefix = lab.captureDir + '/' + lab.phase + '.' + kind;
        fs901.writeFileSync(prefix + '.request.json', bytes, {flag:'wx'});
        fs901.writeFileSync(prefix + '.capture.json', JSON.stringify({phase:lab.phase,kind,sha256:digest,bytes:bytes.length,
          localClassificationFixture:kind==='classification',upstreamCalls:0,endpointIsLocal:endpointUrl.startsWith('http://127.0.0.1:18132/')},null,2), {flag:'wx'});
        if (kind === 'classification')
          return response.json({choices:[{message:{role:'assistant',content:JSON.stringify({status:'NO_CHECK',basis:'ordinary_dialogue',
             reason:'隔离捕获使用既有普通问答裁定路径；这不是新分类。'})},finish_reason:'stop'}]});
        return response.status(418).json({error:{message:'LOCAL_CAPTURE_NOT_SENT_NO_RESPONSE'}});
