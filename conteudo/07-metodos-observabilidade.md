# Observability methods and redundancy

### Lesson 07 · Topological and numerical analysis, and reliability

Graduate course · University of São Paulo · Prof. João Bosco A. London Junior

---

## What should we compare between methods?

The material classifies methods as **topological**, **numerical**, or **hybrid**.

Compare data structures, required operations, island identification, and measurement selection for restoration. The second part discusses the importance of redundancy.

---

## Pθ formulation before fixing a reference

$$z=H\theta+e,\qquad G=H^TWH$$

If the complete network is observable, $\operatorname{rank}(G)=n_b-1$. One singularity is expected because of the global angle reference.

Additional zero pivots indicate missing information under the factorization's assumptions.

---

## Monticelli & Wu: the principle

The method uses triangular factorization of the gain matrix and auxiliary linear estimation solutions.

In an observable system, setting every power reading to zero implies zero flows: angles differ only by a common constant.

Nonzero auxiliary flows reveal relationships not determined by the original measurements.

---

## Zero pivots and artificial references

Identify zero-pivot positions during factorization. Add auxiliary angle references with distinct values at the corresponding buses.

This makes the auxiliary problem solvable and helps distinguish regions. These are not additional physical measurements.

---

## Identifying unobservable branches

1. Set auxiliary power readings to zero.
2. Introduce the required artificial references.
3. Solve the auxiliary linear system.
4. Calculate $P_{ij}^{aux}=(\theta_i^{aux}-\theta_j^{aux})/x_{ij}$.

Under the method's conditions, nonzero auxiliary flows identify branches insufficiently informed by the original set.

---

## Island identification must be iterative

Remove unobservable branches from the analysis, along with injection measurements combining those branches with distinct regions.

Repeat the analysis using the updated set. Removing an equation may expose another dependency hidden in the first pass.

A single cut of the highlighted branches is insufficient.

---

## Restoration with the numerical method

Choose candidate pseudomeasurements that can relate unobservable regions. Add them one at a time and update the factorization.

Without a previously fixed angle reference, restoration is complete when only the expected global singularity remains.

Preserve the candidate order when the assignment specifies one.

---

## Bretas: factorization paths

This method also factors $G$, but uses factorization paths to analyze dependencies without solving auxiliary angle systems.

Nonzero entries in the factored structure reveal dependencies. Factorization-path trees are not simply the physical network diagram.

---

## One path tree or several?

In the observable case, before fixing a reference, the structure has a factorization path associated with the global reference.

Additional zero pivots separate paths and indicate regions requiring analysis of observability and boundary injections.

Discardable measurements still require appropriate treatment.

---

## Comparing the two methods

| Aspect | Monticelli & Wu | Bretas |
|---|---|---|
| Core structure | Factorization of $G$ | Factorization of $G$ |
| Additional information | Auxiliary solutions | Factorization paths |
| Regional diagnosis | Auxiliary flows | Structural dependencies |
| Applications | Islands and restoration | Islands and restoration |

Implement each procedure with its own rules. Mixing selected steps can yield incorrect conclusions.

---

## Handling numerical pivots

Use a tolerance compatible with matrix scaling to classify zero pivots. Record ordering and permutation operations.

A small value caused by ill-conditioning is not necessarily a structural zero. Cross-check small examples using the measurement matrix's rank directly.

---

## A controlled example from Assignment 2

Reuse the six channels of Exercise 1 as a measurement plan. The final laboratory reports rank and tests individual removals.

The set $\{P_{12},P_{21}\}$ contains two readings but informs only one of the two angles.

This example separates count, independence, and criticality before considering larger networks.

---

## Redundancy: one measurement

Imagine a flow determined by a single independent reading. The fit reproduces that reading and its residual is zero.

Without other information about that state direction, internal consistency alone cannot distinguish a correct reading from a gross error.

---

## Two readings of the same quantity

$$z_1=x+e_1,\qquad z_2=x+e_2$$

There is one residual direction: disagreement can be detected, but assigning the fault to one channel is difficult without further information.

Enough redundancy for detection does not imply enough redundancy for identification.

---

## Three readings and local information

A third reading can help locate a single inconsistency when independence and error assumptions are appropriate.

In a network this protection is local: many measurements elsewhere may not help the channel under investigation.

Redundancy distribution matters as much as its global amount.

---

