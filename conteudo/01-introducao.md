# Estimação de Estado em Sistemas Elétricos de Potência

### Aula 01 · Introdução ao problema de estimação de estado

**Operação em tempo real, grandezas medidas e reconstrução do estado operativo**

Note: Esta aula segue a sequência conceitual da Aula 1 (London Jr., 2024), enriquecida por Bretas, London Jr. e Carvalho; Monticelli (1999); e Abur e Gómez Expósito (2004). Material didático original, não reprodução dos livros.

---

## Objetivos de aprendizagem

Ao final da aula, você deverá ser capaz de:

- Contextualizar a **estimação de estado (EESEP)** na operação em tempo real.
- Distinguir **estados operativos**, **variáveis de estado** e **medições**.
- Interpretar o modelo $z=h(x)+e$ e as fontes de incerteza.
- Explicar as **quatro etapas do processo clássico de EESEP**.
- Relacionar observabilidade, redundância e processamento de erros grosseiros.

---

## Roteiro da aula

1. Evolução da operação de sistemas elétricos de potência.
2. Segurança e estados operativos.
3. A necessidade de determinar o estado corrente da rede.
4. Sistemas de medição e formulação do problema.
5. Etapas da estimação de estado e aplicações.
6. Exemplo didático, limitações e perspectivas.

---

## Por que precisamos conhecer o estado da rede?

Um operador precisa responder, continuamente:

- Quais barras estão energizadas e quais equipamentos estão conectados?
- Existem tensões ou carregamentos fora dos limites?
- Qual é o fluxo de potência em ramos **sem medição direta**?
- O SEP permanecerá seguro após a saída de um equipamento?

> As medições fornecem informações **parciais e imperfeitas**; a estimação produz uma representação coerente da condição elétrica atual.

---

## Evolução histórica da operação de SEP

- **Até meados do século XX:** supervisão e comandos predominantemente locais.
- **Décadas de 1950–1960:** controle automático de geração, interligações e despacho econômico.
- **Década de 1960:** ampliação dos sistemas de telecomando e telemedição.
- **A partir do fim dos anos 1960:** maior ênfase em monitoração, segurança e análise computacional.
- **Década de 1970 em diante:** consolidação da estimação de estado como função dos centros de controle.

Note: A literatura atribui papel decisivo aos trabalhos de F. C. Schweppe e colaboradores (1970). A evolução não foi simultânea em todas as empresas e regiões.

---

## Da supervisão à operação orientada por segurança

**Controle de geração:** balanço geração–demanda, frequência e intercâmbios.

**Controle supervisório (SCADA):** aquisição de medidas, estados de chaves e execução de comandos.

**Sistema de gerenciamento de energia (EMS):** interpretação da condição atual, análise de segurança e apoio à operação.

A estimação de estado conecta os **dados de campo** ao **modelo usado pelas aplicações de análise de redes**.

---

## SCADA: o que efetivamente chega ao centro de controle?

**Informações analógicas**

- Magnitudes de tensão e corrente.
- Potências ativa e reativa, injeções e fluxos.
- Frequência e outras grandezas operacionais.

**Informações discretas**

- Posição de chaves e disjuntores.
- Estados de equipamentos e alarmes.
- Posições de tap e status de dispositivos, quando disponíveis.

Note: SCADA = Supervisory Control and Data Acquisition. RTUs e IEDs coletam e disponibilizam dados; a qualidade e o sincronismo dependem da infraestrutura instalada.

---

## SCADA não é um estimador de estado

| Aquisição SCADA | Estimação de estado |
|---|---|
| Recebe valores medidos | Reconstrói variáveis não medidas diretamente |
| Reporta estados e alarmes | Usa modelo da rede para verificar consistência |
| Pode conter dados faltantes | Explora medições disponíveis e redundância |
| Não garante coerência física | Busca um estado compatível com os dados e o modelo |

**Conclusão:** um conjunto de telemedidas não equivale, por si só, ao estado elétrico completo do SEP.

---

## Operação em tempo real: objetivos

- **Monitorar** tensões, carregamentos e intercâmbios.
- **Identificar** violações em condições operativas correntes.
- **Avaliar** contingências relevantes e suas consequências.
- **Propor** ações preventivas, corretivas ou restaurativas.

Tudo isso depende de um modelo atualizado da topologia e de uma estimativa confiável das condições elétricas.

---

## Três grupos de restrições operativas

