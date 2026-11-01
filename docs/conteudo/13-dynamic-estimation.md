# Dynamic power system state estimation

### Lesson 13 · State-space models, Kalman filtering, and temporal information

Based on the separate lecture by **Dr. Julio A. D. Massignan** and **Prof. João Bosco A. London Junior** · EESC–USP · 3 December 2024.

---

## Learning objectives

1. Introduce temporal information into real-time monitoring.
2. Derive and interpret the linear Kalman filter.
3. Analyze steady-state and abrupt-load-change examples.
4. Distinguish tracking, forecasting-aided, and dynamic estimation.
5. Identify modeling, sampling, and implementation requirements.

---

## From a snapshot to a trajectory

Static estimation uses a measurement window:

$$z_k=h(x_k)+e_k$$

It does not explicitly relate successive states. Dynamic estimation adds information connecting different times, rather than treating every window independently.

---

## What changes over time?

- Daily demand and generation dispatch.
- Intermittent generation and large-load switching.
- Contingencies and substation switching.
- Generator and transmission-system oscillations.
- Adverse operating conditions and equipment faults.

Different phenomena require different state definitions and sampling rates.

---

## Continuous-time state-space model

$$\dot x(t)=f(x(t),u(t))+w(t)$$
$$z(t)=h(x(t),u(t))+e(t)$$

$x$ contains states, $u$ inputs, and $z$ measured outputs. Process noise represents model uncertainty; measurement noise represents observation uncertainty.

---

## Discrete-time model

For a chosen sampling interval:

$$x_k=f_d(x_{k-1},u_{k-1})+w_{k-1}$$
$$z_k=h(x_k,u_k)+e_k$$

Discretization is part of the model. Its step size must be consistent with both physical dynamics and available observations.

---

## Modeling terminology

- **Time invariant:** model functions and parameters do not change with time.
- **Autonomous:** no explicit input vector.
- **No direct feedthrough:** measured outputs do not directly depend on inputs.
- **SISO/MIMO:** one or multiple inputs and outputs.

Identify physical states, inputs, and measurements before choosing a filter.

---

## Linear discrete model

$$x_k=F_{k-1}x_{k-1}+B_{k-1}u_{k-1}+w_{k-1}$$
$$z_k=H_kx_k+e_k$$

Assume zero-mean process and measurement noise with covariances $Q_{k-1}$ and $R_k$, independent of the initial error and of one another across the relevant times.

---

## Initialization and statistical assumptions

$$E[x_0]=\hat x_{0|0},\qquad
P_{0|0}=E[(x_0-\hat x_{0|0})(x_0-\hat x_{0|0})^T]$$

Under the linear-Gaussian model, the Kalman estimate is the conditional mean and minimizes mean-square error. Without Gaussianity, it remains the optimal linear estimator under the appropriate second-order assumptions.

Note: This is a Bayesian conditional-mean statement. It should not be confused with claiming that every Kalman estimate is a maximum-likelihood estimator of a deterministic state.

---

## Two stages: prediction and update

![Prediction and measurement update](../assets/figuras/kalman-cycle.svg)

Prediction carries information forward through the process model. The update reconciles that prediction with the current measurements.

---

## Predicting the state

$$\hat x_{k|k-1}=F_{k-1}\hat x_{k-1|k-1}+B_{k-1}u_{k-1}$$
$$P_{k|k-1}=F_{k-1}P_{k-1|k-1}F_{k-1}^T+Q_{k-1}$$

Process uncertainty increases the predicted covariance. A small $Q$ expresses strong confidence in the transition model.

---

## Innovation and its covariance

$$\nu_k=z_k-H_k\hat x_{k|k-1}$$
$$S_k=H_kP_{k|k-1}H_k^T+R_k$$

The innovation is a **pre-update** discrepancy. It differs from a static estimator's post-fit residual.

Large innovations may reflect bad data, an unexpected transition, or an inadequate process model.

---

## Kalman gain and state update

$$K_k=P_{k|k-1}H_k^TS_k^{-1}$$
$$\hat x_{k|k}=\hat x_{k|k-1}+K_k\nu_k$$

Implement the gain through a linear-system solve rather than an explicit inverse. Measurement and prediction uncertainty jointly determine the correction.

---

## Updating the covariance

The compact expression is:

$$P_{k|k}=(I-K_kH_k)P_{k|k-1}$$

The numerically safer Joseph form is:

$$P_{k|k}=(I-K_kH_k)P_{k|k-1}(I-K_kH_k)^T+K_kR_kK_k^T$$

The laboratory uses the Joseph form and checks symmetry and positive definiteness.

---

## Bayesian interpretation

The predicted Gaussian distribution supplies a prior. The measurement model supplies a likelihood. Their product yields the posterior.

For invertible predicted covariance:

$$P_{k|k}^{-1}=P_{k|k-1}^{-1}+H_k^TR_k^{-1}H_k$$

This information-form expression provides an independent cross-check of the covariance update.

---

## Scalar gain intuition

For $H=1$:

