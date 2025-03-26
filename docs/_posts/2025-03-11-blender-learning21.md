---
layout: post
title: "blender学习:  内发光效果"
categories:
  - blender
tags:
  - content
last_modified_at: 2025-03-11T19:40
created: 2025-03-11T11:27
---

- 设置透明+自发光
	- 用transparent shader和emmision shader合成
	- 用[layer weight node](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/layer_weight.html)控制参数
		- Frensnel 模式(对比度更高): 和frensel node一样公式, 把用IOR调节, 改成0-1调节weight
		- Facing 模式: 按face面向镜头的角度调节weight
- 添加辉光: 用Compositing的[glare node](https://docs.blender.org/manual/en/latest/compositing/types/filter/glare.html)  -> Fog Glow


![glow.jpeg]({{ '/docs/attachment/glow.jpeg' | relative_url }}){:width="480"}

- 问题: 
	- 怎么设置物体前后的遮挡?

## 渲染模式

shader边栏 -> Options -> Settings -> Surface ->[Render Method](https://docs.blender.org/manual/en/latest/render/eevee/material_settings.html)

- **Dithered Mode（抖动模式）** : 效果更好, 性能开销更大
	- 支持半透明渲染
	- 支持raytracing
	- deferred rendering技术
- **Blended Mode（混合模式）**
	- 前向渲染(forward rendering）技术
	- 透明表面的排序基于对象原点, 可能导致渲染错误

