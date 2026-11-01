# Criticality, local redundancy, and measurement planning

### Lesson 08 · Critical measurements, critical sets, and reinforcement

Graduate course · University of São Paulo · Prof. João Bosco A. London Junior

---

## Lesson outline

1. Critical measurements and critical measurement sets.
2. Transformation $H_\Delta$ and basic/supplementary measurements.
3. p-critical sets and local redundancy level (LRL).
4. Measurement-system design and reinforcement.

The final laboratory uses this lesson's own local-redundancy matrix example.

---

## Critical measurement: an operational definition

For an observable set $M$, measurement $i$ is critical if:

$$\operatorname{rank}(H_M)=n,\qquad\operatorname{rank}(H_{M\setminus\{i\}})<n$$

Its residual variance is zero in linear WLS. Absence of a residual should not be interpreted as confirmation of channel quality.

---

## p-critical sets

A set $C$ of $p$ measurements is p-critical if losing it makes the system unobservable and no proper subset of $C$ does so.

It is an **inclusion-minimal** loss set:

$$\operatorname{rank}(H_{M\setminus C})<n$$

$$\operatorname{rank}(H_{M\setminus D})=n\quad\forall D\subsetneq C$$

---

## Critical measurement set (CMS)

Under the course definition, a CMS contains noncritical measurements; removing any one makes every remaining member critical.

Critical pairs help identify these groups. Relationships between their normalized residuals explain bad-data identification difficulties.

**“CMS” and “p-critical set” are not synonyms.**

---

## Residual signatures of a CMS

In the linear model, CMS members have normalized residuals perfectly correlated in magnitude, with signs depending on conventions.

Comparing residual magnitudes alone may therefore fail to identify which member contains the error.

Numerical implementations require rounding tolerances for theoretical equalities.

---

## Basic and supplementary measurements

Choose $n$ independent rows of $H$ to form the square matrix $C$. Ordering these measurements first:

$$H=\begin{bmatrix}C\\H_s\end{bmatrix}$$

$$H_\Delta=HC^{-1}=\begin{bmatrix}I\\H_sC^{-1}\end{bmatrix}$$

The rows of $I$ are basic; the remaining rows are supplementary. The column transformation preserves dependencies between measurement rows.

---

## Reading the columns of HΔ

Each column corresponds to an equivalent state variable. Nonzero entries identify measurements informing that direction.

If a column contains only its basic entry, that measurement is critical. A basic entry and one supplementary entry identify a critical pair.

Sets containing several basic measurements require further analysis.

---

## Structural identification of CMSs

1. Identify and separate critical measurements.
2. Find critical pairs containing one basic measurement.
3. Combine pairs sharing supplementary measurements.
4. Investigate unclassified noncritical basic measurements.

Removals and partial factorizations complete the search for groups not immediately identified by the first transformation.

---

## Local redundancy level

$$\operatorname{LRL}(i)=\min_{C\ni i,\ C\ p\text{-critical}}(|C|-1)$$

A critical measurement has LRL 0. Membership in a critical pair gives LRL 1. LRL 2 means membership in a critical triple but in no smaller p-critical set.

The index describes the smallest joint loss that compromises that information.

---

## Determining LRL without confusing sets

Find p-critical sets in increasing size order. For each measurement, record the smallest set containing it.

A larger set containing an already critical measurement is not inclusion-minimal and must not be classified as a new p-critical set.

The laboratory enforces this restriction.

---

## Course example: transformed matrix

Measurement order: $F_1,F_2,I_4,F_4,F_5,I_1,F_3,I_5,I_6$.

$$H_\Delta=\begin{bmatrix}
1&0&0&0&0\\0&1&0&0&0\\0&0&1&0&0\\0&0&0&1&0\\0&0&0&0&1\\
1&1&0&0&0\\-1&1&0&0&0\\0&0&0&-1&0\\0&0&0&0&-1
\end{bmatrix}$$

There are nine equations and five equivalent variables. The rank is 5.

---

## Critical measurement and critical pairs

Only $I_4$ informs the third equivalent variable: that measurement is critical.

$F_4$ and $I_5$ inform the fourth variable; losing both removes that information. Similarly, $F_5$ and $I_6$ form another critical pair.

Rank verifies these conclusions independently of measured values.

---

## Critical triples in the example

The four measurements $F_1,F_2,I_1,F_3$ inform two directions. Every pair is independent; losing three leaves only one equation.

The critical triples are:

$$\{F_1,I_1,F_3\},\quad\{F_2,I_1,F_3\}$$

$$\{F_1,F_2,F_3\},\quad\{F_1,F_2,I_1\}$$

---

## Expected laboratory LRL

| Measurements | LRL | Reason |
|---|---|---|
| $I_4$ | 0 | Critical measurement |
| $F_4,F_5,I_5,I_6$ | 1 | Critical pairs |
| $F_1,F_2,I_1,F_3$ | 2 | Smallest critical losses are triples |

Enable all measurements to reproduce this classification, then observe how a contingency changes it.

