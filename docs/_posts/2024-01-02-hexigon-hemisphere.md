---
layout: post
title: 用六边形构成半球
categories:
  - geometry
tags:
  - content
  - idea
  - 动漫
last_modified_at: 2024-01-13T17:51:32-08:00
---
刷到关于《葬送的芙莉莲》里面六边形魔法防御结界的讨论，根据[多面体欧拉公式](https://en.wikipedia.org/wiki/Euler_characteristic)，仅仅用正六边形是没法组成球体形状结界。我也非常理解制作组为什么不画个足球：毕竟是魔法阵，六边形画的又比较大，弄个五边形也不好看也不好解释。
![Pasted image 20240102192929.png]({{ '/docs/attachment/Pasted image 20240102192929.png' | relative_url }}){:width="500"} 

但是如果不是球，而是半球，不考虑边界是否完整，变形，肯定是可行的。因为半球$S^+$ 和disk $\mathbb{D}^1$， 和六边形边界的平面都是 [topological isomorphism](https://en.wikipedia.org/wiki/Homeomorphism) 的，在平面上能实现的密铺，变形到半球上当然也能实现。

另外，为了保证在3维上看起来不难看。用[Malley's Method](https://www.pbr-book.org/3ed-2018/Monte_Carlo_Integration/2D_Sampling_with_Multidimensional_Transformations#:~:text=The%20idea%20behind%20Malley%27s%20method,Figure%2013.14%3A%20Malley%27s%20Method.), 把disk看成半球的投影，实行$(r,\phi)=(\sin\theta,\phi)\rightarrow (\theta,\phi)$ 的变换，让六边形在$(\theta,\phi)$ 的坐标上是均匀的。
![Pasted image 20240102191540.png]({{ '/docs/attachment/Pasted image 20240102191540.png' | relative_url }}){:width="300"} 


## 画一个密铺六边形半球的步骤


### 用python画一个密铺的六边形：

![Pasted image 20240102191646.png]({{ '/docs/attachment/Pasted image 20240102191646.png' | relative_url }}){:width="200"} , 画上辅助线：![Pasted image 20240102191705.png]({{ '/docs/attachment/Pasted image 20240102191705.png' | relative_url }}){:width="200"} 

### 做变换

![Pasted image 20240102191731.png]({{ '/docs/attachment/Pasted image 20240102191731.png' | relative_url }}){:width="200"} 

- 这一步得到的是我们设想的半球面的投影, 看起来确实给人一种六边形能组成球形的错觉。。
- 另外，Photoshop里面球面化的滤镜，看起来效果差不多，可能也是用了这个变换。
	- ![Pasted image 20240102191855.png]({{ '/docs/attachment/Pasted image 20240102191855.png' | relative_url }}){:width="400"}  
- 又对比了一下原图，嗯？费伦的结界难道也是这么画的？

### 把得到的投影映射到半球

转到侧面看下：![Pasted image 20240102192405.png]({{ '/docs/attachment/Pasted image 20240102192405.png' | relative_url }}){:width="200"}   

看起来确实挺正常的，当然，这样的两个半球也合不成一个全是六边形的球，因为如图上边界的地方：![Pasted image 20240102195111.png]({{ '/docs/attachment/Pasted image 20240102195111.png' | relative_url }}){:width="200"} 展开会变成5边形，7边形，8边形

## 代码

[**hex.py**](https://gist.github.com/roshameow/b9838c17a65f17f8f775585f24d34d64#file-hex-py)
## 其他讨论这个的链接：

[1] https://zhuanlan.zhihu.com/p/673051340

[2] https://www.163.com/dy/article/IMH50ITS0526FP3N.html

