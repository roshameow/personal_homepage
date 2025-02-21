---
layout: post
title: "blender学习: 制作水体"
categories:
  - blender
tags:
  - content
  - shader
last_modified_at: 2025-02-10T12:29
created: 2025-02-10T08:26
---

## 用displacement+noise texture制作

[参考教学](https://www.youtube.com/watch?v=ke-MgwUxLjI)

1. 用一个plain mesh代表水体
1. 制作水体颜色: Glossy + [Refraction(折射)](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/refraction.html)  + [Transparent](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/transparent.html) 
	- Glossy + [Refraction(折射)](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/refraction.html) 设置一个透明效果(参考玻璃的做法)
		- Refraction的Roughness通过波动调节(增强动态效果)
	- [Transparent](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/transparent.html)  设置成蓝色, 相当于一个蓝色滤光片. 加在最后. 只有Cycles 渲染有用.
1. 制作波动: 用[noise texture node](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/texture/noise.html) 输入displacement制作
	1. 我们的输出的是2d的plain. 用3d noise和4d noise的区别是?



