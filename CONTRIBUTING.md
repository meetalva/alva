# Welcome contributors to Alva

💓 First of all, we'd love for you to contribute to our source code. 💓

## Code of Conduct

We believe in a welcoming and inclusive environment / community, that's why we enforce our Code of Conduct.
For more information -> [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

## Table of Contents

* [Link collection](#short-collection-of-links-to-important-resources)
* [Setup for contributors](#setup-for-contributors)
* [Issues](#issues)
  * [Good first issue for Contributors](#good-first-issue)
  * [Label structure](#labels)
  * [Working on issues](#working-on-issues)
* [Style Guide / Coding conventions](#style-guide--coding-conventions)
  * [Coding conventions & guidelines](#coding-conventions--guidelines)

## Short collection of Links to Important Resources

* bugs / feature requests: https://github.com/meetalva/alva/issues
* website: https://meetalva.io
* sprint board: https://github.com/meetalva/alva/projects/2
* backlog board: https://github.com/meetalva/alva/projects/3

## Setup for contributors

To add a contribution to Alva (improve its features, fix issues),
get the source of the application itself, and if you don´t already have a Alva compatible styleguide, the kickstart styleguide (designkit):

1. Clone the [alva](https://github.com/meetalva/alva) repository:

```shell
git clone git@github.com:meetalva/alva.git
```

2. Run in the main (Alva) repository:

```shell
npm i && npm start
```

3. Now open a compatible styleguide.

If you don´t have any, follow the next steps:

1. Clone the [designkit](https://github.com/meetalva/designkit) repository:

```shell
git clone git@github.com:meetalva/designkit.git
```

2. Run this command to build the designkit for Alva:

```shell
npm i && npm build
```

3. Now you should be able to open the designkit inside Alva

## Typedoc

To generate a Typedoc documentation of all classes, run

```
npm run docs
```

then open [build/docs/globals.html](build/docs/globals.html) in your browser.

## Issues

### Good first issue

A good first issues for contribution could be

* reporting a bug
* create a feature request
* work on an issue with the label _good first issue_

### Labels

* _good first issue_ - if you are new to _Alva_ or open source this could be a good first issue
* _help wanted_ - issue where we need help
* _type: bug_ - issue for an error/ failure of Alva
* _type: feature_ - issue for feature request
* _type: design_ - issue for a design todo
* _type: documentation_ - issue for needed, missing or unclear documentation
* _type: feedback_ - issue for feedback and task where we need to figure out if it's a bug or we want it as a feature (or something else)
* _type: question_ - issue for open question (most of the time, they need to be answered by core team)
* _status: in progress_ - issue is currently in progress
* _status: has PR_ - issue has already an open pull request
* _priority: low_ - issue which is a nice to have, like a backlog issue
* _priority: mid_ - issue needed in the near future, but not super urgent
* _priority: high_ - issue must be resolved as soon as possible

### Working on issues

Issues should be provided as branches starting with "feat/", as pull requests.

## Coding conventions & guidelines

### TypeScript & TSLint

We use strict tsconfig and TSLint rules, as well as Prettier. When it comes to naming things, we follow the [TypeScript guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines), and we do not abbreviate names (except for trivial names like HTML).

### We use .editorconfig

Editorconfig helps developers define and maintain consistent coding styles between different editors and IDEs.
There are a lot of plugins for editors/IDEs that support .editorconfig.

You'll find more information, extensions for editors and IDEs at the [editorconfig page](http://editorconfig.org/).

## Commit message conventions

For commit message we use the [angular commit guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)

### commitizen & commitlint

https://github.com/marionebl/commitlint
https://github.com/commitizen/cz-cli

## Team

* Alexander Peschel
* Julius Walther
* Lasse Küchler
* Markus Ölhafen
* Tilman Frick
* Thomas Jacob

## Questions?

Just drop us an [email](alva@sinnerschrader.com) or write a direct message on Twitter to [@meetalva](https://twitter.com/meetalva)
