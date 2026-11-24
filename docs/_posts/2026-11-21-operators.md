---
layout: post
title: WorldQuant FASTEXPR 核心算子解析、分布整形与线性回归推导
categories:
  - finance
tags:
  - content
  - worldquant
  - operators
  - fastexpr
  - regression
  - quant
last_modified_at: 2026-11-21T16:04
created: 2026-11-21T12:35
theme: worldquant/platform
theme_subtitle: operators
---

> 本文由原 BRAIN 仿真总览笔记（[2025-01-07-alphas.md](2025-01-07-alphas.md)）中的“常用算子与回归推导”模块独立拆分整理而成，与跨数据集关系总纲 [alpha5](2025-02-26-alpha5.md) 互为补充。表达式遵循 [WorldQuant Expression Language](https://platform.worldquantbrain.com/learn/documentation/discover-brain/introduction-brain-expression-language) 规范：仅可使用平台原生算子与数据字段，多行赋值时每条语句以分号 `;` 结尾。
>
> 本文的“项目复现备注”仅取自 QuantNight `expression/operator_docs/` 的历史平台实证与校准记录：FASTEXPR 是唯一真值，本地 Python 复现只是近似；文中凡标为“未定案”的口径不能当作已值级确认。

---

## 一、核心算子总览：缺失值填补 / 基础统计 / 分布整形

三类操作是 FASTEXPR 信号预处理的并列工序：**缺失值填补**解决低频字段覆盖率，**基础统计**给出组内/时序基准与覆盖度，**分布整形**控制量纲、尾部权重和异常值影响。下表按类别并列列出。

| 类别 | 处理目标 | 代表 FASTEXPR 算子 | 数学本质 / 统计含义 | 适用场景与关键注意 |
|---|---|---|---|---|
| **缺失值填补** | 时间序列回填 | `ts_backfill(x, lookback=d, k=1)` | 在最近 `d` 个交易日内取最近一次有效非空值填补当前 `NaN`；窗口内无有效值则保持 `NaN` | 适合季报/年报与低频公告，提升覆盖率；项目实证 `d=20`↔`d=60` corr=0.9806<1，确认 `d` 是**有限窗口**而非无限 forward-fill |
|  | 组内横向回填 | `group_backfill(x, group, d, std=4.0)` | 当日 `NaN` 由同 `group` 过去 `d` 日所有非空值的 Winsorized 均值回填，不要求该股票自身过去 `d` 日全空 | 适合同行业低频字段；项目实证 `d=20`↔`d=60` corr=0.9895<1，窗口端点、池化顺序与 universe 过滤仍未完全定案 |
| **基础统计** | 组内聚合 | `group_mean(x, weight, group)`<br>`group_sum(x, group)`<br>`group_std_dev(x, group)` | 按权重计算组内基准均值（无效配对 omit）、组内求和、组内标准差；`weight` 可为 `cap`/`log(cap)` 或等权 `1` | 构造行业基准或汇总统计；项目确认权重生效（`volume` vs `close` corr=0.6041），`group_std_dev` 的 ddof 口径未定案 |
|  | 覆盖度检测 | `group_count(x, group)` | 统计同组有效非 `NaN` 标的数；等价于 `group_sum(if_else(is_nan(x), 0, 1), group)`，传常量 `1` 得组内家数 | 检验有效覆盖度；项目复现按 `data.universe` 过滤，非成员不计入且输出 `NaN`，校准 corr=0.9983 |
|  | 时序统计 | `ts_ir(x, d)`<br>`ts_kurtosis(x, d)`<br>`ts_max_diff(x, d)` | 信息比 `ts_mean/ts_std_dev`；四阶峰度；当前值相对过去 `d` 日高点的回撤 `x_t − max(x)` | `ts_std_dev` 已定案 `ddof=1`；`ts_kurtosis` 本地用 excess kurtosis 但仍待值级定案；`ts_max_diff` 方向锁定为 `current − ts_max` |
|  | 时间自变量 | `ts_step(1)` | 每日递增 `1` 的 day counter，常作 `ts_regression` 的 $x$ 提取趋势斜率 | 平台语义明确，但项目文档将本地 Python 复现标为“常量（错）/修复中”，回归探针 corr 仅 0.42，不能把平台语义等同于当前本地输出 |
| **分布整形** | 均值归零（去中心化） | `normalize(x, useStd=false, limit=0.0)`<br>`group_neutralize(x, group)`<br>`ts_av_diff(x, d)` | 让截面/组内/时间窗内信号均值 $\mu = 0$（如 `ts_av_diff(x, d) = x - ts_mean(x, d)`），**不改变方差尺度** | 保留信号相对强度幅度的同时消除市场/行业/长周期均值漂移；`normalize` 的 `useStd/limit` 参数尚未单测，默认路径已校准 |
|  | Z-Score 标准化 | `zscore(x)`<br>`group_zscore(x, group)`<br>`ts_zscore(x, d)` | $\frac{x - \mu}{\sigma}$，使均值 $\mu = 0$、方差 $\sigma^2 = 1$ | **隐含近似高斯分布假设**；极端异常值会拉大 $\sigma$ 并压缩其余正常样本区分度，常先配缩尾。`ts_zscore` 精确展开为 `(x−ts_mean)/ts_std_dev`（corr 0.9973），继承 `ddof=1`；横截面 `zscore/group_zscore` 仍在各自路径校准，不混用口径 |
|  | 均匀分位排名 | `rank(x, rate=2)`<br>`group_rank(x, group)`<br>`ts_rank(x, d, constant=0)` | 不改变横截面单调性，将输入严格映射至 $[0, 1]$ 区间内的均匀分布 | 对异常值完全免疫、权重分配最均匀；代价是**丢弃极值倍数幅度信息**。`ts_rank` 已确认 ON≡OFF；排名类算子输出保持 `NaN`，不被 ON 回填 |
|  | 概率分布映射（Quantile） | `quantile(x, driver="gaussian", sigma=1.0)`<br>`ts_quantile(x, d, driver="gaussian")` | ① 先做 `rank` 至 $(0, 1)$ 并线性收缩到 $(\frac{1}{N}, 1 - \frac{1}{N})$ 防边界无穷大；<br>② 再经逆累积分布函数 $F^{-1}$ 映射至目标分布 | 支持 `gaussian`（正态）、`cauchy`（柯西重尾，显著放大两翼极端选股权重）或 `uniform`；借由目标分布转换控制尾部分配。`driver` 字符串必须带引号；`quantile` 裸对 corr=0.9946，`ts_quantile` 按 `ts_rank` 同机制 + `inv_norm_cdf` 实现，ON 未单测 |
|  | 区间归一化 / 缩放 | `scale(x, scale=1, longscale=1, shortscale=1)`<br>`group_normalize(x, group, ...)`<br>`group_scale(x, group)` / `ts_scale(x, d)` | `scale` / `group_normalize`：**L1 归一化**（$\sum \lvert w_i \rvert = 1$）；`group_scale` / `ts_scale`：Min-Max 线性缩放至 $[0, 1]$ | `scale` 对应交易引擎 `booksize` 分配；多信号相加前宜先同尺度缩放。`scale` 的 `longscale/shortscale` 与 `group_normalize` 完整参数语义尚未值级确认 |
|  | 缩尾与分段裁剪 | `winsorize(x, std=4)`<br>`tail(x, lower=0, upper=0, newval=0)` | `winsorize`：将超出 $\mu \pm k\sigma$ 的值截断回边界；`tail`：将落入严格开区间 `(lower, upper)` 的值替换为 `newval`，边界与两端尾部保留 | 长尾指标做 `zscore` 或回归前的标准预处理；`tail` 可“砍掉中间噪音只交易两头”。`tail` 默认 `newval=0`；`winsorize` 的 ddof 口径未单测 |
|  | 分段与非线性整形 | 三元表达式 `? :` / `if_else`<br>`power`、`log(x+1)`、`-1 / x`、`arc_tan` | 用分段条件（如 `a < 0.1 ? (1.1 - a) : (a > 0.8 ? 1.8 - a : 1)`）构造非单调 U 型或双峰分布；非线性函数压缩右偏长尾或反号 | 适合“中间最优、两端衰减”或对数尺度压缩（如市值/成交额） |

> **项目复现备注（NaN 口径）**：OFF 下横截面算子（`rank/zscore/normalize/scale/winsorize`）与组统计均 omit 输入 `NaN`，自身输出保持 `NaN`；`nanHandling=ON` 时横截面仍不回填，只有“每组单值”类组算子会把输入 `NaN` 回填为组值，group classifier 为 `NaN` 时始终不属于任何组。`ts_*` 聚合在 ON 下改为 `nansum/d`、全缺输出 0，但 `ts_rank`、`ts_backfill` 等透传类 ON≡OFF。残留 `NaN` 没有最外层兜底，会直接导致该股票零权重，不应人为改成 0。

---

## 二、相关性、时序回归（`ts_regression`）与投影正交推导

### 2.1 滚动相关与时序线性回归的数学本质

记滚动窗口 $d$ 内目标序列为 $y$、解释变量为 $x$，窗口样本均值为 $\bar{y}, \bar{x}$。时序线性回归拟合模型为：

$$y = \alpha + \beta x + \epsilon$$

1. **斜率与协方差、相关性的精确联系**：
   $$\text{ts\_covariance}(y, x, d) \propto \sum (x - \bar{x})(y - \bar{y}), \qquad \text{ts\_corr}(x, y, d) = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sqrt{\sum (x - \bar{x})^2 \sum (y - \bar{y})^2}}$$
   $$\beta = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sum (x - \bar{x})^2}$$
   注意：**斜率 $\beta$ 反映的是“单位 $x$ 变动引起的 $y$ 变动倍率”（$y$ 在 $x$ 上的方向弹性），其量级直接受 $y$ 与 $x$ 相对尺度影响**，而非拟合结果曲线自身的增长斜率；在剥离尺度影响的意义上，与 `ts_corr` / `ts_covariance` 高度相通。

   > **`lag` 语义（项目已定案）**：平台只滞后解释变量 $x$，配对为 $(y_j, x_{j-\text{lag}})$，$y$ 的窗口仍止于今日；因此需要 $d+\text{lag}$ 行历史。项目同语言实证 `lag=1 ≡ ts_delay(x,1)` corr=0.9990，整体右移假设 0.9248 被排除。回归只使用两变量均有效的 tuple（listwise），零填假设在 `ts_regression`/`ts_vector_neut` 中均被强排除。

