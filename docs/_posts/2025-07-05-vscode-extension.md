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
last_modified_at: 2025-10-19T09:51
created: 2025-07-05T15:59
---
![Pasted image 20250706064758.png]({{ '/docs/attachment/Pasted image 20250706064758.png' | relative_url }}){:width="600"}

当我们使用大量自定义的 DSL（领域特定语言）来构建表达式时，例如：

```python
add(multiply(pasteurize(x), y), z)
```

这些函数（如 `add`、`multiply`、`pasteurize`）并不是 Python 的标准函数，而是平台自定义的 **Operators**。
为了提升开发体验，我们希望在 VSCode 中输入这些函数时能够：

* 自动补全函数名
* 鼠标悬停时显示函数定义与用途
* callout查找: 输入/selection 下拉所有selection字段

## 一、开发环境准备

安装 Yeoman 和 VSCode 插件生成器：

```bash
npm install -g yo generator-code
yo code
```

在执行 `yo code` 时，选择以下配置：

* **Identifier**：插件的唯一标识名
* **Bundler**：推荐使用 `esbuild`（简单高效）

生成的模板项目会包含基本的结构与示例代码。

## 二、插件功能实现

插件的核心逻辑在 `src/extension.ts` 中实现，主要包括：

1. **加载数据源(Loader)**
   从本地 JSON 文件中读取 Operators 定义。
2. **注册 Provider**
   * 自动补全：`CompletionItemProvider`
   * 悬停提示：`HoverProvider`
3. **定义激活行为（activate）**
   在插件被加载时执行初始化逻辑。
4. **配置插件信息（package.json）**
   * `activationEvents`：定义何时激活插件（例如在打开 Python 文件时）
   * `contributes.languages`：声明支持的语言类型
   * `contributes.configuration`：声明可在设置中配置的属性
	   * 如, 在 `configuration.properties` 中自定义json文件加载路径

## 三、调试技巧

1. 默认的 **Extension Host Output**(`View -> Output -> Extension Host`) 面板常常被其他插件日志淹没, 在搜索栏中输入插件的标识符快速定位. (这个方法会找不到`console.log` ) 
2. 改用自定义日志通道：

```ts
const outputChannel = vscode.window.createOutputChannel('channel name');
outputChannel.appendLine('Plugin activated.');
outputChannel.show(true);
```

这样可以在 “Output → channel name” 中单独查看日志，避免混乱。

## 四、插件打包

在项目根目录执行以下命令：

```bash
npm install -g vsce
npm run compile
vsce package
```

完成后，会生成一个 `.vsix` 文件。
该文件就是 VSCode 插件包，可供安装和分发。


## 五、本地安装

通过命令行安装插件：

```bash
code --install-extension your-plugin.vsix
```

安装成功后，即可在 VSCode 中启用插件功能。

> ✅ 提示：也可以通过 “扩展” 面板 → “从 VSIX 安装...” 手动安装。


## 六、发布到 VSCode Marketplace

很多软件的插件发布麻烦, 但是vscode发布开源插件非常省事👍

1. 使用 GitHub 账号登录 [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/vscode)。
2. 上传 `.vsix` 文件或通过命令行发布。
3. 提供插件描述、图标和 README 内容。

完成后，即可通过 VSCode 扩展市场直接搜索并安装插件。


## 代码

👉 [GitHub: roshameow/field-operator-hints](https://github.com/roshameow/field-operator-hints)


