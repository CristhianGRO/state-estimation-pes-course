# Estimação de estado em redes de distribuição

### Aula 07 · DSSE e sistemas trifásicos

Quando a rede deixa de ser aproximadamente equilibrada

---

## Por que a distribuição é diferente?

- Menor densidade de medidores em tempo real.
- Circuitos radiais e malhados com diferentes configurações.
- Desequilíbrio entre fases e presença de neutro.
- Geração distribuída, veículos elétricos e armazenamento.
- Pseudomedições de carga com incertezas frequentemente elevadas.

---

## Estados por fase

Para fases disponíveis em cada barra, podemos representar

$$V_i^\phi=|V_i^\phi|e^{j\theta_i^\phi},\qquad\phi\in\{a,b,c\}.$$

O vetor de estados deve refletir **as fases efetivamente presentes** no sistema, sem presumir que todas as barras sejam trifásicas.

---

## Acoplamento entre fases

A matriz de impedâncias série de um ramo trifásico pode assumir

$$Z_{abc}=\begin{bmatrix}
Z_{aa}&Z_{ab}&Z_{ac}\\
Z_{ba}&Z_{bb}&Z_{bc}\\
Z_{ca}&Z_{cb}&Z_{cc}
\end{bmatrix}.$$

Os elementos fora da diagonal representam acoplamentos mútuos que influenciam as medições e sensibilidades.

---

## Modelo de medição trifásico

A formulação mantém a estrutura geral:

$$z=h(x)+e.$$

Mas $h(x)$ depende da modelagem de linhas, transformadores, conectividade por fase, aterramento, cargas e recursos distribuídos.

A aproximação monofásica equilibrada pode ocultar violações e assimetrias relevantes.

---

## Pseudomedições

Pseudomedições são estimativas de grandezas não medidas diretamente, por exemplo, construídas a partir de históricos ou perfis de consumo.

- Melhoram cobertura e podem auxiliar observabilidade.
- Devem receber incertezas compatíveis com sua qualidade.
- Perfis de consumo podem apresentar erros correlacionados.

---

## Modelagem de carga e REDs

A carga pode depender da tensão, e inversores podem atuar com controles como Volt–Var ou Volt–Watt.

$$P_i=P_i(V_i,\text{condições de operação}),\qquad Q_i=Q_i(V_i,\text{controle}).$$

O estimador precisa diferenciar o que está sendo **medido**, **modelado** e **inferido**.

---

## Questões numéricas relevantes

- Jacobiana esparsa e sistemas de grande dimensão.
- Tratamento de medidas heterogêneas e correlações.
- Posto e condicionamento sob baixa observabilidade.
- Convergência de algoritmos não lineares.
- Validação com dados sintéticos e condições reais.

---

## Exercício de análise

Uma barra recebe 1 fase com tensão medida e outras duas fases alimentam cargas sem medição direta.

1. O que é observado diretamente?
2. Quais variáveis adicionais dependem do modelo de rede?
3. Que consequências surgem ao tratar o sistema como equilibrado?

---

## Demonstração interativa a seguir

Modifique as magnitudes das três fases de um barramento e observe:

- Desbalanceamento das tensões.
- Variação das componentes no plano complexo.
- Desvio das magnitudes em relação ao valor médio.

Este laboratório é ilustrativo, **não um estimador trifásico completo**.
