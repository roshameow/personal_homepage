---
layout: post
title: 传感器颜色调制 (三) -- 数据
categories:
  - data
tags:
  - content
  - dataset
  - pytorch
  - script
last_modified_at: 2025-09-11T15:52
created: 2024-01-15T19:01
---
各种颜色调制的数据对难以采集, 所以现在大部分颜色调制还是用多光谱数据仿真得到.
## 多光谱数据集

| 数据集$\downarrow$                                                                                                                                         | size                 | bands                                | 格式                   | 数量                                | 拍摄场景                        | 发布时间 | 大小             | 条件                                              | 拍摄条件                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------ | -------------------- | --------------------------------- | --------------------------- | ---- | -------------- | ----------------------------------------------- | ------------------------------------------------------------ |
| [CAVE](https://www1.cs.columbia.edu/CAVE/databases/multispectral/)                                                                                      | 512x512              | 400-700nm<br>10nm steps<br>31bands   | .png<br>每个通道<br>分别存  | 32                                | 实验室:<br>真假人脸<br>真假水果        | 2008 | 419.9MB        |                                                 |                                                              |
| [CAVE1024](https://cave.cs.columbia.edu/projects/categories/project?cid=Computational+Imaging&pid=Multispectral+Imaging+Using+Multiplexed+Illumination) | 1024x1024            |                                      |                      | 205                               |                             |      | 13.06GB        |                                                 |                                                              |
| [KAIST](http://vclab.kaist.ac.kr/siggraphasia2017p1/kaistdataset.html)                                                                                  | 2704x3376            | 420-720nm<br>10nm steps<br>31bands   | .exr<br>每个图片<br>单独下载 | 30                                | 实验室                         | 2017 | 8.67GB         |                                                 |                                                              |
| [TSA](https://github.com/mengziyi64/TSA-Net)                                                                                                            | 660x660              | 28通道<br>特殊                           | .mat                 | 10(simu)<br>5(real)               | 实验室                         | 2020 |                | simu是从<br>KAIST的数据<br>中截取的                      |                                                              |
| [harvard](https://vision.seas.harvard.edu/hyperspec/download.html)                                                                                      | 1040x1392            | 420-720nm<br>10nm steps<br>31bands   | .mat                 | 50(自然光)<br>27(人工光)                | 场景丰富                        | 2011 | 约7GB           | research-only                                   | 商业相机:<br>Nuance FX, CRI Inc<br>liquid crystal tunable filter |
| [ARAD 1K](https://github.com/boazarad/ARAD_1K)                                                                                                          | 512x482              | 400-700nm<br>10nm steps<br>31bands   | .mat-v7.3            | 900(train)<br>50(val)<br>50(test) | 场景丰富                        | 2022 | 约21GB<br>压缩包   | 需要注册                                            |                                                              |
| TokyoTech<br>[31-band](http://www.ok.sc.e.titech.ac.jp/res/MSI/MSIdata31.html)                                                                          | 不固定<br>500~2k<br>左右  | 420-720nm<br>10nm steps<br>31bands   | .mat                 | 30                                | 色卡(齐全)<br>布料,<br>蝴蝶<br>局部特写 | 2015 | 2.97GB         | research-only<br>redistribute-<br>prevent       |                                                              |
| TokyoTech<br>[59-band](http://www.ok.sc.e.titech.ac.jp/res/MSI/MSIdata59.html)                                                                          | 512x512              | 420-1000nm<br>10nm steps<br>59bands  | .mat-v7.3            | 16                                | 类似<br>                      | 2019 | 1.7GB          | research-only<br>redistribute-<br>prevent       |                                                              |
| [CMP_UEA](http://www2.cmp.uea.ac.uk/Research/compvis/MultiSpectralDB.htm)                                                                               | 不固定<br>200~400<br>左右 | 400-700nm<br>10nm steps<br>31bands   | .mat<br>每个图片<br>单独下载 | 23                                | 色卡,<br>广告包装                 | 2004 | 566.6MB        |                                                 |                                                              |
| [KAUST](https://repository.kaust.edu.sa/items/891485b4-11d2-4dfc-a4a6-69a4912c05f1)                                                                     | 512x512              | 400-730nm<br>10nm steps  <br>34bands | .h5                  | 409                               | 实验室<br>户外<br>场景里有<br>白色反光板  | 2021 | 11.49GB<br>压缩包 | BY-NC 3.0:<br>attribution<br>non-<br>commercial | Specim IQ多光谱相机                                               |

## 格式读取和注意事项

1. **从网页抓数据**
	- 因为数据是分散在网页上的, 需要用python从网页上抓.exr图片
		- 问题: 用`requests.get(absolute_url).content` , 这么下载下来的文件可能会有不全
			- 我批量下载kaist数据时, 就有一张图片错误, 还好.exr可以预览, 发现不正常的图片再单独下载下来就好
			- 在批量下载CMP_UEA网页上的.mat文件时, 也出错了, 但是.mat文件没法预览, 等到读数据才发现
3. **读.exr数据**
	- 网上的[读exr的python包][1]都有些问题, 而尴尬的是OpenEXR的官方放出了要做官方python binding的消息, 截止目前还没发布. 需要我们自己按如下流程操作: 写调用OpenEXR的C++代码->用pybind11编成.so库->在python里面调用
		- 参考[OpenEXR的API文档](https://openexr.com/en/latest/API.html#the-openexr-api) : 一定要把所有channel都在datawindow 里面排好一次性读
4. **读.mat数据**
	-  .mat数据有两种: 老版的.mat和新的v7.3格式的.mat, 不实际读的话, 没法知道究竟是哪种. 我还没找到可以先提取.mat的metadata的方法
	- 老版的.mat可以用`scipy.io.loadmat` 读
	- v7.3其实就是H5DF格式, 和.h5文件一样, 可以用`h5py` 读. 看到一些地方是建议用 [hdf5storage](https://pypi.python.org/pypi/hdf5storage) 这个包(不光可以读, 还可以存成v7.3格式).
	- .mat数据好像没法看数据类型..
1. **怎么正确的在pytorch里加载**
	- 目前是存在dataset的一个list里面
		- 一定不能把所有image存在一个大的`ndarray`里面, 我们的数据都比较大, 很有可能会内存不够
		- 存在list里面是不受内存的限制吗?在训练过程中可以及时的动态加载吗? 还没有研究
		- 我们的图片大, 而训练需要的crop_size比较小, 一个想法是先把图片切分成多个小的patch, 这样是否就不用加载一整张图片了?
	- 在第一次读数据时存成.h5文件的cache, 之后从.h5文件读取
		- 因为数据集中的波长和我们要的channel可能不一样, 我们的channel是用`interp1d` 插值得到的, 这个插值的过程比较浪费时间, 所以至少需要把插值后的结果存下来
		- .h5文件读出来是`ndarray` 格式, 要转成tensor使用, 不过这个过程是很快的
		- **为什么不存成.pkl** 
			- .pkl读起来比.h5慢, 在我的mac M1上速度慢了一倍.  .pkl 倒是可以直接存tensor的, 而且存数据更快. 
			- [.pkl](https://docs.python.org/3/library/pickle.html)可以做的操作比较多, 如果在网上把.pkl发给别人, 对方可能不敢打开.. 所以一般不会用.pkl分发大文件
			- .pkl适合自己开发时存一些中间结果
		- 为什么不是一张图片一个文件而是把全部list存在一起? 没有测试, 可能速度是差不多的吧?

## 其他有用的资源

- [BiSCI的repo](https://github.com/caiyuanhao1998/BiSCI) 里提供了CAVE512, CAVE1024, KAIST, TSA的下载链接, 是已经转成28通道的, .mat格式
	- 其中kaist的数据load超慢.. 可能是因为把原本的16bit的half长度存成了64bit的complex?
	- 我想kaist里面存half格式的exr可能也是出于缩小空间的考虑.. OpenEXR本身读起来挺快的
- [color-science](https://github.com/colour-science/colour) : 里面包含各种光学方面的标准, 对各种色彩空间转换, 可视化很有用

## 代码

- exr: [**readexr.cpp**](https://gist.github.com/roshameow/c2710dedf5ab067517d622b2a7ed4679#file-readexr-cpp)
- 网页抓图片: [**download_kaist.py**](https://gist.github.com/roshameow/30aae94815c6b8ddb2253191d4f86649#file-download_kaist-py) 
- 读数据集: [**multisepc_load.py**](https://gist.github.com/roshameow/30aae94815c6b8ddb2253191d4f86649#file-multisepc_load-py)
- 多光谱图片转成RGB显示: [**multispec2rgb.py**](https://gist.github.com/roshameow/30aae94815c6b8ddb2253191d4f86649#file-multispec2rgb-py) 
	- 用TSA的图片测试, 转出的RGB有偏色, 可能是因为只对应了channel的主波长的XYZ, 没有在光谱上积分吗?





[1]: https://github.com/jamesbowman/openexrpython.git