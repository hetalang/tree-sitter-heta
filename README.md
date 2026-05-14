# tree-sitter-heta

Tree-sitter grammar for the Heta modeling language.

This grammar is built for editor support first: syntax highlighting, bracket
matching, indentation, and navigation. It follows the public Heta syntax and
the official PEG.js parser structure, while keeping expression parsing practical
for incremental editing.

Useful references:

- https://hetalang.github.io/specifications/syntax.html
- https://github.com/hetalang/heta-parser/blob/master/src/pegjs/heta.pegjs

## Development

```sh
npm install
npm run generate
npm test
```

