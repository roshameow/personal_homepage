---
layout: post
title: pi-agent-notify：Coding Agent 的事件总线、非阻塞等待与可靠投递
categories:
  - tool
tags:
  - pi
  - notify
  - architecture
  - debugging
  - macOS
last_modified_at: 2026-11-23T17:47
created: 2026-11-10T07:00
date: 2026-11-10
theme: agent/extension
theme_subtitle: agent-notify
---

在上一篇聊 [pi-subagent-durable]({% post_url 2026-11-10-pi-subagent-durable %}) 的笔记中，我们确立了一条生死攸关的铁律（D2）：**严禁让 Agent 在前台执行 `sleep` 或死循环轮询等待外部任务。必须采用“一次权威确认 + 启动进程外有界 Watcher + 结束当前 Turn 静息等待”的模式。**

但这里立刻浮现出一个核心系统问题：**Turn 结束后，Agent 处于静息状态，当几十分钟甚至数小时后外部任务（CI 构建、长跑测试、仿真或异步 API）结束时，事件到底该怎么唤醒 Agent？**

这就是开源扩展 [pi-agent-notify](https://github.com/roshameow/pi-agent-notify) 解决的事情。

给 LLM 投递外部通知，听起来似乎只是“读个文件、调一下 `sendUserMessage`”。但当它真正运行在复杂的真实开发环境时，你面对的是一系列残酷的系统级难题：
1. **多会话冲突**：同一台机器甚至同一个项目目录下开着多个 Pi 终端，外部事件究竟发给谁？发错会话等于瞬间污染别的上下文；
2. **进程挂起与资源浪费**：如何让 Worker 在没有前台代码执行的前提下维持进程存活，等事件一到毫秒级唤醒，超时又能自动兜底？
3. **假确认与数据丢失**：LLM 内存队列接收了消息，并不代表它已经落盘；进程若在推理前崩溃，事件就永久丢了；
4. **离线交接与防脑裂**：主代理冷重启或升级版本时，外部事件如何安全排队并在恢复后重放？同一会话如何防止两个终端进程同时写入？

这篇文章记录 `pi-agent-notify` 的典型使用场景、架构设计、踩坑演进与可靠性闭环。

---

## 1. 典型使用场景

结合当前 `pi-agent-notify` 的能力矩阵（外部 Watcher 投递、`notify_subagent`、`notify_heartbeat`、离线恢复与分级路由），日常使用主要有五类典型场景：

### 1.1 长时间后台作业与异步外部任务（Worker + `arm_notification_wait`）

这是最核心的设计场景：CI/CD 构建、多小时模型训练/仿真、大规模测试矩阵或长耗时异步 API。

- **典型做法**：Worker 启动一个**有界的进程外 Watcher**，在仓库内落盘 producer marker（记录 `pid`、`itemKey`、`notifyTo`），随后调用 `arm_notification_wait` 声明领域 `itemKey`、唤醒条件和租约时长（`30s`–`24h`，默认 `6` 小时），最后直接结束当前 Turn。
- **实际效果**：Worker 进入 `agent_end` 零 CPU 挂起；外部作业结束或异常时，Watcher 通过 `notify_agent.py send --event-file ... --require-lease` 投递定向事件，毫秒级唤醒**同一个 Worker 会话**读取结果继续后续工作。

### 1.2 自主定时巡检与长周期自唤醒（`notify_heartbeat`）

有时没有现成的外部推模式回调（或者需要会话自己每隔一段时间抬头看一眼全局进度、多路日志、配额/实验指标再决定下一步），每次都手写外部 Watcher 脚本会比较重。

- **典型做法**：主会话或 Worker 直接调用内置工具 `notify_heartbeat`：
  ```json
  {
    "action": "start",
    "intervalSeconds": 1800,
    "message": "巡检当前后台任务与实验进度；若全部完成请调用 notify_heartbeat(action=\"stop\")"
  }
  ```
  之后即可结束当前 Turn，等待自动唤醒；默认间隔为 **1800 秒（30 分钟）**，持续循环直到会话主动调用 `action: "stop"`（也可通过可选 `maxTicks` 设置自动封顶次数）。
- **关键保护**：
  - **有活动时不打扰**：到达心跳点时，若会话正在跑 Turn、处于非空闲状态，或已有待处理的 `followUp`/pending 消息/待刷新外部事件，本次心跳会**直接跳过不发送**，保持固定周期不重置、不堆积；
  - **跨 `/reload` 与重启延续**：调度状态原子写入 `~/.pi/agent/agent-notify/heartbeats/`，`/reload` 或同一 canonical 会话恢复后自动接续；Worker 在存在活动心跳时也会在 `agent_end` 自动保持存活等待下一次心跳。

### 1.3 多 Agent 协作下的动态指令追加（`notify_subagent`）

主控会话同时协调多个异步 Durable Worker 时，经常遇到需求微调、约束变更或另一条支线产出关键上下文，需要中途补充给正在运行或静息等待中的某个 Worker。

- **典型做法**：主会话直接调用 `notify_subagent`，传入 `taskId` 与 `message`。默认使用每个 Worker 自带的专属控制键 `worker:<taskId>`；若该 Worker 当前正被领域 `wait lease` 锁住，则必须传入对应的领域 `itemKey` 并按需开启 `requireLease: true`。
- **实际效果**：忙碌中的 Worker 会在不中断当前工具链的前提下收到 `followUp`；静息中的 Worker 无需经历进程重启（避免 `subagent_reload` 丢失上下文/重建成本）即可继续推进。

### 1.4 主会话版本升级、崩溃恢复与离线通知接力

长跑工程任务跨越数小时甚至跨天时，常会遇到需要重启升级 Pi / 扩展版本，或者终端意外断开的情况，但外部任务并不会停下。

- **典型做法**：主会话依赖持久化的精确身份（`main-identities/<hash>.json` 内的 `runId` + `nonce` + canonical session 路径/cwd）与 `session_controller.py` 的私有管道 `flock` 防脑裂守护；外部脚本通过 `--session-id <EXACT_SESSION_ID>` 精确指定主会话发布通知。
- **实际效果**：只要在主会话最后一次心跳后的 **24 小时恢复窗口**内（且事件自身 TTL ≤ 1 小时），即使主进程暂时退出，事件也能在持久 Outbox 安全排队；重启恢复同一 canonical session 时，扩展结合 Inflight Journal 与 JSONL `fsync` Receipt ACK 自动完成确认或无损重放，不漏消息、不重投。

### 1.5 过程静默观测与异常分级告警（`green` / `yellow` / `red`）

外部流水线往往既会产生频繁的进度心电图，也会产生真正需要决策的节点事件。

- **典型做法**：外部发送方按事件等级区分级别：
  - `green`（进度备忘）：仅以 `agent-notify` custom entry 记录到会话并更新状态栏，不打断推理；若定向绑定了已武装 lease 的 Worker，仍可按需唤醒；
  - `yellow`（可执行更新）：经过 14 天事件 ID 去重与可配置冷却（默认 30 分钟语义去重）后合并通知，推入当前会话或作为 `followUp` 推动下一步处理；
  - `red`（阻断/人工决策）：绕过普通批处理等待立即触发，有 UI 时同步弹出错误级提示请求人工关注。

---

## 2. 架构总览：外部事件总线与四平面解耦

`pi-agent-notify` 是一个完全通用的 Pi coding agent 扩展，它将外部世界的“观察”与内部 Agent 的“执行”彻底剥离：

```text
外部世界 (CI / 测试 / 异步仿真 / 审批系统)
    │
    ▼
外部 Watcher 进程 (有界轮询、状态检测、证据落盘)
    │
    ├─ python3 notify_agent.py send (原子发布 Envelope v2)
    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ pi-agent-notify 事件总线 (~/.pi/agent/agent-notify/ & /tmp/pi-agent-notify/)│
│   ├─ 路由门禁: targetKind + targetId + runId + nonce (Fail-Closed)     │
│   ├─ 防脑裂守护: session_controller.py (基于私有 Pipe 的 POSIX flock)  │
│   ├─ 状态暂存: durable outbox / inflight journal / quarantine          │
│   └─ 静息保持: .notification-wait-lease (拦截 agent_end 事件循环)      │
└────────────────────────────────────────────────────────────────────────┘
    │
    ├─ 唤醒主会话 (Main Session) ──> 注入 User Message / Follow-up
    └─ 唤醒子代理 (Durable Worker) ──> 解除 agent_end 挂起，续跑同一 Session
```

### 2.1 关键概念契约

- **ItemKey（领域所有权）**：领域无关的事项标识，如 `ci:run-42`、`task:build-108`；每个 Worker 自动拥有默认控制键 `worker:<taskId>`。
- **Fail-Closed（无法验证就拒绝）**：目标身份存疑、存在多个匹配会话、时间戳超前或过期、Nonce 错误，一律拒绝并退出，绝不猜测“挑最新”。
- **At-Least-Once（至少一次）**：保证通知绝不丢失，但外部动作必须按 `eventId` 实现业务幂等。
- **Transcript Disk Receipt ACK**：以消息字节真正写入 session JSONL 并 `fsync` 磁盘为唯一确认标准，绝不把“内存入队”当作成功。

---

## 3. 迭代踩坑全景：按时间顺序的系统演进

从最原始的目录扫描脚本，到最终支持主会话离线恢复、排他 Controller 与 Transcript 级落盘确认，以下按时间线梳理 `pi-agent-notify` 的踩坑与演进记录：

| 时期 / 提交 | 阶段与故障现象 (Symptom) | 技术深层根因 (Root Cause) | 修复方案与底层演进 (Resolution & Mechanism) |
| :--- | :--- | :--- | :--- |
| **08-15**<br>`1c91811` | **早期脚本通知直接注入致上下文混乱**<br>外部脚本向主进程送消息，主代理推理被突兀截断或直接抛出运行时并发冲突。 | **缺乏状态感知与流控**：<br>早期实现直接调用非阻塞注入，未区分主代理当前是空闲、工具调用中还是流式生成中。 | **建立 Inbox 缓冲机制**：<br>• 外部脚本写入 trigger 目录；<br>• 扩展按批次扫描并按 `isIdle()` 区分主消息或 `followUp` 排队投递。 |
| **08-25**<br>`6192d35` | **Worker Turn 结束即退出的“假死”**<br>子代理启动 Watcher 后按 D2 纪律结束 Turn，结果进程直接退出，后续事件到达时无法投递。 | **执行宿主生命周期默认行为**：<br>Agent 框架在没有任何未决消息时触发 `agent_end` 并结束执行循环，子进程随之关闭。 | **实现 `agent_end` 静息挂起（`arm_notification_wait`）**：<br>• 拦截 `agent_end`，若存在有效 Wait Lease，通过 `await new Promise` 挂起事件循环；<br>• 零 CPU 消耗静止等待外部事件，事件到达或超时再唤醒。 |
| **09-10**<br>`b8d0e7e` | **同项目双开终端导致消息穿透串台**<br>在同一项目目录下打开了两个 Pi 终端，Watcher 发出的事件被错误的会话抢占。 | **基于 cwd 的粗粒度路由**：<br>通知系统只按当前工作目录匹配接收方，无法识别具体的会话实例。 | **显式精确身份路由**：<br>• 引入 `targetKind + targetId + runId + nonce` 强校验；<br>• 按 cwd 路由时若匹配到多个存活主会话，严格拒绝（Fail-closed）。 |
| **09-18**<br>`ca658e7` | **灾难级目录自吞噬：18.6 万个隔离文件**<br>运行一段时间后，隔离目录堆积了 18.6 万个文件（占 740MB），外部通知全部报找不到身份文件而失败。 | **扫描过滤把内部点文件当作事件**：<br>`collectDirectory` 仅按 `.endsWith(".json")` 过滤。Worker 每 15s 心跳重写的 `.receiver-identity.json` 是合法 JSON，被扩展自己的扫描当成入站事件收集、重命名为 `*.processing` 并作为“无效格式”扔进隔离区！同时导致 Sender 读不到该文件。 | **一行代码阻断吞噬**：<br>• 过滤逻辑强制加上 `!name.startsWith(".")`，跳过所有内部点文件；<br>• 补充专项回归测试 `tests/dotfile_inbox.test.mjs` 防止死灰复燃。 |
| **09-22**<br>`236d0b7` | **一次性失手导致 Worker 永久失联**<br>Worker 在被事件唤醒后，执行了一轮分析，但未重新调用 `arm_notification_wait`，Turn 结束后退出。 | **无安全网的单次租约释放**：<br>事件到达即释放当前 Lease。若模型漏调武装工具，进程失去挂起保护。 | **存活 Watcher 自动单次重新武装**：<br>• 在 `agent_end` 若无租约，检查原 Watcher PID 是否存活；<br>• 若存活且未超期，提供**一次性自动重新武装（Auto-rearm）**安全网。 |
| **09-24**<br>`a16e57a` | **任务提示词数字引发 ItemKey 互撞**<br>并行派发的第二个 Worker 启动直接报错拒绝：`worker item collision: 001649 already owned...`。 | **旧版正则表达式过度抓取**：<br>系统曾使用 `^\d{6}$` 自动提取事项，提示词中的浮点数截断（如 `0.001649`）被误当成数字 ID 注册进所有权表，导致后续任务撞车。 | **领域化 ItemKey 与默认控制通道**：<br>• 淘汰纯数字贪婪抓取，改为显式领域键格式（如 `ci:run-42`）；<br>• 为每个 Worker 自动派发专属通道 `worker:<taskId>`，普通追问无需争抢领域键。 |
| **09-26**<br>`164abe5` | **租约与 Watcher 超时赛跑导致丢事件**<br>Watcher 在超时边界发出的错误报告，被系统拒绝：`no active wait lease`，Worker 未收到通知。 | **超时时间设置相等产生竞争**：<br>Watcher 的 `--timeout` 与 `arm_notification_wait` 的 `leaseSeconds` 设为相同数值，事件到达时租约恰好早了几毫秒到期。 | **阶梯式超时与有界重试**：<br>• 规范要求 Watcher 超时必须显著小于租约时间（通常差 30m~1h）；<br>• Sender 增加 `--lease-wait-seconds`，支持等待租约落盘的有界重试。 |
| **09-28**<br>`9a396e6` | **Envelope v1/v2 协议割裂与乱序**<br>不同脚本产出的通知混杂，旧格式缺失校验字段导致主会话偶发丢消息。 | **版本演进兼容断层**：<br>旧脚本只写 5 个字段的简易 JSON，缺少 sequence 与 TTL 保护。 | **统一 v2 Envelope 与兼容桥接**：<br>• 规范化发布 Envelope v2（含 sequence, runId, nonce, level）；<br>• 扩展内部实现 v1 格式的无损桥接转换，统一单调序号防乱序。 |
| **10-02**<br>`e28223c` | **内存假确认引发断电丢事件**<br>主进程收到通知但尚未持久化时突遭断电或崩溃，重启后事件被误认为已送达而永远丢失。 | **把内存排队当成交付 ACK**：<br>只要 `sendUserMessage` 没抛错就删除了 Outbox 事件，忽视了 Session JSONL 落盘的延迟。 | **Inflight Journal 与磁盘 Receipt ACK**：<br>• 注入前记录持久化 Inflight Journal；<br>• 只有在 session JSONL 文件真正写入带标记的 user message 并 **`fsync`** 后，才确认删除 Outbox。 |
| **10-02**<br>`e28223c` | **主会话多终端并发双写与竞争**<br>用户在两个终端打开了同一个主会话，通知到达时两个进程同时抢着注入消息。 | **缺乏跨进程排他互斥**：<br>仅靠读取 PID 文件无法可靠锁定会话所有权，遇到僵尸进程极易误锁或脑裂。 | **Python flock Guardian 守护者**：<br>• 引入 `session_controller.py`，通过私有 Pipe 维持 POSIX `flock`；<br>• 父进程崩溃时内核自动关 Pipe 触发 EOF 释放锁，竞争进程请求 Pi 优雅 shutdown。 |
| **10-02**<br>`e28223c` | **父进程升级期间离线事件无法投递**<br>主会话因版本升级退出，外部 Watcher 认为主会话已死，丢弃所有后续完成通知。 | **强依赖主进程活跃心跳**：<br>没有持久化主会话身份机制，进程退出即代表会话终结。 | **24 小时精确 ID 离线恢复路由**：<br>• 持久化主身份至 `main-identities/<hash>.json`；<br>• 允许 24 小时内向离线主会话投递（事件 TTL 严格限制 ≤1h），冷重启恢复时自动重放。 |
| **10-05**<br>`1f0370b` | **Outbox 堆积陈旧事件拖死空闲 CPU**<br>长期运行后，大量已过期的事件留在扫描目录，导致定时器轮询 CPU 占用升高。 | **缺乏过期条目归档策略**：<br>扫描器每次轮询都要对成百上千个历史过期文件进行反序列化和过滤。 | **自动归档与生命周期清理**：<br>• 过期且无需确认的事件自动迁移至归档区；<br>• 保持活跃 Outbox 文件数有界，降低空闲扫描开销。 |
| **11-23**<br>`7c5e2f4` | **Worker 遇 502/超时后卡死数小时不重试**<br>Worker 被事件唤醒后遭遇上游 `502` 或 `Request timed out`，日志停在 `turn_end` 不再前进，Pi 的 `auto_retry` 迟迟不触发，只能靠人工 `subagent_reload` 救回。 | **`agent_end` 钩子早于 `auto_retry` 且无视错误终态**：<br>Pi 核心先 `await` 扩展的 `agent_end` 再执行 `_handlePostAgentRun()` 的自动重试与压缩；旧版 `agent_end` 未检查最后一条助手消息的 `stopReason`，当共享 producer PID 仍存活时直接触发 `rearmReleasedLeaseIfProducerAlive()` 或继续挂起活动租约/心跳，把重试逻辑堵死数小时。 | **错误/中止回合跳过挂起并保留现场**：<br>• `agent_end` 检查 `willRetry === true` 与 `lastAssistantStopReason(event)`（`"error"` / `"aborted"`）；<br>• 命中时立即返回，不阻塞 `auto_retry`/compaction，也不触发自动重挂；同时完整保留既有租约与心跳状态，待重试成功回到正常回合再无缝接续，不可恢复错误则走 `session_shutdown` 清晰上报。 |

---

## 4. 核心机制深水区

### 4.1 零消耗挂起：`arm_notification_wait` 如何工作

让 LLM Worker 等待外部事件，最致命的误区就是用脚本 `while true; do sleep 5; done`。

`pi-agent-notify` 的实现彻底避开了轮询：
1. **持有挂起**：Worker 调用 `arm_notification_wait` 写入 `.notification-wait-lease` 并结束当前轮次。扩展监听 Pi 的 `agent_end` 生命周期事件，发现当前存在有效租约，立即进入 `await new Promise(...)`，**将 Node.js 事件循环挂起**。此时进程不占任何 CPU，处于完全静息状态。
2. **事件触发**：外部 Watcher 触发事件，通过 Sender 写入精准的 inbox 文件。
3. **精准唤醒**：扩展扫描到匹配的事件后，调用 `resolve()` 解除挂起，并调用 `pi.sendUserMessage(..., { deliverAs: "followUp" })` 将事件作为后续消息无缝排入会话，Worker 立即进入下一轮思考。
4. **超时兜底**：若超过了约定的租约时长，定时器自动触发，向会话注入一条“租约已到期，请回查外部状态和检查点”的系统提醒，防止任务死锁。

```text
Worker 发起长任务 ──> 写 marker ──> arm_notification_wait ──> 结束 Turn
                                                                  │
┌────────────────── Node.js agent_end 挂起中 (0% CPU) ────────────┘
│
├── [外部 Watcher 完成] ──> 发送定向事件 ──> 校验成功 ──> resolve() ──> 注入结果续跑
└── [超过租约期限] ────> 触发 setTimeout ─────────────> resolve() ──> 注入超时提醒
```

### 4.2 基于私有管道的排他控制器（`session_controller.py`）

如何保证同一份主会话文件不会被两个终端进程同时打开并互相踩踏？传统的 `.pid` 文件极不可靠：进程被 `kill -9` 后不会清理文件，新进程启动时又难以区分是死锁还是真实运行。

Notify 采用了一个极其优雅的 Unix 模式：
1. 启动随包自带的轻量 Python 守护进程 `session_controller.py`；
2. 守护进程对 `<identity>.controller` 文件执行 **`fcntl.flock(fd, LOCK_EX | LOCK_NB)`**，持有内核级排他锁；
3. 关键在于：**守护进程通过标准输入（stdin）管道与 Pi 主进程相连**，并在循环中阻塞读取：
   ```python
   # Only the owning Pi has this write end. EOF is also the crash path.
   while sys.stdin.buffer.read(4096):
       pass
   ```
4. 当 Pi 正常退出，或者遭遇崩溃、被 `SIGKILL` 抹杀时，**操作系统内核会自动关闭该进程打开的管道写端**。Python 守护进程瞬间读到 EOF，随之退出并释放 `flock`。

**锁属于内核文件描述符，而非磁盘上的静态文本。** 杜绝了僵尸锁，也禁止了任何尝试通过“删 lock 文件”绕过锁争用的危险操作。

### 4.3 从“内存入队”到“磁盘转录 Receipt ACK”

分布式系统里最忌讳的就是把“消息发送成功”当成“处理成功”。早期版本中，只要 `sendUserMessage` 没有报错，事件就从 Outbox 删除了。但在宿主进程崩溃测试中，发现大量消息根本还没落盘，重启后彻底失联。

现在的投递闭环如下：
1. **预写日志**：在将消息推送给 Pi 前，先把事件写入 `inflight journal`；
2. **打标签注入**：每条注入的用户消息末尾带上独一无二的指纹：
   `[[agent-notify:<eventId>:<identity digest>]]`；
3. **核验磁盘转录**：Pi 的 `message_end` 触发后，扩展**不予确认**，而是去检查磁盘上的 canonical session JSONL 文件；
4. **最终确认**：只有确认上述标记字节已经成功追加写入文件并完成 `fsync`，才从 Outbox 移除该事件并存入去重历史。

即使在注入后一毫秒断电，重启后的冷启动流程也会从磁盘重建 ACK 状态，未确认的事件会自动重新重放，保证**绝对不丢事件**。

---

## 5. 核心经验与架构哲学

1. **绝对的 Fail-Closed 优于自作聪明的推测**：
   在多会话、多 Worker 的复杂环境里，只要有一丁点歧义（例如同目录两个会话、Nonce 不匹配、租约超前），**直接报错拒绝是唯一正确的做法**。任何“选最近修改的一个”之类的启发式后门，最终都会在生产里演变成不可逆的数据污染。
2. **进程外状态高于进程内状态**：
   不要相信内存变量能挺过风暴。无论是 Watcher、Inflight 日志、Controller 锁、心跳调度还是任务租约，全都要有明确的磁盘表象和内核所有权机制。
3. **退役比注册更危险**：
   就像那个著名的点文件自吞噬 Bug 一样，自动清理和垃圾回收逻辑如果缺乏严格的身份边界，不仅清理不了垃圾，还会把系统的“心脏”（身份文件）当成垃圾消灭掉。
4. **特殊格式优先零依赖**：
   工具链和扩展的内部日志、状态通知，保持最基础的标准数据结构，不搞花哨的非标语法，保证跨平台、跨客户端的一致性。

> [!SUMMARY] 演进里程碑
> - **08-15**：初版上线，建立基于文件 Inbox 的 Script→Agent 异步通知通道；
> - **08-25**：实现 `arm_notification_wait`，通过挂起 `agent_end` 达成 Worker 零开销静息等待；
> - **09-10**：引入精准身份四元组路由，多会话同目录自动 Fail-closed，杜绝串台；
> - **09-18**：排查并修复点文件自吞噬故障，严禁扫描收集 `.receiver-identity.json`；
> - **09-22**：增加 Watcher 存活时的单次 Auto-rearm 机制，提供租约遗漏安全网；
> - **09-24**：废除纯数字 Item 正则，引入通用领域 ItemKey 与 `worker:<taskId>` 默认控制通道；
> - **10-02**：落地 Python Pipe flock Guardian、Inflight Journal 与会话磁盘 Receipt ACK 投递屏障；
> - **10-02**：实现持久化主会话身份与 24 小时离线恢复通道，支持主代理冷升级不丢事件；
> - **10-05**：实现 Outbox 过期事件自动归档，压降长期后台轮询 CPU 消耗；
> - **11-23**：新增 `notify_heartbeat` 工具，支持主会话与 Worker 自主设置周期性自唤醒心跳（默认 30 分钟，有活动时跳过不发送，调度持久化跨 reload 恢复）。
> - **11-23**：修复 worker 在 `error`/`aborted`/`willRetry` 回合被 `agent_end` 租约挂起或自动重挂阻塞 `auto_retry` 的卡死故障。
