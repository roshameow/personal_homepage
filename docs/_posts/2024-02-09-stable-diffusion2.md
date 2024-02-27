---
layout: post
title: "stable-diffusion的用法: 用 lora+controlnet做风格转换"
categories:
  - photo
tags:
  - content
  - ComfyUI
  - ipadapter
  - controlnet
  - canny
  - sdxl
last_modified_at: 2024-02-24T13:25:27-08:00
---

尝试只用ipadapter做猫的风格转换, 非常不成功, ipadapter还是无法控制输入的元素. 必须要用多张图片训练的LoRA控制. 
另外, 猫脸上颜色分布的特征, 没有controlnet可以直接表示. 

## ComfyUI步骤

1. **训练Lora** 
	- 用[kohya_ss](https://github.com/bmaltais/kohya_ss) 的gui训练
		- network rank设置64
		- 打开Gradient checkpoint, 不然我16G的显存不够用
		- 另外, 我的wsl2需要解决一下找不到cuda toolkit的问题
			- 检查发现是ubuntu的requirement里面指定的torch和bitsandbytes版本不匹配
			- 在虚拟环境里, 升级到最新版2.2后代码又出问题
			- 最后参考windows版本的requirement.txt, 改成torch=2.1.0+cu118解决了
1. **连上Lora节点** 
	- ComfyUI里连接顺序是: Checkpoint: model, clip -> Lora
	- 多个Lora顺序连接就行
	- ip的lora的weigt设为1.22, 风格化lora的weight不用设那么大
1. **写text prompt**
	- 写了包括描述内容的, lora配套的, 描述想要风格的positive prompt
1. **连上Controlnet节点** 
	- 用到了[canny模型, depth模型](https://huggingface.co/collections/diffusers/sdxl-controlnets-64f9c35846f3f06f5abe351f) 
		- 下载[Marigold](https://github.com/kijai/ComfyUI-Marigold)的深度识别模型节点

## 结果

![Pasted image 20240209124721.png]({{ '/docs/attachment/Pasted image 20240209124721.png' | relative_url }}){:width="150"} -> ![Pasted image 20240209124343.png]({{ '/docs/attachment/Pasted image 20240209124343.png' | relative_url }}){:width="600"} 

- **风格:** 3种方法都可以
	1. text prompt里输入
	2. 风格LoRA
		- 在prompt也要加上对应风格关键词
	3. 用ipadpter输入风格图片控制
		- ipadpter的weight需要调整: 不能太低(风格化没用), 也不能太高(和风格图太像)
		- 一直有和风格图太像, 或者风格图提供我们不想要元素的风险...毕竟一张图片的信息不像文字和lora那样有明确的指向性
		- 我用的不是换脸模型, 但是模型好像特别执着于换脸? 的确模型本来的目的是换ip...
	4. 另外, 可以直接用一个特定风格的大模型
- **控制:** 
	- 用canny或depth模型都能做到控制猫的位置
		- Marigold的识别特别慢, 尝试的时候计算完深度图要先把那个节点断开
- **问题:** 
	- 有些风格单独可以出图, 但是加了我训练的猫的LoRA就没法出对应风格的图了
	- 用LoRA训练的模型没有完全理解我的猫的所有特征: 尤其是鼻子和嘴附近的毛色
		- 我用了30多张照片, 也没有改label的caption, 所以可能还有质量增加的空间
	- 用ipadpter的失败经验:
		- 如果用一张猫的图片和一张风格图
			- ![Pasted image 20240209133511.png]({{ '/docs/attachment/Pasted image 20240209133511.png' | relative_url }}){:width="100"} 
			- 无法控制输入元素

	
## ComfyUI workflow

用Lora调整风格$\downarrow$ : [**rosha_lora_controlnet_canny_depth_style_change.json**](https://gist.github.com/roshameow/d952bf0157a25ab3e9e724df1449b160#file-rosha_lora_controlnet_canny_depth_style_change-json) 

![屏幕截图 2024-02-08 230728.png]({{ '/docs/attachment/屏幕截图 2024-02-08 230728.png' | relative_url }}){:width="800"} 

用ipadator调整风格$\downarrow$ : [**rosha_lora_ipadapter_style_tranformation.json**](https://gist.github.com/roshameow/d952bf0157a25ab3e9e724df1449b160#file-rosha_lora_ipadapter_style_tranformation-json) 

![Pasted image 20240209135354.png]({{ '/docs/attachment/Pasted image 20240209135354.png' | relative_url }}){:width="800"}

## 资源

艺术风格prompt:

[1] https://medium.com/phygital/top-40-useful-prompts-for-stable-diffusion-xl-008c03dd0557

[2] https://docs.midjourney.com/docs/explore-prompting

[3] https://www.urania.ai/top-sd-artists

[4] https://github.com/SupaGruen/StableDiffusion-CheatSheet 是v1.5插件

Lora训练: 

[5]  [https://www.youtube.com/watch?v=NaHtI0u3Am4](https://www.youtube.com/watch?v=NaHtI0u3Am4) kohya_ss的参数设置,

[6] https://zhuanlan.zhihu.com/p/654322145.   下面讨论说optimizer还是默认比较好?
