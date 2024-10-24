---
layout: post
title: 用 jekyll+obsidian生成个人主页并部署到 github pages的工作流
categories:
  - WebPage
tags:
  - content
  - jekyll
  - markdown
  - obsidian
  - raycast
last_modified_at: 2024-10-23T07:52
created: 2023-12-20T12:28
---
用jekyll的原因无需多说。这样配置好工作流之后，除了编写内容基本没有什么麻烦的操作(登录在线网页，换编辑器，按照统一格式改文件名之类在我看来都很麻烦。。)。
### Ruby的环境管理，包管理方式

- **管理顺序：** churby -> ruby -> bundle -> gem -> jekyll
  - **ruby：** 是经常在 web 开发中使用的一种动态语言。
  - **churby：** Ruby 的环境管理工具，用于管理不同版本的 Ruby。
  - **gem：** Ruby 编写的软件包的统称，Jekyll 也是一个 gem。
  - **bundler：** 用于管理项目 gem 的工具，根据 Gemfile 管理不同版本的 gem。bundler自己本身也是gem。

如果用 Python 来类比，关系大概是这样：

| ruby | python | 
|:------------:|:------------:|
| `churby 版本号` | `conda create -n my_env python=版本号;`<br/> `conda activate my_env` |
| `gem install 某个包` | `pip install 某个包` |
| `bundler install` | `pip install -r requirements.txt` |


### 具体配置流程

1. **安装ruby**
   - 按照 [Jekyll 网站][1] 的方法，安装 Chruby 和 Ruby-install。
   - 切换到对应版本的 Ruby。
   - 在 macOS 中我遇到的问题是系统中已经安装了 Miniforge3，其中包含了 OpenSSL，但不能正常使用。通过 [Homebrew 安装 OpenSSL@1.1][2] 解决。

3. **本地配置**
   - 选择一个博客主题，例如 [So Simple][3]，fork 对应主题的 GitHub 代码，然后根据自己的需要修改 `_config.yml`。
   - 运行 `bundler install` 安装项目所需的 gem。
   - 运行 `bundle exec jekyll serve`，此时可以在本地进行预览。

4. **利用 GitHub Actions 部署到 GitHub Pages**
   - 将下面的 Action 脚本添加到项目的 `.github/workflows/main.yml` 文件。等待执行完成，可以通过浏览器访问 `http://name.github.io/base_url/`。

	```yml
	name: Homepage Project Deploy to GitHub Pages
	
	on:
	  push:
		branches:
		  - master #设置每次将代码推送到 master 分支时自动执行
	
	permissions:
	  contents: write
	
	jobs:
		deploy:
		  runs-on: ubuntu-latest
		  steps:
		  - name: Checkout repository
			uses: actions/checkout@v4
	
		  - name: Set up ruby and gems
			uses: ruby/setup-ruby@v1 #如果用ruby install的话好像没法切换版本
			with:
			  ruby-version: '3.2' # Not needed with a .ruby-version file
			  bundler-cache: true # runs 'bundle install' and caches installed gems automatically
	
		  - name: Build and deploy
			run: |
				bundle exec jekyll build
				echo 'personal-homepage' > _site/CNAME
				cp _site/index.html _site/404.html
				touch _site/.nojekyll #必须的，gh-pages分支没有环境，必须要跳过build
			env:
				JEKYLL_ENV: production
	
		  - name: Deploy to GitHub Pages
			uses: JamesIves/github-pages-deploy-action@releases/v3
			with:
				GITHUB_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
				BRANCH: gh-pages
				FOLDER: _site
	```
	- 因为actions里有写入操作，需要先去账户生成一个有权限的token。具体参考[github文档][4] 
	- 还需要在repo setting里把gh-pages[设置为pages对应的branch][5] 。

