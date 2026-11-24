---
layout: post
title: pi-subagent-durable：后台子代理的持久化、生命周期与故障自愈
categories:
  - tool
tags:
  - pi
  - rmux
  - subagent
  - debugging
  - architecture
  - macOS
last_modified_at: 2026-11-23T17:40
created: 2026-11-10T06:30
date: 2026-11-10
theme: agent/extension
theme_subtitle: subagent
---
面对真实的复杂长任务时，子代理可能需要执行几十分钟乃至数小时的连续命令、多步排错、或者等待外部异步系统的结果。**一次性子进程模型在长任务面前瞬间溃不成军**：

1. **会话易逝**：没有真实 session JSONL，进程崩溃或终端中断后，几十轮探索的思考链和执行记录全丢；
2. **黑盒运行**：无法像 tmux 那样直接 `attach` 进去看它卡在哪一步、当前正在执行什么命令；
3. **父死子亡（SIGKILL 级联惨剧）**：主会话一旦超时或被用户打断，子进程连同正在跑的编译、训练或长跑任务被直接 `exit 137` 抹杀；
4. **无法热维护**：修改了 MCP 工具、更新了技能或扩展，运行中的长任务无法在保留上下文的前提下重载代码。

为了让子代理成为能在后台独立生存、可观察、可恢复、抗意外击杀的“长效数字员工”，我把它做成了基于 RMUX 的通用持久化后台子代理架构。中间踩遍了日志爆炸、自杀误杀、热重载幽灵、跨机器租约竞争和 Node ESM 缓存等各种系统级暗坑。

这篇文章把这套架构的设计演进、真实生产事故与故障自愈机制完整复盘一遍。

---

## 1. 架构总览：从“派发即忘”到“有界自治”

`pi-subagent-durable` 的核心设计哲学只有一条：**Worker 不是临时子进程，而是一个拥有独立生命周期、独立存储、且与终端复用器强绑定的完整 Session。**

```text
主会话 (Parent Pi Session)
  │
  ├─ subagent({ tasks, async: true }) ──────────────────────────────────┐
  │                                                                     │
  ▼ [RMUX 终端复用器]                                                   ▼ [持久化存储 & 注册表]
┌────────────────────────────────────────────────────────┐  ┌──────────────────────────────────────────┐
│ rmux window: pi-agents:_worker-<taskId>.0              │  │ ~/.pi/agent/sessions/--cwd--/            │
│   ├─ 独立进程: pi --session subagent-<taskId>.jsonl    │  │    └─ 真实会话文件 (支持 --session 恢复) │
│   ├─ stdout/stderr 管道                                │  │                                          │
│   │    └─ jsonl-filter (瘦身 -82%~99%)                 │  │ ~/.pi/agent/agent-logs/<taskId>.jsonl    │
│   └─ 终端交互: rmux attach -t pi-agents                │  │    └─ 实时事件流 (给 Live TUI / 桌面端)  │
└────────────────────────────────────────────────────────┘  │                                          │
  ▲                                                         │ /tmp/pi-agent-notify/.active-workers.json│
  │ 控制工具 (LLM 可调用)                                   │    └─ 跨进程加锁注册表 (带 unguessable token)│
  ├─ subagent_list   (本会话树隔离查看)                     │                                          │
  ├─ subagent_stop   (递归清理任务与后代)                   │ ~/.pi/agent/durable-tasks/               │
  ├─ subagent_reload (kill + --session 原地恢复)            │    ├─ task-<id>.json (Outbox 结果落盘)   │
  └─ subagent_gc     (安全清理 dead pane)                   │    └─ .controllers.json (带 Generation 租约) │
                                                            └──────────────────────────────────────────┘
```

---

## 2. 迭代踩坑全景：按时间顺序的系统演进

从最初跑通 `rmux new-window` 到最终实现抗单点崩溃、跨机器自治的持久化子代理，中间经历了一系列真实的系统级故障。以下按时间顺序完整复盘所有关键踩坑记录、技术深层根因与底层演进方案：

