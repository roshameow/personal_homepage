---
layout: post
title: "blender学习: 用几何节点做程序化城市"
categories:
  - blender
tags:
  - content
  - geometry_node
last_modified_at: 2025-01-07T17:14
created: 2025-01-04T17:47
---
参考[这个教学](https://www.youtube.com/watch?v=LheRoTgym8g)

1:  ![Pasted image 20250105115526.png]({{ '/docs/attachment/Pasted%20image%2020250105115526.png' | relative_url }}){:width="150"}  -> 2:  ![Pasted image 20250105121905.png]({{ '/docs/attachment/Pasted%20image%2020250105121905.png' | relative_url }}){:width="150"}  -> 3: ![Pasted image 20250106164220.png]({{ '/docs/attachment/Pasted%20image%2020250106164220.png' | relative_url }}){:width="150"} -> 4: ![Pasted image 20250106164521.png]({{ '/docs/attachment/Pasted%20image%2020250106164521.png' | relative_url }}){:width="150"} -> 5: ![Pasted image 20250106164825.png]({{ '/docs/attachment/Pasted%20image%2020250106164825.png' | relative_url }}){:width="150"} 

- 制作道路: 
	1. 制作随机网格: 随机2, 3层细分
		- 用二层 [subdivide Mesh](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/operations/subdivide_mesh.html)  
		- 随机选一些内部网格 ([Separate Geometry Node -> Face](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/geometry/operations/separate_geometry.html) ) 再进行一层subdivide
			- 输入Boolean的随机值
			- 输出选中的和未选中的不同处理
			- 用[Join Gemetry Node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/geometry/join_geometry.html)  融合在一起
	2. 制作随机扭曲: 把随机的mesh merge在一起
		- 用[Merge by Distance Node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/geometry/operations/merge_by_distance.html) 融合: 输入Boolean的随机值, distance选择0.26( 稍 > 2级细分, 即1/4)
		- 再次用0.01的distance 融合: 去除重复的边
	3. 把网格转成道路
		- mesh转成折线curve: [Mesh to Curve](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/operations/mesh_to_curve.html) 
		- 折线curve转成圆角曲线: [Fillet Curve](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/operations/mesh_to_curve.html) (类似Bevel倒角的效果)
			- Count 控制中间点的个数, Radius控制圆角弧度大小, 选择Limit Radius 保证圆角起终点不会超出范围(什么情况是需要超出范围的吗? 这个选项总是要选)
		- **转成道路: [Curve to Mesh](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/curve/operations/curve_to_mesh.html) (效果为Curve沿Profile Curve 挤出)**
			- Curve 处输入我们的道路curve
			- Profile Curve 处用[Curve Line](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/curve/primitives/curve_line.html) 输入一个固定长度线段Curve
	4. 增加厚度: [Extrude Mesh Node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/operations/extrude_mesh.html) 沿面的法相挤出
	5. 关闭自动的Smooth Shading: [Set Shade Smooth Node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/write/set_shade_smooth.html) 

1: ![Pasted image 20250106204640.png]({{ '/docs/attachment/Pasted%20image%2020250106204640.png' | relative_url }}){:width="150"}  -> 2: ![Pasted image 20250106205132.png]({{ '/docs/attachment/Pasted%20image%2020250106205132.png' | relative_url }}){:width="150"}  -> 3: ![Pasted image 20250106214511.png]({{ '/docs/attachment/Pasted%20image%2020250106214511.png' | relative_url }}){:width="150"} -> 4: ![Pasted image 20250106214738.png]({{ '/docs/attachment/Pasted%20image%2020250106214738.png' | relative_url }}){:width="150"} 

- 制作建筑物: 安插在道路网格的间隙
	1. 制作底座: 把折线道路(道路步骤2的结果)向内挤出
		-  [Extrude Mesh Node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/operations/extrude_mesh.html) 沿面的法相挤出, 但是厚度为0
		- 选中输出`Top`(新生成的面)向内scale
	2. 制作楼体: 
		- 把底座内部向上拉伸
		- 去掉第一步制作底座时没用的mesh, 只保留底座拉伸部分
	3. 制作屋顶:
		- 选中楼体顶部:
			- [Normal Node](https://docs.blender.org/manual/en/3.1/modeling/geometry_nodes/input/normal.html) + [Spearate XYZ Node](https://docs.blender.org/manual/en/latest/compositing/types/vector/separate_xyz.html) 的`Z`输出, 连接到 [Extrude Mesh Node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/operations/extrude_mesh.html) 的`Selection` 上
			- 另一种方法是直接选中楼体时的`Top` 输出, 连接到 [Extrude Mesh Node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/mesh/operations/extrude_mesh.html) 的`Selection` 上
		- 把楼体顶部向下向内挤出(和上一步制作楼体的方法一样)
	4. 把街区内部进一步切分, 和道路放在一起

![Pasted image 20250107055846.png]({{ '/docs/attachment/Pasted%20image%2020250107055846.png' | relative_url }}){:width="150"}

- shading: 在cycles渲染模式下
	- world: 添加一个Sky Texture, 适当调整参数
	- object: 
		- 楼体: 每幢楼随机两个贴图
			- 用[Geometry Node](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/geometry.html) 的random per Island(每个connected component随机) 的功能 + constant Color Ramp(把数值映射成 0 或 1 )
			- mix shader混合
		- 楼顶: 用[Geometry Node](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/geometry.html) 的normal +  [Spearate XYZ Node](https://docs.blender.org/manual/en/latest/compositing/types/vector/separate_xyz.html) 的`Z`输出, 选中楼顶

##  [texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 的设置


- 我们用[Image Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/image.html) 设置颜色的映射时, 把默认的 flat 改为 box
	-  flat的映射: ![flat](https://docs.blender.org/manual/en/latest/_images/render_shader-nodes_textures_image_projection-flat.png)Sphere的映射方法: ![box](https://docs.blender.org/manual/en/latest/_images/render_shader-nodes_textures_image_projection-box.png)  


## 用到的blender的一些快捷键功能


- 打开关闭侧边 Transform栏: N
- Object Mode:
	- [Apply(应用变形)](https://docs.blender.org/manual/en/latest/scene_layout/object/editing/apply.html): Command + A
		- 比例尺(Apply Scale): 应用后, 物体上的变换, 由比例变成实际距离?
			- 比如400scale的物体, 应用前 0.1 的变换, 和应用后40m的变换等价
			- blender的滑块单位是0.1, 可能是有时候物体太大, 按比例调整不方便?
- Geometry Nodes合并成group
	- 在原有Node输入的地方可以加input Node
		- input Node的参数不能改名字
		- Node内部的参数不能改成输入😮‍💨