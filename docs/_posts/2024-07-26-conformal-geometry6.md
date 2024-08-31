---
layout: post
title: conformal geometry学习 (六 ) -- cohomology group
categories:
  - math
tags:
  - content
last_modified_at: 2024-08-26T13:29
created: 2024-07-26T12:34
---
上同调是同调的对偶

| 同调 homology                                                                    | 上同调 [(Simplicial) cohomology](https://en.wikipedia.org/wiki/Cohomology)<br><br>最初是为了表示[stiefel whitney class](https://en.wikipedia.org/wiki/Stiefel–Whitney_class.) | 对偶记号                                                                                                                      | tangent space | de Rham cohomology<br><br>$\Omega^k(\Sigma)$                                                        | 积分记号                                                                                                          |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| k-chain $\sigma$ <br>$C_k$                                                     | k-cochain(k-form) $\omega$ <br>$C^k$                                                                                                                                | bilinear operator<br>$<\omega,\sigma>:=\omega(\sigma)$                                                                    |               | Differential 1-form<br>co-tangent space<br>                                                         |                                                                                                               |
| (k+1)-boundary<br>$\partial_{k+1}:C_{k+1}\rightarrow C_{k}$                    | k-coboundary(微分算子)<br>$\delta_k: C^k\rightarrow C^{k+1}$<br>$\delta_k(\omega)=\omega\circ \partial_{k+1},\omega\in C^k$                                             | $<\delta\omega,\sigma>=<\omega,\partial\sigma>$ <br><br>[Stokes Theorem](https://en.wikipedia.org/wiki/Stokes%27_theorem) |               | exterior differential<br> operator(外微分算子)<br>$d^k:\Omega^k(\Sigma)\rightarrow \Omega^{k+1}(\Sigma)$ | $\int_{\partial M}\omega=\int_M d\omega$<br>[Stokes Theorem](https://en.wikipedia.org/wiki/Stokes%27_theorem) |
| adjoint boundary<br>operator<br>$\partial_{k+1}^\ast:C_{k}\rightarrow C_{k+1}$ |                                                                                                                                                                     |                                                                                                                           |               | codifferential operator<br>$\delta:\Omega^k(\Sigma)\rightarrow \Omega^{k-1}(\Sigma)$                |                                                                                                               |
|                                                                                | closed form $\delta_k\omega=0$                                                                                                                                      |                                                                                                                           |               | closed form $d^k\omega=0$                                                                           |                                                                                                               |
|                                                                                | exact form $\omega=\delta_{k-1}\sigma$                                                                                                                              |                                                                                                                           |               | exact form $\omega=d^{k-1}\sigma$                                                                   |                                                                                                               |
| $H_n$<br>closed, but not exact                                                 | $H^n=\frac{\text{ker}\delta^n}{\text{img}\delta^{n-1}}$ <br>curl free, but not =gradient                                                                            |                                                                                                                           |               | $H^n_{dR}$                                                                                          |                                                                                                               |
| $f_\ast: H_n(M)\rightarrow H_n(N)$                                             | $f^\ast: H^n(N)\rightarrow H^n(M)$<br>是$f_\ast$ 的pull back                                                                                                          |                                                                                                                           |               |                                                                                                     |                                                                                                               |


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




