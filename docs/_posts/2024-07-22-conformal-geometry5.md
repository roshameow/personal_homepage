---
layout: post
title: conformal geometry学习 (五 ) -- homology group
categories:
  - math
tags:
  - content
last_modified_at: 2024-07-27T23:35:00-08:00
---
## 曲面的离散表示

曲面可以离散化用Simplicial Complex表示

- 曲面 $\Sigma$ 上的triangulation(三角剖分) $T$
	- 每个三角形边的方向沿曲面法向的逆时针
	- 每个边有两条相互反向的half-edge

### simplex->chain->boundary

<a href="https://commons.wikimedia.org/wiki/File:Simplicial_complex_example.svg#/media/File:Simplicial_complex_example.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/5/50/Simplicial_complex_example.svg" alt="Simplicial complex example.svg" width="200"></a>

- 单纯复形([Simplicial Complex](https://en.wikipedia.org/wiki/Simplicial_complex)) $\Sigma=\cup \sigma$ 是由simplices(单型) 粘合而成
	- “粘合”条件: 1. simplex $\sigma\subset \Sigma$ -> $\sigma$ 的facets $\tau\subset \Sigma$  2. $\sigma_1,\sigma_2\subset \Sigma$, $\sigma_1\cap \sigma_2=\tau\ne \emptyset$ 是两个simplex的交 -> $\tau\subset \sigma_1$, $\tau\subset \sigma_2$ 是一个common facet
	- [Simplex](https://en.wikipedia.org/wiki/Simplex) $\sigma$ 是$\mathbb R^n$ 中的点集的minimal convex hull(0: simplex 是点, 1-simplex: 线段, 2-simplex: 三角形, 3-simplex: 四面体 ...)
		- facet:  $\tau\subset \sigma$ , $\tau$ 也是个simplex
- Chain: k-chain $C_k(\Sigma,\mathbb Z)$ 是单纯复形$\Sigma$ 上同维数的simplices(单型) 的集合, with multiplicity $\sigma=\sum_i\lambda_i\sigma_i, \lambda_i\in\mathbb Z$ 
	- 其中系数$\lambda_i$ 是multiplicity(经过同一个simplex的次数), 系数为负表示方向相反
	- chain不要求是连续的
	- example: 曲面上curve是1-chain, patch是2-chain


- Boundary Operator $\partial_n:C_n\rightarrow C_{n-1}$ 定义在chain上, 取simplex的边界
	- 表达式: $\partial_n[v_0,v_1,\cdots,v_n]=\sum_{i} (-1)^i[v_0,\cdots,v_{i-1},v_{i+1},\cdots, v_n]$ 
		- $\partial_k$把$\sigma$ 映射到$\sigma$ 的边界(k-1)-simplex $\tau_i$ 的线性组合, 系数为$\tau_i\subset \sigma$ 的次序
	- exact性质(boundary of a boundary): $\partial_{n-1}\partial_n=\emptyset$   
		- boundary operator生成的(n-1)-simplex会在交接的(n-2)-simplex处方向相反
			- 比如$[v_0,\cdots,v_{i-1},v_{i+1},\cdots,v_{j-1},v_{j+1},\cdots,v_n]$ 的两项参数为$(-1)^i(-1)^{j-1}$ (先去掉$v_i$ )和$(-1)^j(-1)^i$ (先去掉$v_j$)
	- adjoint: $\partial_n^*: C_{n-1}\rightarrow C_n$ 
		- 表达式:  $\partial_n[v_0,v_1,\cdots,v_n]=\sum_{i} (-1)^i[v_0,\cdots,v_{i-1},v_{i+1},\cdots, v_n]$ 
			- 把(k-1)-simplex $\tau$ 映射到相邻的k-simplex $\sigma_i$ 的线性组合, 系数为$\tau\subset \sigma_i$ 的次序
		- $\partial_n^\ast\partial_n$ 表示n-simplex的相邻关系

- closed: k-chain $\gamma\in C_k(\Sigma)$ 没有boundary, 即$\partial_k \gamma=0$ 
- exact: k-chain $\gamma\in C_k(\Sigma)$ 是某个k+1-chain的boundary, 即 $\gamma=\partial_{k+1} \sigma$ 




| 一般表示    | 离散表示                            |
| ------- | ------------------------------- |
| surface | Simplicial Complex<br>(三角剖分得到的) |
| path    | 1-chain                         |
| loop    | closed 1-chain                  |

## [Homology(同调) group](https://en.wikipedia.org/wiki/Simplicial_homology) (Simplicial homology)

- homologous同调等价: $\gamma_1-\gamma_2=\partial_{k+1}\sigma$ 
- simplical form 的同调群 $H_k(\Sigma, \mathbb Z)=\frac{\text{ker}\partial_k}{\text{img}\partial_{k+1}}$       
	- closed, not exact

|                                                                                            | fundamental group $\pi_1(\Sigma)$                                             | first homology group $H_1(\Sigma,\mathbb Z)$                                                                                                                        |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 定义                                                                                         | 从曲面上某个点$p$                                                                    | 从曲面的三角剖分                                                                                                                                                            |
| 生成元                                                                                        | 经过点p的loop                                                                     | closed 1-chain<br> $\sigma=\sum_i\lambda_i\sigma_i, \lambda_i\in\mathbb Z$                                                                                          |
| 等价关系                                                                                       | $\gamma\sim e$ <br>可以连续缩成一个点<br>即, 是disk的边                                    | exact: $\gamma$ homological to 0<br>是某个平面patch(2-chain)的边<br>即, $\Sigma$ 沿$\gamma$ cut会分为两片                                                                         |
| **性质**                                                                                     |                                                                               |                                                                                                                                                                     |
|                                                                                            | 一般不是可交换群                                                                      | 可交换(1-chain没有经过simplex的前后顺序之分)<br> $\gamma_1\gamma_2=\gamma_2\gamma_1$ <br>commutator $[\gamma_1,\gamma_2]=\gamma_1\gamma_2\gamma_1^{-1}\gamma_2^{-1}$ 是trival的     |
| **关系**<br>Abelianization                                                                   |                                                                               | $H_1(\Sigma,\mathbb Z)=\pi_1(\Sigma)^{ab}=\pi_1(\Sigma)/[\pi_1(\Sigma),\pi_1(\Sigma)]$ <br>$[\pi_1(\Sigma),\pi_1(\Sigma)]$ 是commutator<br>$H_1$和$\pi_1$ generator相同 |
| high-genus <br>oriented surface<br>$T_1 \texttt{\#}T_2 \texttt{\#}\cdots  \texttt{\#} T_g$ | $<a_1,\cdots,a_g,b_1,\cdots, b_g\vert \prod_{i=1}^g a_ib_ia_i^{-1} b_i^{-1}>$ | $<a_1,\cdots,a_g,b_1,\cdots, b_g>^{ab}$ <br><br>free Abelian group $\mathbb Z^{2g}$                                                                                 |

**同调分类比同伦分类粒度更粗**

- homology(同调) group trival -/-> 曲面trival: [同调球](https://en.wikipedia.org/wiki/Homology_sphere) 
- loop $\gamma$ 在homology(同调) group trival -/-> 在fundamental group trival: 
	- ![Pasted image 20240726111536.png]({{ '/docs/attachment/Pasted image 20240726111536.png' | relative_url }}){:width="250"} $\gamma=a_1b_1a_1^{-1}b_1^{-1}$ 在$H_1(\Sigma,\mathbb Z)$ trival, 但是在$\pi_1(\Sigma)$ 不trival


### Homology Basis(同调群基底)计算

- Smith Norm方法(线性代数): 因为**同调群是Abel群**, 可以有$\mathbb Z$-module(向量)表示
	- 把k-chain $C_k$ :  $\sigma=\sum_i\lambda_i\sigma_i, \lambda_i\in\mathbb Z$ 用以simplex为basis的vector表示 
	- Boundary Operator $\partial_k:C_k\rightarrow C_{k-1}$ 用矩阵表示, adjoint Boundary Operator $\partial_k^*=\partial_{k}^T$ 
	- 表示 [Combinatorial Laplacian matrix](https://en.wikipedia.org/wiki/Laplacian_matrix)   $\Delta_k=\partial_k^T\partial_k+\partial_{k+1}\partial_{k+1}^T$ 
		- $\text{ker}\Delta_k=H_k$ 
			- $\text{ker}\Delta_k= \text{ker}\partial_k\cap\text{ker}\partial_{k+1}^T$ 
				- $\subset$:  对于k-chain $\gamma$,  $\Delta_k\gamma=0$ -> $\gamma^T\Delta_k\gamma=0$ -> $\gamma^T\partial_k^T\partial_k\gamma+\gamma^T\partial_{k+1}\partial_{k+1}^T\gamma=0$ -> $\gamma^T\partial_k^T\partial_k\gamma=0$, $\gamma^T\partial_{k+1}\partial_{k+1}^T\gamma=0$ -> $\partial_k\gamma=0$, $\partial_{k+1}^T\gamma=0$ 
			- $\text{ker}\partial_k\cap\text{ker}\partial_{k+1}^T=\frac{\text{ker}\partial_k}{\text{img}\partial_{k+1}}=H_k$ 
				- inj:  k-chain $\gamma\in \text{img}\partial_{k+1}$ -> $\gamma=\partial_{k+1}\tau$ -> $\partial_{k+1}^T\gamma=\partial_{k+1}^T\partial_{k+1} \tau\ne 0$ 
					- 即, $\gamma$ 在$\text{ker}\partial_{k+1}^T$ 中表示$\gamma$ 不是exact, 在$H_k$ 中非0
	- 用integer matrix的Smith norm计算$\Delta_k$ 的zero eigen value(即$\text{ker}\Delta_k$ )
		- Smith Norm计算也是指数级, NP-hard?

### [Poincaré Duality](https://en.wikipedia.org/wiki/Poincaré_duality)

<a href="https://www.researchgate.net/profile/Clement-Cances/publication/278829092/figure/fig3/AS:667718760022016@1536207966130/Triangular-mesh-T-and-Donald-dual-mesh-M-dual-volumes-vertices-interfaces.png"><img src="https://www.researchgate.net/profile/Clement-Cances/publication/278829092/figure/fig3/AS:667718760022016@1536207966130/Triangular-mesh-T-and-Donald-dual-mesh-M-dual-volumes-vertices-interfaces.png" width="200"></a>

- [Poincaré Duality](https://en.wikipedia.org/wiki/Poincaré_duality): n-dim的manifold $M$, 三角剖分$T$, 和cell decomposition $T^*$ 对偶.
	- **把每个k-simplex $\sigma$ 映射成(n-k)-cell $\sigma^\ast$**: 对于包含$\sigma$ 的n-simplex $\Delta$,  $\Delta\cap\sigma^*$ 是取$\sigma\subset ...\subset \Delta$ 之间的simplex的barycentres(重心点) 的convex hull
		- ![Pasted image 20240727223859.png]({{ '/docs/attachment/Pasted image 20240727223859.png' | relative_url }}){:width="100"} 顶点(1-simplex) $\sigma$, 面(2-simplex) $\Delta$ , 灰色部分 $\Delta\cap\sigma^*$ 是顶点$\sigma$,两条边, 面$\Delta$ 的重心点的convex hull
		- $\sigma^*$ 只和$\sigma$ 相交, 这个intersection给出了对偶关系
	- **把k-chain $C_k(T)$映射到(n-k)-chain $C_{n-k}(T^*)$** : 
		- $C_{n-k}(T^\ast)$ 是定义在$T^\ast$ 的多边形cell上的? 这样也可以吗? 
	- **把$H_k(M,\mathbb Z)$ 映射到 $H_{n-k}(M,\mathbb Z)$**: $H_k(M,\mathbb Z)\cong H_{n-k}(M,\mathbb Z)$  

#### 例子

- closed oriented 曲面$S=T_1 \texttt{\#}T_2 \texttt{\#}\cdots  \texttt{\#} T_g$, 只有一个连通分支, $H_0(S,\mathbb Z)=H_2(S,\mathbb Z)=\mathbb Z$ 