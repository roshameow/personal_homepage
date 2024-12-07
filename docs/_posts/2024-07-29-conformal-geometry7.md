---
layout: post
title: conformal geometry学习 (七 ) -- Duality, homology relation
categories:
  - math
tags:
  - content
  - homology
  - duality
  - betti_number
  - euler_character
  - 3-manifold
last_modified_at: 2024-12-05T22:02
created: 2024-07-29T21:12
---

## [Poincaré Duality](https://en.wikipedia.org/wiki/Poincaré_duality)

### surface上的dual mesh

| [Voronoi diagram](https://en.wikipedia.org/wiki/Voronoi_diagram) | [Delaunay三角剖分](https://en.wikipedia.org/wiki/Delaunay_triangulation) |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| cell 中的点距离最小                                                     | 顶点                                                                   |
| 顶点                                                               | 三角形外接圆的圆心                                                            |
| 边                                                                | dual 边的中垂线                                                           |

2d 离散点集 -> [Voronoi diagram](https://en.wikipedia.org/wiki/Voronoi_diagram)  -> Delaunay三角剖分

<a href="https://commons.wikimedia.org/wiki/File:Euclidean_Voronoi_diagram.svg#/media/File:Euclidean_Voronoi_diagram.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/5/54/Euclidean_Voronoi_diagram.svg" alt="Euclidean Voronoi diagram.svg" width="200" ></a> 

-  [Voronoi diagram](https://en.wikipedia.org/wiki/Voronoi_diagram)  : 平面上的segment, 使每个区域离中间点距离最近
	- 不同的distance函数会得到不同的segmentation
	- 软件生成:
		- blender里的 [Voronoi Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/voronoi.html) 
		- opencv 中 [distance transform](https://docs.opencv.org/3.4/d2/dbd/tutorial_distance_transform.html) 再取局部最大值
- [Delaunay三角剖分](https://en.wikipedia.org/wiki/Delaunay_triangulation) 
	- 我们的point set是三角剖分的顶点, 边连接两个相邻Voronoi cell
	- 特点:
		- 每个三角形的外接圆不包含其它的点
		- 最大化三角剖分三角形的最小角: 避免出现极瘦的三角形

### homology定义


<a href="https://commons.wikimedia.org/wiki/File:Delaunay_Voronoi.svg#/media/File:Delaunay_Voronoi.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/5/56/Delaunay_Voronoi.svg" alt="Connecting the triangulation's circumcenters gives the Voronoi diagram." width="200"></a>  黑色为Delaunay triangulation $T$, 红色为Voronoi diagram  $T^*$ , 红边是黑边的中垂线

- [Poincaré Duality](https://en.wikipedia.org/wiki/Poincaré_duality): n-dim的manifold $M$, 三角剖分$T$, 和cell decomposition $T^*$ 对偶.
	- **把每个k-simplex $\sigma$ 映射成(n-k)-cell $\sigma^\ast$**: 对于包含$\sigma$ 的n-simplex $\Delta$,  $\Delta\cap\sigma^*$ 是取$\sigma\subset ...\subset \Delta$ 之间的simplex的barycentres(重心点) 的convex hull
		- ![Pasted image 20240727223859.png]({{ '/docs/attachment/Pasted image 20240727223859.png' | relative_url }}){:width="100"} 顶点(1-simplex) $\sigma$, 面(2-simplex) $\Delta$ , 灰色部分 $\Delta\cap\sigma^*$ 是顶点$\sigma$,两条边, 面$\Delta$ 的重心点的convex hull
		- $\sigma^*$ 只和$\sigma$ 相交, 这个intersection给出了对偶关系
	- **把k-chain $C_k(T)$映射到(n-k)-chain $C_{n-k}(T^*)$** : 
		- $C_{n-k}(T^\ast)$ 是定义在$T^\ast$ 的多边形cell上的? 这样也可以吗? 
	- **把$H_k(M,\mathbb Z)$ 映射到 $H_{n-k}(M,\mathbb Z)$**: $H_k(M,\mathbb Z)\cong H_{n-k}(M,\mathbb Z)$  

#### 例子

- closed oriented 曲面$S=T_1 \texttt{\#}T_2 \texttt{\#}\cdots  \texttt{\#} T_g$, 只有一个连通分支, $H_0(S,\mathbb Z)=H_2(S,\mathbb Z)=\mathbb Z$ 
- closed oriented 三流型$M$, $H_0(M)=H_3(M)=\mathbb Z$. $H_2(M)=H^1(M)$.

## [Lefschetz Duality](https://en.wikipedia.org/wiki/Lefschetz_duality)

在带边界($\partial M$)的manifold $M$上, Poincaré Duality的推广

- 相交关系: intersection form: $\omega: H_k(M,\mathbb Z)\times H_{n-k}(M,\partial M,\mathbb Z)\rightarrow \mathbb Z$ 
	- 把k-chain(k-submanifold) $[S]$ 和(n-k)-submanifold $[S^\prime]$ 映射到它们的代数相交数(**algebraic intersection number**) 
		- properly embedding(横截相交): $\partial S^\prime=\partial M\cap S^\prime$ 
		- $S$ 和 $S^\prime$ 的交点是isolated, 在交点x的方向($\pm 1$ )由$T_x S\oplus T_x S^\prime$ 和$T_x M$ 确定, 代数相交数是所有交点相交数相加
			- $M$ 是曲面, $S,S^\prime$ 是两条曲线的情况: 切向量的cross product和法向量方向确定
	- $\omega$ 是[symplectic(辛形式)](https://en.wikipedia.org/wiki/Symplectic_vector_space) , 即 $\omega$ 是non-degenerate + skew-symmetric(反交换)的 
		- non-degenerate: 对于任何$\sigma$, $\omega(\sigma, \cdot)\ne 0$ 
- 相交关系-> 对偶关系: $H^k(M,\mathbb Z)\cong H_{n-k}(M,\partial M, \mathbb Z)$ 
	- $\omega(\cdot,\sigma)\mapsto \sigma$ 

#### 例子

- 如果$\partial M=\emptyset$, Lefschetz Duality退化成Poincaré Duality
- connected, oriented, compact manifold $M$, $H^0(M,\mathbb Z)=H_n(M,\partial M,\mathbb Z)=\mathbb Z$ 
	- $H_n(M,\partial M,\mathbb Z)$ 的元素 $[M]$ 由n-simplex的orientation确定, 叫M的 [fundamental class](https://en.wikipedia.org/wiki/Fundamental_class) 

## 一些manifold特征

- compact oriented connected n-manifold with (possibly empty) boundary $M$ , $H_k(M,\mathbb Z)\cong F_k\oplus T_k$ 
	- $F_k$ 是自由生成群, $T_k$ 是torsion(挠, 阶数有限的部分)
- k-th [Betti number](https://en.wikipedia.org/wiki/Betti_number):  $b_k(M)=rk(H_k(M,\mathbb Z))$ 
- [Euler characteristic](https://en.wikipedia.org/wiki/Euler_characteristic) (sheaf定义):  $\chi(M)=\sum_{i=0}^n (-1)^ib_i$ 
	- 如果$M$ 是compact三流型, $\chi(M)=\frac{1}{2}\chi(\partial M)$ 
		- 如果$M$ 是closed:  $\chi(M)=0$ 
			- oriented : 由Poincaré duality, $b_i=b_{n-1}$ 相互抵消
			- non-orientable:  有一个oriented double cover N, $\chi(M)=\frac{1}{2}\chi(N)=0$ 
		- 如果M有boundary $\partial M$ 
			- 把两个$M$ 沿$\partial M$  粘成一个double cover $N$ . $\chi(N)=2\chi(M)-\chi(\partial M)$ 

## $M$ 是oriented compact 3-manifold的情况

![Pasted image 20240805071909.png]({{ '/docs/attachment/Pasted image 20240805071909.png' | relative_url }}){:width="150"} $M$(3-manifold) : 中间部分, $\alpha$(2-chain): 中间圆盘, $\beta$(1-chain): 沿边界的curve

1. 有(relative homology) long exact sequence: $\cdots\rightarrow  H_2(M,\partial M)\overset{\partial}\rightarrow H_{1}(\partial M)\overset{i_\ast}\rightarrow H_1(M)\cdots$  
2. 有Lefschetz duality:  $\eta: H_2(M,\partial M,\mathbb Z)\times H_1(M,\mathbb Z) \rightarrow \mathbb Z$ 
3. 有Poincaré duality: $\omega: H_1(\partial M)\times H_1(\partial M)\rightarrow Z$ 
4.  边界surface $\partial M$ 有inherited orientation, 有 $H_1(\partial M)\cong \mathbb Z^{b_1(\partial M)}$ .
5. $H_2(M,\partial M,\mathbb Z)\cong \mathbb Z^{b_1(M)}\oplus T_2$ .

(2+3). 对任意$\alpha\in H_2(M,\partial M,\mathbb Z)$, $\beta\in H_1(\partial M)$ 有$\omega(\partial \alpha,\beta)=\eta(\alpha,i_\ast\beta)$ (curve $\beta$ 和$\alpha$ (圆盘)相交 = $\beta$ 和 $\alpha$ 的边界(圆)相交)

### 自身和边界的oriented dimension

free generated部分, $H_2(M,\partial M, \mathbb Z_2)$ 的曲面对应边界的meridians(纬线), 由Lefschetz duality和曲面对偶的curve对应边界的longitude(经线)部分

-  $\partial:  H_2(M,\partial M,\mathbb Z)\rightarrow H_1(\partial M, \mathbb Z)$ 的image是 Lagrangian + max rank 的
	- Lagrangian: $H_1(\partial M)$ 上的intersection form $\omega\vert_{\text{img}\partial}\equiv 0$ (所有的image curve, 图上$\partial \alpha$ ,不相交)     
	- maximal rank:  $\text{img}\partial$ 是rank n的. ( $rk(\text{img}\partial)= \frac{b_1(\partial M)}{2}$ )
	- 证明:
		- Lagrangian: $\omega(\partial \alpha,\partial \alpha^\prime)=\eta(\alpha,i_\ast\partial\alpha^\prime)=\eta(\alpha,0)=0$ 
			- long exact sequence: $\cdots\rightarrow  H_2(M,\partial M)\overset{\partial}\rightarrow H_{1}(\partial M)\overset{i_\ast}\rightarrow H_1(M)\cdots$ 有$i_\ast\partial=0$ 
		- rank <= n: (由Poincaré duality)
			- $\omega$ 是[symplectic](https://en.wikipedia.org/wiki/Symplectic_vector_space) 的 -> $H_1(\partial M)$ 上有basis $\lbrace x_1,\cdots,x_n,y_1,\cdots,y_n\rbrace$ , 使$\omega(x_k,y_k)=1$ , -> $\text{img}\partial$ 不能同时包含各组中的 $x_k,y_k$  -> rank <= n.
		- rank >= n: (由Lefschetz duality + exact sequence)
			- 有以下关系:
				- $rk(H_2(M,\partial M))=rk(H_1(M))=b_1(M)$ : 由Lefschetz duality
				- $rk(H_1(\partial M))=b_1(\partial M)$ 
				- $b_1(M)=rk(\text{ker}\partial) +rk(\text{img }\partial)$ : 由$\partial$ 的构造
				- $b_1(\partial M)=rk(\text{ker }i_\ast)+rk(\text{img }i_\ast)$ : 由 $i_\ast$ 的构造
				- $rk(\text{img}\partial)=rk(\text{ker }i_\ast)$ : 由exact sequence可得
				- $rk(\text{ker}\partial)+rk(\text{img }i_\ast)\le b_1(M)$ : 对 $\alpha\in \text{ker}\partial$ , 有 $\eta(\alpha,i_\ast \beta)=\omega(\partial \alpha,\beta)=\omega(0,\beta)=0$ -> $\text{ker}\partial\perp_\eta \text{img }i_\ast$ 
			- 解得$\text{img}\partial$ 和$b_1(\partial M)$ 的关系
				- $rk(\text{img}\partial)>=b_1(\partial M)/2$ 

- $b_1(M)\ge \frac{b_1(\partial M)}{2}$ (由Lefschetz duality, $b_1(M)=rk(H_2(M,\partial M))>rk(\text{img}\partial)$ )
	-  $b_1(M)=0$ -> $b_1(\partial M)=0$ : 如果$M$ 是simply connected, $\partial M$ 由sphere组成

### non-orientable embedding曲面

torsion部分, 由Lefschetz duality和曲面对偶的curve在曲面的tubular neighborhood里
- non-orientable 曲面$S$ 嵌入$M$ (properly embedding: 横截相交, $\partial S=\partial M\cap S$ )
	- 每个曲面$S$ 定义$H_2(M,\partial M, \mathbb Z_2)$ 中的一个non-trival class
	- $M$ 最多包含 $\text{dim} H_2(M,\partial M, \mathbb Z_2)$ 个不相交的non-orientable 曲面
		-  对于每个non-orientable 曲面$S$, 把$S$ 加厚, 得到tubular neighborhood $S\times I$ 
		- tubular neighborhood的boundary 给出了$S$ 的一个double cover $\tilde S$ 
		- $S$ 上过$p$ 点的closed loop $\gamma$ , lift to $\tilde \gamma$ + 把$\tilde p_1$ 和 $\tilde p_2$ 连上得到的$\tilde \eta$ = closed loop $\alpha=\tilde \gamma \cdot \tilde \eta$ , $\alpha$ 和 $S$ 只交于一点
		- 所有的$\alpha_i$ 不相交, 是linearly independent的, 最多有 $\text{dim} H_2(M,\partial M, \mathbb Z_2)$ 个

- $b_1(M)=0$ -> $\text{dim} H_2(M,\partial M, \mathbb Z_2)=0$ : 如果$M$ 是simply connected, 不包含non-orientable 曲面