# 无限恐怖 2.5：PHB／RE 完整来源库

已收录 **PHB v0.3 16 页＋RE v1.03先行版 964 页，共 980 页**。原有 185 页及其路径保留，补入 795 页；原始 HTML、HHC、HHK、配套图片与两份 CHM 均保留。完整指这两份原书实际存在的文件；原 RE 目录中两个本已缺失的目标仍作为来源缺口记录，不补造正文。

**来源收录不等于 901 采用。** 规则优先看 [901 已采用核心](../work/rules_fusion/901-core-rules-v0.1.md)，创作从 [资源撰写入口](../work/character_builder/resource_authoring/README.md) 开始。

## 按需入口

- [按问题找规则与机制](indices/mechanisms.md)
- [资源：723 页](indices/resources.md)（能力组、技艺、血统、改造、物品、能量等）
- [特性列表：5 页](indices/traits.md)；[怪物：19 页](indices/bestiary.md)
- [PHB](indices/PHB.md)；[核心规则](indices/rules.md)；[版本与序言](indices/meta.md)
- [杂项、待重置、移除、施工：48 页](indices/misc.md)

## 少量检索，再读原段落

从本目录执行（只需 Python 标准库；`-X utf8` 避免 Windows 控制台乱码）：

```powershell
python -X utf8 tools/library.py cards CR-04 TB-01 T-02 S-01 S-08
python -X utf8 tools/library.py search 剑盾战斗 --kind rules --limit 3
python -X utf8 tools/library.py search --kind resources --tag 协作 --limit 5
python -X utf8 tools/library.py search 武士 C级 --kind resources --limit 2
python -X utf8 tools/library.py read 'content/RE/02_resources/能力组/近战类型/武器类型/武士.md' --start 6 --lines 32
```

`catalog.jsonl`／`catalog.tsv` 为全页目录，含原文路径、版本、来源状态、哈希。`passages.jsonl` 为 **5004 个有少量重叠的定位片段**，包含行号、原文和粗略机制标签。它不是全书人工逐技能拆解，也不自动推断阶段价格和预算。默认搜索排除待重置、已移除、施工内容；确需比较时加 `--include-legacy`。`称号／训练→能力组`、`技能→技艺` 等别名仅帮助搜索，不修改原文名称。

## 来源与维护

每篇 Markdown 顶部链接原始 HTML。新增页按文本块转换；表格单元内容保留，复杂合并单元格、图像和排版必须核对原始 HTML。保留原有转码页，不批量重排已被引用的内容。

[来源指纹与原书缺页](source_archives/provenance.json) 记录 CHM 的 SHA-256；[转换报告](REPORT.md) 说明完整性和边界。

```powershell
python -X utf8 tools/check_library.py
python -X utf8 tools/library.py index
```

第一条只读检查完整性；第二条重建自动索引，不修改正文或人工规则／样板卡。若要重新核对保留的 HTML 并重建目录，可执行：

```powershell
python -X utf8 tools/library.py import --re source_html/RE --phb source_html/PHB
```

首次从 CHM 重建原始文件时，使用 Windows `hh.exe -decompile <输出目录> <CHM>`，建议用本库 `source_archives` 中的 ASCII 文件名、隐藏窗口；导入工具遇到同名不同原文会停止，禁止静默覆盖。人工规则卡和样板卡由作者维护，不从样例自动提升为通则。