| 时期 / 提交 | 阶段与故障现象 (Symptom) | 技术深层根因 (Root Cause) | 修复方案与底层演进 (Resolution & Mechanism) |
| :--- | :--- | :--- | :--- |
| **08-04**<br>`9601a36` | **日志体积爆炸（单任务 331MB）**<br>运行一个几分钟的分析任务，`agent-logs` 迅速膨胀至 331MB，导致磁盘空间告急、Live TUI 严重卡顿。 | **全量累积快照二次方膨胀**：<br>`pi --mode json` 的 `message_update` 事件每一帧都携带全量累积的 thinking / toolCall 快照（`message.content` 与 `partial`），长推理中呈 $O(n^2)$ 膨胀，占体积 ~96% 却无人消费。 | **流式增量过滤（`jsonl-filter.cjs`）**：<br>• 只透传 `text_delta` 增量与骨架；<br>• 丢弃全量 `messages` 数组，`turn_end` 瘦身为纯 `{type}`；<br>• 实测 11.5MB 压到 1.9MB（**-82%**），实时流式逐行落盘不等进程退出。 |
| **08-05** | **300 秒“定时杀手”无条件误杀**<br>运行耗时较长的后台任务（大型编译、长跑评测或仿真）到第 5 分钟突然凭空蒸发，任务被清空，无任何报错。 | **武断的硬编码超时兜底**：<br>代码内置了 `setTimeout(300000)` 定时清理，开发者武断假设超过 5 分钟的任务必定挂死，定时器触发后无条件从 `asyncTasks` 抹除并丢弃结果。 | **废除硬编码超时**：<br>• 彻底移除任何时间上限兜底；<br>• 任务生命周期完全交由 RMUX 底层状态机驱动，只要进程与 Pane 仍在执行，多长任务都不干预。 |
| **08-06** | **TUI 界面永久卡在 "1 running" 假死**<br>任务在后台明明已经退出，终端内 `/agent-live` 或侧边栏依然显示正在运行，状态永不刷新。 | **退出状态检测盲区**：<br>早期完成检测依赖 `stdout.includes("(dead)")`。当 RMUX 窗口正常关闭后，`list-panes` 直接返回非 0 退出码且 stdout 为空，字符串匹配落空，完成回调无法触发。 | **底层状态机双重判定**：<br>• 采用 `returnCode !== 0`（窗口已销毁）或显式输出 `(dead)` 标记为双重可靠判定；<br>• 轮询即时捕获终态，消除残留挂起。 |
| **08-08**<br>`77bb3ff` | **空 Assistant 文本致完成通知静默丢失**<br>典型异步长任务：子代理在 RMUX 内正常跑完全部流程，主会话却毫无通知，主代理永久挂起等待。 | **结尾消息结构盲区**：<br>子代理轮询异步任务时以 `toolCall -> toolResult("done") -> 空 assistant 文本` 结束。旧逻辑只提取最后一条 `message_end`，且外层加了 `if (finalText)`，空文本导致整个通知被吞掉。 | **倒序提取与强制兜底（`extractAssistantFinalText`）**：<br>• 倒序扫描所有 `message_end` 提取最后一条**非空有效总结**（≤4000 字符）；<br>• 若通篇确实无文本，强制发送兜底通知：`已完成任务，但无文本输出...`，确保状态决不失联。 |
| **08-09**<br>`ba35889` | **主会话 Streaming 时投递抛异常**<br>子代理完成回调触发通知时，控制台报错：`Extension error: Agent is already processing...`，结果通知丢失。 | **主进程并发写入状态冲突**：<br>完成回调调用 `pi.sendUserMessage(text)` 时未指定投递模式。若主代理恰好处于流式推理生成中，直接调用会触发运行时冲突并被抛弃。 | **排队平滑注入（`deliverAs: "steer"`）**：<br>• 所有完成通知路径（RMUX/spawn 回调及命令入口）全部强制加上 `{ deliverAs: "steer" }`；<br>• 消息平滑排队到主代理当前轮工具执行完毕后投递。 |
| **08-10**<br>`1c7a5bc` | **模块 `/reload` 后状态分裂闪烁**<br>主会话输入 `/reload` 重新加载扩展后，TUI 任务栏交替显示 0 running 和 1 running。 | **模块级闭包持有不同 Map 实例**：<br>`/reload` 清理模块缓存重新 import，旧任务的轮询闭包持有旧模块的局部 `asyncTasks` Map，新代码持有新 Map，导致状态分裂。 | **持久引用挂载**：<br>• 将任务账本存放在 `globalThis.__pi_subagent_async_tasks__` 持久引用上；<br>• 跨 reload 模块重载时新旧闭包共享唯一样本。 |
| **08-10**<br>`c13a518`<br>`23dcf02` | **会话双写损坏（Double-Write Corruption）**<br>执行 `subagent_reload` 重载 worker 后，主会话 JSONL 被大量子任务工具日志疯狂写入，直接导致主会话损坏解析失败。 | **会话路径参数倒灌**：<br>重连参数构造时错误地从当前进程环境读取 session 路径，把**主会话的 JSONL 文件**传给了子 agent 的 `--session` 参数，两个独立的 Pi 实例同时向同一文件追加写。 | **父子会话路径严格隔离**：<br>• 子任务启动时在 header 固化 `parentSession` 标记；<br>• 重载时严格从 `agent-logs/<taskId>.jsonl` 头部解析 worker 专属的 canonical session 文件路径，严禁任何依赖环境变量的推测。 |
| **08-12**<br>`af2afba`<br>`917a10f` | **未指定模型子代理瞬时 429 崩溃**<br>Markdown 中未显式指定 `model` 的 agent 启动瞬间即报 `stopReason=error` 退出。 | **模型继承缺失**：<br>子进程未继承父会话的模型配置，回退到全局默认模型通道（如已耗尽额度的第三方 API），直接抛出 `429 GoUsageLimitError`。 | **继承 DispatchDefaults**：<br>• 未显式 pin model 的 agent 强制继承主会话当前的 active provider、model 和 thinking level；<br>• 同步继承有效的 `contextWindow` 与 usage 统计规则。 |
| **09-13**<br>`c866055`<br>`552bf5d` | **子代理递归派生数百进程（递归风暴）**<br>子代理在执行任务时自主调用 `subagent` 工具分解子任务，短时间内在宿主机派生数百个 RMUX 窗口和 node 进程，系统直接瘫痪。 | **权限无边界与缺乏配额**：<br>子进程环境默认暴露了 `subagent` 工具；无调用深度限制；无全局活跃数配额；逐任务 kill 无法触达孙辈。 | **硬性安全边界与树形权限**：<br>• 默认深度上限 `MAX_DEPTH=2`（main 为 0，worker 为 1，child worker 为 2，depth=2 时彻底移除 `subagent` 工具）；<br>• 机器级并发上限 `MAX_ACTIVE=15`，跨进程文件锁原子检查；<br>• 权限围栏：Worker 只能管理自身后代，禁止管理自身、祖先或平级兄弟（`552bf5d`）；<br>• `subagent_stop` 默认递归清理整棵任务树。 |
| **09-23**<br>`ae34ffa` | **同步批次派遣致级联 SIGKILL（exit 137 事故）**<br>07:22 主会话同步批量派发 3 个长任务（缺少 `async: true`），父进程挂起 20 分钟；两个 worker 在 bash 内等待长操作，用户打断主会话，所有 worker 瞬间被抹杀（`exit 137`），未落盘报告尽失。 | **同步阻塞与超时级联**：<br>同步调用将子进程生命周期绑在父级单一工具调用上。父级一旦因打断或超时 abort，信号透传至 `exec.js`，发送 `SIGTERM` 后 5 秒升级为 `SIGKILL`，正在前台等待的进程被直接斩首。 | **确立 D1–D3 铁律并默认后台化**：<br>• **D1**：派遣必 `async: true`，主代理永不阻塞；<br>• **D2**：严禁前台 `sleep`，改用进程外 watcher + `arm_notification_wait` 静息等待；<br>• **D3**：关键结果必须实时落盘检查点；<br>• 代码修改（`ae34ffa`）：并行任务缺省 `async` 时**默认后台执行**。 |
| **09-28**<br>`2aab3ce`<br>`4545ffa` | **任务提示词放进 `argv` 导致进程误自杀**<br>负责清理系统僵尸进程或运行自动化测试的 worker，刚启动就莫名其妙退出了。 | **命令行正则模式命中自己**：<br>早期为了 `ps` 方便排查，把任务指令文本放进了命令行参数：`pi --task "pkill -f old_script ..."`。当 worker 内部执行 `pgrep` 或 `pkill` 扫描进程时，命令行的模式匹配命中了它自己的 `argv`！ | **参数彻底剥离**：<br>• 从 CLI `argv` 中彻底移除任务提示词与上下文长文本；<br>• 统一通过标准输入（stdin）或受控临时 IPC 文件送入，避免成为系统命令的匹配靶子。 |
| **10-02**<br>`5d887d6`<br>`899fa18` | **主会话冷升级重启时权力真空与脑裂争抢**<br>Pi 自身需要升级或主终端重启时，必须把 10 多个后台长任务全部杀死重来；或者重启后两个主终端同时争夺同一个 worker 的所有权。 | **缺乏控制器租约机制**：<br>子任务的生命周期绑定在单一父进程 PID 上，无法经历主进程断开、重装、重连的生命周期。 | **Controller Lease 与 Fencing Generation**：<br>• 持久化租约表 `.controllers.json` 绑定 canonical parent session；<br>• 每次接管原子自增 `generation`（代数）；<br>• 过期或异地 controller 的所有写操作在底层被严格拒绝（Fail-closed），杜绝双主脑裂。 |
| **10-02**<br>`receiver-keeper.mjs` | **主会话升级离线期间外部通知丢失**<br>主会话退出安装新版本期间，外部通知总线探测不到主进程存活，将后续发给主会话的结果视为死亡并转入隔离区。 | **接收端探活与主进程强耦合**：<br>主会话退出导致其通知注册失效，外部 watcher 无法向离线的主会话发送完成事件。 | **24 小时 Detached Keeper**：<br>• 主会话退出前派生微型独立守护进程 `receiver-keeper.mjs`；<br>• 脱离父会话有界运行（上限 24 小时），为已验证的 Worker 镜像心跳；<br>• 新主会话上线接管后握手并优雅自毁。 |
| **10-05**<br>`47202a9` | **离线完成结果丢失与未确认重复投递**<br>Worker 在主代理离线时执行完毕，新主代理上线后漏掉结果；或通知在瞬断重连中反复刷屏。 | **无盘内投递屏障**：<br>完成判定直接触发内存回调，若宿主不可用则结果丢失；缺少投递确认（ACK）闭环。 | **Outbox 模式与 Transcript ACK 投递屏障**：<br>• Worker 完成时强制将结果 JSON 写入磁盘并执行 **`fsync`**；<br>• 结果投递后，必须核验主会话 JSONL 转录中出现了带标签的 user message，才标记 `deliveredAt`；<br>• 未确认结果每 30 秒重试，基于稳定 `resultId` 实现幂等至少一次（At-least-once）交付。 |
| **10-07**<br>`a9c6b3c`<br>`ghost-reconcile-v1` | **mac-mini 幽灵案：主进程心跳无限续期死任务**<br>某已停止任务的 Pane 早已销毁，但注册表每 15 秒刷新心跳；持有者 PID 竟然是运行三天的主 Pi 会话！暴力 `kill -9` 会导致主会话直接崩溃。 | **异常分支漏清内存映射**：<br>代码 `899fa18` 中 `stopTask()` 在 kill RMUX 后因提前 return，**漏清内存 `asyncTasks` 与全局注册表**。主进程自带的维护定时器认为自己依然持有该任务，忠实地拿自身 PID 帮死任务续期。 | **版本化终态对账器（`ghost-reconcile-v1.mjs`）**：<br>• 决不允许盲目根据 PID 杀进程；<br>• 跨进程排他锁内，必须满足四重门禁：精准 Token 匹配 + RMUX 全量快照确认 Pane 消失 + `ps` 确认 Worker 实际 PID 销毁 + 无活跃 wait 租约，才允许注销本地跟踪并注销注册表。 |
| **10-07**<br>`1f55393` | **Node 原生 ESM 不可变缓存导致 `/reload` 无效**<br>在磁盘上更新了 `recovery.mjs`，在终端输入 `/reload`，新加的导出函数在主会话中依然报错 `undefined`。 | **Node.js 运行时 ESM 命名空间缓存**：<br>Pi 的 `/reload` 仅重置扩展 factory，而 Node.js 底层对原生 `.mjs` 模块实行生命周期内不可变缓存，已加载的 module namespace 无法被垃圾回收或热更新。 | **显式版本化模块入口架构**：<br>• 采用物理版本化文件命名（`recovery-v2/v3/v4`, `dead-window-v3/v4/v5`, `ownership-registry-v2/v3`）；<br>• 新代码直接 import 最新物理版本文件，老入口仅作兼容重导出，彻底穿透 Node 僵尸缓存。 |
| **10-10**<br>`e336880` | **RMUX 0.9.1 选择器混淆导致清理失败**<br>调用 `subagent_gc` 清理已死窗口时部分 Pane 报错无效选择器，无法被销毁。 | **协议选择器前缀混淆**：<br>RMUX 0.9.1 严格定义：窗口是 `@数字`，Pane 是 `%数字`，Session 是 `$数字`。历史清理模块误将 `$session` 形式的选择器作为窗口参数传给了 RMUX API。 | **选择器强门禁校验**：<br>• 重写清理与绑定模块（`dead-window-v5.mjs`, `window-binding-v4.mjs`）；<br>• 启动捕获、绑定与 kill 门禁只接受 `@` 开头的 window ID，其余一律拒绝，杜绝格式歧义。 |
| **10-10**<br>`52fbd50` | **历史缺失 Launch ID 的死窗引发维护死锁**<br>遇到早期崩溃留下的无 launch ID 遗留窗口时，控制器清理维护陷入无限重试死循环，拖死自动化检查。 | **不可推断身份的死局**：<br>对缺少 launch identity 的死窗，系统反复尝试通过启发式推测领用身份，导致冲突和租约争用。 | **持久化人工停放（`blocked_manual`）**：<br>• 在权威全 dead 快照确认且结果已落盘后，将状态持久化标记为 `cleanupState: blocked_manual`；<br>• 优雅释放 maintenance lease，保留现场证据供显式 `/agent:gc` 处理，阻断自动重试死锁。 |
| **11-23**<br>`abeade6`<br>`worker-exit-guard-v1` | **Worker 已结束却卡死不退出，必须 reload 才释放**<br>偶发在长任务结束后，worker 日志已落盘 `agent_settled` 且已执行 `session_shutdown`（身份文件已被删导致 `notify_subagent` 失败），但 `pi` 进程与 RMUX Pane 仍存活——有的卡 33 分钟才自然退出，有的只能靠 `subagent_reload` 杀掉恢复。 | **`undici` 半开 WebSocket 泄漏 ref 句柄 + 无强制退出**：<br>`pi --mode json -p` 返回后不调用 `process.exit()`，完全依赖 Node 事件循环自然排空；而 `openai-codex` 遭遇 `WebSocket idle timeout (300s)` 并回退 SSE 时，`undici@8.12.3` 的 `ws.close()` 仅发 Close 帧进入 `CLOSING (2)`，没有握手超时也不 `destroy()`/`unref()` 底层 TCP `Socket`，半开连接持续拉住 libuv 事件循环直至代理/OS 超时断开。 | **有界 `.unref()` 退出守卫（`worker-exit-guard-v1.mjs`）**：<br>• 仅对 durable worker（`PI_SUBAGENT_TASK_ID`）在 `session_shutdown(reason="quit")` 的 `finally` 中挂载默认 15s（`PI_SUBAGENT_WORKER_EXIT_GRACE_MS` 可配或 `0`/`off` 关闭）的 `.unref()` 定时器；<br>• 正常 worker 零延迟自然退出；若被泄漏句柄挂住，等待待写 `stdout` drain 后向 `extension-diag.log` 记录存活句柄并按原 `process.exitCode` 退出，不影响主会话与 `/reload`。 |

