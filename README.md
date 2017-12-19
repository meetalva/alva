# Meet Alva

We enable cross-functional teams to design contextual digital experiences and code-based ecosystems.

Alva is a design tool that works with your production frontend components, adding up-to-date,
responsive, and interactive designs to your living style guide.

You can start with a minimal set of components to sketch concepts and do fast
iterations with your development team to create and enrich components, from atoms to modules and
entire pages and a full-featured style guide. But you can also add Alva designs to existing style
guides.

Alva focuses on the arrangement and content editing of pages, while it leaves the implementation
of the components to the developers, providing a single source of truth for both.

There is no such thing as out-dated and static PNG screens, as the current version of both the
design models and the component implementation always render to up-to-date web pages instead.

Read more about alva at [meetalva.io](https://meetalva.io)

## Requirements

Alva requires a style guide project containing compiled React components in a folder named
'lib/patterns'.

Each pattern must provide an index.d.ts and an index.js, to get both meta-data and the
implementation of each pattern.

Below 'lib/patterns', you may structure your style guide as you like (e.g. using
'atoms'/'molecules'/'modules', or any other type of structure).

[Patternplate](https://github.com/sinnerschrader/patternplate) fulfills these requirements.

Inside the style guide, Alva creates a new folder name 'alva', putting projects and pages into
subfolders.

You can find an example patterglate style guide with Alva designs at
https://github.com/meetalva/designkit.

## Source based installation

```shell
# Clone this repository
$ git clone https://github.com/meetalva/alva.git

# Go into the repository
$ cd alva

# Install dependencies
$ npm install

# Run alva
$ npm start
```
Use the [exemplary UI Kit](https://github.com/meetalva/designkit) to showcase the possibilities of Alva.

## Download

You can [download](https://github.com/meetalva/alva/releases/) the latest release of Alva for Windows, macOS and Linux.

## Notes

We are not using webpack as a build tool, as this prevents the Electron app from requiring external
components like the style guide patterns.

## Next features

[See Issues](https://github.com/meetalva/alva/issues?q=is%3Aopen+is%3Aissue)

## Contribute

Feel free to dive in! Open an [issue](https://github.com/meetalva/alva/issues/new) or submit a
[Pull Request](https://github.com/meetalva/alva/compare). ❤️

Alva follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

---

Copyright 2017. Released under the MIT license.
