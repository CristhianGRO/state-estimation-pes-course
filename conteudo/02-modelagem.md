# Modelagem das medições elétricas

### Aula 02 · Modelos CC, CA e sensibilidades

Do circuito elétrico à função de medição

---

## Objetivos da aula

- Construir as equações básicas de medição a partir de $Y_{bus}$.
- Entender o modelo linearizado CC e suas hipóteses.
- Relacionar cada medição a uma linha da Jacobiana.
- Distinguir acoplamentos das variáveis $V$ e $\theta$.

---

## Convenções de rede

Adote $V_i=|V_i|e^{j\theta_i}$ e $Y_{bus}=G+jB$.

$$I=Y_{bus}V,\qquad S_i=P_i+jQ_i=V_i I_i^*.$$

As medições de injeção e fluxo são expressas por funções não lineares dos estados de tensão.

A orientação dos fluxos deve ser fixada antes de montar o vetor $z$.

---

## Injeções ativas e reativas

Com $\theta_{ik}=\theta_i-\theta_k$:

$$P_i=V_i\sum_{k=1}^{n}V_k\bigl(G_{ik}\cos\theta_{ik}+B_{ik}\sin\theta_{ik}\bigr),$$

$$Q_i=V_i\sum_{k=1}^{n}V_k\bigl(G_{ik}\sin\theta_{ik}-B_{ik}\cos\theta_{ik}\bigr).$$

As expressões são consistentes com $S_i=V_i(Y_{bus}V)_i^*$.

---

## Modelo de medição CA

Organize as medidas na ordem desejada:

$$z=\begin{bmatrix}V^{meas}\\P_{ij}^{meas}\\Q_{ij}^{meas}\\P_i^{meas}\\Q_i^{meas}\end{bmatrix},\qquad
h(x)=\begin{bmatrix}V(x)\\P_{ij}(x)\\Q_{ij}(x)\\P_i(x)\\Q_i(x)\end{bmatrix}.$$

Cada medição recebe uma variância (ou covariâncias cruzadas, quando aplicáveis) em $R$.

---

## Jacobiana das medições

$$H(x)=\frac{\partial h(x)}{\partial x}.$$

Na parametrização polar, seus blocos combinam sensibilidades como

$$\frac{\partial P}{\partial\theta},\quad\frac{\partial P}{\partial V},\quad\frac{\partial Q}{\partial\theta},\quad\frac{\partial Q}{\partial V}.$$

A Jacobiana traduz variações nos estados em variações previstas nas medições.

---

## Aproximação CC

Sob hipóteses aproximadas de tensões próximas a $1$ pu, diferenças angulares pequenas, perdas desprezíveis e reatâncias dominantes:

$$P_{ij}\approx\frac{\theta_i-\theta_j}{x_{ij}}.$$

Se $\theta_1=0$, obtém-se um modelo linear:

$$\boxed{z=H\theta+e}.$$

A aproximação CC é didática e computacionalmente conveniente, mas não substitui a modelagem CA em análises gerais.

---

## Exemplo: rede CC de três barras

Para $x_{12}=0.20$, $x_{13}=0.25$ e $x_{23}=0.40$ pu:

$$\begin{bmatrix}P_{12}\\P_{13}\\P_{23}\end{bmatrix}=
\underbrace{\begin{bmatrix}-5&0\\0&-4\\2.5&-2.5\end{bmatrix}}_{H}
\begin{bmatrix}\theta_2\\\theta_3\end{bmatrix}.$$

O modelo será usado nos laboratórios das próximas aulas, com ângulos em radianos e potências em pu.

---

## Linearização local no modelo CA

Em torno da aproximação $x^{(k)}$:

$$h(x^{(k)}+\Delta x)\approx h(x^{(k)})+H(x^{(k)})\Delta x.$$

Assim, o vetor de inovações $z-h(x^{(k)})$ é relacionado às correções de estado $\Delta x$.

**Ponto crítico:** atualizar a Jacobiana em cada iteração do WLS não linear.

---

## Exercício de modelagem

Para a rede de três barras:

1. Determine $P_{12}$ para $\theta_2=-0.06$ rad.
2. Determine $P_{23}$ para $\theta_3=-0.095$ rad.
3. Explique o sinal do fluxo conforme a orientação adotada.
4. Verifique as dimensões de $H$ e do vetor de estados.

**Próxima aula:** o estimador WLS resolve a inversão ruidosa desse modelo.
