# Medições fasoriais e estimação híbrida

### Aula 06 · PMU, referência temporal e modelagem

Da supervisão assíncrona aos fasores sincronizados

---

## Objetivos

- Reconhecer a estrutura de medições SCADA e PMU.
- Entender o papel da referência temporal comum.
- Representar fasores em coordenadas retangulares.
- Discutir a integração de medidas de naturezas distintas.

---

## PMU e fasores sincronizados

Uma PMU estima grandezas fasoriais sincronizadas com uma referência temporal comum.

$$\underline{V}=V\angle\theta=V\cos\theta+jV\sin\theta.$$

A sincronização permite comparar fases medidas em diferentes pontos da rede sob condições de qualidade e integridade adequadas.

---

## Representação retangular

$$\Re(V)=V\cos\theta,\qquad\Im(V)=V\sin\theta.$$

Um modelo de medição pode utilizar componentes reais e imaginárias de tensões e correntes.

A transformação de incertezas entre coordenadas polar e retangular deve ser considerada: covariâncias podem ficar correlacionadas.

---

## Correntes de ramo a partir dos fasores

Para um ramo simplificado sem transformador, usando admitância série $y_{ij}$ e admitância shunt total $y_{sh}$:

$$I_{ij}=y_{ij}(V_i-V_j)+\frac{y_{sh}}{2}V_i.$$

Uma PMU que mede $I_{ij}$ fornece informação adicional sobre combinações lineares dos fasores de tensão em coordenadas retangulares.

---

## Fusão SCADA–PMU

**SCADA:** medidas convencionais de magnitudes, fluxos e injeções; geralmente adquiridas em taxas menores.

**PMU:** fasores de tensões/correntes com sincronização temporal e maior frequência de amostragem.

**Desafio:** lidar com taxas de atualização, latência, covariâncias e referência angular coerentes.

---

## Matriz de pesos e correlações

Considere o vetor concatenado de medições:

$$z=\begin{bmatrix}z_{SCADA}\\z_{PMU}\end{bmatrix},\qquad
R=\begin{bmatrix}R_S&R_{SP}\\R_{SP}^T&R_P\end{bmatrix}.$$

A hipótese de independência equivale a desprezar $R_{SP}$, o que nem sempre é justificado.

---

## Experimento: fasores no plano complexo

Considere:

$$V_a=1.00\angle0^\circ,\quad
V_b=0.98\angle-120^\circ,\quad
V_c=1.02\angle120^\circ.$$

Um experimento visual mostra o efeito do desequilíbrio em magnitude e fase sobre as componentes retangulares dos fasores.

---

## Reflexão

1. Uma maior taxa de medição garante melhor estimação em qualquer situação?
2. O que acontece se duas PMUs possuem erros sistemáticos de referência temporal?
3. Por que um estado em coordenadas retangulares pode simplificar a incorporação de medidas fasoriais?

---

## Demonstração interativa a seguir

Altere o deslocamento de fase do sistema e as magnitudes das fases, e observe como os vetores de tensão são representados no plano complexo.

O exemplo representa **fasores sintéticos**, sem reconstrução de sinais amostrados.
