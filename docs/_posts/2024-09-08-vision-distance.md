---
layout: post
title: 摄像头测距
categories:
  - algorithm
tags:
  - content
last_modified_at: 2024-09-21T22:38
created: 2024-09-08T21:10
---
- 问题定义: 从摄像头组拍摄的画面中得到汽车的3维bounding box

- 应用场景:
	- 公路(高速)卡口
	- 通行车道: 高速? 可以安装立柱? 离车距离> 0.6m, 路侧安装高度: 1.2m ~ 2.4m, 门架式安装高度: 5m ~ 7.5m
	- 卡车(long vehicle): > 12.2m 货车: < 30m 
- 精度要求: < 50mm(5厘米?)

kitti测试集: https://www.cvlibs.net/datasets/kitti/eval_scene_flow.php


- 可能相关的研究
	- 自动驾驶测障碍物距离