$$\underbrace{g(x)=0}_{\text{balanço e atendimento de carga}}$$

$$\underbrace{h(x)\leq 0}_{\text{limites de operação}}$$

$$\underbrace{s(x)\leq 0}_{\text{critérios de segurança}}$$

- $g(x)$: restrições de igualdade associadas à operação do sistema.
- $h(x)$: limites de tensão, corrente, carregamento etc.
- $s(x)$: condições avaliadas em contingências previamente selecionadas.

Note: Esta classificação segue a discussão de estados operativos em Bretas, London Jr. e Carvalho, capítulo 2. A definição exata dos vetores pode variar conforme a modelagem operacional.

---

## Estado normal seguro

Condição desejável:

$$g(x)=0,\qquad h(x)\leq0,\qquad s(x)\leq0.$$

- Demanda atendida.
- Limites operativos respeitados.
- Contingências selecionadas não produzem violações inadmissíveis.

**Seguro não significa imune a qualquer evento:** a avaliação depende da lista de contingências e das hipóteses adotadas.

---

## Estado normal de alerta

$$g(x)=0,\qquad h(x)\leq0,\qquad\exists\,s_i(x)>0.$$

- A situação corrente ainda atende às cargas e aos limites.
- Entretanto, **pelo menos uma contingência analisada** pode levar o sistema a condições inadequadas.
- Há necessidade de avaliar **controle preventivo**.

**Exemplo:** uma linha opera dentro do limite, mas a perda de outra linha pode sobrecarregá-la.

---

## Estados de emergência e restaurativo

**Emergência**

- Uma ou mais restrições operacionais são violadas: $\exists\,h_i(x)>0$.
- Podem ser necessárias ações corretivas ou de crise.

**Restaurativo**

- Limites operacionais podem voltar a ser respeitados.
- Porém, parte da demanda ou da integridade elétrica do sistema ainda não foi restabelecida.

Note: No estado restaurativo, as restrições de atendimento pleno à carga não necessariamente são satisfeitas; logo, não confundir a restauração de limites operativos com o restabelecimento total da rede.

---

## Transições entre estados operativos

- **Seguro → Alerta:** mudança de carregamento ou da segurança ante contingências.
- **Alerta → Emergência:** ocorrência de contingência antes de ação preventiva eficaz.
- **Alerta → Seguro:** controle preventivo/corretivo de segurança.
- **Emergência → Restaurativo:** desligamentos ou ilhamentos para conter violações.
- **Restaurativo → Normal:** recomposição de cargas e componentes.

> As transições podem ser **involuntárias** (eventos) ou **voluntárias** (ações de controle).

---

## Pergunta para discussão: seguro ou alerta?

Um sistema opera com:

- Todas as tensões entre $0{,}95$ e $1{,}05$ pu.
- Todos os fluxos abaixo dos limites térmicos.
- Uma contingência N−1 prevista provoca sobrecarga de $115\%$ em uma linha.

**Em qual estado operativo ele se encontra? Por quê?**

Note: Resposta: normal de alerta, supondo atendimento da demanda e respeito às restrições correntes. A condição pós-contingência viola o critério de segurança considerado.

---

## O que significa “estado” em SEP?

Em regime permanente senoidal, e admitindo **topologia e parâmetros conhecidos**, as **tensões complexas nodais** permitem determinar as demais grandezas elétricas de interesse.

$$\underline V_i=V_i e^{j\theta_i}.$$

- $V_i$: magnitude da tensão na barra $i$.
- $\theta_i$: ângulo de fase da tensão na barra $i$.

**Esse conjunto de fasores constitui o estado estático convencional da rede.**

---

## Variáveis de estado: representação usual

Para um sistema CA equilibrado, com $n$ barras e uma referência angular:

$$x=\begin{bmatrix}\theta_2&\cdots&\theta_n&V_1&\cdots&V_n\end{bmatrix}^{T}.$$

$$\boxed{\dim(x)=2n-1}$$

A escolha $\theta_1=0$ elimina a liberdade de rotação angular global **quando não há uma referência absoluta fornecida pelas medições**.

Note: A convenção de referência pode mudar no uso de PMUs sincronizadas; não interpretar θ1=0 como medição física. Em estimação trifásica a dimensão do problema depende das fases presentes e da parametrização.

---

## Parâmetros, estado e medidas são coisas diferentes

**Parâmetros (modelo):** impedâncias/admitâncias, taps, shunts, conectividade.

