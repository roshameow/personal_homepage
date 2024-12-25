---
layout: post
title: 调整视频追踪物体
categories:
  - tool
tags:
  - content
last_modified_at: 2024-12-25T07:38
created: 2024-09-29T09:28
---


Final Cut Pro
- [教程](https://www.bilibili.com/video/BV1oB4y1278d/) 
- 步骤:
	- 添加原视频
	- 在原视频上添加tracker, analysis跟踪物体的bbox
	- 复制原视频一份
	- 在复制视频的transformer应用之前的tracker, scale改成-100%
		- tracker的坐标和画面的坐标位置相反?
	- 把物体移到画面中间
	- 放大scale去掉黑边


- 提升视频细节

Final Cut Pro
- [屏幕穿梭转场](https://www.bilibili.com/video/BV1xf4y1q7CV/)
- 追踪绿幕

blender运动追踪
- [教程](https://www.bilibili.com/video/BV1Ze411X7hi)
- 上边栏 VFX -> Motion Tracking
- 拖入视频后设置关键帧和关键点即可
- blender的追踪没法追踪运动物体上的特征点