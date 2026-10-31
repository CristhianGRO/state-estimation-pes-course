const assert=require('node:assert/strict');
const math=require('../assets/js/math.js');
const cases=[String.raw`\begin{bmatrix}-25&0\\25&0\\0&-20\end{bmatrix}`,String.raw`\begin{cases}u^2,&|u|\le c\\c|u|,&|u|>c\end{cases}`,String.raw`x_{k|k-1},\quad\operatorname{rank}(H)<n`,String.raw`\{F_1,F_2\}\subsetneq M`];
for(const text of cases){const token=math.extensions()[0].tokenizer('$$'+text+'$$\n');assert.equal(token.text,text);assert.equal(token.raw,'$$'+text+'$$\n');}
const inline=math.extensions()[1].tokenizer(String.raw`$x_{k|k-1}\in\mathbb R^n$ remaining text`);
assert.equal(inline.text,String.raw`x_{k|k-1}\in\mathbb R^n`);
assert.ok(!math.extensions()[1].tokenizer('$$x$$'));
console.log('TeX tokens preserve matrix rows, cases, braces, inequalities, and subscripts.');