**Estado ($x$):** valores desconhecidos das tensões nodais complexas no instante de interesse.

**Medidas ($z$):** informações provenientes dos equipamentos de medição e, quando aplicável, grandezas virtuais/pseudomedidas.

> O estimador **não descobre simultaneamente tudo** na formulação clássica: topologia e parâmetros são tratados como conhecidos.

---

## Do estado aos fluxos e injeções

Conhecido $x$, e definida a matriz de admitâncias $Y_{bus}$:

$$I=Y_{bus}V$$

$$S_i=P_i+jQ_i=V_i I_i^*.$$

Portanto, o estado fornece condições para calcular:

- Correntes e potências injetadas nas barras.
- Fluxos e perdas nos ramos.
- Tensões e limites associados à condição operativa.

Note: Expressões introdutórias. A formulação completa das funções de fluxo e injeção será desenvolvida na Aula 02.

---

## Por que as tensões não são todas medidas?

- Instalar e manter sensores em todas as barras pode ser inviável.
- Medidas SCADA tradicionais nem sempre fornecem **ângulos de tensão**.
- As medições podem chegar com diferentes frequências e atrasos.
- A perda temporária de comunicação diminui a cobertura.

A estimação utiliza **relações físicas entre grandezas** para inferir estados não instrumentados diretamente.

---

## Tipos de medições usados na estimação

| Tipo de medida | Grandeza | Exemplo |
|---|---|---|
| Magnitude nodal | $V_i$ | Tensão de barra |
| Injeção | $P_i,Q_i$ | Balanço de barra |
| Fluxo | $P_{ij},Q_{ij}$ | Potência em um ramo |
| Corrente | $|I_{ij}|$ | Corrente de linha |
| Fasor sincronizado | $\underline V_i,\underline I_{ij}$ | PMU |

A relação de cada medida com o estado depende do **modelo de rede**.

---

## Medidas analógicas, virtuais e pseudomedidas

**Analógicas:** valores obtidos por equipamentos de medição, sujeitos a incerteza.

**Virtuais:** relações conhecidas ou assumidas com alta confiança, como injeção nula em uma barra sem geração nem carga.

**Pseudomedidas:** informações indiretas, como previsões e históricos de consumo ou geração.

**Importante:** pseudomedidas normalmente apresentam menor confiabilidade e **não equivalem** a novas medições físicas.

---

## Por que uma telemedida pode ser imperfeita?

- Erros de instrumentos, transdutores e transformadores de medição.
- Ruídos de aquisição e conversão analógico-digital.
- Perdas de pacotes, falhas e atrasos de comunicação.
- Dados desatualizados, medições indisponíveis ou valores inconsistentes.
- Erros de cadastro, topologia ou parâmetros (erros **do modelo**, não do sensor).

**Confiabilidade envolve qualidade da medição e correção do modelo.**

---

## O modelo matemático de medição

$$\boxed{z=h(x)+e}$$

- $z\in\mathbb R^{m}$: vetor das $m$ medições processadas.
- $x\in\mathbb R^{n_x}$: vetor de estados desconhecidos.
- $h(x)$: funções de medição determinadas pelo modelo elétrico.
- $e$: erros associados às medidas.

Em geral, $h(x)$ é **não linear** para o modelo completo CA.

---

## Interpretação de uma medida individual

$$z_i=h_i(x)+e_i.$$

Exemplo de uma magnitude de tensão:

$$z_{V_i}=V_i+e_{V_i}.$$

Exemplo de uma injeção de potência:

$$z_{P_i}=h_{P_i}(V,\theta,Y_{bus})+e_{P_i}.$$

O objetivo não é ajustar cada medida **exatamente**, e sim encontrar um estado globalmente compatível com o conjunto disponível.

---

## Modelo estatístico dos erros

Uma hipótese clássica é:

$$\mathbb E[e]=0,\qquad R=\mathbb E[ee^T].$$

Se os erros forem independentes:

$$R=\operatorname{diag}(\sigma_1^2,\ldots,\sigma_m^2).$$

- $\sigma_i$: desvio-padrão atribuído à medida $i$.
- Erros menores, em geral, justificam **maior peso estatístico**.

Note: A matriz pode ser não diagonal quando há correlações. A hipótese de erros gaussianos é clássica, mas não cobre erros grosseiros ou falhas sistemáticas.

---

## Formulação conceitual da estimação

Os estados candidatos $x$ geram medidas calculadas $h(x)$.

