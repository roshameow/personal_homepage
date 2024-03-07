---
layout: post
title: stable-diffusion的结构和微调模型
categories:
  - deeplearning
tags:
  - content
  - attention
  - stable-diffusion
  - lora
  - controlnet
  - ipadapter
  - gligen
last_modified_at: 2024-03-06T19:18:33-08:00
---
## stable-diffusion结构和controlnet插件

![Pasted image 20240306124200.png]({{ '/docs/attachment/Pasted image 20240306124200.png' | relative_url }}){:width="500"} 

- controlnet保持和stable-diffusion u-net上半部分相同的结构
- controlnet输入是和原图一样的hint图像, 比如controlnet-openpose输入的不是关节坐标数据, 而是彩色的人体坐标图

## Resnetblock, SpatialTransfomer 结构和插件

![Pasted image 20240306123108.png]({{ '/docs/attachment/Pasted image 20240306123108.png' | relative_url }}){:width="300"} ![Pasted image 20240306123128.png]({{ '/docs/attachment/Pasted image 20240306123128.png' | relative_url }}){:width="500"}

- lora可以应用在网络的任何线性结构上, 比如:
	- attention里面的q,k,v,out层
	- feedforward里面的linear层
	- clip里面的mlp, fc层
- 这几种模型的作用的粒度不一样, 从小到大是: lora(线性层) < Gligen=IpAdapter(SpatialTransformer层) < Controlnet(U-net的block)
	- 模型的size也是依次变大


## reference 
<span id="ref"></span>
[1] Hu, Edward J., Yelong Shen, Phillip Wallis, Zeyuan Allen-Zhu, Yuanzhi Li, Shean Wang, Lu Wang, and Weizhu Chen. “**LoRA**: Low-Rank Adaptation of Large Language Models.” arXiv, October 16, 2021. [https://doi.org/10.48550/arXiv.2106.09685](https://doi.org/10.48550/arXiv.2106.09685).

[2] Zhang, Lvmin, and Maneesh Agrawala. “Adding Conditional **Control** to Text-to-Image Diffusion Models.” arXiv, February 10, 2023. [https://doi.org/10.48550/arXiv.2302.05543](https://doi.org/10.48550/arXiv.2302.05543).

[3] Ye, Hu, Jun Zhang, Sibo Liu, Xiao Han, and Wei Yang. “**IP-Adapter**: Text Compatible Image Prompt Adapter for Text-to-Image Diffusion Models.” arXiv.org, August 13, 2023. [https://arxiv.org/abs/2308.06721v1](https://arxiv.org/abs/2308.06721v1).

[4] Li, Yuheng, Haotian Liu, Qingyang Wu, Fangzhou Mu, Jianwei Yang, Jianfeng Gao, Chunyuan Li, and Yong Jae Lee. “**GLIGEN**: Open-Set Grounded Text-to-Image Generation.” arXiv, April 16, 2023. [https://doi.org/10.48550/arXiv.2301.07093](https://doi.org/10.48550/arXiv.2301.07093).

代码: 参考comfyui里`comfy.ldm.modules.diffusionmodules.openaimodel.py` 的实现, 除了controlnet是加在`condition` 流里面, 其他几种都是通过`model.patches` 切换网络分支实现的. 

