---
layout: post
title: "blender学习:  Toon BSDF的硬阴影效果"
categories:
  - blender
tags:
  - content
  - BSDF
  - render
last_modified_at: 2023-12-31T18:11:23-08:00
---
### 导入模型

用glTF格式的模型

- glTF格式介绍：[https://github.com/KhronosGroup/glTF](https://github.com/KhronosGroup/glTF)
- 在vscode安装glTF tools 插件：
	- 可以跳转到具体accessor，直接查看数据
	- 可以查看渲染之后的结果(包括背景和动画)
- 下载gltf模型: [https://github.com/GPUOpen-LibrariesAndSDKs/Cauldron-Media/tree/v1.0.4/buster_drone](https://github.com/GPUOpen-LibrariesAndSDKs/Cauldron-Media/tree/v1.0.4/buster_drone)

### 步骤

- 参考[b站的教学视频][1] 修改：
	- world property:
		- surface: 选background, strength 0
			- 直接把surface的shader直接关掉应该也是一样的效果？
	- 光源：
		- blender代码：
			- https://github.com/blender/cycles/blob/main/src/scene/light.cpp
			- https://github.com/blender/cycles/blob/main/src/kernel/light/spot.h
			- https://github.com/blender/cycles/blob/main/src/kernel/sample/mapping.h#L114
		- 改成spot light
		- radius改成0：影响光锥的软硬
		- blend改成0
	- rendering
		- 引擎改成cycles：cycles是基于光追的，更符合现实情况
		- noise threshold改成0， sample改成64
		- Light Paths里面反弹次数(Total, Diffuse, Glossy, Transmission)都改成0
			- 防止出现明亮表面和柔和边缘？
	- shader
		- 改成Toon BSDF
		- 把反光的部分BSDF从diffuse改成glossy
- 加入运镜，参考教学视频 [https://www.bilibili.com/video/BV1eq4y1y7D2](https://www.bilibili.com/video/BV1eq4y1y7D2/?vd_source=9cd152be6fbc1b9ad36a33604a13fb6e) 
	- 在animation界面删除本来的animation
	- 在layout界面开启auto key之后，点击播放：这个时候鼠标只能移动，需要按快捷键配合移动。
- 输出视频
	- ![output.mp4]({{ '/docs/attachment/output.mp4' | relative_url }}){:width="400"} 







[1]: https://www.bilibili.com/video/BV1ck4y1W7am/