A diferença entre medida e valor calculado é o **resíduo**:

$$r(x)=z-h(x).$$

Um estimador procura um $\hat x$ que produza resíduos pequenos **de acordo com um critério matemático e com a confiança atribuída às medidas**.

---

## Da diferença simples à ponderação

Uma medida com alta precisão e uma pseudomedida de baixa precisão **não deveriam influenciar o resultado da mesma forma**.

Na formulação de mínimos quadrados ponderados (WLS):

$$\boxed{\hat x=\arg\min_x\,(z-h(x))^T R^{-1}(z-h(x))}$$

O WLS será desenvolvido detalhadamente na **Aula 03**.

Note: A expressão supõe matriz R inversível e ponderação estatística coerente. Em aplicações numéricas, preferir fatorizações estáveis a inversões explícitas.

---

## Fluxo de potência × estimação de estado

| Fluxo de potência | Estimação de estado |
|---|---|
| Parte de condições elétricas especificadas | Parte de telemedidas e do modelo |
| Resolve equações de balanço | Ajusta dados com incerteza |
| Tipicamente utiliza tipos de barras e injeções conhecidas | Pode usar medidas heterogêneas e redundantes |
| Produz um ponto operativo calculado | Reconstrói a condição operativa a partir de dados |

Ambos empregam equações da rede, mas resolvem **problemas com informações de entrada diferentes**.

---

## As quatro etapas clássicas da EESEP

1. **Processamento da topologia** e associação das medições ao modelo barra–ramo.
2. **Análise e restauração da observabilidade** do sistema.
3. **Estimação de estado** com as medidas e os parâmetros disponíveis.
4. **Processamento de erros grosseiros** em medidas analógicas.

> Essas etapas formam uma cadeia que pode exigir realimentação e reprocessamento.

Note: Sequência clássica apresentada na Aula 1 (London Jr., 2024) e na seção 2.3 da apostila de Bretas, London Jr. e Carvalho.

---

## Etapa 1 — Configurador de redes

**Entradas:**

- Cadastro físico da subestação e dos equipamentos.
- Status de chaves e disjuntores.
- Posição e tipo dos medidores.

**Saída:**

- Topologia atualizada no **modelo barra–ramo**.
- Associação entre medições e elementos da rede.

Sem topologia correta, as equações de medição podem descrever uma **rede diferente da real**.

---

## Modelo físico × modelo barra–ramo

**Modelo físico (seção de barra e equipamentos):**

- Representa dispositivos de manobra e suas conexões.
- Diferencia estados aberto/fechado.

**Modelo barra–ramo:**

- Agrupa seções eletricamente conectadas.
- Representa barras e ramos equivalentes para os cálculos.

> A configuração não é apenas desenho: ela altera conectividade, variáveis e funções de medição.

---

## Exemplo: qual é o efeito de abrir um disjuntor?

Considere dois trechos de barramento conectados por um disjuntor.

- **Disjuntor fechado:** as seções podem pertencer à mesma barra elétrica.
- **Disjuntor aberto:** elas podem passar a constituir barras distintas.
- Fluxos e injeções associados precisam ser reatribuídos.

**Pergunta:** o que acontece se o configurador indicar “fechado” quando o equipamento está aberto?

Note: Espera-se identificar a possibilidade de erro topológico, incompatibilidade com medições e eventual comprometimento da estimação.

---

## Etapa 2 — O sistema é observável?

O conjunto de medidas permite determinar **todas as variáveis de estado relevantes**?

- Se **sim**, o sistema é observável para a formulação considerada.
- Se **não**, podem existir **ilhas observáveis** e regiões não observáveis.
- A restauração pode exigir **novas medidas**, medidas virtuais ou pseudomedidas.

**Quantidade de medidas e informação independente são conceitos distintos.**

---

## Observabilidade: visão algébrica local

Para uma linearização em torno de $x_0$:

$$\Delta z\approx H(x_0)\,\Delta x+e,$$

$$H(x_0)=\left.\frac{\partial h(x)}{\partial x}\right|_{x=x_0}.$$

Uma condição de observabilidade **local**, após tratar referências e restrições, é:

$$\boxed{\operatorname{posto}(H)=n_x}$$

Note: Para sistemas não lineares, o teste de posto da Jacobiana é local; não implica, por si só, unicidade global da solução.

---

## Ter muitas medidas é suficiente?

Não necessariamente.

