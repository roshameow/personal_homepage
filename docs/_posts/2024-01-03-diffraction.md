---
layout: post
title: aperture衍射模型
categories:
  - simulation
tags:
  - content
  - simulation
  - pysics
  - sensor
last_modified_at: 2024-01-11T23:38:29-08:00
---

## 光的传播理论

![image](https://upload.wikimedia.org/wikipedia/commons/4/48/Diffraction_geometry_2.svg)

- [Huygens–Fresnel principle理论](https://en.wikipedia.org/wiki/Huygens–Fresnel_principle)：
	- 假设光源在$(x^\prime,y^\prime,0)$ , 方向是$z$ 方向，能量是$E$
	- 传播到$(x,y,z)$ 的electric field是$E(x,y,z)=\frac{1}{i\lambda}\cdot E \cdot\frac{e^{ikr}}{r}\cdot \frac{z}{r}$ 
		- $r$ 是$(x,y,z)$ 到光源的距离
		- $\lambda$ 是波长
		- $k$ 是wavenumber: $\frac{2\pi}{\lambda}$ 

<!--more-->
## diffraction 

![image1](https://upload.wikimedia.org/wikipedia/commons/b/b8/Wavelength%3Dslitwidth.gif) 

考虑由光圈所在平面到sensor这一段, 假设$z$ 固定为aperture和sensor的距离，光源为从aperture向sensor方向的平行光

从aperture $A$ 透过的能量是 $E(x,y,z)= \int\int_A \frac{z}{i\lambda r^2} E(x^\prime,y^\prime,0)\cdot e^{ikr}\cdot dx^\prime dy^\prime$  ，形成的pattern主要受$e^{ikr}$ 这个高频项的影响, 主要能观测到的pattern可以用下面两类衍射模型近似   

<!--more-->
### Fresnel diffraction([菲涅耳衍射](https://en.wikipedia.org/wiki/Fresnel_diffraction))

- 假设 : $r\approx z+\frac{(x-x^\prime)^2+(y-y^\prime)^2}{2z}$ 
	- $r=\sqrt{z^2+\rho^2}=z\sqrt{1+\frac{\rho^2}{z^2}}$ , 其中$\rho^2=(x-x^\prime)^2+(y-y^\prime)^2$ 
		-  展开为 $r=z(1+\frac{\rho^2}{2z^2}-\frac{1}{8}(\frac{\rho^2}{z^2})^2+\cdots)\approx z+\frac{\rho^2}{2z}$  
		- 近似条件为$z\frac{1}{8}(\frac{\rho^2}{z^2})^2=o(2\pi/k)$ , 即$\frac{\rho^4}{z^3\lambda}=o(1)$, 因为我们主要关注的是$e^{ikr}$ 这个高频项的周期
- 化简成Fourier变换的格式：
	- $\begin{align}E(x,y,z)&=\frac{e^{ikz}}{i\lambda z} \int\int_A E(x^\prime,y^\prime,0)\cdot e^{\frac{ik}{2z}((x-x^\prime)^2+(y-y^\prime)^2)} dx^\prime dy^\prime \\\\ &=\frac{e^{ikz}}{i\lambda z} \int\int_A E(x^\prime,y^\prime,0)\cdot e^{\frac{i\pi}{\lambda z}(x^2+y^2+{x^\prime}^2+{y^\prime}^2-2xx^\prime-2yy^\prime)} dx^\prime dy^\prime\ (k\text{还原成 }\frac{2\pi}{\lambda}) \\\\ & =\frac{e^{ikz}}{i\lambda z}e^{\frac{i\pi}{\lambda z}(x^2+y^2)} \int\int_A E(x^\prime,y^\prime,0)e^{\frac{i\pi}{\lambda z}({x^\prime}^2+{y^\prime}^2)}\cdot e^{\frac{i\pi}{\lambda z}(-2xx^\prime-2yy^\prime)} dx^\prime dy^\prime \\\\ &=\frac{e^{ikz}}{i\lambda z}e^{\frac{i\pi}{\lambda z}(x^2+y^2)} \int\int \mathbb 1_A(x^\prime,y^\prime)\cdot E(x^\prime,y^\prime,0)e^{\frac{i\pi}{\lambda z}({x^\prime}^2+{y^\prime}^2)}\cdot e^{\frac{i\pi}{\lambda}(px^\prime+py^\prime)} dx^\prime dy^\prime\ (\text{ 带入 }p=\frac{x}{\lambda z}, q=\frac{y}{\lambda z})\end{align}$ 
	- 记 impulse response: $h(x,y,z)= \frac{e^{ikz}}{i\lambda z}\cdot e^{\frac{ik}{2z}(x^2+y^2)}$ 
	- 记aperture function: $g(x^\prime,y^\prime)=\mathbb 1_A(x^\prime,y^\prime)\cdot E(x^\prime,y^\prime,0)e^{\frac{i\pi}{\lambda z}({x^\prime}^2+{y^\prime}^2)}$ 
	- [Fourier transform](https://en.wikipedia.org/wiki/Fourier_transform#Applications) : $G(p,q)=F(g(x^\prime,y^\prime))$ 
	- 得到$E(x,y,z)=h(x,y,z)\cdot G(p,q)$ 的形式

###  Fraunhofer diffraction([夫琅禾费衍射](https://en.wikipedia.org/wiki/Fraunhofer_diffraction))

-  ![Pasted image 20240110160604.png]({{ '/docs/attachment/Pasted image 20240110160604.png' | relative_url }}){:width="500"} 
- 假设1：$r\approx r_1-b\cdot\cos(\phi-\Phi)\cdot\sin\theta$  (有如图几何直观，对于圆形aperture有个简便的表达方法)
	- 近似条件：图中红线 $\approx$ 图中绿线部分
		- $r_1$ 是aperture中心到观测点$(x,y)$ 的距离
		- 光源点$(x^\prime,y^\prime)$ 到中心距离为$b$ ,角度为$\phi$, 观测点$(x,y)$ 的角度为$\Phi$, $b$ 往$(x,y)$ 所在角度投影为$b\cos(\phi-\Phi)$ , 图中蓝色三角形的短边
		- 对图中蓝色三角形$(b\cos(\phi-\Phi),\pi/2-\theta,r_1)$  用[余弦公式](https://en.wikipedia.org/wiki/Law_of_cosines) 得到图上蓝色$r_2$ 的距离：$r_2=\sqrt{r_1^2+b^2\cos^2(\phi-\Phi)-2br_1(\cos(\pi/2-\theta)\cos(\phi-\Phi))}$ 
		-  则 $r=\sqrt{r_2^2+b^2\sin^2(\phi-\Phi)}=\sqrt{r_1^2+b^2-2br_1\sin(\theta)\cos(\phi-\Phi)}$  
		- 展开为：$r=r_1(1-\frac{b}{r_1}\sin(\theta)\cos(\phi-\Phi)+\frac{b^2}{2r_1^2}\cos^2(\theta)\cos^2(\phi-\Phi)+\cdots)$ 
		- 在$\frac{b^2}{2r_1}\cos^2(\theta)=o(2\pi/k)$ 条件下，即$\frac{b^2}{\lambda r_1}\cos^2\theta=o(1)$ 的情况下，得到我们的假设
- 假设2: $r\approx z+\frac{x^2+y^2-2xx^\prime-2yy^\prime}{2z}$ (和Fresnel的形式更统一，也方便写成Fourier变换的形式)
	- 近似条件：
		- 和Frensel一样假设$\frac{\rho^4}{z^3\lambda}=o(1)$ ，另外，假设$\frac{b^2}{z\lambda}=o(1)$ 
	- 和假设1的关系：其实把假设1形式变换一下就能得到相似的形式
		- $r\approx r_1-b\cdot(\cos\phi\cos\Phi+\sin\phi\sin\Phi)\cdot\sin\theta$ 
		- 带入： $\cos\phi=\frac{x^\prime}{b},\sin\phi=\frac{y^\prime}{b},\cos\Phi=\frac{x}{\sqrt{x^2+y^2}},\sin\Phi=\frac{y}{\sqrt{x^2+y^2}},\sin\theta=\frac{\sqrt{x^2+y^2}}{r_1}$   
		- 得到$r\approx r_1-\frac{xx^\prime+yy^\prime}{r_1}=\sqrt{z^2+x^2+y^2}-\frac{xx^\prime+yy^\prime}{r_1}\approx z+\frac{x^2+y^2}{2z}-\frac{xx^\prime+yy^\prime}{z}$ (不过这样需要进一步的假设。。)
- 化简成Fourier变换的格式：
	- 根据假设2，其他部分都和Fresnel相同, 只有$g(x^\prime,y^\prime)=\mathbb 1_A(x^\prime,y^\prime)\cdot E(x^\prime,y^\prime,0)$ 更简单了

> [!example]
> 
 - 圆形aperture, 并假设光源在aperture均匀分布，即$E(x^\prime,y^\prime,0)=const$ : 
	- 把$(x^\prime,y^\prime)$ 转为$(b,\phi)$ 极坐标，$\int\int_A ...dx^\prime dy^\prime=\int_0^a\int_0^{2\pi}... bdbd\phi$   
	- 根据假设1，参考[Bessel公式](https://en.wikipedia.org/wiki/Bessel_function) 
	- $\begin{align}E(x,y,z)&=\frac{e^{ikr_1}}{i\lambda r_1} \int_{b=0}^a\int_{\phi=0}^{2\pi}  e^{-ikb\cdot\cos(\phi-\Phi)\cdot\sin\theta}b db d\phi\text{ (根据假设1)}\\\\ & =\frac{e^{ikr_1}}{i\lambda r_1} \int_{b=0}^a\int_{\phi=0}^{2\pi}  e^{-ikb\cdot\cos\phi\cdot\sin\theta}b db d\phi\text{ (关于}\Phi\text{对称,可以假设=0)}\\\\ & =\frac{e^{ikr_1}2\pi}{i\lambda r_1} \int_{b=0}^a J_0(kb\sin\theta)b db \text{ (根据Bessel公式) }\\\\ & =e^{ikr_1}\frac{k}{i r_1} \frac{J_1(ka\sin\theta)}{ka\sin\theta}\end{align}$ 
	- 另外，根据假设2，也能得到circ函数的Fourier变换是$J_1$ 
- 方形aperture, 并假设光源在aperture均匀分布：
	- x,y可以拆开成两个rectangular pulse, 其Fourier变换是sinc函数 

### 应用


在相机系统中，我们关心进光量和成像的分辨率：用Fraunhofer的模型估算相机的resolution
- 相机aperture参数：这两个都是dimensionless版本的aperture
	- f-number: $N=\frac{f}{D}=\frac{f}{2a}$ 
		- 相机焦距$f=z$, 光圈直径$D=2a$ 
	- numerical aperture $NA=\frac{a}{\sqrt{f^2+a^2}}=\frac{1}{\sqrt{4N^2+1}}\approx \frac{1}{2N}$ 
- 第一圈黑环处距中心距离，认为是相机的optical resolution: $q=r_1\sin\theta\approx \sqrt{f^2+a^2}\sin\theta=\frac{a}{NA}\sin\theta\approx \frac{a}{NA}\frac{1.22\lambda}{2a}=\frac{0.61\lambda}{NA}$  
	- 此时是$J_1(x)$ 的第一个0点， $J_1(ka\sin\theta)=0$，$ka\sin\theta\approx 3.83$ ，即$\sin\theta\approx \frac{3.83}{ka}=\frac{3.83\lambda}{2\pi a}=1.22\frac{\lambda}{D}$ 
- numberical aperture越大，optical resolution越小，分辨率越高？


### 仿真

![circle_diffraction.mp4]({{ '/docs/attachment/circle_diffraction.mp4' | relative_url }}){:width="200"} ![square_diffraction.mp4]({{ '/docs/attachment/square_diffraction.mp4' | relative_url }}){:width="200"}
1.  在aperture区域均匀采样，发现Frensel pattern是很难出现的，在每个像素对应sample数不足1000的时候，基本观测不到。。应该是因为在那个范围内结果受$(x^\prime,y^\prime)$ 的位置影响更大, 也就表现出更大的随机性。
2. 确实可以看到sensor到aperture距离增大后, pattern变化的全过程。
3. 在一个网上找的[Frensel diffraction仿真](https://www.falstad.com/diffraction/) java代码里面，作者也是通过先把部分积分形式通过公式运算先化简之后做的仿真[1](#ref)，没有用原始的传播公式。

### 两种diffraction的区别  　

|  | Frensel | Fraunhofer | diffraction不明显 |
| ---- | ---- | ---- | ---- |
| apeture function/[pupil function](https://en.wikipedia.org/wiki/Pupil_function) | $g(x^\prime,y^\prime)=\mathbb 1_A(x^\prime,y^\prime)\cdot E(x^\prime,y^\prime,0)e^{\frac{i\pi}{\lambda z}({x^\prime}^2+{y^\prime}^2)}$ <br>和aperture到observer的距离$z$ 有关；<br>改变距离，或把aperture平移，<br>都会使pattern看起来剧烈变化 | $g(x^\prime,y^\prime)=\mathbb 1_A(x^\prime,y^\prime)\cdot E(x^\prime,y^\prime,0)$<br>和距离$z$ 无关; <br>结果只和观察角度$p=\frac{x}{\lambda z}, q=\frac{y}{\lambda z}$ 有关;<br>只改变$z$的情况，<br>形成的pattern看起来形状相似 |  |
| 形成条件假设 | $\frac{\rho^4}{z^3\lambda}=o(1),\frac{\rho^2}{z\lambda}=O(1)$ <br>当距离$z$ 再增加的时候，<br>相对aperture更大，<br>会趋近Fraunhofer的假设2 <br><br>带入$N_f$, <br>有时写成$N_f (a/z)^2\ll 1, N_f\sim 1$ | 假设1: $\frac{b^2}{\lambda r_1}\cos^2\theta=o(1)$ <br>假设2: $\frac{\rho^4}{z^3\lambda}=o(1)$ ，$\frac{b^2}{z\lambda}=o(1)$ |  |
| Fresnel number: <br>$N_F=\frac{a(\text{aperture radius})^2}{z \lambda}$<br>$N_F$ 是实际场景中,<br>diffraction种类的一个粗略的判断方法 | $N_F\sim 1$<br>一般叫"near field" diffraction | $N_F\ll 1$<br>一般叫 far field diffraction | $N_f\gg 1$ |
| pattern | [泊松光斑实验](https://en.wikipedia.org/wiki/Arago_spot) <br>不过实验里用的不是aperture而是中心的遮挡 | [Airy disk](https://en.wikipedia.org/wiki/Airy_disk) |  |

## 其他讨论这个的链接：
<span id="ref"></span>
公式推导

[1] https://en.wikipedia.org/wiki/Fraunhofer_diffraction_equation#CITEREFHecht2002

[2] https://phys.libretexts.org/Bookshelves/Optics/BSc_Optics_(Konijnenberg_Adam_and_Urbach)/06%3A_Scalar_diffraction_optics/6.07%3A_Fresnel_and_Fraunhofer_Approximations

[3] http://www.erbion.com/index_files/Modern_Optics/Ch11.pdf

[4] https://zhuanlan.zhihu.com/p/339379109

仿真

[5] http://www.dauger.com/fresnel/ 

[6] Dauger, Dean E. “Simulation and Study of Fresnel Diffraction for Arbitrary Two-Dimensional Apertures.” _Computers in Physics_ 10 (November 1, 1996): 591–604. [https://doi.org/10.1063/1.168584](https://doi.org/10.1063/1.168584).

为什么coded aperture要和dispenser结合？不同波长的psf不一样。coded aperture是必要的吗？
折射
怎么影响image resolution的？