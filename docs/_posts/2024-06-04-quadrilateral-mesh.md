---
layout: post
title: 四边形网格生成
categories:
  - algorithm
tags:
  - content
  - mesh
last_modified_at: 2024-06-12T15:38:29-08:00
---
![Pasted image 20240610075408.png]({{ '/docs/attachment/Pasted image 20240610075408.png' | relative_url }}){:width="150"} -> ![Pasted image 20240610075425.png]({{ '/docs/attachment/Pasted image 20240610075425.png' | relative_url }}){:width="130"} 

从通用的triangle mesh生成quad mesh. quad mesh容易插值和细分(样条曲面和 Catmull-Clark细分曲面常⻅ 的定义域就是四边形)

## quad-mesh 定义


<img src="https://upload.wikimedia.org/wikipedia/commons/b/bb/Conformal_map.svg" alt="drawing" width="100"/>


- 由多个topological rectangle构成,每个rectangle interior是regular grid.  
	- topological rectangle:由复平面的rectangle做conformal(holomorphic) map变形得到
		- [Conformal map(保角映射)](https://en.wikipedia.org/wiki/Conformal_map) 从几何方面描述: grid映射成正交的curve
		- [holomorphic map(全纯函数)](https://en.wikipedia.org/wiki/Holomorphic_function) 从分析方面描述:  $\mathbb C\rightarrow \mathbb C$ , 在任意一点可导
	- 通过在quad-mesh上定义conformal [atlas](https://en.wikipedia.org/wiki/Atlas_(topology)) , 得到quad- mesh是Riemann surface(see quad.2 Theorem 4.6)
		- chart: 每个face 的 interior定义$U_f$ , edge邻域定义$U_e$ , vertex邻域定义$U_v$ 
		- transition: 每两个chart之间的transition(face->edge, edge->vertex, face->vertex)都是$\pi/2$ 的旋转+平移, 是holomorphic的

![Pasted image 20240612152840.png]({{ '/docs/attachment/Pasted image 20240612152840.png' | relative_url }}){:width="400"}


## 等价条件

### conditions

- Riemann surface($\Sigma,g$) with cone singularities($\mathcal S$) 是quad mesh($\mathcal Q$) 的等价条件1 : 
	1. Gauss-Bonnet condition : 在singularities处的total curvature符合[Gauss-Bonnet Theorem](https://en.wikipedia.org/wiki/Gauss–Bonnet_theorem) 
		- $\sum_{v_i} (4-k(v))\frac{\pi}{2}=2\pi\chi(\Sigma)=2\pi(2-2g)$  
			- LHS: closed surface, 在singularities处的curvature是$(4-k(v))\frac{\pi}{2}$ , 其他地方的curvature=0
			- RHS: [Euler Character](https://en.wikipedia.org/wiki/Euler_characteristic) = 2-2g
	1. holonomy condition: 一个cross frame沿loop平行移动, 方向旋转的⻆度为pi/2的整数倍.存在一个global smooth的cross field.
		- [holonomy group](https://en.wikipedia.org/wiki/Holonomy) :  $Hol(\Sigma\backslash\mathcal S,g)=\{e^{i\frac{k\pi}{2}},k\in\mathbb Z\}\simeq \mathbb Z^3$          
		- cross field指$\Sigma$ 的tangent bundle上的 [Levi-Civita connection](https://en.wikipedia.org/wiki/Levi-Civita_connection "Levi-Civita connection") 
	1. boundary alignment condition: boundary和cross field是平行或垂直关系
	2. finite geodesic lamination condition: 沿cross field的geodesic是有限⻓的
- 等价关系推导:
	- quad mesh -> conditions(see quad.1 Theorem 3.7):
		- 取cross field平行于edges
			- 每次穿过不同chart时, 只会转$\pi/2$ 的整数倍
			- geodesic不会进入同一个face多过两次, face数是又有限的, 所以geodesic也是finite的.
	- Riemann surface with conditions -> quad mesh(see quad.1 Theorem 3.8):
		- 从singilarities出发, 沿cross field的geodesics形成quad mesh

### meromorphic quartic differential

- Riemann surface with cone singularities是quad mesh的等价条件 2: 
	- closed quad-mesh等价于存在meromorphic quartic differential with finite trajectories
		- 从文章看, quartic differential $(dz)^4$ 似乎并不是指外积 $\wedge^4 dz$  
		- 从quartic differential $\omega=f(z)(dz)^4$, 对应differential 1-form $\sqrt[4]{\omega}=f(z)^{\frac{1}{4}}dz$   
- 等价关系推导:
	- quad mesh -> meromorphic quartic differential(see quad.2 Theorem 4.7):
		- locally 在一个face 上定义 $(dz_f)^4$ , 可以consistent的定义在其他face, edge, vertex(包括singularities)的chart上
	- meromorphic quartic differential -> conditions(see quad.2 Theorem 4.8):
		- 取cross field(condition.2)为meromorphic quartic differential的horizontal & vertical trajectories(see qaud.2 Definition 3.13)
			- 使$\omega=f(z)(dz)^4$ 值是real的方向, 如果$w=z(dz)^4=c(d(z^{\frac{5}{4}}))^4$ , 有5个方向, $\theta=\frac{k2\pi}{5}$ 

### divisor

- divisor 对应meromorphic quartic differential的等价条件3:
	- divisor和一个holomorphic 1-form在Abel-Jacobian map下的值相等, $\mu(D-4(\omega_0))=0$ 
		- $(\omega_0)$ 为holomorphic 1-form的zeros
		- Abel-Jacobian map ($\Sigma\rightarrow \Omega^1(\Sigma)^*/\Lambda$ )
			- $\mu:p\mapsto \int_{p}^{p_0}\cdot$    
				- 因此可以定义在divisor上,  ($Div(\Sigma)\rightarrow \Omega^1(\Sigma)^*/\Lambda$ ), $\mu:\sum_{i=1}^n n_ip_i\mapsto \sum_{i=1}^n n_i\int_{p_i}^{p_0}\cdot$ 
			-  $\Omega^1(\Sigma)$ 为[holomorphic 1-form的线性空间](https://en.wikipedia.org/wiki/Differential_forms_on_a_Riemann_surface) , $\Omega^1(\Sigma)^*$ 是它的对偶空间
			- modulo image of [homology group(同调群)](https://en.wikipedia.org/wiki/Homology_(mathematics))  $H_1(\Sigma,\mathbb Z)$ 
				- 记 $H_1(\Sigma,\mathbb Z)$ 的basis $\{a_1,\dots,a_g,b_1,\dots,b_g\}$ , 即$\Lambda=span\{\int_{a_1}\cdot,\dots,\int_{a_g}\cdot,\int_{b_1}\cdot,\dots,\int_{b_g}\cdot\}$ 
					- 前半部分记为period matrix $A$, 后半部分记为period matrix $B$ (see quad.3 Definition 3.9)
- 等价关系推导:
	- quad mesh -> divisor condition(see quad.2 Theorem 4.11):
		- divisor Q 对应的meromorphic quartic differential($\omega_Q$) 可以拆分成 $\omega_Q=f\cdot \omega_0^4$ 
			- 其中$\omega_0$ 是任意holomorphic 1-form, $f$ 是meromorphic function
			- meromorphic function $f$ 对应principle divisor $(f)$ , $\mu((f))=0$ 

## 从divisor生成quad-mesh的方法

只考虑closed oriented surface的情况. 有边界和non-oriented(Mobius strip)的情况类似.

### 生成T-mesh $T=(V,E,F)$ 

![Pasted image 20240612151157.png]({{ '/docs/attachment/Pasted image 20240612151157.png' | relative_url }}){:width="200"}

- 从triangle mesh计算homology group(同调群) $H_1(\Sigma,\mathbb Z)$ 的basis $\{a_1,\dots,a_g,b_1,\dots,b_g\}$ , 
	- 通过reset height function构造Reeb graph抽卡保证$a_i$ 只和$b_i$ 相交(see [4])
	- 得到holomorphic 1-form basis  $\Omega^1(\Sigma)$ (see [5])
		- loop $\gamma$ -> discrete closed 1-form $\lambda_{\gamma}=dg_{\gamma}$  -> harmonic 1-form $\omega_{\gamma}$ -> holomorphic 1-form $\phi_{\gamma}$ 
		- 得到一个holomorphic 1-form $\phi$
		- 得到period matrix A, B
	- 得到cut graph $\Gamma$ 
- 生成singularity set $\mathcal S$ 
	- 在surface上选择initial singularities
		- maximal Gaussian curvature as poles, or with minimal curvature as zeros
	-  先添加一些zeros, poles, 使其满足Gauss-Bonnet condition
		- local maximal Gaussian curvature as poles, or with local minimal curvature as zeros
	- 优化这些点, 使其满足Abel–Jacobi condition: 对应一个meromorphic quartic differential 
		- 等价于: divisor $D$ 和 $4(\phi)$  linearly equivalent, 即相差一个meromorphic function
		- 等价于: $D$ 和 $4(\phi)$ 在Abel-Jacobian map的值相等
		- 用gradient descent优化 $\mu(D-4(\phi))$  
- 把$\mathcal S$ 做为divisor生成一个meromorphic quartic differential $\omega$ 
	- 计算cutgraph: $\Gamma\ \cup\ \{\cup_{i=1}^k \gamma_i\}$     (see quad.3  4.1.7)
		- 其中$\Gamma$ 为homology group  $\{a_1,\dots,a_g,b_1,\dots,b_g\}$ 的union
		- $\{\cup_{i=1}^k \gamma_i\}$ 是sigularities $p_i$ 到cutgraph $\Gamma$ 的最短path
	- 得到沿上面cutgraph切开的foundamental domain $\tilde \Sigma$ 
	- 计算foundamental domain $\tilde \Sigma$ 到平面$\mathbb C$ 的isometric immersion $\psi$ (see [6])
		- 用Newton method优化每个vertex上的conformal  factor $u_i$ 
	- complex domain上的$dz^4$, 用$\psi$ pull back, 得到 $\omega=\psi^* dz^4$ 为$\Sigma$ 上的一个meromorphic quartic differential
- 从 $\omega$ 上$S$的横竖方向trace得到T-mesh(see [7])


### 生成quad-mesh: 把每个rectangle划分成grid方格

- 解$\downarrow$ 构成的线性系统方程
	- 约束:
		- singularity position constraints: 共2(S-1)个(singularity set $\mathcal S$ )
			- $v_0$ 到$v_i$ 的path在horizontal, vertical 方向是有理数 (由path经过的edge组成 )
		- deck transformation constraints: 共2x2g个
			- $\{a_1,\dots,a_g,b_1,\dots,b_g\}$ 对应的路径在horizontal, vertical 方向是有理数
		- face constraints: 共2(F-1)个
			- 四边形相对边等长
	- 变量: 边长的改变量 $\{x_e:e\in E\}$ 



## reference

[quad.1] Chen, Wei, Xiaopeng Zheng, Jingyao Ke, Na Lei, Zhongxuan Luo, and Xianfeng Gu. “Quadrilateral Mesh Generation I : Metric Based Method.” _Computer Methods in Applied Mechanics and Engineering_ 356 (November 2019): 652–68. [https://doi.org/10.1016/j.cma.2019.07.023](https://doi.org/10.1016/j.cma.2019.07.023).

[quad.2] Lei, Na, Xiaopeng Zheng, Zhongxuan Luo, Feng Luo, and Xianfeng Gu. “Quadrilateral Mesh Generation II: Meromorphic Quartic Differentials and Abel–Jacobi Condition.” _Computer Methods in Applied Mechanics and Engineering_ 366 (July 2020): 112980. [https://doi.org/10.1016/j.cma.2020.112980](https://doi.org/10.1016/j.cma.2020.112980).

[quad.3]  Zheng, Xiaopeng, Yiming Zhu, Wei Chen, Na Lei, Zhongxuan Luo, and Xianfeng Gu. “Quadrilateral Mesh Generation III : Optimizing Singularity Configuration Based on Abel–Jacobi Theory.” _Computer Methods in Applied Mechanics and Engineering_ 387 (December 2021): 114146. [https://doi.org/10.1016/j.cma.2021.114146](https://doi.org/10.1016/j.cma.2021.114146).

[4] K, DeyTamal, FanFengtao, and WangYusu. “An Efficient Computation of Handle and Tunnel Loops via Reeb Graphs.” _ACM Transactions on Graphics (TOG)_, July 21, 2013. [https://doi.org/10.1145/2461912.2462017](https://doi.org/10.1145/2461912.2462017). **计算homology group**

[5] ACM Other conferences. “Global Conformal Surface Parameterization Proceedings of the 2003 Eurographics/ACM SIGGRAPH Symposium on Geometry Processing.” World. Accessed June 5, 2024. [https://doi.org/10.5555/882370.882388](https://doi.org/10.5555/882370.882388).    **计算holomorphic 1-form basis**

[6] Jin, Miao, Junho Kim, Feng Luo, and Xianfeng Gu. “Discrete Surface Ricci Flow.” _IEEE Transactions on Visualization and Computer Graphics_ 14 (September 1, 2008): 1030–43. [https://doi.org/10.1109/TVCG.2008.57](https://doi.org/10.1109/TVCG.2008.57).  **计算foundamental domain的参数化**

[7] Eppstein, David, Michael Goodrich, Ethan Kim, and Rasmus Tamstorf. “Motorcycle Graphs: Canonical Quad Mesh Partitioning.” _Comput. Graph. Forum_ 27 (July 1, 2008): 1477–86. [https://doi.org/10.1111/j.1467-8659.2008.01288.x](https://doi.org/10.1111/j.1467-8659.2008.01288.x).  **计算T-mesh** 