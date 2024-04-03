---
layout: post
title: "blender学习: 做火焰效果"
categories:
  - blender
tags:
  - content
  - render
  - shader
  - 粒子系统
last_modified_at: 2024-03-25T17:49:30-08:00
---
火焰的形状用圆形变形一半获得. 用[Perlin noise](https://en.wikipedia.org/wiki/Perlin_noise)使坐标变形制作随机抖动. 用Emission node渲染发光效果. 

## 用graph editor和noise texture -> 飞行器火焰
### 步骤

参考RuiHuang_art在[b站的教学视频](https://www.bilibili.com/video/BV1HH4y1Y7Vv/) , 和做车流用到的功能差不多
- world property: 加入一个背景的贴图
- 制做一个平面的火焰:
	- 添加一个Plane mesh
	- 分成两半: 在Edit编辑模式下, 按Ctrl+R加[loop cut](https://docs.blender.org/manual/en/latest/modeling/meshes/tools/loop.html) , 在edge中间添加新的顶点,
	- 把一半拉长: 选中顶点后按G+Y在Y轴拉伸 
- shader: 目的是制作一个自发光, 半透明, 抖动的效果
	- 颜色效果: 
		1. 用[texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 生成uv坐标
			- 在mapping里把x,y的location调到-2, scale调到4
			- uv坐标系好像范围是(-scale/2, scale/2)
		3. 用[Gradient Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/gradient.html) 的spherical: 制作从外到内的渐变
		4. 自发光: 用[Color Ramp](https://docs.blender.org/manual/en/latest/editors/texture_node/types/converter/color_ramp.html) 做一个 蓝->白->红->黄 的渐变
		5. 调整透明度: 用[Color Ramp](https://docs.blender.org/manual/en/latest/editors/texture_node/types/converter/color_ramp.html) 做一个 透明->半透明->透明 的渐变
		6. 连接bsdf
			- 把Emission和transparent bsdf用Mix shader连接在一起
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

## 用displacement+粒子系统 -> 卡通火焰
### 步骤: 

参考小红书[KurTips的教学](https://www.xiaohongshu.com/explore/658636a9000000003c010c5d) 
- 制作火焰形状
	- 添加一个cube mesh
	- 在modifier里加subdivision surface
	- 在Edit Mode, 打开Propotional Editing(衰减编辑), 选择最上面vertex, 按G+V可以在z轴拉伸
	- 制作焰心: 复制一个更小的放在前面
	- 选中两个object, 右键[shade smooth](https://docs.blender.org/manual/en/latest/scene_layout/object/editing/shading.html) 
		- shader计算时, 三角形内的normal vector由三个顶点的normal vector插值得到
	- 合并两个object: [Ctrl+J](https://docs.blender.org/manual/en/4.2/scene_layout/object/editing/join.html) 
- shader: 设置[texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html)  generate->Separate XYZ->Gradient Texture->ColorRamp-> Emission
	- 把大小两块用不同的材质
		- 进入Edit Mode, 随便选中一个点, Ctrl+L可以把原本的大小两个object分别选中
		- 在Material添加材质
	- ColorRamp颜色: 外焰: 红->黄 ; 焰心: 红->橙红
- 抖动效果: 用displacement实现
	1. 在Modifier添加displace: 选Clouds材质, 调整Size, Depth=1, displacement的Stength
	2. 让displacement的强度从上到下渐变: 用顶点组实现
		1. 定义顶点组: 在Edit Mode开透视模式, 选中上面一部分顶点; 在Oject的Data里添加vetex group, 把刚才选中的部分顶点assign给这个顶点组
		3. 在[Weight Paint](https://docs.blender.org/manual/en/latest/sculpt_paint/weight_paint/index.html)模式, 增加weight->[smooth->iteration](https://docs.blender.org/manual/en/2.79/sculpt_paint/painting/weight_paint/weight_tools.html): 让 in Vertex Group-> outside Vertex Group 的渐变更光滑
			- smooth操作的每个iteration都是和邻域的顶点做平滑
		4. 在displace的vertex group选择顶点组
	1. 制作displacement的动态: 通过绑定一个空坐标轴实现
		1. 在displace的Coordinates选择object, 物体选择我们的空坐标轴
		2. 修改空坐标轴的Oject->Transform的z轴的值, 改为: `#frame/100(帧数/100)` 
			- 这样做比用[Graph Editor](https://docs.blender.org/manual/zh-hans/dev/editors/graph_editor/fcurves/editing.html) 方便不少👍
- 制作火星: 用粒子系统 
	1. 在火焰里添加一个圆环mesh
	2. 进入Edit Mode, 填充: 快捷键F
	3. 修改Particles参数:
		- Field Weight-> Gravity改为0: 让粒子向上
		- Velocity-> normal改为2
		- Emission: 调整Frame_start, Frame_end, lifetime(和velocity共同控制粒子移动的距离)
		- Physics-> Brownian改为10.5: 让粒子做布朗运动
	1. 调整火星材质: 
		1. 制作一个多面体mesh, subdivision改成1: 减小计算量
		2. 把多面体的shader改成自发光, 调整color, strength适当增大
		3. **打开eevee渲染器的[bloom(辉光)](https://docs.blender.org/manual/en/latest/render/eevee/render_settings/bloom.html) 功能** : 通过blur发光区域模拟光线在周围大气散射的效果
		4. 制定Particles->Render参数:
			1. Render As调成Object模式, Render->Instance选择我们的制作的多面体mesh
			2. scale调小, scale Randomness调大: 让粒子大小不一
- 结果: 因为焰心的制作方法, 只能在一定角度看. 
	- ![fire_cartoon_cut.mp4]({{ '/docs/attachment/fire_cartoon_cut.mp4' | relative_url }}){:width="200"} 

## 火焰效果的片段

[1] 冰海战记s2ep5的放火场景

## reference 

[1] https://zhuanlan.zhihu.com/p/484222862 辉光效果