---
layout: post
title: raycast脚本
categories:
  - tool
tags:
  - content
  - raycast
last_modified_at: 2024-10-12T05:25
created: 2024-09-29T18:00
---

- [raycast脚本举例](https://nicrow.com/automation/raycast-script-commands/)

### 把视频转成mp4

其他软件经常生成的.avi(blender), .mov(Final Cut Pro) 都太大了不方便分享

- 如果用raycast 直接完成脚本功能, 遇到的困难:
	1. raycast script执行在non-login shell, 没法调取在`$PATH` 里的`ffmpeg` 命令(see https://github.com/raycast/script-commands/issues/165)
	2. raycast的输入框没有拖拽文件路径的功能, 感觉用起来挺麻烦的
- 如果用raycast脚本开启terminal, 并把命令写到clipboard里, 遇到的困难:
	1. raycast的脚本也是脚本, 没法直接控制键盘功能, 还是要跳转到对应位置输入视频
- 如果放弃raycast: 写脚本完成功能, 把视频名称作为脚本参数, 用`alias` 在terminal启动脚本
	- 感觉是最省事的了?