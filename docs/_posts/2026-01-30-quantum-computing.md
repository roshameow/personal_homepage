---
layout: post
title: 量子计算
categories:
  - algorithm
tags:
  - content
last_modified_at: 2026-06-07T22:46
created: 2026-01-30T18:07
---
Born Rule

Qubit


DiVincenzo标准列出了一个物理系统要成为合适的量子比特（qubit）必须满足的五项具体要求：

1. **物理上构建量子比特的能力 (The ability to construct a qubit, physically)：** 系统必须具备可扩展性（Scalability），且量子比特必须是被良好表征的（well-characterised qubit）,。

2. **初始化量子态的能力 (The ability to initialize a quantum state)：** 这通常指的是能够进行“简单的初始化”（Simple initialization），即能够将系统复位到一个已知的基准状态,,。

3. **长相干时间 (Long coherence times)：** 具体来说，相干时间必须**远长于**量子门操作所需的时间（Coherence time much longer than gate operation time），以保证在信息丢失前能完成足够的计算操作,,。

4. **通用的量子门集合 (A universal set of quantum gates)：** 这包括能够执行单量子比特门（Single-qubit gates）和双量子比特门（Two-qubit gates），它们的组合可以实现任意的量子计算,。

5. **进行测量的能力 (The ability to make measurements)：** 系统必须能够对每一个量子比特的状态进行特定的测量（Measurement of state of each qubit）以读取计算结果,。

