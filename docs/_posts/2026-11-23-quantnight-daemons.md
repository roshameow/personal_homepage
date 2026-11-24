---
layout: post
title: QuantNight 守护进程与定时调度体系全景
categories:
  - tool
tags:
  - quantnight
  - launchd
  - daemon
  - scheduler
  - architecture
  - macOS
last_modified_at: 2026-11-24T09:20
created: 2026-11-23T17:36
date: 2026-11-23
theme: worldquant/architecture
theme_subtitle: daemon & scheduler
---

> **写作定位**：整理 QuantNight 当前实际使用的 macOS 常驻守护进程（Daemons）、`launchd` 周期/日历任务、调度并发锁机制，以及面向持久 Agent 会话的定时唤醒入口（替代早年单条 plist 示例旧笔记）。MCP 服务内部机制详见 [《QuantNight 原生 MCP 共享底座架构》（alpha30）](2026-11-23-alpha30.md)；`rotatelogs` 轮转、`ingest_error_logs` 报错入账与 30 天日志留存清理细节统一见 [《服务端通知与自动化错误台账系统》（error & log）](2025-10-23-message.md)，本文不重复展开。

---

## 一、Daemon 与定时调度全景总表

各后台任务按职责相互独立运行，下面按“**常驻 Daemon → 周期任务（`StartInterval`）→ 日历任务（`StartCalendarInterval`）→ Agent 定时唤醒**”汇总当前全量配置与入口：

