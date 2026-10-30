# Estimação robusta de estado

### Aula 09 · LAV, Huber e IRLS

Como limitar a influência de observações discrepantes

---

## Quando sair do WLS clássico?

Sob erros aproximadamente gaussianos, o WLS é uma escolha natural.

Com caudas pesadas, erros impulsivos ou registros corrompidos, é conveniente avaliar objetivos menos sensíveis a resíduos grandes.

A robustez estatística não corrige automaticamente erros de topologia ou ausência de observabilidade.

---

## Estimador LAV

A formulação dos desvios absolutos mínimos é

$$\min_x \sum_{i=1}^{m}w_i\,|z_i-h_i(x)|.$$

Em problema linear, pode ser expressa por programação linear com variáveis auxiliares para os módulos dos resíduos.

---

## Perda de Huber

Para resíduo padronizado $u$ e limiar $\delta>0$:

$$\rho_\delta(u)=\begin{cases}
\tfrac12u^2,& |u|\le\delta,\\
\delta|u|-\tfrac12\delta^2,& |u|>\delta.
\end{cases}$$

Combina comportamento quadrático próximo de zero e crescimento linear para resíduos grandes.

---

## IRLS — reponderação iterativa

Uma família de M-estimadores pode ser tratada por pesos que dependem do resíduo atual.

$$w_i^{(k)}\propto\frac{\psi(u_i^{(k)})}{u_i^{(k)}},$$

onde $\psi(u)=\rho'(u)$ e o limite no zero é usado quando necessário.

**Cuidado:** a atualização de pesos não equivale a comprovar ausência de erros grosseiros.

---

## Diagnóstico e avaliação

Um experimento comparativo deve registrar:

- Erro de estimação frente a um estado de referência conhecido.
- Distribuição de resíduos e taxa de detecção.
- Sensibilidade à fração e à intensidade de outliers.
- Tempo computacional e falhas de convergência.

---

## Exercício computacional

Para a mesma matriz $H$ e conjunto de medições da aula 05:

1. Calcule a solução WLS.
2. Modifique uma medição com um erro de amplitude crescente.
3. Resolva LAV ou Huber em Python/MATLAB.
4. Compare erro do estado, resíduos e custo de solução.

---

## Síntese

- O objetivo estatístico deve corresponder às hipóteses sobre erros.
- A observabilidade permanece pré-requisito central.
- A robustez precisa ser validada com cenários reproduzíveis.

**Próxima aula:** estrutura coordenada e avanços de pesquisa.
