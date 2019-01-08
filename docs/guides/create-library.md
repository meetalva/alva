---
displayName: Guide 8 - Create Library

tags:
  - guide
---

# Guide 8 - Create a Component Library

:woman_student: **Level**: Expert

---

Component libraries are an important building block of 
the frontend development process and that's great news!

By breaking an app into reusable parts there is more chance
for reuse, e.g. by tools like Alva.

This flexibility come at a cost, which often is paid in the increased complexity in tech setups. 

Don't worry though - this guide is designed to take you through the process step by step.

## What to expect

This guide takes you step by step through the process of setting up a component library **from scratch**.

After completion you will …

* … know how to set up a component library
* … know how to add new components to your library
* … have a full tech setup for development of components compatible with Alva

Following along is very useful to understand what happens behind the scences.
A project setup can be very time consuming though – you might want to have a look at the following
shortcuts if you don't want to focus on technical setup.

- **Focus on editing components**: Reuse [Alva Designkit](https://github.com/meetalva/designkit) and change to [Create Pattern Guide](./create-pattern)

- **Focus on adding components**: Fetch [Component Library Starter](https://github.com/meetalva/designkit) and skip to [Section 2](#2.-add-components)

## Prerequesites

- :evergreen_tree: [git](https://git-scm.com/downloads)
- :turtle: [Node.js](https://nodejs.org/en/) `>= 8`
- :computer: A terminal emulator
- :globe_with_meridians: Internet connection

## 1. Project setup

Let's dive right in. Start a terminal and change to the directory
you want to work in. For this tutorial we'll use `~/alva-guides/` but any location works.

## 1a) Git initialization

Create a folder, change into it and initialize it as a git repository.

```
mkdir component-library
cd component-library
git init
```

Place a `.gitignore` in the same folder next. This will cause `git` to
omit the listed files and folders when committing, which helps us to
keep our commit history clear and meaningful.

```sh
# .gitgnore
lib
node_modules
.DS_Store
```

If everything worked `git status` should create the following output for you:

```sh
$ git status
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)

	.gitignore

nothing added to commit but untracked files present (use "git add" to track)
```

## 1b) Add required npm meta data

> [[details | Shortcut]]
> |
> | ```
> | git clone --single-branch --branch 1b-add-required-npm-meta-data https://github.com/meetalva/component-library-starter.git
> | ```

Alva uses some meta data commonly found in `npm` packages to distinguish between different libraries. You will also select the `package.json` file used to store this meta data when connecting component libraries to Alva.

So let's create a `package.json` file. Luckily `npm` has us covered and
makes this a matter of one command.

```
npm init -y
```

After successful init, you should find a new `package.json` in your directory with content like this:

```json
{
  "name": "component-library",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 1c) Add dependencies

> [[details | Shortcut]]
> |
> | ```
> | git clone --single-branch --branch 1c-add-dependencies https://github.com/meetalva/component-library-starter.git
> | cd component-library-starter
> | npm install
> | ```


We'll use some dependencies to create our components. This includes [React](https://reactjs.org/)
and [styled-components](https://www.styled-components.com/). Add and save them to your project like this:

> :information_source:
> :woman_student: Don't panic! 
> We encourage you to learn about React and styled-components, but
> really don't need to be a React programmer to complete this guide.
> 
> **Promise :crossed_fingers:**

```
npm install --save \
  react@16.6.3 \
  react-dom@16.6.3 \
  styled-components@4.1.2 \
  @types/react@16.7.17 \
  @types/react-dom@16.0.11 \
  styled-components@4.1.2
```

After successful installation your `package.json` should look like this:

```json{13-18}
{
  "name": "component-library",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@types/react": "^16.7.17",
    "@types/react-dom": "^16.0.11",
    "@types/styled-components": "^4.1.4",
    "react": "^16.6.3",
    "react-dom": "^16.6.3",
    "styled-components": "^4.1.2"
  }
}
```

### 1d) Add TypeScript

> [[details | Shortcut]]
> |
> | ```
> | git clone --single-branch --branch 1d-add-typescript https://github.com/meetalva/component-library-starter.git
> | cd component-library-starter
> | npm install
> | ```


Alva analyzes your component interfaces to find out which
data to feed into them. The easiest way to provide those
interfaces is to write our components in TypeScript, so we'll do that.

Let's install and configure TypeScript:

```
npm install --save-dev typescript@3.2.2
```

This should cause `npm` to add a new `devDependencies` entry:

```json{21}
{
  "name": "component-library",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@types/react": "^16.7.17",
    "@types/react-dom": "^16.0.11",
    "@types/styled-components": "^4.1.4",
    "react": "^16.6.3",
    "react-dom": "^16.6.3",
    "styled-components": "^4.1.2"
  },
  "devDependencies": {
    "typescript": "^3.2.2"
  }
}
```

On its own TypeScript won't do much, we have to configure it.
Let' create a `tsconfig.json` for this. The configuration
values required for Alva to work correctly are highlighted below.

Copy the following code and paste it into `tsconfig.json`.

```js{4-6}
// tsconfig.json
{
  "compilerOptions": {
    "declaration": true,
    "jsx": "react",
    "moduleResolution": "node",
    "lib": ["dom", "es2015"],
    "module": "es2015",
    "outDir": "./lib",
    "target": "es2015",
  }
}

```

Finally let's create a shortcut so we can to start the TypeScript compiler
via `npm run build`. Notice that we removed the `npm test` placeholder script.

```json{7}
{
  "name": "component-library",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "build": "tsc"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@types/react": "^16.7.17",
    "@types/react-dom": "^16.0.11",
    "@types/styled-components": "^4.1.4",
    "react": "^16.6.3",
    "react-dom": "^16.6.3",
    "styled-components": "^4.1.2"
  },
  "devDependencies": {
    "typescript": "^3.2.2"
  }
}
```


### 1e) Specify package entry

> [[details | Shortcut]]
> |
> | ```
> | git clone --single-branch --branch 1e-specify-package-entry https://github.com/meetalva/component-library-starter.git
> | cd component-library-starter
> | npm install
> | ```

Using the configuration above, `tsc` will compile any 
`.ts` file found in `src` to `lib`. 

**For Alva to pick up
our code, we need to point it to the correct file via `main` - in our case that is `lib/index.js`.**

Luckily npm provides a field designed to do this: `main`. We'll change it 
from `index.js` to `lib/index.js`. The resulting `package.json` reads:


```json{5}
{
  "name": "component-library",
  "version": "1.0.0",
  "description": "",
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@types/react": "^16.7.17",
    "@types/react-dom": "^16.0.11",
    "@types/styled-components": "^4.1.4",
    "react": "^16.6.3",
    "react-dom": "^16.6.3",
    "styled-components": "^4.1.2"
  },
  "devDependencies": {
    "typescript": "^3.2.2"
  }
}
```

### 1f) Create placeholder files

> [[details | Shortcut]]
> |
> | ```
> | git clone --single-branch --branch 1f-create-placeholder-files https://github.com/meetalva/component-library-starter.git
> | cd component-library-starter
> | npm install
> | npm run build
> | ```


We place some empty files for `TypeScript` to pick up so we can 
verfiy your setup. Create a `src` folder first:

```
mkdir src
```

Then add the following to `src/index.ts`

```ts
// src/index.ts
// placeholder entry file
// export * from './hello-world';
console.log('Hello, World');
```

### 1g) Verify your setup

Execute `npm run build`, then `tree lib`.
The output should look like this:

```
$ ls lib
index.d.ts    index.js