$$K=\frac{P^-}{P^-+R}$$

An uncertain reading receives less influence. An uncertain prediction receives a larger measurement correction.

In a multivariable system, gain entries also reflect geometry and units; they are not all scalar percentages.

---

## Temporal information and observability

A measurement matrix may be rank deficient at one instant while a temporal model couples unmeasured directions to later observations.

For a time-invariant linear pair:

$$\mathcal O=\begin{bmatrix}H\\HF\\\vdots\\HF^{n-1}\end{bmatrix}$$

Full column rank is the finite-dimensional observability condition. Adding a recursion without informative dynamics does not automatically make hidden states observable.

---

## Course example: linear Pθ network

The source lecture considers repeated power measurements on a three-bus network, with one angle reference.

For the laboratory extension, reuse Assignment 2 reactances and define:

$$x=[\theta_2,\theta_3]^T,\qquad\theta_1=0$$

Readings are ordered as $P_{12},P_{13},P_{21},P_{31},P_1,P_2,P_3$.

---

## Measurement matrix for the extension

$$H=\begin{bmatrix}
-25&0\\0&-20\\25&0\\0&20\\-25&-20\\37.5&-12.5\\-12.5&32.5
\end{bmatrix}$$

The two flow directions are distinct noisy channels. Injections obey the lossless Pθ balance.

This numerical dataset is explicitly defined for the teaching extension; it is not presented as the source lecture's unpublished simulation data.

---

## Scenario 1a: a fixed operating condition

The source first considers steady operating conditions with repeated noisy observations:

$$x_k=x_{k-1}+w_{k-1},\qquad z_k=Hx_k+e_k$$

With small process uncertainty, the filter accumulates temporal information and reduces random fluctuations relative to independent snapshot fits.

---

## Scenario 1b: an abrupt load change

The lecture then introduces a **25% load increase at 20 seconds**.

A tracking model with small $Q$ strongly trusts the previous condition and may lag behind the new one. Independent snapshot estimates react without temporal smoothing, but retain measurement-noise variability.

This is a model-response tradeoff, not proof that filtering always improves every sample.

---

## Scenario 1c: faster sampling

The source compares one sample per second with ten samples per second.

For a continuous-time random-walk intensity $q$:

$$Q(\Delta t)=q\Delta t\,I$$

Changing sample rate without adjusting the transition model and process covariance changes the assumed physical model.

---

## Generator dynamics: extending the state

The lecture also introduces generator angle and frequency-related variables through a swing-equation model.

A common physical convention is:

$$\dot\delta=\omega_b\Delta\omega,\qquad
2H_g\dot{\Delta\omega}=P_m-P_e-D\Delta\omega$$

State definitions and coefficients depend on the chosen speed/frequency units. Governor and actuator models may also be needed.

---

## Discretization and what is actually coupled

Forward Euler gives:

$$x_{k+1}\simeq x_k+\Delta t\,f(x_k,u_k)$$

Adding internal generator states does not necessarily impose temporal relationships on every network voltage variable. Inspect the actual state-space structure before attributing smoothing or tracking behavior to the complete system.

---

## Nonlinearity and the extended Kalman filter

$$\hat x^-_k=f_d(\hat x_{k-1},u_{k-1})$$
$$F_{k-1}=\left.\frac{\partial f_d}{\partial x}\right|_{\hat x_{k-1}},\qquad
H_k=\left.\frac{\partial h}{\partial x}\right|_{\hat x^-_k}$$

The EKF propagates covariances using local Jacobians. Accuracy and convergence depend on linearization quality, initialization, and model fidelity.

---

## Other filtering approaches in the lecture

- Iterated EKF: repeated local measurement linearization.
- Unscented and cubature filters: deterministic sampling transformations.
- Ensemble and particle filters: sampling-based uncertainty representation.
- Robust, H-infinity, and correntropy approaches: alternative treatments of uncertainty or contamination.

These methods differ in assumptions and computational cost; they are not interchangeable labels for one algorithm.

---

## Dynamic state estimation: physical dynamics

Detailed models distinguish dynamic states $x$, algebraic variables $y$, inputs $u$, and parameters $p$.

$$\dot x=f(x,y,u,p),\qquad0=g(x,y,u,p)$$
$$z=h(x,y,u,p)+e$$

Generators, loads, converters, controllers, and network constraints determine the equations. Real-time processing must match the dynamics and measurement rates.

---

## Forecasting-aided state estimation

The lecture distinguishes a quasi-static forecasting model for algebraic network variables:

$$y_k=A_ky_{k-1}+\zeta_k+w_k$$
$$z_k=h(y_k,p)+e_k$$

Transition and trend models can come from time-series methods. Fast physical dynamics are assumed negligible at the chosen timescale.

---

## Tracking state estimation

A particular quasi-static model is:

$$y_k=y_{k-1}+w_k$$

It is simple to implement and useful for sequential information fusion, but does not describe full electromechanical dynamics. Abrupt transitions expose its limitations.

The final laboratory implements this tracking formulation.

