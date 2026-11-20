---
layout: post
title: pi agent无人值守工作案例一(talentsai)
categories:
  - tool
tags:
  - content
  - pi
  - agent
  - auto
last_modified_at: 2026-10-12T18:13
created: 2026-10-12T09:24
---

> 本文是 TalentsAI 项目的业务案例，重点说明领题、Coding/长文/Office 制作、录屏、评测、质检、返修、提交和审核如何接入无人值守系统。  
> 网页上有足够的状态接口和事件通知接口. 且流程简单, 适合测试工作流. 

---

## 1. 案例概览

这个项目并不是一个单体爬虫，而是一套运行在 Mac mini 上的 **LLM Agent 运维与出题流水线**：

- Pi 主 session 负责全局调度、任务路由和异常决策；
- 每道题由一个可持久化的独立 subagent/worker 负责；
- Python watcher 监控平台状态、评测、审核、通知和录屏；
- `pi-agent-notify` 把脚本事件直接注入对应 Pi session；
- `pi-subagent-durable` 让 worker 可长期运行、等待、重启和原会话续作；
- Playwright/CDP、平台 API、Web IDE、Git/OSS、Harbor/Docker 组成实际执行面；
- JSON 台账、checkpoint、哈希、transaction/request 证据组成状态与审计面；
- 只有原生录屏授权、登录失效、验证码、真实性/合规疑问及重大不可逆决策才升级给人。

### 1.1 通用机制在本案例中的映射

| 通用机制   | TalentsAI 的具体对象与实现                                            |
| ------ | ------------------------------------------------------------- |
| 任务所有权  | 一道题（item）对应唯一 worker taskId                                   |
| 外部状态观察 | 通知中心、discussions、执行/QC/审核状态、录屏健康                              |
| 事件路由   | watcher → `pi-agent-notify` → 主 session 或对应 worker            |
| 长等待恢复  | 执行、模型生成、冷却、报告等待使用 watcher + durable wait lease                |
| 执行资源隔离 | account + itemId 绑定 Cookie、Chrome profile、CDP、exact URL 和 REC |
| 交付版本证据 | 本地稿/题包、Git commit、OSS manifest、Prompt、request/transaction     |
| 业务完成条件 | 平台权威状态迁移且当前无待处理返修；提交不等于审核通过                                   |
| 人工升级   | 原生授权、登录/验证码、真实性与合规、重大不可逆决策                                    |


---

## 2. 从领题到提交的业务闭环

### 2.1 日常入口：机会、考试、协议、领题

系统规划的日常顺序是：

```text
检查多账号机会与配额
  → 申请岗位/项目
  → 完成培训考试
  → 签署必要协议
  → quick claim 创建或领取 item
  → 分配独占浏览器与录屏实例
  → 创建唯一 worker
```

配套状态通常落在：

- `config/accounts.json`：账号级配置；
- `docs/project_opportunities.json`：多账号机会与可领状态；
- `docs/current_tasks.json`：当前任务台账；
- `topics_registry.json`：同项目已用题材，防止新题撞题；
- item 专属 `checkpoint/`、`status.md` 和项目 notes。

平台规则不是靠本地猜测硬编码，而是通过只读 API 和真实 UI 回读确认。例如，是否可创建新题最终以平台返回的 gate/错误为准，而不是仅凭本地 `canCreateNewItem` 推断。

### 2.2 单题 worker 生命周期

```text
创建 worker
  → 读取 worker 规则、题型方法论、项目 notes、完整通知/批注
  → 核验账号 + exact URL + REC + 平台权威状态
  → 开始一个 iteration 并写台账
  → 本地制作或返修
  → 本地完整验证
  → UI/IDE/平台同步
  → 启动唯一 watcher
  → arm_notification_wait
  → worker 释放模型回合但进程不退出
  → watcher 检测状态变化并定向通知该 worker
  → 同一 session 被唤醒，重新读 checkpoint 和权威状态
  → 继续 QC/返修/提交
  → 平台进入 review/pending_claim/in_review 且无返修
  → 写终态、经验、changed files，worker 自然退出
```

这里的关键不是“worker 永远占着一个前台进程”，而是 **外部观察者 + 有界等待租约 + 原 session 唤醒**。

### 2.3 通知路由

不同 watcher 各司其职：

