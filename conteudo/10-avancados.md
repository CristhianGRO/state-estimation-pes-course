# Tópicos avançados em estimação de estado

### Aula 10 · Coordenação, multitaxa e geometria

Do estimador centralizado às novas arquiteturas

---

## Motivação

O acoplamento entre transmissão, distribuição e recursos baseados em inversores desafia a arquitetura tradicional de estimação de estado.

- Modelos com diferentes granularidades.
- Observações com diversas frequências e atrasos.
- Restrições de comunicação e privacidade.
- Dinâmicas elétricas e de controle em escalas distintas.

---

## Coordenação TSO–DSO

Uma abordagem coordenada procura tornar consistentes os estados estimados dos subsistemas por meio de condições na fronteira.

Podem ser considerados:

- Magnitudes e ângulos de tensão na interface.
- Fluxos de potência trocados.
- Incertezas das informações transmitidas.
- Restrições e prioridades operacionais dos agentes.

---

## Estimação multitaxa

As medições não chegam necessariamente no mesmo instante:

$$z_k^{PMU},\qquad z_{\ell}^{SCADA},\qquad z_j^{AMI}.$$

O alinhamento temporal deve ser parte explícita do modelo; a simples concatenação de medições de épocas distintas pode introduzir inconsistências.

---

## Modelos para recursos baseados em inversores

Estados possíveis incluem grandezas associadas a controles PLL, droop ou filtros internos.

Antes de acrescentar estados, é necessário estabelecer:

- Um modelo dinâmico identificável.
- Medições com informação suficiente.
- Escalas temporais coerentes.
- Critérios de validação e estabilidade numérica.

---

## Filtros em grupos de Lie

Determinados estados possuem estrutura geométrica especial, como ângulos e orientações.

A ideia central é representar adequadamente essa geometria e realizar atualizações no espaço tangente em vez de usar operações euclidianas inadequadas.

**Cuidado:** uma parametrização angular simples e abeliana pode gerar resultados equivalentes ao filtro euclidiano quando ambos são implementados consistentemente.

---

## Robustez e diagnósticos

Combinações possíveis de pesquisa incluem:

- Estimadores MAP iterados.
- M-estimação e covariâncias adaptativas.
- Testes de inovação e de consistência espectral.
- Detecção de desvios e mudanças de regime.

As propostas precisam ser confrontadas com baselines robustos e critérios estatísticos reproduzíveis.

---

## Projeto final sugerido

Construa e valide um estimador em um sistema IEEE de pequeno porte:

1. Defina estados, sensores e modelo de rede.
2. Implemente WLS com testes de observabilidade.
3. Injete ruído e erros grosseiros de forma controlada.
4. Compare cenários com e sem medições fasoriais.
5. Apresente métricas e limitações da abordagem.

---

## Encerramento

A estimação de estado integra três ingredientes:

$$\boxed{\text{modelo físico}\; +\; \text{informação estatística}\; +\; \text{algoritmos numéricos}}.$$

A qualidade do resultado depende da consistência entre esses três elementos — e não apenas do método de otimização adotado.
