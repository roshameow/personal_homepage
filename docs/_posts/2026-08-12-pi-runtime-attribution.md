---
layout: post
title: 'Pi Desktop的开发难点: “会话的状态”'
categories:
  - tool
tags:
  - pi
  - tauri
  - rmux
  - macOS
  - debugging
last_modified_at: 2026-10-06T10:48
created: 2026-08-12T10:30
date: 2026-08-12
---

Pi Desktop 里最难修的功能，是侧边栏那枚很小的状态 chip：**这个会话现在的运行状态**？

它可能在普通终端、RMUX pane、远程主机，也可能进程已经退出，只剩 remain-on-exit 保存的死画面。更麻烦的是，显示错位置不会立即报错；界面仍然完整，只是把操作发给了错误的会话。这类“看起来合理”的错误最危险。

下面讲下原理和迭代过程.

## 1. 会话和pid绑定(who)

为什么会话和pid绑定是个难题?? 根本原因在于**生命周期与操作系统抽象的深层错配**：

1. **生命周期的断层**：
   - **Session JSONL（业务实体）**：具有**长持久性**。它记录了完整的思维链与执行树，寿命跨越数天、数月，支持反复暂停与 `resume`。
   - **PID（内核资源）**：具有**极短的易逝性与复用性**。它只是内核进程表里循环利用的一个整数标签。进程退出后，内核下一秒就可能把相同的 PID 赋予一个无关的临时脚本。
2. **关系基数是时序上的 1 对多**：
   - 同一个session，昨天是 PID 1024 在跑，今天是 PID 5088 在跑；
   - 用户在两个终端同时打开同一会话的并发多对一。
   - 进程执行 /new，PID 没变，但它脱钩了旧 session，指向了新 session。