| 组件 | 主要职责 |
|---|---|
| `notification_watch.py` | 监控通知中心的考试通过、试标通过、质检报告、提及、申诉结果、推送等类别 |
| `rejection_watch.py` | 全局监控 `item_rejected` |
| `reviewwatch.py` | 固定 item 的状态、返修、discussions、平台接手情况 |
| `ledger_watch.py` | 监控 `current_tasks.json` 的业务状态变化 |
| `opportunity_watch` | 多账号可申请/可领机会变化 |
| item poller | 单次执行、模型生成、冷却、QC 或报告生成的长流程 |
| `recording_supervisor.py` | 每个 item 的 Chrome/CDP/profile/REC 健康、自愈与冲突检测 |
| `keepalive2.py` | 页面活动、暂停恢复等录屏保活动作 |
| `recwatch.py` | 录屏时长里程碑与状态观察 |

事件按语义分级：

- **green**：正常进展或备忘，不打扰用户；
- **yellow**：Agent 可以自行处理，注入主 session 或定向 worker；
- **red**：必须由用户介入或拍板，才使用 TUI 高亮/语音。

通知只是“发生变化”的信号。Agent 收到后仍必须核对 itemId、通知时间/notificationId、完整 discussions、最新报告及平台当前状态。

### 2.4 平台长流程如何等待

单次执行、模型生成、冷却和 QC/报告生成由 item 专属 watcher 观察。worker 在启动唯一 watcher、写入 launch marker 和 checkpoint 后，使用 `arm_notification_wait` 声明精确唤醒条件。事件回到同一 worker session 后，重新读取平台状态和版本证据，再决定下一步。

durable wait lease 的七步协议及失败关闭条件见通用篇。审核阶段不能混同制作阶段：题目已进入平台接手状态且没有当前待办时，worker 应核验终态、沉淀并退出，由审核 watcher 继续观察；出现真实返修再按所有权规则恢复或新建 worker。


---

## 3. 多账号、多题、多浏览器如何隔离

### 3.1 资源绑定

后期方案从“一个共享 Chrome 跑多个题”演进为：

```text
account + itemId
  ↔ 独占 Cookie 文件
  ↔ 独占 Chrome profile
  ↔ 独占 CDP 端口
  ↔ exact activity URL
  ↔ 独占 recording binding
  ↔ 唯一 worker taskId
```

其目的不是单纯并发，而是防止：

- 用错账号提交；
- `pages[0]` 误选到另一题；
- 一个 worker 关闭共享浏览器导致其他题断录；
- 同一个 profile/CDP 被两个 item 占用；
- watcher 把事件投递给已经结束或已替换的 worker。

### 3.2 录屏自愈


录屏链路分三层：

1. **supervisor**：发现 Chrome/page/REC 缺失，按注册表重启专属实例或打开精确 item tab；遇到端口、profile、item 冲突时 fail closed。
2. **keepalive**：移动鼠标、滚动、恢复“计时已暂停”等常规状态。
3. **人工授权边界**：macOS 原生“整个屏幕→分享”和首次 TCC 授权不作为可靠后台自动点击目标。

早期 `keepalive2.py` 曾使用 `screencapture + Pillow` 查找蓝色按钮，再通过 Quartz `CGEventPost` 点击。它证明了技术上可模拟鼠标，但在多窗口、多账号和原生弹窗环境下容易误点。后期生产规则改为：**常规暂停自动恢复；原生首次授权明确红色升级，禁止 worker 盲点。**

录屏时长只是一项前置条件，不等于“可以提交”。后期通知文案也从“录屏达标，可提交”纠正为“录屏时长达标，仍需内容/评测门禁通过”。

保活动作应在真实授权和平台允许范围内进行，不能伪造工作或规避审计。录制范围、保存位置、访问权限和保留期应明确，避免记录无关账号、个人信息与凭证。

---

## 4. Coding 题的自动化闭环

### 4.1 本地题包

典型结构：

```text
environment/
instruction.md
solution/solve.sh
tests/test.sh
tests/test_outputs.py
task.toml
```

设计和返修要形成四方契约：

```text
instruction 公开要求
  ↔ environment 真实故障
  ↔ solution 完整修复
  ↔ tests 黑盒验证
```

主要门禁：

- Oracle = 1；
- NOP = 0；
- reward 严格 0/1；
- 题面每个“必须/不得”都有测试；
- 每个测试断言都能回溯到题面公开要求；
- solution 从运行时输入、日志和输出动态生成结果，不能写死诊断报告；
- Agent 的公开入口不得依赖 `/solution`；
- 失败传播、旧输出清理、重复/乱序/非法值、幂等、合法输入变形均被覆盖；
- 进程有界、依赖固定、输入只读、schema/计数/精度一致；
- 去除 `SYNTH`、机械递增 ID、模板化规格句式等合成痕迹。

