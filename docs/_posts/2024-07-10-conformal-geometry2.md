---
layout: post
title: conformal geometry学习 (二 ) -- Universal Covering
categories:
  - math
tags:
  - content
  - cover
  - universal_cover
  - deck_transformation
  - lift
  - homotopy
  - hyperbolic_geometry
last_modified_at: 2024-07-16T14:56:53-08:00
---


## covering space

 ![Covering_map_edit.svg]({{ '/docs/attachment/Covering_map_edit.svg' | relative_url }}){:width="178"} <a href="https://commons.wikimedia.org/wiki/File:Covering_map.svg#/media/File:Covering_map.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Covering_map.svg" alt="Covering map.svg" height="245" width="178"></a>  $\cup S_i$ 是$U$ 的orbit

- [covering space](https://en.wikipedia.org/wiki/Covering_space) $\tilde S$ : 对于曲面$S$, 每个点$q$ 的邻域$U$, 都可以找到preimage $p^{-1}(U)=\cup U_i$, 每个$U_i$和$U$ 都是local homeomorphism
- lift(提升):  $S$ 上起点为$q$ 的path $\gamma$, 选取$\tilde S$ 上$q$ 的orbit其中一点$\tilde q_0$ , 沿$\gamma$ 一路的邻域拉到$\tilde S$ 上得到lift $\tilde \gamma$ 
	- $p\cdot\tilde \gamma =\gamma$ 
	- 固定起始点后, $\tilde \gamma$ 是唯一的

- Deck Transformation(甲板映射): 在covering space上的自同构, 使得projection不变.
	- Deck group: $\frac{\pi_1(S,q)}{p_*\pi_1(\tilde S,\tilde q)}\cong Deck(\tilde S)$ 
		- 映射 $[\gamma]\mapsto(U_{\tilde q_i}\rightarrow U_{\tilde q_j})$   
			- $\tilde q_i,\tilde q_j$ 都在点$q$ 的orbit上, 是lift $\tilde \gamma$ 的starting pt. 和ending pt. 
		- $\tilde \gamma$ 是loop -> 在Deck group中是trival的

## universal covering(万有覆叠)

 covering space单连通, 即 $\pi_1(\tilde S)=\lbrace e\rbrace$ , $\pi_1(S,q)\cong Deck(\tilde S)$  


$S$ : <a href="https://commons.wikimedia.org/wiki/File:Torus_cycles.svg#/media/File:Torus_cycles.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/8/81/Torus_cycles.svg" alt="Torus cycles.svg" width="150"  ></a>                         $\rightarrow$ $\tilde S$: ![Pasted image 20240714095557.png]({{ '/docs/attachment/Pasted image 20240714095557.png' | relative_url }}){:width="200"} 上面点集对应$\pi_1(S,q)$ 

### 构造

universal covering space的存在性: 构造式证明

- $S$ 是path connected: 把$S$ 上路径展开得到$\tilde S$ 
	- 构造从$q$ 点出发的path同伦类, $\tilde S = \Gamma/\sim$ , $\tilde S$ 是一个universal covering space
		- 对$S$ 上的每个点$q_0$,  $[\gamma_{q\rightarrow q_0}]\mapsto q_0$   定义了 $\tilde S\rightarrow S$ 的projection
			- 对任意点$q_0$, orbit $[\gamma_{q\rightarrow q_0}]$ 和$[\gamma_{q\rightarrow q}]$ 一一对应, 即$\pi_1(S,q)\cong Deck(\tilde S)$  (universal性质)
				- path去除loop部分后是homotopy(同伦) trival的
		- 对$S$ 上$q_0$ 的邻域$U_{q_0}$ , preimage $\tilde U$ 定义为同伦类集合 $\lbrace[\tau_{q\rightarrow q_1}]\ \vert\ q_1\in U_{q_0}, \tau_{q\rightarrow q_1}\cdot\alpha_{q_1\rightarrow q_0}\sim \gamma_{q\rightarrow q_0}\rbrace$ 
			- $\tilde U$ 的每个联通分支对应一个$\gamma_{q\rightarrow q_0}$ 
			- $\tilde U$ 定义了$\tilde S$ 上的[拓扑](https://en.wikipedia.org/wiki/Topological_space) 
- $S$ 是oriented closed surface
	- 沿$S$ 的cutgraph $\Gamma$ 切开并粘合, 得到一个universal covering space
		- 把边界上$s_i$ 和$s_i^{-1}$ 的部分粘在一起
		- 中间的每一块称为fundamental domain

universal性质: 记$\tilde S_u$ 是unviersal covering, 对应projection $p_u$, 对于任何的covering space $\tilde S$, 存在映射$u: \tilde S_u \rightarrow \tilde S$ , 使$p\cdot u=p_u$ .

### 性质

- $\tilde \gamma$ 是closed <-> $\gamma \sim e$ 
	- -> : $\tilde \gamma \sim e$ , 即存在同伦变换 $\tilde f(0,t)=\tilde \gamma$, $\tilde f(1,t)=\tilde q$ , 令$f=p\cdot \tilde f$ , 所以$\gamma\sim e$  (使 $p_*\pi_1(\tilde S, \tilde q)\subset \pi_1(S,q)$ well-defined)
	- <-: 同伦变换$f$ 提升到连续映射 $\tilde f$ 
		- 记 $\tilde f(1,0)=\tilde f(1,1)=\tilde p_0$ 是trival path的提升, 中间路径的endpoint $\tilde f(t,1)\in \cup_i\ \tilde p_i$  , orbit $\cup_i\ \tilde p_i$ 是离散点集
		- 所以所有的endpoint $\tilde f(t,1)=\tilde p_0$ 都一样
		- $\tilde \gamma$ 的endpoint也是一样, $\tilde \gamma(1)=\tilde f(0,1)=\tilde p_0$ 
- 判断homotopy(同伦): $\gamma_1\sim\gamma_2$  <-> $\gamma_1\gamma_2^{-1}\sim e$ <-> $\gamma_1\gamma_2^{-1}$ 的lift $\tilde \gamma$ 是closed
	- 即只要记录 $\gamma_1\gamma_2^{-1}$ 和canonical basis的相交情况, 得到最后ending point落在哪个fundamental domain就可以判断
	- 这依然是NP-hard问题?

### 分类

#### 3种基本曲面

- 球面: 直线是大圆, 过直线外一点有0条直线平行
- 平面: 过直线外一点有1条直线平行
- [双曲面](https://en.wikipedia.org/wiki/Hyperbolic_geometry): 由[Poincaré Disk Model](https://mathworld.wolfram.com/PoincareHyperbolicDisk.html)表示, 直线是和无穷远(边界)正交的圆弧, 过直线外一点有$\infty$ 条直线平行
	- <a href="https://commons.wikimedia.org/wiki/File:HyperboloidProjection.png#/media/File:HyperboloidProjection.png"><img src="https://upload.wikimedia.org/wikipedia/commons/1/1f/HyperboloidProjection.png" alt="The hyperboloid model can be represented as the equation t2 = x12 + x22 + 1, t > 1. It can be used to construct a Poincaré disk model as a projection viewed from (t = −1, x1 = 0, x2 = 0), projecting the upper half hyperboloid onto the unit disk at t = 0. The red geodesic in the Poincaré disk model projects to the brown geodesic on the green hyperboloid." width="200"></a>

- oriented closed surface的universal cover分类
	- genus 0: universal cover上有球面测度
	- genus 1: universal cover上有欧式测度
	- genus > 1: universal cover上有双曲测度
		- locally是conformal mapping? 