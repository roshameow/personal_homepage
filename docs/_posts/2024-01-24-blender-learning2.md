---
layout: post
title: "blender学习: 用displacement做动态鸟群"
categories: 
tags:
  - content
  - jekyll
last_modified_at: 2024-01-24T16:47:28-08:00
---
## 步骤

参考RuiHuang_art在[b站的教学视频](https://www.bilibili.com/video/BV1ta4y1f7ui/)
- world property: background改成黑色
- 加入鸟群贴图: 在material property里修改
	- 把贴图连到alpha通道
	- blend mode改为alpha blend
- 加入displacement: 在modifier property里修改
	- 加入subdivision surface
		- levels viewport 增加到5
		- render增加到5
	- 加入displace
		- 加入texture->调整texture的属性
			- type用Clouds, 也就是Perlin noise
				- Perlin noise的参数
		- 调整stength到0.1
- 加入运镜，参考教学视频 [https://www.bilibili.com/video/BV1eq4y1y7D2](https://www.bilibili.com/video/BV1eq4y1y7D2/?vd_source=9cd152be6fbc1b9ad36a33604a13fb6e) 
	- 在layout界面开启auto key之后，点击播放：这个时候鼠标只能移动，需要按G快捷键配合移动。
	- 在animation界面看效果.
- 输出视频: 这么做只是鸟的贴图在平面上波动, 不能细看. 
	- ![0030-0090.mp4]({{ '/docs/attachment/0030-0090.mp4' | relative_url }}){:width="200"} 


## 其他方法

用粒子制作, 参考 [这个b站教程](https://www.bilibili.com/video/BV11i4y1r7GU/) 