### 4.2 Harbor 与容器验证

本地校验不以 host 上“看起来能跑”为准，而是：

- Harbor v0.5.0；
- Python + `uv`；
- Docker/Colima；
- 必要时 network-disabled Docker；
- Oracle、NOP、负例、合法变形和完整 trajectory/reward 证据。

这一步解决了“随便改环境”“本地模拟通过但平台失败”“Verifier 装配不一致”等问题。

### 4.3 Web IDE、Git 与 OSS

题包上传链路包含：

- Playwright 连接平台 Web IDE；
- 定位 code-server/OpenVSCode 的 `xterm-helper-textarea`；
- 使用 `insert_text` 输入 base64/gzip/tar 命令，避免 `keyboard.type` 丢字符；
- 逐文件 SHA-256 校验；
- Git commit/push，确认 `HEAD == origin/main`；
- 回到真实 UI 执行“保存并执行”；
- 由 UI 的 acquire 流程重新打包 OSS `code.zip`；
- 下载并校验 OSS 根 commit 和全文件 manifest。

一个关键事实是：**普通表单保存和 raw trigger 并不会可靠地重打包 OSS。** 只有完整 UI“保存并执行”/acquire 链路能保证平台评测拿到新包。因此后期禁止直接调用 raw execution endpoint，也禁止拆开 acquire/confirm。

### 4.4 评测、QC 和提交

```text
唯一 save_execute_ui 事务
  → request-bound watcher
  → 执行终态
  → 下载最新 quality_check.json
  → QC fail 有界修复
  → 难度不足则做真实增阶
  → fresh R1/R2/R3
  → 处理真实 finding
  → 普通提交；必要时按平台规则强提/申诉
  → 权威状态复查
```

后期形成的规则包括：

- `level_not_ready`/L0 是需要主动增阶的正常迭代状态，不是空等理由；
- `canTrigger=false` 必须查真实原因，不能假设平台会自己恢复；
- 平台 QC 的真实 fail 必须修，不能因为某个评分跷跷板就整体忽略；
- 已知的 P5/T7 与 instruction leakage 权衡只是 R2 评分策略，不是 QC 豁免；
- 每一轮必须记录修改方向、包指纹、attempt、报告结果和是否有效；
- 迭代有上限，修复手段穷尽后才按规则强提；无次数且流程不合理时才进入申诉。

---

## 5. 长文、Word、PPT 类任务的自动化闭环

### 5.1 真实性优先

文字/Office 任务后期把真实性提升为最高门禁：

- 使用 `agy_websearch` 或通用 `web_search` 查真实公开原始材料；
- 固化 URL、访问日期、采用事实、公式和适用范围；
- 不凭记忆编造法规、材料、数字或来源；
- 不能把重制材料伪装成原始业务材料；
- 题面不能泄露埋点位置、权威文档或答案路径。

`agy_vision` 只用于理解真正的图片/表格，不用于网页 DOM 定位；网页操作优先 Playwright/DOM。

### 5.2 本地稿与版本一致性

长文任务多次被打回的主要原因之一，是：

```text
题目 Prompt 已修改
但模型仍使用旧 Prompt / PromptBase / 旧附件 / 旧 transaction
```

后期门禁要求：

1. 每次实质修改先写本地权威稿；
2. 通过真实 UI 保存并回读 Prompt、PromptBase、附件和时间/指纹；
3. 清理旧模型状态；
4. fresh 生成模型一、模型二；
5. 证明 transaction/startTime 晚于最终保存；
6. 下载 DOCX/PPT，独立检查可打开、页数、正文、表格、文件名和最终 Prompt 对应；
7. 只基于 fresh 产物逐条诚实评分。

### 5.3 Office 工具链

使用过的技术包括：

- `python-docx` 生成和检查 Word；
- OOXML/ZIP 级完整性与元数据检查；
- PPTX/DOCX 的页数、尺寸、可编辑性和文件结构核验；
- LibreOffice 打开验证；
- SHA/大小/文件名与 OSS 上传结果比对；
- 去除不必要的 AI 模板痕迹，但不伪造来源或作者身份。

### 5.4 模型难度与评分

- Rubrics 必须原子、独立、二元、可公开判断；
- 禁止正负镜像重复、捆绑多个断言、Prompt 外隐藏限制；
- 模型得分下降必须来自真实任务复杂度，而不是扩大分母、隐藏条件或不诚实判分；
- 可以内部参考模型思考过程寻找薄弱点，但不得把它泄露到 Prompt、答案或评分规则；
- 题目/附件/参考答案/思考路径/Rubrics/模型回复必须保持同版本闭合。