4. **更新内容：**
   - 在 `docs/_posts` 中更新内容。因为我平时笔记都是在 Obsidian 中编辑的，决定在 Obsidian 中设置一个文件夹，然后将每篇笔记同步到 `docs/_posts` 文件夹中。
   - 用obsidian的优点：
	    - Markdown 格式, 包括Front Matter在 Obsidian 中显示非常舒适。
     - ![Pasted image 20231221194128.png]({{ '/docs/attachment/Pasted image 20231221194128.png' | relative_url }}){:width="600"} 

     - 利用 Obsidian 的[`update-time-on-edit`](https://github.com/beaussan/update-time-on-edit-obsidian) 插件，可以自动更新 `last_modified_date`。
     - 利用 Obsidian 的 `unique note` 插件，可以通过点击生成符合格式的笔记模板。

5. **同步：**
   - 大部分 Obsidian 的 Markdown 格式是直接兼容的。为了同步，我编写了一个 Bash 脚本`sync_homepage.sh` ，把双链改成 Markdown 链接，并将文章中链接的图片同步到 `docs/attachment` 文件夹下。
   - 注意代码块可能会解析错误，所以在脚本里把ruby的代码块都替换成Liquid语法。
   - 问题：目前不支持增量同步，每次同步都需要遍历所有文件，但由于都是文本文件，影响较小。
6. **和raycast联动:**
	- 然后给脚本设置raycast的标记。这样每次在obsidian里面编辑完，直接用raycast快捷键同步。
 ![Pasted image 20231221195227.png]({{ '/docs/attachment/Pasted image 20231221195227.png' | relative_url }}){:width="600"} 

`sync_homepage.sh` 示范：

<script src="https://gist.github.com/roshameow/d476620467bc40d79519f827bfd07da5.js"></script>

### 其他配置

1. **配置位置：**
	- 我的模版调用顺序是`_layouts/default.html->_includes/scripts.html->includes/对应功能.html` 
	- 调整页面文字宽度: 我的模版中是调整`_page.scss` 和 `_variables.scss` 中的对应参数
2. **配置latex风格的公式：** 
	- 用[mathjax@3][6] : 只支持`$$...$$`风格的语法，需要在Mathjax的tex里面配置一下支持一般的`$...$`语法
	```
	<script>
	    MathJax = {
	        tex: {
	            tags: "{{ site.mathjax.tags | default: 'ams' }}",    // eq numbering options: none, ams, all
	            inlineMath: [['$', '$'], ["\\(", "\\)"]],  // 设置行内数学公式的开始和结束标记
	            displayMath: [['$$', '$$'], ["\\[", "\\]"]]  // 设置行间数学公式的开始和结束标记
	        },
	    }
	</script>
	```
	- markdown一些符号和mathjax冲突, 由于markdown渲染优先级更高, mathjax里面符号需要用另外的写法:
		- mathjax的公式里的竖线和markdown的table的竖线冲突, 而且table的优先级更高: 把竖线用`\vert`的方式写
		- matrix在mathjax中换行需要`\\\`  
		- mathjax里面不能直接用`#`符号, 需要用`\texttt{\#}` 
		- mathjax里面不会显示括号, 
			- `\{`, 需要改用`\lbrace` 或`\rbrace`  
			- `< >`, 需要改用`\langle`, `\rangle`
	- mathjax渲染是需要联网的
1. **配置google analysis:** 
	- 我用的模版比较老，需要[把Universal analysis换成GA4][7] 
2. **加table of content:**
	- 模版里的toc也是不能用了，加入这个比较新的[toc.html][8] 
3. **用gist加载代码块：** 
	- 还是因为有些脚本里代码块解析错误，用[GitHub gist][9]就没有这个问题, 不过这种代码块的形式obsidian没法渲染
4. **加related post:**
	- 用jekyll默认的`site.related_posts`
5. **添加[collection](https://jekyllrb.com/docs/collections/):**
	- [关于collection folder不在主文件夹的情况](https://talk.jekyllrb.com/t/jekyll-4-2-2-collections-and-folders-within-collection/7158/2) 
	- 我添加了一个`family` 的collection, 用grid 布局




[1]: https://jekyllrb.com/docs/installation/macos/
[2]:  https://medium.com/@canerten/building-ruby-3-1-3-fails-with-openssl-1-0-2o-1-on-m1-apple-silicon-mac-with-brew-89d7e550420b
[3]: https://github.com/mmistakes/so-simple-theme
[4]: https://docs.github.com/zh/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
[5]: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
[6]: https://stackoverflow.com/questions/26275645/how-to-support-latex-in-github-pages
[7]: https://blog.jakelee.co.uk/migrating-jekyll-minima-from-ua-to-ga4/
[8]: https://github.com/allejo/jekyll-toc
[9]: https://gist.github.com


