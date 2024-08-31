---
layout: post
title: conformal geometry学习 (八 ) -- Persistent homology
categories:
  - math
  - algorithm
tags:
  - content
last_modified_at: 2024-08-30T15:31
created: 2024-08-07T09:10
---

一种计算 $H_k(\Sigma,\mathbb Z_2)$ 的方法, 计算filtration $\mathbb K$ 中homology的变化

- Persistent Homology $H_k^{l,p}=H_k(\mathbb K_{l+p},\mathbb Z_2)=\frac{Z^l_k}{B_{k}^{l+p}\cap Z^l_k}$   
	- k-th homology: 和$\mathbb K$ 中 (k-1)-simplex, k-simplex, (k+1)-simplex部分有关
	-  $\mathbb K$ 中到第l 个simplex cycle和到第(l+p) 个 simplex的image
		- 一般到第l 个是 k-simplex, l 到 (l+p) 个是(k+1)-simplex


## filtration定义

- filtration: $\emptyset=\mathbb K_{-1}\subset \mathbb K_0\subset \mathbb K_1\subset\cdots\subset \mathbb K_n=\mathbb K$ 是simplicial complex的序列
	- 每个$\mathbb K_{i}$ 在$\mathbb K_{i-1}$ 基础上添加一个simplex $\sigma_i$ 
	-  单调性(monotonous): 添加$\sigma_i$ 的顺序是包含关系, 每个$\sigma$ 的face都在它前面
- induced p阶homology group 的map序列: $0=H_p(\mathbb K_{-1})\rightarrow H_p(\mathbb K_0)\rightarrow \cdots \rightarrow H_p(\mathbb K_n)=H_p(\mathbb K)$ 

### 点云 -> Čech Complex filtration

