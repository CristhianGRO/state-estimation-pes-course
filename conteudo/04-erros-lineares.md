# Linear bad-data processing

### Lesson 04 · Normalized residuals, recovery, and simulation

Graduate course · University of São Paulo · Prof. João Bosco A. London Junior

---

## Lesson outline

1. Global detection and the largest normalized residual test.
2. Error estimation and measurement recovery.
3. A systematic approach to simulation and estimator assessment.

---

## Ordinary noise and gross errors

The statistical model describes an expected dispersion. A transducer fault, communication failure, or incorrect association may produce an observation inconsistent with that model.

$$z=Hx+e+b$$

$e$ represents ordinary noise; $b$ represents a gross perturbation, possibly concentrated in one channel.

---

## The residual is not the measurement error

$$r=(I-K)(e+b)=S(e+b)$$

A change in measurement $i$ affects several residuals through column $S_{:i}$. The largest raw error need not produce the largest raw residual.

![Error, projection, and residual component](../assets/figuras/projecao-wls.svg)

---

## Global test using the objective function

With a correct linear model, Gaussian errors, known $R$, and full column rank:

$$J(\hat x)=r^TR^{-1}r\sim\chi^2_{m-n}$$

Reject the consistency hypothesis when $J(\hat x)>\chi^2_{m-n,1-\alpha}$. Specify the significance level $\alpha$.

The test detects a global inconsistency; it does not identify the faulty channel by itself.

---

## Residual covariance and normalization

$$\Omega=R-HG^{-1}H^T,\qquad G=H^TR^{-1}H$$

$$r_i^N=\frac{r_i}{\sqrt{\Omega_{ii}}}$$

Using only $r_i/\sigma_i$ does not give the same diagnosis. Estimation changes residual dispersion.

---

## Largest normalized residual test

$$i^*=\arg\max_i|r_i^N|$$

Investigate the channel when the maximum exceeds the threshold. The value 3 is a common teaching choice, but does not by itself specify significance for several correlated channels.

Identification depends on the assumptions and structure of the measurement set.

---

## Removal and re-estimation cycle

1. Estimate the state using the available set.
2. Calculate residuals and residual covariance.
3. Identify the suspect channel.
4. Check that removing it preserves observability.
5. Re-estimate and repeat the diagnosis.

The updated set has a different residual covariance and a different number of degrees of freedom.

---

## Estimating a single gross error

For an error $b_i$ concentrated in measurement $i$:

$$E[r_i]\simeq S_{ii}b_i$$

$$\hat b_i=\frac{r_i}{S_{ii}}=\frac{R_{ii}}{\Omega_{ii}}r_i$$

The last equality assumes diagonal $R$. Recovery becomes sensitive to noise when $S_{ii}$ is very small.

---

## Measurement recovery

$$z_i^{corr}=z_i-\hat b_i$$

After correction, rerun the estimator and tests. Correcting one measurement does not establish that the single-error hypothesis was valid.

In the nonlinear model, recovery must account for Jacobian changes and iterative solution.

---

## Critical measurements: a structural limitation

Removing a critical measurement makes the system unobservable.

In ideal linear WLS, $\Omega_{ii}=0$ and $r_i=0$. Its normalized residual is undefined; displaying zero as evidence of good quality would be incorrect.

**Changing the threshold does not repair missing redundancy.**

---

## Multiple errors and interaction

Errors in channels with strongly correlated residuals can reinforce or mask one another.

The largest residual test works well in many single-error cases, but is not a universal localization guarantee. Later lessons address criticality, local redundancy, and robustness.

---

## Assignment 3 · Direct-current circuit

![Three-node resistive circuit with current and voltage readings](../assets/figuras/circuito-lista3.svg)

States: $x=[V_1,V_2,V_3]^T$, in volts. Currents are in amperes.

Branches 1–2, 1–3, and 2–3 have conductances of 10, 5, and 10 siemens, respectively.

---

## Nine measurement equations

