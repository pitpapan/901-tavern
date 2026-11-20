"""Build the local, uninstalled 901 candidate from the audited V5 export."""
import argparse
import hashlib
import json
from pathlib import Path

SOURCE_SHA256 = "7ecaa3edf394eb1fa684acdd834a1df679fd5829cc68948577fc98d51a2fb488"
OUTPUT = Path(__file__).resolve().parents[3] / "output/replay_tavern/model_preset_v1/梦鲸思客V5-1025-exp-fix1-901-local.json"
ENGINE_OUTPUT = OUTPUT.with_name("梦鲸思客V5-1025-exp-fix1-901-engine-isolated.json")

# Replace only the pure patch parser/matcher. Existing history and undo UI remain.
# All FINDs resolve against the original message; records use original segment offsets.
PATCH_FUNCTION = r"""function d(e,t){
 const errors=[],records=[],planned=[],segments=i(e);
 const text=t.replace(/\r\n?/g,'\n').replace(/^\n+|\n+$/g,'');
 if(!text.trim())return{message:e,records,success_count:0,skipped_count:1,errors:['Patch 内容为空。']};
 const definitions=text.split(/\n[ \t]*\n(?=FIND:[ \t]*)/);
 definitions.forEach((definition,source_index)=>{
  const match=definition.match(/^FIND:[ \t]*([^\n]+)\nREPLACE:[ \t]?([^\n]*)$/);
  if(!match||!match[1]){errors.push(`第 ${source_index+1} 个 Patch 不符合单行 FIND/REPLACE 格式。`);return;}
  const find=match[1],replace=match[2],hits=[];
  for(const segment of segments){
   let offset=segment.content.indexOf(find);
   while(offset!==-1){hits.push({segment,offset,start:segment.content_start+offset});offset=segment.content.indexOf(find,offset+1);}
  }
  if(hits.length!==1){errors.push(`第 ${source_index+1} 个 Patch 的 FIND 在原正文中必须唯一匹配（实际 ${hits.length} 处）。`);return;}
  const {segment,offset,start}=hits[0],end=start+find.length;
  if(planned.some(p=>start<p.end&&end>p.start)){errors.push(`第 ${source_index+1} 个 Patch 与其他补丁重叠。`);return;}
  if(find===replace){errors.push(`第 ${source_index+1} 个 Patch 没有文字变化。`);return;}
  planned.push({start,end,replace});
  records.push({patch_index:source_index,before:find,after:replace,target:segment.kind,occurrence:segment.occurrence,index:offset,
   left_context:segment.content.slice(Math.max(0,offset-64),offset),right_context:segment.content.slice(offset+find.length,offset+find.length+64),reverted:!1});
 });
 let message=e;
 for(const p of planned.sort((a,b)=>b.start-a.start))message=u(message,p.start,p.end-p.start,p.replace);
 return{message,records,success_count:records.length,skipped_count:errors.length,errors};
}"""


