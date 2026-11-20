---
layout: post
title: "从U-Net到DiT: 现代多模态大模型与Stable Diffusion的架构演进"
categories:
  - deeplearning
tags:
  - content
  - attention
  - stable-diffusion
  - DiT
  - multimodal
  - FlowMatching
last_modified_at: 2026-11-01T09:10
created: 2026-11-01T09:00
---

在三年前的两篇笔记中（参见 [[2024-02-04-attention]] 与 [[2024-02-29-stable-diffusion6]]），我们曾对注意力机制的底层映射、SD（Stable Diffusion）经典 U-Net 结构以及 ControlNet / IP-Adapter / GLIGEN 等微调补丁进行过系统的梳理。

时隔三年，生成式与多模态 AI 经历了一场彻底的“地壳运动”：**骨干网络从卷积 U-Net 全面转向 DiT（Diffusion Transformer），交互机制从外挂式单向交叉注意力走向文本与图像平权的联合注意力，扩散数学范式从复杂的曲折 SDE 采样走向直连的流匹配（Flow Matching），而图像编码与多模态表征更是从割裂走向理解与生成的终极合流**。

本文以三年前的认知为基准，深入剖析这三年间架构层面的本质跃迁。

---

## 1. 架构底座的更迭：从 U-Net 到 DiT / MMDiT

三年前的经典 SD（SD 1.5 / SDXL）架构，本质上是一个以卷积为主体的宏大工程架构：
`VAE + 带跳跃连接的 2D U-Net + 嵌在 ResNetBlock 之间的 SpatialTransformer（Cross-Attention）`。

而今天以 **Flux.1**、**Stable Diffusion 3**、**Midjourney v6/v7** 为代表的现代生图模型，已经彻底清除了卷积 U-Net 的痕迹。

```
【传统 SD / SDXL (2024) 架构】
Text Prompt ──> CLIP ────────┐ (单向 Cross-Attention 注入)
                             ▼
Noisy Latent ──> [ Downsample Conv ] ──> [ Bottleneck Transformer ] ──> [ Upsample Conv ] ──> Output
                         │                                                    ▲
                         └────────────── Skip Connection ─────────────────────┘

【现代 DiT / MMDiT (2026) 架构】
Text Tokens  ──> [ Text Embed ]  ──┐
                                   ├──> [ MMDiT / Joint Transformer Blocks ] (双流全向自注意力)
Image Patches ─> [ Patch Linear ] ─┘        │ (图文双向平权交互，深层单流统一)
                                            ▼
                                   [ AdaLN-Zero 注入 Timestep / Guidance ]
                                            ▼
                                    Denoised / Flow Vector Output
```

### 为什么 U-Net 会被全面淘汰？
1. **参数规模的 Scaling 瓶颈**：卷积固有的归纳偏置（平移不变性与局部感受野）对小数据训练友好，但随着模型参数迈向 3B~12B+，U-Net 的层级卷积与降采样结构表现出明显的性能饱和，难以像纯 Transformer 那样享受大算力与海量多模态数据带来的 Scaling Law 收益。
2. **长距离空间与全局语义的脱节**：U-Net 依赖逐级下采样（Downsampling）来扩大感受野，但高频细节在深层丢失严重，全靠粗糙的跳跃连接（Skip Connections）缝合，导致大尺度构图与复杂空间关系的连贯性不足。

### DiT 与 MMDiT 的核心设计
* **Patchify（潜变量切块）**：现代 DiT 借鉴 ViT 的思路，将高维潜空间特征切成 $2\times 2$ 的 Patch，展平为线性 Token 序列，使得图像和文本在数据结构上完全等价。
* **双流到单流的 MMDiT（Multimodal DiT）**：
  * **传统痛点**：过去文本仅仅作为 Key / Value 单向“注入”图像 Query，文本 Token 彼此在生成过程中是固化的，极易引发提示词漏词（Catastrophic Neglect）、长修饰语歧义和属性错位。
  * **现代解决**：图像流与文本流保持各自独立的参数与模态位置编码，但在深层进入共享的自注意力矩阵：
    $$\text{Attention}([Q_{\text{img}}, Q_{\text{txt}}], [K_{\text{img}}, K_{\text{txt}}], [V_{\text{img}}, V_{\text{txt}}])$$
  * **双向平权交互**：文本引导图像去噪的同时，图像的生成状态也在反向影响文本权重的分配，从根源上解决了复杂指令的遵循问题。

