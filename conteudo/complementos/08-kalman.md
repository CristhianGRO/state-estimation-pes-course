# Introdução à estimação dinâmica

### Aula 08 · Filtro de Kalman e extensões

Estados que evoluem entre instantes de medição

---

## Estático versus dinâmico

**Estimador estático:** reconstrói o estado a partir das medições de um instante.

**Estimador dinâmico:** combina um modelo temporal com as novas medições:

$$x_{k+1}=f(x_k,u_k)+w_k,$$

$$z_k=h(x_k)+v_k.$$

A definição de $f$ e o significado físico dos estados variam entre aplicações.

---

## Modelo linear gaussiano

$$x_{k+1}=F_kx_k+B_ku_k+w_k,$$

$$z_k=H_kx_k+v_k,$$

com $w_k\sim\mathcal N(0,Q_k)$ e $v_k\sim\mathcal N(0,R_k)$, sob as hipóteses de independência pertinentes ao filtro clássico.

---

## Predição do filtro de Kalman

$$\hat x_{k|k-1}=F_{k-1}\hat x_{k-1|k-1}+B_{k-1}u_{k-1},$$

$$P_{k|k-1}=F_{k-1}P_{k-1|k-1}F_{k-1}^T+Q_{k-1}.$$

A etapa de predição propaga estado e incerteza antes da chegada das medidas.

---

## Atualização do filtro

$$K_k=P_{k|k-1}H_k^T(H_kP_{k|k-1}H_k^T+R_k)^{-1},$$

$$\hat x_{k|k}=\hat x_{k|k-1}+K_k(z_k-H_k\hat x_{k|k-1}).$$

Para a covariância, a forma de Joseph pode melhorar robustez numérica:

$$P_{k|k}=(I-KH)P_{k|k-1}(I-KH)^T+KRK^T.$$

---

## Interpretação do ganho de Kalman

No caso escalar com $H=1$:

$$K=\frac{P^-}{P^-+R}.$$

- Se a medição é muito incerta ($R$ alto), $K$ diminui.
- Se a predição é muito incerta ($P^-$ alto), $K$ aumenta.

O ganho equilibra duas fontes de informação e suas incertezas.

---

## Sistemas elétricos não lineares

Com $f(\cdot)$ e $h(\cdot)$ não lineares, uma alternativa é o EKF:

$$F_k=\left.\frac{\partial f}{\partial x}\right|_{\hat x},\quad
H_k=\left.\frac{\partial h}{\partial x}\right|_{\hat x^-}.$$

A escolha do modelo dinâmico é crucial: o EKF não supre a ausência de um modelo temporal fisicamente justificável.

---

## Aplicações e cuidados

- Rastreamento de tensão e frequência em sistemas instrumentados.
- Fusão de PMU, SCADA e medições de diferentes taxas.
- Avaliação de inovações para diagnóstico de mudanças.
- Distinção entre estimação quase-dinâmica e dinâmica eletromecânica de fato.

---

## Laboratório escalar a seguir

Considere um estado escalar que evolui como passeio aleatório:

$$x_{k+1}=x_k+w_k,\qquad z_k=x_k+v_k.$$

Altere $Q$ e $R$ e avance instante a instante. Observe o ganho $K$, a estimativa corrigida e a covariância posterior.

**Atenção:** é um experimento de filtragem escalar, não um modelo completo do SEP.
