# tree-sitter-heta

[![CI](https://github.com/hetalang/tree-sitter-heta/actions/workflows/ci.yml/badge.svg)](https://github.com/hetalang/tree-sitter-heta/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

Tree-sitter grammar for the Heta modeling language.

This package is aimed at editor support: syntax highlighting, bracket matching,
indentation, and structural navigation.

## Related projects

- [heta-parser](https://github.com/hetalang/heta-parser) - reference parser and grammar source
- [zed-heta](https://github.com/hetalang/zed-heta) - Zed editor support for Heta

## References

- Heta syntax specification: https://hetalang.github.io/specifications/syntax.html

## Development

```sh
npm install
npm run generate
npm test
```
