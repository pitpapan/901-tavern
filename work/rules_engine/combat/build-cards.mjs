import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
const base=JSON.parse(await readFile(new URL('./duel.card.json',import.meta.url)));
for(const [file,name,source,buttons,first] of [
  ['duel-v2.card.json','901 姜黄反应与写回验收','tavern-script.js',
    ['初始化演练','模型行动一次','运行至结束','读取存档','补发已结算报告','停止演练'],
    '姜子尤与黄泉的隔离测试。初始化后运行，攻击先进入受击反应，模型选择后程序结算；战斗结束自动返回剧情，保存伤势与能量。'],
  ['four-person.card.json','901 四人战斗接口验收','four-person-script.js',
    ['初始化四人演练','继续战斗／玩家选择','查看当前面板','主持补参','补发已结算报告','停止演练'],
    '四人完整卡隔离演练，非帝都T0、非实际剧情，不计观澜法。御临风由玩家选择，其余人物由模型行动。测试专用补参：苍穹弓力量要求3、狮子王体积4、普通箭20；这些值不写入正式人物卡。初始化后继续，到玩家行动或受击反应会等待选择。']
]){
  const card=structuredClone(base);
  card.data.name=name;card.data.first_mes=first;card.data.description=first;card.data.creator_notes=first;
  card.data.scenario=first;card.data.character_version='combat-2';
  for(const script of card.data.extensions.tavern_helper.scripts) script.id=randomUUID();
  const script=card.data.extensions.tavern_helper.scripts[1];
  script.name=name;script.content=await readFile(new URL(source,import.meta.url),'utf8');
  script.button.buttons=buttons.map(name=>({name,visible:true}));
  card.data.extensions.regex_scripts=card.data.extensions.regex_scripts.flat().map(x=>({...x,id:randomUUID()}));
  await writeFile(new URL(file,import.meta.url),JSON.stringify(card,null,2)+'\n');
}
