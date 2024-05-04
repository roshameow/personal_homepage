---
layout: post
title: 小红书学到的几种图片调色 (二)
categories:
  - photo
tags:
  - content
  - photoshop
  - shortcut
last_modified_at: 2024-04-29T21:12:03-08:00
---
## 人物美白

- cameraRaw滤镜
	- 基本: 
		- - 色温, + 色调
		- + 曝光, + 对比度, -高光
	- 混色器: 
		- 色相: + 红色, -橙色, --蓝色
		- 明亮度: -红色
	- 校准:
		- 绿原色: +色相
		- 蓝原色: +饱和度

[教程](https://www.xiaohongshu.com/explore/661ab1fb000000000401bfe2)

## 梦幻发光

![Pasted image 20240428143139.png]({{ '/docs/attachment/Pasted image 20240428143139.png' | relative_url }}){:width="200"} ![Pasted image 20240428143157.png]({{ '/docs/attachment/Pasted image 20240428143157.png' | relative_url }}){:width="200"} ![Pasted image 20240428143227.png]({{ '/docs/attachment/Pasted image 20240428143227.png' | relative_url }}){:width="200"} 
- 调整画面颜色: 可选颜色, 在 [CMYK 颜色](https://en.wikipedia.org/wiki/CMYK_color_model) 调整
	- 黄色: + 青色,黄色,黑色  -洋红
	- 绿色: + 青色,黄色  -洋红,黑色
- 给高光部分做高斯模糊
- 混合模式改为变亮
- 和blender里面的[bloom(辉光)](https://docs.blender.org/manual/en/latest/render/eevee/render_settings/bloom.html) 功能原理一样
[教程](https://www.xiaohongshu.com/explore/660fbca9000000001a014c53) 




## photoshop快捷键

- command+alt+shift+E(盖印)
	- 把效果和图层合并生成一个新图层
- command+alt+2(提取高光)
	- command+J 可以把高光变成一个新图层