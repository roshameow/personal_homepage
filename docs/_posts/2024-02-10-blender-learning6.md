---
layout: post
title: "blender学习: 玻璃杯"
categories:
  - blender
tags:
  - content
  - shader
  - 3d_model
  - shortcut
last_modified_at: 2024-03-06T17:15:02-08:00
---

由cylinder变形得到水杯. 用cycles渲染玻璃材质.
## 步骤

参考[这个b站的教学视频](https://www.bilibili.com/video/BV1Fg4y127c7/) 

- 制作水杯:
	1. 添加一个cylinder
	2. 删除上下两个底: 在Edit Mode, 开启透视, 按3选中面删除
	3. 把下底缩小一点: 按1选中顶点
	4. 填充底面: 用Ctrl+F填充, 选择[Grid Fill](https://docs.blender.org/manual/en/latest/modeling/meshes/editing/face/grid_fill.html), 调节Offset
		-  ![Pasted image 20240212082748.png]({{ '/docs/attachment/Pasted image 20240212082748.png' | relative_url }}){:width="100"} 
	5. 做出玻璃杯的厚度: 选中上面的顶点, 用E+S向内
		-  ![Pasted image 20240212082705.png]({{ '/docs/attachment/Pasted image 20240212082705.png' | relative_url }}){:width="100"} 
	6. 做出玻璃杯的内层: 继续E+Y向下, S向内
	7. 做出玻璃杯的内底: Ctrl+F填充, 选择[Grid Fill](https://docs.blender.org/manual/en/latest/modeling/meshes/editing/face/grid_fill.html) , 调节Offset
	8. 把杯子变光滑:
		1. 在边缘处添加loop cut(卡线): Ctrl+R 增加loop cut, Ctrl+B向上下拉伸
			-  ![Pasted image 20240212133706.png]({{ '/docs/attachment/Pasted image 20240212133706.png' | relative_url }}){:width="100"} 
			- 添加loop cut是为了之后把杯子边缘变成弧形, 而不影响杯壁和杯底平的部分
		1. Shift+option 长按出现选项, 选中loop, 按G移动loop进行微调
			1. ![Pasted image 20240212141056.png]({{ '/docs/attachment/Pasted image 20240212141056.png' | relative_url }}){:width="100"} 
	9. 改成shade smooth
	10. 加一个subdivision modifier
- 制作拍摄场景:
	1. 添加一个plane mesh
	2. 在Edit Mode选中一个边, E+Z复制一份, 向上拉
		1. ![Pasted image 20240212141942.png]({{ '/docs/attachment/Pasted image 20240212141942.png' | relative_url }}){:width="100"} 
	3. 选中中间的edge, 拉成弧线: Shift+Option选中, Ctrl+B拉伸, 按S改变段数
		1. ![Pasted image 20240212142443.png]({{ '/docs/attachment/Pasted image 20240212142443.png' | relative_url }}){:width="150"} 
	4. 选择shade smooth
- 打光
	- 一个area light做主光, 另一个area light做辅光: 形状调节成disk
		- ![Pasted image 20240212143950.png]({{ '/docs/attachment/Pasted image 20240212143950.png' | relative_url }}){:width="150"} ![Pasted image 20240212152018.png]({{ '/docs/attachment/Pasted image 20240212152018.png' | relative_url }}){:width="130"}  
- shader: 
	- cycles的做法:
		- 用Refraction和Glossy混合
		- 用[Fresnel node](https://docs.blender.org/manual/en/4.0/render/shader_nodes/input/fresnel.html) 调节折射和反射的比例
		- 设置IOR(折射率)为1.52
		- 设置粗糙度为0
	- eevee的做法: [参考这个教程](https://www.bilibili.com/video/BV1Fe411Y7oY/) 
		- 用glass BSDF和Transparent BSDF混合
			- 设置IOR(折射率)为1.52
			- 设置粗糙度为0
		- MixShader的混合参数固定0.5
- render:
	- cycles的参数: 
		- 把light Paths调成Full Global Illumation: 即所有反射次数为32
	- eevee的参数:
		- 打开render->Screen Space Reflections->refraction
		- 打开玻璃杯的material->Screen Space Refraction选项
		- 把material的Blend Mode和Shadow Mode都改成Alpha Hashed
- 结果: 
	- cycles: ![Pasted image 20240212152142.png]({{ '/docs/attachment/Pasted image 20240212152142.png' | relative_url }}){:width="400"}  eevee: ![Pasted image 20240306170629.png]({{ '/docs/attachment/Pasted image 20240306170629.png' | relative_url }}){:width="360"} 
 
 
## 用到的blender的一些快捷键功能

- G/R/S (移动/旋转/放缩) 按了之后会提示方向快捷键
- E ([Extrude](https://docs.blender.org/manual/en/2.80/modeling/meshes/editing/duplicating/extrude.html), 挤出): 保持原顶点不变, 复制一份, 复制的和原来的用edge连接
	- selected face: <img src="https://docs.blender.org/manual/en/2.80/_images/modeling_meshes_editing_duplicating_extrude_face-before.png" alt="drawing" width="150"/>  During extrude:  <img src="https://docs.blender.org/manual/en/2.80/_images/modeling_meshes_editing_duplicating_extrude_face-after.png" alt="drawing" width="150"/>  
- [Loop Cut](https://docs.blender.org/manual/en/latest/modeling/meshes/tools/loop.html)(卡线): 在edge中间添新的顶点
	- 添加loop cut: Ctrl+R
	- 选中已有的loop cut: Shift+Option+长按
- Ctrl+B( [Bevel](https://docs.blender.org/manual/en/2.81/modeling/meshes/editing/subdividing/bevel.html#:~:text=The%20Bevel%20tool%20smooths%20the,above%20to%20run%20the%20tool.), 拉伸, 倒角): 把一个edge变成多个edge, 使物体边缘光滑
	- <img src="https://docs.blender.org/manual/zh-hans/2.81/_images/modeling_meshes_editing_subdividing_bevel_example-4.png" alt="drawing" width="150"/> 
	- 按S可以改变段数
- Edit Mode 1/2/3 (选vertex, edge, face)

## Frensel反射系数

Frensel node确定折射和反射比例, 从blender的参数看, 受IOR(折射率)和平面法向的影响

- 推导: 
	- 根据[Fresnel equation](https://en.wikipedia.org/wiki/Fresnel_equations) 的dielectric(绝缘体)的版本: $R=0.5*(r_{\perp}^2+r_{\parallel}^2)$ 
		- 其中: $r_{\perp}=\frac{n_i\cos\theta_i-n_t\cos\theta_t}{n_i\cos\theta_i+n_t\cos\theta_t}$  , $r_{\parallel}=\frac{n_t\cos\theta_i-n_i\cos\theta_t}{n_t\cos\theta_i+n_i\cos\theta_t}$  
			- $n_i$ 是入射介质(即空气=1)的折射率
			- $n_t$ 是传播介质(即玻璃=1.52)的折射率
			- $\cos\theta_i=(n\cdot w_o)$ 表示平面法向和观察方向的夹角：观察方向越平行于平面，$\theta_i$ 越大，折射越少, 反射越强
				- pathtracing的方法里, 观察方向就是入射方向
			- $\cos\theta_t$ 表示平面法向和传播方向的夹角, 根据[Snell's law](https://en.wikipedia.org/wiki/Snell%27s_law): $\frac{\sin\theta_t}{\sin\theta_i}=\frac{n_i}{n_t}=\frac{1}{\eta}$ 
				-  $\eta=n_t/n_i$ : ratio of IOR, 正面是$n$, 反面是$1/n$   
				- 则$\cos\theta_t=\sqrt{1-\sin^2\theta_t}=\sqrt{1-\frac{1}{\eta^2}(1-\cos^2\theta_i)}=\frac{1}{\eta}\sqrt{\eta^2-1+\cos^2\theta_i}$  
	- 代码中的表达方式:
		$$\begin{align}R &=0.5*((\frac{n_i\cos\theta_i-n_t\cos\theta_t}{n_i\cos\theta_i+n_t\cos\theta_t})^2+(\frac{n_t\cos\theta_i-n_i\cos\theta_t}{n_t\cos\theta_i+n_i\cos\theta_t})^2)\\\\ &=0.5*((\frac{\cos\theta_i-\eta\cos\theta_t}{\cos\theta_i+\eta\cos\theta_t})^2+(\frac{\eta\cos\theta_i-\cos\theta_t}{\eta\cos\theta_i+\cos\theta_t})^2)\; (\eta=n_t/n_i\text{是ratio of IOR, 正面是n, 反面是1/n)}\\\\ &=0.5*((\frac{c-g}{c+g})^2+(\frac{\eta^2c-g}{\eta^2c+g})^2)\;\; (\text{让 }c=\cos\theta_i,\  g=\sqrt{\eta^2-1+\cos^2\theta}=\eta\cos\theta_t, \text{ 这步已经足够化简了, 为什么要把}\eta\text{完全替换掉呢?})\\\\ &=0.5*((\frac{c-g}{c+g})^2+(\frac{(1+g^2-c^2)c-g}{(1+g^2-c^2)c+g})^2)\;\; (\text{根据 }\eta^2=1+g^2-c^2)\\\\  &=0.5*((\frac{c-g}{c+g})^2+(\frac{c-g}{c+g})^2(\frac{1-c(c+g)}{1+c(g-c)})^2)\\\\  &=0.5*(A^2+A^2B^2)=0.5*A^2(1+B^2)\;\; (\text{让 }A=\frac{g-c}{g+c}, B=\frac{c(g+c)-1}{c(g-c)+1})\end{align}$$
- blender代码: 
	- [cycles/node_fresnel.osl at main](https://projects.blender.org/blender/cycles/src/branch/main/src/kernel/osl/shaders/node_fresnel.osl) 
	-  [cycles/node_fresnel.h at main](https://projects.blender.org/blender/cycles/src/branch/main/src/kernel/osl/shaders/node_fresnel.h) 

## reference 
<span id="ref"></span>

[1] https://seblagarde.wordpress.com/2013/04/29/memo-on-fresnel-equations/ 一些版本的公式推导和reference

[2] https://blenderartists.org/t/whats-the-math-behind-fresnel-node/1502809/11 Fensel node讨论




