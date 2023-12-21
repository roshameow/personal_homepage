---
layout: post
title: 小红书学到的几种图片调色
categories:
  - photo
tags:
  - content
  - 醒图
last_modified_at: 2023-12-22T01:53:56-08:00
---
感觉共同点是：为了追求画面简洁有冲击力，不约而同的压缩了亮度和颜色的动态范围。
## 版画滤镜

![Pasted image 20231221113525.png]({{ '/docs/attachment/Pasted image 20231221113525.png' | relative_url }}){:width="400"}  ![Pasted image 20231221113539.png]({{ '/docs/attachment/Pasted image 20231221113539.png' | relative_url }}){:width="400"} 
- 醒图4个滤镜依次叠加，透明度依次减小
	- 千禧->幻想蝴蝶
	- 新中式->空谷
	- 千禧->数字彩虹
	- 新中式->烟霞
- 实际实验结果
	- ![Pasted image 20231221114420.png]({{ '/docs/attachment/Pasted image 20231221114420.png' | relative_url }}){:width="400"}  
	- 调整亮度曲线如图，暗部切断，亮部反色，压缩动态范围
	- 添加噪声
	- 去掉图片原有颜色
	- 按照亮暗调节新的颜色

## 白夜之树


- ![Pasted image 20231221121648.png]({{ '/docs/attachment/Pasted image 20231221121648.png' | relative_url }}){:width="400"}  ![Pasted image 20231221121655.png]({{ '/docs/attachment/Pasted image 20231221121655.png' | relative_url }}){:width="400"} 

- 方法：
	- 醒图滤镜：千禧->午夜 把照片变成蓝色，就是为了伪造天空部分吧？
	- 曲线反色：画面要避开一些常见的物品，不然很容易看出其实是反色，就感觉出戏了
	- 光感-100：作用是，把有颜色的部分变暗？


## 单色涂鸦

![IMG_8192.jpg]({{ '/docs/attachment/IMG_8192.jpg' | relative_url }}){:width="400"}   ![IMG_8193.jpg]({{ '/docs/attachment/IMG_8193.jpg' | relative_url }}){:width="400"} 

- 方法：
	- 醒图特效：单色填充：可能是根据饱和度？把饱和度高的部分填充了粉色。因为图片里红色和蓝色都被填充了，所以不是根据主体色识别。其他位置变为灰度图
	- 醒图特效：单色涂鸦：检测边缘，设置白边
		- 可能是检测闭合的部分，处理成涂鸦的斜线
		- 检测线条少的位置加文字