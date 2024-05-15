---
layout: post
title: 小红书学到的几种图片调色 (二)
categories:
  - photo
tags:
  - content
  - photoshop
  - shortcut
  - filter
  - color
  - camera_raw
last_modified_at: 2024-05-13T16:21:54-08:00
---
## 人物美白


[教程](https://www.xiaohongshu.com/explore/661ab1fb000000000401bfe2)

- cameraRaw滤镜
	- 基本: 
		- - 色温, + 色调
		- + 曝光, + 对比度, -高光
	- 混色器: 
		- 色相: + 红色, -橙色, --蓝色
		- 明亮度: -红色
	- 校准:
		- 绿原色: +色相
		- 蓝原色: +饱和度

我明白了这件事的难度, 肤色和环境光的作用太subtle了, 美的定义又太多样了. 难怪现在无论什么滤镜都没法把所有人统一的变漂亮.


## 梦幻发光

![Pasted image 20240428143139.png]({{ '/docs/attachment/Pasted image 20240428143139.png' | relative_url }}){:width="200"} ![Pasted image 20240428143157.png]({{ '/docs/attachment/Pasted image 20240428143157.png' | relative_url }}){:width="200"} ![Pasted image 20240428143227.png]({{ '/docs/attachment/Pasted image 20240428143227.png' | relative_url }}){:width="200"} 

[教程](https://www.xiaohongshu.com/explore/660fbca9000000001a014c53) 

- 调整画面颜色(增加绿色): 可选颜色, 在 [CMYK 颜色](https://en.wikipedia.org/wiki/CMYK_color_model) 调整
	- 黄色: + 青色,黄色,黑色  -洋红
	- 绿色: + 青色,黄色  -洋红,黑色
- 给高光部分做高斯模糊
- 混合模式改为变亮
- 和blender里面的[bloom(辉光)](https://docs.blender.org/manual/en/latest/render/eevee/render_settings/bloom.html) 功能原理一样



## 赛博朋克

[教程](https://www.xiaohongshu.com/explore/65be0795000000002c015bf1) 
- 增加暗处清晰度
- 把整体颜色调成偏蓝, 偏红
-  在阴影,高光的地方分别加冷暖色
- 在混色器里把所有附近颜色调的偏青色, 洋红


这效果并不好看...


## EVA红色天空



![Pasted image 20240513161940.png]({{ '/docs/attachment/Pasted image 20240513161940.png' | relative_url }}){:width="300"} ![Pasted image 20240513161959.png]({{ '/docs/attachment/Pasted image 20240513161959.png' | relative_url }}){:width="300"} 


[教程](https://www.bilibili.com/video/BV1Xj411r7P5/)

- 把颜色调成好看的红橙色

## photoshop快捷键

- command+alt+shift+E(盖印)
	- 把效果和图层合并生成一个新图层
- command+alt+2(提取高光)
	- command+J 可以把高光变成一个新图层

## 可选颜色功能

- 根据选中的颜色设置一个mask, 只调整mask之中的颜色
	- 颜色容差控制mask边缘的模糊程度
	- CMYK调整RGB单个通道对应的互补色
- 可以用颜色取样工具监测颜色的变化 

## CameraRaw(ACR)参数理解

1. 基本
	1. 色温(Temperature)/色调(Tint): 改变**图片整体**hue
		1. 色温调整蓝/黄, 色调调整洋红/绿
	2. 自然饱和度/饱和度: 改变图片的Saturation
		1. 自然饱和度只增加图片饱和度低的地方的饱和度
		2. 饱和度增加图片整体饱和度
	3. 亮度(Brightness): 所有像素变亮
	4. 对比度(Contrast): 增加和0.5距离的绝对值
	5. 高光/阴影/白色/黑色: 调整清晰度
		1. 高光/阴影: 只会影响图片的 亮部/暗部 
		1. 白色/黑色: 影响图片整体
3. 混色器: [教程](https://www.bilibili.com/video/BV1584y1C7nP/) 
	- HSL(Hue, Saturation, Lightness) 调整:
		1. 对图片上颜色归类(按红,橙,黄,绿,青,蓝,紫,洋红分为8类)
		2. 调整**所选颜色附近45度的颜色**mask, 颜色拉到最右侧是变成下一级
			- 比如红色hue拉到100, 会把红色调成橙色
1. 颜色分级: [教程](https://www.bilibili.com/video/BV1zQ4y1R7J2/) 
	1. 把图片分为高光,中间调, 阴影
	2. **在对应亮度的像素位置增加颜色**
		1. 调整颜色面板和下面的(色相,饱和度,明亮度)是一样效果: 都是选颜色
	3. 平衡: 控制偏高光还是偏阴影
2. 校准: [教程](https://www.bilibili.com/video/BV1JK411d7ed/) 
	1. 调整图片上所有颜色, 把所有颜色顺时针旋转, **原色附近权重更大** 


- 颜色调整的精细度: 混色器 > 校准的原色 > 基本的色温/色调
- 测试:
	- 用色环测试颜色调整的效果
	- 用灰度卡测试亮度变化效果
- photoshop找不到功能的具体公式, 只能靠一些网络教程, 有些功能实在没法一下明白...
- 一般需要想好要什么颜色, 然后看着调...

## reference 

[1]  https://www.zhihu.com/question/54879117#:~:text=高光和白色滑块,的保护更好一些%E3%80%82    高光/阴影/白色/黑色讨论, 看完还是没懂

[2] Paris, Sylvain, Samuel W Hasinoff, and Jan Kautz. “Local Laplacian Filters: Edge-Aware Image Processing with a Laplacian Pyramid,” n.d.      据说可能是高光/阴影的公式

[3] https://lab.magiconch.com/eva-title/?layout=e10 EVA字体生成器