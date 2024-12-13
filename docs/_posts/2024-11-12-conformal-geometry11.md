---
layout: post
title: conformal geometry学习 (十一 ) -- Hodge Star Operator
categories:
  - math
tags:
  - content
  - hodge_star
  - 电场
  - Riemann_metric
  - harmonic_form
  - dual_mesh
last_modified_at: 2024-12-11T12:42
created: 2024-11-12T17:58
---
## Hodge Star Operator

在有Riemann metric的mainfold的微分形式上有映射 $\ast: \Omega^k(M)\rightarrow \Omega^{n-k}(M)$ 
- 连接微分几何和复几何: 
	- 在微分几何中，它描述了manifold上的形式内积和体积
	- 在复几何中，它帮助刻画复结构和调和理论，解释了复流形中的拓扑性质?

### manifold定义


| 两种定义                                                                                                                                                                           | Type I<br>选 $T_pM$ 的orthonormal basis定义                                                                                                                                                                                                                                                                                                                                                                                                      | Type II<br>用一般的basis定义                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| $T_pM$ 上的basis<br>和inner product                                                                                                                                               | $\lbrace\frac{\partial}{\partial x_1},\frac{\partial}{\partial x_2},\cdots,\frac{\partial}{\partial x_n}\rbrace$ -> $\langle \partial_i, \partial_j\rangle_g=\mathbb 1_{ij}$     <br><br>                                                                                                                                                                                                                                                    | $\lbrace\frac{\partial}{\partial x_1},\frac{\partial}{\partial x_2},\cdots,\frac{\partial}{\partial x_n}\rbrace$ -> $\langle \partial_i, \partial_j\rangle_g=\mathbf g_{ij}$<br>                                                                                                                                                                                                                                                                                                                             |
| $T_p^\ast M$ 上induce一个dual inner product                                                                                                                                       | dual 1-form basis为$\lbrace dx_1,dx_2,\cdots,dx_n\rbrace$                                                                                                                                                                                                                                                                                                                                                                                     | dual 1-form basis  $\lbrace dx^1,dx^2,\cdots,dx^n\rbrace$ -> $\langle dx^i, dx^j\rangle_g=g^{ij}$                                                                                                                                                                                                                                                                                                                                                                                                            |
| $\Omega^k$ 上的dual inner product                                                                                                                                                | <br>$$\langle dx_{i_1}\wedge \cdots \wedge dx_{i_k}, dx_{j_1}\wedge\cdots \wedge dx_{j_k}\rangle=\delta^{j_1 \cdots j_k}_{i_1\cdots i_k}$$                                                                                                                                                                                                                                                                                                   | <br>$\langle \omega, \eta\rangle_g$<br><br>$$\langle dx_{i_1}\wedge \cdots \wedge dx_{i_k}, dx_{j_1}\wedge\cdots \wedge dx_{j_k}\rangle=\delta^{j_1 \cdots j_k}_{i_1\cdots i_k}\cdot g^{i_1j_1}\cdots g^{i_kj_k}$$                                                                                                                                                                                                                                                                                           |
|                                                                                                                                                                                | volume Element(体元)<br>$\omega_g= dx^1\wedge dx^2\wedge \cdots \wedge dx^n$                                                                                                                                                                                                                                                                                                                                                                   | volume Element(体积形式, 体元)<br>$\omega_g=\sqrt{det(g_{ij})}\ dx^1\wedge dx^2\wedge \cdots \wedge dx^n$                                                                                                                                                                                                                                                                                                                                                                                                          |
| Hodge star operator<br>$\ast: \Omega^k(M)\rightarrow \Omega^{n-k}(M)$                                                                                                          | <br>$(dx_{i_1}\wedge dx_{i_2}\wedge \cdots \wedge dx_{i_k})\overset{\ast} \mapsto (-1)^\sigma dx_{i_{k+1}}\wedge dx_{i_{k+2}}\wedge\cdots\wedge dx_{i_n}$<br>其中, $\sigma=(i_1,i_2,\cdots, i_n)$ 是一个permutation                                                                                                                                                                                                                               | **待定系数法**<br>对于一般$\omega\in\Omega^k$ 和$\tau\in\Omega^{n-k}$ 比较以下体元的系数<br>1. $\omega\wedge^\ast \xi=\langle\omega,\xi\rangle_g\omega_g$  <br>2. $\omega\wedge\tau$ <br>解出$^\ast \xi$ 的系数<br><br>**指标记法**<br>即,<br>$$(dx^{i_1}\wedge dx^{i_2}\wedge \cdots \wedge dx^{i_k})\overset{\ast} \mapsto \sum_{(j_{k+1},\cdots,j_n)}\frac{\sqrt{det(g_{ij})}}{(n-k)!}\delta^{j_1 \cdots j_k}_{i_1\cdots i_k}\cdot g^{i_1j_1}\cdots g^{i_kj_k} \cdot dx^{j_{k+1}}\wedge dx^{j_{k+2}}\wedge\cdots\wedge dx^{j_n}$$ <br> |
| 例子<br><br>体元和单位元                                                                                                                                                               | $^\ast(1)=dx^1\wedge dx^2\wedge \cdots \wedge dx^n=\omega_g$ <br>$^\ast(\omega_g)=1$                                                                                                                                                                                                                                                                                                                                                         |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 例子<br><br>Riemann metric $\mathbf g=e^{2\lambda(u,v)}(du^2+dv^2)$  <br>(写成等温坐标一形式)<br>即,<br> $\mathbf g_{ij}=\begin{bmatrix}e^\lambda & 0 \\\ 0 & e^\lambda\end{bmatrix}$ <br> | normalize 自然标架场, 得到orthonormal标架场<br>$\frac{\partial}{\partial x_1}=e^{-\lambda}\frac{\partial}{\partial u}$ , $\frac{\partial}{\partial x_2}=e^{-\lambda}\frac{\partial}{\partial v}$ <br>对应$dx_1=e^\lambda du$ , $dx_2=e^\lambda dv$ <br><br>Hodge star: $^\ast dx_1=dx_2$ , $^\ast dx_2=-dx_1$ , $^\ast (1)=dx_1\wedge dx_2$ <br>即得 $^\ast du=dv, ^\ast dv=-du$ , $^\ast (1)=e^{2\lambda}du\wedge dv$ <br><br>hodge star为逆时针旋转90度<br><br> | 此时surface area element(面元)<br>$\omega_g=e^{\lambda(u,v)}du\wedge dv$ <br><br>比较<br>1.  $\omega\wedge\tau=(\omega_1\tau_2-\omega_2\tau_1)du\wedge dv$ <br>2.  $\omega\wedge ^\ast du=\langle \omega,du\rangle_g\omega_g$<br>$=\langle\omega_1 du+\omega_2 dv, du\rangle_g e^{\lambda}du\wedge dv$<br>$=e^{-\lambda}\omega_1 e^{\lambda} du\wedge dv$  <br>$=\omega_1 du\wedge dv$<br>的系数<br><br>得到$^\ast du=0\cdot du+1\cdot dv=dv$                                                                           |