def build(source):
    raw = source.read_bytes()
    if hashlib.sha256(raw).hexdigest() != SOURCE_SHA256:
        raise ValueError("输入不是已核对的 V5 导出；请先核对版本，不盲目套补丁。")
    data = json.loads(raw)
    prompts = {p["name"]: p for p in data["prompts"]}
    scripts = {s["name"]: s for s in data["extensions"]["tavern_helper"]["scripts"]}

    def replace(name, old, new):
        content = prompts[name]["content"]
        if content.count(old) != 1:
            raise ValueError(f"{name}: 修订定位不唯一")
        prompts[name]["content"] = content.replace(old, new)

    def enable(name, value):
        p = prompts[name]
        p["enabled"] = value
        for group in data["prompt_order"]:
            for entry in group["order"]:
                if entry["identifier"] == p["identifier"]:
                    entry["enabled"] = value

    # The exported order is the effective baseline, including the disabled small summary.
    order = {e["identifier"]: e["enabled"] for e in data["prompt_order"][0]["order"]}
    for p in data["prompts"]:
        if p["identifier"] in order:
            p["enabled"] = order[p["identifier"]]
    replace("写作模式", "{{setvar::sleep_var_mvu_no_update::}}", "{{getvar::sleep_var_mvu_no_update}}")
    enable("MVU不更新 - 额外模型解析打开", True)
    enable("MVU强制 - 掉格式打开", False)
    replace("梦境自检修复 - 反八股",
            "完成检查后，需要输出至少三项、至多十项改动优化。因为若不能发现输出问题则代表对输出质量失去了判断力。",
            "改动数量由有依据的问题决定，允许零项；没有问题就报告通过，不为凑数修改。已结算结果、时间、费用和角色选择不得借修文改变。")

    repair = scripts["梦境自修复 1.0"]
    start = repair["content"].index("function d(e,t){")
    end = repair["content"].index("function l(", start)
    repair["content"] = (repair["content"][:start] + PATCH_FUNCTION + repair["content"][end:]).replace("//# sourceMappingURL=index.js.map", "")
    repair["info"] = "901 本地候选：FIND 字面唯一匹配，基于原文定位并拒绝重叠；保留原记录和撤销界面。未进行酒馆事件/撤销实测，脚本默认禁用。"

    # Campaign expression/authority settings; do not change generic engine defaults.
    enable("转述抢话", False)
    enable("转述不抢话", True)
    prompts["转述不抢话"]["content"] = """{{setvar::sleep_var_qianghua::
御临风采用有限代办：已授权的告知和连续行动可用第三人称概述；新增对白、决定、承诺、心理和信息披露由玩家决定。
用户输入中的尝试仍须等待相应裁定，不预写成功；不重复扩写已交代内容，不附加选择菜单或催促交棒。
}}"""
    enable("第三人称", True)
    for name in ["第一人称", "第二人称", "思客大调查 - 展现你的剧情理解吧", "梦境平行事件",
                 "梦境选项 - 正常推进", "梦境选项 - NSFW推进", "梦境自检修复 - 反八股"]:
        enable(name, False)
    replace("思客：温和叙者",
            "* 制造挑战难度：中等，动态调整。据当前的叙事节奏，灵活调配挑战难度。在文戏时更偏重逻辑，在动作戏时更偏重局势。",
            "* 只调整表达节奏和镜头。遵守已确认的主持难度、规则结果、人物能力和事件条件；不得为了加速剧情改变数值、补造危机或把计划写成已发生事实。")
    prompts["梦境场景信息"]["content"] = """{{addvar::sleep_dream_protocol::,DREAM_SCENE_INFO}}
【梦境场景信息协议】
在正文开始前显示已确认的当前日期、时间和地点。以当前保留分支、已确认现场及规则结果为依据；原团历史、作者方案或平行事件不构成当前现场。
缺少精确值时保留已知精度或写“未知／未明确”，不推断日期、钟点、房间号或时间流逝。信息栏只显示资料，不修改存档和世界时钟。
<dream_scene>
<date>已确认日期或未知</date>
<time>已确认时间或未知</time>
<location>已确认地点或未知</location>
</dream_scene>"""
    for name in ["基米工具 1.0", "格式补全 1.2", "思维链提取到正文 1.0", "梦境自修复 1.0"]:
        scripts[name]["enabled"] = False
    scripts["基米工具 1.0"]["data"]["tool_output_bridge"]["enabled"] = False
    data["extensions"]["tool_output_bridge"]["enabled"] = False
    return data


def build_engine_isolated(source):
    """V5 coexistence profile; engine requests use their own JSON protocol.

    Preserve the reviewed native candidate and the source. No V5 event lifecycle,
    prompt macro chain, history transformation or message repair is activated.
    """
    data = build(source)
    for script in data["extensions"]["tavern_helper"]["scripts"]:
        script["enabled"] = False
    for regex in data["extensions"]["regex_scripts"]:
        regex["disabled"] = True
    data["function_calling"] = False
    data["extensions"]["tool_output_bridge"]["enabled"] = False

    # Native markers remain available to ST's own prompt preview. None of them
    # are imported by the engine server's buildChatRequest.
    for prompt in data["prompts"]:
        prompt["enabled"] = bool(prompt.get("marker"))
    authority = {
        "identifier": "901-engine-authority",
        "name": "901 引擎隔离共存说明",
        "enabled": True,
        "role": "system",
        "content": "这是901独立引擎的隔离共存预设。行动、规则结算和正式叙述通过901面板执行；普通酒馆生成不能替代引擎回执。只使用当前分支已确认事实，不改变结果、费用、时间或玩家选择。原梦鲸脚本、宏链、工具桥、摘要历史加工和直接修文均关闭。独立引擎请求由服务器自己的JSON协议构造，不读取本预设或酒馆世界书与历史。",
        "injection_position": 0,
        "injection_depth": 4,
        "injection_order": 100,
        "forbid_overrides": True,
    }
    data["prompts"].append(authority)
    enabled = {p["identifier"]: p["enabled"] for p in data["prompts"]}
    for group in data["prompt_order"]:
        for entry in group["order"]:
            entry["enabled"] = enabled.get(entry["identifier"], False)
        group["order"].insert(0, {"identifier": authority["identifier"], "enabled": True})
    return data


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("--profile", choices=["901-local", "901-engine-isolated"], default="901-local")
    args = parser.parse_args()
    isolated = args.profile == "901-engine-isolated"
    result = build_engine_isolated(args.source) if isolated else build(args.source)
    output = ENGINE_OUTPUT if isolated else OUTPUT
    if args.source.resolve() == output.resolve():
        raise ValueError("不能覆盖来源文件")
    output.write_text(json.dumps(result, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
    print(output)