2. **`ts_regression(y, x, d, lag = 0, rettype = ...)` 参数全解**：

| `rettype` | 返回物理量 | 数学公式与语义理解 | 典型实战用法 |
|---|---|---|---|
| **`0`（默认）** | **残差项 $\epsilon$（Error Term）** | $\epsilon = y - (\alpha + \beta x) = (y - \bar{y}) - \beta(x - \bar{x})$ | **$y$ 是主信号**：用 $x$ 作为风险/行业基准或趋势基线，剥离线性解释部分后提取纯净残差 |
| **`1`** | **截距项 $\alpha$（Intercept）** | $\alpha = \bar{y} - \beta \bar{x}$ | 当 $x$ 为市场收益时即个股在窗口内的超额截距（Jensen's Alpha） |
| **`2`** | **回归斜率 $\beta$（Slope）** | $\beta = \frac{\sum (x - \bar{x})(y - \bar{y})}{\sum (x - \bar{x})^2}$ | ① 度量个股对宏观/大盘的暴露灵敏度；<br>② 令 $x = \text{ts\_step}(1)$ 直接提取 $y$ 关于时间轴的线性趋势斜率；<br>③ 与多项 $\beta \cdot x$ 搭配拆分 $y$ |
| **`3`** | **线性拟合估计值 $\hat{y}$** | 用 $x$ 的线性变换重构逼近目标 $y$ 的拟合序列 | **$x$ 是主信号**（在参数上向更平滑/更具经济含义的目标 $y$ 对齐重构，近似于“投影估计”） |
| **`6`** | **决定系数 $R^2$** | $R^2 = 1 - \frac{SSE}{SST} \in [0, 1]$（`SSE` 为残差平方和，`SST` 为均值总离差平方和） | 度量线性模型相对于“直接用样本均值预测 $y$”有多大提升；在同一有效样本、`lag=0` 且分母约定一致时才等于 `ts_corr^2`，可作体制门控阈值 |
| **`8`** | **斜率 $\beta$ 的标准误类度量** | 与 $\beta$ / 残差尺度相关的标准误量，不是 $t$ 统计量本身 | 需配合 `rettype=2` 的 $\beta$ 自行构造斜率信噪比；项目文档把 $\beta$/残差内部口径列为部分未定案，不应把此行当成已值级确认 |

