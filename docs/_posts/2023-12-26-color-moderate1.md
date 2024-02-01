---
layout: post
title: 传感器颜色调制 (二)
categories:
  - algorithm
tags:
  - content
  - sensor
last_modified_at: 2024-01-29T17:54:34-08:00
---
## 通过coded-aperture 和 dispenser进行颜色调制

### coded-aperture的优点

1. **有利于deblur**
	1. PSF是scene到image的kernel: $\text{image}=PSF*\text{scene}$ 
	2. 如果对image做deblur, $\text{scene}=F^{-1}(\frac{F(\text{image})}{F(PSF)})=F^{-1}(\frac{F(\text{image})}{MTF})$  
	3. 传统的MTF存在cutoff点, 即在cutoff之上的的高频部分是0, 而coded-aperture可以保留部分高频信息, 使MTF没有完全为0的点
2. 我不能确定coded aperture是否必要, 看起来颜色调制主要还是通过dispenser完成的

### CASSI

coded_apeture+dispenser

- 仿真数据：
	- ![Pasted image 20240114142241.png]({{ '/docs/attachment/Pasted image 20240114142241.png' | relative_url }}){:width="300"} [1](#ref)
    
    - CASSI: coded_apeture+dispenser
        
        - coded_apeture把mask应用于所有通道
            
        - dispenser依次给mask的通道图像y-axis 2pixel的shift
            
        - 所有通道叠加(一个像素是同行28x2=56个不同通道像素的叠加，出来的图像是很模糊的)
            
        - 仿真通过shot noise: $Y_{sim}=B(Y/QE,QE)$
            
            - 本来读数是Y, qe是quantum efficiency
                
            - B是binomial 分布
                
            - 这段其实没懂为什么要用binomial分布，而不是poisson分布$P(Y)$ , 大概Y/QE是平均光子数，所以sample这么多次，每次都有qe的概率转换为电子；但是仍然不理解为什么要在光电转换的部分随机



- 仿真:
	- ![Pasted image 20240117165405.png]({{ '/docs/attachment/Pasted image 20240117165405.png' | relative_url }}){:width="200"}   ![Pasted image 20240117165253.png]({{ '/docs/attachment/Pasted image 20240117165253.png' | relative_url }}){:width="220"}
- 实际拍摄:
	- ![Pasted image 20240117165603.png]({{ '/docs/attachment/Pasted image 20240117165603.png' | relative_url }}){:width="200"}   ![Pasted image 20231226120247.png]({{ '/docs/attachment/Pasted image 20231226120247.png' | relative_url }}){:width="220"}  recon: ![Pasted image 20240122114048.png]({{ '/docs/attachment/Pasted image 20240122114048.png' | relative_url }}){:width="200"} 


看起来仿真和实际拍摄的情况并不太一样啊?仿真的y方向距离更大

数据集使用：
- simulation:
	- 训练：
		- data: cave_1024_28
		- crop_size: 随机crop到256x256, 和mask做simulation
			- shift3d mask: 28x256x310
		- mask: TSA_simu_data/mask.mat
		- test:  TSA_simu_data/Truth/
	- 测试：
		- mask: TSA_simu_data/mask.mat
		- test: TSA_simu_data/Truth/
- real: 
	- 训练:
		- size: 96
		- data: CAVE_512_28 and KAIST_CVPR2021
			- CAVE_512_28 ：原数据集512x512x28 30个图片
			- KAIST_CVPR2021： 2704x3376x28 30个图片
		- mask: TSA_real_data/mask.mat
			- 660x660 0-1的数据
			- ![mask.png]({{ '/docs/attachment/mask.png' | relative_url }}){:width="200"} 
	- 测试
		- size: 714x660
		- data: TSA_real_data/Measurements/
			-  
		- mask: TSA_real_data/mask.mat


### ADIS

grid aperture + color filter

- 文章中的说法是把aperture看成一组7x7的方形aperture, 根据Fraunhofer diffraction, 不同位置的aperture因为波长不同, 会产生offset
	- 相机系统可以这么解释吗?
- 我觉得也可以看成, 在aperture之后的每个不同位置, 都有对应的dispenser, 移动aperture的位置会产生offset


## 理解




<span id="ref"></span>
[1]  Zhao, Ruixuan, Chengshuai Yang, R. Theodore Smith, and Liang Gao. “Coded Aperture Snapshot Spectral Imaging Fundus Camera.” _Scientific Reports_ 13, no. 1 (July 25, 2023): 12007. [https://doi.org/10.1038/s41598-023-39117-2](https://doi.org/10.1038/s41598-023-39117-2).

[2] Lv, Tao, Hao Ye, Quan Yuan, Zhan Shi, Yibo Wang, Shuming Wang, and Xun Cao. “Aperture Diffraction for Compact Snapshot Spectral Imaging.” arXiv, September 27, 2023. [https://doi.org/10.48550/arXiv.2309.16372](https://doi.org/10.48550/arXiv.2309.16372).

CSST
为什么要这么仿真? 怎么从系统的结构得到的? 
每个aperture的小孔都会在不同offset的地方成像吗? 相当于aperture每个小孔位置放了一个dispenser
假设有7x7的孔, 那么每个7x7x28的波长都有自己的offset
rgb bayer filter有必要吗?
是不是相当于两级的dispenser, 

到底应不应该这么仿真, 其实我是有疑惑的.
