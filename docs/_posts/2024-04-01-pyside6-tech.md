---
layout: post
title: pyside6一些功能的用法
categories:
  - tool
tags:
  - content
  - pyside6
  - gui
  - python
last_modified_at: 2024-04-07T12:09:32-08:00
---
pyside是qt的python封装, API的调用方法基本差不多. 用pyside从零开始写一个gui用于标注或测试(调参数或者看中间结果), 每次花费时间都比想象的要少的多. 功能方便而且代码的可读性非常好.

## 工具

- designer和vscode
	- desginer主要用到promote, 加载资源, 配置qss的功能
- vscode的PYQT Integration, 配置好uic, rcc路径后, 可以右键编译

## 事例
### 视频播放

用QTimer和opencv实现

![Screen Recording 2024-04-07 at 09.30.20.mp4]({{ '/docs/attachment/Screen Recording 2024-04-07 at 09.30.20.mp4' | relative_url }}){:width="200"} 

1. 把label提升到自定义可以drop file的LabelImage
2. 用timer设置play, pause功能, 进度条拖动功能

 - 代码: [**main.py**](https://gist.github.com/roshameow/c1c27989df0ac90a89ee9d99b87d6d59#file-main-py) , [**Ui_LabelImage.py**](https://gist.github.com/roshameow/c1c27989df0ac90a89ee9d99b87d6d59#file-ui_labelimage-py) 

### 动态折线图

用QtCharts实现

![Screen Recording 2024-04-07 at 09.46.44.mp4]({{ '/docs/attachment/Screen Recording 2024-04-07 at 09.46.44.mp4' | relative_url }}){:width="800"}

1. 界面画出QWidget并提升到自定义的LineChart, 继承QChartView
2. 定义chart和series
3. 修改QChartView的样式: 在designer里用qss实现
4. 修改QChart的样式:
	- [QChart调整和QChartView之间的Margin](https://stackoverflow.com/questions/39146502/how-to-remove-margin-from-qchartview-or-qchart) 
	- [QChart调整axis和边界之间的Margin](https://stackoverflow.com/questions/51398463/qt-chart-remove-space-for-title-legend) 
	- [QChart设置样式](https://doc.qt.io/qt-6/qtcharts-customchart-example.html) 
5. 添加series update代码

- 代码: [**update_frame.py**](https://gist.github.com/roshameow/d1e0892205fa832aeb930a75130864e7#file-update_frame-py) , [**line_chart.py**](https://gist.github.com/roshameow/d1e0892205fa832aeb930a75130864e7#file-line_chart-py) 

### 图像标记

<iframe src="//player.bilibili.com/player.html?aid=1452824219&bvid=BV1bq421F7sF&cid=1496585736&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>






1. 选择文件: 在QTreeView上设置model为QFileSystemModel
2. 互动标记图片
	- 用paintEvent和QPainter实现标记
3. 切换label
	- 用QFile替换svg的颜色
4. 显示位置数据: 在QTableView上设置model为自定义的PandasModel
	- 给tableView设置Delegate更改颜色和行为

- 代码: [**main.py**](https://gist.github.com/roshameow/7d45d536dd4ab8ff6ff618b7911b5890#file-main-py) , [tableView添加互动: **mask_model.py**](https://gist.github.com/roshameow/7d45d536dd4ab8ff6ff618b7911b5890#file-mask_model-py) , [更改svg颜色: **pyside_util.py**](https://gist.github.com/roshameow/7d45d536dd4ab8ff6ff618b7911b5890#file-pyside_util-py) , [图片添加互动: **Ui_LabelImage.py**](https://gist.github.com/roshameow/7d45d536dd4ab8ff6ff618b7911b5890#file-ui_labelimage-py) 

## 资源

讲的很好的入门视频: 

<iframe src="//player.bilibili.com/player.html?aid=610679490&bvid=BV1c84y1N7iL&cid=1098863799&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>


其他:
