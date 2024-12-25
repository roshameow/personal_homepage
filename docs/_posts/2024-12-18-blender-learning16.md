---
layout: post
title: "blender学习: 五角星 ⭐️"
categories:
  - blender
tags:
  - content
last_modified_at: 2024-12-25T17:07
created: 2024-12-18T21:59
---
参考[这个教学](https://www.bilibili.com/video/BV1v5kGYgEg9/)


- 添加circle mesh , 设置顶点 = 10 (刚添加时可以设置)
- 选择5个顶点: Edit Mode下, Select -> Checker Deselect(间隔式弃选)
- 向内收缩形成五角星状轮廓
- Extrude(挤出) 变成五角星状围栏
- Loop cut(卡线) 分成三段
- 上下层merge变为一点
- 倒角(bevel), 细分(subdivide)

![Pasted image 20241218224819.png]({{ '/docs/attachment/Pasted image 20241218224819.png' | relative_url }}){:width="150"}


## 用到的blender的一些快捷键功能

- [Loop Cut](https://docs.blender.org/manual/en/latest/modeling/meshes/tools/loop.html)(卡线): 在edge中间添新的顶点
	- 添加loop cut: Ctrl+R
	- 选中已有的loop cut: Shift+Option+长按
- E ([Extrude](https://docs.blender.org/manual/en/2.80/modeling/meshes/editing/duplicating/extrude.html), 挤出): 保持原顶点不变, 复制一份, 复制的和原来的用edge连接
	- selected face: <img src="https://docs.blender.org/manual/en/2.80/_images/modeling_meshes_editing_duplicating_extrude_face-before.png" alt="drawing" width="150"/>  During extrude:  <img src="https://docs.blender.org/manual/en/2.80/_images/modeling_meshes_editing_duplicating_extrude_face-after.png" alt="drawing" width="150"/>  
- Edit Mode:
	- 融合(merge): [M](https://docs.blender.org/manual/en/latest/modeling/meshes/editing/mesh/merge.html) 
		- merge to point和 向内收缩到头( S + 0 ) 效果一样的


## 用blender script的情况

- 流程特别固化, 用script比交互式操作容易的多
- 开始我以为需要3d操作的loop cut会更麻烦, 顶点多了以后用代码就不方便描述了. 不过这个是我思维限制了, 用代码根本没必要loop cut, 直接把extrude重复多次就完了

### 把python script 载入blender插件

**安装插件**

1. 进入 **Edit > Preferences > Add-ons**。
2. 点击 **Install**，选择保存的 `.py` 文件。
3. 勾选插件以启用。

**使用插件**

1. 在Object Mode下，点击 **Add > Mesh > Create Star**。
2. 在左下角调整 **Number of Points**、**Radius** 和 **Height** 参数。


### 代码

- script: [**create_star.py**](https://gist.github.com/roshameow/2b5be662744414007ac39a4d10f530d9#file-create_star-py) 
- add-on: [**star_addon.py**](https://gist.github.com/roshameow/2b5be662744414007ac39a4d10f530d9#file-star_addon-py) 