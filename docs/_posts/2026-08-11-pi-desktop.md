---
layout: post
title: Pi Desktop：从会话浏览器到跨机器工作台
categories:
  - tool
tags:
  - content
  - jekyll
  - pi
  - tauri
  - rmux
  - macOS
last_modified_at: 2026-09-26T17:39
created: 2026-08-11T09:30
date: 2026-08-11
---

我最初只是想给 [pi coding agent](https://github.com/badlogic/pi-mono) 补一个桌面会话浏览器：按项目查看 JSONL、展开工具调用，需要时从原会话继续聊。

后来它逐渐变成了一个工作台：能把主会话和 subagent 放回同一棵树里，知道每个 pi 正运行在终端还是 RMUX，能 attach、detach 和结束后台进程，还能浏览远程机器，甚至把本机会话转移过去继续运行。

项目源码：[pi-session-viewer](https://github.com/roshameow/pi-session-viewer)。仓库里也有不读取本机数据的合成会话 demo，方便先看界面。

## 1. 现在它解决什么问题

我同时跑多个项目和 subagent 后，终端本身不再是一个好索引：

- 会话文件在 `~/.pi/agent/sessions/`，终端标签却散落在不同窗口；
- 主会话、subagent 日志和 mirror 文件彼此有关，但目录结构表达不出来；
- 关掉标签页不等于任务结束，RMUX 里的 pi 可能仍在后台运行；
- 同一个会话如果被两个 pi 同时续写，JSONL 有损坏风险；
- 长任务转到另一台 Mac 后，本机又看不到它的进度。

Pi Desktop 因此围绕四件事组织界面：

1. **浏览**：按工作目录列出会话，渲染消息、thinking、工具调用、输出和模型信息；
2. **关联**：把 durable subagent 挂回父会话，并区分 running、sleeping、interrupted、finished；
3. **控制**：继续会话，打开或附着 TUI，detach，关闭 RMUX session；
4. **定位**：显示会话是在本机终端、本机 RMUX、远程 RMUX，还是只剩一个死 pane。

这里最重要的设计是：**“在哪里”与“是否还在运行”是两条状态。**

`○ rmux` 表示会话仍在 RMUX 中但没有客户端附着，不代表它此刻正在生成内容；`✕ rmux` 表示 remain-on-exit 留下的死 pane；`● term` 才表示普通终端里的活进程。位置和活动状态混在一起，界面很快就会撒谎。

## 2. 架构：直接复用本机 pi

技术栈很简单：React 18 + Vite 做前端，Tauri v2 + Rust 做本地后端。

```text
React UI
  ├─ Sidebar：项目、主会话、subagent、runtime chip
  ├─ Thread：JSONL 消息树、工具调用、流式输出
  └─ Composer：继续会话

Rust / Tauri
  ├─ sessions.rs：解析、索引、runtime 归属、缓存
  ├─ agent.rs：spawn pi --mode json，转发事件流
  ├─ remote.rs：SSH/rsync、远程快照、会话转移
  └─ lib.rs：Tauri commands、RMUX 与 Terminal 集成
```

我没有再加 Node sidecar。pi 已经提供 `--mode json` 的增量事件流；执行：

```bash
pi --session <file> --mode json
```

就能继续原会话，并由 pi 自己把新内容写回同一个 JSONL。Rust 只负责启动进程、逐行转发 stdout。这样认证、模型、扩展和配置都继续使用用户现有的 pi 环境。

## 3. 最难的不是解析，而是 runtime 归属

一开始我以为从 `ps` 找 `--session` 就够了，实测 pi 会把 argv 清理到只剩进程名。后面的窗口名、`@pi_session`、tty、pid 注册表，都是为了解决同一个问题：**某个活进程究竟对应哪份会话文件。**

目前主路径是每个 pi 在启动时写一个私有注册文件：

```text
~/.pi/agent/runtime/<pid>.jsonl
```

里面记录 `pid`、`panePid`、`sessionPath`、`cwd`、`startedAt` 和 `tty`。Desktop 用进程 pid 或 pane 顶层 pid 直接找到会话，不再根据“最近修改的文件”猜测。

RMUX 仍保留两层兼容信息：

- 每个主会话使用独立的 `pi-<cwd>-<id12>` session；
- 窗口的 `@pi_session` 保存会话路径。

但它们现在是注册表缺失时的 fallback，而不是唯一真相。窗口名中的 id12 还会与 `@pi_session` 互相校验，避免错误写入污染归属。完整演进放在下一篇：[Pi runtime 归属：不要猜“哪个会话正在跑”]({% post_url 2026-08-12-pi-runtime-attribution %})。

这一套也让防重复启动变得可靠：Open TUI 或 Attach 前先检查目标会话是否已有活进程，避免两个 pi 同时 append 同一份 JSONL。

## 4. subagent 不是一个文件，而是一段生命周期

`pi-subagent-durable` 会产生真实子会话、mirror 和 task log。第一版只用 mirror header 的 UUID 关联，遇到 reload 就开始出错：同一个子会话会有多个 taskId，旧任务已死，新任务仍在跑；后生成的 mirror 还可能覆盖最初用于匹配父任务的文本。

现在索引做了三件事：

1. 一个 UUID 保留所有 taskId，状态优先选择仍存活的任务；
2. 一个 UUID 保留所有 mirror 的首条任务文本，旧日志仍可做兼容匹配；
3. 新日志中的 `pi_subagent_parent` 明确记录父会话 UUID，作为首选关联，文本相似度只服务旧数据。

这比“根据文件名拼关系”稳定得多。reload 后，子会话仍挂在原父会话下，running/sleeping 状态也跟随新的 live task，而不是停在已经死亡的旧 task 上。

## 5. 性能优化做了两轮

### 5.1 第一轮：少读文件

早期在 129 个会话上，`list_sessions` 从约 2.25 秒降到 117 毫秒。主要手段是：

- header 和首条消息只做有界读取；
- 按 `(mtime, size)` 缓存 metadata、detail 和父子关联；
- 巨型会话默认只挂载尾部 150 条消息，按需向前展开；
- Markdown 组件 memo 化。

这解决了“文件越大越慢”，但没有解决“刷新时整个应用都被堵住”。

### 5.2 第二轮：不能阻塞 UI，也不能让轮询重做旧工作

会话增长到 470 多份后，问题重新出现：`list_projects`、`list_sessions`、`session_detail` 各自可能耗时 6–8 秒。更关键的是，Tauri v2 的同步 command 会占住 UI 线程，打开应用能冻结十几秒，10 秒轮询还会重复制造卡顿。

后来的修复分成四层：

- **调度层**：所有重命令改为 async wrapper，并用 `spawn_blocking` 放到阻塞线程池；
- **系统调用层**：逐 pane 的 `kill -0`、`ps`、`list-clients` 改成批量快照；
- **数据层**：项目列表、会话列表、进程快照、日志尾部都做指纹或 TTL 缓存；
- **渲染层**：没有变化就保留原对象引用；流式事件增量归并为 block，每 80ms 最多刷新一次，而不是每个 token 重建整段历史。

轮询也从 `setInterval` 改成递归 `setTimeout`：上一轮结束后才安排下一轮，窗口在后台时暂停，避免慢扫描重叠。task log 的状态判定则只读末尾 64KB，不再每 10 秒读取几十 MB 的完整日志。

开发机上的一组观察值是：

| 操作 | 优化前 | 优化后 |
|---|---:|---:|
| `list_projects`（472 files） | 8.4s | 0.6s；缓存命中约 2ms |
| `list_sessions` | 6.5s | 1.2s；无变化时约 2ms |
| `list_running` | 520ms | 44ms |

这些数字来自真实使用环境，不是严谨 benchmark；真正有用的结论是：**缓存只能降低工作量，`spawn_blocking` 才保证工作量再大也不拖死界面。**

## 6. 从本地查看器到远程工作台

远程支持没有重写解析器，而是增加了一个 source 层。切换到 SSH host 时，Desktop 会：

1. 用 rsync 把远端 `~/.pi/agent/` 的 sessions、agent-logs 和 runtime 缓存到本机：
   `~/.pi/remote/<host>/agent/`；
2. 用一次 SSH 请求抓取 `ps` 与 RMUX pane 快照；
3. 让原有 `sessions.rs` 改读这棵本地缓存；
4. Attach、Detach、Close 等动作再通过 SSH 回到远端执行。

这样，JSONL 解析、subagent 索引和绝大多数 UI 逻辑都不需要区分本地与远程。SSH 使用 ControlMaster/ControlPersist 复用连接，rsync 与状态快照共享同一条连接，避免每次切 source 都重新握手。

右键 **Transfer to Remote** 则做相反方向的迁移：收集主会话和相关 subagent mirror，将 JSONL 中的本地项目根目录替换为远端 cwd，上传到远端 sessions 目录，再在远端新建一个 detached RMUX session，执行 `pi --session` 继续运行。

这里有一个明确边界：**迁移的是会话记录，不是正在运行的进程。** subagent 进程不会穿过机器搬家；Desktop 会附加提示，让父会话按 durable 进度重新发起未完成的任务。

## 7. macOS 的小坑：打开标签页比想象中难

Terminal.app 的 AppleScript `do script` 会复用前台标签页。若前台正运行 raw-mode TUI，命令可能直接被打进 pi 的 stdin。可靠做法是发送 `Cmd+T`，再在新标签页执行 attach；而模拟按键需要 Accessibility 权限。

主 app 每次重建，unsigned binary 的 cdhash 都可能变化，TCC 授权随之失效。最终我把**按键操作放进一个不随 app 重建的 `tab-open-helper`，单独授权它**。helper 成功后直接信任返回，不再用异步的 tab 数量做二次判断，否则会同时打开标签和窗口。

这不是核心功能，却很典型：桌面应用里，业务逻辑正确不等于系统集成可靠。

## 8. 项目目前的状态

代码已经公开，并补了三种无需真实会话的入口：合成会话浏览 demo、20 秒示意动画和静态截图。当前仍以源码构建为主，macOS 是主要开发平台；仓库没有把本地自签名构建包装成“正式、公证过的发行版”。

回头看，Pi Desktop 的主线并不是“给 CLI 套一个 GUI”，而是把散落在文件、进程、RMUX 和远程机器里的状态重新拼成可信视图。最值得保留的三条经验是：

1. **身份不要靠时间和文本猜，尽量让运行进程注册自己；**
2. **耗时工作不仅要缓存，还必须离开 UI 线程；**
3. **远程支持优先复用现有本地模型：同步数据与快照，比复制整套逻辑更稳。**

> [!timeline] 关键演进
> - **08-10 / 08-11**：会话浏览、继续会话、每 pi 独立 RMUX、runtime chip、窗口化渲染
> - **08-12**：pid runtime registry，终端与 RMUX 归属从启发式改为直连
> - **08-13 / 08-15**：reload 多 task 状态、subagent 多 mirror、远程 source switcher
> - **08-17 / 08-21**：列表缓存、主线程解阻塞、批量系统调用与稳定引用
> - **08-23**：会话转移到远端，修复远端 pane liveness
> - **09-04 / 09-09**：轮询与流式渲染降 CPU，远端父子关系改为显式标记优先
> - **09-15 / 09-16**：公开 demo、可复现示意动画与截图
