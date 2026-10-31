# State Estimation in Electric Power Systems

An English-language graduate course based on the 2024 teaching materials of Prof. João Bosco A. London Junior, EESC, University of São Paulo. The thirteen lessons connect real-time monitoring, static estimation, measurement planning, robust methods, and dynamic state estimation.

Computational Analysis of Electric Power Systems Laboratory · EESC–USP.

## Course organization

The twelve numbered lessons retain their original sequence. Lesson 13 adapts the separate dynamic-estimation lecture by Dr. Julio A. D. Massignan and Prof. João Bosco A. London Junior, delivered on 3 December 2024.

Every presentation contains theory and worked examples, references, a laboratory guide where applicable, and the interactive laboratory as its final slide. There are no screenshots or reproductions of the original teaching slides. Figures are original SVG illustrations, and equations remain editable LaTeX in Markdown.

| Lesson | Topic | Laboratory basis |
|---|---|---|
| 1 | Introduction and real-time operation | Theory |
| 2 | Power flow and topology processing | Assignment 1 discussion |
| 3 | Statistics and linear WLS | Assignment 2, Exercise 1 |
| 4 | Linear bad-data processing | Assignment 3, Exercise 1 |
| 5 | Nonlinear WLS, decoupling, and UI | Assignment 6, Exercise 1 |
| 6 | Observability and restoration | Assignment 2 measurement plan |
| 7 | Observability methods and redundancy | Assignment 2 measurement plan |
| 8 | Criticality and local redundancy | Transformed matrix from Lesson 8 |
| 9 | PMUs and measurement-set updates | Explicit PMU extension of Assignment 2 |
| 10 | Generalized and parameter estimation | Theory and interpretation exercise |
| 11 | Distribution and demand estimation | Demand-refinement example defined in the lesson |
| 12 | Robust and multi-area estimation | Huber extension of Assignment 2 |
| 13 | Dynamic estimation | Three-bus Kalman tracking extension of the source lecture |

The website, lessons, illustrations, controls, and numerical output are in English. Downloadable original assignment documents remain in Portuguese and are explicitly labeled. Bibliographic source titles retain their original names for traceability.

## Run locally

Use Python 3 with no third-party packages for the normal build:

```powershell
python -X utf8 tools/build.py
python -X utf8 tools/validate.py
python -m http.server 8000 --directory docs
```

