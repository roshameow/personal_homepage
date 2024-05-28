---
layout: post
title: "blender学习: 冰材质"
categories:
  - blender
tags:
  - content
  - shader
last_modified_at: 2024-05-28T12:46:36-08:00
---

在IOR=1.31的透明材质基础上, 添加表面的凹凸和内部的裂痕, 气泡


## 制作冰材质: 

### 用volume shader

参考[这个教学](https://www.youtube.com/watch?v=EUvNwscez-w) 

1. 用Cycles渲染器, 打开Render->[Film->Transparent-> Transparent Glass](https://docs.blender.org/manual/en/latest/render/cycles/render_settings/film.html)
	- 但是没有用到composition所以开不开无所谓吧?
2. **表面增加凹凸**: 用Bump节点
	-  ![Pasted image 20240527221548.png]({{ '/docs/attachment/Pasted image 20240527221548.png' | relative_url }}){:width="100"} 
	- 用[Bump](https://docs.blender.org/manual/en/4.1/render/shader_nodes/vector/bump.html) 更改normal的方向: 根据输入的局部高度差
		-  用noise texture生成纹理, 应用到bump的高度
	- 用相同的noise texture生成纹理, 应用到roughness
		- 目的是让凸出的地方更粗糙? 感觉和实际不太相符
3. **在内部添加crack**: 用[Voronoi Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/voronoi.html) 复合Noise Texture的扭曲
	- 
	- texture color: ![Pasted image 20240528093833.png]({{ '/docs/attachment/Pasted image 20240528093833.png' | relative_url }}){:width="100"}  添加到volume后: ![Pasted image 20240528102634.png]({{ '/docs/attachment/Pasted image 20240528102634.png' | relative_url }}){:width="100"} 
	- Voronoi Texture由[Worley noise](https://en.wikipedia.org/wiki/Worley_noise) 生成
		- 选择Distance to Edge: 生成distance map
	- 用[Linear Light(线性光)](https://docs.krita.org/en/reference_manual/blending_modes/lighten.html#bm-linear-light) 的方式混合: 和add差不多, 但是会对可能saturated的值特殊处理
4. **在内部添加一些雾气**: 用noise texture生成


- 结果: 没太复刻出冰的质感, 还是更像玻璃
	-   ![ice_glass_cycle.png]({{ '/docs/attachment/ice_glass_cycle.png' | relative_url }}){:width="480"} 

### 用粒子系统

参考[这个教学](https://www.bilibili.com/video/BV1i5411e7VZ/) 

## 实物参考

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=422168352&bvid=BV1a3411477N&cid=458238306&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>

- ![Pasted image 20240527221116.png]({{ '/docs/attachment/Pasted image 20240527221116.png' | relative_url }}){:width="480"}  ![Pasted image 20240527221224.png]({{ '/docs/attachment/Pasted image 20240527221224.png' | relative_url }}){:width="320"} 
- 冻的漂亮的冰里面本来就不应该有那些crack和气泡嘛


## blender用法

- displacement和noise texture+bump的凹凸效果区别: displacement会确实更改mesh上点的位置, bump不会, bump只是改变表面法线方向来模拟.


