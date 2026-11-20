---
layout: post
title: "blender学习: 用volume shader做气态行星"
categories:
  - blender
tags:
  - content
  - render
  - shader
last_modified_at: 2024-01-29T16:47:25-08:00
---
## 步骤

参考RuiHuang_art在[b站的教学视频](https://www.bilibili.com/video/BV1Aj411j7CD)
- world property: 加入一个太空背景的贴图
- 光源：改成[sun light](https://docs.blender.org/manual/en/latest/render/lights/light_object.html#sun-light) 
	- strength改成12: 单位是 $W/m^2$ 
	- volume改成3: 控制在volume shader时的影响?
- render: 用eevee
	- 设置volumetrics参数
		- **打开volumetric shadows** 
		- start, end: 相对相机的体积效果范围, 设为(3.3m->200m)
		- tile size: volume块大小
- shader: 
	- 用[principled volume](https://docs.blender.org/manual/en/latest/render/shader_nodes/shader/volume_principled.html) : 把mesh包含的部分看成volume块
		- color: 
			1.  用[texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 生成volume的坐标
			2. [Image Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/image.html) 把2d的木星贴图映射到3d的volume上
			3. 用[Hue/Saturation/Value Node](https://docs.blender.org/manual/en/latest/render/shader_nodes/color/hue_saturation.html) 调颜色
		- density: 一个从里到外逐渐稀薄的球形+被纹理的影响
			1. 用[texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 生成volume的坐标
				1. object生成一个在中心的坐标系
				2. 用 [Image Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/image.html) 生成一个按照贴图纹理亮度的scale, 模拟气体的效果
					- 用Mulitiply node的Factor node调整受纹理影响的强度
					- 用[invert node](https://docs.blender.org/manual/en/latest/render/shader_nodes/color/invert.html) 调整: 亮的纹理密度低(凹陷), 暗得纹理密度高(突出), 如果Fac设置成1就会反过来
						- Fac参数:  类似$\alpha \frac{1}{x}+(1-\alpha) x$ ? 
					- 这部分应该可以优化, 不是用multiply 而是用其他方式做纹理的distortion?
			2. 用[gradient texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/gradient.html) 设置渐变的密度
			3. 用 [Color Ramp](https://docs.blender.org/manual/en/latest/editors/texture_node/types/converter/color_ramp.html) 做一个动态范围的压缩: 
				- 我们想要一个(实体->气态->空) 的渐变, 中间density在0-1之间的部分, 是气态部分
				- 调整value参数, 也就是最后输入的密度
	- 视频里还另外加了一个底色, 但是看起来没什么影响
- 相机: Camera-> Data
	- Focal Length 调大到60mm: 调整物体在镜头内的大小
- 结果: 和视频里的结果不完全一样, 不清楚是哪里的问题😮‍💨
	- ![Pasted image 20240129164109.png]({{ '/docs/attachment/Pasted%20image%2020240129164109.png' | relative_url }}){:width="200"} ![Pasted image 20240129164354.png]({{ '/docs/attachment/Pasted%20image%2020240129164354.png' | relative_url }}){:width="200"} 

## shader流程

![Pasted image 20240129164505.png]({{ '/docs/attachment/Pasted%20image%2020240129164505.png' | relative_url }}){:width="900"}



##  [texture Coordinate](https://docs.blender.org/manual/en/latest/render/shader_nodes/input/texture_coordinate.html) 的设置

texture coordinate不同模式的区别是坐标系的原点位置不一样: generate模式的原点是在mesh的bounding box一角, 而object模式的原点是在bounding box的中心(从名字是看不出来..也没看源码验证, 都是我猜的)
- 用[gradient texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/gradient.html) 调整密度时, 输入的是vector的模长
	- 如果generate模式 , 密度最大的点在box的一角, 得到![Pasted image 20240129151203.png]({{ '/docs/attachment/Pasted%20image%2020240129151203.png' | relative_url }}){:width="120"};  
	- 用object模式  , 密度最大的点在中心, 得到![Pasted image 20240129151233.png]({{ '/docs/attachment/Pasted%20image%2020240129151233.png' | relative_url }}){:width="150"}, 也就是我们需要的行星的形态
- 而我们用[Image Texture](https://docs.blender.org/manual/en/latest/render/shader_nodes/textures/image.html) 设置颜色的映射时, Sphere的映射方法默认是围绕点 $(0.5,0.5,0.5)$ 进行映射, 这个时候我们就需要在generate模式的坐标系下映射
	- Sphere的映射方法: ![sphere](https://docs.blender.org/manual/en/latest/_images/render_shader-nodes_textures_image_projection-sphere.png)  
	- 把贴图![jupiter_01_pd.png]({{ '/docs/attachment/jupiter_01_pd.png' | relative_url }}){:width="200"} 映射到![Pasted image 20240129144125.png]({{ '/docs/attachment/Pasted%20image%2020240129144125.png' | relative_url }}){:width="120"}  