---
layout: post
title: "blender学习: 用布料系统做膨胀效果"
categories:
  - blender
tags:
  - content
  - physics
  - shortcut
last_modified_at: 2024-05-16T11:48:22-08:00
---

参考[这个教学](https://www.bilibili.com/video/BV13C41177Ze)

### 建模

球和boundary两部分

- 新建一个Ico Sphere(棱角球)
- 在Edit Mode选中一些顶点作为boundary, 设为顶点组
- 给棱角球做一个表面细分并应用
- 在Edit Mode里用Bevel把boundary拉出一点宽度, 把顶点组改为新的boundary
	- 要先应用表面细分再Bevel? 不然boundary的mesh会变得很复杂
- 在原位把boundary复制一份(Shift+D), 和球分离(P), 稍微拉大一点(S)
- 给boundary添加一个2的表面细分
- 设置shade smooth

### 制作膨胀效果: 

- 选择Physics->Cloth
	- Pressure = 25
	- [Shape](https://docs.blender.org/manual/en/latest/physics/cloth/settings/shape.html)选择boundary的顶点组
		- Shrinking Factor = -0.3 负数表示要cloth膨胀
	- Field Weights->Gravity=0

- 结果: 
	-  ![inhale.mp4]({{ '/docs/attachment/inhale.mp4' | relative_url }}){:width="400"} 


### 用到的blender的一些快捷键


- Command+A(应用modifier)
- Shift+D([Duplication](https://docs.blender.org/manual/en/2.82/scene_layout/object/editing/duplication.html)): 复制物体
	- RMB(右键): 保留在原来的位置
- P([分离](https://docs.blender.org/manual/en/latest/modeling/meshes/editing/mesh/separate.html))
	- 把选中的顶点建一个新的object
- Command+P([Parent](https://docs.blender.org/manual/en/latest/scene_layout/object/editing/parent.html))
	- 把后选中的object设置为先选中的object的parent 
- Ctrl+B( [Bevel](https://docs.blender.org/manual/en/2.81/modeling/meshes/editing/subdividing/bevel.html#:~:text=The%20Bevel%20tool%20smooths%20the,above%20to%20run%20the%20tool.), 拉伸, 倒角): 把一个edge变成多个edge, 使物体边缘光滑
	- <img src="https://docs.blender.org/manual/zh-hans/2.81/_images/modeling_meshes_editing_subdividing_bevel_example-4.png" alt="drawing" width="150"/> 
	- 按Shift微调: 移动的幅度降1k倍