- Type2 待定系数 -> 指标记法:
	- 把$\tau\in \Omega^{n-k}$ 表示成$\tau=\sum_{(j_{k+1},\cdots,j_n)} (n-k)!\cdot \tau_{(j_{k+1},\cdots,j_n)}\cdot dx^{j_{k+1}}\wedge dx^{j_{k+2}}\wedge\cdots\wedge dx^{j_n}$  , 计算系数 $\tau_{(j_{k+1},\cdots,j_n)}$ 
		- $(j_{k+1},\cdots,j_n)$ 排列为递增
	- 比较 $\omega\wedge\tau$ 和 $\omega\wedge^\ast \xi=\langle\omega,\xi\rangle_g \omega_g$ 的系. : 即非零参数 $\omega_{(j_{1},\cdots,j_k)}$ 的系数
		- 左侧为: $(n-k)!\cdot \tau_{(j_{k+1},\cdots,j_n)}$ 
		- 右侧为: $$\delta^{j_1 \cdots j_k}_{i_1\cdots i_k}\cdot g^{i_1j_1}\cdots g^{i_kj_k}\cdot \sqrt{det(g_{ij})}$$ 
- $\ast$ (Hodge Star Operator)在$\Omega^k(M)$ 上定义了一个内积:  $(\zeta,\eta)=\int_M \zeta\wedge^\ast\eta=\int_M \langle \zeta, \eta\rangle_g\omega_g$ 

### 离散定义

<a href="https://commons.wikimedia.org/wiki/File:Delaunay_Voronoi.svg#/media/File:Delaunay_Voronoi.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/5/56/Delaunay_Voronoi.svg" alt="Connecting the triangulation's circumcenters gives the Voronoi diagram." width="150"></a>  黑色为Delaunay triangulation $T$, 红色为Voronoi diagram  $T^*$ , 红边是黑边的中垂线


![Pasted image 20241205221028.png]({{ '/docs/attachment/Pasted image 20241205221028.png' | relative_url }}){:width="300"} 在$T$ 的edge(1-chain) 上定义1-form

- Hodge star operator $^\ast\omega(\bar e)=\frac{vol(\bar e)}{vol (e)}\omega(e)=\frac{\vert \bar e\vert}{\vert e\vert}\omega(e)=\frac{1}{2}(\text{cot } \alpha +\text{cot } \beta)\omega(e)$ 
	- $e$ (黑边)的dual edge $\bar e$ (红边), $\vert e\vert$ 和$\vert \bar e \vert$ 相当于在度量$\mathbf g$ 下的体积
	- $\omega\in \Omega^1$ 是T上的. -form, 映射结果$^\ast \omega$ 是  $T^*$ 上的1-form
	- 由 圆心角的两倍=圆周角, 得到边长的比例 $\text{cot } \alpha +\text{cot } \beta$ , 称为cot edge weight


## 举例

### 场论 . 静电场 . 双点电荷系统

![Pasted image 20241122073441.png]({{ '/docs/attachment/Pasted image 20241122073441.png' | relative_url }}){:width="400"}  红色电力线, 为沿电场强度的轨迹; 蓝色等势线

