# Estimação de Estado em Sistemas Elétricos de Potência

Site acadêmico estático com dez aulas em **Reveal.js**, seis laboratórios interativos e estrutura para acrescentar novas aulas sem duplicar templates. Projeto inicial **original**, criado para adaptação didática; utiliza como referência de experiência de navegação o site SEL5917 (https://marofe.github.io/estimation-identification-filtering/), mas não replica seus slides.

## O que está incluído

- Página inicial responsiva com programa da disciplina, busca por tema e links individuais.
- 10 apresentações editáveis em Markdown com navegação por teclado, equações LaTeX e apresentação em tela cheia.
- 6 demonstrações interativas em JavaScript: WLS linear, observabilidade, resíduos normalizados/erro grosseiro, fasores, tensão trifásica e Kalman escalar.
- Exemplo MATLAB/Octave de WLS para uma rede de três barras.
- Gerador estático com **biblioteca padrão do Python**, sem `pip install`.
- Workflow de **GitHub Actions** para geração e publicação automática no GitHub Pages.

**Limites:** os laboratórios usam modelos sintéticos didáticos. Não constituem simuladores CA/trifásicos completos nem devem ser utilizados para decisões operativas. O conteúdo inicial precisa ser revisto e expandido para uso como curso formal.

## 1. Visualizar localmente (Windows / VS Code)

Extraia a pasta, abra o terminal na **raiz** do projeto e execute:

```powershell
py tools/build.py
py tools/validate.py
py -m http.server 8000 --directory docs
```

Se o comando `py` não estiver disponível, substitua por `python`.

Abra no navegador: **http://localhost:8000/**

> Não abra `docs/index.html` diretamente pelo explorador para testar os slides. Reveal.js carrega os arquivos Markdown por requisição HTTP, e o navegador pode bloquear requisições ao usar `file://`.

> A versão inicial usa Reveal.js, KaTeX e fontes via CDN; portanto, requer conexão com a internet para carregá-los. Para uso integralmente offline, é necessário armazenar essas dependências localmente.

## 2. Estrutura modular do projeto

```text
estimacao-estado-sep-starter/
│
├── curso.json                 ← dados da disciplina e catálogo das aulas
├── conteudo/                  ← EDITE AQUI: um arquivo .md por aula
│   ├── 01-introducao.md
│   ├── 02-modelagem.md
│   └── ...
├── componentes/               ← fragmentos HTML dos laboratórios
│   ├── wls.html
│   ├── observabilidade.html
│   └── ...
├── templates/
│   ├── index.html             ← página inicial, alterada uma só vez
│   └── slide.html             ← molde HTML compartilhado das aulas
├── assets/
│   ├── css/site.css           ← estilo da página inicial
│   ├── css/slides.css         ← estilo das apresentações e laboratórios
│   ├── js/site.js             ← busca de aulas
│   ├── js/slides.js           ← inicialização central do Reveal.js
│   └── js/experimentos.js     ← cálculos e interações dos laboratórios
├── exemplos/matlab/
│   └── wls_tres_barras.m
├── tools/
│   ├── build.py               ← constrói o site em docs/
│   └── validate.py            ← valida páginas e links internos
├── docs/                      ← SITE GERADO, publicado no GitHub Pages
└── .github/workflows/pages.yml
```

### Onde editar?

| Objetivo | Arquivo a editar |
|---|---|
| Nome da disciplina, docente, ano, títulos e módulos | `curso.json` |
| Conteúdo de uma aula existente | `conteudo/NN-nome.md` |
| CSS e layout geral dos slides | `assets/css/slides.css` |
| Aparência da página inicial | `assets/css/site.css` e `templates/index.html` |
| HTML de um laboratório | `componentes/nome.html` |
| Fórmulas e interação do laboratório | `assets/js/experimentos.js` |
| Opções Reveal.js (transição, escala, plugins) | `assets/js/slides.js` |

**Nunca edite apenas `docs/`**: esses arquivos são sobrescritos sempre que `tools/build.py` é executado.

## 3. Como escrever uma aula em Markdown

O separador `---` cria um novo slide. Este é um exemplo mínimo:

```markdown
# Modelagem de medidas

### Aula NN · Título

Uma introdução breve

---

## Definição do problema

A medida se relaciona ao estado por

$$z=h(x)+e.$$

---

## Perguntas para a turma

- Qual é o significado de $e$?
- O modelo $h$ é linear?
```

Após a edição, rode `py tools/build.py` e atualize o navegador. Também é possível inserir tabelas, imagens SVG, blocos de código e **Notas do apresentador** com o marcador `Note:` (em uma nova linha).

Use **SVG** para figuras vetoriais, colocando arquivos em `assets/figuras/` e referenciando-os com caminhos relativos a `aulas/NN-nome.html` (por exemplo, `../assets/figuras/rede.svg`).

### Adicionar uma aula

1. Crie `conteudo/11-novo-tema.md`.
2. Acrescente um objeto à lista `lessons` de `curso.json`, com `id`, `slug`, `title`, `subtitle`, `topics`, `minutes` e `demo: null`.
3. Rode `py tools/build.py` e `py tools/validate.py`.
4. O cartão inicial e a página `aulas/11-novo-tema.html` serão gerados automaticamente.

### Adicionar um laboratório interativo

1. Crie o fragmento `componentes/novo-demo.html` com um elemento raiz `<section data-demo="novo-demo"> ... </section>`.
2. Crie uma função `mountNovoDemo(root)` em `assets/js/experimentos.js` que trabalhe **apenas** com elementos dentro de `root`.
3. Registre `novo-demo: mountNovoDemo` no objeto `registry` no final do arquivo JavaScript.
4. Aponte o campo `demo` da aula em `curso.json` para `"novo-demo"`.
5. Regere o site. O laboratório será acrescentado após os slides convencionais daquela aula.

A separação impede que uma apresentação copie o mesmo código de outra e facilita reutilização futura.

## 4. Publicar com GitHub Pages (recomendado)

1. No GitHub, crie um repositório público vazio; por exemplo `estimacao-estado-sep`.
2. Na raiz deste projeto, execute:

```powershell
git init
git add .
git commit -m "Versão inicial do site e das aulas"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/estimacao-estado-sep.git
git push -u origin main
```

3. Abra **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. O workflow `.github/workflows/pages.yml` gerará o site e fará a publicação após cada `push` para `main`. É possível acompanhar a execução na aba **Actions**.
5. Depois da publicação, o endereço padrão será `https://SEU-USUARIO.github.io/estimacao-estado-sep/` (substitua seu usuário e o nome do repositório).

> Alternativa simples: em **Source → Deploy from a branch**, selecione a branch `main` e a pasta `/docs`. Nesse modo você precisa executar `py tools/build.py` **e adicionar os arquivos de `docs/` ao commit** para cada atualização. Recomenda-se escolher **um único** modo de publicação; este pacote já inclui GitHub Actions.

Documentação oficial: [Configurar publicação do Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 5. Verificações e validação científica

O pacote inclui verificações automáticas **estruturais** (`tools/validate.py`) e o exemplo MATLAB `exemplos/matlab/wls_tres_barras.m` para comparação numérica. A demonstração WLS usa:

$$H=\begin{bmatrix}-5&0\\0&-4\\2.5&-2.5\end{bmatrix},\quad \theta^{true}=\begin{bmatrix}-0.06\\-0.095\end{bmatrix}.$$

O laboratório de detecção de erros grosseiros usa cinco medidas e calcula o resíduo normalizado por $\Omega=R-HG^{-1}H^T$. O teste de posto e a classificação de medições críticas estão restritos ao modelo CC de dois ângulos. O laboratório de Kalman é escalar e não representa a dinâmica eletromecânica do SEP.

Antes de utilizar os materiais em sala, confira hipóteses, convenções, unidades, valores de variância, qualidade da visualização e exemplos com a bibliografia escolhida.

## 6. Próximos incrementos sugeridos

- Incluir figuras SVG de IEEE 14, 33 e 123 barras com destaque de medidores.
- Acrescentar solução CA de WLS Gauss–Newton com derivadas de $P$ e $Q$ e comparação com MATPOWER.
- Criar exercícios e notebooks Python/MATLAB ligados a cada aula.
- Incorporar cenários de pseudomedições trifásicas, PMUs multitaxa e detecção robusta.
- Acrescentar exportação PDF em um processo automatizado (Playwright/Chromium).

## Créditos e licença

- Framework de apresentações: [Reveal.js](https://revealjs.com/), com bibliotecas e suas licenças próprias.
- Inspiração para a **estrutura de navegação e publicação**: [SEL5917](https://marofe.github.io/estimation-identification-filtering/), Prof. Marcos Rogério Fernandes.
- Os textos, exemplos numéricos e implementações iniciais deste pacote foram redigidos para este projeto; não houve reprodução integral dos slides da disciplina de referência.
- **Licença do conteúdo:** ainda não definida. Escolha expressamente a licença de distribuição antes de publicar material sob um regime de reutilização aberta (por exemplo, CC BY 4.0 para conteúdo; MIT para código, se desejado).
