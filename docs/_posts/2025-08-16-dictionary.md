---
layout: post
title: mac系统字典
categories:
  - tool
  - mac
tags:
  - content
last_modified_at: 2025-08-19T18:47
created: 2025-08-16T22:52
---
目标是把 MongoDB 里存放的术语和定义，打包成可以在 **macOS 自带“字典”应用**中查询的本地词典。  

## 成功步骤

用脚本实现1-2-3步骤即可. 代码:  [**mongo_2_dictionary.py**](https://gist.github.com/roshameow/15d29ace410e296cdbd0da4c4531ba14#file-mongo_2_dictionary-py) 

1. 把数据转成 **Apple Dictionary 支持的 TSV 格式**。
	- ⚠️ 避坑：不要用 `\t\n` , 用 **HTML 标签**来控制排版，用 `<div>` 表示新行，用 `<br>` 来做分隔。这样避免了特殊字符被误解析。
2. 用  [PyGlossary](https://github.com/ilius/pyglossary) 把 `.tsv` 转成 AppleDict 的源文件。`pyglossary dictionary_dump.tsv output.dictionary --read-format=Tabfile --write-format=AppleDict`
	- ⚠️ 避坑：不要用 CSV,  一开始我试过 CSV，但 AppleDict 的编译脚本会直接解析失败。
3. 编译 Apple Dictionary
	- PyGlossary 会生成一个字典目录，里面包含：`.xml` 源文件,  `.css` 样式文件, `.plist` 配置文件, `Makefile`
	- 正常情况下，进入目录直接运行：`make ; make install`
4. 安装完成后，打开 macOS 自带的“字典”应用，在settting里勾选新字典。

## 工具和坑点总结

- **需要安装 Dictionary Development Kit (DDK)**
    - 据说macOS 有自带的 `dictutil` 我没有找到。
    - DDK 要单独安装（Xcode 附带）。
- **不要用 DDK 官方的 `build_dict.sh`**, 用  [PyGlossary](https://github.com/ilius/pyglossary) 生成
    - 这个脚本里调用的 `make_line.pl` ，perl 脚本里有 bug。无法解决. xml 格式也非常讨厌
- **样式限制**
    - Apple Dictionary 对标题样式是写死的，没法自定义。
- **调试**
	- 我在自己本地的dev版app上调试, 发现字典不是实时更新的, **需要重启之后才会加载新的** (可能是``DictionaryServices.framework`` 的行为特性, 每个app单独一个缓存, 字典也在里面, 不会热更新)

## 结果

![Pasted image 20250819114921.png]({{ '/docs/attachment/Pasted image 20250819114921.png' | relative_url }}){:width="300"}

- 效果和官方字典差不多
- 但是在一些网页的在线代码编辑器(可能用的是自绘控件, 而不是macos的Cocoa文本系统)和微信(lookup被软件禁用)不能用