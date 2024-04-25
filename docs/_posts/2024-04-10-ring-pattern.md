---
layout: post
title: 画一个环形的重复图样
categories:
  - geometry
tags:
  - content
  - python
  - photoshop
  - opencv
last_modified_at: 2024-04-10T19:16:48-08:00
---
![Pasted image 20240410165502.png]({{ '/docs/attachment/Pasted image 20240410165502.png' | relative_url }}){:width="200"}

- 公司需要画一个这样的图像, 本来想法是先画一个方形渐变, 复制需要的份数, 极坐标变换. 
- 想全部在photoshop里面完成的, 但是发现不知道怎么复制
- 转向了python的pil画渐变和复制
- 用photoshop的极坐标变换和python opencv都可以完成
	- opencv是图到图的变换
- 又想到直接画出2d的坐标meshgrid再应用变换好像更容易?


代码: [**ring.py**](https://gist.github.com/roshameow/24e05cc4f336ca61c93ec2bc8e75ae39#file-ring-py) 


## 其他链接

[1] https://zhuanlan.zhihu.com/p/518229060 ps插件



