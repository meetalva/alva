<h1 align="center">Meet Alva</h1>
<p align="center">Alva is a radically new digital design tool built for cross-functional product teams.</p>
<p align="center">https://meetalva.io</p>
<br /><br />
<img src="https://meetalva.io/assets/images/application.png">

Alva works with your production frontend components, adding up-to-date, responsive, and interactive designs to your living styleguide.

You can start with a minimal set of components to sketch concepts and do fast iterations with your development team to create and enrich components, from atoms to modules and entire pages and a full-featured styleguide. But you can also add Alva designs to existing style
guides.

Alva focuses on the arrangement and content editing of pages, while it leaves the implementation of the components to the developers, providing a single source of truth for both.

There is no such thing as out-dated and static PNG screens, as the current version of both the design models and the component implementation always render to up-to-date web pages instead.

* [Installation and usage](#installation-and-usage)
  * [As a designer](#as-a-designer)
  * [As a pattern developer](#as-a-pattern-developer)
  * [As a contributor to Alva](#as-a-contributor-to-alva)
  * [Pattern requirements and configuration](#pattern-requirements-and-configuration)
  * [Source-code structure and architecture](#source-code-structure-and-architecture)
* [Next features](#next-features)

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

Each pattern must provide an index.d.ts and an index.js, to get both meta-data and the implementation of each pattern.

Below `lib/patterns`, you may structure your styleguide as you like (e.g. using
`atoms`/`molecules`/`modules`, or any other type of structure).

[Patternplate](https://github.com/sinnerschrader/patternplate) fulfills these requirements.

For more information about Alva's current requirements regarding styleguide patterns, and the abilities to provide meta-data, see [Pattern requirements and configuration](#pattern-requirements-and-configuration).

Inside the styleguide, Alva creates a new folder name `alva`, putting projects and pages into subfolders.

Instruct the designer team on how to add, commit, and push these files. The styleguide repository is your common base of interchange. You should both work on the same feature branches and integrate frequently. For example, let the designer add a place-holder element into a page, and then you replace it by an actual new pattern. This is a minimal and quick design-development roundtrip.

You can find an example patterglate styleguide with Alva designs at https://github.com/meetalva/designkit.

### As a contributor to Alva

Please read our [contributing guidelines](https://github.com/meetalva/alva/blob/master/CONTRIBUTING.md#Setup-for-contributers). There you will find also the setup for contributors.

### Pattern requirements and configuration

Alva tries hard to understand the structure of your styleguide, including the pattern folders, patterns, and properties.

However, currently, only TypeScript React pattern components are supported.

The pattern analyzer expects directories in the following structure:

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

```javascript
/**
 * @name Button text
 * @default Click me!
 */
buttonText: string;
```

```javascript
/**
 * @hidden
 */
className?: string;
```

You can also specify the @name annotation on enum members, and you can add it to the props interface to rename the entire pattern.

### Styleguide analyzers ###

Alva tries to understand the structure of your styleguide, including the pattern folders, patterns, and properties, by delegating to so-called styleguide analyzers.

In the future, there will be several analyzers for all types of
* frontend technologies like [React](https://reactjs.org/), [Angular](https://angular.io/), and [Vue](https://vuejs.org/),
* pattern systems like [Patternplate](https://github.com/patternplate) and [Storybook](https://storybook.js.org/), and
* languages like [TypeScript](https://www.typescriptlang.org/) and plain JavaScript.

The analyzer is also responsible for rendering page elements into the preview, as it is the type of object that knows the frontend technology.

Currently we only have a [TypeScript React analyzer](./src/styleguide-analyzer/typescript-react-analyzer/typescript-react-analyzer.ts) with no extra intelligence for pattern systems.

If you want to build your own, you have to implement a class similar to that analyzer, implementing an `analyze` and a `render` method. You have to create a new directory inside `src/styleguide-analyzer` with the kebab-case name of your analyzer. Then, put a `.ts` file into that folder, with the same name. The file must export a class named `Analyzer`, extending `StyleguideAnalyzer` (or one of its subclasses).

If you create an analyzer named 'my-analyzer', there whould be a file `src/styleguide-analyzer/my-analyzer/my-analyzer.ts` with the following content:

```javascript
import { HighlightElementFunction } from '../../component/preview';
import { Store } from '../../store/store';
import { Styleguide } from '../../store/styleguide/styleguide';
import { StyleguideAnalyzer } from '../styleguide-analyzer';

export class Analyzer extends StyleguideAnalyzer {
	/**
	 * @inheritdoc
	 */
	public analyze(styleguide: Styleguide): void {
		// TODO: Implement me.
	}

	/**
	 * @inheritdoc
	 */
	public render(store: Store, highlightElement: HighlightElementFunction): void {
		// TODO: Implement me.
	}
}
```

#### Pattern analysis

The implementation of `analyze` should use the provided path as a starting point to find pattern folders and patterns. For each folder, instantiate a `PatternFolder` object like this:

```javascript
new PatternFolder(name, parent)
```

where `name` is the human friendly name of that folder, and `parent` is the styleguide's `getPatternRoot()` (for top-level folders), or a previously created parent folder (or nested folders). Maybe implement a folder recursion if you want to support nesting.

For each pattern, locate the implementation (to be `require`d when rendering), its export name if it is not the default, and maybe an icon file. Also generate a stable ID for the pattern, e.g. by using the pattern system's ID metadata (or the file path, if not available). Then create a `Pattern` object like this:

```javascript
const pattern = new Pattern(id, name, implementationPath, exportName);
pattern.setIconPath(iconPath);
```

Next, add properties to the pattern by scanning the TypeScript types, reading pattern system metadata, etc. For each property, instantiate one of the `Property` subclasses, and add the property to the pattern, e.g.:

```javascript
const property = new StringProperty(id);
property.setRequired(required);
pattern.addProperty(property);
```

Finally, add the pattern to the styleguide, and optionally to one or more pattern folders:

```javascript
folder.addPattern(pattern);
styleguide.addPattern(pattern);
```
#### Rendering

In the render method of the styleguide analyzer, your task is to output a component that displays the preview of the currently edited page (see `store.getCurrentPage()`).

You have to iterate recursively over the page elements, and build property data objects for each element. See the TypeScript React analyzer's `createComponent` method for an example.

Then `require` the implementation path and run the exported function with that data.

#### Select your new analyzer

After having created a new styleguide analyzer, put its name into your styleguide's `alva.yaml` as top-level `analyzerName` property:

```javascript
analyzerName: my-analyzer
```

## Next features

See [issues](https://github.com/meetalva/alva/issues?q=is%3Aopen+is%3Aissue) or our [backlog](https://github.com/meetalva/alva/projects/3).

---

Feel free to dive in! Open an [issue](https://github.com/meetalva/alva/issues/new), submit a
[Pull Request](https://github.com/meetalva/alva/compare) or let’s discuss what should be next. ❤️

Alva follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

---

Proudly powered by [SinnerSchrader](https://github.com/sinnerschrader).

Copyright 2017-2018. Released under the MIT license.

[![Greenkeeper badge](https://badges.greenkeeper.io/meetalva/alva.svg)](https://greenkeeper.io/)