Open [the local website](http://localhost:8000/). Serve the pages over HTTP; opening lesson HTML directly through `file://` prevents external Markdown loading in many browsers. Reveal.js, KaTeX, and fonts are loaded from pinned CDN URLs and require an internet connection.

On Windows, `py` can replace `python`. UTF-8 mode avoids console-encoding problems. The incremental builder preserves unchanged files and retries temporary OneDrive locks. It does not delete the `docs/` directory.

## Edit the course

- `curso.json`: course metadata, ordered lesson catalog, laboratory selection, and release flags.
- `conteudo/NN-name.md`: authoritative, editable lesson content.
- `componentes/`: laboratory HTML fragments.
- `assets/js/labs-disciplina.js`: assignment-linked numerical methods and controls.
- `assets/js/wls-ca.js`: coupled AC WLS experiment.
- `assets/js/dynamic.js`: reproducible Kalman tracking experiment.
- `assets/js/math.js`: TeX-aware Markdown tokenization and explicit KaTeX rendering.
- `assets/figuras/`: original vector illustrations.
- `templates/`: shared homepage and presentation templates.
- `docs/`: generated site; rebuild instead of editing these files directly.

Separate slides with `---`. Write inline math between single dollar signs and display math between double dollar signs. Use ordinary LaTeX matrix row separators and subscripts: do not double-escape equations to work around Markdown. The custom tokenizer protects TeX before Markdown processes backslashes, underscores, braces, or HTML-sensitive characters. Failed formulas remain visible and are reported in the browser console.

Inside Markdown tables, use `\lvert`/`\rvert` for absolute-value bars and `\mid` for conditional notation: bare pipes are Markdown column separators. The validator flags this conflict.

Speaker notes begin with `Note:`. Keep laboratory guidance after the theory; the selected component is automatically appended as the final slide. The validator checks that the laboratory is last.

For a new lesson, create its Markdown, add its catalog entry, and update the source/section inventory. A `published: false` lesson has a visible coming-soon card without publishing its HTML or Markdown. This controls the generated website, not access to source files in a public repository or Git history.

To add a laboratory, first define the equations, data, assumptions, and reference results in the lesson. Create its component, implement a pure numerical core and a mounting function, register loading in `assets/js/slides.js`, and add independent numerical checks.

## Sources and original materials

External teaching materials are read only. All project changes stay inside this repository. `conteudo/fontes-2024.json` records source names and SHA-256 hashes: 28 PDFs, the separate 64-slide dynamic-estimation presentation, and eight original assignments. `tools/plano-disciplina.json` records the lesson order, source patterns, and section headings.

```powershell
python -X utf8 tools/importar_disciplina.py "PATH TO ORIGINAL MATERIALS"
```

This command updates the inventory without rewriting lesson Markdown or publishing original slides. Optional `--extrair-texto` writes consultation text only under ignored `tmp/fontes/`; PDF extraction requires PyMuPDF. PowerPoint text extraction uses Python's standard library.

Regenerate the scripted English illustrations with:

```powershell
python -X utf8 tools/gerar_figuras.py
```

Earlier draft content under `conteudo/complementos/` is not published automatically. Older synthetic demonstration components remain as legacy source and are not loaded by the current presentations.

## Numerical and rendering validation

```powershell
node tools/test_labs_disciplina.cjs
node tools/test_wls_ca.cjs
node tools/test_dynamic.cjs
node tools/test_math.cjs
python -X utf8 -m unittest discover -s tools -p "test_build.py" -v
python -X utf8 tools/validate.py
```

Tests cover assignment reference values, power balances, rank, inclusion-minimal loss sets, local redundancy, measurement recovery, covariance updates, and stationarity. Dynamic tests check the 25% step timing, reproducible Gaussian measurement noise, positive-definite Joseph covariance updates, and an independent information-form cross-check.

The Assignment 3 printed post-removal voltages differ by less than 0.001 V from recalculation using the stated matrix and readings. The lesson documents both. The laboratory solves the stated data rather than forcing agreement with the printed answer.

The AC residual covariance is locally linearized. A normalized-residual threshold of 3 is a teaching choice, not a global significance level. Local-redundancy enumeration is restricted to small examples. The demand laboratory is a lossless aggregate adjustment. The dynamic laboratory is a Pθ tracking model, not a complete electromechanical simulator; its unexpected step deliberately tests transition-model mismatch. Its process covariance scales with sampling interval as Q = qΔtI.

For visual review, inspect representative long equations, matrices, cases, figures, and laboratory controls in the browser. In addition to checking for visible errors, compare each rendered formula's MathML annotation with its preserved `data-tex` source; silent Markdown damage can otherwise escape error-only checks.

## Publishing

The repository includes a GitHub Actions workflow for GitHub Pages. Configure **Settings → Pages → Source → GitHub Actions** and push the reviewed changes. Alternatively, publish the committed `docs/` directory from a branch; rebuild and include generated files for every update. Choose one deployment method.

This update prepares repository content; it does not itself deploy the website.

## Credits

- Course: Prof. João Bosco A. London Junior and collaborators, EESC–USP, 2024.
- Dynamic-estimation lecture: Dr. Julio A. D. Massignan and Prof. João Bosco A. London Junior, 3 December 2024.
- Teaching references: Bretas, London Jr., and Carvalho; Monticelli, *State Estimation in Electric Power Systems* (1999); Abur and Gómez Expósito, *Power System State Estimation: Theory and Implementation* (2004).
- Presentation framework: [Reveal.js](https://revealjs.com/); mathematics: [KaTeX](https://katex.org/). Their own licenses apply.
- Navigation/publication inspiration: [SEL5917](https://marofe.github.io/estimation-identification-filtering/), Prof. Marcos Rogério Fernandes.
- Content license: not yet specified. No new open-content license is assigned by this adaptation.
