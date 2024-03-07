---
layout: post
title: "blender学习: 做卡通描边"
categories:
  - blender
tags:
  - content
  - material
  - stoke
  - modifier
last_modified_at: 2024-03-07T12:14:23-08:00
---
## 用solidify+背面剔除+法线翻转

给mesh增加厚度, 让描边材质只在厚度边缘生效
### 步骤: 

参考[这个教学视频](https://www.bilibili.com/video/BV1Ju4y197yk)

- shader: 
	- 选择一个主material的效果(Slot 1): 用Diffuse BSDF->shader to RGB->Color Ramp->Emission
	- 添加一个描边材质(Slot 2): 用Emission, 选择我们描边的颜色
		- 对这个材质开启Backface Culling(背面剔除)
-  在Modifier添加[solidify](https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/solidify.html): 给mesh表面增加厚度
	- ![Pasted image 20240307120524.png]({{ '/docs/attachment/Pasted image 20240307120524.png' | relative_url }}){:width="100"} ![Pasted image 20240307120542.png]({{ '/docs/attachment/Pasted image 20240307120542.png' | relative_url }}){:width="110"} 
	- 调整thickness=-0.02m
		- offset默认是-1, 要让thickness和offset同方向(让增加的厚度mesh朝外凸)
	- Materials->Material Offset=1 :让solidify的厚度mesh采用我们的描边材质, 即下一个slot的material
	- 开启Normals->flip: 让颜色上到厚度mesh的内表面
- 结果: 对三维的模型描边有种新鲜的观感. 
	- ![stoke.mp4]({{ '/docs/attachment/stoke.mp4' | relative_url }}){:width="300"}
	- 描边的前提是提取边缘. 如果是二维图像有很多做法, 比如自动提取图像的边缘合并. 对于我们自己建的模型当然也有办法提取边缘. 但是如果其他方式得到的模型(比如扫描得到的模型), 我们怎么识别边缘, 然后edit呢?

## blender使用技巧

- 复制material和modifier: 
	- 按[这个方法](https://blender.stackexchange.com/questions/7044/copy-material-to-another-object) 可以复制到全部, 但是没法选择materail的单个slot😠, 只能全部复制过去?


## 其他描边效果

[1] https://svg-animation-booklet.vercel.app/chapter5.html#实现动画 svg描边动画
 