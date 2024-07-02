---
layout: post
title: "stable-diffusion的用法: 常用插件"
categories:
  - tool
tags:
  - content
  - ComfyUI
last_modified_at: 2024-06-30T23:18:46-08:00
---


ComfyUI使用时用到的插件

| 插件                                                                                             | 用途                                                                                   | 类型     | 必须? |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------ | --- |
| [ComfyUI-Manager](https://github.com/ltdrdata/ComfyUI-Manager)                                 | - 查找和安装插件和模型<br>- 可以识别工作流中的missing node                                              | 功能     | ✔️  |
| [rgthree-comfy](https://github.com/rgthree/rgthree-comfy)                                      | - 显示一个node执行进度条<br>- 优化节点执行graph<br>- 提供Image Comparer节点<br>- Lora Loader Stack 节点   | 功能     |     |
| [Resize](https://github.com/palant/image-resize-comfyui)                                       | resize图片                                                                             | 功能<br> | ✔️  |
| [image-saver](https://github.com/giriss/comfy-image-saver)                                     | Save Image w/Metadata节点<br>把图片生成的信息写到图片metadata里<br>(webui有类似功能)                     | 功能     |     |
| [Impact-Pack](https://github.com/ltdrdata/ComfyUI-Impact-Pack)                                 | 很多功能, 但是有些感觉封装的太复杂了                                                                  | 功能     |     |
| [Comfyroll_CustomNodes](https://github.com/Suzie1/ComfyUI_Comfyroll_CustomNodes)               | CR开头的一堆节点                                                                            | 功能     |     |
| [UltimateSDUpscale](https://github.com/ssitu/ComfyUI_UltimateSDUpscale)                        | - 分块图生图<br>- 改变tile的一些融合方式                                                           | 功能     |     |
| [comfyui-mixlab-nodes](https://github.com/shadowcz007/comfyui-mixlab-nodes?tab=readme-ov-file) | - clip interrogator 节点: 分析图片信息                                                       | 功能<br> |     |
| [promt styler](https://github.com/twri/sdxl_prompt_styler)                                     | - SDXL Prompt Styler: 把一些画风写成prompt                                                  | 功能     |     |
| [ComfyUI-Marigold](https://github.com/kijai/ComfyUI-Marigold)                                  | 识别深度图                                                                                | 模型     |     |
| [comfyui_segment_anything](https://github.com/storyicon/comfyui_segment_anything)              | 识别mask                                                                               | 模型     |     |
| [inpaint-nodes](https://github.com/Acly/comfyui-inpaint-nodes)                                 | 一系列关于inpaint的节点<br>- Fooocus inapint<br>- Inpaint (using Model) : 用于加载Lama等inpaint模型 | 模型     |     |


很多插件提供重复的功能, 或者没有维护, 生态还挺混乱的





