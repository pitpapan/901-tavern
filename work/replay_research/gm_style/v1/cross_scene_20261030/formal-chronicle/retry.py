"""Retry only the isolated manual fill, preserving the completed narration."""
from fixture import *
L=Path('C:/Users/pit/AppData/Local/901-formal-chronicle-load-20261031')
U=L/'data/default-user'
EXPLICIT='全局表的 prev_scene_time、elapsed_time、cur_time 未知时使用 SQL NULL（更新时也可保留已有值）；未知耗时不等于零，不填写“0分”，也不用“未交代”占据这三个时间列。“未交代”只用于纪要 time_span。'
if __name__=='__main__':
    from inspect_run import inspect
    lab.put(HERE/'attempt-legacy-manual.json',inspect())
    path=Path('chats')/lab.NAME/(lab.CHAT+'.jsonl')
    dst=U/path;rows=[json.loads(l) for l in dst.read_text(encoding='utf8').splitlines()]
    assert len(rows)==6 and rows[4]['mes']==question and '青瓦三叶' in rows[5]['mes']
    lab.put(L/'failed-manual-rows.json',rows)
    original=[json.loads(l) for l in (lab.FORMAL/path).read_text(encoding='utf8').splitlines()[:4]]
    original[0]['chat_metadata']['db_fact_acceptance_20261031']=rows[0]['chat_metadata']['db_fact_acceptance_20261031']
    sheet=original[3]['TavernDB_ACU_IsolatedData']['']['storageFrame']['checkpoint']['data']['sheet_ji_yao_biao']
    sheet['content'][1]=[1,'AM0001','未交代','镇民留下接头记号。',fact,'青瓦三叶']
    last=rows[5]
    for k in list(last):
        if k.startswith('TavernDB_'):del last[k]
    restored=original+rows[4:]
    dst.write_text(''.join(json.dumps(r,ensure_ascii=False)+'\n' for r in restored),encoding='utf8')
    s=read(U/'settings.json');store,key,cfg=profile(s)
    assert not cfg['autoUpdateEnabled']
    cfg['charCardPrompt'][0]['content']+='\n'+EXPLICIT
    cfg['skipUpdateFloors']=0
    # Set documented manual window only; leave formal settings intact.
    cfg['manualUpdateContextDepth']=1
    store[key]=json.dumps(cfg,ensure_ascii=False)
    lab.put(U/'settings.json',s)
    (L/'stdout.log').rename(L/'attempt-legacy.stdout.log')
    print('Isolated retry ready. Original narration retained; latest floor included; SQL NULL rule added.')