---

## A teaching enumeration algorithm

For this small example, test loss subsets and calculate the remaining rank.

Cost grows exponentially with channel count. Enumeration supplies a verifiable reference for structural algorithms, not a large-system processing proposal.

---

## What makes a measurement system reliable?

Design aims at observability, bad-data processing capability, and resilience to specified contingencies.

Consider sensor count, type, and location, along with RTUs and communication channels. Different reliability objectives lead to different measurement plans.

---

## Vulnerability-guided reinforcement

1. Analyze the base plan.
2. Identify critical measurements and smallest loss sets.
3. Find additional independent equations covering vulnerable directions.
4. Update LRL and RTU contingency analysis.

Adding sensors in an already well-covered region may not address the identified vulnerability.

---

## Costs and planning criteria

A conceptual formulation minimizes installation cost subject to desired observability and redundancy conditions.

Costs may include new meters, RTU upgrades, and communication. Precision and reliability cannot be summarized by sensor count alone.

---

## Minimal, reinforced, and resilient plans

A minimal observable plan may have every measurement critical. Reinforcement can eliminate individual criticality while leaving vulnerability to grouped losses.

Always specify the tested contingencies: one measurement, two measurements, one RTU, or another physical grouping.

---

## Assignment-linked activity

[Assignment 5 · planning and restoration (Portuguese)](../assets/listas/lista-05.pdf)

[Assignment 7 · original Word statements (Portuguese)](../assets/listas/lista-07.doc)

Use the final laboratory to verify criticality and LRL in the course example. Then apply the same reasoning to the assignment's measurement plan and topology.

---

## Textbook foundations · Counts do not locate redundancy

Two systems can have the same measurement-to-state ratio $m/n$ and very different vulnerabilities.

One may lose observability after a single reading fails; another may survive several losses. Global counts do not reveal where independent information enters the model.

The course's local redundancy levels describe loss contingencies around a channel. A leverage value describes its weighted influence in the current fit. They answer different questions.

<p class="reading-source">Reading: [1] §5.2, PDF pp. 125–133; [2] §§4.8–4.9.</p>

---

## Critical sets explain ambiguous residual patterns

For diagonal $R$, perfectly correlated standardized residuals satisfy:

$$\frac{|\Omega_{ij}|}{\sqrt{\Omega_{ii}\Omega_{jj}}}=1$$

The corresponding two-channel residual covariance block has rank one. A bias in either channel can generate the same normalized-residual magnitude pattern.

Critical measurement sets generalize this loss of diagnostic separation. A large residual can identify a suspect set without distinguishing a unique faulty member.

<p class="reading-source">Reading: [1] §5.2; [2] §§5.3–5.5. The displayed relation is the two-channel rank-one case.</p>

---

## Precision gain after observability is secured

For a candidate independent measurement with row $h$ and weight $w$:

$$\log\det G_+-\log\det G=\log(1+whG^{-1}h^T)$$

For a locally Gaussian observable model, increasing information determinant reduces covariance-ellipsoid volume. This is one precision objective, not a substitute for contingency requirements.

First define mandatory rank and loss-survival constraints; then compare admissible plans using precision, cost, and practical installation constraints.

<p class="reading-source">Reading: [2] §4.9; [1] §5.4; [3] §5.11. Information-volume criterion is a derived design extension.</p>

---

## A channel failure and a device failure differ

A PMU, remote terminal unit, communication link, or shared power supply can remove several channels simultaneously.

For a loss group $\mathcal C$, test:

$$\operatorname{rank}(H_{\overline{\mathcal C}})=n$$

**Laboratory extension:** compare the single-channel loss sets with a grouped loss of all readings from one device. The HΔ example's local redundancy levels describe its stated measurement contingencies; they do not certify every practical failure mode.

<p class="reading-source">Reading: [1] §§5.2–5.5; [2] §4.9. Device grouping is a teaching extension of the rank criterion.</p>

---

## References

**[1]** N. G. Bretas, J. B. A. London Jr., and B. E. B. de Carvalho, *Estimação de Estado em Sistemas Elétricos de Potência*, course manuscript, 2019, supplied version Sep. 18, 2020. §§5.2–5.5.

**[2]** A. Abur and A. Gómez Expósito, *Power System State Estimation: Theory and Implementation*. Marcel Dekker, 2004. §§4.8–4.9, 5.3–5.5.

**[3]** A. Monticelli, *State Estimation in Electric Power Systems: A Generalized Approach*. Kluwer Academic Publishers, 1999. §5.11.

PDF page numbers count file pages starting at 1.

---

## Sources and further study

- Aula 8 - Métodos para Identificação de MC e CCM - 01 10 2024.pdf
- Aula 8 - Método para identificação do NRL -01 10 2024.pdf
- Aula 8 - Projeto e Fortalecimento de Sistemas de Medição -01 10 2024.pdf

Educational adaptation in Markdown and LaTeX, with redrawn figures. The lesson and topic-block sequence is preserved; repeated animation steps are consolidated.