Imagine duas variáveis desconhecidas, $x_1$ e $x_2$, e cinco sensores medindo apenas $x_1$.

$$H=\begin{bmatrix}1&0\\1&0\\1&0\\1&0\\1&0\end{bmatrix}.$$

Apesar de $m=5>n_x=2$:

$$\operatorname{posto}(H)=1<2.$$

**O estado $x_2$ não pode ser determinado por essas medidas.**

---

## Redundância × observabilidade

**Observabilidade:** existem informações independentes suficientes para estimar o estado?

**Redundância:** há informações adicionais capazes de proporcionar verificação e tolerância a perdas?

- Uma configuração pode ser observável com pouca redundância.
- Repetir medições da mesma informação pode melhorar precisão, mas não necessariamente revelar estados não observados.
- A distribuição **local** das medidas importa.

---

## Medidas críticas

Uma **medida crítica** é aquela cuja remoção torna o sistema não observável, na formulação considerada.

Consequências:

- Sua indisponibilidade pode impedir a estimação de parte do sistema.
- Sua contribuição é estruturalmente indispensável à observabilidade.
- Erros grosseiros nessa medida não podem ser detectados apenas por testes residuais convencionais, nas hipóteses clássicas.

Note: O conceito e suas consequências são aprofundados nas aulas de observabilidade e processamento de erros.

---

## Restauração de observabilidade

Alternativas possíveis:

1. Recuperar medições indisponíveis.
2. Incorporar novas medições físicas ou fasoriais.
3. Utilizar **medidas virtuais**, quando justificadas.
4. Inserir **pseudomedidas** com incerteza apropriada.
5. Processar separadamente as **ilhas observáveis**.

> Inserir pseudomedidas aumenta a informação disponível ao algoritmo, mas não cria informação física independente de mesma qualidade que um sensor.

---

## Etapa 3 — Estimar as tensões complexas

A estimação utiliza:

- **Topologia** e associação de medidores (etapa 1).
- **Conjunto observável** e eventual restauração (etapa 2).
- **Parâmetros da rede**, armazenados no modelo.
- **Medições** e respectivas ponderações.

Resultado principal:

$$\boxed{\hat x=\text{estimativa do estado elétrico}}$$

Dela derivam fluxos, injeções, correntes e indicadores para as aplicações EMS.

---

## Por que o estimador precisa de otimização?

Para um estado candidato, o modelo normalmente não reproduz **todas** as medidas exatamente:

$$z_1\neq h_1(x),\quad z_2\neq h_2(x),\quad\ldots$$

O problema é escolher um **compromisso consistente** entre medidas potencialmente discordantes, conforme suas incertezas.

Na formulação CA, o ajuste é **não linear** e costuma requerer método iterativo.

---

## Etapa 4 — Erros grosseiros (EGs)

Um erro grosseiro não é simplesmente o pequeno ruído aleatório esperado do instrumento.

Possíveis origens:

- Medida trocada, deslocada ou significativamente incorreta.
- Falha de telemetria, transdutor ou conversor.
- Saturação, perda de escala e problemas de aquisição.

**Objetivo:** detectar inconsistências e, quando possível, identificar medidas suspeitas para tratamento.

---

## Por que redundância ajuda a detectar erros?

Suponha uma grandeza medida por dois sensores:

$$z_1=100\ \text{MW},\qquad z_2=120\ \text{MW}.$$

Há uma inconsistência, mas **qual sensor está errado?**

Se uma terceira medida independente informar:

$$z_3=101\ \text{MW},$$

surge informação adicional para investigar o desvio.

Note: Exemplo apenas conceitual; medições de fluxos em sentidos distintos não devem ser tratadas como cópias exatas sem considerar perdas, convenções e condições de medição.

---

## Resíduos e detecção de inconsistências

Depois de estimar $\hat x$:

$$r=z-h(\hat x).$$

- Resíduos são **diferenças pós-ajuste**.
- Sua magnitude precisa ser interpretada com a **incerteza** e a **redundância** da medição.
- Resíduo pequeno **não garante** ausência de erro grosseiro.

Os testes estatísticos e as limitações do processamento residual serão tratados na Aula 05.

---

## Três classes de erros que não se confundem

| Classe | Informação incorreta | Exemplo |
|---|---|---|
| Medição | Valor de uma telemedida | Fluxo reportado muito acima do real |
| Topologia | Estado de chave/disjuntor | Disjuntor aberto cadastrado como fechado |
| Parâmetro | Dado elétrico do modelo | Reatância de linha incorreta |

