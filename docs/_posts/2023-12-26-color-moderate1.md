---
layout: post
title: 传感器颜色调制 (二)
categories:
  - algorithm
tags:
  - content
  - sensor
last_modified_at: 2024-01-19T11:06:56-08:00
---
## 通过coded-aperture 和 dispenser进行颜色调制

### coded-aperture的优点

1. **有利于deblur**
	1. PSF是scene到image的kernel: $\text{image}=PSF*\text{scene}$ 
	2. 如果对image做deblur, $\text{scene}=F^{-1}(\frac{F(\text{image})}{F(PSF)})=F^{-1}(\frac{F(\text{image})}{MTF})$  
	3. 传统的MTF存在cutoff点, 即在cutoff之上的的高频部分是0, 而coded-aperture可以保留部分高频信息, 使MTF没有完全为0的点
2. 我不能确定coded aperture是否必要, 看起来颜色调制主要还是通过dispenser完成的

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
	- ![Pasted image 20240117165603.png]({{ '/docs/attachment/Pasted image 20240117165603.png' | relative_url }}){:width="200"}   ![Pasted image 20231226120247.png]({{ '/docs/attachment/Pasted image 20231226120247.png' | relative_url }}){:width="220"}


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





<span id="ref"></span>
[1]  Zhao, Ruixuan, Chengshuai Yang, R. Theodore Smith, and Liang Gao. “Coded Aperture Snapshot Spectral Imaging Fundus Camera.” _Scientific Reports_ 13, no. 1 (July 25, 2023): 12007. [https://doi.org/10.1038/s41598-023-39117-2](https://doi.org/10.1038/s41598-023-39117-2).