0 directories, 2 files
```

Executing our build results with `node` should work, too:

```
$ node lib/index.js
Hello, World
```

### 1h) Clean up

> [[details | Shortcut]]
> |
> | ```
> | git clone --single-branch --branch 1h-cleanup https://github.com/meetalva/component-library-starter.git
> | cd component-library-starter
> | npm install
> | npm run build
> | ```

Phew! It was quite a journey from zero to project setup. Congrats you did it! :tada:

There is just one last thing to do before we can start adding components: 

Let's remove our debug `console.log` on the last line in `src/index.ts`.

Afterwards your file looks like this:

```ts
// src/index.ts
// placeholder entry file
// export * from './hello-world';
```

## 2. Add components

## 2a) Add a HelloWorld component

> [[details | Shortcut]]
> |
> | ```
> | git clone --single-branch --branch 2a-add-a-helloworld-component https://github.com/meetalva/component-library-starter.git
> | cd component-library-starter
> | npm install
> | npm run build
> | ```


Create the following files

**src/hello-world.styled.ts**

This file holds the styling and the styling variants
our component supports.

```tsx
// src/hello-world.styled.ts
import styled from 'styled-components';

export enum HelloWorldColors {
  Pale = 'palevioletred',
  Whip = 'papayawhip',
  Black = 'black'
}

export interface StyledHelloWorldProps {
  color?: HelloWorldColors;
}

export const StyledHelloWorld = styled.h1<StyledHelloWorldProps>`
  font-family: sans-serif;
  color: ${props => props.color || HelloWorldColors.Black};
}`;
```

**src/hello-world.tsx**

This file adds content to our styling components and defines
its the interface it exposes to the outside world.

```tsx
import * as React from 'react';
import * as Styles from './hello-world.styled';

export interface HelloWorldProps {
    color?: Styles.HelloWorldColors;
    children?: React.ReactNode;
}

export const HelloWorld: React.SFC<HelloWorldProps> = props => {
    return <Styles.StyledHelloWorld color={props.color}>{props.children || 'Hello, World!'}</Styles.StyledHelloWorld>
}
```

## 2b) Export 

Change your `src/index.ts` to export `src/hello-world.tsx`:

```ts
export * from './hello-world';
```

## 2c) Build

Execute `npm run build` to create JavaScript from your 
brand-new React TypeScript component:

```
npm run build
```

After a successful build `tree lib` prints a file list like this:

```
$ ls lib    
hello-world.d.ts         hello-world.js    hello-world.styled.d.ts
hello-world.styled.js    index.d.ts        index.js

0 directories, 6 files
```

### 2d) Connect to Alva

* Start Alva. 
* Create a new file (`File > New` or `Cmd+N`)
* Open connect library dialog (`Library` > `Connect New Library` or `Cmd+Shift+C`)
* Select `~/alva-guides/component-library/package.json`. Exact location may differ if you chose a different working directory in section 1.

After importing your component library successfully Alva should display your `HelloWorld` component on the bottom of the component list.

[[grid]]
| [[grid-column | 5 - 13 ]]
| | ![](https://media.meetalva.io/guides/hello-world-component-list.png)


Drag your `HelloWorld` component to the element list above or doubleclick on it. This should add a new `HelloWorld` element and cause Alva to render "Hello World" to the preview.

[[grid]]
| [[grid-column | 5 - 13 ]]
| | ![](https://media.meetalva.io/guides/hello-world-component-used.png)


## Whats next

That's it, you just bootstrapped yourself from zero to working Alva library! I suggest your pat yourself a bit on the back now.

Done? Cool. Here are some suggestions on what to do next.

* Repeat the `Create` - `Build` - `Use` cycle in section 2 and build more components
* Have a look at our [Create Component Guide](./create-pattern)
* Have a look at our [Create Properties Guide](./create-properties)

## Reference

* [Library Requirements](../references/library-requirements)
