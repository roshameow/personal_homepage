---
layout: post
title: 传感器颜色调制 (一)
categories:
  - algorithm
tags:
  - content
  - sensor
last_modified_at: 2023-12-27T15:14:21-08:00
---
## 调制

一般把信号区分出来的过程叫调制。现在一般的传感器只能感应2d的光学信号强度(就是灰度图)，把不同波长的光分离，以获取特定光谱范围的信息的过程，就叫颜色调制。比如信号经过rgb的滤光片，得到彩色图像。

所有调制都是通过牺牲一部分空间精度为代价获得其他层次信息。

## 通过排布滤光片进行颜色调制

像传统的rggb bayer和quad bayer一样，可以用不同方式排布多光谱的滤光片。如：
### 几种排布像素的方法

1. **把像素不断二分[1](#ref)** 
	- ![Pasted image 20231227093202.png]({{ '/docs/attachment/Pasted image 20231227093202.png' | relative_url }}){:width="400"}  
	- 如果不是$2^n$ 个通道，没法保证所有通道的像素密度一样。比如图上5个通道的情况。1，2通道的密度就比3，4，5的密度低。
	- 但是这样做可以让每个相同通道的间距相等。
2. **间隔相等斜向排布[2](#ref)**  
	- ![Pasted image 20231227093439.png]({{ '/docs/attachment/Pasted image 20231227093439.png' | relative_url }}){:width="200"} 
	- 能保证每个channel的像素相邻的channel一直是一样的
	- 但是这样在各个方向上像素密度极度不均匀：比如图上5个通道情况，横竖方向相隔4个像素，斜向却相隔0个，3个像素
3. **分成primary channel和secondary channel两组 [3](#ref)**
	- 把secondary channel穿插在primay channel中
	-  ![Pasted image 20231227100416.png]({{ '/docs/attachment/Pasted image 20231227100416.png' | relative_url }}){:width="200"}
	- 图中a,b,c是primary channel，像素密度高； d,e,f,g 是secondary channel，像素密度低
4.  **一个实拍的样例**
	- ![Pasted image 20231227114816.png]({{ '/docs/attachment/Pasted image 20231227114816.png' | relative_url }}){:width="300"} 
	- 图中是8个通道的sensor实拍图做了伪彩变换之后的样例
	- filter不同channel之间贴了黑胶阻挡(除了阻挡更多光线进入sensor以外，没什么积极意义)

### 排布像素的规则

- 根据不同通道的功能先确定需要的像素密度

### 采用滤光片排布调制的问题：

- 技术本身的问题：
	- 现在一般用[FP-干涉][FP-干涉]技术来制作多光谱sensor需要的窄波段，FP-干涉需要使用多层透镜实现，相当于严重降低光线透过率
	- mask均匀排布，会导致有些地方的傅立叶系数是0，不利于做reconstruction
- 工厂生产的问题：
	- 生产的一个filter的尺寸最小在10um左右，但是目前的手机用的单像素尺寸在[0.6～2.4um][像素尺寸](单像素2.4um已经是非常好的CMOS了)，不得不用类似quad bayer的做法让一个filter对应多个像素，无疑会影响调制的精度
	- 透镜部分和成像部分不贴合：透镜距离sensor的感光区域有大约3um的垂直距离，会导致像素中有效信息进一步降低
	- 透镜偏移，没有和像素的位置对应：导致传感器之间的差异很大




[像素尺寸]: https://www.igao7.com/news/202204/Xo2jTjWP67ayPtIA.html
[FP-干涉]: https://en.wikipedia.org/wiki/Fabry–Pérot_interferometer

<span id="ref"></span>
[1]  Lidan Miao and Hairong Qi. “The Design and Evaluation of a Generic Method for Generating Mosaicked Multispectral Filter Arrays.” _IEEE Transactions on Image Processing_ 15, no. 9 (September 2006): 2780–91. [https://doi.org/10.1109/TIP.2006.877315](https://doi.org/10.1109/TIP.2006.877315).

[2] Aggarwal, Hemant Kumar, and Angshul Majumdar. “Single-Sensor Multi-Spectral Image Demosaicing Algorithm Using Learned Interpolation Weights.” In _2014 IEEE Geoscience and Remote Sensing Symposium_, 2011–14. Quebec City, QC: IEEE, 2014. [https://doi.org/10.1109/IGARSS.2014.6946857](https://doi.org/10.1109/IGARSS.2014.6946857).

[3] Yasuma, Fumihito, Tomoo Mitsunaga, Daisuke Iso, and Shree K. Nayar. “Generalized Assorted Pixel Camera: Postcapture Control of Resolution, Dynamic Range, and Spectrum.” _IEEE Transactions on Image Processing_ 19, no. 9 (September 2010): 2241–53. [https://doi.org/10.1109/TIP.2010.2046811](https://doi.org/10.1109/TIP.2010.2046811).


