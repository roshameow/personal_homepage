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
last_modified_at: 2024-07-09T12:14:29-08:00
---
## 仿真

![circle_diffraction.mp4]({{ '/docs/attachment/circle_diffraction.mp4' | relative_url }}){:width="200"} ![square_diffraction.mp4]({{ '/docs/attachment/square_diffraction.mp4' | relative_url }}){:width="200"}
1.  在aperture区域均匀采样，发现Frensel pattern是很难出现的，在每个像素对应sample数不足1000的时候，基本观测不到。。应该是因为在那个范围内结果受$(x^\prime,y^\prime)$ 的位置影响更大, 也就表现出更大的随机性。
2. 确实可以看到sensor到aperture距离增大后, pattern变化的全过程。
3. 在一个网上找的[Frensel diffraction仿真](https://www.falstad.com/diffraction/) java代码里面，作者也是通过先把部分积分形式通过公式运算先化简之后做的仿真[1](#ref)，没有用原始的传播公式。
4. 如果用全光谱的光源，Fraunhofer衍射中因为波长影响, 看起来的效果像是从中间不同颜色的光被diffuse了，我看一些3d建模制作里说的衍射，一般是指这种效果，可以看[b站上一个用blender仿这种效果的视频][1]
	- 另外判断天然珍珠和人造珍珠的区别的一种方法，也是看天然珍珠里面有微小的结构可以把不同波长的光区分出来的效果
	- blender的cycles用的是粒子模型, 没有相位变化，可能没法直接得到衍射

## 应用


1. **在相机系统中，我们关心成像的分辨率**：用Fraunhofer的模型估算相机的resolution
	- 相机aperture参数：这两个都是dimensionless版本的aperture
		- [f-number](https://en.wikipedia.org/wiki/F-number): $N=\frac{f}{D}=\frac{f}{2a}$ 
			- 相机焦距$f=z$, 光圈直径$D=2a$ 
		- [numerical aperture](https://en.wikipedia.org/wiki/Numerical_aperture) $NA=\frac{a}{\sqrt{f^2+a^2}}=\frac{1}{\sqrt{4N^2+1}}\approx \frac{1}{2N}$ 
	- 第一圈黑环处距中心距离，认为是相机的optical resolution:
		- ![Pasted image 20240112160824.png]({{ '/docs/attachment/Pasted image 20240112160824.png' | relative_url }}){:width="300"}  
		- 此时是$J_1(x)$ 的第一个0点， $J_1(ka\sin\theta)=0$，$ka\sin\theta\approx 3.83$ ，即$\sin\theta\approx \frac{3.83}{ka}=\frac{3.83\lambda}{2\pi a}=1.22\frac{\lambda}{D}$ 
		- 得到optical resolution $q=r_1\sin\theta\approx \sqrt{f^2+a^2}\sin\theta=\frac{a}{NA}\sin\theta\approx \frac{a}{NA}\frac{1.22\lambda}{2a}=\frac{0.61\lambda}{NA}$  
		- 理论上，numberical aperture越大，optical resolution越小，分辨率越高(也就是衍射更不明显)
	- 相机的成像清晰度指标：MTF
		- ![Pasted image 20240112154649.png]({{ '/docs/attachment/Pasted image 20240112154649.png' | relative_url }}){:width="400"} 
		- [PSF](https://en.wikipedia.org/wiki/Point_spread_function)(intensity function): $PSF=\|G(p,q)\|^2=\|F(g(x^\prime,y^\prime))\|^2$ 
			- PSF的单位是 (distance(mm),intesity)
			- 对于圆形aperture：$PSF=\frac{J_1^2(ka\sin\theta)}{(ka\sin\theta)^2}$ , PSF的零点也就是$J_1$ 的零点  
			- 生成图像的image: $I=PSF*\text{scene}$ 是场景和PSF的卷积
		- [MTF](https://en.wikipedia.org/wiki/Optical_transfer_function): $MTF=F(PSF)$ 
			- MTF的单位是（frequency(lines/mm),response(%)）
			- $\frac{J_1^2(x)}{x^2}$ 的Fourier变换是个连续下降函数
			- 根据 [Fourier transform](https://en.wikipedia.org/wiki/Fourier_transform#Applications) time scaling的性质：因为PSF的零点$PSF_0\propto \frac{\lambda}{NA}$ , 得到MTF的cutoff点 $c(MTF)\propto \frac{NA}{\lambda}$  (即频率更高的物体就看不清了)
			- MTF是个衡量成像系统分辨率的常用指标，不光衍射，所有成像过程，包括软件做的deblur等操作都可以用这个指标衡量。
1. **用PSF做图像调制** 
	- 从PSF的表达式可以看出, PSF受距离, 波长(光的颜色), 位置影响, 可以在相机系统中主动利用这些信息

## 代码

[**diffraction_simulation.py**](https://gist.github.com/roshameow/7d44196b703ade645b34b164d779cdfe#file-diffraction_simulation-py)

[**pst_bessel.py**](https://gist.github.com/roshameow/7d44196b703ade645b34b164d779cdfe#file-pst_bessel-py) 

## 其他讨论这个的链接：
<span id="ref"></span>
仿真

[5] http://www.dauger.com/fresnel/ 

[6] Dauger, Dean E. “Simulation and Study of Fresnel Diffraction for Arbitrary Two-Dimensional Apertures.” _Computers in Physics_ 10 (November 1, 1996): 591–604. [https://doi.org/10.1063/1.168584](https://doi.org/10.1063/1.168584).

相机resolution

[7] https://www.microscopyu.com/tutorials/imageformation-airyna (包含一个[Airy disk](https://en.wikipedia.org/wiki/Airy_disk) 影响清晰度的演示)

[8] https://www.iasj.net/iasj/download/8ab5ecbce0ead154

[9] https://micro.magnet.fsu.edu/primer/java/mtf/airydisksize/index.html



[1]: https://www.bilibili.com/video/BV1C5411E78d/ 