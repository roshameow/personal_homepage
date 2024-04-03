---
layout: post
title: "blender学习: 用粒子系统做毛毡效果"
categories:
  - blender
tags:
  - content
  - 粒子系统
  - hair
last_modified_at: 2024-03-26T11:01:05-08:00
---

### 步骤: 

参考[这个教学](https://www.xiaohongshu.com/explore/65eb070500000000030320e2/)
-  Paticles添加毛发粒子: Particle type选择[hair](https://docs.blender.org/manual/en/latest/physics/particles/hair/index.html) 
	- Emission
		- number=5000 发根的总数量
		- hair length=0.03
		- Segments = 5 卷曲?
	- [Render](https://docs.blender.org/manual/en/latest/physics/particles/emitter/render.html) ->Path->Steps=5 
		- 对hair做subdivision的次数
	- [Viewport Display](https://docs.blender.org/manual/en/latest/physics/particles/hair/display.html)-> Strand Step=5
	- [Children](https://docs.blender.org/manual/en/latest/physics/particles/emitter/children.html) 选择simple
		- display amount=100, render amount=100
		- Roughness
			- Random = 0.08
			- Size = 0.851
		- Kink(纽结)选择Curl
			- Amplitude(振幅) = 0.03
			- Hair shape
				- Diameter Root > Tip
- shader: 
	- 给Particles添加一个Principle Hair BSDF的material
		- roughness= 0.86
		- Radial Roughness=0.95
- 结果: 没法复刻例图的效果, 比起毛毡更像搓澡巾😣
	- ![Pasted image 20240326101412.png]({{ '/docs/attachment/Pasted image 20240326101412.png' | relative_url }}){:width="300"}  局部: ![Pasted image 20240326101810.png]({{ '/docs/attachment/Pasted image 20240326101810.png' | relative_url }}){:width="200"} 
	- 是不是还需要设置其他参数?


### 模型

[1] https://free3d.com/3d-model/pumpkin-57117.html


 