# Estimação de Estado em Sistemas Elétricos de Potência

### Aula 01 · Fundamentos e motivação

Da medição imperfeita ao retrato operacional da rede

---

## Ao final desta aula

- Diferenciar **estado**, **medição** e **parâmetros de rede**.
- Explicar por que um centro de operação necessita de um estimador.
- Interpretar o modelo de medição $z=h(x)+e$.
- Reconhecer o papel da **redundância** e da **observabilidade**.

---

## Qual é o problema operacional?

A rede possui milhares de grandezas físicas, mas somente parte delas é medida.

- Instrumentos podem apresentar ruído, atrasos e falhas.
- Grandezas são coletadas em instantes distintos.
- Nem todas as barras possuem sensores de tensão ou potência.
- É preciso reconstruir um estado **eletricamente coerente**.

> O estimador combina medições, topologia, parâmetros e incertezas para produzir uma descrição consistente da rede.

---

## Variáveis de estado e referência angular

Para um sistema CA com $n$ barras, uma escolha comum é

$$x = [\theta_2,\ldots,\theta_n,V_1,\ldots,V_n]^T.$$

- $V_i$: magnitude de tensão da barra $i$.
- $\theta_i$: ângulo da tensão da barra $i$.
- $\theta_1=0$: referência angular adotada, não uma medida adicional.

Com essa parametrização, $x\in\mathbb{R}^{2n-1}$.

---

## O que medimos?

| Grandeza | Medição típica | Fonte |
|---|---|---|
| $V_i$ | Magnitude de tensão | SCADA / medidor |
| $P_{ij},Q_{ij}$ | Fluxo em ramo | SCADA |
| $P_i,Q_i$ | Injeção em barra | SCADA |
| $\Re(V_i),\Im(V_i)$ | Fasor sincronizado | PMU |

Cada tipo de medição possui uma relação física própria com o vetor de estados.

---

## Modelo estatístico de medição

$$\boxed{z=h(x)+e}$$

- $z\in\mathbb{R}^{m}$: vetor de medidas disponíveis.
- $h(x)$: funções de medição calculadas com o modelo da rede.
- $e$: erros de medição; frequentemente $\mathbb E[e]=0$.
- $R=\mathbb E[ee^T]$: matriz de covariância dos erros.

**Atenção:** a hipótese gaussiana é útil para o WLS clássico, mas pode falhar diante de erros grosseiros.

---

## Medição não é estimação

**Fluxo de potência:** encontra um estado a partir de condições de operação especificadas (injeções, referência e modelo).

**Estimação de estado:** encontra um estado compatível, em sentido estatístico, com medições imperfeitas e potencialmente redundantes.

Ambos utilizam modelos elétricos, mas resolvem problemas de natureza distinta.

---

## Redundância e observabilidade

- **Observabilidade:** possibilidade de determinar localmente os estados com as medições disponíveis.
- **Redundância:** medições adicionais em relação ao número mínimo necessário.
- **Medição crítica:** se removida, pode provocar perda de observabilidade.

Um estimador pode possuir muitas medições e ainda assim ser não observável se elas não fornecerem informações independentes.

---

## Cadeia operacional simplificada

**Aquisição SCADA/PMU** $\rightarrow$ **Validação e topologia** $\rightarrow$ **Modelagem das medições**

$\rightarrow$ **Estimação de estado** $\rightarrow$ **Análise residual** $\rightarrow$ **Aplicações EMS/DSO**

Aplicações: supervisão, análise de contingências, segurança operacional e apoio à tomada de decisão.

---

## Exercício conceitual

Um sistema de três barras contém apenas uma medição de fluxo entre as barras 1 e 2.

1. É possível estimar os ângulos das barras 2 e 3 usando somente essa medição, com $\theta_1=0$?
2. A precisão do instrumento modifica a quantidade de informação independente?
3. Que medição adicional poderia tornar o modelo CC observável?

**Próxima aula:** construir $h(x)$ e a Jacobiana a partir da rede.

Note: Discuta a diferença entre aumentar precisão e aumentar observabilidade.
