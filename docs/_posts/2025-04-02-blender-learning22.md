---
layout: post
title: "blender学习:  几何节点花瓣"
categories:
  - blender
tags:
  - content
last_modified_at: 2025-05-14T07:44
created: 2025-04-02T05:31
---


![Pasted image 20250407185737.png]({{ '/docs/attachment/Pasted image 20250407185737.png' | relative_url }}){:width="300"} -> ![Pasted image 20250407185806.png]({{ '/docs/attachment/Pasted image 20250407185806.png' | relative_url }}){:width="300"} -> ![Pasted image 20250511182348.png]({{ '/docs/attachment/Pasted image 20250511182348.png' | relative_url }}){:width="180"} 
 

- 制作花瓣
	- 制作基础图形(一片花瓣): 
		- 添加plane -> 添加loop cut -> 制作一面宽一面窄的梭形(打开proportional editing调整中间线的长度)
		- 添加细分的modifier
	- 制作一圈花瓣:
		- 添加一个圆环采样: Curve Circle -> Curve to Points
		- 在每个采样点上添加花瓣的instance
		- 给花瓣的位置和旋转添加random
- 制作花萼
	- 添加一个uv sphere, 压扁
- 制作花茎: 添加一个tube ($\mathbb R^1\times \mathbb S^1$ )
	- 用[curve to mesh node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/curve/operations/curve_to_mesh.html) : curve用[Curve line](https://docs.blender.org/manual/zh-hans/4.0/modeling/geometry_nodes/curve/primitives/curve_line.html) profile curve用[Curve Circle](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/curve/primitives/curve_circle.html) 
		- 在geometry node -> Add -> Curve -> Primitive(基础元素)里
	- 给Cuvre Line添加[Resample Curve](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/curve/operations/resample_curve.html) 增加cut便于弯曲
	- 把花茎独立出来变成object便于上色和控制