---

### 2.2 横截面回归（`regression_*`）vs 向量投影（`vector_*`）核心差异

在截面同一日内做两因子正交化时，BRAIN 提供两组易混淆但数学假设不同的算子：

- **是否中心化（去均值）的根本区别**：
  - **`regression_proj(y, x)` / `regression_neut(y, x)`**：等价于带截距项的横截面最小二乘回归 $y = \alpha + \beta x + \epsilon$（即**先对 $y$ 和 $x$ 做截面去均值中心化**）。`regression_neut(y, x)` 返回的残差同时与常数向量 $1$ 和 $x$ 正交（天然保证截面均值为 `0`）。
  - **`vector_proj(x, y)` / `vector_neut(x, y)`**：直接把两列截面特征视作 $N$ 维欧氏向量，**不做中心化**直接作过原点的正交投影：
    $$\text{vector\_proj}(x, y) = \frac{\sum_i x_i y_i}{\sum_i y_i^2} \cdot y, \qquad \text{vector\_neut}(x, y) = x - \text{vector\_proj}(x, y)$$
  - 共同关系：两组均严格满足 **中性化结果 = 原输入 − 投影分量（$\text{neut} = \text{input} - \text{proj}$）**；若两个输入之前已经过 `zscore` / `group_neutralize` 均值归零且无需引入新截距偏移，直接使用 `vector_neut` 往往更简洁稳定。

