---
layout: post
title: "stable-diffusion的用法: 用 ipadatper+controlnet canny做风格转换"
categories:
  - photo
tags:
  - content
  - ComfyUI
  - ipadapter
  - controlnet
  - canny
  - sdxl
last_modified_at: 2024-02-24T11:16:16-08:00
---

用ipadapter和canny做风格转换

## ComfyUI使用

1. 调用ComfyUI中default的工作流
	- 下载[sdxl模型](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0) 
1. **连上IPAdapter节点** 
	- 安装[IPAdapter_plus插件](https://github.com/cubiq/ComfyUI_IPAdapter_plus) 
		- 下载需要的ipadater微调模型和clip vision编码器: 把图像用clip vision编码后输入base model的cross-attention层
	- ComfyUI里连接顺序是: Checkpoint: model-> IPAdapter: model -> KSampler: model 
	- weigt设为1, text prompt都空着, latent prompt也空着
2. **连上Controlnet节点** 
	- 下载[canny模型](https://huggingface.co/collections/diffusers/sdxl-controlnets-64f9c35846f3f06f5abe351f) 
		- ~~找不到其他适合sdxl的controlnet模型~~因为我们的原图是个线稿适合用canny
	- ComfyUI里连接顺序是: Checkpoint->prompt->controlnet->Ksampler: text prompt
		- controlnet最后是作用在condition(positive, negative)上的, 和text promt一样
	- 调整controlnet权重和影响步数: stength=0.5, start_percent=0, end_percent=0.6
		- 如果设置过大就只能得到一张有颜色的线稿图

## 结果

原图: 
![屏幕截图 2024-02-07 224110.png]({{ '/docs/attachment/屏幕截图 2024-02-07 224110.png' | relative_url }}){:width="600"} + ![2e2b76d160ca4317bb8e095ffd8ff878.jpg.png]({{ '/docs/attachment/2e2b76d160ca4317bb8e095ffd8ff878.jpg.png' | relative_url }}){:width="150"} 

合成图: 
![屏幕截图 2024-02-07 224141.png]({{ '/docs/attachment/屏幕截图 2024-02-07 224141.png' | relative_url }}){:width="600"} 

- 竟然可以识别龙的眼睛啊...有好几幅图都把猫眼替换到了龙眼上
	- 如果两种图有同样的元素(眼睛之类的), 可能可以比较好的替换
	- 最后的龙和人, 龙和山, 都不能对应起来
- ipadapter没法主动控制合成哪个图像中的哪种元素: 
	- 虽然替换了颜色, 背景, 但是没法替换材质, 笔触
	- 有几张图还替换了原图的色块分布, 这是我们不想要的
- 另外, controlnet-canny和ipadapter的龙都不能省略
	- 如果ipadapter只用风格图: 
		- ![Pasted image 20240208003655.png]({{ '/docs/attachment/Pasted image 20240208003655.png' | relative_url }}){:width="100"} ![Pasted image 20240208003712.png]({{ '/docs/attachment/Pasted image 20240208003712.png' | relative_url }}){:width="100"} 
		- 增加control-net的权重也是没用的, weight=0.8时出现了噪声图案
	- 如果不加controlnet:
		- ![Pasted image 20240208003804.png]({{ '/docs/attachment/Pasted image 20240208003804.png' | relative_url }}){:width="100"} ![Pasted image 20240208003819.png]({{ '/docs/attachment/Pasted image 20240208003819.png' | relative_url }}){:width="100"} 
	- 看起来controlnet保持了龙的外形结构, ipadpter加龙提高了龙的权重, 不过ipadapter从龙图中究竟学到了什么? 是扁平的画风吗? 只用风格图的情况下, 确实画风更接近风格图, 但是内容也更接近了
		- 可以通过text prompt控制吗? 但是clip又无法理解简笔画的龙.


## ComfyUI workflow

[**ipadapter_controlnet-canny_loong_style_change.json**](https://gist.github.com/roshameow/d952bf0157a25ab3e9e724df1449b160#file-ipadapter_controlnet-canny_loong_style_change-json)

![屏幕截图 2024-02-07 224530.png]({{ '/docs/attachment/屏幕截图 2024-02-07 224530.png' | relative_url }}){:width="800"}


## ComfyUI难用的地方

- UI的奇怪地方
	- 有参数的地方字体相对整个节点特别小, 而且没法调节. 输入text prompt的时候是根本看不清..
	- 鼠标的十字倒是特别大...
- 节点连接非常反常识
	- load节点
		- 输入都在右侧, 一般会觉得应该把prompt输入模型
		- load节点的存在就很奇怪, 为什么不把load和apply合并到一起? 或者在右侧用菜单栏切换
		- model里面还有个model_name? 模型的名字一长全混在一起真的分不清啊...
	- preview Image节点
		- 为什么不直接做成一个下拉选项...
- 节点划分不明确: ComfyUI里面一个节点会用dict的形式传递多种参数
	- latent里面可能包含latent image, noise mask, 也可能不包含noise mask, 此时连接到需要noise mask key的latent节点就会报错
	- condition(positive, negative)也包含多种condition...
- 为什么不能做成一个Chromium内核的本地app..
	- 据说有一些方法可以打包成一个app?
	- 凡需要inpaint输入的地方, 输入方式很不方便, 能和其他专门用来绘图的软件结合就好了
- 虽然如此, 可以用节点和分享工作流就比webui好用太多了


## 其他讨论这个链接

[1] https://zhuanlan.zhihu.com/p/664201523 里面介绍了一个换画风的工作流, 不过例子是人像, 可能本身网络对人像的理解能力更强吧?　