![Persistent homology classification algorithm.jpg]({{ '/docs/attachment/Persistent homology classification algorithm.jpg' | relative_url }}){:width="500"}
- [Čech complex](https://en.wikipedia.org/wiki/Čech_complex)  $\mathcal C_\epsilon$ : 把点云中 $\epsilon/2$ 球相交的点相连得到的simplicial complex
	- [Vietoris-Rips Complex](https://en.wikipedia.org/wiki/Vietoris–Rips_complex) $\mathcal R_\epsilon$ : 把点云中距离< $\epsilon$ 的点相连得到的simplicial complex($\mathbb R^n$ 中两种定义等价)

## filtration同调分解

**新添加的simplex分为两种: 1. 构成cycle的 2. 不构成cycle的**

- **positive(generator, creator)**: k-simplex $\sigma_i\subset$ 一个 k-cycle $c_i$ 
	- 相当于, $\sigma_i$ 是**构成 k-cycle $c_i$的最后一个边**(youngest)
	- 添加到$\sigma_i$ 的时候还没有 (k+1)-simplex 呢, 所以 $c_i$ 是non-exact的
	- 可以让 $c_i$ 只包含$\sigma_i$ 一个positive k-simplex (lemma)
		- 归纳法证明: 如果包含其他 positive  $\sigma_j$ 出现在$\sigma_i$ 之前, 把当时对应的cycle $c_j$ 只包含$\sigma_j$ 一个positive, 让$c_i\texttt{ += }c_i+c_j$ 
	-  $[c_i]$ 是构成$H_k(\mathbb K_i)$ 的basis
- **negative(killer)**: 
	- killer 导致前面相邻的(k-1)-simplex 变成boundary(kill行为)
	- 和其**kill掉的最近(youngest)的positive (k-1)-simplex组成一对pair**
		- kill掉的 (k-1)-simplex 不一定和killer直接相邻

**youngest positive simplex  在同调等价类中传递**

- Collision lemma: 一对generator,killer pair $(\sigma_i,\sigma_j)$ , 如果$e$ 是Collision Free Cycle, 并且$[e]=[\partial \sigma_j]$ (和$\partial \sigma_j$ 同调等价) -> $e$ 的youngest positive simplex也是 $\sigma_i$ .
	- Collision Free Cycle: 里面的最近的generator还没被kill
	-  $e$ 的youngest positive simplex如果不在$\partial \sigma_j$ 中, 就在另一个更早出现的$\partial \sigma$ 里, 和Collision Free 矛盾. (证明没懂)

**同调分解**

- $rk(H_k(\mathbb K,\mathbb Z_2))=pos_k-neg_{k+1}$ 
	- 每个新出现的**positive simplex对应linearly indepdent cycle**
		- $\mathbb Z_2$-module里, linearly depdent的意思是 $c=\sum_i c_i$ 
		- 就是说 $c$ 的youngest simplex $\sigma$ 肯定在某个之前的$c_i$ 里, 但是$\sigma$ 是刚出来的, 所以不可能
	- 每个新添加的**negative (k+1)-simplex -> 对应killed k-positive simplex -> 对应kill linearly indepdent cycle**
- $num_k = pos_k + neg_k = rk(Z_k) + rk(B_k)$  
	- 用incidence matrix $M$ 表示(k-1)-simplex $\times$ k-simplex 的相连关系
		- $M$ 的列数 $num_k$ 为 $\mathbb K$ 中添加的 k-simplex的个数: 不是positive, 就是negative
		- 每个新出现的positive simplex对应linearly indepdent cycle
			- 经过column operation会变成0
			-  $rkM-rkB_p=rk Z_p=pos_k$  
		- 每个新添加的negative simplex对应killed (k-1)-simplex: pair
			-  $rk M = rk B_p=neg_k$ 
	- 计算同调群需要计算两个incidence matrix : (k-1)-simplex $\times$ k-simplex 和 k-simplex $\times$ (k+1)-simplex, 以得到$rk Z_k$ 和$rk B_{k+1}$ 

**记号**

- $\Gamma(d)$ : 被killer $d$ kill掉的generator 
- persistence life: $j-i-1$ , 从simplex $\sigma_i$  generated 到被 $\sigma_j$ kill的时间
	- 表示了$\sigma_i$ 对应cycle $c_i$ 的拓扑稳定性

## Pair Algorithm 计算

计算每个simplex的生命周期

- 输入: filtration 当前的simplex $\sigma$
- 输出: 判断$\sigma$ 是generator还是killer, 如果是killer, 记录它的pair

- plain(Algorithm1):
	- 记录cycle $c=\partial \sigma=\sum_i \tau_i$ 
		- 检查里面最近的(youngest) positive $\tau$ ((k-1)-simplex)
			- 如果 $\tau$ 还没被kill过, $(\tau,\sigma)$ 组成pair, 记录$\tau$ 的killer为$\sigma$ 
			- 如果$\tau$ 已经被其他killer kill过
				- 不停往前追踪, 用$\tau$ 对应的killer(的boundary cycle)更新 $c$ 的表达
					- 更新过的$c$ 的simplex全比 $\tau$ older(检查的simplex越来越往前-> 算法肯定能停止)
					- 如图, $\partial e_5=v_4+v_0$ , 最新点 $v_4$ 已经被$e_3$ kill, 得到$\partial e_5=v_3+v_0$, 一直往前追踪, 得到$\partial e_5=v_0+v_0=0$  
	-  如果追踪到最后结果为0 -> $\sigma$ 是generator
- 优化1(Algorithm2, 用空间换时间): 
	- 在generator被kill时, 同时记录当时对应的boundary cycle $\Lambda_\tau$  
		- 在pair不相邻时节省计算时间
- 并行计算(代数方法): 步骤数=追踪的最长链路?
	- incidence matrix: k-simplex $\times$ (k+1)-simplex 的相连关系
		- 检查每列值为 1 最后一行 (即对应的youngest simplex)
			- 如果在之前列出现相同的index, 用前面的列更新后面的列(cycle更新的过程)
		- 直到所有非0的列的最后一行index都不一样
			- 全是0的列对应generator
			- 非零的列和最后一行index对应pair



## pair graph

- 下标表示在filtration中的前后关系.
- 蓝色表示killer, 红色表示generator, 弧线表示kill关系. 

![Pasted image 20240821180208.png]({{ '/docs/attachment/Pasted image 20240821180208.png' | relative_url }}){:width="138"}  ![Pasted image 20240822181442.png]({{ '/docs/attachment/Pasted image 20240822181442.png' | relative_url }}){:width="150"}  ![Pasted image 20240821175655.png]({{ '/docs/attachment/Pasted image 20240821175655.png' | relative_url }}){:width="300"} 
- topological annulus(环带, cylinder)
- $H_0$ 的生成元是$v_0$ 
- $H_1$ 的生成元是$e_2$ (对应cycle $e_0+e_1+e_2$ )


![Pasted image 20240821175958.png]({{ '/docs/attachment/Pasted image 20240821175958.png' | relative_url }}){:width="100"}  ![Pasted image 20240822181535.png]({{ '/docs/attachment/Pasted image 20240822181535.png' | relative_url }}){:width="150"}  ![Pasted image 20240821175901.png]({{ '/docs/attachment/Pasted image 20240821175901.png' | relative_url }}){:width="300"} 

- topological torus
- $H_0$ 的生成元为 $v_0$ 
- $H_1$ 的生成元为$e_3$( 对应cycle $e_0+e_1+e_2+e_3$) , $e_{20}$ (对应cycle $e_{12}+e_{16}+e_{20}$) 

![Pasted image 20240822194920.png]({{ '/docs/attachment/Pasted image 20240822194920.png' | relative_url }}){:width="150"}  ![Pasted image 20240822194939.png]({{ '/docs/attachment/Pasted image 20240822194939.png' | relative_url }}){:width="200"} 

- topological quadrilateral(四边形)
- $H_0$ 的生成元为$v_0$ , $H_1$ 的生成元为$e_{11}$ 

### 应用


- 计算oriented surface的homology: $H_1(S)\cong H_1(I)\oplus H_1(O)$ ([Mayer–Vietoris_sequence](https://en.wikipedia.org/wiki/Mayer–Vietoris_sequence))
	- 用persistent homology计算$H_1(I)$ 和$H_1(O)$ 的生成元
	- $H_1(S,\mathbb Z_2)$ 和$H_1(S,\mathbb Z)$ 有相同的生成元? 
- 计算三流型的homology: $H_1(M,\mathbb Z_2)\cong H_2(M,\partial M,\mathbb Z_2)$ (Lefschetz duality)

- persistent diagram: 也可以只取k-simplex的部分
	- simplex 添加时间 x simplex death(被kill) 时间 $(i,j)$ 
	- simplex 添加时间 x simplex 的persistence life $(i,j-i-1)$ 
- persistent surface: 
	-  persistent diagram连续化: 把persistent diagram上的点 $(i,j-i-1)$ 用在位置 $(i,j-i-1)$ , 方差为$\sigma$ 的高斯分布替代
- persistent image: persistent surface像素化得到persistent image

- DNA序列的linked twist map形成一个二维的点集. 用persistent image提取特征再做分类.
- 解Kuramoto-Sivashinsky (KS) PDE
	- 是二维的heat image
	- 根据不同的heat threshold(等高线), 构成image的子集的filtration
		- 把image的像素点看成0-simplex,  相邻像素看成1-simplex, 周围2x2像素看成2-simplex
	- 用filtration生成的persistent image做为特征分类

- barcode: 横坐标 为距离 $\epsilon$ , 纵坐标为 homology的persistence life

- 自然图像: 3x3的灰度图patch, 看作9-dim的点云, 形成一个Klein bottle的拓扑
- 时间序列的周期性
	- 每个长为$M$, 间隔为$\tau$ 的sliding window构成一个M维vector, 改变时间t, 得到$\mathbb R^M$ 里的一个点云
	- 检查这个设置下, persistence diagram中最长的persistence life作为这个周期($M,\tau$ ) 的分数
	- 分数越高, 说明点云在$\mathbb R^M$ 里(拓扑意义上)越像一个closed loop, 和时间序列本身的周期越匹配





[1]  Carlsson, Gunnar. “Topological Pattern Recognition for Point Cloud Data.” _Acta Numerica_ 23 (May 2014): 289–368. [https://doi.org/10.1017/S0962492914000051](https://doi.org/10.1017/S0962492914000051).

[2]  Perea, Jose, and John Harer. “**Sliding Windows and Persistence**: An Application of Topological Methods to Signal Analysis.” arXiv, November 25, 2013. [https://doi.org/10.48550/arXiv.1307.6188](https://doi.org/10.48550/arXiv.1307.6188).

[3]  Adams, Henry, Sofya Chepushtanova, Tegan Emerson, Eric Hanson, Michael Kirby, Francis Motta, Rachel Neville, Chris Peterson, Patrick Shipman, and Lori Ziegelmeier. “Persistence Images: A Stable Vector Representation of Persistent Homology.” arXiv, July 11, 2016. [https://doi.org/10.48550/arXiv.1507.06217](https://doi.org/10.48550/arXiv.1507.06217).

[4] https://github.com/ctralie/TDALabs/blob/master/SlidingWindow2-PersistentHomology.ipynb 

[5] https://ripser.scikit-tda.org/en/latest/ 计算persistent homology的python封装包