---
layout: post
title: stable-diffusion中 k-sampling的不同版本 (一 )
categories:
  - deeplearning
tags:
  - content
  - pid
  - sampling
  - dpm-solver
  - uni-pc
  - lcm
  - noise
last_modified_at: 2024-07-02T16:34:34-08:00
---
## 背景知识

### [PID(Proportion/ Integration/ Differentiation) Control](https://en.wikipedia.org/wiki/Proportional–integral–derivative_controller)

$f=k_p\cdot e +k_i\cdot \int_0^t e+k_d\cdot \frac{de}{dt}$ 
- $e=r(\text{desired})-y(\text{measure})$ 是系统距离调解目标值的error
	- $k_p\cdot e$ 是比例控制项, 向desire方向进行控制
	- 积分项表示error的大方向
		- pro: 如果控制是阶梯式的, 单独使用比例项控制可能会出现稳态误差, 用积分项可以消除这个问题
		- con: 可能会增加系统的滞后性
	- 微分项监测error的变化过程
		- 如果error不断减小, 控制也随之减弱, 增强系统的稳定性(阻尼)

## Sampling

按照forward process 是SMLD计算
### DPM-Solver

用$\epsilon$ 的Taylor expansion近似

 $\begin{align} x_{i-1}&=x_i-\int_{\lambda_i}^{\lambda_{i-1}} e^{-\lambda_\tau}\epsilon(x_{\tau_\lambda},\sigma_{\tau_\lambda}) d\lambda &\\\ &\approx x_i -\int_{\lambda_i}^{\lambda_{i-1}} e^{-\lambda_\tau} \sum_{n=0}^{k-1} \frac{(\lambda-\lambda_i)^n}{n!}\epsilon^{(n)}(x_i,\sigma_i) d\lambda \\\ &= x_i -\sum_{n=0}^{k-1} \epsilon^{(n)}(x_i,\sigma_i) \int_{\lambda_i}^{\lambda_{i-1}} e^{-\lambda_\tau}  \frac{(\lambda-\lambda_i)^n}{n!} d\lambda \\\ &= x_i -e^{-\lambda_{i-1}}\sum_{n=0}^{k-1} \epsilon^{(n)}(x_i,\sigma_i) \int_{\lambda_i}^{\lambda_{i-1}} e^{-(\lambda-\lambda_{i-1})}  \frac{(\lambda-\lambda_i)^n}{n!} d\lambda \\\ &= x_i -\sigma_{i-1}\sum_{n=0}^{k-1} \epsilon^{(n)}(x_i,\sigma_i) \int_{0}^{h} e^h e^{-s}  \frac{s^n}{n!} ds & \text{(令}h=\lambda_{i-1}-\lambda_i) \\\ &= x_i -\sigma_{i-1}\sum_{n=0}^{k-1} \epsilon^{(n)}(x_i,\sigma_i) (e^h-\sum_{m=0}^{n} \frac{h^m}{m!})  & \int_{0}^{h} e^{-s} s^n ds=\gamma(n+1,s) \\\ &\approx x_i -\sigma_{i-1}((e^h-1)\cdot \epsilon +(e^h-1-h)\cdot \epsilon^{(1)}+(e^h-1-h-\frac{h^2}{2})\cdot \epsilon^{(2)}) &\text{(只取前3阶)}\end{align}$  