---

## 3. 终极考验：主代理升级，Worker 决不停机

这套架构演进到最成熟的阶段，解决了一个近乎苛刻的工程挑战：**当 Pi 自身需要升级版本或冷重启时，运行中的后台长任务 Worker 绝对不能停机，主会话重新上线后必须自动重新接管。**

要做到这一点，核心是跨越主进程退出带来的“权力真空期”：

```text
1. 准备交接 (/agent:prepare-upgrade)
   主会话持久化任务树 ──> 生成 agent-upgrades/<parentSessionId>.json ──> 启动 Detached Keeper (24h)

2. 退出主会话
   主会话 PID 退出 ── [Worker 进程在 RMUX 内正常运转，Keeper 维持外部通知心跳]

3. 侧装新版 Pi (pi-safe-upgrade.sh)
   在独立目录安装新版本，验证 Manifest 一致性，拒绝重复/竞争实例

4. 恢复接管 (pi --session <canonical-parent.jsonl>)
   获取带有单调递增 Generation 的 Controller Lease ──> 对账任务 ──> Outbox 离线结果重放
```

整个交接过程中，Worker 进程和 RMUX Pane 始终在后台独立运转。上表梳理的四大机制（带 Fencing 代数的 Controller Lease、24h 镜像 Keeper、Outbox 落盘与 Transcript ACK 屏障、以及 `@` 窗口选择器强校验）共同构成了这套无损交接的防线，确保主进程断开、重装、重连的全程中，既不丢任务状态，也不丢离线结果。

