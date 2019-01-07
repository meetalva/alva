---
displayName: Guide 7 - Create Properties

tags:
  - guide
---

# Guide 7 - Create Properties

 Learn how to make your patterns configurable with property interfaces.

:woman_student: **Level**: Intermediate

---

## 1. Setup up Alva Designkit

> ❔
> In this guide we'll skip the project setup
> part by reusing the Alva Designkit. 
>
> If you want to start fresh, skip to our [Create a Library Guide](./create-library.md)
Please make sure to follow our [Connnect a Library](./library) and [Create a Pattern](./create-pattern) before 
continuing with step 2.

## 2. Add a greeting property

!(video:https://media.meetalva.io/video/props-add-greeting.m4v)

Locate the implementation of our `Hello World` component at `~/alva/src/hello-world/index.tsx`.
Open it with your favourite text editor. We'll use VSCode in our screenshots and screencasts but 
you are not required to use it.

You should see a file resembling the code below:

```ts
import * as React from 'react';

export const HelloWorld: React.SFC = () => {
	return (
		<h1>Hello, World!</h1>
	)
}
```

Let's take our componen a bit further. We'll let users
decide on the greeting they want to use.

Let's set a foundation annd add a `HelloWorldProps` TypeScript interface.
We'll leave it empty for now and fill in our props in the next step.

```ts{3-5,7}
import * as React from 'react';

export interface HelloWorldProps {

}

export const HelloWorld: React.SFC<HelloWorldProps> = () => {
	return (
		<h1>Hello, World!</h1>
	)
}
```

> ℹ️
> Notice how we export the `HelloWorldsProps` interface?
> This is important for Alva to be able to find interfaces 
> and components it is supposed to analyze and list. 
> 
> Without `export` this won't be picked up by Alva!

Now let's specify we accept a string that gets rendered instead 
of "Hello":

```ts{4,9}
import * as React from 'react';

export interface HelloWorldProps {
	greeting?: string; 
}

export const HelloWorld: React.SFC<HelloWorldProps> = (props) => {
	return (
		<h1>{props.greeting || 'Hello'}, World!</h1>
	)
}
```

## 3. See your new Property in Alva

!(video:https://media.meetalva.io/video/props-use-greeting.m4v)

Remember to execute the TypeScript compiler via `npm run build`.

Then fire up Alva, open a new file and connect your Designkit.
Locate the `HelloWorld` component via search in the component list.

Double-click the component or drag it on Alvas element list. You should 
see "Hello, World" in your project preview.

Notice how the property list on the right side of the preview now 
shows an input with the label `greeting`? That's the property we just added!

Let's type something in there, e.g. "Moin" (I am from Hamburg, Germany - sue me.)
See how the preview updates with every keystroke? 

## 4. More properties

!(video:https://media.meetalva.io/video/props-add-scope.m4v)

That's pretty cool, right? Let's try another one. We'll let the user
select from a range of scopes for the second word in our greeting. 
Let's go with this list:

* Hamburg
* Europe
* World
* Solar System
* Galaxy
* Universe

To do that we'll use an TypeScript `enum` like this:

```ts{3-10,14,19}
import * as React from 'react';

export enum HelloScope {
	Hamburg = "Hamburg",
	Europe = "Europe",
	World = "World",
	SolarSystem = "Solar System",
	Galaxy = "Galaxy",
	Universe = "Universe"
}

export interface HelloWorldProps {
	greeting?: string; 
	scope?: HelloScope;
}

export const HelloWorld: React.SFC<HelloWorldProps> = (props) => {
	return (
		<h1>{props.greeting || 'Hello'}, {props.scope || 'World'}!</h1>
	)
}
```

You might ask why we bothered with the additional code for our new `scope` property when we simply could have 
used a `string` again. 

One nice thing about `enums` is that we now know the **finite**
set of possibilites for this prop. Alva uses this fact to render a nicer edit UI.

Let's update the designkit in our Alva file again. Then select the HelloWorld element
you created earlier by clicking on it. Notice the second input in the property pane?

That's an select, the input type Alva chooses for properties of type `enum`.

You just mastered the fundamentals of making your components configurable and data-driven. Well done! :clap:

> ❔
> See our [Property Reference](../references/properties) for details on how Alva parses and
analyzes your React components' interfaces.

---

## Next

* **Next**: [Create a Pattern Library](./doc/docs/guides/create-library?guides-enabled=true)