来源还指出，目前的物理系统（如超导量子比特、俘获离子等）尚无一能完美满足所有这些要求，主要挑战在于可扩展性以及操作（初始化、门操作、测量）的保真度。



 1. 基础单比特门 (Single Qubit Gates)
   * H (Hadamard Gate)
       * 代码: qc.h(0)
       * 作用: 制造叠加态。它是量子算法中最常见的门，将确定的 $|0\rangle$ 状态变成同时也是 0 和 1 的叠加状态 ($|+\rangle$)。
       * 直觉: 就像抛硬币在空中旋转，还未落地时的状态。

   * X (Pauli-X Gate)
       * 代码: qc.x(1)
       * 作用: 比特翻转 (NOT)。相当于经典的“非门”。
       * 直觉: 如果是 0 就变成 1，如果是 1 就变成 0。

   * Z (Pauli-Z Gate)
       * 代码: qc.z(2)
       * 作用: 相位翻转。它不改变测量得到 0 或 1 的概率，只改变波函数的相位（符号）。
       * 直觉: 在布洛赫球上绕 Z 轴旋转 180 度。通常用于相位反冲 (Phase Kickback) 等高级技巧。

  2. 参数化旋转门 (Rotation Gates)
   * RX, RY, RZ
       * 代码: qc.ry(theta, 0)
       * 作用: 将量子态在布洛赫球上绕特定轴旋转任意角度 $\theta$。
       * 应用: 这种门带有参数，常用于 量子机器学习 或 变分量子本征求解器 (VQE)，因为我们可以通过经典优化器来调整这个 $\theta$ 角度以找到最优解。

  3. 纠缠门 (Multi-Qubit Gates)
   * CX (CNOT Gate)
       * 代码: qc.cx(control, target)
       * 作用: 受控非门。这是产生量子纠缠的关键。
       * 逻辑: 如果“控制位”是 $|1\rangle$，就翻转“目标位”；如果是 $|0\rangle$，则什么都不做。

   * CCX (Toffoli Gate)
       * 代码: qc.ccx(c1, c2, target)
       * 作用: 双重受控非门。
       * 逻辑: 只有当两个控制位都为 1 时，才翻转目标位。这对应于经典计算机中的 AND 逻辑，表明量子计算是包含经典计算能力的


  以下是详细的实现思路解释：

  1. 理解问题：LABS (Low Autocorrelation Binary Sequence)

  我们的目标是找到一个长度为 $N$ 的序列 $S = \{s_1, s_2, ..., s_N\}$，其中每个 $s_i \in \{+1, -1\}$，使得其非周期自相关 (Aperiodic Autocorrelation) 的能量 $E$ 最小。

   * 能量函数 $E(S)$:
      $$E(S) = \sum_{k=1}^{N-1} C_k^2$$
      其中 $C_k$ 是滞后为 $k$ 时的自相关系数：
      $$C_k = \sum_{i=1}^{N-k} s_i s_{i+k}$$

   * 目标: 最小化 $E(S)$。
   * Merit Factor (品质因数): $F = \frac{N^2}{2E}$。$E$ 越小，$F$ 越大。这是通信领域常用的指标。

  2. 量子映射 (Mapping to Hamiltonian)

  QAOA 需要一个哈密顿量 (Hamiltonian) $H$，其基态（最低能量态）对应于我们要找的最优序列。

   * 变量映射: 将经典变量 $s_i \in \{+1, -1\}$ 映射到量子算符 Pauli-Z ($Z_i$)。
       * $s_i = +1 \leftrightarrow |0\rangle$ (Eigenvalue +1 of Z)
       * $s_i = -1 \leftrightarrow |1\rangle$ (Eigenvalue -1 of Z)

   * 构建哈密顿量:
      我们需要将 $E(S)$ 转化为算符形式。
      $$E = \sum_{k=1}^{N-1} (\sum_{i=1}^{N-k} s_i s_{i+k})^2$$
      展开平方项：
      $$(\sum_{i} s_i s_{i+k})^2 = \sum_{i} \sum_{j} (s_i s_{i+k}) (s_j s_{j+k})$$

      这意味着哈密顿量主要由 四体相互作用项 (4-body terms) 组成：
      $$H = \sum_{k} \sum_{i, j} Z_i Z_{i+k} Z_j Z_{j+k}$$

       * 特殊情况: 当 $i=j$ 时，$Z_i Z_{i+k} Z_i Z_{i+k} = Z_i^2 Z_{i+k}^2 = I \cdot I = I$。这些是常数项，对优化没有影响，但在计算绝对能量值时需要考虑。
       * 非对角项: 当 $i \neq j$ 时，我们得到 $Z_i Z_{i+k} Z_j Z_{j+k}$ 这样的项。

      代码实现: build_labs_hamiltonian 函数负责生成这个 SparsePauliOp。它遍历所有可能的滞后 $k$ 和位置 $i, j$，构建 Pauli 字符串（如 "IZZIZ..."）。
      3. 使用 QAOA (Quantum Approximate Optimization Algorithm)

  QAOA 是一种变分量子算法，适合求解组合优化问题。

   1. Ansatz (拟设): QAOA 使用交替的两种算符来演化状态：
       * 相位分离算符 (Phase Separator): $U_C(\gamma) = e^{-i \gamma H_C}$，基于我们的 LABS 哈密顿量。
       * 混合算符 (Mixer): $U_B(\beta) = e^{-i \beta H_B}$，通常 $H_B = \sum X_i$。
       * 层数 (reps/p): 重复 $p$ 次（代码中 reps=2）。层数越深，理论上近似效果越好，但电路也越复杂。

   2. 优化:
       * 经典优化器: 使用 COBYLA（一种无梯度优化算法），寻找最优参数 $\vec{\gamma}, \vec{\beta}$，使得期望能量 $\langle \psi | H | \psi \rangle$ 最小。
       * Sampler: 在 Qiskit 2.x 和 qiskit-algorithms 中，对于对角哈密顿量（如本题，全由 Z 构成），我们可以直接通过采样 (Sampling) 来估计期望值，而不需要显式的 Estimator（尽管有些版本 API 混用，最终我们使用了
         StatevectorSampler）。

  3. 结果解析

   4. 测量: 优化完成后，我们用最优参数运行电路并测量。
   5. 位串提取: 得到出现频率最高的位串（如 110100）。
   6. 解码: 将位串转回 $\{+1, -1\}$ 序列。
       * 0 -> +1
       * 1 -> -1
   7. 验证: 使用经典函数 calculate_energy_classical 计算能量，确保量子解是有效的，并计算 Merit Factor。


课 https://mit.hosted.panopto.com/Panopto/Pages/Viewer.aspx?id=f5d88781-fa92-4b6c-89e2-b3d70120c0c5