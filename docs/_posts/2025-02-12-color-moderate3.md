---
layout: post
title: 传感器颜色调制 (四) -- 多光谱颜色校准
categories:
  - algorithm
tags:
  - content
  - sensor
  - multi-spectrum
  - isp
  - proximal_operator
last_modified_at: 2025-03-11T19:22
created: 2025-02-12T18:56
---
## 用RGB校准多光谱数据

把`(H,W,N)` 的多光谱数据 `Y` , 由`N x 3` 的CCM(Color Correction Matrix) 线性映射为 `(H,W,3)` 的rgb数据 `X` . 即 $Y\cdot CCM = X$ .

- 虽然是线性映射, 可以在步骤前给Y 加一个 feature extraction模块, 实现非线性. 达到更低的loss.
- 即使只是线性映射, 多光谱数据也比3通道的数据能达到更低的loss.

### 求解系数

| Loss & 约束               | 公式                                                                                     | 说明                                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 普通L2 norm               | $\min \vert\vert Y\cdot CCM - X\vert\vert_2$                                           |                                                                                                                                  |
| restrict awb            | $\min \vert\vert Y\cdot CCM - X\vert\vert_2$ ,  $\sum_{col}(CCM)=1$                    | 让中性灰映射不变, 即让 (1,1,...,1)映射到(1,1,1)<br>一般是把wb(white balance)步骤放在color correction之前会这样做<br>因为wb在不同机器上表现差别更大, <br>所以给这两步设置不同的校准频率吗? |
| L2 Regularization<br>🌟 | $\min \vert\vert Y\cdot CCM - X\vert\vert_2 + \lambda\cdot\vert\vert CCM \vert\vert_2$ | 防止CCM因为数据点比较少而过拟合<br>如果用24色卡, 考虑多光谱数据有 3n 个未知数, <br>加入约束是十分必要的, 这个也是计算最简单的约束条件                                                   |
| Lasso                   | $\min \vert\vert Y\cdot CCM - X\vert\vert_2 + \lambda\cdot\vert\vert CCM \vert\vert_1$ | 防止CCM某个数据过大外, 还能增强稀疏性<br>在color-correction里没必要                                                                                   |
| CIELab<br>🌟            | 把 X 变换到Lab空间. <br>计算 $Y\cdot CCM$ 和 X的delta E loss                                     | Lab 是评判RGB数据是否相近的最终标准. 这一步也是必要的.<br>Lab 变换是非线性的, 这一步优化时间更长.<br>需要在线性优化得到初值之后, 第二步再做delta E 的优化.                                  |


1. **原始L2 norm**:  用**最小二乘法** 
2. **restrict awb条件** : 因为是线性条件, 可以直接求解.
	- 把awb条件写成: ![Pasted image 20250220192803.png]({{ '/docs/attachment/Pasted%20image%2020250220192803.png' | relative_url }}){:width="300"} 的形式
	- 直接代入原方程: ![Pasted image 20250220192840.png]({{ '/docs/attachment/Pasted%20image%2020250220192840.png' | relative_url }}){:width="1000"} 
		- 把 Y 和 CCM 分块展开并化简. 用**最小二乘法**求解化简后的方程即可.
3. **L2 Regularization** : 因为正则项也是L2的, 可以直接计算. 
	- 在求导时, CCM的系数由 $2Y^T Y$ 变为 $2Y^TY+2\begin{bmatrix}\lambda&& \\\ &\lambda& \\\ &&\lambda\end{bmatrix}$ 即可
4. **Lasso问题**: 可以用近端算子轮流迭代的方法优化.
5. **Delta E** : 用BFGS 的方法优化.

### 测量标准

- 数据来源:
	- 标准色卡
	- 色差仪测量: 理论上能组成很大的数据集, 但是很多材料没有好的反射性能
- 测量环境
	- 保证测量到的都是反射光
	- 控制光源, 如果用色差仪和色差仪的光源保持一致

### 结果可视化

- 色卡: ![color_check_result.png]({{ '/docs/attachment/color_check_result.png' | relative_url }}){:width="300"} 显示校准后和标准色的直观差距
- Lab色彩: ![lab_chromaticities.png]({{ '/docs/attachment/lab_chromaticities.png' | relative_url }}){:width="200"} 显示数据集在ab空间的分布, 以及校准后的lab色差
- 在给出多光谱sensor每个通道的光谱(`cmf = n x 28` )的情况下, 可以出示下面两图: 由`(cmf_T * cmf)^{-1} * cmf` 做为系数, 还可以加入一些Regularization
	- 校准数据光谱: ![color_spectrum.png]({{ '/docs/attachment/color_spectrum.png' | relative_url }}){:width="300"}  显示数据集的光谱分布.
	- [ ]  多光谱映射的RGB和真实RGB的光谱差距. 即色卡上的红, 蓝, 绿三色. 

### 代码

- [**color_plot.py**](https://gist.github.com/roshameow/8855383a21cab1b36bba130a6cee70a5#file-color_plot-py) 

## 用多光谱合成高光谱数据

多光谱 + 高光谱分布 -> 高光谱

- 数据采集: (多光谱,高光谱) 数据对
	- 自然状态下采集的高光谱数据集(反射光+光源)
	- 多光谱数据每个通道光谱 -> 由高光谱数据合成的多光谱数据
- 模型
	- 考虑现实世界情况, 带kernel的模型([rbf](https://en.wikipedia.org/wiki/Radial_basis_function_network) )比较合适?

## 用多光谱做awb

 即在多光谱数据中去掉光源的影响. 多光谱 + 光源分布 -> 光源的 rgb illuminant vector. 

- 数据采集: (多光谱, rgb illuminant vector) 数据对
	- 自然状态下采集的光源的高光谱数据集 -> 转换成多光谱数据集和rgb illuminant vector数据集
	- 仿真: 从已知 (相机拍摄的rgb图片,rgb illuminant vector)  + 相机的response曲线 + 光源的光谱数据集 + 反射谱数据集 -> 推测出图片每个像素的光谱
		- `相机的response曲线 * 光源的光谱 = rgb illuminant vector`
		- `相机的response曲线 *  光源的光谱 * 反射谱 = rgb像素`
		- 用[最大似然估计](https://en.wikipedia.org/wiki/Maximum_likelihood_estimation) 的想法, 先估计出图片光源光谱, 再估计出每个像素的反射光谱

## reference

[1]  Koskinen, Samu, Erman Acar, and Joni-Kristian Kämäräinen. “Single Pixel Spectral Color Constancy.” _International Journal of Computer Vision_, September 1, 2023. [https://doi.org/10.1007/s11263-023-01867-x](https://doi.org/10.1007/s11263-023-01867-x).