---

## 2. 图像编码与多模态表征的演进

在 2024 年的认知中，图像编码主要分为三块：低维 VAE、用于文本对齐的 CLIP-ViT 以及用于控制的 ControlNet 下采样分支。当前图像编码已分化并跃迁为三条成熟路径：

```
                    ┌── ① 连续潜变量编码 (Continuous Latents) ──> 用于 DiT 生成 (Flux, SD3, Sora)
                    │     (高维 16~32ch VAE / 3D 时空因果 VAE)
多模态图像编码体系 ─┼── ② 连续 Patch 特征编码 (Continuous Vision Tokens) ──> 用于 MLLM 理解 (GPT-4o, Qwen-VL)
                    │     (AnyRes 动态长宽比切块 + SigLIP/DINOv2 双流特征)
                    └── ③ 离散语义 Token 编码 (Discrete Quantized Tokens) ──> 用于统一自回归 (Chameleon, Janus)
                          (FSQ 有限标量量化 / TiTok 极度压缩)
```

### ① 生成大模型的潜在空间编码：从 4 通道到 16/32 通道
* **破除瓶颈**：SD 1.5 / SDXL 的 VAE 压缩比为 8，但潜空间只有 4 个通道（$H/8 \times W/8 \times 4$）。这种极端的信息压缩造成严重的重建损失，导致小字体、人眼虹膜、细碎纹理在潜空间编解码阶段就已经模糊不清。
* **高维与时空扩展**：
  * Flux 与 SD3 将 VAE 潜空间通道直接拓宽至 **16 通道甚至 32 通道**，潜空间的信息承载能力呈几何级数增加；
  * 在视频与动态生成领域（如 Sora、CogVideoX），引入了 **3D Causal VAE（时空因果 VAE）**，在空间 $8\times 8$ 压缩的基础上对时间帧进行因果卷积压缩（如 4 帧压成 1 帧），统一了静态图像与动态视频的潜空间表达。

### ② 理解大模型的连续 Patch 编码：AnyRes 与语义/几何双流
* **告别粗暴缩放，拥抱 AnyRes 动态切块**：早期 CLIP-ViT 强制将不同比例的图片裁切缩放为固定尺寸（如 $224\times 224$ 或 $336\times 336$），破坏了原始几何比例并丢失了细微文字。现代理解模型（如 NaViT、LLaVA-NeXT、Qwen2.5-VL）采用原生分辨率切块（AnyRes / Patch-n-Pack），根据原始长宽比切成若干个自适应大小的标准 Local Patches 与一张全局缩略图，密集细节全量保留。
* **双编码器融合（SigLIP + DINOv2）**：单纯的视觉-文本对齐编码器（如 CLIP/SigLIP）擅长抽象语义，但在空间几何、深度边界和像素级定位上表现脆弱。现代模型普遍混合引入自监督特征提取器 **DINOv2**，“一个负责理解概念，一个负责看准空间像素”。

### ③ 理解与生成的合流：统一离散化 Tokenizer（FSQ / TiTok）
* 传统的 VQ-VAE 存在代码本崩塌（Codebook Collapse）与训练不稳定的顽疾。
* 现代架构采用 **FSQ（Finite Scalar Quantization，有限标量量化）** 或 **TiTok**，通过简单的标量舍入将连续向量映射为离散整数序号（Visual Token IDs）。
* **意义**：图像与文本完全统一为离散序列。底座语言模型可以使用标准的 Next-Token Prediction 统一训练文生图与图生文，彻底打破了“理解归语言模型，生成归扩散模型”的割裂壁垒。

