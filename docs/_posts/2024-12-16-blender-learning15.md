---
layout: post
title: "blender学习: 用Grease pencil 涂色"
categories:
  - blender
tags:
  - content
last_modified_at: 2024-12-24T08:46
created: 2024-12-16T16:02
---
参考[这个教学](https://www.youtube.com/watch?v=bX6jtVSJOog)

- 制作物体
- **涂底色**( 用[Texture paint](https://docs.blender.org/manual/en/latest/sculpt_paint/texture_paint/introduction.html)): 设置uv展开, 在3维viewport中涂色, 实际把颜色涂在2维的 uv图上
	- 在Edit Mode下设置uv展开:  [Smart UV Project](https://docs.blender.org/manual/en/latest/modeling/meshes/editing/uv.html) 
	- 用[Mix shader](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/mix.html) 控制
		- 在shader里设置两个material: base material 和 paint material, 用Mix shader连在一起
			- 比如: Principle BSDF + Shader to RGB + Color Ramp
		- 在Texture paint下, [Texture Slot](https://docs.blender.org/manual/en/latest/sculpt_paint/texture_paint/tool_settings/texture_slots.html) 中添加 material -> base color
			- 颜色设为黑色
			- 把生成的material 的node 连接到Mix shader的 Fac(可能这个texture slot中直接弄material不方便, 所以只用一个深度的功能, 把material混合放在mix shader里?)
	- 在物体上涂色
- **给固定主体添加抖动的外轮廓**: 模拟画画的线稿
	- 添加line art: Grease Pencil -> Collection Line Art
		- [modifier -> Line Art ](https://docs.blender.org/manual/en/latest/grease_pencil/modifiers/generate/line_art.html) 调解轮廓位置, 粗细, 透明度
			- Edge Types Create
				- Individual Silhouette(剪影): 给物体的外轮廓创建line art
				- 去掉 Crease(褶皱): 不然不止外轮廓, 所有面向正面的边缘都会添加line art
				- 去掉 intersection: 不然面和面相交的地方(阴影)也会添加line art
		- modifier -> noise
			- 调整 position(位置的随机性), strength(透明度的随机性), thickness, noise scale
	- 同位置添加一个带dot dash的line art: 表现有粗有细的笔触效果
		- modifier -> Dot dash
			- 调整 Dash, Gap : 笔触断开的比例
- **涂细节**
	- 添加GreasePencil Object
		- 添加noise modifier: 模拟笔触效果
		- 设置[Object -> Visibility](https://docs.blender.org/manual/en/latest/grease_pencil/properties/object.html) 
			- 选中 Grease Pencil -> Use Lights: 让画面受灯光影响, 是Grease Pencil独有的property
		- 设置 [Object -> Viewport Display](https://docs.blender.org/manual/en/latest/scene_layout/object/properties/display.html) 
			- 选中 Show -> In Front: 让画画涂层在最前面
		- 去掉 Data -> Layers -> Opacity -> Use Lights 设置上面涂层不变透明?, 去掉之后就按正常的混合图层模式理解
		- 添加多个不同颜色 material
			- 在Material -> Surface -> Stroke -> Base Color调整颜色
			- 在Material -> Surface -> Fill 调整circle里面fill的颜色
	- 设置Draw Mode, 
		- 设置绘画平面: 通过[Stroke Placement](https://docs.blender.org/manual/en/latest/grease_pencil/modes/draw/stroke_placement.html) 
		- 设置stroke:
			- 设置 Tool -> Brush Setting -> [Stroke](https://docs.blender.org/manual/en/latest/sculpt_paint/brush/stroke.html#) -> Stablilize Stroke -> Radius = 10px
- **设置动画**
	- 把同样动画的笔触分离
	- 用auto key 记录最终形态(2)
	- 选中第一帧(1) shift+D 复制, 移到最终帧之后(3), 把时间线移到 (2),(3) 中间
	- 在Edit Mode里, 用Grease Pencil -> Interpolate Sequence 插入中间key frame
	
## UV贴图

![Pasted image 20230615131056.png]({{ '/docs/attachment/Pasted image 20230615131056.png' | relative_url }}){:width="300"}

- [Smart UV Project](https://docs.blender.org/manual/en/latest/modeling/meshes/editing/uv.html) : 从mesh一个顶点相邻面扩散展开, 检查顶点处的角度

## draw mode

通过[Stroke Placement](https://docs.blender.org/manual/en/latest/grease_pencil/modes/draw/stroke_placement.html) 切换绘画平面
- Origin(默认), 在object的origin : <a href="https://docs.blender.org/manual/en/latest/_images/grease-pencil_modes_draw_stroke-placement_origin.png"><img src="https://docs.blender.org/manual/en/latest/_images/grease-pencil_modes_draw_stroke-placement_origin.png"  width="150"></a>  一般不用...Object的origin不知道在哪
- 3d cursor(光标), 可以移动cursor放在想要的平面 <a href="https://docs.blender.org/manual/en/latest/_images/grease-pencil_modes_draw_stroke-placement_3D-cursor.png"><img src="https://docs.blender.org/manual/en/latest/_images/grease-pencil_modes_draw_stroke-placement_3D-cursor.png"  width="150"></a> 在Cursor点的位置所在的View的平面上画画
- Surface <a href="https://docs.blender.org/manual/en/latest/_images/grease-pencil_modes_draw_stroke-placement_surface.png"><img src="https://docs.blender.org/manual/en/latest/_images/grease-pencil_modes_draw_stroke-placement_surface.png"  width="150"></a> Offset(离mesh的距离 )设成0.01 