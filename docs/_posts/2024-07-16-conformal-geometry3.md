---
layout: post
title: conformal geometry学习 (三 ) -- Knot
categories:
  - math
tags:
  - content
  - knot
  - isotopic
  - genus
  - Trichotomy
  - 3-manifold
  - Seifert_surface
  - fundamental_group
last_modified_at: 2024-07-22T08:53:23-08:00
---
## Knot ($K: \mathbb S^1\rightarrow \mathbb R^3$ )

- 等价关系(isotopic, 同位, $K_1\cong_{isotopic} K_2$ ): 存在homeomorphism(同胚)映射 $f:\mathbb R^3\rightarrow \mathbb R^3$, 把$K_1$ 映到 $K_2$ .
- 全部knot都和$\mathbb S^1$ 是homeomorphism(同胚)
- [Planar Diagram](https://katlas.org/wiki/Planar_Diagrams) : knot在平面的投影, 记录方向和重叠部分的上下关系
	- 同个knot的Planar Diagram可能有多种不同形式


### 判断两个knot等价(isotopic)

####  [Reidemeister move](https://mathworld.wolfram.com/ReidemeisterMoves.html) (组合方法)

$K_1$ 的diagram由$K_2$ 的diagram经由四种基本移动变换得来 <-> $K_1\cong_{isotopic} K_2$

- 对Planar diagram的intersection做四种基本移动变换: (twist, untwist), (poke,unpoke), slide, straighten
- Np-hard 走的步数是节点数的指数倍?

#### Gordon-Luecke定理(几何方法)

$K_1$  的补空间(3-manifold)和$K_2$ 的补空间同胚, 即 $(\mathbb R^3- K_1)\sim (\mathbb R^3-K_2)$  <-> $K_1\cong_{isotopic} K_2$

-  用Wirtinger表示 计算 $\pi_1(\mathbb R^3-K)$ ( 同胚<-> 基本群相同): 
	- 每个segment提供 ![Pasted image 20240721040411.png]({{ '/docs/attachment/Pasted image 20240721040411.png' | relative_url }}){:width="200"} generators: $\lbrace x_1,x_2,\cdots,x_n\rbrace$ 
	- 每个crossing提供 ![Pasted image 20240721040312.png]({{ '/docs/attachment/Pasted image 20240721040312.png' | relative_url }}){:width="200"} relation: $x_i\cdot x_k=x_k\cdot x_{i+1}$ (按照generator方向)
		- relation会因为相互关联而化简


### knot genus

- **knot genus** 定义为Seifert surface中最小的genus: $g(K)=\min g(\Sigma)$ 
	- 其中[Seifert surface](https://en.wikipedia.org/wiki/Seifert_surface) 是orientable曲面$\Sigma_K$ , 使knot $K$是曲面的边界: $\partial \Sigma=K$ 
	- 因为diagram不同, 有多种不同的Seifert surface, 计算knot的genus是一个Np-hard问题

- 从diagram $D$ 构造Seifert surface $\Sigma_D$ :
	- 方法: 给diagram一个orientation -> 沿crossing 分开成Seifert cycles -> 每个cycle填充disk -> 在crossing处加入twist
	- **Seifert Surface的genus** $g(\Sigma_D)=\frac{1-s+n}{2}$ 
		- $s$ 是Seifert cycles的个数, n 是crossing的个数

- [connected sum](https://mathworld.wolfram.com/KnotSum.html#:~:text=Two%20oriented%20knots%20(or%20links,40).) $K_1 \texttt{\#} K_2$ 
	- <a href="https://mathworld.wolfram.com/KnotSum.html#:~:text=Two%20oriented%20knots%20(or%20links,40)."><img src="https://mathworld.wolfram.com/images/eps-svg/KnotSum_700.svg" alt="torus_sum.png"  width="200"></a> 把$K_1$, $K_2$ 沿某个点切开, 粘在一起
	- **connect sum的genus**: $g(K_1 \texttt{\#} K_2)=g(K_1)+g(K_2)$ 

### knot分类(Trichotomy,三分法)

所有knot都属于torus knot, Satellite Knot, hyperbolic Knot三类

-  **[torus knot](https://en.wikipedia.org/wiki/Torus_knot)**: knot embed在torus的**表面**上
	- (p, q)-torus knot: p是绕中间tunnel的圈数, q是绕handle的圈数(数crossing上下的规律)
		- (3, 2)-knot(trefoil): <a href="https://commons.wikimedia.org/wiki/File:Trefoil_knot_left.svg#/media/File:Trefoil_knot_left.svg"><img src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Trefoil_knot_left.svg" alt="Trefoil knot left.svg" width="100"></a> (8,3)-knot: <a href="https://commons.wikimedia.org/wiki/File:TorusKnot-3-8.png#/media/File:TorusKnot-3-8.png"><img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/TorusKnot-3-8.png" alt="TorusKnot-3-8.png"  width="100"></a> 
- **[Satellite Knot](https://en.wikipedia.org/wiki/Satellite_knot)**: knot $K$ embed在一个torus knot $J$ **里面**(大肠套小肠), 记作$Sat_J(K)$ 
	- 分类:
		- cable knot: 里面的knot $K$ 也是一个torus knot
			- ![Pasted image 20240720115608.png]({{ '/docs/attachment/Pasted image 20240720115608.png' | relative_url }}){:width="100"} 
		- connected sum(composite knots): $K_1 \texttt{\#} K_2$ 
			- swallow-follow: $K_1$(Figure 8) 看起来像是被$K_2$ (trefoil) swallow
				- ![Pasted image 20240720120425.png]({{ '/docs/attachment/Pasted image 20240720120425.png' | relative_url }}){:width="150"} 
		- Whitehead doubles: 里面的knot $K$ 是 $S_1$ 经过一些twist首尾相连
			- ![Pasted image 20240720120404.png]({{ '/docs/attachment/Pasted image 20240720120404.png' | relative_url }}){:width="100"} 或, <a href="https://www.researchgate.net/figure/A-Whitehead-double-of-a-trefoil-knot-is-a-satellite-knot-whose-companion-knot-is-a_fig10_339015556"><img src="https://www.researchgate.net/profile/Makoto-Sakuma/publication/339015556/figure/fig10/AS:897362012680193@1590959184100/A-Whitehead-double-of-a-trefoil-knot-is-a-satellite-knot-whose-companion-knot-is-a.png" alt="Seiferthomologypushoff.png" width="100"></a> 
- **[hyperbolic Knot](https://mathworld.wolfram.com/HyperbolicKnot.html)**: knot的补空间有一个complete, finite volume的双曲度量, 即补空间是hyperbolic 3-manifold(双曲三流型)
	- 例如Figure 8 knot



### 例子: [Figure 8 Knot](https://mathworld.wolfram.com/FigureEightKnot.html) 

**Seifert surface和genus**

Planar Diagram: <a href="https://mathworld.wolfram.com/FigureEightKnot.html"><img src="https://mathworld.wolfram.com/images/eps-svg/FigureEightKnot_700.svg"  width="100" style="transform: rotate(180deg);"></a>  -> Orientation: ![Pasted image 20240720153513.png]({{ '/docs/attachment/Pasted image 20240720153513.png' | relative_url }}){:width="100"} -> Seifert Cycles: ![Pasted image 20240720153554.png]({{ '/docs/attachment/Pasted image 20240720153554.png' | relative_url }}){:width="100"} -> Fill Cycles: ![Pasted image 20240720153643.png]({{ '/docs/attachment/Pasted image 20240720153643.png' | relative_url }}){:width="100"} -> Add twists: ![Pasted image 20240720153817.png]({{ '/docs/attachment/Pasted image 20240720153817.png' | relative_url }}){:width="100"} -> Seifert surface:  <a href="https://en.wikipedia.org/wiki/File:Seiferthomologypushoff.png#/media/File:Seiferthomologypushoff.png"><img src="https://upload.wikimedia.org/wikipedia/en/9/91/Seiferthomologypushoff.png" alt="Seiferthomologypushoff.png" width="150" style="transform: rotate(135deg);"></a>

- 见图示, 有3个Seifert Cycles和4个crossing
- $g(\Sigma_D)=\frac{1-3+4}{2}=1$ 

**Wirtinger表示**

![Pasted image 20240720163841.png]({{ '/docs/attachment/Pasted image 20240720163841.png' | relative_url }}){:width="150"} 

- 见图示, 4个segment对应生成元$x_1,x_2,x_3,x_4$ , 4个crossing对应relation $c_1: x_4x_3=x_3x_1$, $c_2:x_2x_1=x_1x_3$, $c_3:x_2x_4=x_4x_1$, $c_4: x_4x_2=x_2x_3$  
- 化简得, 补空间的基本群 : $\pi_1(S^3-K)=<a,b\vert\ yay^{-1}=b>$ 
	- 其中, $a=x_2, b=x_4$ , $y=[a^{-1},b]=a^{-1}bab^{-1}$ 
- 得到$\mathbb H^3$ 的tessellation: $a\mapsto A=\begin{bmatrix}1&-1\\\ 0&1\end{bmatrix}$ , $b\mapsto B=\begin{bmatrix}1&0 \\\ -\sigma & 1\end{bmatrix}$ 
	- 其中,  根据relation解得,  $\sigma=\frac{-1\pm i\sqrt{3}}{2}$ 
	- 其映射: $\pi_1(S^3-K)\rightarrow Deck(\widetilde{S^3-K})\rightarrow \text{Isom}^{+}(\mathbb H^3)=PSL_2(\mathbb C)$ 
		- $\widetilde{S^3-K}$ 是3-manifold $S^3-K$ 的universal covering space
		- $\mathbb H^3$(Poincaré half-space) 是上半空间$\mathbb H^3=\lbrace(x,y,t)\vert\ t>0\rbrace$, 有双曲度量 $ds^2=\frac{dx^2+dy^2+dt^2}{t^2}$ 
			- 是一个双曲三流型
			- boundary $\partial \mathbb H^3=\mathbb C\cup\infty$ 又叫sphere at infinity
		- $PSL_2(\mathbb C)$ 在$\mathbb C\cup \infty$ 上是[Möbius transforms](https://en.wikipedia.org/wiki/Möbius_transformation) 




## reference
<span id="ref"></span>

[1] https://www.math.ucdavis.edu/~jcs/pubs/satelliteknots.pdf satellite knot

[2] Coward, Alexander, and Marc Lackenby. “An Upper Bound on **Reidemeister Moves**.” _American Journal of Mathematics_ 136, no. 4 (2014): 1023–66.

[3] “Tracefieldsknotes.Pdf.” Accessed July 20, 2024. [https://julianlyczak.nl/seminar/knots2016-files/tracefieldsknotes.pdf](https://julianlyczak.nl/seminar/knots2016-files/tracefieldsknotes.pdf). 双曲结构

