---
layout: post
title: 常用的图像 reconstruction loss
categories:
  - deeplearning
tags:
  - content
  - loss
  - image
last_modified_at: 2024-02-28T15:07:13-08:00
---

输出为图像的任务, 比如enhance, deblur, super-resolution, generation等用到的loss, 主要分为以下几类
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


## output图像符合自然图像的性质(image prior)

| loss | 公式 | 目的 | 特点 |
| ---- | ---- | ---- | ---- |
| Total Variant(TV) | anisotropic定义:<br>$\|\|D_x I\|\|_1+\|\|D_y I\|\|_1$ | 图像gradient稀疏性 |  |
|  |  |  |  |

## output图像分布符合自然图像的分布

| loss | 公式 | 目的 | 特点 |
| ---- | ---- | ---- | ---- |
| [IS](https://pytorch.org/ignite/generated/ignite.metrics.InceptionScore.html)  <br>(Inception Score)<br>[另一个代码](https://github.com/sbarratt/inception-score-pytorch/tree/master) | $KL(p\|\bar p)$<br>$p$ 是当前图像在Inception v3的分类分布<br>$\bar p$ 是所有生成图像的分类分布的平均<br>[KL散度](https://en.wikipedia.org/wiki/Kullback–Leibler_divergence)计算两个分布距离<br> | 图像多样性:<br>每个图像的分类分布<br>和图像平均分布差距大<br> | 生成模型也需要在ImageNet上训练才有意义<br> |
| [FID](https://en.wikipedia.org/wiki/Fréchet_inception_distance)  <br>(Freachet Inception  <br>Distance) | $d_F=\|\|\mu_1-\mu_2\|\|^2_2+tr(\Sigma_1+\Sigma_2-2\sqrt{\Sigma_1\Sigma_2})$ <br>$\mu_1,\Sigma_1$ 是generated images的分布的mean, variance<br>$\mu_2,\Sigma_2$ 是real images的分布的mean, variance<br>$d_F$ 是Freachet Distance, 可以衡量两个多维分布的距离 | 图像分布接近真实 | 用到的也是图像通过一个分类网络得到的vector的分布 |
| sFID |  | 图像分布接近真实 | 和FID一样, 只是特征提取用的是中间层 |




## 代码

[**reconstruction_loss.py**](https://gist.github.com/roshameow/c59d5708610ae30eb4329b140ccab3a7#file-reconstruction_loss-py) 


## 其他讨论这个的链接：

[1] https://www.jiqizhixin.com/articles/2019-01-10-18 inception loss



