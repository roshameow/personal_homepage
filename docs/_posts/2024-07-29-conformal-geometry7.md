---
layout: post
title: conformal geometry学习 (七 ) -- Duality
categories: 
tags:
  - content
last_modified_at: 2024-07-29T21:13:37-08:00
---
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
- closed oriented 三流型$M$, $H_0(M)=H_3(M)=\mathbb Z$. $H_2(M)=H^1(M)$.