---
layout: post
title: "conformal geometry学习 (十 ) -- 举例: 球面上的unit tangent bundle manifold"
categories:
  - math
tags:
  - content
last_modified_at: 2024-10-24T16:12
created: 2024-10-09T09:51
---
## atlas

| 结构                                         | 条件                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| manifold                                   | $U_\alpha$ homeomorphism to $\mathbb R^n$,                                                                              |
| smooth manifold<br>(differential manifold) | transition map $\phi_{\alpha\beta}\in C^\infty(\mathbb R^n)$ smooth                                                     |
| Riemann surface                            | 每片是 2-dim<br>transition map 是biholomorphic(conformal)<br>atlas $\lbrace(U_\alpha,z_\alpha)\rbrace$ 叫conformal structure |

- 有T-juction的graph(比如“日” 字形的graph)是一个单纯复形, 但不是1-manifold

## 球面上的unit tangent bundle manifold([UTM](https://en.wikipedia.org/wiki/Unit_tangent_bundle))参数化构造

球面上的unit tangent bundle $UTM(\mathbb S^2)$ 是一个3流型: 在一块上是$\mathbb D^1\times \mathbb S^1$ solid torus, 两块沿torus的边界粘在一起.


### 球面的atlas表示

![Pasted image 20241024160430.png]({{ '/docs/attachment/Pasted image 20241024160430.png' | relative_url }}){:width="300"}   ![Pasted image 20241024160403.png]({{ '/docs/attachment/Pasted image 20241024160403.png' | relative_url }}){:width="250"} 