### 5.5 人工评审回复

通知中的 `mention` 和返修 discussions 需要作为正式任务处理。回复原则：

- 通过真实 UI 回复并回读 reply；
- 先读完整 discussion 和 anchor，避免根据截断通知误回；
- 语气自然、礼貌、面向真人；
- 平台可见内容绝不出现 API、脚本、worker、内部 ID、watcher、checkpoint 等术语；
- 已回复的 discussion 不重复回复。

---

## 6. 状态、证据和知识如何落盘

### 6.1 五态业务状态机

项目把容易混淆的平台内部字段归一为五种业务状态：

```text
待处理 / 流转中 / 申诉中 / 已完成 / 废弃
```

平台的 `stage/currentStatus/currentActivity/isInRepair` 仍保留为 raw facts，但 worker 是否继续、等待或退出，主要根据归一业务状态和实际待办判断。

### 6.2 三层持久化

1. **全局台账**：`docs/current_tasks.json`，记录账号、item、业务状态、平台事实、当前动作、worker、录屏、通知和迭代摘要。
2. **单题 checkpoint**：记录最新权威状态、已经做过的动作、request/transaction、commit/SHA、watcher、下一动作。
3. **长期经验**：
   - 通用脚本：`scripts/agents/`；
   - 有效/无效自动化方法：自动化经验文档；
   - 可复现坑：踩坑章节；
   - 项目规则：`project_X/notes/`；
   - 新工具索引：资产手册/自动生成 README。

### 6.3 每轮 iteration ledger

后期要求每轮记录：

- 修改方向；
- 触发依据；
- 本地和平台版本指纹；
- attempt/rework 计数；
- QC、难度、R1/R2/R3 结果；
- 该轮是否有效；
- 下一步是继续修、强提、申诉还是终止。

目的是防止 worker 在多轮返修中重复做无效修改或陷入死循环，并为统一方法论提供数据。

---

## 7. TalentsAI 业务执行技术栈

以下列出本案例直接完成做题与交付的工具。

| 环节 | 技术 | 本案例用途与限制 |
|---|---|---|
| 平台状态 | REST API、Cookie session、`urllib`/fetch | 回读通知、机会、jobData 和权威状态；Cookie 按账号隔离，401 停止 |
| 真实 UI | Playwright、CDP、WebSocket | 表单、iframe、下载、网络监听；绑定 exact URL，不选 `pages[0]` |
| 录屏资源 | Chrome profile、独占 CDP、supervisor/keepalive/recwatch | 多账号、多 item 隔离；原生首次授权仍需人工 |
| Coding 验证 | Harbor v0.5.0、Python、`uv`、Docker/Colima、Docker Compose | Oracle/NOP、negative path、合法变形、trajectory/reward；必要时禁网容器 |
| Web IDE | code-server/OpenVSCode、xterm.js | 沙箱终端、上传、Git 管理 |
| 受限传输 | base64、gzip、tar、`insert_text` | 避免 `keyboard.type` 丢字符 |
| 版本校验 | Git、SHA-256、manifest | 本地/IDE/`origin/main`/OSS 一致性 |
| 平台打包 | UI acquire + OSS `code.zip` | 真实 UI“保存并执行”重新打包，禁止 raw execution 捷径 |
| 材料研究 | agy MCP websearch/vision、通用 web search | 查真实材料、法规、公式；vision 用于图片/表格理解，不替代 DOM 定位 |
| Office 制作 | `python-docx`、OOXML ZIP、LibreOffice | 文件构建、元数据处理、可打开性与结构验证 |
| 项目门禁 | 项目级 Pi safety extension | 阻断错身份/错页面、共享浏览器关闭、raw execution 和旧包评测等危险操作 |

早期 macOS 按钮识别试验使用 Quartz、`CGEventPost`、`screencapture` 和 Pillow；原生授权自动盲点并未被作为可靠生产方案。


### 7.1 TalentsAI 专用项目 harness


项目不只有通用 Pi 和脚本，还叠加了一层 **TalentsAI 专用的运行约束与执行门禁**。本节将这组组件称为“项目级 harness”. 约束 Agent 如何做题、如何用工具、如何同步版本、如何等待及收尾；核心安全扩展是 `.pi/extensions/talentsai-safety/`。

### 7.2 它由哪些层组成

