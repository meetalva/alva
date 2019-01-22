# unipm

🚧 **WIP**: Don't use this yet

> **uni**versal **p**ackage **m**anager

A package manager that works in the browser and npm

## Usage

```ts
import * as Fs from 'fs';
import * as unipm from 'unipm';

await unipm.install('react@16.7.0', { fs });
```

## Roadmap

* [x] Fetch from public npm packages
* [ ] Hoist and optimize dependency tree
* [ ] Fetch from git remotes
* [ ] Fetch from private npm packages

