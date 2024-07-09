---
layout: post
title: conformal geometry学习
categories:
  - math
  - algorithm
tags:
  - content
last_modified_at: 2024-07-08T21:29:14-08:00
---
### 3种基本曲面

- 球面
- 平面
- 双曲面:

## fundamental group

- [Poincaré conjecture(已证明)](https://en.wikipedia.org/wiki/Poincaré_conjecture) : closed, connected, **fundamental group 是trival**的曲面和球面是homeomorphic(同胚)的.
	- 同调球
- 对于oriented surface, fundamental group同构 <-> 拓扑同胚.
	- 把$\pi_1(S,p)$ 的一组basis做为cut graph, 把曲面切成4g的polygonal scheme. 以此构造homeomorphism.

### word group 表示


|                                                          | fundamental group $\pi_1(S,p)=\Gamma/\sim$                                       | word group representation $<G\vert R>$                                                                                  |
| -------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 生成元                                                      | $S$ 上经过点$p$ 的loop                                                                | n symbols $G=\lbrace g_1,g_2,\cdots,g_n\rbrace$ (see [free generated group](https://en.wikipedia.org/wiki/Free_group) ) |
| 等价关系                                                     | homotopy(同伦): $\gamma_1$ 可以连续变换的$\gamma_2$                                       | relations $R=\lbrace R_1,R_2,\cdots,R_m\rbrace$ 是有m个words的集合<br>$w_1$ 可以通过有限步的插入, 移除relation变为$w_2$                     |
| **群运算**                                                  |                                                                                  |                                                                                                                         |
| identity                                                 | 基点 $p$                                                                           | $\emptyset$                                                                                                             |
| 乘法                                                       | 两条路径首尾相接                                                                         | 字符串拼接                                                                                                                   |
| inverse                                                  | 路径方向相反                                                                           | 字符串反向                                                                                                                   |
| **特例**                                                   |                                                                                  |                                                                                                                         |
| torus                                                    | $\pi_1(T,p)$<br>任意$\gamma$ 分解成不和$a,b$ 相交的$\gamma_i$ 的积                           | $<a,b\vert \ aba^{-1}b^{-1}>$                                                                                           |
| $\mathbb {RP}^2$<br>Möbius band $\cup_{\partial D}$ disk | $\pi_1(\mathbb{RP}^2)=\lbrace\gamma,e\rbrace$<br>$\pi_1(\partial M)=<\gamma^2>$  | $<\gamma\ \vert\  \gamma^2>$                                                                                            |
| **性质**                                                   |                                                                                  |                                                                                                                         |
| 合并                                                       | $\pi_1(U\cup V, p)$                                                              |                                                                                                                         |
| 联通和                                                      | $\pi_1(S_1 \texttt{\#} S_2)$                                                     |                                                                                                                         |

#### Canonical Representation

closed, oriented surface

- 定义: $\{a_1,\dots,a_g,b_1,\dots,b_g\}$, $a_i$ 只和$b_i$ 相交
	- [intersection number](https://en.wikipedia.org/wiki/Intersection_number)定义: $a_i\cdot b_i=1$ 
		- 在曲面上intersection index=1, 定义为切向量的cross product和法向量点积 > 0
	- canonical representation写成: $\pi_1(S,p)=<a_1,\cdots,a_g,b_1,\cdots, b_g\vert \prod_{i=1}^g a_ib_ia_i^{-1} b_i^{-1}>$ 
- 存在性: 
	- 用火烧法找到一组basis
- 唯一性: canoical representation不唯一, 判断两个canoical representation是isomorphic的是NP-hard问题.

#### 特例

##### $\mathbb{RP}^2$ 

![Pasted image 20240707162754.png]({{ '/docs/attachment/Pasted image 20240707162754.png' | relative_url }}){:width="400"}

- 把$\mathbb{RP}^2$ 看成上半球面$H^2$ , 沿红线切割, 下面变成一个disk, 上面变成Möbius band

### 曲面分解

![440px-Connected_sum.svg.png]({{ '/docs/attachment/440px-Connected_sum.svg.png' | relative_url }}){:width="300"}

- [connect sum(联通和)](https://en.wikipedia.org/wiki/Connected_sum) : 两个曲面去掉disk粘在一起, $S_1 \texttt{\#} S_2$   
- [Seifert-Van Kampen Theorem](https://en.wikipedia.org/wiki/Seifert–Van_Kampen_theorem): $\pi_1(U\cup V, p)$ 和$\pi_1(U,p)$ , $\pi_1(V,p)$ 的关系
- 任意closed surface 可以写成以下3种形式, 
	- S是sphere
	- $S=T\texttt{\#} \cdots \texttt{\#}T$  S是oriented
	- 或  $S = \mathbb{RP}^2 \texttt{\#} \cdots \texttt{\#}\mathbb{RP}^2$ S事non-oriented