---

## Applications and practical limitations

Applications include oscillation monitoring, model validation, control support, protection, and PMU-based monitoring.

Check nonlinear model errors, non-Gaussian noise, timing, delayed inputs, covariance tuning, initialization, and computational deadlines. A well-tuned covariance cannot compensate for every missing physical mechanism.

---

## Textbook foundations · A prior is weighted information

For a linear scan $z_k=H_kx_k+e_k$, an independent predicted state with covariance $P_k^-$ gives the objective:

$$J_k(x)=\|z_k-H_kx\|_{R_k^{-1}}^2+\|x-\hat x_k^-\|_{(P_k^-)^{-1}}^2$$
$$P_k^+=\left((P_k^-)^{-1}+H_k^TR_k^{-1}H_k\right)^{-1}$$

This is WLS with an uncertain state prior. Monticelli develops tracking through an augmented model combining a new scan with information from the preceding estimate.

<p class="reading-source">Reading: [1] §§11.1.1–11.1.2, including PDF p. 296.</p>

---

## A sequence can also be estimated in one batch

For independent Gaussian noises, $x_k=F_kx_{k-1}+w_k$, and an initial prior, the trajectory minimizes:

$$\|x_0-\mu_0\|_{P_0^{-1}}^2+\sum_{k=0}^K\|z_k-H_kx_k\|_{R_k^{-1}}^2+\sum_{k=1}^K\|x_k-F_kx_{k-1}\|_{Q_k^{-1}}^2$$

For positive-definite covariances, sequential Gaussian elimination yields the filtering marginal at the last time. Estimating earlier states using later measurements is smoothing.

The filter and a correctly specified batch problem fuse the same information. Appending an already-used scan as if it were new double-counts it.

<p class="reading-source">Reading: [1] §§11.1–11.2. Batch formulation is a derivation connecting its multiple-scan model to least squares.</p>

---

## What repeated scans can and cannot identify

For a constant state with $Q=0$, independent measurements accumulate precision:

$$P_K^{-1}=P_0^{-1}+\sum_{k=0}^KH_k^TR_k^{-1}H_k$$

Repeated identical scans improve precision only in the directions measured by $H$. A finite prior covariance can make the posterior nonsingular even when the measurements alone are unobservable.

For known deterministic transitions, the measurement-only observability test instead stacks $H_k\Phi_{k,0}$, where $\Phi_{k,0}=F_k\cdots F_1$. This distinguishes measurement information from prior regularization.

<p class="reading-source">Reading: [1] §§2.4 and 11.1; measurement-only rank criterion derived for the stated transition model.</p>

---

## Innovation consistency and unexpected steps

For the correctly specified linear Gaussian filter:

$$\nu_k=z_k-H_k\hat x_k^-,\qquad S_k=H_kP_k^-H_k^T+R_k$$
$$\nu_k^TS_k^{-1}\nu_k\sim\chi^2_m$$

This uses the pre-update innovation covariance, not the post-fit residual covariance. The laboratory's unmodeled 25% step can violate these assumptions and produce a large innovation even with healthy sensors.

For an iterated EKF, repeated linearization of one scan refines the same update; it must not assimilate that scan repeatedly as independent data.

<p class="reading-source">Reading: [1] §§11.1.2–11.1.3; [2] §§2.4 and 7.6.2. Consistency statistic derived for the stated Gaussian model.</p>

---

## References

**[1]** A. Monticelli, *State Estimation in Electric Power Systems: A Generalized Approach*. Kluwer Academic Publishers, 1999. §§2.4, 11.1–11.2.

**[2]** A. Abur and A. Gómez Expósito, *Power System State Estimation: Theory and Implementation*. Marcel Dekker, 2004. §§2.4, 7.6.2.

PDF page numbers count file pages starting at 1.

---

## Source and attribution

MASSIGNAN, Julio A. D.; LONDON JUNIOR, João B. A. *Introdução à Estimação de Estado Dinâmica em Sistemas Elétricos de Potência*. Separate SEL-5717 lecture, 3 December 2024; 64 source slides, supplied in Portuguese.

Computational Analysis of Electric Power Systems Laboratory · EESC, University of São Paulo.

This English adaptation consolidates repeated illustration steps and defines a reproducible numerical laboratory extension.

---

## Final laboratory: prediction versus snapshots

Use $x^{base}=[-0.2504,-0.3484]^T$ rad, $\sigma=0.008$ p.u. for flows, and $\sigma=0.010$ p.u. for injections. The initial prior at $t=0$ has mean zero and covariance $10^{-3}I$ rad$^2$; process noise is added only between successive observation times.

1. Advance through the 25% operating-point step at 20 s.
2. Compare snapshot WLS with the Kalman tracking estimate.
3. Increase process-noise intensity and inspect response versus smoothing.
4. Compare 1 Hz and 10 Hz with $Q=q\Delta t I$.

The true trajectory is deterministic; Gaussian measurement noise uses a fixed seed. The unexpected step deliberately tests transition-model mismatch.
