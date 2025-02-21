---
layout: post
title: "blender学习: 做流光效果"
categories:
  - blender
tags:
  - content
  - shader
  - curve
last_modified_at: 2025-02-09T09:12
created: 2024-03-11T22:59
---
用金属材质反射world背景的流动
### 步骤: 

参考[这个教学视频](https://www.bilibili.com/video/BV1Ny421q7HM/)
-  制作物体: 
	- 添加curve
	- 调整Data->Geometry->Bevel(倒角)->Round-> Depth: 把曲线变成软管
	- 加modifier->subdivisor
- shader: 
	- object: 用principled BSDF, 把metallic调到1, roughness 调整到0.1
	- world: 
		- 在background添加流动材质
			- 设置[texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html)  generate->Mapping(Y=#frame/40)->background图片
		- 得到黑色背景
			- 添加一个黑色背景, [用Light Path Node的Is Camera Ray控制混合](https://blenderartists.org/t/why-use-is-camera-ray-in-the-world/650625/3) : 背景和物体分开的原理?
- light: 改成sun, 给物体增加反光
- 结果: 
	- ![color_change.mp4]({{ '/docs/attachment/color_change.mp4' | relative_url }}){:width="300"} 


 