# Observabilidade da rede elétrica

### Aula 04 · Redundância e medidas críticas

Antes de estimar, verificar se é possível estimar

---

## A questão central

Um conjunto de medições permite determinar o estado **de maneira única** (localmente)?

Para o modelo linear $z=Hx+e$, com $W\succ0$:

$$\mathrm{rank}(H)=n_x$$

é a condição de observabilidade linear, sendo $n_x$ a dimensão do estado.

---

## Observabilidade no modelo CA

No modelo não linear, a Jacobiana depende do ponto de operação:

$$H(x)=\frac{\partial h(x)}{\partial x}.$$

Posto coluna completo de $H$ fornece uma condição local de identificabilidade sob hipóteses regulares, mas não garante unicidade global de soluções não lineares.

---

## Redundância não é mera contagem

É necessário que as medições forneçam informação independente.

Um sistema com $m>n_x$ pode permanecer não observável caso as linhas de $H$ sejam linearmente dependentes ou não cubram determinados estados.

**Exemplo:** medir repetidamente apenas o fluxo $P_{12}$ não revela necessariamente $\theta_3$.

---

## Exemplo de três barras

$$H=\begin{bmatrix}-5&0\\0&-4\\2.5&-2.5\end{bmatrix}.$$

- Com somente $P_{12}$: $\mathrm{rank}(H)=1$.
- Com $P_{12}$ e $P_{13}$: $\mathrm{rank}(H)=2$.
- Com as três medidas: $\mathrm{rank}(H)=2$ com uma medição redundante.

---

## Medição crítica

Uma medida é crítica quando sua retirada faz o conjunto perder observabilidade.

No exemplo, se apenas $P_{12}$ e $P_{13}$ estão disponíveis, **ambas são críticas**.

Se as três medidas independentes aos pares estão presentes, nenhuma delas é individualmente crítica.

---

## Instrumentação e projeto de medição

- Medições adicionais podem aumentar tolerância a falhas.
- PMUs podem acrescentar informação sobre ângulos e fasores.
- Qualidade e localização dos sensores afetam condicionamento e redundância.
- Em redes de distribuição, pseudomedições frequentemente mitigam falta de sensores — com maior incerteza.

---

## Exercício

Escolha diferentes subconjuntos de medidas do exemplo CC.

1. Calcule o posto da Jacobiana reduzida.
2. Determine se o conjunto é observável.
3. Classifique as medições críticas.
4. Explique por que reduzir $\sigma$ não aumenta o posto de $H$.

---

## Demonstração interativa a seguir

Ative e desative cada medição, e observe:

- Posto do modelo com as medições disponíveis.
- Condição de observabilidade.
- Quais medições se tornam críticas.

O teste mostrado é **exato para o modelo CC de dois ângulos**.
