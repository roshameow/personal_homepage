---
layout: post
title: conformal geometry学习 (四 ) -- 3-manifold
categories:
  - math
tags:
  - content
  - 3-manifold
last_modified_at: 2024-07-21T22:28:00-08:00
---

在局部和$\mathbb R^3$ homeomorphic(同胚) 

## 3-manifold和knot的本质关联


- 所有的3-manifold都可以由$S^3$(3 sphere) 通过Dehn Surgery得到([Lickorish-Wallace, 1960](https://en.wikipedia.org/wiki/Lickorish–Wallace_theorem))
	- [Dehn Surgery](https://en.wikipedia.org/wiki/Dehn_surgery) : 从3-manifold $M$ **drill** 一个link的tubular neighborhood(管状邻域), 用solid torus **fill** 每个knot的部分.  
		- link $L$由一系列knots组成, $L=\cup_i K_i$ 
- 不同的link可能得到相同的3-manifold, 研究这个的是[Kirby Calculus学科](https://en.wikipedia.org/wiki/Kirby_calculus) .


## [hyperbolic 3-manifold(双曲三流型)](https://en.wikipedia.org/wiki/Hyperbolic_3-manifold) 

具有恒定负曲率

### Poincare half-space model($\mathbb H^3$)

- 定义: $\mathbb H^3=\lbrace(x,y,t)\vert\ t>0\rbrace$, 有双曲度量 $ds^2=\frac{dx^2+dy^2+dt^2}{t^2}$ 
- boundary $\partial \mathbb H^3=\mathbb C\cup\infty$ 又叫sphere at infinity
- 测地平面 $\mathbb H^2$ 是正交于xy-plane的vertical planes , 或上半球面
- 测地线是正交于xy-plane 的直线或半圆
-  $\text{Isom}^+(\mathbb H^3)=PSL_2(\mathbb C)$ 在$\mathbb C\cup \infty$ 上是[Möbius transforms](https://en.wikipedia.org/wiki/Möbius_transformation) 
- horizontal planes $t=$ 是scaled Euclidean planes, 叫[horospheres](https://en.wikipedia.org/wiki/Horosphere) 

### 性质(拓扑确定几何)

- 双曲三流型的基本群$\pi_1(M)$ -> 在covering space上是等距同构 -> 有到 $PSL_2(\mathbb C)$ 的离散, faithful 表示
	- 基本群的不同元素对应 $PSL_2(\mathbb C)$ 的不同元素(faithful)
- 双曲三流型$M$, 给定一个 $\epsilon>0$, 可以把$M$ 分解为厚部分和薄部分 $M=M_{thick}\cup M_{thin}$ (Margulis thick-thin theorem, 1978)
	- $M_{thin}$ 是注入半径<$\epsilon$ 的部分, 是tube和cusp
		- cusp是$T^2\times [0,\infty)$ with  $ds^2=\frac{dx^2+dy^2+dz^2}{z^2}$ (scaled Euclidean metric, $z\in [z_0,\infty)$ 是scale部分, x,y是$T^2$ 部分坐标)
	- $M_{thick}$ 是注入半径>$\epsilon$ 的部分
	- 表示度量(注入半径)确定了几何(是否是cusp)
- 双曲三流型上的双曲结构是唯一的.(Mostow-Prasad Rigidity theorem, 1968)
	- 表示几何不变量->拓扑不变量. 即可以通过研究拓扑研究几何.

| 3-manifold                                                                 | surface                                                                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| hyperbolic structure唯一(刚性定理)<br>即拓扑(度量)决定几何<br>可以用几何分析方法: PDE-> 黎曼度量 -> 拓扑 | high genus surface上有双曲度量<br>不唯一, 取决于canonical basis的选取<br>不同的度量构成[Teichmüller_space](https://en.wikipedia.org/wiki/Teichmüller_space) |

### 应用

 存在双曲三流型结构的场景: 这些场景😮‍💨全都不太理解
1. 如果三流型 $M$ 是 compact, irreducible, atoroidal(无环面), Haken manifold(有不可缩面embed) with torus boundary, $M$ 的内部是双曲的.(Geometrization of Haken manifolds, 几何化猜想的一部分)
2. 一些link of knot的补空间有双曲结构
	- 可以用circle packing 描述?
	- $S^2$ 球面的三角剖分和对偶的剖分对应circle packing([Koebe-Andreev-Thurston circle packing theorem](https://en.wikipedia.org/wiki/Circle_packing_theorem))?
1. fibered 3-manifolds(surface bundles)
	- 通过曲面$S$ 上的pseudo-Anosov monodromy(单值变换) 构造的fiber bundle上, 有双曲结构
	- 表示可以用双曲三流型理论研究曲面上的动态
1. $PSL_2(\mathbb C)$ 的算术lattice $\Gamma$ 的quotient上有双曲三流型结构
	- 比如$PSL_2(\mathcal O)$ 的finite index subgroup, 其中$\mathcal O$ 是某个数域的整数环
	- 首先, 我都没明白这为什么是三流型...

### 离散化

- 离散化成双曲多边形
- 基本元素是ideal tetrahedra(理想四面体):  $\mathbb H^3$ 上所有顶点在sphere at infinity($\partial \mathbb H^3=\mathbb C\cup\infty$ ) 的测地四面体
	- 每个边有一个edge parameter $z\in \mathbb C$ , 由周围顶点的cross ratio定义.
	- 体积计算: $Vol(\Delta(z))=Im(Li_2(z))+\log\vert z\vert \cdot arg(1-z)$  
		- $Li_2$ 是dilogarithm function
		- regular ideal tetrahedron(所有两面夹角$\pi/3$) 是体积最大的
- cusped(non-compact)双曲三流型$M$ 上的理想三角剖分: 
	- 由ideal tetrahedra(理想四面体)在faces处粘起来, 把顶点删除
		1.  edge粘合处需要乘$\pm 1$ 保证依然是双曲结构(曲率条件)
		2. 对edge parameter也需要添加condition保证completeness(完备条件)
	- 以上两个条件(curvature and completeness equations) 的solution set是离散的, (parameters决定了$M$ 上双曲结构?)


## 另外

3-manifold的很多内容我还没理解, 只是分类记录下来