- 球面的atlas表示: 把sphere $\mathbb S^2$ 分为上下两片, 用[球极投影](https://en.wikipedia.org/wiki/Stereographic_projection)的方式映射到$\mathbb R^2\cong \mathbb C$ , 在$\mathbb R^3$ 中嵌入的坐标为$(x_1,x_2,x_3)$ , 其$x_1^2+x_2^2+x_3^2=1$  
	- 去掉North-pole的一片, $(x_1,x_2,x_3)$ 对应坐标为$z=x+iy=\frac{x_1+ix_2}{1-x_3}$ ,或表示为 $(x,y)=(\frac{x_1}{1-x_3},\frac{x_2}{1-x_3})$ 
	- 去掉South-pole的一片, $(x_1,x_2,x_3)$ 对应坐标为$w=u+iv=\frac{x_1-ix_2}{1+x_3}$ ,或表示为 $(u,v)=(\frac{x_1}{1+x_3},\frac{-x_2}{1+x_3})$ 
	- 两片之间的transition map: $\frac{1}{z}: w$ 
		- $\frac{1}{z}=\frac{1-x_3}{x_1+ix_2}=\frac{(x_1-ix_2)(1-x_3)}{1-x_3^2}=\frac{x_1-ix_2}{1+x_3}=w$   
		-  $u+iv=\frac{x-iy}{x^2+y^2}$  
		- $(u,v)=(\frac{x}{x^2+y^2},\frac{-y}{x^2+y^2})$ 
	- 两片之间的Jacobian matrix: $w_z=-\frac{1}{z^2}$ 
		- $\begin{bmatrix}u_x & u_y \\\ v_x & v_y\end{bmatrix}=\frac{1}{(x^2+y^2)^2}\begin{bmatrix}y^2-x^2 & -2xy \\\ 2xy & y^2-x^2\end{bmatrix}$ 

### unit tangent bundle

 - [ ] 画图

- unit tangent bundle: 每个点处的fiber 是$\mathbb S^1$  
	- tangent vector的basis, $\partial_x=\frac{2}{(1+x^2+y^2)^2}(1-x^2+y^2,-2xy,2x)$ , $\partial_y=\frac{2}{(1+x^2+y^2)^2}(-2xy, 1+x^2-y^2,2y)$ 
		-  $(x_1,x_2,x_3)=(\frac{2x}{1+x^2+y^2},\frac{2y}{1+x^2+y^2},\frac{-1+x^2+y^2}{1+x^2+y^2})$ 
		- 另一片同理
	-  tangent vector有: $dw=w_zdz=-\frac{1}{z^2}dz$ 
		- 用$dz$ 表示坐标为 $z$ 处的一个tangent vector

### 在赤道处粘在一起

- 在赤道处粘在一起: 沿两片粘合的边界($\mathbb S^1$) 的unit tangent bundle 是torus $T^2$ , 坐标记为$(\theta,\tau)$ 
	- 球面两片: $z=e^{i\theta}\mapsto w=e^{-i\theta}$  
	- unit tangent vector: $e^{i\tau}\mapsto e^{i(\pi-2\theta+\tau)}$ 
	- 粘合的行为给出了torus的一个automophism $\phi$: $(\theta,\tau)\mapsto (-\theta, \pi-2\theta+\tau)$ 
		- 在universal covering上表示如图: 
			- ![Pasted image 20241022080313.png]({{ '/docs/attachment/Pasted image 20241022080313.png' | relative_url }}){:width="400"} 

### UTM沿fiber粘在一起

看成两个solid torus沿边界torus粘在一起

- $\phi$ induce了一个$\pi_1(T^2)$ 的自同构 $\phi_{\texttt{\#}}$: $a\mapsto a, b\mapsto a^{-2}b^{-1}$ 
	- $\pi_1(T^2)$ 的basis  $a: (0,s), s\in [ 0,1]$  , $b:(t,0), t\in [0,1]$  
		- 即 a 为$\theta=0$ 的fiber, b为$\tau=0$ 的section
	- a 有, $(0,s)\mapsto (0, \pi+s)$ 映射为 a 
	- b 有, $(t,0)\mapsto (-t,\pi-2t)$ 映射为$a^{-2}b^{-1}$  
	- 如图: ![Pasted image 20241021193648.png]({{ '/docs/attachment/Pasted image 20241021193648.png' | relative_url }}){:width="400"} 左图solid torus是去掉North-pole的一块的UTM, 右图是去掉South-pole的一块的UTM

### unit tangent bundle($UTM(\mathbb S^2)$)的fundamental group

$\pi_1(UTM(\mathbb S^2))=\mathbb Z_2$ 
- 在$\mathbb S^2$ 的其中一片上, UTM为$\mathbb D^2\times \mathbb S^1$ , 是solid torus, 记 $\pi_1(M_1)=\langle a_1\rangle$, $\pi_1(M_2)=\langle a_2\rangle$ 
	- $a_1, a_2$ 分别为两片上fiber的生成元
- 在粘合部分, UTM为$T^2$, $\pi_1(T^2)=\langle a,b\vert [a,b]\rangle$ 
	- 其中, $i(a)=a_1, j(a)=a_2$   
	- $i(b)=e$ , $j(b)=a_2^{-2}b^{-1}=a_2^{-2}$   
- 得到, $\pi_1(UTM(\mathbb S^2))=\langle a_1,a_2\vert a_1a_2^{-1}, a_2^{-2}\rangle=\mathbb Z_2$ 
	- $j(b)$ 在那块solid torus上$\nsim e$ , 构成拓扑障碍(obstruction)



## $UTM(\mathbb S^2)$ 和 $SO(3)$ 旋转群的关系

把旋转群 SO(3) 用轴角表示:  $(u,\theta)$  (转角$\theta$ 要求CCW, 即逆时针旋转)
- 转轴$u$ <-> 单位球面上一点
- 转角$\theta$ <-> 单位切丛的一个方向(fiber)

$\pi_1(SO(3))=\mathbb Z_2$  中的非零元素称为[自旋结构(spinor)](https://en.wikipedia.org/wiki/Spinor)  

<iframe width="560" height="315" src="https://www.youtube.com/embed/j5soqexrwqY?si=DEB4zYwtzIFTbRK5" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
- 在视频中有体现spinor的实验: 拖着水杯扭曲360度, 手臂扭曲, 2圈之后手臂可以恢复原位

3-manifold quaternion(4元数) 是SO3的universal cover, $\pi_1$ 是trival的


