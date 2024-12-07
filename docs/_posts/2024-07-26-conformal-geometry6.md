---
layout: post
title: conformal geometry学习 (六 ) -- cohomology group
categories:
  - math
tags:
  - content
  - cohomology
  - differential_form
  - de_Rham_cohomology
  - simplicial_cohomology
  - vector_field
  - tangent_vector_field
last_modified_at: 2024-12-05T22:21
created: 2024-07-26T12:34
---
上同调是同调的对偶

| 同调 homology<br><br><br>定义在离散的simplical complex                                             | 上同调 [(Simplicial) cohomology](https://en.wikipedia.org/wiki/Cohomology)<br><br>最初是为了表示[fiber bundle的class](https://en.wikipedia.org/wiki/Stiefel–Whitney_class.) | 对偶记号                                                                                                                                                                   | de Rham cohomology<br><br><br>定义在differential manifold M 上                                                                                                                                                                                                                               | 积分记号                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| k-chain $\sigma$ <br><br>$C_k$                                                             | k-cochain(k-form) $\omega$ <br><br>$C^k$                                                                                                                         | bilinear operator<br>$<\omega,\sigma>:=\omega(\sigma)$                                                                                                                 | **differential form(微分形式)**<br>**exterior k-form**((k, 0) tensor)<br>$\underbrace{T_p M\times \cdots \times T_p M}_{k \text{ copies}} \rightarrow \mathbb R$ <br>locally表示成k个Differential 1-form的wedge product<br> $\omega=\omega_I dx^I$ <br>$\omega_I$ 是个function<br><br>$\Omega^k(M)$ | $\int_M \omega=\sum_i\int_M f_i\omega$<br><br>其中$f_i$ 是在一个covering charts上的partition:<br>$\sum_i f_i(p)\equiv 1,\forall p\in M$<br>$f_i(p)\ge 0,\forall p\in M$<br><br> 其中每个chart的积分pull back到$\mathbb R^n$ 上定义 |
| (k+1)-boundary<br>$\partial_{k+1}:C_{k+1}\rightarrow C_{k}$                                | k-coboundary(微分算子)<br>$\delta_k: C^k\rightarrow C^{k+1}$<br>$\delta_k(\omega)=\omega\circ \partial_{k+1},\omega\in C^k$                                          | $<\delta\omega,\sigma>=<\omega,\partial\sigma>$ <br><br>[Stokes Theorem](https://en.wikipedia.org/wiki/Stokes%27_theorem)                                              | exterior differential<br> operator([exterior derivative](https://en.wikipedia.org/wiki/Exterior_derivative) , 外微分算子,)<br>$d^k:\Omega^k(M)\rightarrow \Omega^{k+1}(M)$<br>$d\omega=d(\omega_Idx^I)=(d\omega_I)\wedge dx^I$ <br>满足反对称的**乘法定律**                                             | $\int_{\partial M}\omega=\int_M d\omega$<br>[Stokes Theorem](https://en.wikipedia.org/wiki/Stokes%27_theorem)<br><br>**拓扑意义算子(左侧boundary $\partial$ )和分析意义算子(右侧微分形式 $d$ ) 的对偶关系**                               |
| adjoint boundary<br>operator<br>$\partial_{k+1}^\ast:C_{k}\rightarrow C_{k+1}$             | <br>hodge star:<br>$\frac{\omega(e)}{\vert e\vert}=\frac{^\ast\omega(\bar e)}{\vert \bar e\vert}$ <br>其中, $e,\bar e$ 是dual edge                                  | <br><br><--<br>$(d\omega,\eta)=(\omega,\delta\eta)$<br>由$d$ 和 $\wedge$ 的乘法定律得到                                                                                         | codifferential operator(余微分算子)<br>$\delta^{k}:\Omega^{k+1}(M)\rightarrow \Omega^{k}(M)$<br>$\delta=(-1)^{kn+n+1}\ ^\ast d^\ast$<br>[divergence(散度)](https://en.wikipedia.org/wiki/Divergence)<br><br>                                                                                    |                                                                                                                                                                                                                 |
| Laplace Operator<br>$\Delta_k=\partial_k^\ast\partial_k+\partial_{k+1}\partial_{k+1}^\ast$ |                                                                                                                                                                  | symmetric<br>$<\Delta \omega,\sigma>=<\omega,\Delta \sigma>$<br>non-negative([椭圆形](https://en.wikipedia.org/wiki/Elliptic_operator) )<br>$<\Delta \omega,\omega>\ge 0$ | $\Delta=d\delta+\delta d$                                                                                                                                                                                                                                                                |                                                                                                                                                                                                                 |
| **Hodge** **Decomposition**                                                                |                                                                                                                                                                  |                                                                                                                                                                        |                                                                                                                                                                                                                                                                                          |                                                                                                                                                                                                                 |
|                                                                                            | closed form $\delta_k\omega=0$<br>在每个三角面片上,<br>绕一圈结果为0                                                                                                           |                                                                                                                                                                        | closed form $d^k\omega=0$<br>curl free(旋量为0)<br>                                                                                                                                                                                                                                         |                                                                                                                                                                                                                 |
|                                                                                            | 在dual mesh的每个cell上,<br>绕一圈结果为0                                                                                                                                   |                                                                                                                                                                        | coclosed form $\delta^k\omega = 0$ <br>div free(散度为0)                                                                                                                                                                                                                                    |                                                                                                                                                                                                                 |
|                                                                                            | exact form $\omega=\delta_{k-1}\sigma$                                                                                                                           |                                                                                                                                                                        | exact form $\omega=d^{k-1}\sigma$<br>gradient(梯度, Exterior Derivative)                                                                                                                                                                                                                   |                                                                                                                                                                                                                 |
|                                                                                            |                                                                                                                                                                  |                                                                                                                                                                        | coexact form $\omega =\delta^{k+1}\sigma$ <br>                                                                                                                                                                                                                                           |                                                                                                                                                                                                                 |
|                                                                                            | harmonic form<br>离散调和                                                                                                                                            |                                                                                                                                                                        | harmonic form $\Delta \omega=0$                                                                                                                                                                                                                                                          |                                                                                                                                                                                                                 |
|                                                                                            |                                                                                                                                                                  |                                                                                                                                                                        | $\Omega^k=\text{img} d^{k-1}\oplus \text{img} \delta^{k+1}\oplus \mathcal H^k_\Delta$<br><br>[Hodge theory](https://en.wikipedia.org/wiki/Hodge_theory)<br><br>$H^k_{dR}\cong\mathcal H^k_\Delta$ <br>上同调类和调和形式一一对应                                                                      |                                                                                                                                                                                                                 |
| **同调**                                                                                     |                                                                                                                                                                  |                                                                                                                                                                        |                                                                                                                                                                                                                                                                                          |                                                                                                                                                                                                                 |
| $H_k$<br>closed, but not exact<br><br>$H_k=\text{ker}\Delta_k$ <br>                        | $H^k=\frac{\text{ker}\delta^k}{\text{img}\delta^{k-1}}$ <br>                                                                                                     |                                                                                                                                                                        | $H^k_{dR}=\frac{\text{ker} d^k}{\text{img}d^{k-1}}$ <br>curl free, but not gradient<br><br>$H^k_{dR}\cong H^k(M,\mathbb R)$                                                                                                                                                              |                                                                                                                                                                                                                 |
| $f_\ast: H_n(M)\rightarrow H_n(N)$                                                         | $f^\ast: H^n(N)\rightarrow H^n(M)$<br>是$f_\ast$ 的pull back                                                                                                       |                                                                                                                                                                        |                                                                                                                                                                                                                                                                                          |                                                                                                                                                                                                                 |


### 一阶 cohomology basis 计算

![Pasted image 20240731000546.png]({{ '/docs/attachment/Pasted image 20240731000546.png' | relative_url }}){:width="150"} 

- $H^1$ 是在边(1-simplex)上的函数, 使得沿每个三角形(2-chain)路径和为0 ( $\omega\in\text{ker}\delta^1$ )
- $H^1\cong H_1$  可以找到一组dual basis.
- closed, genus g的曲面($\Sigma$) 上**一阶 cohomology basis 计算** $H^1(\Sigma,\mathbb Z)$ (或$H^1(\Sigma,\mathbb R)$) : **用homology basis的dual basis组成**
	- 计算homology basis $H_1(\Sigma,\mathbb Z)=span<\gamma_1,\dots,\gamma_{2g}>$ 
		-  想办法让除同一组(tunnel, handle)之外的basis都不相交
	- 每个1-cycle $\gamma_i$ 定义一个1-form $\omega_i$
		- 把$\Sigma$ 沿$\gamma_i$ 切开, 得到 $M_i$ , 边界$\partial M_i=\gamma_i^+-\gamma_i^-$ 
		- 在$M_i$ 上定义 0-form $\tau_i$ , 在$\gamma_i^+$ 的顶点上取1, 在$\gamma_i^-$ 的顶点上取0, 得到1-form $\omega_i=d\tau_i$ (在边上取值是起点值-终点值)
			- 其他地方的$\tau_i$ 可以随便取值
			- $\omega_i$ 在$\gamma_i^+, \gamma_i^-$ 上的边都取0, 所以是well-defined
			- $w_i$ 在同组$\gamma_j$ 上取1: 展开成$M_i$ 后, $\gamma_j$ 变为$\gamma_i^+$ 到$\gamma_i^-$ 的path, $d\tau_i=1$
				- $w_i$ 是同组$\gamma_j$ 的对偶
			- $w_i$ 在其他$\gamma_j$ 上取0: 展开成$M_i$ 后, $\gamma_j$ 依然是loop, $d\tau_i=0$
			- $\omega_i=d\tau_i$, 所以$d\omega_i$ 处处为0
	- 所有$\omega_i$ 组成$H^1(\Sigma, \mathbb Z)$ 的basis

### 带边界的例子

1. ![Pasted image 20240907093602.png]({{ '/docs/attachment/Pasted image 20240907093602.png' | relative_url }}){:width="150"} 中间红色为$\gamma^+$, 蓝色为$\gamma^-$ 
	- annulus $M$
	- $H_1(M,\mathbb Z)$ 有一个generator $\gamma$ , 如图中间loop
	- 定义$\omega$ 如图:
		- 在$\gamma$ 上取1, $\gamma^{-1}$ 上取-1
		- 其余edge上按此定义, 使$d\omega=0$ (沿每个面(2-chain)路径和为0 ( $\omega\in\text{ker}\delta^1$ )) -> **$\omega$ 是closed**
		- $\int_\gamma \omega = 18$  -> **$\omega$ 不是exact** ($\omega$ 没法表示成0-form 的image, 一圈之后会不compatible )
	- $\omega$ 是$H^1(M,\mathbb R)$ 的generator
2. ![Uniform_curl.svg]({{ '/docs/attachment/Uniform_curl.svg' | relative_url }}){:width="200"} 如图, $\mathbb C\backslash \lbrace 0\rbrace$ 上的向量场 $\mathbf v(x,y)=(\frac{-y}{x^2+y^2},\frac{x}{x^2+y^2})$ 
	- $\mathbf v$ 是differential 1-form
		- 对应每个单位切向量(方向)一个赋值
	- **$\mathbf v$ 是[curl free](https://en.wikipedia.org/wiki/Curl_(mathematics))($\mathbf v$ 是closed)**
		-  $\mathbf v=\mathbf v_x dx+\mathbf v_y dy$ -> $d\mathbf v = (\frac{\partial}{\partial x}v_y-\frac{\partial}{\partial y}v_x) dxdy=0$ (由外微分定义)
		- $\int_{\partial D} \mathbf v=\int_D d\mathbf v=0$ 在中间有定义的小邻域$D$ 内 
	- $\oint \mathbf v=\oint -ydx+xdy=\oint dtan^{-1}\frac{y}{x}=\oint d\theta=2\pi$ 不是exact 
		- 沿unit circle积分
		- $(arctan (x))^\prime=\frac{1}{1+x^2}$ 
		- **$\mathbf v$ 不是gradient($\mathbf v$ 不是exact)**
			- 如果$\mathbf v=(\frac{\partial f}{\partial x},\frac{\partial f}{\partial y})$ 是某个函数$f(x,y)$ 的梯度向量, $\oint \mathbf v=\oint \frac{\partial f}{\partial x} dx+\frac{\partial f}{\partial y} dy=\oint df=0$   

## differential form定义

 逐步定义 tangent space -> differential 1-form -> m-form. 
 直观上, 一维的情况下, 由vector field在curve上的积分, 代替simplicial cohomology里面1-chain(loop)的对偶关系.

- tangent space $T_pM$
	- basis 为 $\lbrace\frac{\partial}{\partial x_i}\rbrace_i$ 
	- tangent vector可以做push-forward
- Differential 1-form(co-tangent space) $T_p^\ast M$ 
	- 这里我们指real dual: $\omega\in T_p^\ast M$, 即 $\omega: T_pM\rightarrow \mathbb R$ 是个线性映射
	- basis 为  $\lbrace dx_i \rbrace_i$ , 是 $\lbrace\frac{\partial}{\partial x_i}\rbrace_i$ 的对偶
- exterior m-form(differential m-form) $\Theta_p: T_p M\times\cdots\times T_p M\rightarrow \mathbb R$  
	- 是(m, 0) tensor
		- type (m, n) 的tensor  $$T: \underbrace{V \times\dots\times V}_{m \text{ copies}} \times \underbrace{ V^\ast \times\dots\times V^\ast}_{n \text{ copies}} \rightarrow \mathbb{R}$$ 是multi-linear map
	- 有skew symmetric(反对称)性质: $\omega(\xi_{\sigma_1},\xi_{\sigma_2},\cdots,\xi_{\sigma_m})=(-1)^\sigma \omega(\xi_1,\xi_2,\cdots,\xi_m)$ 
		- 其中 $\xi_1,\xi_2,\cdots,\xi_m \in T_pM$ 是m个切向量, $\sigma\in S_m$ 是$\lbrace 1,2,\cdots, m\rbrace$ 的一个permutation(排列)
	- 可以locally表示成differential 1-form的wedge product:  $\omega=\omega_I dx^I=\sum_{1\le i_1<i_2<\cdots<i_m\le n}\omega_{i_1i_2\cdots i_k} dx^1\wedge dx^2\wedge\cdots\wedge dx^m$ ([multi-index notation](https://en.wikipedia.org/wiki/Differential_form) )
		-  $\lbrace dx^i \rbrace_i$ 是Differential 1-form $T_p^\ast M$ 的basis, n是manifold M的dimension
		-  $\wedge$ 是[exterior wedge product](https://en.wikipedia.org/wiki/Exterior_algebra) 
			-  $\omega_1\wedge \omega_2(\xi_{\sigma_1},\xi_{\sigma_2},\cdots,\xi_{\sigma_{m_1+m_2}}) = \sum_{\sigma\in S_{m_1+m_2}}\frac{(-1)^\sigma}{m_1 ! m_2 !} \omega_1(\xi_{\sigma_1},\xi_{\sigma_2},\cdots,\xi_{\sigma_{m_1}})\cdot\omega_2(\xi_{\sigma_1+1},\cdots,\xi_{\sigma_{m_1+m_2}})$     
			- m个1-form的wedge product: $\omega_1\wedge\omega_2\wedge\cdots\wedge\omega_m(\xi_1,\xi_2,\cdots,\xi_m)=det(\vert\omega_i(\xi_j)\vert_{ij})$ 
				- $\wedge$ 是 anti-symmetric: $\omega_{\sigma_1}\wedge \omega_{\sigma_2}\wedge\cdots\wedge\omega_{\sigma_m}=(-1)^\sigma \omega_1\wedge\omega_2\cdots\wedge\omega_k$  
				- 对参数也是skew-symmetric: $\omega(\xi_{\sigma_1},\xi_{\sigma_2},\cdots,\xi_{\sigma_m})=\omega_1\wedge\omega_2\wedge\cdots\wedge\omega_m(\xi_{\sigma_1},\xi_{\sigma_2},\cdots,\xi_{\sigma_m})=(-1)^\sigma \omega(\xi_1,\xi_2,\cdots,\xi_m)$ 
	- exterior m-form可以做pull-back


		



