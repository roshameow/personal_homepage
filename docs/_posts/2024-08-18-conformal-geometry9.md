---
layout: post
title: conformal geometry学习 (九 ) -- homology character
categories:
  - math
tags:
  - content
  - euler_character
  - fix_point
  - zero_point
  - index
  - degree_of_mapping
  - Lefschetz_number
  - tangent_vector_field
  - homology
  - 发旋定理
  - 不动点定理
  - Gauss_Bonnet
  - gaussian_map
  - characteristic_class
  - obstruction
last_modified_at: 2024-10-24T15:44
created: 2024-08-18T09:39
---

## 由基本群/同调群定义指标

| 映射的层数                                                         | space                                                                      | map                                                                                                             | induced homology group<br>都是 $\mathbb Z\rightarrow \mathbb Z$ 的形式                                                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| degree of mapping<br>$deg(f)$                                 | closed surface                                                             | 连续映射<br>$f:M\rightarrow N$                                                                                      | $f_\ast: H_2(M,\mathbb Z)\rightarrow H_2(N,\mathbb Z)$<br>映射的像的覆盖层数                                                                                        |
| index of fixed point<br>$Ind(f,p)$<br>代数指标                    | n-dim topological space                                                    | 连续自映射<br>$f: M\rightarrow M$<br>从点p到像$f(x)$ 的射线和$\partial U$ 的交点<br>给出 $f:\partial U\rightarrow \partial U$     | $f_\ast: H_{n-1}(\partial U,\mathbb Z)\rightarrow H_{n-1}(\partial U,\mathbb Z)$<br><br>映射的像的覆盖层数<br>曲面的情况下, $H_1(\partial U,\mathbb Z)=\pi_1(\partial U)$ |
| zero index of <br>tangent vector field<br>$\text{Index}_p(v)$ | 在smooth surface上, <br>p 是连续切向量场 $\mathbb v$ 的零点<br>(在p处是0向量)<br>$B$ 是p 的邻域 | 单位切向量映射<br>$\phi: \partial B\rightarrow \mathbb S^1$<br>$q\mapsto \frac{\mathbf v(q)}{\vert \mathbf v(q)\vert}$ | $\phi_\texttt{\#}: \pi_1(\partial B)\rightarrow \pi_1(\mathbb S^1)$<br><br>单位切向量沿$\partial B$ 旋转的圈数                                                        |

- 全局指标
	- [Euler characteristic](https://en.wikipedia.org/wiki/Euler_characteristic) $\chi(S)=\vert V\vert+\vert F\vert -\vert E\vert$ 
		- 只和曲面本身有关
	- Lefschetz number $\Lambda(f)=\sum_k(-1)^k tr(f_{\ast k}\vert H_k(M,\mathbb Z))$  自同构在所有 不同层-form 上trace的sum 
		- 不仅和曲面, 和自同构也有关. 
		- 自同构取identity的时候就是Euler Character. 是Euler Character的另一种定义方式. $\chi(M)=\sum_{k=0}^n (-1)^i rk(H_k(M,\mathbb Z))=\sum_{i=0}^n (-1)^kb_k$ 
- 局部特征
	- 自同构的 index of fixed point
	- 切向量场的 zero index


## [closed surface映射的degree](https://en.wikipedia.org/wiki/Degree_of_a_continuous_mapping)


![Pasted image 20240731003422.png]({{ '/docs/attachment/Pasted image 20240731003422.png' | relative_url }}){:width="400"}  $p_1,p_2,p_3$ 都映射到$q$.  $p_3$ 是往右凸起
- **[Gauss-Bonnet](https://en.wikipedia.org/wiki/Gauss–Bonnet_theorem)**: Gauss映射$G:S\rightarrow \mathbb S^2$ , 把点映射到normal vector($p\mapsto n(p)$ ).
	- $deg(G)=1-g$. 即覆盖球面1-g次(每个点原像的个数). 
	- 计 Gauss映射的image的面积: $4\pi\cdot deg(G)=\int_S K dA=2\pi\cdot \chi(S)$ ?


## 拓扑空间的自映射和同调特征


有以下$\downarrow$ 随历史发展(研究深入🧐) 逐渐推广(变强💪) 的三个不动点定理
- **[Brouwer Fixed Point定理](https://en.wikipedia.org/wiki/Brouwer_fixed-point_theorem)**: $\Omega\subset \mathbb R^n$ 是compact, **convex**的. 有连续自映射$f:\Omega\rightarrow \Omega$. -> 这个映射**存在不动点 p** .
	- 用反证法证明: 
		- 如果没有不动点, 从内部点 $x$ 经$f(x)$ 到边界的射线, 给出了$\Omega\rightarrow \partial \Omega$  的连续映射
		- 而 $H_{n-1}(\Omega,\mathbb Z)=0$, $H_{n-1}(\partial \Omega,\mathbb Z)= \mathbb Z$ 给出了映射的矛盾. 
			- convex是单连通, 比如平面上的convex集是disk, $\partial \Omega$ 是circle
	- $\Omega$ 是compact, convex的 -> $H_0(\Omega,\mathbb Z)=\mathbb Z, H_k(\Omega,\mathbb Z)=0$ (所有圈中间都是实心的)  -> $\Lambda(f)=tr(id\vert H_0)=1$ (一个离散集上的连续映射只能是identity了.)
	- 直观理解: 搅拌一杯咖啡☕️, 肯定有分子不动; 地球上肯定有一个地方没有风
- **Lefschetz Fixed Point定理**: compact拓扑空间的连续自同构 $f: M\rightarrow M$ , 并且$f$ 的**Lefschetz number $\ne$ 0 -> 这个映射存在不动点 p**. 下面证明👇
	1. $\sum_k (-1)^k tr(f_k\vert C_k)=\sum_k (-1)^k tr(f_k\vert H_k)=\Lambda(f)$ (Lemma)
		- 证明:
			- 有以下分解关系:
				- $C_k=C_k/Z_k \oplus Z_k$ (分解出closed部分)
				- $Z_k=B_k \oplus H_k$ (homology定义, 分解出boundary部分)
				- $\partial_k: C_k/Z_k\rightarrow B_{k-1}$ 是isomorphic的 (由closed和boundary的定义)
					- 由交换图![Pasted image 20241010202933.png]({{ '/docs/attachment/Pasted image 20241010202933.png' | relative_url }}){:width="250"} , 得到相似变换, $\partial_k \circ f_k \circ \partial_k^{-1}=f_{k-1}$   
			- $tr(f_k\vert C_k)=tr(f_k\vert C_k/Z_k)+tr(f_k\vert B_k)+tr(f_k\vert H_k)=tr(f_{k-1}\vert B_k)+tr(f_k\vert B_k)+tr(f_k\vert H_k)$ 
			- 按照k把$(-1)^k$ 的两边相加得到等式
		- 把在$C_k$ 上的定义(依赖三角剖分, 更加几何), 和在$H_k$ 上的定义(不依赖三角剖分, 更加代数) 相联系
	1. $\Lambda(f)\ne 0$  ->  存在某个k, 使得$tr(f_k\vert C_k)\ne 0$ -> $f_k$ 在$C_k$ 上有特征向量$\sigma$ , 使$f_k(\sigma)\subset \sigma$ -> 存在不动点$p\in \sigma$ (由Brouwer Fixed Point定理)
- **[Lefschetz-Hopf theorem](https://en.wikipedia.org/wiki/Lefschetz_fixed-point_theorem)**  : compact拓扑空间的连续自同构 $f: M\rightarrow M$ , 有 $\sum_{p\in Fix(f)} Ind(p, f)=\Lambda(f)$ 
	- **不动点的代数指标和 = Lefschetz number** 


## 曲面的切向量场和曲面形态

### tangent vector

 我们在manifold上定义[tangent vector](https://en.wikipedia.org/wiki/Tangent_space) (其实可以由多种观点定义)
  1. 在atlas每个局部坐标系下表示为$\lbrace\frac{\partial}{\partial x_i}\rbrace_i$ 的函数组合: $\xi(x^1,x^2,\cdots,x^n)=\sum_{i=1}^n \xi_i(x^1,x^2,\cdots,x^n)\frac{\partial}{\partial x_i}$    
  2. 在不同坐标系间有Jacobian 的转换关系(transition rule) : $\tilde \xi^i=\sum_{j=1}^n \frac{\partial \tilde x^i}{\partial x^j}\xi^j$  

### Poincaré-Hopf Theorem(发旋定理): 用Euler Characteristic分析切向量场零点

<img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Baby_hairy_head_DSCN2483.jpg" alt="drawing" width="150"/>

- **Poincaré-Hopf Theorem(发旋定理): 光滑曲面上光滑tangent vector field, 所有zero index 的sum = euler characteristic ( $\sum_{p\in Z(\mathbf v)} \text{Index}_p(\mathbf v)=\chi(S)$ )**
	- 这里的zeros指isolated zero(分立零点): 即邻域里只有这一个零点
		- 如果不是, 经过微小扰动之后变成isolated zero (灾变理论: 把临界态变为稳态)
	- 证明1: 直接证明
		- **任意两个vector field $\mathbf v_1,\mathbf v_2$ 对应相同的zero index sum**:  $$\sum_{p\in Z(\mathbf v_1)} \text{Index}_p(\mathbf v_1)=\sum_{q\in Z(\mathbf v_2)} \text{Index}_q(\mathbf v_2)$$ 
			- 找一个足够细的三角剖分T, 把$\mathbf v_1,\mathbf v_2$ 的零点都分开在单独的面上
			- 定义:
				- 2-form $\Omega_1, \Omega_2$ :  $\Omega_k(\Delta)=\text{Index}_p(v_k)$  ($\Omega_k$ 在三角形$\Delta$ 上的值为$\mathbf v_k$ 的zero index)
				- 1-form $\omega$ : $\omega(\gamma)=\int_\gamma \dot \theta(\tau)d\tau$  (沿path(1-chain) $\gamma$ 的值为 $\mathbf v_1\rightarrow\mathbf v_2$ 沿$\gamma$ 角度变化的积分)
			- $\Omega_2-\Omega_1=d\omega$ 是cohomological
				- 由定义$d\omega(\Delta)=\omega(\partial \Delta)=\int_{\partial \Delta} \dot \theta(\tau) d\tau$  角度差沿三角形边界的变化
				- $\int_{\partial \Delta} \dot \theta(\tau) d\tau=\theta(x+\partial \Delta)-\theta(x)=2\pi\cdot (\text{Index}_p(\mathbf v_1)-\text{Index}_p(\mathbf v_2))$ 
					- x 是边界 $\partial \Delta$ 上任一点
					- 表示$\mathbf v_2$ 较$\mathbf v_1$ 在沿点$p$ 的边界$\partial \Delta$ 领先的 圈数(换算成角度)
					- 由zero index定义得到两边的等价关系
			- 在整个曲面$S$ 上积分, $$\sum_{p\in Z(\mathbf v_1)} \text{Index}_p(\mathbf v_1)=\int_S \Omega_1=\int_S \Omega_2=\sum_{q\in Z(\mathbf v_2)} \text{Index}_q(\mathbf v_2)$$ 
				- $\Omega_1$ 和$\Omega_2$ 的差距 $\int_S d\omega=\int_{\partial S} \omega=0$ 
					- 第一个等号根据[Stokes Theorem](https://en.wikipedia.org/wiki/Stokes%27_theorem) , 第二个等号根据条件$\mathbf v_1, \mathbf v_2$ 在$S$ 边界方向相同(指向exterior normal方向)
		- **存在一个vector field对应的对应的zero index sum = euler characteristic**
			- 在三角剖分T上, 构造如图切向量场 $\mathbf v$ 
				- ![Pasted image 20241002111153.png]({{ '/docs/attachment/Pasted image 20241002111153.png' | relative_url }}){:width="300"}
				- source和sink处的index是1, saddle处的index是-1
					- ![Pasted image 20241006122750.png]({{ '/docs/attachment/Pasted image 20241006122750.png' | relative_url }}){:width="400"}  
					- 如图, source和sink周围的切向量逆时针转一圈, saddle周围的切向量沿顺时针转一圈
					- 图中曲线是点沿切向量方向运动的轨迹
				- $$\sum_{p\in Z(\mathbf v)} \text{Index}_p(\mathbf v)=\sum_{\text{source}}+\sum_{\text{sink}}-\sum_{\text{saddle}}=\vert V\vert+\vert F\vert -\vert E\vert=\chi(S)$$    
	- 证明2: 用Fixed Point定理推导
		-  $\sum_{p\in Z(\mathbf v_1)} Index_p(\mathbf v_1)=\sum_{p\in Fix(\phi_t)} Ind(p, \phi_t)$  
			- 构造连续自同构family $\phi_t(p)$ : $\frac{\partial \phi_t(p)}{\partial t}=\mathbf v\cdot \phi_t(p)$ ?
				- 把切向量场$\mathbf v$ 作为梯度场
				- 每个 t 对应一个自同构 $p\mapsto p + t\cdot \mathbf v + o(t)$   
					- t = 0 时, $\phi(p,t)=id$ 
					- **切向量场$\mathbf v$ 的零点**($Z(\mathbf v_1)$) 对应 **自同构$\phi_t$ 的不动点**($Fix(\phi_t)$)的 位置 和 index
						- 切向量旋转的圈数 -> 切向量的终点的圈数
		- $\sum_{p\in Fix(f)} Ind(p, \phi_t)=\Lambda(\phi_t)$ : 不动点的代数指标和 = **Lefschetz number**
			- 由[Lefschetz-Hopf theorem](https://en.wikipedia.org/wiki/Lefschetz_fixed-point_theorem) 可得
		- $\Lambda(\phi_t)=\Lambda(id)=\vert V\vert+\vert F\vert -\vert E\vert=\chi(S)$  (lemma)
			- id 到 $\phi_t$ 的变化是homotopic(同伦)的-> 同调不变 -> Lefschetz number
			- $\Lambda(id)=tr(id\vert C_0)-tr(id\vert C_1)+tr(id\vert C_2)=\vert V\vert-\vert E\vert+\vert F\vert$  (由Lemma1)
- Poincaré-Hopf Theorem的几何意义: 如果Euler Character 不为零, 切向量丛必然存在零点
	- 曲面上没有**整体**光滑的切矢量场
		- movable frame只能局部定义
		- 半球的Euler Character是1 -> 头发一定会有发旋, 梳头发的时候总有梳不顺的地方
		- [发球定理](https://en.wikipedia.org/wiki/Hairy_ball_theorem) 
	- 对于曲面上的unit tangent bundle		
		- 全局的section不存在(存在obstruction, 拓扑障碍)


##  曲面单位切向量丛的拓扑障碍(obstruction)

用现代观点来看, 
- 证明1中的2-form即为unit tangent bundle的**characteristic class**(示性类)
	- 由zero index的定义
- 0点即为UTM(unit tangent bundle)的拓扑障碍
- 全局光滑切矢量场即为UTM的global section
	- global section: 3流型中的封闭曲面, 和每个fiber只有一个交点
- **characteristic class(示性类)在曲面上积分等于 [Euler characteristic](https://en.wikipedia.org/wiki/Euler_characteristic)** : $\int_M [\Omega]=\chi(M)$ 

### . 同调表示fiber bundle的[示性类](https://en.wikipedia.org/wiki/Characteristic_class)

只考虑UTM(unit tangent bundle) 这个fiber bundle

- 构造2-manifold(曲面) $M$ 上的三角剖分$T$ , 使fiber bundle $F(M)$ 在每个三角形$\Delta$ 上是trival的($F(\Delta)=\Delta\times F$ )
	- $F(M)$ 的section $\phi: M\rightarrow F(M)$ 
	- fiber是$\mathbb S^1$ , $F(\Delta)$ 是个solid torus, $\pi_1(F(\Delta))=\mathbb Z$ 
- **每个section可以定义一个2-form $\Omega$**: $\Omega(\Delta)=[\phi(\partial \Delta)]$ 
	- section $[\phi(\partial \Delta)]$ 是在$F(\Delta)$ 上的一个loop, 即$\pi_1(F(\Delta))=\mathbb Z$ 中的元素, 是一个整数
	- ![Pasted image 20241024143641.png]({{ '/docs/attachment/Pasted image 20241024143641.png' | relative_url }}){:width="200"}  ![Pasted image 20241024133352.png]({{ '/docs/attachment/Pasted image 20241024133352.png' | relative_url }}){:width="150"}  如图, 红绿蓝为顶点处的fiber, 黑色section $\phi(\partial \Delta)\sim e$  对应tangent vector指向同一方向
	- ![Pasted image 20241024143941.png]({{ '/docs/attachment/Pasted image 20241024143941.png' | relative_url }}){:width="200"}  ![Pasted image 20241024143512.png]({{ '/docs/attachment/Pasted image 20241024143512.png' | relative_url }}){:width="180"}  如图, 黑色section在$F(\Delta)$ 不能缩成一个点, 中间存在tangent vector的零点(即拓扑障碍)
		- 2-form $\Omega$ 的值为$\Delta$ 中一点$p$ 的zero index. 
		- 也可以说黑色section不是exact的, 为$H_1(\Delta)$ 的非零元素
- **不同的section对应同一个上同调类** $[\Omega]\in H^2(M,\mathbb R)$ : (lemma)
	- 对于其他的section $\bar\phi$ , 和定义的2-form $\bar\Omega$, **有1-form h, 使得$\Omega-\bar \Omega=\delta h$**    
	- 定义h: 
		- ![Pasted image 20241018223827.png]({{ '/docs/attachment/Pasted image 20241018223827.png' | relative_url }}){:width="400"} 如图所示 h 链接前后两个三角形$\partial \Omega$ 和$\partial \bar \Omega$ 
		- 在$\Delta$  的边 a 上, 定义$h=[l_a]=[p_i\phi(a)p_j^{-1}\bar \phi(a)^{-1}]$ 
			- 其中a 的顶点是 $\sigma_i^0$ 和$\sigma_j^0$ 
			- 其中$p_i$ 是$\sigma_i^0$ 的fiber上$\bar\phi$ 的像到$\phi$ 的像的path, $p_j$ 是$\sigma_j^0$ 的fiber上$\phi$ 的像到$\bar\phi$ 的像的path
			- $l_a$ 是$p_i\phi(a)p_j^{-1}\bar \phi(a)^{-1}$ 构成的loop,  $[l_a]$ 也是$\pi_1(F(\partial\Delta))=\mathbb Z$ 中的元素
		- 其他两边b, c也类似定义
- 示性类$[\Omega]$ 
	- 示性类$[\Omega]$ 不依赖local section的选取, 反应曲面的整体性质
	- 示性类$[\Omega]$ 不是0  ->  $F(M)$ 没有global section
		- 因为global section可以得到trival的示性类
