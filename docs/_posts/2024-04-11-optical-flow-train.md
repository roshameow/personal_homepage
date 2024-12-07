---
layout: post
title: 小面积光流传感器算法测试 (一)
categories:
  - algorithm
tags:
  - content
  - optical_flow
  - opencv
  - test
last_modified_at: 2024-05-08T22:26:59-08:00
---
大概分为: preprocess -> instant flow compute -> filter correct 三个步骤

## 计算连续两帧的光流

| 算法                                                                      | 改进                                                                           | 公式                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | 效果                                                                                      | 存储占用                                                        |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| LK<br>[Lucas-Kanade](https://en.wikipedia.org/wiki/Lucas–Kanade_method) |                                                                              | 对图像$I$ 的每个像素, 有 $\frac{\partial I}{\partial x}dx+\frac{\partial I}{\partial y}dy=\frac{dI}{dt}$ <br>即, $\begin{bmatrix}dx \\\ dy\end{bmatrix}=\begin{bmatrix}\frac{\partial I}{\partial x}\frac{\partial I}{\partial x} & \frac{\partial I}{\partial x}\frac{\partial I}{\partial y} \\\ \frac{\partial I}{\partial x}\frac{\partial I}{\partial y} & \frac{\partial I}{\partial y}\frac{\partial I}{\partial y} \end{bmatrix}^{-1}\begin{bmatrix}\frac{\partial I}{\partial x}\frac{dI}{dt} \\\ \frac{\partial I}{\partial y}\frac{dI}{dt}\end{bmatrix}=H^{-1}\begin{bmatrix}\frac{\partial I}{\partial x}\frac{dI}{dt} \\\ \frac{\partial I}{\partial y}\frac{dI}{dt}\end{bmatrix}$<br>其中$\frac{\partial I}{\partial x}\approx I(x+1,y)-I(x,y)$  <br> | 只在光流在0-1附近有效(即subpixel的尺度)<br><br>和$\frac{\partial I}{\partial x}$ 的计算方式有关              |                                                             |
|                                                                         | LK_MEAN_NORM<br>                                                             | 把$\frac{dI}{dt}$ 改为 $\frac{dI}{dt}-mean(\frac{dI}{dt})$<br>($mean(\frac{dI}{dt})$ 表示整体亮度的变化, 和光流无关)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | 解决亮度变化的情况                                                                               |                                                             |
|                                                                         | @pre_shift                                                                   | 先对齐到上一次计算的光流位置                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                         |                                                             |
|                                                                         | @compute_pyd                                                                 | 把图像分为多层下采样计算                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |                                                                                         |                                                             |
|                                                                         | LK-DIS<br>dense inverse search<br>结合两种方法                                     | 分块计算<br>- 每块都迭代计算光流<br>&ensp;&ensp;- 先按整像素移动到ssd最小的位置<br>&ensp;&ensp; - 再用LK_MEAN_NORM的方法不断微调计算光流<br>&ensp;&ensp; &ensp; &ensp; - 按照光流计算的方向对齐, 计算ssd<br> &ensp;&ensp;&ensp; &ensp;  - ssd不再变小就跳出循环<br>用所有分块的平均光流作为最终结果                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | 比LK更稳定                                                                                  | 需要所有patch的Hessian, dx, dy矩阵<br><br>对齐patch时移动patch的中间结果<br> |
| 像素neighbor patch比对<br>                                                  |                                                                              | $diff=dist(F(I_1(x,y))-F(I_2(x+dx,y+dy)))$ <br><br>$argmin_{(dx,dy)}\sum_{x,y}dist(F(I_1(x,y))-F(I_2(x+dx,y+dy)))$ <br>其中, $F$ 是特征提取器, dist是距离函数                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                         |                                                             |
| : 特征                                                                    | SAD_SIMPLE<br>sum of average differences                                     | $sad=L_1(diff)$<br>或者$sad=L_1(diff-mean(diff))$                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 第二种更好                                                                                   |                                                             |
|                                                                         | SAD_SUBPIXEL<br>用多项式拟合sad平面<br>(opencv Farneback<br>也是用多项式拟合, <br>不过拟合的是原图像) | $P(x+\Delta x)\approx P(x)+P^\prime(x)\Delta x+\frac{P^{\prime\prime}(x)}{2}\Delta x^2$ <br>即, $\Delta x=-\frac{P^\prime(x)}{P^{\prime\prime}(x)}$ <br>其中 $P^\prime(x)\approx \frac{dist(x+1,y)-dist(x-1,y)}{2}$ , $P^{\prime\prime}$ 类似<br>-  dx, dy分开计算<br>- 直接用多项式代入也是等价的                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | 没用<br>可能是因为subpixel的部分不符合多项式                                                            |                                                             |
|                                                                         | SAD_BLUR                                                                     | 先对图像做2x2的blur<br>😮‍💨因为觉得不准的地方是不是因为刚好对齐的地方在像素的中间                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 垃圾<br>                                                                                  |                                                             |
| : 距离<br>                                                                | SSD_SIMPLE<br>sum of squared differences<br>                                 | $ssd=Var(diff)$                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 比SAD稳定                                                                                  |                                                             |
|                                                                         | SAD_BINARY                                                                   | $hamming=popcount(ref\ \hat\ current)$<br>其中图像是binary(image-mean(image))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | 效果明显变差<br>binary有没有必要呢?                                                                 |                                                             |
|                                                                         | BINARY_FEATURE                                                               | 用gradient descent训练一个特征                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |                                                                                         |                                                             |
|                                                                         | BINARY_FEATURE_BOOST                                                         | 用adaboost训练一个特征                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                                                                                         |                                                             |
| : neighbor                                                              | SAD_SIMPLE_CROSS<br>neighbor变成cross形状, 节省一些存储                                |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | 节省存储&计算<br>                                                                             |                                                             |
|                                                                         | SAD_SPIRAL                                                                   | - 从上一次的光流位置向外螺旋状计算<br>- 遇到更小的distance提前结束循环                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 节省存储&计算<br>和LK效果类似<br>应该是都用了preshift的原因                                                 |                                                             |
| [phase_correlation](https://en.wikipedia.org/wiki/Phase_correlation)    |                                                                              | $dx,dy=argmax_{x,y} F^{-1}(\frac{F(I_1)\cdot \bar{F(I_2)}}{\|F(I_1)\cdot \bar{F(I_2)}\|})$ <br>相当于提取图像的phase部分<br>然后用cross correlation的dist                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | 在位移太大时效果不好<br>光流在0-6时效果可以 <br>另外如果不做phase correlation,<br>直接做cross correlation<br>效果并不好 | 需要ref和current的fft频域                                         |


## 测试

- 仿真数据: 距离仿真数据的位置
- 真实数据:
	- 稳定性: 电机带动匀速转动
	- 响应速度: 电机急停急转


一些结果$\downarrow$

![result_compare_2000_test.png]({{ '/docs/attachment/result_compare_2000_test.png' | relative_url }}){:width="400"}  ![Pasted image 20240425142720.png]({{ '/docs/attachment/Pasted image 20240425142720.png' | relative_url }}){:width="400"} 

- 对于测试场景来说, 所有subpixel的方法似乎都没有必要
- phase correlation > 训练得到的几种特征平移匹配 $\approx$ sad(-mean(diff)) $\approx$ ssd > sad binary >> sad spiral $\approx$ LK
	- **对图像做detail的提取(如image-blur(image,(6x6)))** 之后, sad的结果得到提高, 和训练得到的特征类似
	- 几个特征平移方法出现错误的地方可能因为超出了搜索范围导致的
	-  平移后diff的例子: ![Pasted image 20240425151045.png]({{ '/docs/attachment/Pasted image 20240425151045.png' | relative_url }}){:width="100"} 
- 响应的测试: 除了lk会反应慢一些, 其他都在可以接受范围内
- 这真是个特别枯燥的工作😑, 很多方法觉得, 啊, 应该不会有效果的, 但还是想着, 坚持着写出来测一下究竟差在哪里吧

## 几种opencv支持的方法测试

- 代码: [**flow_opencv.py**](https://gist.github.com/roshameow/7843f23826791c152ab2ed8c169590b9#file-flow_opencv-py) 
- 复现修改opencv的算法, 有时需要opencv代码的中间结果
	- 因为我没有下载opencv完整的源码, 而是用pip装opencv的库
	- 用`pkg-config --cflags --libs opencv4` 查看opencv的lib,include path
	- 单独把要复现的函数复制一个.cpp, 就可以随便打印中间结果了



## 有用的链接

[1] https://dsp.stackexchange.com/questions/16995/image-reconstructionphase-vs-magnitude 关于图像phase部分的提问

[2] https://homepages.inf.ed.ac.uk/rbf/CVonline/LOCAL_COPIES/OWENS/LECT7/node2.html 解释图像边缘部分的[Phase congruency](https://en.wikipedia.org/wiki/Phase_congruency#:~:text=Phase%20congruency%20is%20a%20measure,changes%20in%20illumination%20and%20contrast.) 更强

![原图](https://homepages.inf.ed.ac.uk/rbf/CVonline/LOCAL_COPIES/OWENS/LECT7/img31.gif) ![PC图](https://homepages.inf.ed.ac.uk/rbf/CVonline/LOCAL_COPIES/OWENS/LECT7/img33.gif) 用Phase Congruency提取图像边缘的结果

[3]  [Phase stretch Transform](https://en.wikipedia.org/wiki/Phase_stretch_transform#:~:text=Phase%20stretch%20transform%20(PST)%20is,time%20stretch%20dispersive%20Fourier%20transform.) 