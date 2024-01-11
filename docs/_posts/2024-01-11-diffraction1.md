---
layout: post
title: aperture衍射模型 (二)
categories:
  - simulation
tags:
  - content
  - simulation
  - sensor
  - physics
last_modified_at: 2024-01-11T23:52:21-08:00
---
### 仿真

![circle_diffraction.mp4]({{ '/docs/attachment/circle_diffraction.mp4' | relative_url }}){:width="200"} ![square_diffraction.mp4]({{ '/docs/attachment/square_diffraction.mp4' | relative_url }}){:width="200"}
1.  在aperture区域均匀采样，发现Frensel pattern是很难出现的，在每个像素对应sample数不足1000的时候，基本观测不到。。应该是因为在那个范围内结果受$(x^\prime,y^\prime)$ 的位置影响更大, 也就表现出更大的随机性。
2. 确实可以看到sensor到aperture距离增大后, pattern变化的全过程。
3. 在一个网上找的[Frensel diffraction仿真](https://www.falstad.com/diffraction/) java代码里面，作者也是通过先把部分积分形式通过公式运算先化简之后做的仿真[1](#ref)，没有用原始的传播公式。

### 应用


在相机系统中，我们关心进光量和成像的分辨率：用Fraunhofer的模型估算相机的resolution
- 相机aperture参数：这两个都是dimensionless版本的aperture
	- f-number: $N=\frac{f}{D}=\frac{f}{2a}$ 
		- 相机焦距$f=z$, 光圈直径$D=2a$ 
	- numerical aperture $NA=\frac{a}{\sqrt{f^2+a^2}}=\frac{1}{\sqrt{4N^2+1}}\approx \frac{1}{2N}$ 
- 第一圈黑环处距中心距离，认为是相机的optical resolution: $q=r_1\sin\theta\approx \sqrt{f^2+a^2}\sin\theta=\frac{a}{NA}\sin\theta\approx \frac{a}{NA}\frac{1.22\lambda}{2a}=\frac{0.61\lambda}{NA}$  
	- 此时是$J_1(x)$ 的第一个0点， $J_1(ka\sin\theta)=0$，$ka\sin\theta\approx 3.83$ ，即$\sin\theta\approx \frac{3.83}{ka}=\frac{3.83\lambda}{2\pi a}=1.22\frac{\lambda}{D}$ 
- numberical aperture越大，optical resolution越小，分辨率越高？




## 其他讨论这个的链接：
<span id="ref"></span>
仿真

[5] http://www.dauger.com/fresnel/ 

[6] Dauger, Dean E. “Simulation and Study of Fresnel Diffraction for Arbitrary Two-Dimensional Apertures.” _Computers in Physics_ 10 (November 1, 1996): 591–604. [https://doi.org/10.1063/1.168584](https://doi.org/10.1063/1.168584).