---

## 3. 对照三年前两篇笔记的技术认知跃迁

### 对照一：[[2024-02-29-stable-diffusion6]]（微调与外挂结构）

| 2024 年的理解与记录 | 当时的工程技术方案 | 当前的技术演进与演变方向 |
| :--- | :--- | :--- |
| **ControlNet 架构** | 复制半个 U-Net 结构，通过零卷积向原网络注入 hint 图像 | **外挂网络被原生多模态输入收编**。在 DiT 体系中，Canny/Depth 等控制图直接转化为 Tokens 拼接在序列中，或仅需极少量的可学习 Cross-Attention 注入，不再需要复制半个主干网的沉重开销。 |
| **微调粒度层级** | *“LoRA < GLIGEN = IP-Adapter < ControlNet”* | **结构归一化**。IP-Adapter 的分路 cross-attention 被 **In-Context Reference Attention** 取代——将参考图作为序列前缀（Prefix）送入 Transformer，利用自注意力机制原生完成风格与主体特征锁定。 |
| **时间与空间编码** | 时间用 Sinusoidal 一维三角编码，空间坐标用 Fourier Tile | **2D/3D RoPE（旋转位置编码）全面普及**。时间与引导系数通过 **AdaLN-Zero** 自适应调制每一层的缩放和平移参数；空间几何则全面采用 2D-RoPE，天然支持任意长宽比与外推。 |

> **核心跃迁**：2024 年是**“打补丁时代”**——基础模型能力有限，需要依靠外挂结构（ControlNet 补线条、IP-Adapter 补主体、GLIGEN 补边界框）；2026 年是**“原生统一时代”**——基础模型的上下文窗口足够大、参数足够丰富，所有的条件控制都化为了自然的多模态上下文序列输入。

---

### 对照二：[[2024-02-04-attention]]（注意力机制与 QKV 的物理本质）

#### 1. 关于 QKV 的角色对称性
* **2024 年的思考**：*“其实从计算过程可以看出，不管它们的原义，Q, K 交换一下也没差... 相对的，每个 input token 对应 vector mapping 相同”*。
* **当前的印证**：三年前关于“Q 与 K 对称性”的直觉在 MMDiT 中得到了完美的工程兑现。传统的单向 Cross-Attention 刻意将图像设为 Q、文本设为 K/V，人为打破了模态间的对等性；而在现代的双流联合注意力中，图文两端各自计算投影并平权拼接，文本与图像在注意力矩阵中恢复了完全的对称交互。

#### 2. 关于相对位置编码
* **2024 年的思考**：*“在文本模型里，其实 token 的相对位置也很重要... 相对位置编码就把相对位置加到 relation 里”*。
* **当前的印证**：绝对位置编码在现代生成与多模态模型中已近乎绝迹。**2D RoPE（Rotary Position Embedding）** 成为绝对主力。它直接通过旋转矩阵将相对空间位移 $(m-n)$ 注入到注意力内积中：
  $$\langle R_m Q_m, R_n K_n \rangle = g(Q_m, K_n, m-n)$$
  这种相对位置机制赋予了模型强大的空间延展性，使得我们在进行 **Outpainting（扩图）** 时，即便画幅比例剧烈变化，也不会产生传统绝对编码带来的位置混淆与边缘断层。

#### 3. 关于多源数据注意力合成（IP-Adapter）
* **2024 年的思考**：*“在 ipadapter 里面讨论了多种不同来源的数据在 cross-attention 里合成的问题，结论是分别与原数据做 attention 最后再合成比较好”*。
* **当前的演进**：分路独立 Cross-Attention 容易在深层产生注意力的稀释与互相覆盖（这也是 2024 年局部重绘时必须费力微调 IP-Adapter 权重的根源）。现代模型通过长序列多模态拼接（In-context conditioning），让自注意力矩阵在同一归一化分母（Softmax）下统一竞逐权重，主体的稳定性与融合自然度显著超越了传统分路相加。

