---
layout: post
title: 给 VsCode 安装插件
categories:
  - tool
tags:
  - content
  - typescript
  - vscode
  - dsl
last_modified_at: 2023-12-21T22:14:38-08:00
---


当我们使用大量自定义的 DSL（领域特定语言）构建表达式，例如：`add(multiply(pasteurize(x), y), z)`
这些函数（如 add, multiply, pasteurize）并不是 Python 的标准函数，而是平台自定义的 Operators。我们希望在 VSCode 中输入这些函数时：
- 能够自动补全
- 鼠标悬停时显示函数定义和用途

## 开发

### 开发环境配置

```bash
npm install -g yo generator-code
yo code
```

在执行 yo code 时，选择插件的配置选项：
- Identifier：插件的唯一名称
- Bundler：建议使用 esbuild，它简单且高效

### 插件功能实现

- 写主逻辑(在`src/extension.ts`中): 读取json, 定义activate行为(自动补全, 悬停提示...)
- 配置项目: 在package.json里, 配置activationEvents, contributes.languanage等信息. 在files里添加assets
	-  设置在extension.settting里加载本地配置文件: `configuration.properties`

### 调试

用View -> Output -> Extension Host查看log. 乱七八糟的log很多时, 搜索插件的Identifier定位.

### 打包

```bash
npm install -g vsce
npm run compile
vsce package
```

- 生成的`.vsix` 文件可以用于在VsCode里安装

### 安装

命令行 `code --install-extension .vsix 文件`

![Pasted image 20250706064758.png]({{ '/docs/attachment/Pasted image 20250706064758.png' | relative_url }}){:width="600"} 

## 代码

[https://github.com/roshameow/field-operator-hints](https://github.com/roshameow/field-operator-hints)

## VsCode Marketplace 发布插件

用github用户登陆, 发布到 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/vscode) 即可