| 类别 | 服务 / 任务 Label | 定义位置与载体 | 调度 / 保活方式 | 实际执行入口 / 命令 | 核心职责与部署范围 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **常驻 Daemon** | `com.quantnight.mongod` | 本机 `~/Library/LaunchAgents/` | `KeepAlive: true`<br>`RunAtLoad: true` | `/usr/local/mongodb/bin/mongod --config /usr/local/mongodb/mongod.conf` | 本地 MongoDB（`27017`），承载 `alpha_db`、`data_db`、`simulation_mission`、`simulation_db`。 |
| | `com.quantnight.mongo-tunnel` | 本机 `~/Library/LaunchAgents/` | `KeepAlive: true`<br>`RunAtLoad: true` | `/usr/bin/ssh -N ... -L 127.0.0.1:27018:127.0.0.1:27017 mac-mini` | 将远端 `mac-mini` MongoDB 映射到本地 `27018`，与 `27017` 物理隔离。 |
| | `com.quantnight.mcp_server` | `scripts/scheduler/` → `LaunchAgents` | `RunAtLoad: true`（`tmux` 常驻） | `scripts/start_mcp_shared.sh` | 在 `tmux -L default` 会话 `mcp_shared` 拉起单一 Streamable HTTP 守护进程（`127.0.0.1:8765/mcp`），从私有 `0600` 文件读 Bearer token。 |
| | `com.quantnight.mcp_watchdog` | 本机 `~/Library/LaunchAgents/` | `KeepAlive: true`<br>`RunAtLoad: true` | `scripts/watch_mcp_server.sh` | `fswatch` 监听 `quant_night_mcp/` 核心源码变更，轮询 `check_mcp_restart_safe.py` 等待在途任务静止后安全重启。 |
| | `com.quantnight.task-runtime.c69a078a0cb58363` | 本机 `~/Library/LaunchAgents/`（前端生成） | Runtime Host 常驻 | `taskctl runtime-host --binding .quantnight/taskctl-dev-binding.json` | 向桌面 GUI 与 CLI 提供共享本地任务运行时与 Unix IPC 入口。 |
| **周期采集** | `com.alpha.fetcher` | `scripts/scheduler/` → `LaunchAgents` | `1800s` + `RunAtLoad` | `run_logged_job.py` → `uv run -m backend.mongodb.mongo_pull_result_incremental --write-db` | Alpha 结果增量拉取入库（属 `MONGO_FETCHERS`）。 |
| | `com.pnl.fetcher` | `scripts/scheduler/` → `LaunchAgents` | `1800s` + `RunAtLoad` | `run_logged_job.py` → `uv run -m api.platform_data.update_pnls --sheet alpha_results --once` | 未提交池 PnL 更新（属 `MONGO_FETCHERS` + `PNL_FETCHERS`）。 |
| | `com.os_pnl.fetcher` | `scripts/scheduler/` → `LaunchAgents` | `1800s` + `RunAtLoad` | `run_logged_job.py` → `uv run -m api.platform_data.update_pnls --sheet alpha_submitted --once` | 已提交 OS PnL 更新（属 `MONGO_FETCHERS` + `PNL_FETCHERS`）。 |
| | `com.yearly_stats.fetcher` | `scripts/scheduler/` → `LaunchAgents` | `1800s` + `RunAtLoad` | `run_logged_job.py` → `uv run -m api.platform_data.update_yearly_stats --sheet alpha_submitted --once` | 已提交池年度统计更新（属 `MONGO_FETCHERS`）。 |
| **周期维护** | `com.prod_correlation.updater` | `scripts/scheduler/` → `LaunchAgents` | `3600s` + `RunAtLoad` | `run_logged_job.py` → `uv run -m api.platform_data.update_prod_correlation --collection alpha_results` | 批量更新平台 `prod` 相关性；默认不自动拉起，按需加载。 |
| | `com.quantnight.log_maintenance` | `scripts/scheduler/` → `LaunchAgents` | `3600s` + `RunAtLoad` | `run_logged_job.py` → `uv run -m scripts.maintain_logs --apply-retention --rebuild-evidence` | 唯一日志治理任务：先增量扫报错进 `artifacts/bugs/` 台账，再执行 30 天归档安全清理。 |
| **手动提交队列** | `com.alpha.submitter` | `scripts/scheduler/` → `LaunchAgents` | `900s` + `RunAtLoad` | `uv run -m api.submit` | 轮询人工/协调会话审核写入的 `tmp/alphas_to_submit.json` 并执行提交与重试；按安全隔离刻意不经 `run_logged_job.py` 包装。 |
| **日历任务** | `com.quantnight.sync_forum` | `scripts/scheduler/` → `LaunchAgents` | 每日 `01:30` + `RunAtLoad` | `run_logged_job.py` → `uv run -m api.forum.sync_forum --mode recent` | 定时拉取论坛最近帖子与评论更新。 |
| | `com.platform.data_collector` | `scripts/scheduler/` → `LaunchAgents` | 每日 `09:00` + `RunAtLoad` | `run_logged_job.py` → `uv run -m scripts.collect_platform_data` | 采集平台收益、提交、榜单与消息，汇总发送日报邮件卡片。 |
| | `com.quantnight.update_base_research` | 本机 `~/Library/LaunchAgents/` | 每日 `16:00`（`RunAtLoad: false`） | `uv run python research/base_research/update_base_data.py` | 更新 `base_research` 快照与 `CURRENT_MODEL_FIT` 产物；默认不写库，显式 `--write-db` 才写。 |
| **Agent 定时唤醒** | `com.quantnight.coordinator_daily` | `scripts/scheduler/`（软链 `coordinator/schedules/daily.plist`） | 每日 `13:00`（`launchd`） | `agent_roles/sessions/coordinator/scripts/notify_daily.py --session-id ... --timezone Asia/Shanghai` | 在平台日切点通过 `pi-agent-notify` 向固定统筹主会话发单次盘点通知；仅统筹节点按需加载。 |
| | `spc-daily-automation` | `portfolio_combined/allocate_spc/scripts/install_daily_spc.sh` | 每日 `01:30`（`crontab`） | `portfolio_combined/allocate_spc/scripts/run_daily_spc.sh` | 仅在承担 SPC 的节点安装唯一 cron 条目，只读采集并写持久状态后发 `pi-agent-notify` 唤醒持久 `spc` 会话。 |

> 注：`run_logged_job.py` 自身会注入 `TQDM_DISABLE=1`（关闭进度条噪声）与 `PYTHONUNBUFFERED=1`（实时刷出日志）；上述 `MONGO_FETCHERS` 采集任务及 `log_maintenance` 的 `.plist` 还在 `EnvironmentVariables` 中显式设置了 `UV_OFFLINE=1` 与 `UV_NO_SYNC=1`（`log_maintenance` 额外设置 `PYTHONDONTWRITEBYTECODE=1`），防止 `uv run` 在定时触发时自动同步 `.venv` 依赖或联网拉包。

