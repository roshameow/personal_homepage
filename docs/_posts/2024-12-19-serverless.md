---
layout: post
title: Serverless服务
categories:
  - WebPage
tags:
  - content
last_modified_at: 2025-01-01T04:48
created: 2024-12-19T22:00
---
租虚拟服务器代替真实服务器

- 优点: 
	- 减少运维麻烦: 比如操作系统的安装和管理, 硬件的配置, 网络的配置(防火墙, 隔离, 权限等), 运行环境和依赖的配置, 容灾备份等
	- 自动扩展: 不用手动配置负载均衡器, 调整服务器数量
	- 自动优化: 跟据函数的内存大小, 自动优化代码的执行时间和性能
	- 可能更省钱: 用运行资源(程序执行时间, cpu, 内存, 公网流量等) 计费, 而不是服务器数量计费

AWS Lambda

- 每个lambda function 单独配置权限, 类似github action
## 阿里云

- 负载均衡方案: 
	- clb
	- nlb
	- alb