| 层 | Mac mini 上的实际入口 | 职责及约束性质 |
|---|---|---|
| 项目默认规则 | `AGENTS.md` | 中文业务交接、最新任务指令优先、客服沟通及评分异常处理；属于 Agent 需要遵守的规则 |
| 项目 worker overlay | `.pi/agents/_worker.md` | 在通用 worker 上叠加角色、必读资料、题型、等待、迭代和退出契约；不是独立 worker 引擎 |
| 业务 skills | `.pi/skills/talentsai-{daily-workflow,outti-automation,longwen-methodology}/SKILL.md` | 按日常工作流、出题、长文方法论选择规则；专门的 `keynote-native-ppt` skill 约束对应 PPT 本地制作 |
| 工具前安全扩展 | `.pi/extensions/talentsai-safety/index.ts` + `guard.mjs` | 注入执行政策，拦截已识别的危险 bash/write/edit 路径并审计；是实际代码门禁 |
| 动作与质量门禁 | `scripts/coding/`、`scripts/longwen/`、`scripts/support/` 等维护脚本 | 核验身份、当前平台状态、产物版本与业务前置条件；具体规则由执行脚本实现 |
| 状态与证据 | `update_task_business.py`、`record_iteration.py`、checkpoint、registry、watcher marker | 原子更新、迭代证据、所有权交接和恢复；不把“写了台账”当作动作成功 |

整体关系：

```text
通用 Pi session / durable worker / agent-notify
  → TalentsAI AGENTS + worker overlay + skills
  → talentsai-safety 工具前拦截
  → 维护脚本的身份、事务、版本及质量 preflight
  → 真实平台 UI / 只读状态 / 本地验证
  → request-bound watcher + wait lease
  → 迭代证据、台账、实际退出后的 owner 清理
```

录屏、计时保活及原生屏幕共享授权在这里是 **TalentsAI 业务前置条件**，仍只属于案例层，不进入通用任务机制。

### 7.3 安全扩展具体拦截什么

**`index.ts` 注册了三类 hook：**

1. **`before_agent_start`**：把 TalentsAI 执行政策加到 system prompt，提示使用完整 UI 保存并执行事务、精确页面和只读 watcher。
2. **`tool_call`**：检查 `bash` 命令、可识别的被执行脚本源码，以及 `write/edit` 引入的新可执行代码。直接写改 `docs/current_tasks.json` 也被拒绝，要求走统一 updater。
3. **`user_bash`**：对 Pi 的直接 shell 入口做同类检查；被拒绝时返回阻断结果，exit code 为 126。

`guard.mjs` 当前识别的危险模式主要包括：

- 直接 POST raw execution endpoint，包括常见字符串拼接、shell 简单变量拼接和 URL 编码形式；避免跳过 acquire 而评测旧 `code.zip`。
- 在可执行源码中新增该 endpoint token，以及通过多次 edit 组装出新 token。
- CDP 连接后关闭持久浏览器，或选用 `pages[0]` 而不是登记的 exact item URL。
- 通过删除授权/确认遮罩跳过平台交互。

拦截记录写入 `.pi/safety-events/raw-trigger-blocked.jsonl`，带时间、session/worker 身份、工具名、原因和有限预览；审计写入失败也不会放行已判定的危险动作。只读搜索和文档中的规则描述不应被当作执行行为拦截。

### 7.4 脚本门禁如何补全业务闭环

安全扩展不负责所有业务判断，维护脚本进一步实现：

- **Coding 事务**：`scripts/coding/save_execute_ui.py` 默认只读 preflight；`--apply` 才执行。核验唯一 owner、账号/item/CDP、live REC、运行/冷却状态、Prompt、推送 commit 和本地质量证据，完整执行 UI 事务后校验 OSS commit 与全文件 manifest，再启动唯一 request-bound watcher。
- **题型质量门禁**：Coding 使用 Oracle/NOP、契约覆盖和回归；长文 `scripts/longwen/design_gate.py` 使用结构审计 + solver probe。后者明确不适用于 Coding，不能把 rubrics 评分口径迁到题包测试。
- **模型版本一致性**：`scripts/longwen/validate_model_generation_consistency.py` 核验对应产物；版本错误是需修复的状态，不是等待或成功理由。
- **原子业务更新**：`scripts/update_task_business.py` 与自动刷新共用 flock、临时文件和原子替换，保留自动事实字段，拒绝不合规的英文业务散文。清空非空 worker 指针要求 `--expect-worker` CAS 和实际退出证据；由 controller 在退出后处理，不因阶段 closeout 就清掉活 owner，也没有 force 绕过。
- **迭代证据门禁**：`scripts/record_iteration.py` 追加记录；当前高风险 R3 finding 不能凭旧分数或收尾文案降级成“已解决”，未闭合证据不能当作提交/closeout 成功。
- **对外发送边界**：当前 worker 契约要求对外成稿由账号本人复核。客服文本还需 `scripts/support/outbound_precheck.py` 和主会话审读确认具体内容；机器 PASS 不是发送授权。旧历史中的自动回复流程不能被解释为当前自动外发许可。

