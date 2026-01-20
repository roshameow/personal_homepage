---
layout: post
title: 怎么把一个小功能润色成用户产品
categories:
  - tool
tags:
  - content
last_modified_at: 2026-01-11T20:59
created: 2026-01-01T23:23
---
通过学习这个 [优秀的案例](https://github.com/journey-ad/gemini-watermark-remover) 学了一些我没做到, 不过不知道有没有用的技巧. 应该有点用吧?
## 更专业的github

- README
	- 隐私声明： 明确告知用户“纯前端运行，图片数据不离机”。这是这个产品最大的卖点之一。如果你的算法能在本地跑，一定要大写加粗告诉用户。
	- 开源/原理透明：在页面底部放上原理解释和原理的文章链接
	- 安装方法
	-  免责声明：Disclaimer（仅供学习交流，后果自负)
- Demo GIF
- LICENSE
- Shields.io badges
- About 区域填满

## 降低使用门槛

- 纯前端实现(不登陆, 不注册, 不配置)
- Web版
	- 极简的功能
- 插件化
	- 通用Userscript

## 试验

尝试小范围的宣传自己的开源项目, 发现很困难 
1. 设计了很多开放性接口, 但是没人会使用, 没有配套文档. 别人并不会看readme. 想要的是安装后就能直接使用的app
2. 不够通用. 
3. 每个界面, 每个按钮都要有用.