---

## 二、调度层并发锁与安全边界（`run_logged_job.py`）

除 [《服务端通知与自动化错误台账系统》](2025-10-23-message.md) 中已经展开的 `rotatelogs` 管道轮转与 `maintain_logs.py` 留存策略外，定时调度包装层 `scripts/run_logged_job.py` 还承担两项**数据库并发与执行安全**职责：

1. **高并发 MongoDB 采集双层 `flock` 串行排队**
   - 每个任务先持有自身专属 `<log>.lock` 防同一任务重入；
   - 列入 `MONGO_FETCHERS` 的高频写库与 PnL 更新任务还会额外竞争全局共享锁 `logs/mongo-fetchers.lock`（`MONGO_LOCK_WAIT_SECONDS = 900`），避免多个 1800s 周期任务同时撞点写库或争抢大索引；
   - 子进程启动后可通过 `verify_mongo_lock_context()` 校验跨 `exec` 继承的锁文件描述符确实在内核态处于持有状态，同时检查 `.quantnight/pnl-storage-maintenance.json` 维护安全闩——维护未结束前拒绝普通采集任务闯入。
2. **严格的白名单包装边界（`scripts/scheduler/log_policy.json`）**
   - `run_logged_job.py` 只放行 `log_policy.json` 白名单中注册的 `uv run -m` 模块，正则显式禁止包装 `submit|simulat|runner|mcp` 等高危执行入口；
   - 拒绝路径穿越与符号链接，`plist` 的 `StandardOutPath` / `StandardErrorPath` 只写入独立的 `logs/*.launcher.log`，避免和 `rotatelogs` 管理的业务主日志相互覆盖。

---

## 三、Agent 定时驱动模式：把调度留在系统层，把上下文留在持久会话

对比早期直接在 crontab 里跑 `pi -p` 每次新开无状态一次性会话，QuantNight 的两套 Agent 定时任务（`coordinator_daily` 与 `spc`）现在统一收敛为：

```text
系统定时层 (launchd 13:00 / cron 01:30)
   │  只做机械采集/构造轻量事件（不启动新 pi 进程，不消耗 LLM）
   ▼
notify_daily.py / run_daily_spc.sh
   │  调用 pi-agent-notify/scripts/notify_agent.py（带 eventId 与 TTL 去重）
   ▼
既有的持久 Pi 主会话 (coordinator / spc)
   └─ 唤醒后先重读 Goal / 检查点，不把通知当成完成证据
```

- **系统时区归 `launchd`**：`notify_daily.py` 直接由 `launchd` 按系统日历 13:00 触发并单次发送，Agent 内不循环查表看时间；
- **只读与只唤醒边界**：`run_daily_spc.sh` 只执行只读采集并写持久状态（从不直接调 `sync_spc.py sync`），具体决策与后续子任务都留在持久会话内推进。

---

## 四、日常排查与兼容入口说明

### 常用状态核查命令

```bash
# 查看已加载的 QuantNight / 采集任务（PID 与上次退出码）
launchctl list | grep -E "alpha|pnl|prod_corr|platform|quantnight|os_pnl|yearly"

# 跟踪跨 rotatelogs 轮转的业务日志（务必用 -F，不要用 -f 死绑旧 inode）
tail -F logs/alpha_fetcher.log

# 进入或检查共享 MCP daemon 与重启门禁
tmux -L default ls
python3 scripts/check_mcp_restart_safe.py
```

### 兼容入口说明

| 兼容入口 | 当前状态与说明 | 规范替代方式 |
| :--- | :--- | :--- |
| **`scripts/start_mcp_unixsocket.sh`** | `com.quantnight.mcp_server.plist` 已改为直接调用 `scripts/start_mcp_shared.sh`；本脚本作为历史路径兼容薄壳保留（内部仍 `exec start_mcp_shared.sh`），以满足旧调用方与架构测试约束。 | 实际规范入口为 `scripts/start_mcp_shared.sh` 与 Streamable HTTP `127.0.0.1:8765/mcp`。 |