路径已整理：`scripts/agents/coding`、`scripts/agents/longwen` 是指向 `scripts/coding`、`scripts/longwen` 的兼容链接，`scripts/agents/README.md` 指向总索引。旧规则中的路径仍可解析，但应查维护正本，不另建第二套脚本。

### 7.5 本次验证结果与能力边界

本次可核实的证据：

- 安全扩展、guard、测试、项目 worker overlay 和维护脚本均存在于远端当前工作树。
- 运行 `/opt/homebrew/bin/node --test .pi/extensions/talentsai-safety/guard.test.mjs`：**7 tests / 7 pass / 0 fail**。测试只检查本地字符串与临时脚本 fixture，不访问平台或发起评测。
- 核查时安全审计文件包含 **194 条记录**，涉及 `bash/write/edit`，时间范围为 `2026-09-03T08:01:38.268Z`～`2026-10-12T00:40:28.662Z`。这证明有历史实际拦截记录，不代表每条都是业务事故，也不保证所有当前 session 都正确加载扩展。
- 已有 `.pi/safety-events/notification-wait-e2e.json` 记录 `woke=true`，可作为历史定向等待唤醒证据；本次没有重跑完整业务 E2E。

限制也必须写清楚：

1. **静态模式检查不是安全沙箱**。guard 只扫描支持的入口和可识别源码；并未全面分析任意代码、间接依赖、动态生成或所有工具。无法读取的被执行文件也不会由这个 guard 一律拒绝。
2. **规则文档不等于硬门禁**。worker overlay 的所有纪律并非都由安全扩展实现；必须区分提示约束、脚本校验、runtime 所有权和人工授权。
3. **单元测试不等于业务全链路验收**。本次没有验证所有 worker 加载状态、完整提交闭环或机器冷启动恢复。
4. **harness 不替用户授权**。它使已授权业务动作更可靠，但不能把预检通过升级为签署、外发、申诉或重大决策的许可。


---

## 8. 本案例的调教过程与故障演进

### 阶段一：迁移和单机可运行（8 月 26～27 日）

最初目标是把 MacBook 上的工作目录、Harbor、浏览器登录态和脚本迁到 Mac mini：

- 安装 Colima/Docker/uv/Python；
- 重建 Harbor v0.5.0；
- 迁移独立 Chrome profile；
- 用 Cookie + GET API 做无浏览器监控；
- 用 Playwright/CDP 抓真实端点；
- 用可见浏览器处理扫码或必须的人机步骤。

这一阶段的主要教训是：不能因为路径探测失败就误判“没有 Chrome”，不能硬猜 POST，也不能在已经获得用户授权后反复停下来询问。

### 阶段二：从单任务变为多任务并行（8 月 27 日后）

用户要求多个项目并行、每个题单独目录和独立 worker。随后暴露了：

- subagent 静默退出；
- provider/额度错误没有清楚上报；
- subagent 没继承主 session 模型；
- `subagent_list` 与真实进程不一致；
- reload 后上下文、工具或任务身份错位；
- 主 session 自己做完所有项目，失去隔离。

解决方向是 `pi-subagent-durable + RMUX + 真实 session 文件 + completion notification + model/context inheritance`，并加入 active worker registry 和一题一 worker 门禁。

### 阶段三：录屏从“一个 keepalive”变成资源编排（8 月 27 日～9 月 3 日）

最早用一个共享 Chrome 和 `keepalive2.py` 管录屏，随后出现：

- 多题抢同一个页面；
- 误报和高频语音；
- 保活动作与通知频率耦合；
- REC tab 被 worker 关闭或覆盖；
- 页面恢复了但旧告警仍在注入；
- “录屏达标”被错误解释为“可以提交”。

调教结果是：每 item 独占 CDP/profile，supervisor/keepalive/recwatch 分层，注册表做冲突检查，状态变化才通知，旧告警按时间和健康快照过滤，原生授权才 red。

### 阶段四：脚本通知从“叫人”变成“叫 Agent”（9 月 1～3 日）

早期 watcher 只能写日志或播放语音，用户仍要把结果转述给 Agent。之后实现：

```text
watcher → notify_agent.py → JSON 事件 → pi-agent-notify → Pi user message
```

又经过几轮修复：