- 0-form [电势场](https://en.wikipedia.org/wiki/Electric_potential) $\phi$  : 左侧正电荷处边界电势为+1, 负电荷处电势为-1, 外边界电势为0
- 1-form 电场强度为电势的梯度: $E=-\nabla \phi=E_xdx+E_ydy$    (高电势流向低电势)
- 场强是**harmonic**的:
	- closed:  $curl\ E = \nabla \times E=(\frac{\partial E_y}{\partial x}-\frac{\partial E_x}{\partial y})dxdy = 0$  ( 2-form 旋量, 电场强度的外微分)
		- 物理意义: 
			- 描述矢量场漩涡🌀的大小和方向
			- 旋量的面积分 = 沿封闭路径$\partial D$ 做功 = 0 ([Stokes Theorem](https://en.wikipedia.org/wiki/Stokes%27_theorem))
				-  带电粒子沿路径$\gamma$  做功为 $W=\int_\gamma F=q\int_\gamma E=q\int_\gamma \langle E,\dot r\rangle d\tau$ 
					- 带电粒子受到电场力 $F=qE$ 
					- 其中$\dot r$ 为沿$\gamma$ 的切向
	- coclosed: $div\ E=\nabla\cdot E=\frac{\partial E_x}{\partial x}+\frac{\partial E_y}{\partial y}= 0$   (0-form 散度, 电场强度的余微分)
		-  $div\ E = \delta(E)=(-1)^{kn+n+1}\ ^\ast d(^\ast E)$   
			1.  hodge star $^\ast E$ 为旋转90度, $^\ast E=E_y dx - E_x dy$ 
			2.  外微分得到 2-form $d(^\ast E)=-(\frac{\partial E_x}{\partial x}+\frac{\partial E_y}{\partial y})dxdy$ 
			3.  hodge star 得到0-form $^\ast d(^\ast E)=-(\frac{\partial E_x}{\partial x}+\frac{\partial E_y}{\partial y})$ 
			4.  最后 $div\ E=(-1)^\ast d(^\ast E)=\frac{\partial E_x}{\partial x}+\frac{\partial E_y}{\partial y}$ (映射到0-form 即k=0,2-manifold, 即n=2 -> kn+n+1 是odd)
		- 物理意义: 
			- 描述矢量场的发散和汇聚程度
			-  通量 = 封闭路径$\partial D$ 的净流入量(流入量-流出量) = 0   ( [Gauss' flux theorem(高斯通量定理)](https://en.wikipedia.org/wiki/Divergence_theorem) )
				- 电通量  $\Phi=\oint_{\partial D} \langle E, \mathbf n \rangle ds=\int_D \nabla\cdot E dA$ 
					- 其中$\mathbf n$ 是沿路径 $\partial D$ 的法向
			- 散度 = 通量在无穷小面元的极限 = 0

### 离散 . 局部调和形式

- 1-form $\omega$ 是harmonic条件:
	- closed: 沿每个三角形 $\Delta=\lbrace e_0,e_1,e_2\rbrace$ 一圈的值=0, 即 $\omega(e_0)+\omega(e_1)+\omega(e_2)=0$ 
	- coclosed: 
		1. 0-form $div=-^\ast d(^\ast \omega)$ 定义在顶点 $v$ 上
		2. 是定义在dual Voronoi cell $\bar f$ 上的2-form的hodge star:  $div\ v=-^\ast d(^\ast \omega)(v)=d(^\ast\omega)(\bar f)$ 
		3. 是定义在Voronoi cell的边界$\bar e_0,\cdots,\bar e_k$ 上的1-form的外微分: $d(^\ast \omega)(\bar f)=^\ast \omega(\bar e_0)+\cdots+^\ast \omega(\bar e_k)$ 
		4. 是定义在**沿顶点$v$ 为起点的边逆时针排列的边** $e_0,\cdots,e_k$ 上的hodge star:  $d(^\ast \omega)(\bar f)=^\ast \omega(\bar e_0)+\cdots+^\ast \omega(\bar e_k)=w_{e_0}\omega(e_0)+\cdots+w_{e_k}\omega(e_k)$ 
			- $e_0,\cdots,e_k$ 的cot edge weight为$w_{e_0},\cdots, w_{e_k}$ 
	

## 计算

### 曲面的调和一形式

由对应的上同调一形式得来

- 计算一阶cohomology class的basis: $\lbrace\omega_1,\omega_2,\cdots,\omega_{2g}\rbrace$ 
- 定义0-form $f_1,\cdots,f_{2g}$ , 使$\lbrace\omega_1+df_1,\cdots,\omega_{2g}+df_{2g}\rbrace$ 是harmonic的
	- closed: $\omega_i$ 是closed -> $\omega_i+df_i$ 自然是closed
		-  $\omega_i+df_i\in \omega_i+\text{img}\ d^0$ 和 $\omega_i$ 属于同个cohomology class 
	- coclosed: 解每个顶点处的线性的coclosed方程

### [harmonic map(调和映射)](https://en.wikipedia.org/wiki/Harmonic_map) 

带边单连通曲面( topological disk) -> $\mathbb D$ 