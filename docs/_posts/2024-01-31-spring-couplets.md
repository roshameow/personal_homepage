---
layout: post
title: 龙年春联
categories:
  - design
tags:
  - content
last_modified_at: 2024-01-31T15:44:44-08:00
---

![Pasted image 20240131145110.png]({{ '/docs/attachment/Pasted%20image%2020240131145110.png' | relative_url }}){:width="400"} 

上联是“查找，回退，终止，定义，返回，格式化，删除”<br>
下联是“启动，切换，上一级，根目录，查找，替换，退出”<br>
横批是“全部历史”<br>

  本以为会简单的制作过程, 居然感触挺多的

## 制作时间轴

- 看到小红书上这个[ps春联的帖子](https://www.xiaohongshu.com/explore/65b781c8000000000c00534a)
- 最开始是想做vscode和obsidian的图标
- 做着做着, 感觉快捷键更有分享欲; 而且, 图标截图下来有清晰度和大小不一的问题
- 直接写在红底黑字的春联底色上, 看起来太单调了
	- ![Screenshot 2024-01-31 at 00.55.22.png]({{ '/docs/attachment/Screenshot%202024-01-31%20at%2000.55.22.png' | relative_url }}){:width="200"}
- 想用stable diffusion生成个华丽的背景, 但是... 放弃
	- 基于v1.5的模型没法理解春联, 也没法理解龙
		- 生成的这种看起来挺奇怪的东西: ![00010-3341009059.png]({{ '/docs/attachment/00010-3341009059.png' | relative_url }}){:width="200"} 
		- canny的controlnet没法保证文字的细节一致: ![00008-497390711.png]({{ '/docs/attachment/00008-497390711.png' | relative_url }}){:width="200"} 
		- 生成的龙😮‍💨: ![00014-2368775189.png]({{ '/docs/attachment/00014-2368775189.png' | relative_url }}){:width="200"} 
	- SDXL可以生成不错的龙, 虽然细节不对
	- ComfyUI的工作流我用的不太熟练, 而且, 我不太了解各种风格的prompt
- 在小红书上搜索春联的版式, 看到了[这个帖子](https://www.xiaohongshu.com/explore/63c12c19000000001f0223f0)
	- 模仿失败: 卖家秀$\rightarrow$ ![Pasted image 20240131150246.png]({{ '/docs/attachment/Pasted%20image%2020240131150246.png' | relative_url }}){:width="200"}  买家秀$\rightarrow$ ![Pasted image 20240131150756.png]({{ '/docs/attachment/Pasted%20image%2020240131150756.png' | relative_url }}){:width="200"} 
	- 我的图看起来像东南亚黑帮, 又像个祭坛
	- 当然我的颜色调的不对, 但是我也明白了这个排版不适合龙(你的内容是现代的, 但是排版却相当古老, 你究竟是什么人😂)
- 又回归了黑白红配色, 改了版式, 感觉能看了, 蛮喜庆的, 有种过年的气氛了

## 工具

- pinterest搜索, 然后推荐相似风格的图片
- eagle存图
- Freeform排版
	- 可惜Freeform里面没法改图片整体的颜色, 也没法旋转
- preview的魔棒工具
	- 中间想用photoshop, 但是发现我的photoshop不太熟练, 还是preview简单粗暴
	- 感慨平时不熟悉的工作流, 一着急起来压根不想用...
- 写这篇blog的时候发现markdown居然没有官方的时间轴排版, 明明应该很好做的吧

## 资源

字体[OpenseaThecrownismineRegular](https://www.fontspace.com/category/artistic)

[龙](https://www.pinterest.com/pin/732116483197126476/)

