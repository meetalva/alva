---
options:
  order: 1
---

# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.7.0"></a>
# [0.7.0](https://github.com/meetalva/alva/compare/v0.6.0...v0.7.0) (2018-03-16)


### Bug Fixes

* **auto-updater:** correct value for progress bar and reset progress bar ([153806c](https://github.com/meetalva/alva/commit/153806c))
* **component:** Fix PatternListContainer unique key error ([26750dd](https://github.com/meetalva/alva/commit/26750dd))
* **component:** prevent app zooming ([bbf7e89](https://github.com/meetalva/alva/commit/bbf7e89))
* **component:** restore old pattern_list rendering behavior ([33bcb9f](https://github.com/meetalva/alva/commit/33bcb9f))
* **dist:** package react typings for distributed design-kit ([#289](https://github.com/meetalva/alva/issues/289)) ([3f4ec49](https://github.com/meetalva/alva/commit/3f4ec49))
* **electron:** use right url for "learn more" menu entry ([#172](https://github.com/meetalva/alva/issues/172)) ([75edbb1](https://github.com/meetalva/alva/commit/75edbb1))
* **lsg:** adjust property item label colors ([#159](https://github.com/meetalva/alva/issues/159)) ([7d7c83e](https://github.com/meetalva/alva/commit/7d7c83e)), closes [#147](https://github.com/meetalva/alva/issues/147)
* **lsg:** apply preview styling on webview element ([e74debf](https://github.com/meetalva/alva/commit/e74debf)), closes [#122](https://github.com/meetalva/alva/issues/122)
* **menu:** also close alva when all windows are hidden ([ee8b5c4](https://github.com/meetalva/alva/commit/ee8b5c4)), closes [#187](https://github.com/meetalva/alva/issues/187)
* **menu:** it is not possible to call toggleDevTools on browserWindow ([928e01c](https://github.com/meetalva/alva/commit/928e01c))
* **menu:** make sure that the page is done resizing before capture ([6bd6acf](https://github.com/meetalva/alva/commit/6bd6acf))
* **menu:** move update check execution in to the main process ([7f8ce94](https://github.com/meetalva/alva/commit/7f8ce94))
* **package:** update electron-updater to version 2.21.0 ([dae637b](https://github.com/meetalva/alva/commit/dae637b))
* **package:** update js-yaml to version 3.11.0 ([#266](https://github.com/meetalva/alva/issues/266)) ([122e071](https://github.com/meetalva/alva/commit/122e071))
* **package:** update mobx-react to version 4.4.3 ([#268](https://github.com/meetalva/alva/issues/268)) ([13c6937](https://github.com/meetalva/alva/commit/13c6937))
* **package:** update readts to version 0.2.0 ([#262](https://github.com/meetalva/alva/issues/262)) ([540ad9e](https://github.com/meetalva/alva/commit/540ad9e))
* **package:** update smoothscroll-polyfill to version 0.4.3 ([cc1d2af](https://github.com/meetalva/alva/commit/cc1d2af)), closes [#259](https://github.com/meetalva/alva/issues/259)
* **package:** update styled-components to version 3.2.0 ([#267](https://github.com/meetalva/alva/issues/267)) ([79a9aea](https://github.com/meetalva/alva/commit/79a9aea))
* **png-export:** longer wait time before screenshot ([dc27989](https://github.com/meetalva/alva/commit/dc27989))
* **preview:** make preview wrapper not absolute to enable page capturing ([79c59a5](https://github.com/meetalva/alva/commit/79c59a5))
* **preview:** stop component from highlighting when only props change ([37b778f](https://github.com/meetalva/alva/commit/37b778f))
* **release:** remove use of unknown dependency ([aa01853](https://github.com/meetalva/alva/commit/aa01853))
* **store:** don't ignore patterns in pattern root folder ([d9ace1a](https://github.com/meetalva/alva/commit/d9ace1a))
* **store:** don't try to save when there is no styleguide ([f9ef1dd](https://github.com/meetalva/alva/commit/f9ef1dd)), closes [#101](https://github.com/meetalva/alva/issues/101)
* **store:** name pattern root after folder on fs ([1b4cb1e](https://github.com/meetalva/alva/commit/1b4cb1e))
* **store:** naming of string-property file in imports ([#211](https://github.com/meetalva/alva/issues/211)) ([5652072](https://github.com/meetalva/alva/commit/5652072))
* **store:** normalize pattern ids across platforms ([#287](https://github.com/meetalva/alva/issues/287)) ([25b939d](https://github.com/meetalva/alva/commit/25b939d))
* **store:** page elements have stable IDs now, fixing UI lists ([55053d3](https://github.com/meetalva/alva/commit/55053d3))
* disable unhandled dragging interaction on main window ([0a0c45b](https://github.com/meetalva/alva/commit/0a0c45b)), closes [#177](https://github.com/meetalva/alva/issues/177)
* **store:** patternId migration path ([c67d58f](https://github.com/meetalva/alva/commit/c67d58f))
* **store:** preview/app race condition when loading a styleguide ([a0786b0](https://github.com/meetalva/alva/commit/a0786b0))
* **store:** re-implement pattern grouping / folders ([49f6bf8](https://github.com/meetalva/alva/commit/49f6bf8))
* **store:** restore pattern icon detection ([037dcc4](https://github.com/meetalva/alva/commit/037dcc4))
* **store:** typescript-react-analyzer respect fs folder structure ([dfd2fde](https://github.com/meetalva/alva/commit/dfd2fde))
* disable svg image dragging in <PatternList> ([44b85ef](https://github.com/meetalva/alva/commit/44b85ef)), closes [#177](https://github.com/meetalva/alva/issues/177)
* disabled drag-and-drop from outside the application ([cf1fe2f](https://github.com/meetalva/alva/commit/cf1fe2f))
* set default linebreak for ts files ([8f83c72](https://github.com/meetalva/alva/commit/8f83c72))


### Features

* **analyzer:** move decision for the renderer in to the analyzers ([1442f51](https://github.com/meetalva/alva/commit/1442f51))
* **auto-updater:** ask user before updating alva ([38c7766](https://github.com/meetalva/alva/commit/38c7766)), closes [#168](https://github.com/meetalva/alva/issues/168)
* **auto-updater:** set progress bar and add to menu ([e024cc4](https://github.com/meetalva/alva/commit/e024cc4)), closes [#84](https://github.com/meetalva/alva/issues/84)
* **config:** add styleguide option for choosing a specific analyzer ([a988121](https://github.com/meetalva/alva/commit/a988121))
* **logo:** new alva logo ([0903f24](https://github.com/meetalva/alva/commit/0903f24))
* **menu:** add context menu for page elements ([a8cd86e](https://github.com/meetalva/alva/commit/a8cd86e)), closes [#111](https://github.com/meetalva/alva/issues/111)
* **menu:** add option to export current page as png ([1c423b6](https://github.com/meetalva/alva/commit/1c423b6)), closes [#71](https://github.com/meetalva/alva/issues/71)
* **menu:** disable specific menu items for splashscreen ([c009cd2](https://github.com/meetalva/alva/commit/c009cd2))
* **menu:** new menuitem that opens settings file in default application ([f8676a7](https://github.com/meetalva/alva/commit/f8676a7)), closes [#195](https://github.com/meetalva/alva/issues/195)
* **page-element:** unique id for each page-element ([79bbb1a](https://github.com/meetalva/alva/commit/79bbb1a))
* **page-list:** page editable w doubleclick on page-item in dropdown ([1736b0b](https://github.com/meetalva/alva/commit/1736b0b))
* **preview:** highlight element on select ([2423a5d](https://github.com/meetalva/alva/commit/2423a5d))
* **preview-pane:** implement resizing of the preview-pane ([5f6e133](https://github.com/meetalva/alva/commit/5f6e133))
* **renderer:** switch between renderers based on analyser type ([a4008df](https://github.com/meetalva/alva/commit/a4008df))
* **splashscreen:** display OS menu ([bd21b62](https://github.com/meetalva/alva/commit/bd21b62))
* **store:** function for selecting element by it’s id ([d2ee04a](https://github.com/meetalva/alva/commit/d2ee04a))
* **store:** new function for converting page names to ids ([cad182b](https://github.com/meetalva/alva/commit/cad182b))
* **store:** new function for renaming pages ([73413d2](https://github.com/meetalva/alva/commit/73413d2))
* add ability to define a custom preview frame html wrapper ([47e1f4d](https://github.com/meetalva/alva/commit/47e1f4d))
* **webview:** disable node-integration for webview ([2d7d75e](https://github.com/meetalva/alva/commit/2d7d75e))
* **window:** minimum app window size ([239d788](https://github.com/meetalva/alva/commit/239d788)), closes [#107](https://github.com/meetalva/alva/issues/107)



<a name="0.6.0"></a>
# [0.6.0](https://github.com/meetalva/alva/compare/v0.5.0...v0.6.0) (2017-12-20)


### Bug Fixes

* pattern and property names: Automatic name guessing, and [@name](https://github.com/name) annotation ([3754a8c](https://github.com/meetalva/alva/commit/3754a8c))
* **build:** electron should now always find the correct js file ([#116](https://github.com/meetalva/alva/issues/116)) ([cd2e76d](https://github.com/meetalva/alva/commit/cd2e76d)), closes [#106](https://github.com/meetalva/alva/issues/106)
* **component:** adjust patternlist spacing ([#105](https://github.com/meetalva/alva/issues/105)) ([ed8d14e](https://github.com/meetalva/alva/commit/ed8d14e))
* **component:** fix pattern list search ([45cc05d](https://github.com/meetalva/alva/commit/45cc05d))
* **lsg:** remove fonts import ([9736df8](https://github.com/meetalva/alva/commit/9736df8))


### Features

* **component:** add error wrapper around preview components ([0325ea6](https://github.com/meetalva/alva/commit/0325ea6))
* **component:** add spacing ([5c52909](https://github.com/meetalva/alva/commit/5c52909))
* **component:** integrate icon in pattern list ([6f6cac1](https://github.com/meetalva/alva/commit/6f6cac1)), closes [#91](https://github.com/meetalva/alva/issues/91)
* **component:** move splash screen from preview to app main section, create styled splash screen ([b559d1b](https://github.com/meetalva/alva/commit/b559d1b))
* **component:** remove edit delete and add from page list ([2b51ee6](https://github.com/meetalva/alva/commit/2b51ee6))
* **component:** remove edit delete and add from project list ([29059da](https://github.com/meetalva/alva/commit/29059da))
* **component/app:** add spacing to page list ([#103](https://github.com/meetalva/alva/issues/103)) ([5df49bc](https://github.com/meetalva/alva/commit/5df49bc))
* **lsg:** add more clickable space to dropdown items ([84de0d1](https://github.com/meetalva/alva/commit/84de0d1))
* **lsg:** add textColor property to headline ([f75189a](https://github.com/meetalva/alva/commit/f75189a))
* **lsg:** adjust pattern list styling ([ff04ed0](https://github.com/meetalva/alva/commit/ff04ed0))
* **lsg:** change fallback pattern icon ([#119](https://github.com/meetalva/alva/issues/119)) ([4b352e4](https://github.com/meetalva/alva/commit/4b352e4))
* **lsg:** introduce button component ([78bd656](https://github.com/meetalva/alva/commit/78bd656))
* **lsg:** introduce copy component ([ed2fc0e](https://github.com/meetalva/alva/commit/ed2fc0e))
* **lsg:** introduce splash screen component ([f8a44aa](https://github.com/meetalva/alva/commit/f8a44aa))
* **lsg:** load external pattern icon as image source, adjust styling ([1642d7b](https://github.com/meetalva/alva/commit/1642d7b)), closes [#91](https://github.com/meetalva/alva/issues/91)
* **lsg:** remove left section from splash screen ([224fa86](https://github.com/meetalva/alva/commit/224fa86))
* **lsg:** remove margin from pattern list items ([c7a6b75](https://github.com/meetalva/alva/commit/c7a6b75))
* **store:** add get pattern icon path ([051990c](https://github.com/meetalva/alva/commit/051990c)), closes [#91](https://github.com/meetalva/alva/issues/91)
* make title property optional ([e6f38bf](https://github.com/meetalva/alva/commit/e6f38bf))


### Reverts

* **component): fix(component:** fix pattern list search, convert pattern name to lowercase ([#102](https://github.com/meetalva/alva/issues/102)) ([867e8d0](https://github.com/meetalva/alva/commit/867e8d0))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/meetalva/alva/compare/v0.4.1...v0.5.0) (2017-12-19)


### Bug Fixes

* **component:** convert search term to lower case ([6d38ede](https://github.com/meetalva/alva/commit/6d38ede))


### Features

* **lsg:** new styling for pattern pane ([19b411e](https://github.com/meetalva/alva/commit/19b411e))
* **menu:** add functionality to also create a folder while selecting a space for the creation of th ([389c098](https://github.com/meetalva/alva/commit/389c098))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/meetalva/alva/compare/v0.4.0...v0.4.1) (2017-12-18)



<a name="0.4.0"></a>
# [0.4.0](https://github.com/meetalva/alva/compare/v0.3.0...v0.4.0) (2017-12-18)


### Bug Fixes

* **component:** completly remove mobx devtools for now ([54970fe](https://github.com/meetalva/alva/commit/54970fe))
* **component:** readd mobx devtools ([3423ec7](https://github.com/meetalva/alva/commit/3423ec7))
* **component:** remove unused const ([a1939b1](https://github.com/meetalva/alva/commit/a1939b1))
* **components:** remove developer tools in production ([813ddd8](https://github.com/meetalva/alva/commit/813ddd8))
* **lsg:** broken intendantion ([2bad46f](https://github.com/meetalva/alva/commit/2bad46f))
* **lsg:** element property update on property patterns ([822b2b2](https://github.com/meetalva/alva/commit/822b2b2)), closes [#57](https://github.com/meetalva/alva/issues/57)
* **store:** clear selected element after element deletion ([5a21e46](https://github.com/meetalva/alva/commit/5a21e46)), closes [#58](https://github.com/meetalva/alva/issues/58)


### Features

* **component:** add direct download link to designkit ([e31dead](https://github.com/meetalva/alva/commit/e31dead))
* **component:** add pattern as next sibling of selected element when clicking on pattern item ([943cc5d](https://github.com/meetalva/alva/commit/943cc5d)), closes [#63](https://github.com/meetalva/alva/issues/63)
* **lsg:** add hover to property items ([2c1d6ee](https://github.com/meetalva/alva/commit/2c1d6ee))
* **lsg:** add styling to property boolean ([0bc168d](https://github.com/meetalva/alva/commit/0bc168d))
* **lsg:** add styling to property enum and add spacing to property items ([590e21b](https://github.com/meetalva/alva/commit/590e21b))
* **lsg:** bigger click-area for open/close icon on page-element ([#62](https://github.com/meetalva/alva/issues/62)) ([b78a347](https://github.com/meetalva/alva/commit/b78a347)), closes [#61](https://github.com/meetalva/alva/issues/61)
* **lsg:** change icon size ([bc0ff66](https://github.com/meetalva/alva/commit/bc0ff66))
* **lsg:** introduce dropdown component ([5c60539](https://github.com/meetalva/alva/commit/5c60539))
* **lsg:** when dragging a pattern only the icon should be visible under the cursor ([c63db83](https://github.com/meetalva/alva/commit/c63db83))
* **menu:** add pasted page-elements as siblings ([602f5c6](https://github.com/meetalva/alva/commit/602f5c6)), closes [#63](https://github.com/meetalva/alva/issues/63)
* **menu:** menu item to create a new copy of the designkit at specific location ([1144b25](https://github.com/meetalva/alva/commit/1144b25))
* **menu:** windows should use delete key for removing patterns ([#77](https://github.com/meetalva/alva/issues/77)) ([26d8e9d](https://github.com/meetalva/alva/commit/26d8e9d))
* **resources:** renew icon ([c56d159](https://github.com/meetalva/alva/commit/c56d159))
* **store:** add new function to add child as sibling to selected element ([c9d373b](https://github.com/meetalva/alva/commit/c9d373b))
* **store:** auto-saving page when switching to another page or styleguide ([1c96caf](https://github.com/meetalva/alva/commit/1c96caf))
* **store:** hiding of properties per meta-data ([0bab560](https://github.com/meetalva/alva/commit/0bab560))
* **store:** open first page of a given project ([3517990](https://github.com/meetalva/alva/commit/3517990))
* **store:** page element ancestry methods for drag-drop checks ([f3c9cd7](https://github.com/meetalva/alva/commit/f3c9cd7))
* **store:** save preference of last opened styleguide and page ([d833658](https://github.com/meetalva/alva/commit/d833658))
* **store:** support for default property values ([da599c8](https://github.com/meetalva/alva/commit/da599c8))
* **update:** add notification when there is a new version and try to auto update ([32c259c](https://github.com/meetalva/alva/commit/32c259c))
* add dropdown to pages, rename visible to open ([5b18a8a](https://github.com/meetalva/alva/commit/5b18a8a))
* add project list dropdown to chrome ([1017ddf](https://github.com/meetalva/alva/commit/1017ddf))
* remove lsg interface from component, make pattern list component independent from list compone ([245df6d](https://github.com/meetalva/alva/commit/245df6d))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/meetalva/alva/compare/v0.2.1...v0.3.0) (2017-12-15)


### Features

* **component:** auto select new created page elements ([92ed1ce](https://github.com/meetalva/alva/commit/92ed1ce))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/meetalva/alva/compare/v0.2.0...v0.2.1) (2017-12-15)



<a name="0.2.0"></a>
# [0.2.0](https://github.com/meetalva/alva/compare/v0.1.1...v0.2.0) (2017-12-15)


### Features

* **menu:** add duplicate function for elements ([0abb6fe](https://github.com/meetalva/alva/commit/0abb6fe))



<a name="0.1.1"></a>

# 0.1.0 (2017-12-15)

### Bug Fixes

* **build:** change order of build scripts ([ea75d12](https://github.com/meetalva/alva/commit/ea75d12))
* **component:** add key for unknown properties ([9635852](https://github.com/meetalva/alva/commit/9635852))
* **component:** changes green colors to black ([8f82f50](https://github.com/meetalva/alva/commit/8f82f50))
* **component:** correct preview pane size ([1adcfb1](https://github.com/meetalva/alva/commit/1adcfb1))
* **component:** default import for layout pattern ([a105812](https://github.com/meetalva/alva/commit/a105812))
* **component:** disable child grow in element pane ([2b99f8a](https://github.com/meetalva/alva/commit/2b99f8a))
* **component:** move app components in correct order again ([ddbf346](https://github.com/meetalva/alva/commit/ddbf346))
* **component:** move iconRegistry before the PreviewPane to have the css be overridden ([c451588](https://github.com/meetalva/alva/commit/c451588))
* **component:** only render elementlist children if there are some ([02a7cf7](https://github.com/meetalva/alva/commit/02a7cf7))
* **component:** remove styles from component area ([b380180](https://github.com/meetalva/alva/commit/b380180))
* **component:** remove unused active from pattern list item ([39ad0e9](https://github.com/meetalva/alva/commit/39ad0e9))
* **component:** reorder components to fix a styledcomponents problem with multiple sources ([757a6bd](https://github.com/meetalva/alva/commit/757a6bd))
* **components:** improve welcome message ([cfb4f86](https://github.com/meetalva/alva/commit/cfb4f86))
* **container:** add missing interface for list pattenr ([d9238c8](https://github.com/meetalva/alva/commit/d9238c8))
* **lsg:** adjust list styles, fix demo ([d0cdbf0](https://github.com/meetalva/alva/commit/d0cdbf0))
* **lsg:** broken indentation and missing interface ([a90f70c](https://github.com/meetalva/alva/commit/a90f70c))
* **lsg:** change component export to default ([014c83a](https://github.com/meetalva/alva/commit/014c83a))
* **lsg:** correct spacings and icon sizes for element pattern ([5eb8e60](https://github.com/meetalva/alva/commit/5eb8e60))
* **lsg:** correct use of onDragStart event ([eeb88ca](https://github.com/meetalva/alva/commit/eeb88ca))
* **lsg:** drag option on li items ([23d3bec](https://github.com/meetalva/alva/commit/23d3bec))
* **lsg:** export list child components as class ([5fc7f79](https://github.com/meetalva/alva/commit/5fc7f79))
* **lsg:** import default from layout ([ef5aa78](https://github.com/meetalva/alva/commit/ef5aa78))
* **lsg:** remove blind spreading of operators ([b589898](https://github.com/meetalva/alva/commit/b589898))
* **lsg:** remove z-index from elements, clean up patterns ([f699040](https://github.com/meetalva/alva/commit/f699040))
* **lsg:** use getSpace function ([985be31](https://github.com/meetalva/alva/commit/985be31))
* **lsg:** use valid color variables ([16ae192](https://github.com/meetalva/alva/commit/16ae192))
* **menu:** rename open-styleguide item, no hard-coded page ID ([2be9a05](https://github.com/meetalva/alva/commit/2be9a05))
* **resources:** change icns icon ([0283659](https://github.com/meetalva/alva/commit/0283659))
* **store:** enum property type ordinals ([add169f](https://github.com/meetalva/alva/commit/add169f))
* **store:** failed to load page ([e342099](https://github.com/meetalva/alva/commit/e342099))
* **store:** observe patternRoot ([c0cbacf](https://github.com/meetalva/alva/commit/c0cbacf))
* set global app styles ([c647727](https://github.com/meetalva/alva/commit/c647727))
* **store:** return template string ([aed24f1](https://github.com/meetalva/alva/commit/aed24f1))
* **store:** use children directly instead of getChildren ([dc58f25](https://github.com/meetalva/alva/commit/dc58f25))
* **store/preview:** auto-state update ([8633cd2](https://github.com/meetalva/alva/commit/8633cd2))

### Features

* add ability to open a project ([0f522b2](https://github.com/meetalva/alva/commit/0f522b2))
* add drag and drop to element-list elements ([3996f36](https://github.com/meetalva/alva/commit/3996f36))
* add spacing, remove title from pattern list ([6474212](https://github.com/meetalva/alva/commit/6474212))
* add styling ([26ab28e](https://github.com/meetalva/alva/commit/26ab28e))
* change margin to padding ([f4f1fbf](https://github.com/meetalva/alva/commit/f4f1fbf))
* change stacked to alva over the whole application ([ebf886a](https://github.com/meetalva/alva/commit/ebf886a))
* create observable for rearrange elements ([b7c9c34](https://github.com/meetalva/alva/commit/b7c9c34))
* integrate pattern list items ([e7e6abd](https://github.com/meetalva/alva/commit/e7e6abd))
* **store:** tabs for saved project files ([af7587d](https://github.com/meetalva/alva/commit/af7587d))
* integrate pattern list search ([a710ec4](https://github.com/meetalva/alva/commit/a710ec4))
* introduce link component ([#53](https://github.com/meetalva/alva/issues/53)) ([4833984](https://github.com/meetalva/alva/commit/4833984))
* list recursion ([804511e](https://github.com/meetalva/alva/commit/804511e))
* **build:** dist now always trys to build for all platforms ([f14ff6e](https://github.com/meetalva/alva/commit/f14ff6e))
* **build:** rename application to Alva ([49a12a0](https://github.com/meetalva/alva/commit/49a12a0))
* **component:** add keyboard shortcut for opening new project ([7854a0b](https://github.com/meetalva/alva/commit/7854a0b))
* **component:** add message for opening the designkit ([de03059](https://github.com/meetalva/alva/commit/de03059))
* **component:** add new pattern to selected element when clicking on a pattern ([127003e](https://github.com/meetalva/alva/commit/127003e))
* **component:** add space around ui sections ([139db5a](https://github.com/meetalva/alva/commit/139db5a))
* **component:** add space to project list ([899e774](https://github.com/meetalva/alva/commit/899e774))
* **component:** change fallback link text to plain text ([d348cec](https://github.com/meetalva/alva/commit/d348cec))
* **component:** element can now be selected ([15397e1](https://github.com/meetalva/alva/commit/15397e1))
* **component:** elements can now be dragged to a specific position ([8e136a2](https://github.com/meetalva/alva/commit/8e136a2))
* **component:** filter list items by search term ([aa08895](https://github.com/meetalva/alva/commit/aa08895))
* **component:** functionality to add patterns to element list with drag and drop ([a2e3feb](https://github.com/meetalva/alva/commit/a2e3feb))
* **component:** integrate pattern navigation ([806e763](https://github.com/meetalva/alva/commit/806e763))
* **component:** menu for saving projects ([a7f922f](https://github.com/meetalva/alva/commit/a7f922f))
* **component:** move tabnavigation to app ([94cbcc6](https://github.com/meetalva/alva/commit/94cbcc6))
* **component:** remove properties from components ([f4abd78](https://github.com/meetalva/alva/commit/f4abd78))
* **component:** render element list with lsg components ([2516ff9](https://github.com/meetalva/alva/commit/2516ff9))
* **component:** shortcuts for managing page elements ([526318c](https://github.com/meetalva/alva/commit/526318c))
* **component:** show selected pattern as highlighted ([4afc66b](https://github.com/meetalva/alva/commit/4afc66b))
* **component:** simplify functions ([f86d353](https://github.com/meetalva/alva/commit/f86d353))
* **component:** toggle for elements ([ce93c6a](https://github.com/meetalva/alva/commit/ce93c6a))
* **component:** use headline lsg pattern for list headlines ([be3cadf](https://github.com/meetalva/alva/commit/be3cadf))
* **components:** add icon registry in electron ([c4a4a63](https://github.com/meetalva/alva/commit/c4a4a63))
* **components:** use layout pattern instead of styling it in components ([8a024e6](https://github.com/meetalva/alva/commit/8a024e6))
* **container:** render list of properties with correct type elements ([52eb838](https://github.com/meetalva/alva/commit/52eb838))
* **electron:** add hotkey highlighting for windows ([3eaac4a](https://github.com/meetalva/alva/commit/3eaac4a))
* **electron:** extend OS menu-bar with alva menu items ([9fbf494](https://github.com/meetalva/alva/commit/9fbf494))
* **electron:** move preview in webview ([3cebb70](https://github.com/meetalva/alva/commit/3cebb70))
* **leg:** rotate arrow when element is open ([7c55977](https://github.com/meetalva/alva/commit/7c55977))
* **ListItem:** active style ([2de3da9](https://github.com/meetalva/alva/commit/2de3da9))
* **lsg:** add animation to element drag placeholder ([f72b27c](https://github.com/meetalva/alva/commit/f72b27c))
* **lsg:** add arrows to element list ([9d9d2b3](https://github.com/meetalva/alva/commit/9d9d2b3))
* **lsg:** add different cursors for pattern-item based on bound events ([2ec9a69](https://github.com/meetalva/alva/commit/2ec9a69))
* **lsg:** add hover state to element ([92e4c10](https://github.com/meetalva/alva/commit/92e4c10))
* **lsg:** add input styles ([229dcef](https://github.com/meetalva/alva/commit/229dcef))
* **lsg:** add new style for chrome, property pane and element pane ([a968f87](https://github.com/meetalva/alva/commit/a968f87))
* **lsg:** add new styling to property string item ([b0ad316](https://github.com/meetalva/alva/commit/b0ad316))
* **lsg:** add placeholder and drag events for element list ([f55f3a6](https://github.com/meetalva/alva/commit/f55f3a6))
* **lsg:** adjust tab-navigation styles ([1778f79](https://github.com/meetalva/alva/commit/1778f79))
* **lsg:** broken intendantion ([2e7590e](https://github.com/meetalva/alva/commit/2e7590e))
* **lsg:** capitalize element name ([fed82b1](https://github.com/meetalva/alva/commit/fed82b1))
* **lsg:** click event handler for layout pattern ([d4afbae](https://github.com/meetalva/alva/commit/d4afbae))
* **lsg:** drag drop event handler for elements and list pattern ([bdc70ae](https://github.com/meetalva/alva/commit/bdc70ae))
* **lsg:** element only renders icon when there are children ([0f6af31](https://github.com/meetalva/alva/commit/0f6af31))
* **lsg:** export default ([dcf762d](https://github.com/meetalva/alva/commit/dcf762d))
* **lsg:** handleClick for element and icons pattern ([6fa0dca](https://github.com/meetalva/alva/commit/6fa0dca))
* **lsg:** handleClick for element pattern ([706a296](https://github.com/meetalva/alva/commit/706a296))
* **lsg:** increase left padding ([8ba5705](https://github.com/meetalva/alva/commit/8ba5705))
* **lsg:** introduce demo container component ([1b1885c](https://github.com/meetalva/alva/commit/1b1885c))
* **lsg:** introduce icon and pattern-list-item component ([3f70c33](https://github.com/meetalva/alva/commit/3f70c33))
* **lsg:** introduce input component ([bb3b30e](https://github.com/meetalva/alva/commit/bb3b30e))
* **lsg:** introduce layout component ([51ac9ed](https://github.com/meetalva/alva/commit/51ac9ed))
* **lsg:** introduce space component ([f2accd7](https://github.com/meetalva/alva/commit/f2accd7))
* **lsg:** introduce tab-navigation component ([9fd4013](https://github.com/meetalva/alva/commit/9fd4013))
* **lsg:** invert icon color when element item is active ([6d83b8f](https://github.com/meetalva/alva/commit/6d83b8f))
* **lsg:** justify layout children ([c8046fd](https://github.com/meetalva/alva/commit/c8046fd))
* **lsg:** label for enum-item ([11213a6](https://github.com/meetalva/alva/commit/11213a6))
* **lsg:** margins for layout pattern ([45029ac](https://github.com/meetalva/alva/commit/45029ac))
* **lsg:** new element pattern ([0a7f603](https://github.com/meetalva/alva/commit/0a7f603))
* **lsg:** new font pattern ([39fe974](https://github.com/meetalva/alva/commit/39fe974))
* **lsg:** new headline pattern ([8e3f947](https://github.com/meetalva/alva/commit/8e3f947))
* **lsg:** new pattern boolean-item ([872d910](https://github.com/meetalva/alva/commit/872d910))
* **lsg:** new pattern enum-item ([8ab9589](https://github.com/meetalva/alva/commit/8ab9589))
* **lsg:** new string-item pattern ([15ab218](https://github.com/meetalva/alva/commit/15ab218))
* **lsg:** output right size name in demo ([61ede8e](https://github.com/meetalva/alva/commit/61ede8e))
* **lsg:** replace spaces ([adcc3df](https://github.com/meetalva/alva/commit/adcc3df))
* **lsg:** required prop for enum-item renders empty option when false ([c738430](https://github.com/meetalva/alva/commit/c738430))
* **lsg:** style element pattern without its children and also listen only on label area for click ([fbc27b6](https://github.com/meetalva/alva/commit/fbc27b6))
* **menu:** cut/copy/paste support ([5411166](https://github.com/meetalva/alva/commit/5411166))
* **resources:** add alva icons ([4dc294c](https://github.com/meetalva/alva/commit/4dc294c))
* **store:** add parent relation in page element ([aaf999c](https://github.com/meetalva/alva/commit/aaf999c))
* **store:** add, remove, edit of project and page-ref ([238f98b](https://github.com/meetalva/alva/commit/238f98b))
* **store:** add, remove, move page elements ([9dbe3f4](https://github.com/meetalva/alva/commit/9dbe3f4))
* **store:** continue store API and pattern resolution ([ca4216d](https://github.com/meetalva/alva/commit/ca4216d))
* **store:** continue store API and pattern resolution ([98f1835](https://github.com/meetalva/alva/commit/98f1835))
* **store:** cut/copy/paste support ([50eb476](https://github.com/meetalva/alva/commit/50eb476))
* **store:** edit text child elements ([abd7f85](https://github.com/meetalva/alva/commit/abd7f85))
* **store:** improve object property type ([0eeb60c](https://github.com/meetalva/alva/commit/0eeb60c))
* **store:** load page when webview is loaded ([255ada4](https://github.com/meetalva/alva/commit/255ada4))
* **store:** move function to get index of page element in store ([daa231f](https://github.com/meetalva/alva/commit/daa231f))
* **store:** property name parsing js-doc ([182cdcf](https://github.com/meetalva/alva/commit/182cdcf))
* **store:** property name parsing js-doc ([d163bb3](https://github.com/meetalva/alva/commit/d163bb3))
* **store:** property type system, setter, and coercing ([a961ab6](https://github.com/meetalva/alva/commit/a961ab6))
* **store:** property type system, setter, and coercing ([af2a581](https://github.com/meetalva/alva/commit/af2a581))
* **store:** provide current project ([246b706](https://github.com/meetalva/alva/commit/246b706))
* **store:** save and load of pages, as well as preview ([aee3caa](https://github.com/meetalva/alva/commit/aee3caa))
* **store:** save projects and page refs ([20bb970](https://github.com/meetalva/alva/commit/20bb970))
* **store:** search patterns ([b3204b7](https://github.com/meetalva/alva/commit/b3204b7))
* make elements deselectable ([c92c309](https://github.com/meetalva/alva/commit/c92c309))
* **store:** state if there is a focused page element can not be set and read from store ([127ddd8](https://github.com/meetalva/alva/commit/127ddd8))
* move global styles to lsg ([9ebda51](https://github.com/meetalva/alva/commit/9ebda51))
* move list to lsg ([fc0d495](https://github.com/meetalva/alva/commit/fc0d495))
* move panes to lsg ([53fd5fa](https://github.com/meetalva/alva/commit/53fd5fa))
* move styles from component to lsg ([f514a9b](https://github.com/meetalva/alva/commit/f514a9b))
* script for building alva ([05c1a98](https://github.com/meetalva/alva/commit/05c1a98))
* **store:** selectable element ([d1a61a7](https://github.com/meetalva/alva/commit/d1a61a7))
* **store:** send updated page to webview when pattern propertys change ([83f121b](https://github.com/meetalva/alva/commit/83f121b))
* **store:** support for more property types ([9a96741](https://github.com/meetalva/alva/commit/9a96741))
* **store:** switch from JSON to YAML ([0b8b5c9](https://github.com/meetalva/alva/commit/0b8b5c9))
* **store:** switch from JSON to YAML ([a52b4cb](https://github.com/meetalva/alva/commit/a52b4cb))

### Reverts

* remove unset function for selected elements ([b6e367c](https://github.com/meetalva/alva/commit/b6e367c))