**Conclusão:** um resíduo anormal pode ser consequência do **sensor**, da **topologia** ou do **modelo**.

---

## Exemplo numérico: três barras, modelo CC

Assuma $\theta_1=0$ e três medidas de fluxo em ramos, com susceptâncias unitárias na aproximação CC:

$$x=\begin{bmatrix}\theta_2\\\theta_3\end{bmatrix},\qquad
z=\begin{bmatrix}P_{12}\\P_{23}\\P_{13}\end{bmatrix}=
\begin{bmatrix}0.10\\0.05\\0.16\end{bmatrix}.$$

Usando $P_{ij}\approx\theta_i-\theta_j$:

$$z\approx Hx+e,\quad
H=\begin{bmatrix}-1&0\\1&-1\\0&-1\end{bmatrix}.$$

Note: Exemplo original com valores sintéticos em pu. Hipóteses: ângulos em radianos, |V|≈1 pu, resistência desprezada e susceptâncias normalizadas. Não representa um caso CA completo.

---

## O que o exemplo revela antes do cálculo?

Pelo modelo:

$$P_{13}\approx P_{12}+P_{23}.$$

Entretanto, as telemedidas informam:

$$0.16\neq0.10+0.05.$$

**Não existe solução que reproduza exatamente as três medidas.**

Isso caracteriza um problema natural de estimação, não necessariamente a presença de erro grosseiro.

---

## Solução introdutória por mínimos quadrados

Com **pesos iguais** e $H$ de posto completo:

$$\hat x=(H^TH)^{-1}H^Tz.$$

Obtém-se:

$$\hat x=\begin{bmatrix}-0.1033\\-0.1567\end{bmatrix}\ \text{rad}.$$

E as medidas calculadas:

$$\hat z=H\hat x\approx
\begin{bmatrix}0.1033\\0.0533\\0.1567\end{bmatrix}.$$

Note: Esta é a solução linear não ponderada para fins didáticos; a expressão inversa é teórica. Em implementação numérica, preferir QR ou outras fatorizações estáveis.

---

## Interpretação do resultado numérico

$$r=z-\hat z\approx\begin{bmatrix}-0.0033\\-0.0033\\+0.0033\end{bmatrix}.$$

- O estimador acomodou **três medidas ligeiramente inconsistentes**.
- Nenhuma delas foi imposta como verdade absoluta.
- O resultado depende das **equações do modelo** e dos **pesos**.
- Mais medições não garantem ausência de erro grosseiro.

**Pergunta:** o que muda se uma das três medidas receber peso muito maior?

---

## O ciclo completo em um centro de controle

**Dispositivos de campo e SCADA**

$\downarrow$ aquisição, checagens iniciais e dados de status

**Configurador de redes**

$\downarrow$ modelo barra–ramo e localização das medidas

**Observabilidade → Estimação → Análise de erros**

$\downarrow$ estado validado e grandezas calculadas

**Aplicações EMS: monitoração, contingências e apoio ao controle**

---

## Onde a estimação é utilizada?

- Análise de segurança e contingências.
- Supervisão de tensões e carregamentos.
- Verificação da consistência das medidas recebidas.
- Preparação de dados para ferramentas de operação.
- Apoio ao controle preventivo, corretivo e restaurativo.

> A confiança nas análises subsequentes depende da **qualidade do estado estimado** e de suas hipóteses.

---

## Estimação convencional e generalizada

**Convencional:** representação barra–ramo, com topologia processada previamente e parâmetros usualmente considerados conhecidos.

**Generalizada:** amplia a representação e o tratamento conjunto de informações, podendo incluir estados de dispositivos, fluxos em elementos de manobra e problemas associados à topologia.

A abordagem generalizada é desenvolvida em profundidade por **Monticelli (1999)**.

Note: A generalização não significa estimar automaticamente qualquer parâmetro; ela requer parametrização, informações e algoritmos específicos.

---

## E as PMUs?

As **Phasor Measurement Units (PMUs)** oferecem medições fasoriais sincronizadas de tensão e corrente.

Potenciais benefícios:

- Informação angular sincronizada.
- Melhoria da observabilidade quando adequadamente posicionadas.
- Integração de dados SCADA e PMU em estimadores híbridos.

**Desafio:** diferenças de taxa de atualização, sincronização, erros e convenções de referência.

