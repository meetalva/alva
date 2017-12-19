# Meet Alva

We enable cross-functional teams to design contextual digital experiences and code-based ecosystems.

Alva is a design tool that works with your production frontend components, adding up-to-date,
responsive, and interactive designs to your living styleguide.

You can start with a minimal set of components to sketch concepts like wireframes and do fast
iterations with your development team to create and enrich components, from atoms to modules and
entire pages and a full-featured styleguide. But you can also add Alva designs to existing style
guides.

Alva focuses on the arrangement and content editing of pages, while it leaves the implementation
of the components to the developers, providing a single source of truth for both.

There is no such thing as out-dated and static PNG screens, as the current version of both the
design models and the component implementation always render to up-to-date web pages instead.

## Installation and usage

Please follow the installation and usage guidelines matching your purpose for Alva.

### As a designer

[Download](https://github.com/meetalva/alva/releases) the pre-built release of Alva.

If you want to get familiar with Alva and work with the kickstart wireframe styleguide, that's all you need.

If you want to work on a production styleguide, together with your developers team, you also need to clone that repository from git, and build it according to their instructions.

Either way, after the download and installation, start Alva and choose "Open Styleguide" to get started.

### As a pattern developer

Also [download](https://github.com/meetalva/alva/releases) the pre-built release of Alva.

Alva requires a styleguide project containing compiled React components in a folder named
`lib/patterns`.

Each pattern must provide an index.d.ts and an index.js, to get both meta-data and the
implementation of each pattern.

Below `lib/patterns`, you may structure your styleguide as you like (e.g. using
`atoms`/`molecules`/`modules`, or any other type of structure).

[Patternplate](https://github.com/sinnerschrader/patternplate) fulfills these requirements.

For more information about Alva's current requirements regarding styleguide patterns, and the abilities to provide meta-data, see [Pattern requirements and configuration](#pattern-requirements-and-configuration).

Inside the styleguide, Alva creates a new folder name `alva`, putting projects and pages into
subfolders.

Instruct the designer team on how to add, commit, and push these files. The styleguide repository is your common base of interchange. You should both work on the same feature branches and integrate frequently. For example, let the designer add a place-holder element into a page, and then you replace it by an actual new pattern. This is a minimal and quick design-development roundtrip.

You can find an example patterglate styleguide with Alva designs at
https://github.com/meetalva/designkit.

### As a contributor to Alva

To add a contribution to Alva (improve its features, fix issues), get the source of both the application itself, and the kickstart styleguide (designkit):

* Clone this repository.
* Clone the designkit repository (git@github.com:meetalva/designkit.git)
* Run "npm i" and "npm run build" in the designkit repository
* Run "npm i" and "npm start" in the main (Alva) repository

Feel free to dive in! Open an [issue](https://github.com/meetalva/alva/issues/new) or submit a
[Pull Request](https://github.com/meetalva/alva/compare). ❤️

Alva follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

Issues should be provided as branches starting with "feat/", as merge requests.

We use strict TSC and TSLint rules, as well as Prettier. When naming things, we follow the [TypeScript guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines), and we do not abbreviate names (except for trivial names like HTML).

We are not using webpack as a build tool, as this prevents the Electron app from requiring external components like the styleguide patterns.

## Pattern requirements and configuration

Alva tries hard to understand the structure of your styleguide, including the pattern folders, patterns, and properties.

However, currently, only TypeScript React pattern components are supported.

The pattern parser expects directories in the following structure:

* A directory named `lib` at styleguide top-level, and inside, a directory `patterns`.
* Inside that, optionally, a directory per pattern folder (maybe even nested)
* Finally inside that, a directory per pattern

Each pattern directory must have an `index.js` and an `index.d.ts` file, containing the implementation, and the typings.

The pattern implementations must be default exports.

Each pattern typing must have a props interface with the same name as the pattern, plus `Props`.

Each property must be of one of the following types:

* string
* string[]
* number
* number[]
* boolean
* enum (with a TypeScript enum type declared in the same file)

All other properties are ignored for now.

Properties may be optional ("`?`"), and Alva considers that. Additionally, you may add JSDoc annotations to signal meta-data:

* @name to override the human-friendly name
* @default to provide an initial value for Alva
* @hidden to hide the property from Alva

Examples:

```
/**
 * @name Button text
 * @default Click me!
 */
buttonText: string;
```

```
/**
 * @hidden
 */
className?: string;
```

You can also specify the @name annotation on enum members, and you can add it to the props interface to rename the entire pattern.

## Source-code structure and architecture

Alva is a React application using MobX as state management and Electron to provide a stand-alone application.

Additionally, it ships with a living styleguide project, with consists of Patternplate React components.

All the source of Alva is located at `src`, divided into the following folders:

* **components**: All React components for the project, page, page-element, and property panes, as well as the design preview in the middle of the page. Components may be smart (they may contain their own state), but only as long as the state is nothing global, related to multiple componnets, or fundamental enough. In this case, the state is maintained by the store (see below).
* **electron**: The bootstrap code to start the Electron App, including the container HTML, and the main menu.
* **lsg**: The styled components Alva uses, as a living styleguide. Do not mixup this styleguide with the designkit (with also is a styleguide). The LSG are the styled, data-logic-less components used by the Alva UI. The designkit is the patterns the designer uses to create a basic design (wireframes).
* **resources**: Resources are files related to the build, like the icons.
* **store**: The store is the data-center and business logic of Alva. The model. The store is a collection of MobX observables and does not contain any UI elements like React components. Instead, all components bind their props to this store by decorating with @observer.

## Next features

[See Issues](https://github.com/meetalva/alva/issues?q=is%3Aopen+is%3Aissue)

---

Copyright 2017. Released under the MIT license.
