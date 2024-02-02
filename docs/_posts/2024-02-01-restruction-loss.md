---
layout: post
title: 常用的图像 reconstruction loss
categories:
  - deeplearning
tags:
  - content
  - loss
  - image
last_modified_at: 2024-02-02T12:02:40-08:00
---

输出为图像的任务, 比如enhance, deblur, super-resolution等用到的loss, 主要分为以下两类
## output和label相近

| loss | 公式 | 目的 | 特点<br> |
| ---- | ---- | ---- | ---- |
| L1 loss | $\|\|I_1-I_2\|\|_1$ | 大体相近 | 最常用的loss |
| L2 loss<br>(MSE) | $\|\|I_1-I_2\|\|_2$<br>或$MSE=\overline{(I_1-I_2)^2}$ |  | 因为导数是线性所以计算最快 |
| [SSIM]([https://github.com/CVMI-Lab/UHDM/blob/main/utils/common.py](https://github.com/CVMI-Lab/UHDM/blob/main/utils/common.py)) <br>(stuctural similarity<br> index measure) | $\frac{2\mu_1\mu_2+C_1}{\mu_1^2+\mu_2^2+C_1}\cdot \frac{2\sigma_{12}+C_2}{\sigma_1^2+\sigma_2^2+C_2}$ <br>$\mu, \sigma$ 分别为mean, variance<br>$\sigma_{12}$是covariance<br>$C_1, C_2$ 是常数 | 纹理相近 | 要分patch计算<br>$C_1, C_2$ 的值要根据图像的范围调整 |
| PSNR<br>(Peak signal-<br>to-noise ratio) | $-10\log_{10}(MSE(I_1,I_2))$ |  | 经常是用来验证 |
| [PerceptualLoss]([https://github.com/varun19299/deep-atrous-guided-filter/tree/master/PerceptualSimilarity](https://github.com/varun19299/deep-atrous-guided-filter/tree/master/PerceptualSimilarity)) | 一个分类网络 | 语义相近 | 一般用vgg16, 输入RGB图像<br>一般会用后几层的语义特征对比<br> |
| [LPIPS](https://github.com/richzhang/PerceptualSimilarity) <br>(Learned Perceptual<br>image patch similarity) |  |  | perceptualLoss+分块 |
| DeltaE | 转换成Lab空间的MSE | 颜色相近 |  |
| Gan Loss | 在训练过程中学习到的loss<br>用determinate网络表示<br> | determinate网络<br>区别不出 |  |
| KL散度 |  |  |  |

## output图像符合自然图像的性质

- Total Variant(TV) loss: 图像gradient稀疏性
	- anisotropic定义: `$|D_x I|_1+|D_y I|_1$`  

## 代码

[**reconstruction_loss.py**](https://gist.github.com/roshameow/c59d5708610ae30eb4329b140ccab3a7#file-reconstruction_loss-py) 