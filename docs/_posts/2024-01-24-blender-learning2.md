---
layout: post
title: "blender学习: 用displacement做动态鸟群"
categories:
  - blender
tags:
  - content
last_modified_at: 2024-02-11T19:36:56-08:00
---
## 步骤

参考RuiHuang_art在[b站的教学视频](https://www.bilibili.com/video/BV1ta4y1f7ui/)
- world property: background改成黑色
- 加入鸟群所在的mesh
- 加入鸟群贴图: 在material property里修改
	- 把贴图连到alpha通道
	- blend mode改为alpha blend
- 加入displacement: 在modifier property里修改
	- 加入subdivision surface: 用[Catmull-Clark](https://en.wikipedia.org/wiki/Catmull–Clark_subdivision_surface) 的方法细分(迭代进行, 每次加入新的点后, 会移动顶点位置, 让整体更平滑)
		- levels viewport 增加到5: 对应编辑时, 看到的细分的迭代次数, 可以调的比render低一些
		- render增加到5: 对应最终渲染时, 看到的细分的迭代次数
	- 加入displace: 根据texture的灰度值变换顶点的coordinate
		- 代码可能在: https://github.com/blender/blender/blob/main/source/blender/modifiers/intern/MOD_volume_displace.cc
		- 加入texture->调整texture的属性
			- type用Clouds, 也就是[Perlin noise](https://en.wikipedia.org/wiki/Perlin_noise) : 多个不同粒度的随机叠加
				- Depth参数控制模糊程度: 应该是Perlin noise生成时的粒度有几层
				- 其中nabla($\nabla$ ) 参数好像对Perlin noise没影响..
		- coordinate设置成global: 每个世界坐标位置根据texture固定displacement(如果是local就会相对于我们的mesh不动)
		- direction: 就用默认的normal, 我们的mesh是个平面, 和用z axis一样
		- 调整stength到0.1
- 加入运镜，参考教学视频 [https://www.bilibili.com/video/BV1eq4y1y7D2](https://www.bilibili.com/video/BV1eq4y1y7D2/?vd_source=9cd152be6fbc1b9ad36a33604a13fb6e) 
	- 在layout界面开启auto key之后，点击播放：这个时候鼠标只能移动，需要按G快捷键配合移动。
	- 在animation界面看效果.
- 输出视频: 这么做只是鸟的贴图在平面上波动, 不能细看. 
	- ![0030-0090.mp4]({{ '/docs/attachment/0030-0090.mp4' | relative_url }}){:width="200"} 


## 其他方法

用粒子系统制作, 参考 [这个b站教程](https://www.bilibili.com/video/BV11i4y1r7GU/) : 实在啰嗦我没有耐心看😂

