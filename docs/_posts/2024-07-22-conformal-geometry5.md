---
layout: post
title: conformal geometry学习 (五 ) -- homology group
categories:
  - math
tags:
  - content
  - discrete
  - triangulation
  - 三角剖分
  - chain
  - simplex
  - simplical_complex
  - homology
last_modified_at: 2024-10-10T18:15
created: 2024-07-21T22:35
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
	- [Simplex](https://en.wikipedia.org/wiki/Simplex) $\sigma$ 是$\mathbb R^n$ 中的点集的minimal convex hull(0: simplex 是点, 1-simplex: 线段, 2-simplex: 三角形, 3-simplex: 四面体 ..., k-simplex有k+1
		- facet:  $\tau\subset \sigma$ , $\tau$ 也是个simplex
- Chain: k-chain $C_k(\Sigma,\mathbb Z)$ 是单纯复形$\Sigma$ 上同维数的simplices(单型) 的集合, with multiplicity $\sigma=\sum_i\lambda_i\sigma_i, \lambda_i\in\mathbb Z$ 
	- 其中系数$\lambda_i$ 是multiplicity(经过同一个simplex的次数), **系数为负表示方向相反**
		- $C_k(\Sigma,\mathbb Z_2)$ 的情况,  $\lambda_i=1$ ,$\lambda_i^2=0$  
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

- closed ($Z_n$,cycles): k-chain $\gamma\in C_k(\Sigma)$ 没有boundary, 即$\partial_k \gamma=0$ 
- exact ($B_{n+1}$,boundaries): k-chain $\gamma\in C_k(\Sigma)$ 是某个k+1-chain的boundary, 即 $\gamma=\partial_{k+1} \sigma$ 

| 一般表示    | 离散表示                            |
| ------- | ------------------------------- |
| surface | Simplicial Complex<br>(三角剖分得到的) |
| path    | 1-chain                         |
| loop    | closed 1-chain                  |

### simplicial mapping(单形映射)

- [单形映射](https://en.wikipedia.org/wiki/Simplicial_map) 是把simplex映射成simplex的映射
- simplicial complex之间的连续映射都可以由[单形映射](https://en.wikipedia.org/wiki/Simplicial_map)逼近(see [simplicial approximation theorem](https://en.wikipedia.org/wiki/Simplicial_approximation_theorem) )  
	- simplicial approximation theorem 是游戏行业的基石: 表示模型的连续变化?　

## [Homology(同调) group](https://en.wikipedia.org/wiki/Simplicial_homology) (Simplicial homology)

- homologous同调等价: $\gamma_1-\gamma_2=\partial_{k+1}\sigma$ 
- simplical form 的同调群 $H_k(\Sigma, \mathbb Z)=\frac{\text{ker}\partial_k}{\text{img}\partial_{k+1}}$       
	- closed, not exact

|                                                                                            | fundamental group $\pi_1(\Sigma)$                                                                                                                                                          | first homology group $H_1(\Sigma,\mathbb Z)$                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 定义                                                                                         | 从曲面上某个点$p$                                                                                                                                                                                 | 从曲面的三角剖分, 可以定义在任意维度                                                                                                                                                                                                                                  |
| 生成元                                                                                        | 经过点p的loop                                                                                                                                                                                  | closed 1-chain<br> $\sigma=\sum_i\lambda_i\sigma_i, \lambda_i\in\mathbb Z$                                                                                                                                                                           |
| 等价关系                                                                                       | $\gamma\sim e$ <br>可以连续缩成一个点<br>即, 是disk的边                                                                                                                                                 | exact: $\gamma$ homological to 0<br>是某个平面patch(2-chain)的边<br>即, $\Sigma$ 沿$\gamma$ cut会分为两片                                                                                                                                                          |
| **性质**                                                                                     |                                                                                                                                                                                            |                                                                                                                                                                                                                                                      |
|                                                                                            | 一般不是可交换群                                                                                                                                                                                   | 可交换(1-chain没有经过simplex的前后顺序之分)<br> $\gamma_1\gamma_2=\gamma_2\gamma_1$ <br>commutator $[\gamma_1,\gamma_2]=\gamma_1\gamma_2\gamma_1^{-1}\gamma_2^{-1}$ 是trival的                                                                                      |
| **关系**<br>Abelianization                                                                   |                                                                                                                                                                                            | $H_1(\Sigma,\mathbb Z)=\pi_1(\Sigma)^{ab}=\pi_1(\Sigma)/[\pi_1(\Sigma),\pi_1(\Sigma)]$ <br>$[\pi_1(\Sigma),\pi_1(\Sigma)]$ 是commutator<br>$H_1$和$\pi_1$ generator相同                                                                                  |
| 合并<br>$U\cup V$                                                                            | $<u_1,\dots,u_k,v_1,\dots,v_m\vert \alpha_i,\beta_j,i(w_1)j(w_1)^{-1},\dots,i(w_p)j(w_p)^{-1}>$ <br>[Seifert-Van Kampen Theorem](https://en.wikipedia.org/wiki/Seifert–Van_Kampen_theorem) | $<u_1,\dots,u_k,v_1,\dots,v_m\vert \alpha_i,\beta_j,i(w_1),j(w_1),\dots,i(w_p),j(w_p)>$<br>$H_1(U\cup V)\cong (H_1(U)\oplus H_1(V))/\text{img}(i_\ast,j_\ast)$  <br>[Mayer–Vietoris_sequence](https://en.wikipedia.org/wiki/Mayer–Vietoris_sequence) |
| high-genus <br>oriented surface<br>$T_1 \texttt{\#}T_2 \texttt{\#}\cdots  \texttt{\#} T_g$ | $<a_1,\cdots,a_g,b_1,\cdots, b_g\vert \prod_{i=1}^g a_ib_ia_i^{-1} b_i^{-1}>$                                                                                                              | $<a_1,\cdots,a_g,b_1,\cdots, b_g>^{ab}$ <br><br>free Abelian group $\mathbb Z^{2g}$                                                                                                                                                                  |
| non-orientable<br> surface<br>$\mathbb {R}P^2$                                             | $<\gamma\ \vert\  \gamma^2>$                                                                                                                                                               | $\mathbb Z/2\mathbb Z$ <br>torsion(生成元阶数有限)                                                                                                                                                                                                          |

**同调分类比同伦分类粒度更粗**

- homology(同调) group trival -/-> 曲面trival: [同调球](https://en.wikipedia.org/wiki/Homology_sphere) 
- loop $\gamma$ 在homology(同调) group trival -/-> 在fundamental group trival: 
	- ![Pasted image 20240726111536.png]({{ '/docs/attachment/Pasted%20image%2020240726111536.png' | relative_url }}){:width="250"} $\gamma=a_1b_1a_1^{-1}b_1^{-1}$ 在$H_1(\Sigma,\mathbb Z)$ trival, 但是在$\pi_1(\Sigma)$ 不trival

### topological space分解

- [Mayer–Vietoris_sequence](https://en.wikipedia.org/wiki/Mayer–Vietoris_sequence): $U, V$ open, $H_n(U\cup V)$ 和$H_n(U)$ , $H_n(V)$ 的关系
	- $$\cdots\rightarrow H_{n+1}(U\cup V)\overset{\partial_\ast}\rightarrow H_n(U\cap V)\overset{i_\ast,j_\ast}\rightarrow H_n(U)\oplus H_n(V)\overset{k_\ast-l_\ast}\rightarrow H_{n}(U\cup V)\rightarrow \cdots$$
		- i, j, k, l都是inclusion
		- <a ><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Mayer_Vietoris_sequence_boundary_map_on_torus.png/224px-Mayer_Vietoris_sequence_boundary_map_on_torus.png" width="112"></a> $\partial_\ast:[x]\mapsto [\partial u]$ 

#### 例子

![Pasted image 20240731133300.png]({{ '/docs/attachment/Pasted%20image%2020240731133300.png' | relative_url }}){:width="100"} tunnel loop ![Pasted image 20240731133422.png]({{ '/docs/attachment/Pasted%20image%2020240731133422.png' | relative_url }}){:width="100"} handle loop

- closed, orientable 曲面$S$ , 内部三流型为$I$, 外部为$O$ , 有
	- $$\cdots\rightarrow H_2(\mathbb R^3)\overset{\partial_\ast}\rightarrow H_1(S)\overset{i_\ast,j_\ast}\rightarrow H_1(I)\oplus H_1(O)\overset{k_\ast-l_\ast}\rightarrow H_1(\mathbb R^3)\rightarrow \cdots$$
		- $H_2(\mathbb R^3)=H_1(\mathbb R^3)=0$ ($\mathbb R^3$ 可以缩到一个点, 是同伦trival-> 同调trival, Poincaré duality给出$H_2\cong H_1$ )
	- $H_1(S)\cong H_1(I)\oplus H_1(O)$ 由内外三流型的同调确定
		- $H_1(I)$ 的generator是tunnel loop(外部可以缩成一个点), $H_1(O)$ 的generator是handle loop


### Homology Basis(同调群基底)计算

- Smith Norm方法(线性代数): 因为**同调群是Abel群**, 可以有$\mathbb Z$-module(向量)表示
	- 把k-chain $C_k$ :  $\sigma=\sum_i\lambda_i\sigma_i, \lambda_i\in\mathbb Z$ 用以simplex为basis的vector表示 
	- Boundary Operator $\partial_k:C_k\rightarrow C_{k-1}$ 用矩阵表示, adjoint Boundary Operator $\partial_k^*=\partial_{k}^T$ 
		- $\partial_k=([\sigma_i^{k-1},\sigma_j^k]_{ij})$ , $[\sigma_i^{k-1},\sigma_j^k]$ 是k-simplex和(k-1)-simplex的连接数, 可能是+/- 1, 0(包含定向)
	- 表示 [Combinatorial Laplacian matrix](https://en.wikipedia.org/wiki/Laplacian_matrix)   $\Delta_k=\partial_k^T\partial_k+\partial_{k+1}\partial_{k+1}^T$ 
		- $\text{ker}\Delta_k=H_k$ 
			- $\text{ker}\Delta_k= \text{ker}\partial_k\cap\text{ker}\partial_{k+1}^T$ 
				- $\subset$:  对于k-chain $\gamma$,  $\Delta_k\gamma=0$ -> $\gamma^T\Delta_k\gamma=0$ -> $\gamma^T\partial_k^T\partial_k\gamma+\gamma^T\partial_{k+1}\partial_{k+1}^T\gamma=0$ -> $\gamma^T\partial_k^T\partial_k\gamma=0$, $\gamma^T\partial_{k+1}\partial_{k+1}^T\gamma=0$ -> $\partial_k\gamma=0$, $\partial_{k+1}^T\gamma=0$ 
			- $\text{ker}\partial_k\cap\text{ker}\partial_{k+1}^T=\frac{\text{ker}\partial_k}{\text{img}\partial_{k+1}}=H_k$ 
				- inj:  k-chain $\gamma\in \text{img}\partial_{k+1}$ -> $\gamma=\partial_{k+1}\tau$ -> $\partial_{k+1}^T\gamma=\partial_{k+1}^T\partial_{k+1} \tau\ne 0$ 
					- 即, $\gamma$ 在$\text{ker}\partial_{k+1}^T$ 中表示$\gamma$ 不是exact, 在$H_k$ 中非0
	- 用integer matrix的Smith norm计算$\Delta_k$ 的zero eigen vector(即$\text{ker}\Delta_k$ )
		- Smith Norm计算也是指数级, NP-hard?
- 由persistent homology计算 $\mathbb Z_2$-module(主流方法)

### [closed surface映射的degree](https://en.wikipedia.org/wiki/Degree_of_a_continuous_mapping)

- degree of mapping由homology(同调)映射的层数$c$ 定义(同调的用途)
- closed surface之间的连续映射$f: M\rightarrow N$ , induce homology group之间的映射$f_\ast: H_2(M,\mathbb Z)\rightarrow H_2(N,\mathbb Z)$ 
	- -> $f_\ast: \mathbb Z\rightarrow \mathbb Z$ 
	- -> $f_\ast(z)=cz, c\in \mathbb Z$ 
	- -> $deg(f)=c$ 

![Pasted image 20240731003422.png]({{ '/docs/attachment/Pasted%20image%2020240731003422.png' | relative_url }}){:width="400"}  $p_1,p_2,p_3$ 都映射到$q$.  $p_3$ 是往右凸起, $K(p_3)$ 应该>0?
- 例子1([Gauss-Bonnet](https://en.wikipedia.org/wiki/Gauss–Bonnet_theorem)): Gauss映射$G:S\rightarrow \mathbb S^2$ , 把点映射到normal vector($p\mapsto n(p)$ ).
	- $deg(G)=1-g$. 覆盖球面1-g次


## Relative Homology(相对同调)


|                            | 定义                                                                                                                                                  | maps                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| simplicial complex         | $K_0\subset K$ 是subcomplex                                                                                                                          | $f:K\rightarrow L$<br>并且, $f(K_0)\subset L_0$     |
| relative p-chain           | $C_n(K,K_0)=C_n(K)/C_n(K_0)$<br>元素是coset $c+C_n(K_0)$                                                                                               | $f_\texttt{\#}: C_n(K,K_0)\rightarrow C_n(L,L_0)$ |
| relative boundary operator | $\partial_n:C_n(K,K_0)\rightarrow C_{n-1}(K,K_0)$<br>其中, $c\mapsto \partial_n c+C_{n-1}K_0$                                                         | $f_\texttt{\#}$ 和$\partial_n$ 可交换                 |
| relative cycles            | $Z_n(K,K_0)=\text{ker}\partial_n$<br>$\partial_n(Z_n(K,K_0))$ 在$C_{n-1}(K,K_0)$ 中trival<br>即有, $\partial_n: Z_n(K,K_0)\hookrightarrow C_{n-1}(K_0)$ |                                                   |
| relative boundary          | $B_n(K,K_0)=\text{img}\partial_{n+1}$                                                                                                               |                                                   |
| relative homology          | $H_n(K,K_0)=Z_n(K,K_0)/B_n(K,K_0)$                                                                                                                  | $f_\ast: H_n(K,K_0)\rightarrow H_n(L,L_0)$        |
|                            |                                                                                                                                                     |                                                   |

### 分解性质

- 得到long exact sequence: 
- $$\cdots\rightarrow H_n(K_0)\overset{i_\ast}\rightarrow H_n(K)\overset{\pi_\ast}\rightarrow H_n(K,K_0)\overset{\partial}\rightarrow H_{n-1}(K_0)\rightarrow \cdots$$
	- $i_\ast: H_n(K_0)\rightarrow H_n(K)$ 
		- $i: K_0\rightarrow K$ 是inclusion
	- $\pi_\ast: H_p(K)\rightarrow H_p(K,K_0)$ 给出absolute homology和relative homology的映射
		- $\pi:(K,\emptyset)\rightarrow (K,K_0)$ 是identity
	- $\partial: H_n(K,K_0)\rightarrow H_{n-1}(K_0)$ 把relative cycle映射到boundary
		- 由, $\partial_n: Z_n(K,K_0)\rightarrow C_{n-1}(K_0)$ 和$\partial_n(B_n)=0$ 定义

### 切除性质

- [excision theorem(切除定理)](https://en.wikipedia.org/wiki/Excision_theorem): $U\subset K_0\subset K$, 则切除$U$ 后relative homology不变,  即$H_n(K,K_0)\cong H_n(K-U,K_0-U)=H_n(L,L_0)$ 
	- 证明1: 用Smith Norm方法, $H_n$ 的basis由矩阵$\Delta_n$ 的0-eigenvector得到(具体细节🤔️?)
		- 写出$\partial_n: C_n(K)\rightarrow C_{n-1}(K)$ 和$\partial_n: C_n(L)\rightarrow C_{n-1}(L)$ 的矩阵表示
		- $C_n(K)$ 可以分解为$C_n(K_0)\oplus C_n(K,K_0)$ 两部分, 后部分又分解出$Z_n(K,K_0)$ 部分
			- $Z_n(K,K_0)$ 和$Z_n(L,L_0)$ 部分维数相等?
	- 证明2: 用long exact sequence分解(具体细节🤔️?)
		- $K=K_0\cup(K-U)=K_0\cup L$ , $K_0\cap L=K_0-U=L_0$ 
		