---

## 4. 核心经验与架构哲学

经历了几十轮生产级淬炼，`pi-subagent-durable` 沉淀下来的不是“又一套脚本工具”，而是面向自治 Agent 的工程方法论：

1. **会话不是一个进程，而是一组持久化证据链**：
   进程（PID）每分每秒都在诞生和毁灭，只有落盘的 canonical JSONL、Outbox 文件和跨进程锁才是业务真相。永远不要把短暂的操作系统资源当作业务实体的身份证。
2. **永远保证主代理的非阻塞性（Non-blocking Main Agent）**：
   任何可能超过几秒钟的操作，从工具调用本身到等待外部状态，都必须走异步化与事件驱动。主代理的核心价值是维持对全局上下文的掌控，绝不能被任何子任务挂起。
3. **退役与清理必须严格对称**：
   系统设计者往往只关注“怎么启动任务”，却轻视“怎么收尾任务”。一个健壮的后台子系统，其停止、清理、GC 与异常注销的代码量，往往是启动逻辑的三倍以上。如果停止没有清理注册表，那就是下一次幽灵故障的温床。
4. **向最坏的运行环境做防御性编程**：
   Node 会缓存 ESM、macOS 会回收复用 PID、RMUX 命令会偶尔超时、网络代理会突发 200 空体、LLM 会吐出空消息……如果你的代码假设“外部世界总是守规矩的”，那么在并发和长任务的压力测试下，崩溃只是时间问题。

