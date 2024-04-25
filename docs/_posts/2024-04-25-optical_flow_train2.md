---
layout: post
title: 小面积光流传感器算法测试 (二)
categories:
  - algorithm
tags:
  - content
last_modified_at: 2024-04-25T14:34:30-08:00
---

正样本: 和patch距离<0.5的patch
负样本: 和patch有部分相同pattern 

### torch grid sample

torch grid 的采样方式有align_corners=True和align_cornes=False两种
- ![Pasted image 20240415160510.png]({{ '/docs/attachment/Pasted image 20240415160510.png' | relative_url }}){:width="250"} 
- 转换关系 
	- pixel -> grid(align_corner=True): `x=x/(n-1)*2-1`
	- grid(align_corner=True) -> pixel: `x=`