$$H=\begin{bmatrix}
10&-10&0\\-10&10&0\\5&0&-5\\-5&0&5\\
0&10&-10\\0&-10&10\\1&0&0\\0&1&0\\0&0&1
\end{bmatrix}$$

Order: $I_{12},I_{21},I_{13},I_{31},I_{23},I_{32},V_1,V_2,V_3$.

---

## Assignment 3: readings and weights

$$z=[52,49,-15,16,-82,80,11,6,14]^T$$

$$W=R^{-1}=\operatorname{diag}(1,1,1,1,1,1,100,100,100)$$

**Check the sign:** this assignment uses $I_{21}=+49$ A. Assignment 2 uses $I_{21}=-49$ A for the corresponding circuit. The laboratory preserves Assignment 3's data.

---

## Expected identification result

The largest $|r_i^N|$ occurs in $I_{21}$ and is approximately $81.372$.

After removing that measurement:

$$\hat x=[11.0370,\;5.9272,\;14.0358]^T\ \mathrm V$$

Compare these values with the calculated laboratory solution and the diagnosis of the remaining set.

Note: These are the assignment's printed answers. Recalculation using H and the readings stated here gives [11.03783784; 5.92702703; 14.03513514] V. The maximum difference is below 0.001 V, but is not simply four-decimal rounding of the same solution. The laboratory retains the stated data instead of modifying the solution to force agreement.

---

## Numerical cross-check of the circuit

| Bus | Printed answer (V) | Recalculated using stated H and z (V) |
|---|---|---|
| 1 | 11.0370 | 11.0378 |
| 2 | 5.9272 | 5.9270 |
| 3 | 14.0358 | 14.0351 |

This small difference is kept explicit. The laboratory solves the stated equations and verifies WLS stationarity rather than forcing the printed answers.

---

## A systematic simulation workflow

![Measurement generation and estimator assessment](../assets/figuras/simulacao.svg)

Keep reference states, ideal measurements, simulated noise, and estimation results distinct.

---

## Generating synthetic measurements

1. Solve a consistent power flow.
2. Calculate $z^{ref}=h(x^{ref})$ for the selected channels.
3. Specify covariance $R$.
4. Generate $z^{(k)}=z^{ref}+L\xi^{(k)}$ with $LL^T=R$.

For diagonal $R$, use $e_i^{(k)}=\sigma_i\xi_i^{(k)}$ with independent $\xi_i\sim\mathcal N(0,1)$.

---

## Noise, gross errors, and reproducibility

Record the seed, sample count, distribution, and contaminated channels. A deterministic slider perturbation is not, by itself, a Gaussian noise realization.

Use the same data and noise realizations when comparing methods.

---

## Performance metrics

$$\operatorname{bias}_i=\frac1N\sum_k(\hat x_i^{(k)}-x_i^{ref})$$

$$\operatorname{RMSE}_i=\sqrt{\frac1N\sum_k(\hat x_i^{(k)}-x_i^{ref})^2}$$

Also report dispersion, convergence, false alarms, and correct identification. Averaging signed errors can conceal large errors of opposite signs.

---

## Assess the test, not just the estimate

Separate clean, single-error, multiple-error, and measurement-loss scenarios. Report unobservable cases and convergence failures.

An identification rate calculated only over converged cases can overstate overall performance.

---

## Sources and further study

- Aula 4 - Processamento de EG - EE linear definições e Teste do Maior RN - 27 08 2024.pdf
- Aula 4 - Processamento de EG - EE linear b_chapeu e JX - 27 08 2024.pdf
- Aula 4 - Sistemática para Teste e Simulação - 27 08 2024.pdf

Educational adaptation in Markdown and LaTeX, with redrawn figures. The lesson and topic-block sequence is preserved; repeated animation steps are consolidated.

---

## Recovery experiment

In the laboratory, compare removal and recovery of $I_{21}$. Inspect the corrected reading, state estimate, and objective value.

Then increase the suspect channel's weight, as in Exercise 1(b). Giving a grossly incorrect reading greater weight can shift the estimated state further.

[All original Assignment 3 exercises (Portuguese)](../assets/listas/lista-03.pdf)