> [!SUMMARY] 演进里程碑
> - **08-04**：初版上线，实现 RMUX 持久化窗口与基本事件过滤，解决 331MB 日志暴增；
> - **08-10**：强化完成检测，加入 `extractAssistantFinalText` 与 `{ deliverAs: "steer" }` 兜底；
> - **09-13**：加入递归深度限制（depth ≤ 2）与全局并发配额（max active ≤ 15），遏制进程风暴；
> - **09-23**：同步批次 SIGKILL 事故，确立 D1–D3 纪律，并行任务默认后台化；
> - **09-28**：Book 与 Mini 跨机器合并，剥离 argv 任务文本，根除 `pgrep` 自杀隐患；
> - **10-02**：引入 Controller Lease 与 Fencing Generation，支持主代理离线升级与 24h Keeper；
> - **10-07**：mac-mini 幽灵任务排查，建立版本化终态对账器与 Node ESM 缓存穿透架构；
> - **10-10**：实现 Outbox fsync + Transcript ACK 投递屏障，交付双语完整规范。
> - **11-23**：定位 `WebSocket idle timeout` 后 `undici` 半开 `CLOSING` socket 阻断事件循环排空的偶发卡死，引入有界 `.unref()` post-`quit` 退出守卫（`worker-exit-guard-v1.mjs`）根治 worker 结束后不退出问题。
