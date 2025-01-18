---
layout: post
title: conformal geometry学习 (十一 ) -- harmonic map
categories:
  - math
tags:
  - content
last_modified_at: 2024-12-26T18:05
created: 2024-11-24T09:43
---

在复分析里被研究很多
## 平面[调和函数](https://en.wikipedia.org/wiki/Harmonic_function)性质

<a href="https://upload.wikimedia.org/wikipedia/commons/c/cd/Laplace%27s_equation_on_an_annulus.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Laplace%27s_equation_on_an_annulus.svg" width="250"></a>


平面区域 $\Omega\subset \mathbb R^2$ 

- **调和函数 $f$ 使调和能量最小**: $f=\text{argmin}_f E(f)$ 
	- (满足$\Delta_g f=0$ ) 
	- $E(f)=(\nabla_g f,\nabla_g f)=\int_M \langle\nabla_g f,\nabla_g f\rangle_g\omega_g$
- (regularity, smoothness) 调和函数在开集是$C^\infty$ (无穷可导) 的
- **(Mean Value property) 调和函数 $f$  沿一个点周围一圈的平均值等于在这个点取值** 
- **(Maximum principle) 调和函数 $f$  的最大, 最小值只能是在边界上**
	- 反证法: 如果$\Omega$ 内部有个最值$p$ , 会违背mean value property
- **(Uniqueness, 唯一性) 两个调和函数 $u_1,u_2$ 在边界上取值相等 -> 两个函数相等.**
	- $u_1-u_2$ 在$\partial \Omega$ 上全是0 -> $u_1-u_2$ 的最大值, 最小值都是0 -> $u_1-u_2\equiv 0$  


### 一般Riemann曲面到平面凸区域的调和映射

$\phi:(S,\mathbf g)\rightarrow (\Omega,du^2+dv^2)$ 

- (Rado Theorem) 调和映射$\phi$ 在边界 $\partial S\rightarrow \partial \Omega$ 上是 homoemorphic(同胚)  -> $\phi$ 在S 内部是diffeomorphic的