- $\int_0^h e^{-s}s^nds$ 可以由[integration by parts](https://en.wikipedia.org/wiki/Integration_by_parts)得到, $\gamma(n+1,s)$ 为[incomplete gamma function](https://en.wikipedia.org/wiki/Incomplete_gamma_function) 
- $\epsilon^{(1)}$ 和$\epsilon^{(2)}$ 由$\epsilon$ 在$\lambda_i\rightarrow \lambda_{i-1}$ 的二分点(dpm-solver-2)和三分点(dpm-solver-3)Taylor 展开计算得到
	- DPM-Solver-2: $x_{i-1}\approx x_i-\sigma_{i-1}(e^h-1)\cdot\epsilon(x_i,\sigma_i)-\frac{\sigma_{i-1}}{2r}(e^h-1)(\epsilon(u_i,s_i)-\epsilon(x_i,\sigma_i))$ 
		- $(u_i,s_i)$ 为二分点处的$x$ 和$\sigma$ 
		- $r$ 为分割比例, 一般可以让$r=1/2$ 
			- 此时, $x_{i-1}\approx x_i-\sigma_{i-1}(e^h-1)\cdot\epsilon(u_i,s_i)$  

### DPM-Solver++

$x_{i-1}=\frac{\sigma_{i-1}}{\sigma_i}x_i-(e^{-h}-1)((1+\frac{1}{2r})\cdot D(x_i,\sigma_i)-\frac{1}{2r}D(u_i,s_i))$  

- 中间改为直接用$D(x,\sigma)$ 表示而不是$\epsilon$ 表示
	- 和DPM-Solver的形式可以互相推导, 结果近似但不是完全等价(2S版本(Singlestep), see [DPM-Solver++ Appendix B](#ref) )
	- 取k=1, 也可以推出DDIM的形式
- 和DPM-Solver-2类似, 不过不是取二分点, 而是把$x_{i+1}$ 做为$x_{i}$ 和$x_{i-1}$ 的二分点: $D(u_i,s_i)=D(x_{i+1},\sigma_{i+1})$ (2M版本(MultiStep))
- $r=\frac{\lambda_{i+1}-\lambda_i}{\lambda_i-\lambda_{i-1}}$ 为 $\lambda_{i}\rightarrow \lambda_{i+1}\rightarrow \lambda_{i-1}$ 的比例, 因为$\lambda_{i+1}$ 在$\lambda_i,\lambda_{i-1}$ 的同侧, 和DPM-Solver-2的方向相反

### UniPC(Unified Predictor-Corrector)

- 把DPM-Solver++推广到任意高阶
- UniC是在$x_i$ 和$x_{i-1}$ 之间的n分点(像DPM-Solver一样), UniP是$x_{i+k}$ 历史数据(像DPM-Solver++一样)

### lcm(latent Cosistency Model)

- 每次直接把$D(x,\sigma)$ 做为预测, 不用reverse diffusion而是一步到位
- 模型需要重新训练微调才能支持

### 添加 noise 的不同方法

![Pasted image 20240702162954.png]({{ '/docs/attachment/Pasted image 20240702162954.png' | relative_url }}){:width="400"} 
- **noise injection**(没有后缀的情况): 先添加随机项
	- increase noise:  $\hat \sigma$  : $\hat \sigma\leftarrow \sigma_i + \gamma\sigma_i$ 
	- forward step $\sigma_{i}\rightarrow \hat \sigma$ 
		- SMLD的情况: $\hat x=x_i+\sqrt{\hat \sigma^2-\sigma_i^2}\cdot z, z\sim N(0,1)$  
	- backward step $\sigma_{i-1}\leftarrow \hat \sigma$ 
- **ancestral step**(`_A, _ancestral`): 后添加随机项
	- backward step $\sigma_{down}\leftarrow \sigma_i$ 
	- add noise $\sigma_{up}$ 
- **sde**(`_sde`): 后添加随机项, 严格按照SDE的公式
	- 用`BrownianTreeNoiseSampler` 生成noise $z$ 
	- 随机项为$\sigma_i\sqrt{1-e^{-2h}}\cdot z$ (按照DPM-Solver++的推导)

### 其他

- cfg++ ?




## reference
<span id="ref"></span>

[1 ] Karras, Tero, Miika Aittala, Timo Aila, and Samuli Laine. “Elucidating the Design Space of Diffusion-Based Generative Models.” arXiv, October 11, 2022. [https://doi.org/10.48550/arXiv.2206.00364](https://doi.org/10.48550/arXiv.2206.00364).   **Euler, Heun method** 

[2] Lu, Cheng, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. “**DPM-Solver**: A Fast ODE Solver for Diffusion Probabilistic Model Sampling in Around 10 Steps.” arXiv, October 13, 2022. [https://doi.org/10.48550/arXiv.2206.00927](https://doi.org/10.48550/arXiv.2206.00927).

[3] Lu, Cheng, Yuhao Zhou, Fan Bao, Jianfei Chen, Chongxuan Li, and Jun Zhu. “**DPM-Solver++**: Fast Solver for Guided Sampling of Diffusion Probabilistic Models.” arXiv, May 6, 2023. [https://doi.org/10.48550/arXiv.2211.01095](https://doi.org/10.48550/arXiv.2211.01095).

[4] Zhao, Wenliang, Lujia Bai, Yongming Rao, Jie Zhou, and Jiwen Lu. “**UniPC**: A Unified Predictor-Corrector Framework for Fast Sampling of Diffusion Models,” 2023. [https://openreview.net/forum?id=hrkmlPhp1u&referrer=%5Bthe%20profile%20of%20Jie%20Zhou%5D(%2Fprofile%3Fid%3D~Jie_Zhou3)](https://openreview.net/forum?id=hrkmlPhp1u&referrer=%5Bthe%20profile%20of%20Jie%20Zhou%5D(%2Fprofile%3Fid%3D~Jie_Zhou3)).

[4] Zhang, Qinsheng, and Yongxin Chen. “Fast Sampling of Diffusion Models with Exponential Integrator.” arXiv, February 25, 2023. [https://doi.org/10.48550/arXiv.2204.13902](https://doi.org/10.48550/arXiv.2204.13902). **DEIS, ipndm**

[5] Luo, Simian, Yiqin Tan, Longbo Huang, Jian Li, and Hang Zhao. “**Latent Consistency Models**: Synthesizing High-Resolution Images with Few-Step Inference.” arXiv, October 6, 2023. [https://doi.org/10.48550/arXiv.2310.04378](https://doi.org/10.48550/arXiv.2310.04378). **LCM**

[5] 代码: [https://github.com/zju-pi/diff-sampler ](https://github.com/zju-pi/diff-sampler)  一些sampler

[6] 代码:  [https://github.com/comfyanonymous/ComfyUI/blob/master/comfy/k_diffusion/sampling.py](https://github.com/comfyanonymous/ComfyUI/blob/master/comfy/k_diffusion/sampling.py)  [https://github.com/comfyanonymous/ComfyUI/blob/master/comfy/samplers.py](https://github.com/comfyanonymous/ComfyUI/blob/master/comfy/samplers.py) 