| 追踪维度                                  | 操作系统理论能力 (Textbook)                                     | 真实 CLI 场景失效细节 (Physical Failure)                                                               | 早期妥协尝试及致命漏洞 (Early Flaws)                                                            |
| :------------------------------------ | :------------------------------------------------------ | :--------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **正向：进程参数**<br>`PID → argv`           | 内核维护进程命令行：<br>`ps -p <pid> -o args=` 可查看启动参数            | **参数被运行时擦除**：<br>CLI（如 Node/pi）启动时为防 Token 泄露或美化，在内存中主动抹洗 `process.argv`，`ps` 查出来只剩裸词 `pi`     | **无法提取**：<br>`ps` 扫出来的所有进程全叫 `pi`，彻底丢失 `--session` 标志                                |
| **正向：文件描述符**<br>`PID → FD → inode`    | 内核维护打开的文件表：<br>`lsof -p <pid>` 或 `proc_pidinfo` 可查持有的文件 | **句柄为短命瞬态**：<br>JSONL 写入使用微秒级 `appendFile`（打开→追加→立即关闭）。99.9% 的时间（LLM 推理、等待）该文件**压根不在内核 FD 表中** | **抓取落空 + CPU 暴增**：<br>`lsof` 绝大多数时候抓不到 session 文件，且每秒调用一次的 `fork/exec` 吞噬 5%~10% CPU |
| **反向：文件查进程**[1](#unix-pid-file)<br>`Session → PID` | **内核天然不支持**：<br>POSIX 只有进程到文件的单向映射，无全系统 inode 反向活进程广播机制 | **生命周期错配**：<br>JSONL 存活数月，PID 循环复用；同一个 Session 昨天被 PID 100 跑，今天被 PID 200 恢复                    | **使用 mtime（最后修改时间）**：<br>并发任务互相抢最新修改时间，造成正在流式打字的任务画面在 UI 上疯狂跳变                       |

<a id="unix-pid-file"></a>

- 一个类似的问题是: 经典的Unix服务都要搞.pid文件. 用于给服务端的守护进程注册一个pid 用来查询 , 就是因为内核天然不支持从文件反查进程
- 最终解决方案: **创建注册表统一管理**, 确定 pid ↔ sessionPath 注册机制

3. 更细节的问题: 如何管理注册表的生命周期
   - 判断pid是否存活: 防止runtime目录无限增长
   - 解决 PID 回收复用：记录进程的运行时间, 不许系统复用pid给不同session
   - 支持终端与 Pane 的层级穿透：在真实开发中，pi 绝大多数不是孤立跑的，而是跑在 RMUX Pane 里的

   ```text
   [RMUX Pane (PID 7000: zsh)]
      └── [node wrapper (PID 7001)]
             └── [pi engine (PID 7002)]
                    └── [subagent / bash tool (PID 7003)]
   ```

| **中间层：窗口环境**<br>`Pane/TTY → Session` | TMUX/RMUX 支持窗口变量：<br>`set-option -w @pi_session` 保存状态 | **共享槽污染 (Shared State)**：<br>`display-message` 默认取当前活跃窗口，终端中的 pi 或后台任务会把路径误写进别人的 Pane | **窗口名 id8 碰撞 + option 脏写**：<br>普通终端没有 Pane 概念；前 8 位 UUID 实测碰撞；写入槽被其他进程覆盖 |
| :----------------------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| **生存期：PID 回收**<br>`PID Liveness`     | 借用内核探活信号：<br>`kill -0 <pid>` 判定进程是否活着                 | **PID 回收还魂 (Recycling)**：<br>`kill -9` 无法触发清理钩子；macOS 会迅速将释放的 PID 分配给无关的新进程           | **幽灵存活**：<br>已退出的会话被误判为存活（因为新运行的某个进程恰好分到了同一个 PID）                        |

## 2. runtime 状态认知解耦

runtime 状态其实包含两个维度：

- **位置(where)**：term / RMUX attached / RMUX detached / dead pane；
- **活动(what)**：running / sleeping / interrupted / finished。

```text
               ┌── 查系统/RMUX API ──────> 【位置 (Where)】：term / attached / detached / dead
[PID ↔ Session]
               └── 查进程信号 + JSONL尾部 ─> 【活动 (What)】：running / sleeping / finished / interrupted
```

一个会话可以位于 detached RMUX 中，但当前没有生成内容；subagent 也可以进程仍活着，却正在执行长时间 `sleep`。因此 `inRmux` 不能直接推出 `running`，终端标签页关闭也不能推出任务结束。

界面最终保留了这组位置 chip：

| chip     | 含义                           |
| -------- | ---------------------------- |
| `● rmux` | RMUX session 有客户端附着          |
| `○ rmux` | RMUX session 存在，但当前分离        |
| `✕ rmux` | pane 已死，remain-on-exit 仍保留画面 |
| `● term` | pi 在普通终端中运行                  |

活动状态则由会话文件变化、task log 尾部事件和进程存活共同判断。

## 3. agent在处理这个问题时犯的具体错误和迭代过程

最初开发用的deepseek-v4-flash只会解决眼下问题, 不会分析整体架构, 所以反复出错迭代了20版左右才收敛到最终的注册表方案

### 3.1 从 `ps` 读取 `--session`

第一版想从进程命令行找：

```bash
ps -o command= -p <pid>
```

但 pi 启动后会把 argv 清理到只剩 `pi`，`--session <path>` 不再可见。`ps` 仍能提供 pid、tty、cwd 和启动时长，却不能回答“正在写哪份 JSONL”。

### 3.2 用最近修改的会话文件

如果一个项目只有一个 pi，拿 mtime 最新的会话看起来可行；同项目并行两个终端 pi 时，两者却都会指向同一个“最新文件”。而且 mtime 表示最后一次写入，不表示进程启动时选择了哪个会话。一个运行了 12 小时的真实会话，反而可能输给刚创建但从未使用的诱饵文件。

mtime 只能做旧客户端的最后 fallback。需要比较启动时刻时，文件名里的创建时间戳比 mtime 稳定。

### 3.3 用 RMUX 窗口名

我先用 `s<id8>` 表示会话，随后真的遇到两个 UUID 共享前 8 位。后来改成每个 pi 一个独立 RMUX session：

```text
pi-<encoded-cwd>-<id12>
```

窗口固定为 `main`。id12 避免了实测碰撞；独立 session 还解决了另一个 tmux 语义问题：attach 到同一 session 的某个 window，会改变该 session 的活动窗口，多个客户端可能一起跳走。

窗口名比 mtime 强，但手动复用旧窗口、pim 的通用窗口名、历史 id8 窗口都使它无法成为唯一真相。

### 3.4 用 `@pi_session` 作为权威选项

下一版让窗口保存：

```bash
rmux set-option -w -t <session>:<window> @pi_session <session-path>
```

这里 `-w` 不能漏；否则自定义 option 落在 session 级，多个窗口会全部声称自己属于最后写入的会话。

即使 scope 正确，共享 option 仍会被错误写入。最典型的污染是：进程直接调用不带 target 的 `rmux display-message`，得到的是 daemon 当前窗口，不一定是调用进程所在窗口。普通终端里的 pi，甚至可能拿到“上次活跃的 RMUX 窗口”，然后把自己的会话路径写进别人家。

这揭示了真正的问题：**`@pi_session` 是一个共享可变槽；只要多个进程都能写，它就不是身份。**

### 3.5 tty 修好了“我在哪”，但还没回答“我是谁”

为了避免 `display-message` 的 current-window 语义，扩展改成从本进程 tty 反查 pane：

```bash
ps -o tty= -p <pid>
rmux list-panes -a -F '#{pane_tty}|#{session_name}:#{window_name}|#{pane_pid}'
```

tty 与 pane 一一对应，所以它能精确回答“当前进程位于哪个 pane”，也不会受窗口是否 active 影响。查找与 `set-option` 一起重试，避免窗口刚创建时的瞬时竞态。

但普通终端 pi 没有 RMUX pane，同项目多个终端进程仍然只能靠启发式映射。tty 解决了位置，没有给进程提供跨环境统一的会话身份。

### 3.6 中间结果：每个进程写自己的 pid 注册文件

结构性修复是给每个 pi 一个私有身份槽：

```text
~/.pi/agent/runtime/<pid>.jsonl
```

记录示意：

```json
{
  "type": "pi_runtime",
  "pid": 72344,
  "panePid": null,
  "sessionPath": "/Users/me/.pi/agent/sessions/...jsonl",
  "cwd": "/Users/me/Code/project",
  "startedAt": 1786000000000,
  "tty": "ttys002"
}
```

这六个字段各有用途：

- `pid`：注册文件的唯一所有者；
- `panePid`：pi 由 pane 内 shell 启动时，Desktop 可从 pane 顶层 pid 反查；
- `sessionPath`：直接给出会话，不再猜测；
- `cwd`：兼容旧数据和诊断；
- `startedAt`：防止 pid 被系统回收后错误复用旧条目；
- `tty`：判断 `panePid=null` 是真实终端，还是启动时 pane 查找暂时失败。

与 `@pi_session` 相比，关键变化不是“文件比 option 可靠”，而是**写入模型从多人共享一个槽，变成每个进程只写自己的槽。**

### 3.7 注册表也必须验证

注册文件不是天然可信。Desktop 读取时会经过几道检查。

#### 3.7.1 进程必须仍然存活

本地使用 `kill -0 <pid>`。死条目在扫描时直接删除，runtime 目录不会无限增长。

#### 3.7.2 防止 pid 复用

仅检查 pid 存活仍不够：旧 pi 退出后，系统可能把相同 pid 分配给无关的新进程。

Desktop 比较：

```text
当前进程 etime >= 当前时间 - startedAt - 30s
```

若当前进程明显比注册文件年轻，就拒绝该条目。最初这里还踩过一个单位 bug：扩展写的是 `Date.now()` 毫秒，Rust 按秒计算，age 变成负数，防护在生产里等于没运行。现在 `startedAt > 1e10` 时先除以 1000，兼容毫秒和旧的秒格式（`bd4cdb6`）。

多个条目的 etime 通过一次批量 `ps -p pid1,pid2,...` 获取，不再每个条目启动一次 `ps`。

#### 3.7.3 会话文件必须存在

`/new` 被中断时，注册表和 `@pi_session` 可能仍指向已经删除的文件。如果直接接受，旧路径会吞掉 pane 的真实归属。现在只有 `sessionPath` 仍为文件时才走注册表 fast path，否则继续进入窗口名与启发式 fallback（`c4712e2`）。

### 3.8 当前归属链

对于 RMUX pane，当前优先级可以概括为：

1. **pid 注册表直连**：pane pid 直接命中，或某条记录的 `panePid` 命中；
2. **窗口 option 与 id12 互验**：`@pi_session` 有效，且不与窗口名冲突；
3. **窗口名 id12**：从 `pi-<cwd>-<id12>` 定位会话；
4. **历史兼容**：旧 `s<id8>`、subagent taskId 窗口；
5. **最后 fallback**：pane cwd + 进程启动时间，与会话文件名创建时间比较。

对于普通终端：

1. 找 `panePid=null` 且 tty 不属于任何 RMUX pane 的注册条目；
2. 直接使用条目中的 `sessionPath`；
3. 只有未安装新扩展的旧 pi，才退回 `ps comm=pi` 与“项目内最新非 RMUX 会话”的启发式。

所以旧文章里“同项目多个终端 pi 仍无法区分”的风险已经被解决；注册后的两个进程拥有不同 pid 文件，会各自指向自己的会话。

### 3.9 dead pane、重复窗口与 attach

归属正确后，还要处理生命周期。

RMUX 开启 remain-on-exit 后，进程退出不代表 pane 消失。只检查 `has-session` 会把用户 attach 到崩溃画面。现在 runtime map 读取 `pane_dead`：同一会话有多条记录时活 pane 胜过死 pane；整个目标只剩死 pane 时，可以关闭并重建；超过 6 小时的死窗口会被清理，但 JSONL 不动。

Open TUI 和 Attach 也会先查询 runtime map。目标已在 RMUX 中就复用；已在普通终端运行则拒绝再启动。这里不是 UI 洁癖，而是数据安全：两个 pi 同时 append 同一个 JSONL 可能损坏会话。

“Detach”和“Close RMUX session”因此必须分开：前者只断开客户端，pi 继续运行；后者会 kill 整个 session，是硬停止，界面需要二次确认。

### 3.10 reload 让 subagent 身份问题再次出现

runtime 归属稳定后，reload 又暴露了另一类“一对多”关系：一个子会话 UUID 可以先后对应多个 taskId。旧 task 已死，新 task 正在运行，如果索引 first-wins，界面会一直显示 interrupted。

当前做法是保留 UUID 对应的全部 taskId，优先选择存活任务；多个 mirror 的首条文本也全部保留。更重要的是，新版 durable 日志写入 `pi_subagent_parent`，Desktop 用明确的父 UUID 关联，文本匹配只兼容旧日志（`bbca171`、`4261af3`、`9ea6b8d`）。

这是同一条原则的延伸：**有稳定 ID 时，不要让时间顺序或相似文本承担身份职责。**

### 3.11 远程模式为什么不能照搬本机进程判断

远程 source 使用 rsync 拉取会话树，并同步两份状态快照：远端 `ps` 和 `rmux list-panes`。本机的 `kill -0`、`ps` 不认识远端 pid；早期代码误查本机 pid，导致所有远端 pane 都被判死，Attach 失败，Open TUI 还会尝试新建重复 session（`ca45e85`）。

现在远端 pane liveness 只从同步的 host 快照判断，`@pi_session` 中的远端绝对路径也会映射到本地 cache path。远端状态因此是“最近一次同步时的视图”，不是实时 RPC 流；刷新 source 才会更新快照。目前远端快照也没有 client attachment 信息，所以远端 chip 不应被理解为精确的 attached/detached 实时状态。

这是一项有意保留的边界：浏览和控制仍然可靠，但远程状态具有快照延迟。

### 3.12 最后得到的结论

这段调试最初看起来像“把状态 chip 修准”，实际是在区分三类信息：

- **身份**：哪个进程对应哪个会话；
- **位置**：进程位于哪个 tty / pane / host；
- **活动**：进程和任务处于什么生命周期状态。

窗口名、mtime、current window 和文本相似度都只能提供相关性，不能提供身份。最终稳定下来的不是某个更聪明的启发式，而是一套更小的信任边界：

1. 每个进程只写自己的 pid 文件；
2. Desktop 验证存活、进程年龄和会话文件；
3. RMUX option 与窗口名只做交叉校验和兼容 fallback；
4. 远程状态明确按快照处理，不假装成本机实时信息。

**如果一个归属判定还依赖“另一个写入方不会写错”，它就还没有真正修完。**

> 关键修复
>
> - `2e1b29d`：每个 pi 使用独立 RMUX session，窗口名升级到 id12
> - `7ea7f90`：`@pi_session` 改为 window scope
> - `8368008`：窗口名与被污染 option 冲突时，id12 胜出
> - `e2ec2c5` / `d90a034`：用本进程 tty 定位 pane，并整体重试
> - `9afd082` / `35b6c9e`：pid runtime registry 成为 RMUX 与终端归属主路径
> - `bd4cdb6` / `c4712e2`：修正 startedAt 单位，并拒绝已删除的 session path
> - `b2e9f68`：注册表和 pane 的进程检查批量化
> - `ca45e85`：远端 liveness 改读 host 进程快照
