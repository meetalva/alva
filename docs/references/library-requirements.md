---
tags:
  - reference
---

# Pattern Library

Pattern libraries are a cornerstone of Alva workflows: They allow you to implement anything that
works on the web and make it accessible to everyone on your team. 

As such it is important you understand the assumptions Alva makes concerning pattern libraries.
See the full list below. A production-level example of an Alva-enabled pattern library it the [Alva Designkit](https://github.com/meetalva/designkit/)
which is openly available on GitHub.

## Requirements

- Contains a `package.json`
- **Implementation Entry**: Specifies an `alva:main` / `main` field in `package.json` or contains an `index.js` file
- **Interface Entry**: Specifies `typings` in `package.json` or contains an `.d.ts` file with the same basename as the provided implementation entry. E.g. if the implementation entry is `lib/my-lib.js`, the typings are assumed to be at `lib/my-lib.d.ts`
- **Implementation Exports**: All components that should be usable in Alva are (re)exported from the implementation entry.
They are implemented in React.
- **Browser Compatibility**: The exported code uses only APIs that are available in browsers.


## Analyzer Algorithm

Alvas static analyzer follows a set of steps and rules when reading your pattern library.

## 1. Read meta data
- 1. Read and parse `package.json` as JSON

## 2. Find Implementation Entry
- 2. a) Has `.alva:main` field: Use as JavaScript 
- 2. b) Has no `.alva:main`, but `.main` field: Use as JavaScript 
- 2. c) Has neither `.alva:main`,  nor `.main` field: Use `index.js` as JavaScript

##  3. Find Interface Entry
- 3. a) Has `.alva:typings` field: Use as TypeScript
- 3. b) Has `.typings` field: Use as TypeScript
- 3. c) Has `.alva:main`. Use `.d.ts` file with same basename (`some/path/lib.js` => `some/path/lib.d.ts`)
- 3. d) Has `.main`. Use `.d.ts` file with same basename
- 3. e) None of the above: Use `index.d.ts`
