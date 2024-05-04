---
layout: post
title: stable-diffusion中k-sampling的不同版本
categories:
  - algorithm
tags:
  - content
last_modified_at: 2024-04-29T15:35:24-08:00
---
把DPM表示成SDE(stochastic differential equation): $dx=f(x,t)dt+g(t)dw$ 
score function

Ancestral: 带 a的ksampler, 添加noise


|                 | 步骤                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Euler           | noise injection:<br>- increased noise $\hat \sigma$  : $\hat \sigma\leftarrow \sigma_i + \gamma\sigma_i$ <br>-  sample x with increased noise: $\hat x \leftarrow x_i + \sqrt{\hat \sigma^2-\sigma_i^2}\cdot\epsilon$ <br>Take Euler Step: <br>- $dt=\sigma_{i+1}-\hat \sigma$<br>- $denoised=model(\hat x,\hat \sigma)$ <br>- numerical derivative: $d=(x-denoised)/{\hat \sigma}$ <br>- Euler step: $x_{i+1}=\hat x+dt \cdot d$ |
| Euler Ancestral |                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| DDPM            |                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| DDIM            |                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| DPM-Solver      |                                                                                                                                                                                                                                                                                                                                                                                                                                   |

Euler: 



## reference

[1 ] Karras, Tero, Miika Aittala, Timo Aila, and Samuli Laine. “Elucidating the Design Space of Diffusion-Based Generative Models.” arXiv, October 11, 2022. [https://doi.org/10.48550/arXiv.2206.00364](https://doi.org/10.48550/arXiv.2206.00364).

[2] Lu, Cheng, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. “DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps.” arXiv, October 13, 2022. [https://doi.org/10.48550/arXiv.2206.00927](https://doi.org/10.48550/arXiv.2206.00927).