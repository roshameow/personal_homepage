---
layout: post
title: persistent homology 事例 + 应用
categories:
  - algorithm
tags:
  - content
last_modified_at: 2024-09-02T19:49
created: 2024-09-01T11:38
---
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

## 记号

- $\Gamma(d)$ : 被killer $d$ kill掉的generator 
- persistence life: $j-i-1$ , 从simplex $\sigma_i$  generated 到被 $\sigma_j$ kill的时间
	- 表示了$\sigma_i$ 对应cycle $c_i$ 的拓扑稳定性

- **persistent diagram**: 也可以只取k-simplex的部分
	- simplex 添加时间 x simplex death(被kill) 时间 $(i,j)$ 
	- simplex 添加时间 x simplex 的persistence life $(i,j-i-1)$ 


- **[barcode](https://en.wikipedia.org/wiki/Persistence_barcode)** : 横坐标 为距离 $\epsilon$ , 每个bar表示positive simplex的添加时间 -- 死亡时间
	- 某个横坐标处 bar的个数为 betti number:  $b_k(\mathbb K)=rk(H_k(\mathbb K,\mathbb Z_2))=pos_k-neg_{k+1}$ 
	- 每个出现的long bar表示了一个持续时间长的cycle(稳定的特征)

## 应用

 - [ ] 待实现 

### **计算homology的生成元**

- 计算oriented surface的homology: $H_1(S)\cong H_1(I)\oplus H_1(O)$ ([Mayer–Vietoris_sequence](https://en.wikipedia.org/wiki/Mayer–Vietoris_sequence))
	- 用persistent homology计算$H_1(I)$ 和$H_1(O)$ 的生成元
		- 需要0-1 incidence matrix 和 1-2 incidence matrix
		- 把$I$ 和$O$ 用[tetGen](https://wias-berlin.de/software/index.jsp?id=TetGen&lang=1) 的方法生成四面体剖分
	- $H_1(S,\mathbb Z_2)$ 和$H_1(S,\mathbb Z)$ 有相同的生成元? 
- 计算三流型的homology: $H_1(M,\mathbb Z_2)\cong H_2(M,\partial M,\mathbb Z_2)$ (Lefschetz duality)


### **分析点云的结构** 

比起其他方法更不依赖嵌入, 有更强的稳定性

- 自然图像分布: 3x3的high-contrast(用variance衡量)灰度图patch $\mathcal M$ , 看作$\mathbb R^9$ 中的点云
	- 对patch做normalization, 使mean=0, var=1.:  $\mathcal M\subset E^7\subset \mathbb R^9$  
	- 取$\mathcal M$ 的 $5\times 10^4$ 个sample set $X$ , 取$X(k,p)$ 是X中k-邻域半径较大的 $p$ percent 的那些点
		-  如果k-邻域半径小, 说明附近点很密集, 可以被忽略...
	- 调整k, p到合适的数据, 观察barcode, 形成一个Klein bottle的拓扑
	- 目的是: 理解patch的分布, 和做image compresion? 
- 时间序列的周期性: 每个长为$M$, 间隔为$\tau$ 的sliding window构成一个M维vector, 改变时间t, 得到$\mathbb R^M$ 里的一个点云
	- 检查这个设置下, persistence diagram中最长的persistence life作为这个周期($M,\tau$ ) 的分数
	- 分数越高, 说明点云在$\mathbb R^M$ 里(拓扑意义上)越像一个closed loop, 和时间序列本身的周期越匹配

### **提取特征**

- persistent surface: 
	-  persistent diagram连续化: 把persistent diagram上的点 $(i,j-i-1)$ 用在位置 $(i,j-i-1)$ , 方差为$\sigma$ 的高斯分布替代
- persistent image: persistent surface像素化得到persistent image

- DNA序列的linked twist map形成一个二维的点集. 用persistent image提取特征再做分类.
- 解Kuramoto-Sivashinsky (KS) PDE
	- 是二维的heat image
	- 根据不同的heat threshold(等高线), 构成image的子集的filtration
		- 把image的像素点看成0-simplex,  相邻像素看成1-simplex, 周围2x2像素看成2-simplex
	- 用filtration生成的persistent image做为特征分类

## reference

[1]  Carlsson, Gunnar. “Topological Pattern Recognition for **Point Cloud Data.**” _Acta Numerica_ 23 (May 2014): 289–368. [https://doi.org/10.1017/S0962492914000051](https://doi.org/10.1017/S0962492914000051).  

[2]  Perea, Jose, and John Harer. “**Sliding Windows and Persistence**: An Application of Topological Methods to Signal Analysis.” arXiv, November 25, 2013. [https://doi.org/10.48550/arXiv.1307.6188](https://doi.org/10.48550/arXiv.1307.6188).

[3]  Adams, Henry, Sofya Chepushtanova, Tegan Emerson, Eric Hanson, Michael Kirby, Francis Motta, Rachel Neville, Chris Peterson, Patrick Shipman, and Lori Ziegelmeier. “**Persistence Images**: A Stable Vector Representation of Persistent Homology.” arXiv, July 11, 2016. [https://doi.org/10.48550/arXiv.1507.06217](https://doi.org/10.48550/arXiv.1507.06217).

[4] https://github.com/ctralie/TDALabs/blob/master/SlidingWindow2-PersistentHomology.ipynb 

[5] https://ripser.scikit-tda.org/en/latest/ **计算persistent homology的python封装包**