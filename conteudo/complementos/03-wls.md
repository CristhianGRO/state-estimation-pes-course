# Estimação por Mínimos Quadrados Ponderados

### Aula 03 · Weighted Least Squares (WLS)

O núcleo clássico da estimação de estado estática

---

## Por que ponderar as medições?

Duas medições da mesma grandeza podem possuir precisões diferentes.

- Quanto menor a variância, maior a confiança estatística.
- Quanto maior a variância, menor seu peso no ajuste.
- Com correlações não desprezíveis, $R$ deixa de ser diagonal.

$$W=R^{-1},\qquad \min_x (z-h(x))^T W(z-h(x)).$$

---

## Objetivo do WLS

Defina o resíduo $r(x)=z-h(x)$.

$$\boxed{J(x)=r(x)^T R^{-1}r(x)}$$

Sob erros gaussianos de média zero e covariância conhecida, minimizar $J$ equivale a maximizar a verossimilhança, a menos de constantes independentes de $x$.

O estimador não faz todas as medidas coincidirem exatamente com o modelo.

---

## Equações normais — caso linear

Para $z=Hx+e$:

$$H^TWH\hat x=H^TWz.$$

Se $H$ possui posto coluna completo, $W\succ0$ e a matriz ganho é inversível:

$$\boxed{\hat x=(H^TWH)^{-1}H^TWz}.$$

Na implementação numérica, prefira **fatorações** em vez de formar explicitamente a inversa.

---

## Matriz ganho e incerteza

$$G=H^TWH.$$

Para modelo linear com $R$ conhecida e hipóteses estatísticas usuais:

$$\mathrm{Cov}(\hat x)=G^{-1}.$$

- Posto deficiente de $H$: não é possível estimar unicamente todos os estados.
- Má condição de $G$: o resultado pode ser sensível a pequenas perturbações.

---

## WLS não linear: Gauss–Newton

A cada iteração $k$, resolva:

$$\bigl(H_k^TW H_k\bigr)\Delta x_k=H_k^TW\bigl(z-h(x_k)\bigr).$$

$$x_{k+1}=x_k+\Delta x_k.$$

Critério típico: $\|\Delta x_k\|_\infty < \varepsilon$, complementado por limite de iterações e verificações numéricas.

---

## Etapas do algoritmo

1. Construir $z$, $R$ e o modelo elétrico.
2. Definir o estado inicial $x_0$.
3. Calcular $h(x_k)$ e $H(x_k)$.
4. Resolver o sistema linear das correções.
5. Atualizar $x_k$ até convergência.
6. Analisar os resíduos e a plausibilidade do estado.

---

## Miniestudo: três barras

Para a rede CC com referência $\theta_1=0$:

$$H=\begin{bmatrix}-5&0\\0&-4\\2.5&-2.5\end{bmatrix},\quad
\theta=\begin{bmatrix}\theta_2\\\theta_3\end{bmatrix}.$$

Considere medidas de $P_{12}$, $P_{13}$ e $P_{23}$ com desvios-padrão informados.

**Pergunta:** o que ocorre quando a medição $P_{23}$ apresenta viés crescente?

---

## Demonstração interativa a seguir

Altere o erro aplicado à medição $P_{23}$ e observe:

- Alteração das estimativas angulares $\hat\theta_2$ e $\hat\theta_3$.
- Crescimento da função objetivo $J$.
- Resíduos de cada medição no ponto estimado.

O modelo é linear: o resultado é a solução WLS direta, não uma iteração de fluxo de potência.
