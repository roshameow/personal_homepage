---
layout: post
title: "blender学习: 扭曲晶体路径跟随"
categories:
  - blender
tags:
  - content
  - shortcut
last_modified_at: 2024-12-13T17:54
created: 2024-12-05T17:16
---
参考[这个教学](https://www.youtube.com/watch?v=uRAfhJQFjRo)

-  **制作物体: 一组扭曲, 光滑的梭形**
	- 长方形在edit mode下添加loop cut分割
	- 把两头缩小, 变为梭形
		- 用[propotional editing](https://docs.blender.org/manual/en/2.81/scene_layout/object/editing/transform/control/proportional_edit.html) 缩放两头的面即可
			- <a href="https://docs.blender.org/manual/en/2.81/_images/scene-layout_object_editing_transform_control_proportional-edit_influence.png"><img src="https://docs.blender.org/manual/en/2.81/_images/scene-layout_object_editing_transform_control_proportional-edit_influence.png"  width="250"></a> 
		- 调整梭形的长短, 粗细
	- 复制多个做为动效: 固定在XZ平面, 绕中心小圈复制4个, 大圈复制8个
		- 先复制到(-2,2), (4,0) 位置, 倍增得到小圈, 复制小圈得到大圈, 复制大圈倍增
			- ![Pasted image 20241210113337.png]({{ '/docs/attachment/Pasted image 20241210113337.png' | relative_url }}){:width="150"} 在XZ平面上有格子可以定位, 刚复制时ctrl也可以看到坐标
	- 多选分组调整梭形的长短, 粗细比例: 比如大圈和小圈分开调整
		- 批量调整形态时, 需要把[pivot point(轴心点)](https://docs.blender.org/manual/en/2.80/scene_layout/object/editing/transform/control/pivot_point/index.html) 切换成individual origins 
		- 可能需要右键 -> separate selected 分开成单独的object, 用来之后设置不同的扭曲和运动.
	- 添加[Bevel(倒角)](https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/bevel.html)  modifier保持棱角
		- 设置limit method = angle. 调整angle. 只在四个棱(角度大)的位置设置倒角. 
		- 四边形 -> <a href="https://docs.blender.org/manual/en/latest/_images/modeling_modifiers_generate_bevel_square.png"><img src="https://docs.blender.org/manual/en/latest/_images/modeling_modifiers_generate_bevel_square.png"  width="100"></a>
	- 添加subdivision  光滑: 
		- **如果不设置倒角, subdivision分不清棱角是由模型粗糙导致的, 还是我们本来需要的.** 会把我们本来的四边形变成正多边形(近似圆形)... 
		- 还有另一种办法是在我们需要的棱周围设置[Loop Cut](https://docs.blender.org/manual/en/latest/modeling/meshes/tools/loop.html)(卡线)
- **制作路径: 用BezierCurve画出路径**
- **跟随路径: 设置Y轴为跟随轴**
	- 添加[Curve modifier](https://docs.blender.org/manual/en/latest/modeling/modifiers/deform/curve.html) : 
		- Curve Object为路径curve
		- Deform Axis 为Y
	- 打开Transform属性, 固定X, Z轴. 保持mesh相对于Y轴位置不变.
- **形状随路径变化?:**
	- 添加[Simple Deform](https://docs.blender.org/manual/en/latest/modeling/modifiers/deform/simple_deform.html) 的Twist效果
		- Origin为路径curve: 这样可能会导致twist的结果不可控, 想单独控制的话还是用一个空物体比较好
		- Axis为Y: 设置成和Curve modifier的Deform Axis一样, 只在轨道的截面上形变
- **调整动画**
	- 在起点和终点插入Location的关键帧
	- 调整graph editor
	- graph editor 右键 -> [handle type](https://docs.blender.org/manual/zh-hans/4.3/editors/graph_editor/fcurves/properties.html)  -> vector
		- handle type是graph的Bezier曲线上锚点梯度的预设, vector预设就是和linear一致
- **后期降噪: 用Compositing, 去除用cycle采样率不足导致的噪声**
	- Layer Property -> Include Denoising Data 打开  : 打开后才能传递Normal(法线贴图)和Albedo(反射率)
	- 添加一个denoise node: 传递Noisy Image-> Image, Denoising Normal -> Normal, Denoising Albedo -> Albedo
		- 在blender里是通过调用[OpenImageDenoise库](https://www.openimagedenoise.org) (unet based)实现: [node_composite_denoise.cc](https://github.com/blender/blender/blob/blender-v4.3-release/source/blender/nodes/composite/nodes/node_composite_denoise.cc) 


![follow_path.mp4]({{ '/docs/attachment/follow_path.mp4' | relative_url }}){:width="480"}

## 用到的blender的一些快捷键功能

- [Loop Cut](https://docs.blender.org/manual/en/latest/modeling/meshes/tools/loop.html)(卡线): 在edge中间添新的顶点
	- 添加loop cut: Ctrl+R
	- 选中已有的loop cut: Shift+Option+长按
- Edit Mode 下操作一个物体的mesh
	- 取消全部选择: Option + A
	- 定向放缩:
		- S+Shift+X: 放缩除X 轴外的两个轴, 即放缩YZ平面
		- 0 缩放尺度调整为0
	- 多选:  [L](https://docs.blender.org/manual/en/latest/modeling/meshes/selecting/linked.html)  
		- 鼠标放在要选择的物体上, 选中linked(相连)的mesh部分
	- 反选: ctrl + i
	- 复制
		- 在原物体上复制一个mesh: [Shift + D](https://docs.blender.org/manual/en/latest/scene_layout/object/editing/duplicate.html) 
		- 移动新mesh: Ctrl + 手势, 软件里有显示位置
- 打开关闭侧边 Transform栏: N


## blender用法

- 配置多窗口
	- 在底部右键 -> vertical split : 把右侧配成相机视角
- 调整相机视角:
	- View-> Align View -> Align Active Camera to View
	- View-> Navigation -> Walk Navigation 用wasd调整视角方向

### edit mode

- [pivot point(轴心点)](https://docs.blender.org/manual/en/2.80/scene_layout/object/editing/transform/control/pivot_point/index.html) 的不同选项影响transform对link里mesh是怎么作用的
	- ![Pasted image 20241210124924.png]({{ '/docs/attachment/Pasted image 20241210124924.png' | relative_url }}){:width="150"} individual orgin:  ![Pasted image 20241210124951.png]({{ '/docs/attachment/Pasted image 20241210124951.png' | relative_url }}){:width="150"}  median point: ![Pasted image 20241210125026.png]({{ '/docs/attachment/Pasted image 20241210125026.png' | relative_url }}){:width="150"} 
	- 默认median point是以所有组的中心apply transform的.
	- individual origins是组里每个connect component单独作用
### modifier

- [Simple Deform](https://docs.blender.org/manual/en/latest/modeling/modifiers/deform/simple_deform.html) 的Twist效果
	- ![Pasted image 20241213115547.png]({{ '/docs/attachment/Pasted image 20241213115547.png' | relative_url }}){:width="150"} 
	- 沿Axis扭曲, 扭曲角度由mesh上每个点到Origin的距离(指把点变化到object的局部坐标系下)决定
	- 想控制的话, Origin还是单独用一个空物体调整比较方便
- [Curve modifier](https://docs.blender.org/manual/en/latest/modeling/modifiers/deform/curve.html) : 
	- 物体坐标由xyz-chart , 转为(curve, 垂直平面) 构成的local chart. 
	- 超出curve的范围由两端顶点的梯度做外插得到.
	- ![Pasted image 20241211155218.png]({{ '/docs/attachment/Pasted image 20241211155218.png' | relative_url }}){:width="300"} 如图Z轴替换为curve, 变换前 -> 变换后(橙色)