## Measurement and RTU contingencies

Losing one measurement removes one row of $H$. An RTU failure may remove several rows simultaneously.

A plan without individually critical measurements may lose observability after an RTU failure. Physical channel grouping belongs in reliability planning.

---

## Assignment 5 verification guide

1. Build the Pθ model and document its reference.
2. Identify an observable plan or its observable islands.
3. Restore using the prescribed pseudomeasurement order.
4. Compare both methods' conclusions.
5. Test individual losses in the restored plan.

[Return to original Assignment 5 (Portuguese)](../assets/listas/lista-05.pdf)

---

## Consolidation questions

- Why is the auxiliary angle solution not an estimate of the actual operating state?
- Why might an injection measurement be discarded when separating islands?
- Why does removing a reading and updating only the objective not check observability?

The next lesson organizes criticality analysis using the transformed matrix $H_\Delta$ and local redundancy level.

---

## Textbook foundations · Elimination creates fill

Gaussian elimination replaces remaining blocks by Schur complements. Eliminating one variable can couple all variables attached to it, creating nonzero entries absent from the original matrix.

$$G_{\mathrm{next}}=G_{aa}-G_{ab}G_{bb}^{-1}G_{ba}$$

An ordering can reduce fill and work without changing exact rank. A numerically weak pivot still needs scaling or a more suitable rank-revealing method.

<p class="reading-source">Reading: [1] §§5.3–5.6; [2] Chapter 4.</p>

---

## Compute selected uncertainty entries by solves

Suppose $G=TT^T$ is a Cholesky factorization. Solve $Tv_i=H_i^T$ for each desired measurement row:

$$H_iG^{-1}H_i^T=\|v_i\|_2^2$$
$$\Omega_{ii}=R_{ii}-\|v_i\|_2^2$$

This obtains residual variances without forming a dense inverse. It assumes the unconstrained, observable linearized estimator; exact constraints require the corresponding constrained covariance.

<p class="reading-source">Reading: [2] §5.7, PDF pp. 129–130; [1] §8.2.</p>

---

## A rank-one measurement update

Add an independent scalar measurement with row $h$ and weight $w>0$ to an observable system:

$$G_+=G+wh^Th$$
$$G_+^{-1}=G^{-1}-\frac{wG^{-1}h^ThG^{-1}}{1+whG^{-1}h^T}$$

The covariance reduction is positive semidefinite. A new reading can improve precision even when rank was already full. This formula assumes $G$ is initially nonsingular; it does not by itself handle restoration from an unobservable case.

<p class="reading-source">Reading: [1] §5.11; [3] §5.5. Formula specialized to one independent added reading.</p>

---

## Deletion reveals a critical measurement

For an existing independent channel $i$, let $h=H_i$, $w=1/R_{ii}$, and $\ell_i=whG^{-1}h^T$:

$$\det(G-wh^Th)=\det(G)(1-\ell_i)$$

In exact arithmetic, deletion preserves observability when $\ell_i<1$ and destroys it when $\ell_i=1$. The same denominator appears in covariance downdates and bad-data recovery.

This connects numerical factorization, criticality, and residual detectability. Near-critical cases need numerical care rather than an exact floating-point equality test.

<p class="reading-source">Reading: [1] §5.11 and Chapter 7; [2] §§4.8 and 5.1. Determinant identity rederived here.</p>

---

## References

**[1]** A. Monticelli, *State Estimation in Electric Power Systems: A Generalized Approach*. Kluwer Academic Publishers, 1999. §§5.3–5.6, 5.11, 8.2.

**[2]** A. Abur and A. Gómez Expósito, *Power System State Estimation: Theory and Implementation*. Marcel Dekker, 2004. Chapter 4 and §5.7.

**[3]** N. G. Bretas, J. B. A. London Jr., and B. E. B. de Carvalho, *Estimação de Estado em Sistemas Elétricos de Potência*, course manuscript, 2019, supplied version Sep. 18, 2020. §5.5.

PDF page numbers count file pages starting at 1.

---

## Sources and further study

- Aula 7 - Observabilidade - Métodos - Parte 2 - 24 09 2024.pdf
- Aula 7 - Impotância da Redundância de Medidas - 24 09 2024.pdf

Educational adaptation in Markdown and LaTeX, with redrawn figures. The lesson and topic-block sequence is preserved; repeated animation steps are consolidated.
