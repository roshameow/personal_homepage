---
layout: post
title: 3d模型资源, 数据库
categories:
  - data
tags:
  - content
last_modified_at: 2025-01-06T06:50
created: 2024-12-22T16:48
---
## 3d模型文件格式


| 格式                                                                                                                                                           | 格式                                                                                                                         | 特点           | 常用用途      | 开发商      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------ | --------- | -------- |
| [.obj](https://en.wikipedia.org/wiki/Wavefront_.obj_file)                                                                                                    | vertex(v): 由3d coordinate表示<br>texture(vt): 2d coordinate<br>normal(vn): 3d vector<br>face(f): vertex索引/texture索引/normal索引 |              |           |          |
| .stl                                                                                                                                                         |                                                                                                                            |              | 3d打印      |          |
| Polygon File Format<br>[.ply](https://en.wikipedia.org/wiki/PLY_(file_format))                                                                               | 1. header 数据结构<br>element 对象(vertex) 数量(14)<br>property 类型(float) 名称(x/y/z...)<br>2. 具体数据<br>两部分构成                         | 支持颜色、法线和其他属性 | 点云数据      |          |
| .fbx                                                                                                                                                         |                                                                                                                            |              |           | Autodesk |
| Graphics Language Transmission Format<br>[.gltf](https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/figures/gltfOverview-2.0.0b.png), .glb<br> |                                                                                                                            | 现代, 省空间      |           |          |
| .3ds                                                                                                                                                         |                                                                                                                            | 过时           | 模型存储      | Autodesk |
| .las                                                                                                                                                         |                                                                                                                            |              | 地理信息(GIS) |          |

## 模型

|                                                               |                                                             |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| [sketchfab](https://sketchfab.com/feed)                       |                                                             |
| [cg模型网](https://www.cgmodel.com)                              | 国风模型                                                        |
| [cubebrush](https://cubebrush.co)                             |                                                             |
| [free3d](https://free3d.com)                                  |                                                             |
| [blender官网demo](https://www.blender.org/download/demo-files/) |                                                             |
| [blendermarket](https://blendermarket.com)                    | .blend格式, 免费比较少                                             |
| [Daz](https://www.daz3d.com)                                  | 写实风格, 素体<br>[Render-State](https://render-state.to) : daz链接 |
|                                                               |                                                             |



