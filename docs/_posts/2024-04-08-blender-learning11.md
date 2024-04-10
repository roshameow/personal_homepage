---
layout: post
title: "blender学习: 几何节点做摄像头移动阵列"
categories:
  - blender
tags:
  - content
  - geometry_node
  - track
  - shortcut
  - script
last_modified_at: 2024-04-10T14:56:01-08:00
---

参考[这个教学](https://www.bilibili.com/video/BV1t5411v7b1/)

### 建模

直接复制作者的模型和材质
- 箭头
- 摄像头

### 步骤: 

-  制作摄像头阵列: 用[Instance on Points节点](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/instances/instance_on_points.html#)
	- 添加一个Plane mesh, 在modifier添加几何节点
	- 在Points的地方制作一个meshgrid:
		- 用Grid节点调整Grid大小和距离: 相对plane平面
		- 用[Vector Rotate节点](https://docs.blender.org/manual/en/latest/render/shader_nodes/vector/vector_rotate.html#) 批量调整Plane里面顶点的位置
	- 把摄像头主体和摄像机臂分别设置成为Plane顶点的instance: 用Join Geometry节点连接
- 设置摄像头主体追踪箭头: 分为 箭头在xz平面平移(看向箭头)和箭头在x轴旋转(跟随箭头点头) 两部分
	- 平移->关于y轴旋转:
		- 计算Plane里面顶点到箭头的vector: 这里面[Position节点](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/geometry/read/position.html)给出的是Plane每个顶点的location
		- 用[Align Euler to Vector节点](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/utilities/rotation/align_euler_to_vector.html) 设置成关于y轴旋转
	- 旋转-> 旋转:
		- 提取箭头Rotation的x轴反向旋转, 用Rotate Euler节点添加到Plane的Rotation(plane每个顶点的rotation)
- 制作箭头绕圈和点头动画: 
	1. 绕圈: 让箭头围绕一个圈移动
		- 添加一个Circle曲线
		- 给箭头添加Constraint-> [Follow Path](https://docs.blender.org/manual/en/4.1/animation/constraints/relationship/follow_path.html)
			- Target选择刚才的Circle
			- Option+G清除位置: 加了follow path constraint之后, position会变成相对path的, 所以要清除position保证箭头在path上
			- 在起始和结束打上关键帧
				- 起始设置offset=0
				- 结束设置offset=100: 按照文档的说法似乎应该是0到1? 但是实际用的是0到100?
	2. 点头: 打rotation的关键帧
		- 打3个关键帧: 原始位置-> 最低位置 -> 原始位置
	- 在graph editor调整运动曲线

- 结果: 感觉这是个很有用的互动功能
	- ![camera_follow.mp4]({{ '/docs/attachment/camera_follow.mp4' | relative_url }}){:width="400"} 

### geometry nodes

![Pasted image 20240410145231.png]({{ '/docs/attachment/Pasted image 20240410145231.png' | relative_url }}){:width="800"} 
### 用到的blender的一些快捷键

- Option+G/S/R ([清除](https://docs.blender.org/manual/en/latest/scene_layout/object/editing/clear.html#) )
	- 把object位置变成默认的0
- G/S (移动/缩放)的多种功能:
	- 可以在Timeline移动缩放关键帧
	- 可以在graph editor里面调整运动曲线
- I ([打关键帧](https://docs.blender.org/manual/en/latest/animation/keyframes/editing.html#insert-keyframe) )
	- 在Layout界面Object Mode 中选中
- Ctrl+手势: 缩放graph editor面板


### blender Script的用法

看到有人用blender内置的python script编辑器做追踪的效果, 但是这个编辑器实在很难用, 而且没有自动提示的情况下, 要一直关心传参数的格式很麻烦, 远不如几何节点好用. 
- 如果用vs code编辑再同步呢? 需要一些联动的功能:
	- 安装blender的代码包以便自动提示
	- blender执行外部代码的功能
	- 一个可以自动识别选中blender物体转换为代码的插件.

网上一个blender和vscode联动的方法: https://blog.csdn.net/qq_43331089/article/details/124490171
