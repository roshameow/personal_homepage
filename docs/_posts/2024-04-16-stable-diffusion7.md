---
layout: post
title: stable-diffusion中k-sampling的不同版本
categories:
  - algorithm
tags:
  - content
last_modified_at: 2024-05-20T14:28:12-08:00
---
## Diffusion Process & Reverse Diffusion Process

- 用Markov chain的表示:
	-  $q(x_t|x_{t-1})=N(x_t;\sqrt{1-\beta_t}x_{t-1},\beta_tI)$ ,  $q(x_t|x_0)=N(x_t;\sqrt{\bar\alpha_t}x_0,(1-\bar\alpha_t)I)$ 

diffusion收敛到SDE, SDE离散化得到diffusion
把DPM表示成
[SDE(stochastic differential equation)](https://en.wikipedia.org/wiki/Stochastic_differential_equation): 
- SDE的一般形式: $dx=f(x,t)dt+g(t)dw$ 
	- $f(\cdot,t)$ 是drift coefficients 表示确定的部分  
	- $g(\cdot)$ 是diffusion coefficients 表示随机部分
	- $\omega$ 是Wiener process(布朗运动)
- SDE的reverse: $dx=(f(x,t)-g^2(t)\nabla_x\log p(x,t))dt+g(t)dw$ 
	- score function $\nabla_x\log p(x,t)$   指向higher density of data
	- $\nabla_x\log p(x;\sigma)=(D(x;\sigma)-x)/{\sigma^2}$ 
	- 前半确定部分: Probability flow ODE: $dx=(f(x,t)-g^2(t)\nabla_x\log p(x,t))dt$ 
- Variance Preserving (VP) SDE, DDPM: $dx=-\frac{1}{2}\beta_t x dt +\sqrt{\beta_t} dw$ 
	- $f(x,t)=f(t)x=\frac{1}{\bar \alpha_t}\frac{d\bar \alpha_t}{dt}$ 
- 


diffusion ODE: $\frac{dx_t}{dt}=f(t)x_t+\frac{g^2(t)}{2\sigma_t}\epsilon_\theta(x_t,t), x_t\sim N(0,)$ 

diffusion ODE的1,2,3阶solver

Ancestral: 带 a的ksampler, 添加noise


|                                                        | 步骤                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |                                                                                                                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Euler                                                  | noise injection:<br>- increased noise $\hat \sigma$  : $\hat \sigma\leftarrow \sigma_i + \gamma\sigma_i$ <br>-  sample x with increased noise: $\hat x \leftarrow x_i + \sqrt{\hat \sigma^2-\sigma_i^2}\cdot\epsilon$ <br>Take Euler Step: <br>- $dt=\sigma_{i+1}-\hat \sigma$<br>- $denoised=model(\hat x,\hat \sigma)$ <br>- numerical derivative: $d=(\hat x-denoised)/{\hat \sigma}$ <br>- Euler step: $x_{i+1}=\hat x+dt \cdot d$                                   |                                                                                                                                                                     |
| Euler Ancestral                                        | Take Euler Step to $\sigma_{down}$:  <br>- $dt=\sigma_{down}-\sigma_i$ <br>- $denoised=model(x,\sigma_i)$ <br>- numerical derivative: $d=(x-denoised)/{\sigma_i}$ <br>- Euler step: $x_{down}=x+dt \cdot d$ <br>Add ancestral noise:<br>- $x_{i+1}=x_{down}+noise*\sigma_{up}$ <br>                                                                                                                                                                                      | <br>$\sigma_{up}=\min(\sigma_{i+1},\eta\cdot(\frac{\sigma_{i+1}^2}{\sigma_i^2}(\sigma_i^2-\sigma_{i+1}^2)))$<br>$\sigma_{down}=\sqrt{\sigma_{i+1}^2-\sigma_{up}^2}$ |
| DDPM                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                                                                                                     |
| DDIM                                                   |                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                                                                                                     |
| DPM-Solver                                             |                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                                                                                                     |
| dpm_2                                                  | noise injection: <br>得到$\hat\sigma, \hat x, denoised$ <br>DPM-Solver-2: <br>- 在$\sigma_{i+1},\hat \sigma$ 之间取: $\sigma_{mid}=e^{\frac{\log \hat\sigma+\log \sigma_{i+1}}{2}}$ <br>- $dt_1=\sigma_{mid}-\hat \sigma$ <br>- $dt_2=\sigma_{i+1}-\hat \sigma$ <br>- $x_{mid}=\hat x+dt_1\cdot(\hat x-model(\hat x,\hat \sigma))/\hat \sigma$  <br>用$\sigma_{mid}$ 处的numerial derivative<br>- $x=\hat x+dt_2\cdot(x_{mid}-model(x_{mid},\sigma_{mid}))/\sigma_{mid}$ <br><br> |                                                                                                                                                                     |
| dpmpp_2m                                               | - $t=-\log(\sigma_i)$ , $t_{next}=-\log(\sigma_{i+1})$ , $t_{last}=-\log(\sigma_{i-1})$ <br>- $h=t_{next}-t$, $h_{last}=t-t_{last}$ <br>- $r=h_{last}/h$ <br>- $denoised_d=(1+\frac{1}{2r})\cdot denoised-\frac{1}{2r}\cdot denoised_{old}$  <br>- $x_{i+1}=\frac{\sigma_{i+1}}{\sigma_i}\cdot x_i-(e^{-h}-1)\cdot denoised_d$ <br>                                                                                                                                      |                                                                                                                                                                     |
| lcm                                                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                                                                                                     |
| [heun](https://en.wikipedia.org/wiki/Heun%27s_method)  | noise injection:  <br>得到$\hat\sigma, \hat x, denoised$ <br>Take Euler step:<br>- $x_2=\hat x + dt\cdot d$<br>Take Heun step:<br>- $d_2=(x_2-model(x_2,\sigma_{i+1}))/\sigma_{i+1}$ <br>- $d^\prime=\frac{d+d_2}{2}$ <br>- $x_{i+1}=\hat x+d^\prime\cdot dt$                                                                                                                                                                                                              |                                                                                                                                                                     |

Euler: 



## reference

[1 ] Karras, Tero, Miika Aittala, Timo Aila, and Samuli Laine. “Elucidating the Design Space of Diffusion-Based Generative Models.” arXiv, October 11, 2022. [https://doi.org/10.48550/arXiv.2206.00364](https://doi.org/10.48550/arXiv.2206.00364).

[2] Lu, Cheng, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. “DPM-Solver: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps.” arXiv, October 13, 2022. [https://doi.org/10.48550/arXiv.2206.00927](https://doi.org/10.48550/arXiv.2206.00927).