> **边界补充**：`regression_neut` 的“截面均值为 0”严格成立于参与回归的有效样本；`vector_*` 的不中心化、过原点投影已由平台示例 `(1,2,3)` / `(3,4,5)` 与项目同语言证据支持。项目校准仍保留若干未定案：`ts_corr`/`ts_covariance` 的 NaN 配对口径、`ts_regression` 包裹 `rank` 后 β/残差内部口径（FE↔PY corr=0.84）、`vector_proj` 残差约 0.2、`multi_regression` 返回分量。公式推导可用于理解信号结构，但不等于逐值平台复现已定案。

---

## 三、离散分桶与换手抑制（Grouping & Turnover Control）

1. **连续变量动态分组（`floor` 与 `bucket`）**
   - **`floor(x)`** 与 **`bucket(rank(x), range='0,1,0.1')`**：均用于把连续因子（如市值 `cap`、成交额 `close * volume`、波动率）离散切成 $n$ 个区间标签作为动态 `Group`。例如 `floor(rank(cap) * 4.99)`（加极小微调避免 `1.0` 边界越界成第 6 桶）与 `bucket(rank(cap), range='0,1,0.2')` 等价地构造出 5 分位市值组；使用 `bucket` 时建议外层配合 `densify` 压缩空桶编号。项目实证平台仅接受 `range=`，`buckets=` 会被拒绝；`bucket` 边界归属与 `densify` 编码顺序尚未值级定案，上述“等价”应理解为构造意图而非逐值恒等。
2. **低换手与调仓步长抑制（`hump` 与限速器）**
   - **`hump(x, hump = 0.01)`**：滞后缓冲过滤（只存在“保留昨日持仓不变”与“跨越 `hump` 阈值后调仓”两种动作），对季频更新的基本面数据或高波动高频微调极其有效，可大幅削减无效碎单换手。项目本地复现采用 `np.clip(x, -hump, hump)` 作为工作近似（pn corr=0.978 达标、bm 0.928 在系统噪声内），不是逐日持仓状态机的值级证明。
   - **`ts_target_tvr_delta_limit(x, y, lambda_min=0, lambda_max=1, target_tvr=0.1)`**：以日均成交量等流动性锚 `y` 为尺，在参数范围内自动求解满足目标换手率（如 `10%`）的权重步长约束。项目 Python 复现当前取 `lambda_min/lambda_max` 中点作步长近似（bm corr=0.89/0.97），不应理解为本地已实现完整求解器。

---

## 四、项目 Python 复现的校准备入（仅据 `expression/operator_docs/`）

- **判等口径**：FASTEXPR 是唯一真值；跨语言日度 PnL corr ≥ 0.97 是工作判据，跨语言天花板约 0.9706（恒等式 `-close` 实测），不是逐标的逐日数值等价。真恒等一般 0.997–1.0000，近似重构 0.93–0.98，政策性错误 0.42–0.75。
- **校准方法坑**：`vwap` 跨语言数据管道不一致（恒等 `-vwap` corr 仅 0.9339）；用 `rank(volume)<k` 作掩码会因分母/ties 微差伪造崩塌，校准一律用裸对或慢变算术掩码；平台单表达式 ≤64 个算子（`validate_alpha` 不查）；同表达式+settings 会复用 `alpha_id`，对照需扰动；PYTHON 返回矩阵任一行全 `NaN` 会让模拟 FAIL；残留 `NaN` 没有最外层兜底。
- **已定案、可直接引用的本地口径**：`ts_std_dev` 为 `ddof=1`；`ts_backfill` 的 `d` 是有限窗口；`ts_regression` 只滞后 `x` 且 listwise；`ts_vector_neut/proj` 无截距+listwise，`regression_neut` 有截距；`group_count` 按 universe 过滤；`tail` 严格开区间且默认 `newval=0`；`nan_mask` 按 `<=0` 掩码；`group_mean` 权重生效；`group_backfill` 的 `d` 是时间窗口；`log` 非正输入需域保护。
- **未定案或当前仅为工作近似，不要把本地逐值输出当平台真值**：`ts_step` 本地复现仍标为“常量（错）/修复中”；`ts_kurtosis` 四阶口径、`group_std_dev` 的 ddof、`bucket` 边界归属、`densify` 编码顺序、`round` 平局、比较算子 NaN 分支均未值级定案；`ts_corr`/`ts_covariance` 的 NaN 配对口径、`ts_regression` 包裹 `rank` 后的 β/残差内部口径、`vector_proj` 残差约 0.2、`multi_regression` 返回分量仍待 BrainLab 对照；`group_backfill` 的窗口端点/池化顺序/universe 掩码、`hump`、`ts_target_tvr_*` 均为工作近似。
- **结论**：平台编译、模拟通过或 PnL 相关达标，都不等于 FASTEXPR↔PYTHON 逐值一致；若某个未定案口径进入关键信号，应单独做一次值级对齐，而不是用本地复现反推平台定义。