- busy 时指定 `steer/followUp`，避免 “Agent is already processing”；
- 主 session 和 subagent 使用不同 inbox；
- worker 可 `--to taskId` 通知自己；
- 15 秒批量合并和 30 分钟去重减少刷屏；
- red 跨来源去重；
- 基于 cwd 的主 session 注册和 pending queue 防串会话；
- notificationId/时间/完整内容用于区分“相似但不同”的平台通知；
- stale recording 告警用最新健康快照过滤。

user-only session 中还进行了“方案 C”定向通知闭环测试，验证了“外部脚本通知 → 指定 worker 收到 → worker 继续响应”。

### 阶段五：解决“watcher 在跑，但 worker 已退出”（9 月 2～3 日）

只把通知投到 worker 目录还不够：如果 `pi --mode json -p` 已 settled，目录里再多事件也无人消费。于是引入 **wait lease**：

- worker 必须明确 arm；
- 必须有活着的 watcher PID 和仓库 marker；
- lease 与 active worker 的 item ownership 对齐；
- hold `agent_end`，由定向事件恢复同一 session；
- 到期主动自检，不静默消失。

这是无人值守链路最重要的转折：从“脚本监控 + 人工 reload worker”变成“脚本直接唤醒原 worker”。

### 阶段六：通知、台账和任务路由合并（9 月 2 日后）

用户反复发现：平台有通知但 Agent 没看到、通知进错 session、任务已提交但 worker 不退出、同一 item 开了两个 worker。由此形成：

- 通知中心分类监听；
- `item_rejected` 必须保存完整内容；
- `mention` 必须路由到回复流程；
- `review_report_*` 路由到对应题型 QC 流程；
- `docs/通知系统与任务路由.md` 规定各事件应读什么；
- `current_tasks.json` 使用五态业务状态机；
- 已有 worker 就定向唤醒，不重复创建；
- 提交后立即核验终态、沉淀并退出，不因审核 watcher 存在而继续占 worker。

### 阶段七：从“能提交”提升到“少迭代、高质量”（持续进行）

真正耗时的不是点击按钮，而是多轮返修。调教逐渐把专家反馈固化为前置门禁：

- Coding：动态答案、公开入口、双向契约、合法变形、negative path、旧输出清理、R1/P5/T7/R3 预审；
- 长文：真实材料、Prompt/模型版本一致、原子 Rubrics、fresh 模型和诚实判分；
- Office：可打开、页数/结构、OOXML 元数据、上传文件和最终 Prompt 一致；
- 所有题型：去 AI/批量合成痕迹，回复真人化；
- 每轮记录有效性，不让 worker 重复试同一方向；
- 临时脚本收尾时必须 `promote / defer / discard`，避免脚本库无限膨胀。

---

## 9. TalentsAI 的可靠性与安全门禁

### 9.1 防重复

- 同 item 单 worker；
- 同阶段单 watcher；
- request/transaction 已 running 时禁止重复触发；
- `arm_notification_wait` 同 task+item 幂等；
- 通知批量、去重、过期过滤；
- 已回复 discussion 不再回复；
- 提交只认平台状态迁移，不因按钮消失重复提交。

### 9.2 防错账号/错页面

- exact URL，不使用 `pages[0]`；
- account/userId/item/project/CDP/profile 五重核验；
- 独占录屏实例；
- worker registry 校验 item ownership；
- 禁止 `browser.close()`、杀共享 Chrome 或关闭其他 item 的 REC tab。

### 9.3 防旧版本

- 本地稿 hash；
- IDE 逐文件 SHA；
- `HEAD == origin/main`；
- OSS `code.zip` 根 commit + manifest；
- Prompt 与本地 instruction 指纹；
- 模型 transaction/startTime 与 Prompt 保存时间；
- 报告绑定 request/attempt/hash。

### 9.4 防危险捷径

项目 safety extension 已做过 fail-closed 验证，重点阻止：

- shell 中直接 POST raw execution endpoint；
- 绕过 UI acquire 的 stale `code.zip` 评测；
- 历史脚本关闭共享 CDP 浏览器；
- 身份、页面、录屏不一致时继续提交；
- 未知或重复 watcher/worker。

### 9.5 Cookie 与隐私

- Cookie 按账号单独保存并视同密码；
- 文件权限使用 600；
- 不打印 Cookie 内容；
- 401 时停止并要求重新登录，而不是猜测或绕过认证；
- 本地和平台可见材料遵守脱敏、真实性和授权边界。

---

## 10. 本案例的自治能力与人工边界

### 10.1 已经可以自动闭环的部分