---

## Estimação em redes de distribuição

Redes de distribuição exigem cuidados adicionais:

- **Desequilíbrio trifásico** e diversidade de conexões.
- Topologia radial ou malhada e elevado número de nós.
- Menor instrumentação relativa e uso de pseudomedidas.
- Recursos energéticos distribuídos, carga variável e medição inteligente.

A modelagem monofásica equilibrada da formulação clássica **não descreve todas essas condições**.

---

## Estimação estática × dinâmica

**Estimação estática:** calcula um estado a partir das informações disponíveis em determinado instante ou janela curta.

$$z_k=h(x_k)+e_k.$$

**Estimação dinâmica:** também emprega um modelo de evolução temporal:

$$x_{k+1}=f(x_k,u_k)+w_k.$$

O segundo caso requer hipóteses adicionais sobre a dinâmica e o ruído de processo.

---

## Limitações da formulação clássica

- Dependência da topologia e dos parâmetros cadastrados.
- Observabilidade limitada pela localização das medidas.
- Sensibilidade a erros grosseiros e dados correlacionados.
- Hipóteses de regime permanente e, frequentemente, de equilíbrio trifásico.
- Custos computacionais e requisitos de atualização em tempo adequado.

Esses limites motivam estimadores **robustos, híbridos, trifásicos e dinâmicos**.

---

## Síntese: o que realmente faz um estimador?

Um estimador não é apenas um filtro numérico.

Ele combina:

1. **Modelo físico da rede** — topologia e parâmetros.
2. **Informação disponível** — medidas analógicas, virtuais e pseudomedidas.
3. **Condições de identificabilidade** — observabilidade.
4. **Critério estatístico** — estimação e ponderação.
5. **Diagnóstico** — análise de inconsistências e erros.

Seu produto é uma **representação estimada**, não uma medição perfeita da realidade.

---

## Questões de revisão

1. Por que o SCADA, isoladamente, não fornece todo o estado do SEP?
2. Qual a distinção entre o estado **normal seguro** e **normal de alerta**?
3. Por que um sistema com $m>n_x$ pode continuar não observável?
4. Qual o papel do configurador de redes?
5. Como diferenciar erro de medida, erro topológico e erro de parâmetro?

Note: Incentive respostas que tragam um exemplo físico, e não apenas uma definição.

---

## Exercício para a próxima aula

Considere um sistema de **três barras** com $\theta_1=0$ e medidas CC:

$$P_{12},\quad P_{23},\quad P_{13}.$$

1. Escreva $x$ e a matriz $H$ para susceptâncias $b_{12},b_{23},b_{13}$.
2. Determine o número de estados e o posto de $H$.
3. Remova $P_{13}$: o sistema continua observável?
4. Remova também $P_{23}$: o que ocorre?

**Próxima aula:** modelos de medição CA/CC, matrizes e Jacobiana.

---

## Referências fundamentais — I

**[1]** BRETAS, N. G.; LONDON JR., J. B. A.; CARVALHO, B. E. B. *Estimação de Estado em Sistemas Elétricos de Potência*. Material didático, EESC/USP, versão disponibilizada (2020).

Leituras sugeridas:

- Cap. 1 — Introdução.
- Cap. 2 — Operação em tempo real e processo de EESEP.
- Cap. 4 — Modelo de medição e estimador WLS (leitura inicial).

---

## Referências fundamentais — II

**[2]** MONTICELLI, A. *State Estimation in Electric Power Systems: A Generalized Approach*. Kluwer Academic Publishers, 1999.

**[3]** ABUR, A.; GÓMEZ EXPÓSITO, A. *Power System State Estimation: Theory and Implementation*. Marcel Dekker, 2004.

Leituras sugeridas:

- Monticelli: caps. 1–3 (modelagem em tempo real, mínimos quadrados e estimador CC).
- Abur & Expósito: cap. 1 (fundamentos) e início do cap. 2 (WLS).

---

## Referência da estrutura da aula

**[4]** LONDON JR., J. B. A. *SEL-5717 — Estimação de Estado em Sistemas Elétricos de Potência*. Aula 1: Visão geral da disciplina. EESC/USP, material disponibilizado de 2024.

O conteúdo deste arquivo foi **reescrito e ampliado** para fins didáticos, com exemplos próprios e indicações das hipóteses matemáticas empregadas.

**Próxima aula:** das grandezas medidas às funções $h_i(x)$.