---

## 4. 数学范式的平滑化：从扩散 SDE 到 Flow Matching（流匹配）

在 2024 年学习 Stable Diffusion 时，最大的工程负担之一是复杂的扩散加噪去噪数学公式以及五花八门的采样器调度算法（DDIM, Euler, DPM-Solver++, UniPC 等，见 [[2024-04-18-stable-diffusion9]]）。

现代大模型在数学机制上完成了一次彻底的“减负与提速”：**全面拥抱 Rectified Flow（整流流匹配）**。

| 维度 | 传统扩散模型 (DDPM / EDM) | 现代流匹配 (Flow Matching / Rectified Flow) |
| :--- | :--- | :--- |
| **轨迹形态** | 随机、布朗运动式曲折轨迹（SDE / 弯曲 ODE） | **两点之间直线运动**（直线 ODE 速度场：$v_t = x_1 - x_0$） |
| **数学复杂度** | 复杂的漂移项、扩散项与噪声方差调度计划（$\sigma$-schedule） | 线性插值路径：$x_t = (1-t)x_0 + t x_1$，目标为拟合恒定速度场 |
| **采样步数** | 通常需要 20 ~ 50 步积分迭代 | 结合微调蒸馏，仅需 **4 ~ 8 步** 即可达到极高保真度 |
| **轨迹稳定性** | 容易陷入局部极值，对初始随机 seed 极度敏感（“抽卡”看运气） | 轨迹笔直且确定性极高，大幅缓解抽卡成本 |

---

## 5. 总结：三年技术演进全景映射

| 对比维度 | 2024 年典型代表 (SD 1.5 / SDXL) | 2026 年现代大模型 (Flux / SD3 / MLLM) |
| :--- | :--- | :--- |
| **骨干模型** | 2D U-Net（ResNetBlock + SpatialTransformer） | **DiT / MMDiT**（纯 Transformer，原生支持海量参数扩展） |
| **模态交互** | 单向 Cross-Attention（图像看文本，文本固定） | **Joint Self-Attention**（图文双流全向平权注意力） |
| **空间控制** | 独立复制的 ControlNet 庞大旁路 | **原生序列化 Token 输入** 或上下文参考自注意力 |
| **潜空间 VAE** | 4 通道低维 VAE（高频文字与边缘易糊化） | **16 / 32 通道高维 VAE**，支持视频的 **3D Causal VAE** |
| **位置编码** | 一维 Sinusoidal 三角编码 / 绝对 Pos Embedding | **2D / 3D RoPE**（旋转位置编码，天然适配任意长宽比扩图） |
| **采样机制** | 复杂方差调度的扩散 SDE/ODE（20~50 步） | **Rectified Flow 流匹配**（确定性直线路径，4~8 步高质量直出） |
| **多模态合流** | 理解（LLM/CLIP）与生成（SD/UNet）严格分工 | **Any-to-Any 统一架构**（自回归 Token 或统一流匹配底座） |

回顾这三年的演化脉络，AI 作图不再是孤立的图形算法工程，而是彻底并轨进了现代大语言模型与多模态 Transformer 的同一技术主干。三年前我们在复杂连线中摸索的工程巧思与数学直觉，在今天被统一、优雅的序列架构逐一实现并超越。

---

## 参考与关联笔记

- [[2024-02-04-attention]]：神经网络 attention 结构理解
- [[2024-02-29-stable-diffusion6]]：stable-diffusion 的结构和微调模型
- [[2024-04-18-stable-diffusion9]]：stable-diffusion 中 k-sampling 的不同版本
- [[2025-09-02-stable-diffusion10]]：AI 作图效果: 常用的作图功能
