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
last_modified_at: 2023-12-23T17:24:25-08:00
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
	{% highlight ruby %}
{% raw %}
	#!/bin/bash
	
	# Required parameters:
	# @raycast.schemaVersion 1
	# @raycast.title sync_homepage
	# @raycast.mode compact
	
	# obsidian文件夹路径
	source_folder="..."
	
	# homepage项目doc/_post文件夹路径
	target_folder=".../docs/_posts"
	
	# 附件源文件夹路径
	attachment_source="..."
	
	# 附件目标文件夹路径
	attachment_target=".../docs/attachment"
	
	# 检查附件目标文件夹是否存在，如果不存在则创建
	if [ ! -d "$attachment_target" ]; then
		mkdir -p "$attachment_target"
	fi
	
	# 遍历源文件夹中的所有 .md 文件
	for file in "$source_folder"/*.md; do
		# 获取文件名（不包含路径）
		filename=$(basename "$file")
		
		# 复制 .md 文件到目标文件夹
		cp "$file" "$target_folder/$filename"
		echo "Copying $file to $target_folder/$filename"
		# 遍历文件中的每个匹配的图片链接，提取图片文件名
		grep -oE "!\[\[([^]]+)\]\]" "$target_folder/$filename" | while IFS= read -r image_link; do
	
	
			image_name=$(echo "$image_link" | sed -E 's/!\[\[([^|]+)\|[^]]+\]\]/\1/g') 
			image_width=$(echo "$image_link" | grep -o -E '\|\d+' | sed 's/|//')
	
			sed -i '' -E 's/!\[\[([^|]+)\|'${image_width}'\]\]/\!\[\1\]\({{ '\''\/docs\/attachment\/\1'\'' | relative_url }}\){:width="'${image_width}'"}/g' "$target_folder/$filename"
	
			# 复制附件文件到目标附件文件夹
			cp "$attachment_source/$image_name" "$attachment_target/"
			echo "Copying $attachment_source/$image_name to $attachment_target/"
		done
		# 替换ruby 代码块为Liquid语法
		...
	done
	{% endraw %}
{% endhighlight %}







[1]: https://jekyllrb.com/docs/installation/macos/
[2]:  https://medium.com/@canerten/building-ruby-3-1-3-fails-with-openssl-1-0-2o-1-on-m1-apple-silicon-mac-with-brew-89d7e550420b
[3]: https://github.com/mmistakes/so-simple-theme
[4]: https://docs.github.com/zh/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
[5]: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site