- 多账号机会和任务状态检查；
- 已授权范围内的申请、考试、协议和领题流程；
- 一题一 worker 的任务分派；
- 本地材料/题包制作与验证；
- Web 表单、Web IDE、Git、OSS、评测、QC、模型和报告流程；
- 长时间执行与冷却等待；
- 平台通知、打回、提及和状态变化的事件路由；
- 真实 finding 的有界返修；
- 提交后的终态核验、台账、checkpoint 和经验沉淀；
- Chrome/page/暂停等多数录屏异常的自动恢复。

### 10.2 仍需人工或明确授权的部分

1. **macOS 原生首次屏幕共享/TCC 授权**：必须确认“整个屏幕→分享”，不应让后台脚本盲点。
2. **登录失效、扫码、验证码和平台风控**。
3. **必须由本人提供或确认的真实身份、真实材料及提交授权**。
4. **真实性、隐私、版权、合规边界不清的材料选择**。
5. **放弃试标、重大题材变更、申诉立场等不可逆业务决策**。
6. **平台故障、provider 限额、网络异常且无法自动判断后果的情况**。

### 10.3 尚未完全证明的冷启动能力

从 session 记录看，Mac 重启后曾出现防休眠设置丢失、浏览器窗口和 worker 需要恢复。因此当前系统更接近：

> **运行期间高自治 + checkpoint 可恢复**，而不是“断电重启后零人工全恢复”。

要达到真正 7×24 冷启动无人值守，还需要确认或补齐：

- macOS 防休眠设置持久化；
- watcher/supervisor 的 LaunchAgent 开机拉起；
- Chrome/CDP/profile 注册表恢复；
- `/tmp` 事件、worker registry、wait lease 丢失后的仓库 checkpoint 重建；
- 主 session 自动启动和 cwd 级 pending 事件消费；
- 重启后逐 item reconcile，确保不重复提交/评测。

---

## 11. 本案例的成熟度判断

可以把项目成熟度分为四级：

| 级别      | 能力                             |
| ------- | ------------------------------ |
| L1 脚本化  | 能自动填表、调 API、上传文件               |
| L2 可观察  | 有 watcher、日志、通知和状态台账           |
| L3 事件闭环 | watcher 能唤醒正确 Agent，Agent 自动继续 |
| L4 自愈自治 | 多账号隔离、幂等、安全门禁、重启恢复、异常才找人       |

当前大致处于 **L3 到 L4 之间**：

- 运行中的正常业务路径已经具备事件闭环和较强自愈；
- 多账号、单题所有权、版本证据和安全门禁已经比较完整；
- 原生授权、真实性/合规和机器重启后的全自动重建仍是主要人工边界。

---

## 12. 本案例后续最值得做的三项收口

### 12.1 做一个统一 reconciler

启动或重启后一次性读取：

- `accounts.json`；
- `current_tasks.json`；
- `project_opportunities.json`；
- recording registry/health；
- active-worker registry；
- 平台 item/通知/discussions；
- watcher PID/marker。

输出唯一动作计划：恢复、唤醒、新建、退役或 red，不直接盲目执行。

### 12.2 把关键状态移出 `/tmp`

`/tmp` 适合 transient inbox，不适合唯一事实源。应确保：

- watcher launch marker、checkpoint、iteration 结果长期写在仓库；
- `/tmp` 只放可重建的事件副本和运行锁；
- 启动时根据仓库状态重建 inbox/lease/registry。

### 12.3 建立端到端健康检查

定期验证：

```text
平台只读 API
→ watcher 发现测试事件
→ notify_agent 路由
→ 主 session/worker 收到
→ 台账更新
→ 回执 marker
```

同时检查 Chrome/CDP、REC、RMUX、Pi session、LaunchAgent 和磁盘空间。这样能在真正业务通知到来前发现链路断点。

---

## 13. 案例结论

TalentsAI 的具体难点是长时间录屏、多账号多题、长评测等待、材料真实性、版本一致性和人工审核返修的组合。

本案例形成了三个业务闭环：

1. **Coding**：公开契约 → 本地容器验证 → IDE/Git/OSS 一致 → fresh 评测与 QC → 有界返修 → 平台终态回读。
2. **长文/Office**：真实材料 → 本地权威稿 → Prompt/附件版本一致 → fresh 模型产物 → 独立文件检查与诚实评分 → 评审回复和返修。
3. **运维**：一题一 worker/独占录屏资源 → watcher 定向唤醒 → 台账与 checkpoint → 异常升级和终态退出。

可复用的是通用篇中的事件驱动、单一所有权、证据确认和有界自治

---


