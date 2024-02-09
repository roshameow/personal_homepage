---
layout: post
title: "blender学习: 做火焰效果"
categories:
  - blender
tags:
  - content
  - render
  - shader
last_modified_at: 2024-02-09T08:51:37-08:00
---

## 用graph editor和noise texture
### 步骤

参考RuiHuang_art在[b站的教学视频](https://www.bilibili.com/video/BV1HH4y1Y7Vv/) , 和做车流用到的功能差不多
- world property: 加入一个背景的贴图
- 制做火焰:
	- 添加一个Plane mesh
	- 分成两半: 在Edit编辑模式下, 按Ctrl+R加[loop cut](https://docs.blender.org/manual/en/latest/modeling/meshes/tools/loop.html) , 在edge中间添加新的顶点,
	- 把一半拉长: 选中顶点后按G可以拉伸, 但是没法控制只在一个轴的方向拉
- shader: 目的是制作一个自发光, 半透明, 抖动的效果
	- 颜色效果: 
		1. 用[texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 生成uv坐标
			- 在mapping里把x,y的location调到-2, scale调到4
			- uv坐标系好像范围是(-scale/2, scale/2)
		3. 用[Gradient Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/gradient.html) 的spherical: 制作从外到内的渐变
		4. 自发光: 用[Color Ramp](https://docs.blender.org/manual/en/latest/editors/texture_node/types/converter/color_ramp.html) 做一个 蓝->白->红->黄 的渐变
		5. 调整透明度: 用[Color Ramp](https://docs.blender.org/manual/en/latest/editors/texture_node/types/converter/color_ramp.html) 做一个 透明->半透明->透明 的渐变
		6. 连接bsdf
			- 把Emmision和transparent bsdf用Mix shader连接在一起
	- 抖动效果:
		1. 用[texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 生成object坐标
		2. 用[Noise Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/noise.html) 扭曲坐标, 制作抖动效果: noise texture和displacement的cloudy texture效果差不多
			- 用[Mix Node](https://docs.blender.org/manual/en/latest/compositing/types/color/mix/mix_color.html) 的Multiply把两个坐标混合
		3. 用[Graph Editor](https://docs.blender.org/manual/zh-hans/dev/editors/graph_editor/fcurves/editing.html) 调整mapping的y坐标的location, 形成动态的扭曲
- 把火焰的plane mesh旋转复制出多个绕y轴一圈
	- 在shader里选中一个materail[复制给所有mesh](https://blender.stackexchange.com/questions/7044/copy-material-to-another-object) 
	- 复制完想修改所有的mesh形状但是没找到方法
- 结果: 我复制的次数比较少, 而且颜色也不好看,  形状也拉的不太对
	- ![fire.mp4]({{ '/docs/attachment/fire.mp4' | relative_url }}){:width="320"} 

### shader流程

![Pasted image 20240208164250.png]({{ '/docs/attachment/Pasted image 20240208164250.png' | relative_url }}){:width="600"} 

## 用displacement+粒子特效


参考小红书[KurTips的教学](https://www.xiaohongshu.com/explore/658636a9000000003c010c5d) 