---
layout: post
title: Serverless服务
categories:
  - WebPage
tags:
  - content
last_modified_at: 2025-04-03T11:29
created: 2024-12-19T22:00
---
租虚拟服务器代替真实服务器

- 优点: 
	- 减少运维麻烦: 比如操作系统的安装和管理, 硬件的配置, 网络的配置(防火墙, 隔离, 权限等), 运行环境和依赖的配置, 容灾备份等
	- 自动扩展: 不用手动配置负载均衡器, 调整服务器数量
	- 自动优化: 跟据函数的内存大小, 自动优化代码的执行时间和性能
	- 可能更省钱: 用运行资源(程序执行时间, cpu, 内存, 公网流量等) 计费, 而不是服务器数量计费

AWS S3, Dy..db, Lambda, SQS/SNS, Fargate, API Gateway

- 每个lambda function 单独配置权限, 类似github action
## 阿里云

- 负载均衡方案: 
	- clb
	- nlb
	- alb


## 普通服务器

- 配置流程:
	- 绑定密钥登陆. 一般是`.pem` 文件
		- 把密钥放在常用的地方
		- 修改权限: `chmod 400 密钥名.pem`
		-  登陆: `ssh -i ~/.ssh/密钥名.pem ubuntu@远程ip`
			- 或在`~/.ssh/config` 中配置host
	- 挂载文件系统:
		- 在本地和远程安装`sshf`: 尽量不要传太多文件. 基于ssh传输. 有点卡
		- 登陆: `sshfs -o IdentityFile=密钥.pem ubuntu@远程ip:/home/ubuntu 本地挂载文件夹 -o debug`
		- 卸载: `unmount 本地挂载文件夹`
	- 安装python虚拟环境
		- `sudo apt install python3-venv`
		- `python3 -m venv my_env`
		- `source my_env/bin/activate` 
	- 在虚拟环境中安装packages


- 遇到的问题:
	- mac:
		- 挂载需要安装macFUSE :
			- 需要降低mac的安全防护: 允许third party kernel extensions(see [https://github.com/macfuse/macfuse/wiki/Getting-Started](https://github.com/macfuse/macfuse/wiki/Getting-Started) )
	- 腾讯云
		- 终端可以用Orcaterm 操作. 有文件系统, 也能直接用命令行, ~~感觉挺方便的~~ : 😮‍💨 总要微信扫码登录和验证实在太烦了, 没法长时间使用
		- 在虚拟环境下用pip装package还是会不讲道理报错, 需要禁用外部环境管理检查: `export PIP_BREAK_SYSTEM_PACKAGES=1`
		- 没有自带tmux, 要自己安装一下
	- 亚马逊ec2
		- cpu用超了(list太大之类)会直接卡住无法登陆. 不过等一会儿进程会自动被kill.😂 就又可以了