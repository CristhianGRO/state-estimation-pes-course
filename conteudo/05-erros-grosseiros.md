# Detecção e identificação de erros grosseiros

### Aula 05 · Análise de resíduos

Medir com redundância também permite verificar consistência

---

## Por que o WLS pode falhar?

O WLS quadrático penaliza fortemente resíduos grandes, mas uma medição discrepante também pode deslocar o estado estimado.

Possíveis fontes de erro:

- Falha de comunicação ou transcrição.
- Transformador de instrumento defeituoso.
- Associação de medição à barra incorreta.
- Erro de topologia ou parâmetros não modelado.

---

## Função objetivo pós-estimação

$$J(\hat x)=\left(z-h(\hat x)\right)^TR^{-1}\left(z-h(\hat x)\right).$$

Em hipóteses gaussianas, modelo correto, linearidade e posto completo, a distribuição idealizada de $J$ é $\chi^2$ com $m-n_x$ graus de liberdade.

O teste global indica **inconsistência**, não identifica automaticamente a origem do problema.

---

## Resíduo normalizado

No modelo linear WLS, a covariância residual é

$$\Omega=R-H(H^TR^{-1}H)^{-1}H^T.$$

O resíduo normalizado é

$$r_i^N=\frac{r_i}{\sqrt{\Omega_{ii}}},\qquad\Omega_{ii}>0.$$

**Importante:** dividir apenas por $\sigma_i$ não é equivalente à normalização pela covariância residual.

---

## Teste do maior resíduo normalizado

1. Estimar $\hat x$ por WLS.
2. Calcular $r=z-H\hat x$.
3. Obter $r_i^N$ usando $\Omega$.
4. Comparar $\max_i|r_i^N|$ ao limiar escolhido.
5. Investigar o canal suspeito e repetir a estimação, quando justificável.

É um procedimento heurístico sujeito a falhas por mascaramento, múltiplos erros e medições de alta alavancagem.

---

## Medições críticas e erros não detectáveis

Nem toda medição discrepante produz um grande resíduo.

- Uma medição crítica não dispõe de redundância residual suficiente para detecção clássica.
- Erros estruturados podem se alinhar ao espaço coluna de $H$.
- Erros de topologia podem comprometer o próprio modelo $h(x)$.

Uma estimativa com baixo resíduo **não garante** ausência de erros.

---

## Estimação robusta

Alternativas ao objetivo quadrático incluem:

- LAV — minimizar a soma dos valores absolutos ponderados.
- Huber — combinar regime quadrático e linear.
- IRLS — resolver iterativamente problemas ponderados.

O método escolhido deve considerar robustez, custo computacional e diagnóstico de erros estruturais.

---

## Exercício

Insira artificialmente um erro em um canal de fluxo e responda:

1. O maior resíduo bruto coincide com o maior normalizado?
2. Como a estimação muda ao retirar um canal suspeito?
3. Por que remover automaticamente a medida com maior resíduo pode ser inadequado?

---

## Laboratório a seguir

Uma rede CC de três barras é observada por **cinco canais**: três fluxos e dois ângulos sincronizados.

Aplique um desvio a $P_{23}$, analise os resíduos normalizados e compare estimativas com e sem a medida selecionada.

Os cálculos usam $\Omega$, e não apenas $R$, para normalizar os resíduos.
