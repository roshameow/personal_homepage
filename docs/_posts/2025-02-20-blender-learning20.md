---
layout: post
title: "blender学习:  制作随音乐律动的视频"
categories:
  - blender
tags:
  - content
  - music
  - geometry_node
  - video_editor
last_modified_at: 2025-02-21T13:43
created: 2025-02-20T21:37
---
[参考教学](https://www.bilibili.com/video/BV1CPNpeTE5E/) 

- 设置物体随1d强度变化:
	- 在plane mesh上添加Cloud Texture, 把strength打上关键帧
	- 用geometry node在变形的mesh上添加instance
		- 把material的link从Data改为Object才能给instance添加材质
- 添加音乐:
	- 设置物体随音乐(1d)运动: 用Graph Editor的[Channel](https://docs.blender.org/manual/en/latest/editors/graph_editor/channels/editing.html) -> Sound to Samples 功能, 让strength随音乐变化
	- 设置播放音乐: 在Video Sequencer里添加音乐

<iframe src="//player.bilibili.com/player.html?isOutside=true&aid=114040038755496&bvid=BV1pTAZeNEhW&cid=28499775428&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>
