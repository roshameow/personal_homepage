---
layout: post
title: 给网页添加 logo
categories:
  - photo
tags:
  - content
  - jekyll
  - photoshop
  - logo
last_modified_at: 2024-05-10T12:36:50-08:00
---
![logo.svg]({{ '/docs/attachment/logo.svg' | relative_url }}){:width="200"} 

## 用照片制作svg

这次只描了轮廓

![Pasted image 20240510121915.png]({{ '/docs/attachment/Pasted image 20240510121915.png' | relative_url }}){:width="200"} 

- 用钢笔工具和选择工具画路径:
	-  在最凸，最凹的地方加锚点
	-  添加锚点时拉拽得到切线
    - 按command 单独调整锚点和切线的端点
    - option调整切线
    - 用直接选择工具(白色箭头)调整锚点位置
    - 用路径选择工具(黑色箭头)复制路径
    - 用颜色填充功能实时查看路径闭包
- 导出:
	- 选中填充图层复制svg
    
## 设置网页的favicon

- 在对应html设置icon:  `<link rel="shortcut icon" type="image/x-icon" href="{{ site.baseurl }}/docs/images/logo.ico">`
	- 我的路径是`head.html->head-custom.html`


## 资源

[1]  [https://www.bilibili.com/video/BV1pP4y1R7r6](https://www.bilibili.com/video/BV1pP4y1R7r6/) 钢笔工具使用

[2]  [https://www.taoxuemei.com/chuli/ps/754.html](https://www.taoxuemei.com/chuli/ps/754.html) 钢笔工具画的形状->svg

[3]  [https://zhuanlan.zhihu.com/p/446194623](https://zhuanlan.zhihu.com/p/446194623) 路径转形状

[4]  https://stackoverflow.com/questions/30551501/unable-to-set-favicon-using-jekyll-and-github-pages  关于icon路径的讨论

[5]  https://convertio.co/download/9dceab468ba01473f3d49fc765b6f73f983c7f/ svg转ico


