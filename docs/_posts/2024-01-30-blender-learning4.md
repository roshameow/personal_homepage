---
layout: post
title: "blender学习: 用graph editor做赛博车流"
categories:
  - blender
tags:
  - content
  - render
  - shader
last_modified_at: 2024-02-01T22:14:22-08:00
---
## 步骤

参考RuiHuang_art在[b站的教学视频](https://www.bilibili.com/video/BV19C4y1S7dL/) 
- world property: 加入一个CyberPunk背景的贴图
	- [texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 选择camera坐标
- 制做车流:
	- 添加一个Plane mesh
	- 在Edit编辑模式下, 按A选中, [S+X, S+Y](https://blog.csdn.net/BuladeMian/article/details/79625926) 沿X,Y轴双向拉伸, 拉成长条形
- shader: 目的是把车流改成带纹理, 自发光, 透明的效果
	- color:
		- 下载一个灯火通明的城市俯瞰图
			- ![Pasted image 20240201173155.png]({{ '/docs/attachment/Pasted image 20240201173155.png' | relative_url }}){:width="100"} 
		- 我们只想要图中亮的地方
	- emission: 把贴图纹理连到bsdf的[emission](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/emission.html)
		- 需要调整strength: 把strength调大之后好像发的都是白光?
	- alpha(调整车流的透明度): 除了贴图本身暗的地方转成透明, 我们还想要一个两端完全透明->中心的渐变
		- 根据原图亮度设置透明: 暗处透明, 亮处不透明
			- 给贴图连接一个Color Ramp
		- 设置两端完全透明->中心的渐变
			1.  用[texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 的uv生成平面的坐标
			2. 用[Gradient Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/gradient.html) 提取x方向
			3. 用 [Color Ramp](https://docs.blender.org/manual/en/latest/editors/texture_node/types/converter/color_ramp.html) 做一个 暗->亮->暗 的渐变
		- 用[Mix Node](https://docs.blender.org/manual/en/latest/compositing/types/color/mix/mix_color.html) 把上面两个控制透明度的图融合
			- 调成Multiply模式: 原视频用的是Mix模式, 把一个设成alpha, 和黑色平均..这应该和直接用Multiply等价..
		- 在Material Properties把blend改成alpha blend
	- 用[Hue/Saturation/Value Node](https://docs.blender.org/manual/en/latest/render/shader_nodes/color/hue_saturation.html) 调颜色
- 加入动画: 
	- 在shader里给贴图加上mapping
	- 调整mapping的location
		- 在Mapping的location插入关键帧
		- 在[Graph Editor](https://docs.blender.org/manual/zh-hans/dev/editors/graph_editor/fcurves/editing.html) 里编辑: 需要快捷键T调出Select Box, 把需要更改的mapping选中
		- 选中后在Graph Editor的Shader Nodetree里编辑Y Default Value
		- 添加Modifier, 把x^1改成需要的速度0.05
	- 另外用[Object Info](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/object_info.html) 获取object的位置加到location里, 给每个不同位置的车流加一个location的变化
- 复制多个车流组合
- 结果: 当然也只能远看
	- ![car_flow.mp4]({{ '/docs/attachment/car_flow.mp4' | relative_url }}){:width="320"}

## shader流程

![Pasted image 20240201172349.png]({{ '/docs/attachment/Pasted image 20240201172349.png' | relative_url }}){:width="800"} 