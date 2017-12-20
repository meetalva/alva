# Welcome contributors to Alva
First of all, we'd love for you to contribute to our source code.

# Code of Conduct
We belive in a welcoming and inclusive environment / community, that's why we enforce our Code of Conduct.
For more information -> [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).


# Table of Contents
# like [Reporting Bugs](#reporting-bugs).

# Short Links to Important Resources:
   * docs: https://github.com/meetalva/alva/wiki
   * bugs / issues: https://github.com/meetalva/alva/issues
   * sprint board: https://github.com/meetalva/alva/projects/2
   * backlog: https://github.com/meetalva/alva/projects/3
   * comms: forum link, developer list, IRC/email


# @todoDoc Testing
how to test the project?, where the tests are located in directories?


## Setup for contributers
To add a contribution to Alva (improve its features, fix issues),
get the source of both the application itself,
and the kickstart styleguide (designkit):

* Clone this repository [alva](https://github.com/meetalva/alva): git@github.com:meetalva/alva.git
* Clone [designkit](https://github.com/meetalva/designkit) repository: git@github.com:meetalva/designkit.git
* Run in the designkit repository:
```shell
npm i && npm run build
```
* Run in the main (Alva) respository:
```shell
npm i && npm start
```

## @todoDoc How to submit changes
Pull Request protocol etc.


## @todoDoc How to report a bug
Explain how to report a bug, what should contributer tell us? do we have a "debug" mode or tips for debugging?

## Templates
* create a template for bug issues
* create a template for featue issues


## Good first issue for Contributors
A good first contribution issue could be
* reporting a bug
* create a feature request
* work on an issue with the label *good first issue*


## How to request an "enhancement"
- enhancements are features that you might like to suggest to a project, but aren't necessarily bugs/problems with the existing code; there is a "label" for enhancments in Github's Issues (where you report bugs), so you can tag issues as "enhancement," and thereby allow contributors to prioritize issues/bugs reported to the project. See Atom's example section.

## Issues
### Labels
- *good first issue* - if you are new to *Alva* or open source this could be a good first issue
- *help wanted* - issue where we need help
- *type: bug* - issue for an error/ failure of Alva
- *type: feature* - issue for feature request
- *type: design* - issue for a design todo
- *type: documentation* - issue for needed, missing or unclear documentation
- *status: in progress* - issue is currently in progress
- *status: has PR* - issue has already an open pull request
- *priority: low* - issue which is a nice to have, like a backlog issue
- *priority: mid* - issue needed in the near future, but not super urgent
- *priority: high* - issue must be resolved as soon as possible

### Working on issues
Issues should be provided as branches starting with "feat/", as pull requests.



## Style Guide / Coding conventions
### Coding conventions & guidelines
#### TSC & TSLint
We use strict TSC and TSLint rules, as well as Prettier. When it comes to naming things, we follow the [TypeScript guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines), and we do not abbreviate names (except for trivial names like HTML).

#### We use .editorconfig
Editorconfig helps developers define and maintain consistent coding styles between different editors and IDEs.
There are a lot of plugins for editors/IDEs that support .editorconfig.

You'll find more informations, extentions for editors and IDEs at the [editorconfig page](http://editorconfig.org/).

### commit messages
For commit message we use the angular [commit guidelines](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)
#### commitizen & commitlint
https://github.com/marionebl/commitlint
https://github.com/commitizen/cz-cli


# @todoDoc not sure where to put this - anyone any ideas?
We are not using webpack as a build tool, as this prevents the Electron app from requiring external components like the styleguide patterns.


## Team
* Alexander Peschel
* Julius Walther
* Lasse Küchler
* Markus Ölhafen
* Tilman Frick
* Thomas Jacob


## Questions?
Just drop us an [email](alva@sinnerschrader.com), write us a direct message on Twitter [@meetalva](https://twitter.com/meetalva) or write an issue with the label "question"
