---
layout: post
title: 传感器颜色调制 (二)
categories:
  - algorithm
tags:
  - content
  - sensor
last_modified_at: 2024-02-19T17:58:26-08:00
---
## 其他方法进行颜色调制: coded-aperture, dispenser

### coded-aperture的优点

1. **有利于deblur**
	1. PSF是scene到image的kernel: $\text{image}=PSF*\text{scene}$ 
	2. 如果对image做deblur, $\text{scene}=F^{-1}(\frac{F(\text{image})}{F(PSF)})=F^{-1}(\frac{F(\text{image})}{MTF})$  
	3. 传统的MTF(即$F(J_1)$ )存在cutoff点, 即在cutoff之上的的高频部分是0, 而coded-aperture可以保留部分高频信息, 使MTF没有完全为0的点
2. **进行颜色调制**
	1. 不同的波长的PSF不同, aperture缩小后, 这个不同在成像上变得更明显, coded-aperture可以看成是很多小的aperture的组合
	2. coded-aperture可以让不同波长的PSF形成不同的pattern

### CASSI

coded_apeture+dispenser
-  ![Pasted image 20240114142241.png]({{ '/docs/attachment/Pasted image 20240114142241.png' | relative_url }}){:width="180"} [1](#ref) 设备: ![Pasted image 20240219163704.png]({{ '/docs/attachment/Pasted image 20240219163704.png' | relative_url }}){:width="250"}
- 代码仿真过程: 3d multichannel image( C x H x W ) -> 2d perception image( H x (W+2\*C-2) )
	1.  把coded_apeture mask应用于所有通道
	2.  dispenser依次给mask的通道图像y-axis 2pixel的shift
	3.  把所有通道叠加
	4. 加入shot noise: $Y_{sim}=B(Y/QE,QE)$ 
		- 本来读数是Y, qe是quantum efficiency
		- B是binomial 分布
		- 这段其实没懂为什么要用binomial分布，而不是poisson分布$P(Y)$ , 大概Y/QE是平均光子数，所以sample这么多次，每次都有qe的概率转换为电子；但是仍然不理解为什么要在光电转换的部分随机
- 仿真图例:
	- input: ![Pasted image 20240117165405.png]({{ '/docs/attachment/Pasted image 20240117165405.png' | relative_url }}){:width="150"}   sim: ![Pasted image 20240117165253.png]({{ '/docs/attachment/Pasted image 20240117165253.png' | relative_url }}){:width="170"}
	- simulation图片的size是Hx(W+54)
- 实际拍摄的测试图例:
	- label:  ![Pasted image 20240117165603.png]({{ '/docs/attachment/Pasted image 20240117165603.png' | relative_url }}){:width="150"}  image:  ![Pasted image 20231226120247.png]({{ '/docs/attachment/Pasted image 20231226120247.png' | relative_url }}){:width="170"}  recon: ![Pasted image 20240122114048.png]({{ '/docs/attachment/Pasted image 20240122114048.png' | relative_url }}){:width="150"} 
	- mask: ![mask.png]({{ '/docs/attachment/mask.png' | relative_url }}){:width="150"} 
- 讨论: 
	- 看起来仿真和实际拍摄的情况并不太一样啊?仿真的y方向offset距离更大
	- 不能确定coded aperture mask是否必要, 仿真过程里, mask是在所有channel上都是一样的, 并没有颜色调制效果, 无论实际拍摄时有什么作用, 用仿真数据训练的网络学不到这个信息, 看起来颜色调制主要还是通过dispenser完成的

### ADIS [2](#ref)

grid aperture + color filter

- ![Pasted image 20240219161325.png]({{ '/docs/attachment/Pasted image 20240219161325.png' | relative_url }}){:width="190"}  设备: ![Pasted image 20240219161024.png]({{ '/docs/attachment/Pasted image 20240219161024.png' | relative_url }}){:width="150"} 
- 代码仿真过程: 3d multichannel image( C x (H+max_offset\*2) x (W+max_offset\*2) ) -> 2d perception image( H x W )
	1.  对应每个channel, 提取3d multichannel image中, 对应位置的patch相加
		1. 每个channel的offset递增: patch的位置不同
			- 文章中用到的是28通道, offset从20开始, 每两个通道+1: offset为20, 20, 21, 21, ..., 33, 33
		2. 提取7x7=49个patch, 每个patch位置为 center-5offset, center-3offset, center-offset, center, center+offset, center+3offset, center+5offset
			- 文章中的情况, max_offset = 5x33 = 165. 要仿真256x256的数据, 至少需要原数据 > 586x586
	4.  加入GBRG的color filter
		- 是为了补充相邻通道offset一样的调制吗?
	5.  把所有通道叠加
 - 仿真图例:
	 - data: ![Pasted image 20240219160739.png]({{ '/docs/attachment/Pasted image 20240219160739.png' | relative_url }}){:width="200"} label: ![Pasted image 20240219162430.png]({{ '/docs/attachment/Pasted image 20240219162430.png' | relative_url }}){:width="100"}  sim: ![Pasted image 20240219160842.png]({{ '/docs/attachment/Pasted image 20240219160842.png' | relative_url }}){:width="100"}  
 - 讨论: 
	 - 文章中的说法是把aperture看成一组7x7的方形aperture, 根据Fraunhofer diffraction, 不同位置的aperture因为波长不同, 会产生offset
		- 相机系统可以这么解释吗?
	- 我觉得也可以看成, 在aperture之后的每个不同位置, 都有对应的dispenser, 移动aperture的位置会产生offset

### THETA  [3](#ref)

也是color_filter但是不按像素排布, 光滑切换, 不规则排布. 用加在sensor上的一个彩色胶片实现.
- 拍摄图例: ![Pasted image 20240219172254.png]({{ '/docs/attachment/Pasted image 20240219172254.png' | relative_url }}){:width="150"}  
- 讨论:
	- color_filter的pattern比pixel 要大
	- 保留了图像的高频信息, 恢复出的图像很细节. 但是颜色的分辨率不高

## dataset代码

[**CASSI.py**](https://gist.github.com/roshameow/d3d6b1fd6d893a51656d645d7d16ad9b#file-cassi-py)

[**ADIS.py**](https://gist.github.com/roshameow/d3d6b1fd6d893a51656d645d7d16ad9b#file-adis-py) 

## 单从理论看, 什么样的调制更好?






<span id="ref"></span>
[1]  Zhao, Ruixuan, Chengshuai Yang, R. Theodore Smith, and Liang Gao. “Coded Aperture Snapshot Spectral Imaging Fundus Camera.” _Scientific Reports_ 13, no. 1 (July 25, 2023): 12007. [https://doi.org/10.1038/s41598-023-39117-2](https://doi.org/10.1038/s41598-023-39117-2).

[2] Lv, Tao, Hao Ye, Quan Yuan, Zhan Shi, Yibo Wang, Shuming Wang, and Xun Cao. “Aperture Diffraction for Compact Snapshot Spectral Imaging.” arXiv, September 27, 2023. [https://doi.org/10.48550/arXiv.2309.16372](https://doi.org/10.48550/arXiv.2309.16372).

[3] Zhang, Weihang, Jinli Suo, Kaiming Dong, Lianglong Li, Xin Yuan, Chengquan Pei, and Qionghai Dai. “Handheld Snapshot Multi-Spectral Camera at Tens-of-Megapixel Resolution.” _Nature Communications_ 14, no. 1 (August 19, 2023): 5043. [https://doi.org/10.1038/s41467-023-40739-3](https://doi.org/10.1038/s41467-023-40739-3).


