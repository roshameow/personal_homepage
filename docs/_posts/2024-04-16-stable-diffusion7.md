---
layout: post
title: stable-diffusion中 k-sampling的不同版本
categories:
  - algorithm
tags:
  - content
last_modified_at: 2024-06-03T14:11:57-08:00
---
## Diffusion Process & Reverse Diffusion Process

- 用Markov chain的表示:
	-   $$q(x_t|x_0)=N(x_t;\alpha_t x_0,\sigma^2 I)$$ 

diffusion收敛到SDE, SDE离散化得到diffusion
把DPM表示成
[SDE(stochastic differential equation)](https://en.wikipedia.org/wiki/Stochastic_differential_equation): 
- SDE的一般形式: $dx=f(x,t)dt+g(t)dw$ 
	- $f(\cdot,t)$ 是drift coefficients 表示确定的部分  
	- $g(\cdot)$ 是diffusion coefficients 表示随机部分参数
	- $\omega$ 是[Wiener process(布朗运动)](https://en.wikipedia.org/wiki/Wiener_process) , $dw=\sqrt{t}z$ 
- SDE的reverse: $dx=(f(x,t)-\frac{1}{2}g^2(t)\nabla_x\log p(x,t))dt+g(t)dw$ 
	- score function $\nabla_x\log p(x,t)$   指向higher density of data
	- $\nabla_x\log p(x;\sigma)=(D(x;\sigma)-x)/{\sigma}^2$  
	- 前半确定部分: Probability flow ODE: $dx=(f(x,t)-\frac{1}{2}g^2(t)\nabla_x\log p(x,t))dt$ 
- Variance Preserving (VP) SDE, DDPM: $dx=-\frac{1}{2}\beta_t x dt +\sqrt{\beta_t} dw$ 
	- $f(x,t)=f(t)x=\frac{1}{\bar \alpha_t}\frac{d\bar \alpha_t}{dt}$ 
- 


|                  | stochastic process                                                                                                                                                                                                                                                                                                                                              | SDE                                                                                                                                                                                                                                           | ODE                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| forward process  | $p(x_t\|x_0)=\mathcal N(x_t;\alpha_t x_0,\sigma_t^2 I)$ <br>即, $x_t=\alpha_t x_0+\sigma_t z_t$ <br><br>$p(x_i\|x_0)=\mathcal N(x_i;\alpha_i x_0,\sigma_i^2 I)$ <br>即, $x_i=\alpha_i x_0+\sigma_i z_i$  <br><br>$q(x_i\|x_{i-1})=N(x_t;\sqrt{1-\beta_i}x_{i-1},\beta_iI)$<br>即, $x_i=\sqrt{1-\beta_i}x_{i-1}+\sqrt{\beta_i}z_i$ <br><br><br><br>$z_i\sim N(0,1)$ | $dx=f(t)xdt+g(t)dw$ <br>其中, $f(t)=d\log\alpha_t/dt$ , $g(t)= \sqrt{2\alpha_t\sigma_t\frac{d}{dt}(\frac{\sigma_t}{\alpha_t})}$ <br>$dx=\frac{d\log\alpha_t}{dt}xdt+ \sqrt{2\alpha_t\sigma_t\frac{d}{dt}(\frac{\sigma_t}{\alpha_t})} dw$   <br> |                                                                       |
| backward process |                                                                                                                                                                                                                                                                                                                                                                 | $dx=(f(t)\cdot x-\frac{1}{2}g^2(t)\nabla_x\log p(x,t))dt+g(t)dw$<br><br>$g(t)^2=2\alpha_t\sigma_t\frac{d}{dt}(\frac{\sigma_t}{\alpha_t})$                                                                                                     | $dx=(f(t)\cdot x-\frac{1}{2}g^2(t)\nabla_x\log p(x,t))dt$<br>即, $dx=$ |

### Diffusion Process 

1. DDPM(see [3] Appendix B.)
	-  $x_i=\sqrt{1-\beta_i}x_{i-1}+\sqrt{\beta_i}z_i$  $\implies$   $x_i-x_{i-1}=(\sqrt{1-\beta_i}-1)x_{i-1}+\sqrt{\beta_i}z_i$ 
		- LHS: $x_i-x_{i-1}\rightarrow dx$ 
		- RHS: $\sqrt{1-\beta_i}x_{i-1}+\sqrt{\beta_i}z_i\rightarrow (\frac{\sqrt{1-\beta(t)dt}\ -1}{dt})xdt+\sqrt{\beta(t)dt}\frac{dw}{\sqrt{dt}}\rightarrow -\frac{1}{2}\beta(t)xdt+\sqrt{\beta(t)}dw$   
			- 其中, $z_i\rightarrow \frac{dw}{\sqrt{dt}}$ , $\beta_i\rightarrow \beta(t)dt$ 
			- $lim_{dt\rightarrow 0} \frac{\sqrt{1-\beta(t)dt}-1}{dt}=-\frac{1}{2}\beta(t)$ 
2. DDPM to stochastic Process
	- $x_i=\sqrt{1-\beta_i}x_{i-1}+\sqrt{\beta_i}z_i=\sqrt{1-\beta_i}(\sqrt{1-\beta_{i-1}}x_{i-2}+\sqrt{\beta_{i-1}}z_{i-1})+\sqrt{\beta_i}z_i=\dots$  
		- $\alpha_i=\prod_{\tau=1}^i \sqrt{1-\beta_\tau}$ , 即 $\log \alpha_i=\sum_{\tau=1}^i \log\sqrt{1-\beta_\tau}$ 
		- $\sigma_t=\sqrt{1-\prod_{\tau=1}^i (1-\beta_\tau)}$ 
	- 得到DDPM对应的假设, $\alpha_i^2+\sigma_i^2=1$ 
3. Markov chain to SDE:
	- $x_i=\frac{\alpha_i}{\alpha_{i-1}}x_{i-1}+\sqrt{\sigma_i^2-\frac{\alpha_i^2}{\alpha_{i-1}^2}\cdot \sigma_{i-1}^2}\cdot z_{i-1}$ $\implies$ $x_i-x_{i-1}=(\frac{\alpha_i}{\alpha_{i-1}}-1)x_{i-1}+\sqrt{\sigma_i^2-\frac{\alpha_i^2}{\alpha_{i-1}^2}\cdot \sigma_{i-1}^2}\cdot z_{i-1}$ 
		- LHS: $x_i-x_{i-1}\rightarrow dx$ 
		- RHS: $(\frac{\alpha_i}{\alpha_{i-1}}-1)x_{i-1}+(\sigma_i^2-\frac{\alpha_i^2}{\alpha_{i-1}^2}\cdot \sigma_{i-1}^2)\cdot z_{i-1} \rightarrow (\frac{1}{\alpha}\frac{\alpha_i-\alpha_{i-1}}{dt})xdt +\sqrt{\frac{\sigma_i^2-\frac{\alpha_i^2}{\alpha_{i-1}^2}\cdot \sigma_{i-1}^2}{dt}}\cdot dw\rightarrow  (\frac{1}{\alpha_t}\frac{d\alpha_t}{dt})xdt +\sqrt{\alpha_t^2\frac{d}{dt}(\frac{\sigma_t}{\alpha_t})^2}\cdot dw\rightarrow  \frac{d\log \alpha_t}{dt}xdt +\sqrt{2\alpha_t\sigma_t\frac{d}{dt}(\frac{\sigma_t}{\alpha_t})}\cdot dw$ 
4. stochastic Process to Markov Chain:
	- $x_i=\alpha_i x_0+\sigma_i z_i$ , $x_{i-1}=\alpha_{i-1}x_0+\sigma_{i-1}z_{i-1}$ 
	- 解出$x_{i-1}\rightarrow x_{i}$ 的变换
5. stochastic Process to continuous
	- $\{1,2,\dots,N, \dots\} \rightarrow [0,1]$ , 采样间隔为$\frac{1}{N}$  
- stochastic Process to SDE. 
	- 利用 $x_t\rightarrow x_{t+\Delta t}$ 的积分: 
		- $x_{t+\Delta t}=\alpha_{t+\Delta t}x_0+\sigma_{t+\Delta t} z_{t+\Delta_t}$ 
		- $x_t\rightarrow x_{t+\Delta t}$: $x_{t+\Delta t}=x_t+f(t)x_t\Delta t + g(t) \sqrt{\Delta t}\cdot z=(1+f(t)\Delta t)(\alpha_t x_0+\sigma_t z_t)+g(t) \sqrt{\Delta t}\cdot z_{\Delta t}=(1+f(t)\Delta t)\alpha_t x_0+\sqrt{(1+f(t)\Delta t)^2\sigma_t^2+g(t)^2\Delta t}\cdot z$     
	- $\alpha_{t+\Delta t}=(1+f(t)\Delta t)\alpha_t$  $\implies$ $f(t)=\lim_{\Delta t\rightarrow 0} \frac{\frac{\alpha_{t+\Delta t}}{\alpha_t}-1}{\Delta t}=\frac{1}{\alpha_t}\lim_{\Delta t\rightarrow 0} \frac{\alpha_{t+\Delta t}-\alpha_t}{\Delta t}=\frac{1}{\alpha_t}\frac{d\alpha_t}{dt}=\frac{d\log \alpha_t}{dt}$ 
	- $\sigma_{t+\Delta t}=\sqrt{(1+f(t)\Delta t)^2\sigma_t^2+g(t)^2\Delta t}$ $\implies$ $g(t)=\lim_{\Delta t\rightarrow 0} \sqrt{\frac{\sigma_{t+\Delta t}^2-(\frac{\alpha_{t+\Delta t}}{\alpha_t})^2\sigma_t^2}{\Delta t}}=\sqrt{2\alpha_t\sigma_t\frac{d}{dt}(\frac{\sigma_t}{\alpha_t})}$  
- SDE 和Probability flow ODE: (see [3] Appendix D.)
	- SDE和Probability flow ODE有相同的marginal probability density $p_t(x)$ 


diffusion ODE: $\frac{dx_t}{dt}=f(t)x_t+\frac{g^2(t)}{2\sigma_t}\epsilon_\theta(x_t,t), x_t\sim N(0,)$ 



Ancestral: 带 a的ksampler, 添加noise





## reference

[1 ] Karras, Tero, Miika Aittala, Timo Aila, and Samuli Laine. “Elucidating the Design Space of Diffusion-Based Generative Models.” arXiv, October 11, 2022. [https://doi.org/10.48550/arXiv.2206.00364](https://doi.org/10.48550/arXiv.2206.00364).   **Euler, Heun method** 

[2] Lu, Cheng, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. “**DPM-Solver**: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps.” arXiv, October 13, 2022. [https://doi.org/10.48550/arXiv.2206.00927](https://doi.org/10.48550/arXiv.2206.00927).

[3] Song, Yang, Jascha Sohl-Dickstein, Diederik P. Kingma, Abhishek Kumar, Stefano Ermon, and Ben Poole. “Score-Based Generative Modeling through Stochastic Differential Equations.” arXiv, February 10, 2021. [https://doi.org/10.48550/arXiv.2011.13456](https://doi.org/10.48550/arXiv.2011.13456).  **DDPM** 

苏剑林. (Aug. 03, 2022). 《生成扩散模型漫谈（五）：一般框架之SDE篇 》[Blog post]. Retrieved from [https://spaces.ac.cn/archives/9209](https://spaces.ac.cn/archives/9209)