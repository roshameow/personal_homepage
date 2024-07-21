---
layout: post
title: conformal geometry学习 (一 ) -- fundamental group
categories:
  - math
  - algorithm
tags:
  - content
  - fundamental_group
  - homeomorphic
  - homotopy
last_modified_at: 2024-07-21T22:15:16-08:00
---

fundamental group分类曲面是足够精细的

- [Poincaré conjecture(已证明)](https://en.wikipedia.org/wiki/Poincaré_conjecture) : **fundamental group trival -> 曲面trival** 
	- closed, connected, fundamental group 是trival的曲面和球面是homeomorphic(同胚)的.
	- 与之相比, homology(同调) group trival -/-> 曲面trival
		- [同调球](https://en.wikipedia.org/wiki/Homology_sphere) 作为反例
- 对于oriented surface, fundamental group同构 <-> 拓扑同胚.
	- 把$\pi_1(S,p)$ 的一组basis做为cut graph, 把曲面切成4g的polygonal scheme. 以此构造homeomorphism.

## word group 表示

|                                                          | fundamental group $\pi_1(S,p)=\Gamma/\sim$                                      | word group representation $<G\vert R>$                                                                                  |
| -------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 生成元                                                      | $S$ 上经过点$p$ 的loop                                                               | n symbols $G=\lbrace g_1,g_2,\cdots,g_n\rbrace$ (see [free generated group](https://en.wikipedia.org/wiki/Free_group) ) |
| 等价关系                                                     | homotopy(同伦): $\gamma_1\sim \gamma_2$ <br> $\gamma_1$ 可以连续变换成$\gamma_2$         | relations $R=\lbrace R_1,R_2,\cdots,R_m\rbrace$ 是有m个words的集合<br>$w_1$ 可以通过有限步的插入, 移除relation变为$w_2$                     |
| **群运算**                                                  |                                                                                 |                                                                                                                         |
| identity                                                 | 基点 $p$                                                                          | $\emptyset$                                                                                                             |
| 乘法                                                       | 两条路径首尾相接                                                                        | 字符串拼接                                                                                                                   |
| inverse                                                  | 路径方向相反                                                                          | 字符串反向                                                                                                                   |
| **特例**                                                   |                                                                                 |                                                                                                                         |
| torus                                                    | $\pi_1(T,p)$<br>任意$\gamma$ 分解成不和$a,b$ 相交的$\gamma_i$ 的积                          | $<a,b\vert \ aba^{-1}b^{-1}>$                                                                                           |
| $\mathbb {R}P^2$<br>Möbius band $\cup_{\partial M}$ disk | $\pi_1(\mathbb{R}P^2)=\lbrace\gamma,e\rbrace$<br>$\pi_1(\partial M)=<\gamma^2>$ | $<\gamma\ \vert\  \gamma^2>$                                                                                            |
| **性质**                                                   |                                                                                 |                                                                                                                         |
| 合并                                                       | $\pi_1(U\cup V, p)$                                                             | $<u_1,\dots,u_k,v_1,\dots,v_m\vert \alpha_i,\beta_j,i(w_1)j(w_1)^{-1},\dots,i(w_p)j(w_p)^{-1}>$                         |
| 联通和                                                      | $\pi_1(S_1 \texttt{\#} S_2)$                                                    |                                                                                                                         |
|                                                          | $\pi_1(T_1 \texttt{\#}T_2 \texttt{\#}\cdots  \texttt{\#} T_g)$                  | $<a_1,\cdots,a_g,b_1,\cdots, b_g\vert \prod_{i=1}^g a_ib_ia_i^{-1} b_i^{-1}>$                                           |
| 胞腔分解                                                     | $\pi_1(M)=\pi_1(S_2)=\pi_1(S_1\cup_{k=1}^{n_2}D_2^k)$                           | $<\gamma_1,\cdots,\gamma_k\vert\  [\partial D_2^1][\partial D_2^2],\cdots, [\partial D_2^{n_2}]>$                       |


## 特例

### torus $T_2$ 

![Pasted image 20240710101618.png]({{ '/docs/attachment/Pasted image 20240710101618.png' | relative_url }}){:width="400"}

- torus可以沿a,b cut, 变形成如右图disk, 即 $aba^{-1}b^{-1}\sim e$ 
- 经过$p$点的任意$\gamma$ 分解成不和$a,b$ 相交的$\gamma_i$ 的积, $\gamma\in <a,b>$ 

### projective plane $\mathbb{R}P^2$ 

![Pasted image 20240707162754.png]({{ '/docs/attachment/Pasted image 20240707162754.png' | relative_url }}){:width="400"} ![Pasted image 20240710162803.png]({{ '/docs/attachment/Pasted image 20240710162803.png' | relative_url }}){:width="150"} 

- 把$\mathbb{RP}^2$ 看成上半球面$\mathbb H^2$ , 沿红线切割, 下面变成一个disk(D), 上面变成Möbius band(M, crosscap)
- $\pi_1(M)=<\gamma>$ , $\pi_1(D)=\lbrace e\rbrace=\emptyset$ , $\pi_1(\partial M)=<\gamma^2>$ 
	- 把Möbius strip变形成如右图, 任意和边界不相交的loop都$\sim\gamma$ , 边界上为 $\gamma^2$   

## 曲面分解

- [Seifert-Van Kampen Theorem](https://en.wikipedia.org/wiki/Seifert–Van_Kampen_theorem): $\pi_1(U\cup V, p)$ 和$\pi_1(U,p)$ , $\pi_1(V,p)$ 的关系

![440px-Connected_sum.svg.png]({{ '/docs/attachment/440px-Connected_sum.svg.png' | relative_url }}){:width="300"}

- [connect sum(联通和)](https://en.wikipedia.org/wiki/Connected_sum) : 两个曲面去掉disk粘在一起, $A \texttt{\#} B=(A-D)\cup_{\partial D}(B-D)$    
	- 任意closed surface 可以写成以下3种形式联通和分解, 
		1. S是sphere
		2. $S=T\texttt{\#} \cdots \texttt{\#}T$  (S是oriented)
			- $\pi_1(S,p)=<a_1,\cdots,a_g,b_1,\cdots, b_g\vert \prod_{i=1}^g a_ib_ia_i^{-1} b_i^{-1}>$ 
				- 用[Seifert-Van Kampen Theorem](https://en.wikipedia.org/wiki/Seifert–Van_Kampen_theorem) 和归纳法证明
				- ![Pasted image 20240710120840.png]({{ '/docs/attachment/Pasted image 20240710120840.png' | relative_url }}){:width="100"} circle $\gamma\sim aba^{-1}b^{-1}$ 
		3.  $S = \mathbb{RP}^2 \texttt{\#} \cdots \texttt{\#}\mathbb{RP}^2$ (S是non-oriented)

###  closed oriented 曲面分解(Canonical Representation)

- canonical basis定义: $\{a_1,\dots,a_g,b_1,\dots,b_g\}$, $a_i$ 只和$b_i$ 相交
	- [intersection number](https://en.wikipedia.org/wiki/Intersection_number)定义: $a_i\cdot b_i=1$ 
		- 在曲面上intersection index=1, 定义为切向量的cross product和法向量点积 > 0
	- 对应canonical representation: $\pi_1(S,p)=<a_1,\cdots,a_g,b_1,\cdots, b_g\vert \prod_{i=1}^g a_ib_ia_i^{-1} b_i^{-1}>$ 
- basis计算方法: 
	- 火烧法: 三角剖分$M$ -> cut graph $\Gamma$  -> canonical basis
		- 计算$M$ 的dual graph $\bar M$
		- 计算$\bar M$ 的[spanning tree](https://en.wikipedia.org/wiki/Spanning_tree) $\bar T$
		- 得到cut graph $\Gamma = \lbrace e\in M\vert \bar e \notin \bar T\rbrace$  
		- 计算cut graph $\Gamma$ 的spanning tree $T$ 
		- 得到 $\Gamma-T$ 是edge $\lbrace e_1, e_2,\dots, e_{2g}\rbrace$ 
		- $e_i\cup T$ 是loop $\gamma_i$, 得到basis $\lbrace \gamma_1, \gamma_2,\dots, \gamma_{2g}\rbrace$ 
- 唯一性: canoical representation不唯一, 判断两个canoical representation是isomorphic的是NP-hard问题.
	- 相当于要判断canoical basis中的曲线homotopy(同伦)

### [CW-cell decomposition(胞腔分解)](https://en.wikipedia.org/wiki/CW_complex) 

定义在n-dim 的manifold上

- 定义: n-dim 的manifold $M$ , 有$M$ 的k-skeleton $S_0\subset S_1\subset \cdots \subset S_n=M$  
	- 其中k-skeleton $S_k$ 是$S_{k-1}$ 粘上一些disk:  $S_k=S_{k-1}\cup D_k^1\cup D_k^2\cdots \cup D_k^{n_k}$ ,. $\partial D_k^i\subset S_{k-1}$   
	- 0-skeleton $S_0$ 是一些离散点, $S_0=\lbrace D_0^1,\cdots, D_0^{n_0}\rbrace$ 
- CW-cell decomposition把fundamental group的定义扩展到n-dim manifold
	- $\pi_1(S_n)=\pi_1(S_{n-1})=\cdots=\pi_1(S_2)=\pi_1(S_1\cup_{k=1}^{n_2}D_2^k)=<\gamma_1,\cdots,\gamma_k\vert\  [\partial D_2^1][\partial D_2^2],\cdots, [\partial D_2^{n_2}]>$ 
		- 用[Seifert-Van Kampen Theorem](https://en.wikipedia.org/wiki/Seifert–Van_Kampen_theorem) 和归纳法证明
			- $\pi_1(D_k^{n_k})$ 是trival的, $\pi_1(\partial D_k^{n_k}=\mathbb S^{k-1})$ 在$k> 2$ 的时候也是trival的.
			- 1-skeleton $S_1$ 是一些path, $\pi_1(S_1)=<\gamma_1,\cdots,\gamma_k>$ 提供了生成元
			- 2-disk的边界 $\pi_1(\partial D_2^{n_j})$ 在$S_1$ 中的表示$[\partial D_2^j]$提供了等价关系
	- surface的情况, $S_2=S_1\cup D$ 只有一个2维胞腔(面), cutgraph $\Gamma$ 就是1-skeleton $S_1$ 


