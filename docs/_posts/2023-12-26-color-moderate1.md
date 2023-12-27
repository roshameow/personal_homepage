---
layout: post
title: 传感器颜色调制 (二)
categories:
  - algorithm
tags:
  - content
  - sensor
last_modified_at: 2023-12-27T12:34:40-08:00
---
## 通过coded-aperture 和 dispenser进行颜色调制

- 仿真数据：
    
    - CASSI: coded_apeture+dispenser
        
        - coded_apeture把mask应用于所有通道
            
        - dispenser依次给mask的通道图像y-axis 2pixel的shift
            
        - 所有通道叠加(一个像素是同行28x2=56个不同通道像素的叠加，出来的图像是很模糊的)
            
        - 仿真通过shot noise: $Y_{sim}=B(Y/QE,QE)$
            
            - 本来读数是Y, qe是quantum efficiency
                
            - B是binomial 分布
                
            - 这段其实没懂为什么要用binomial分布，而不是poisson分布$P(Y)$ , 大概Y/QE是平均光子数，所以sample这么多次，每次都有qe的概率转换为电子；但是仍然不理解为什么要在光电转换的部分随机

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
			- ![mask.png]({{ '/docs/attachment/mask.png' | relative_url }}){:width="300"} 
	- 测试
		- size: 714x660
		- data: TSA_real_data/Measurements/
			- ![Pasted image 20231226120247.png]({{ '/docs/attachment/Pasted image 20231226120247.png' | relative_url }}){:width="300"} 
		- mask: TSA_real_data/mask.mat