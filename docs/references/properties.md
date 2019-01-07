---
tags:
  - reference
---

# Properties

With properties you bring your components to life.
Alva analyzes your React property interfaces to present 
you with an appropriate editing UI.

## Supported Component Interfaces

Alva searches your component libray for exports that match
one of the following types:

* `React.SFC<T>`
* `React.ComponentClass<T>`
* `React.PureComponent<T>`
* `React.StatelessComponent<T>`
* `React.ComponentType<T>`

In the list above `T` is assumed to fulfill the constraints 

```ts
{ [key: string]: any };
```

Which is a fancy way of saying we assume you use the plain object interface that is conventional in the React community.

> :warning:
> **Heads up**!
> Alva does not support type aliasing of React component types yet.
> This means **this won't work**:
> 
> ```ts
> import * as React from 'react';
> 
> type C = React.SFC;
> 
> export const Component: C = () => <h1>Component</h1>;
> ```


## Supported Property Types

Alva creates dedicated editing UI for the following 
types. For the purpose of this reference we'll assume
the `Props` interface examples are used in this code snippet:

```ts{3-5}
import * as React from 'react';

export interface Props {

}

export const Component: React.SFC<Props> = (props) => <div {...props}/>;
```

### string

Creators may enter texts of any length. 

Alva provides an auto-growing multiline `<textarea/>`
This type is connectable to the user property store.

[[grid]]
| [[grid-column | 1 - 7 ]]
| | ![](https://media.meetalva.io/reference/properties-text.png)
|
| [[grid-column | 7 - 13 ]]
| | ```ts
| | export interface Props {
| | 	propertyName: string;
| | }
| | ```



### number

Creators may enter integers and floating point numbers.

Alva provides an `<input type="number"/>`.
This type is connectable to the user property store.

[[grid]]
| [[grid-column | 1 - 7 ]]
| | ![](https://media.meetalva.io/reference/properties-number.png)
|
| [[grid-column | 7 - 13 ]]
| | ```ts
| | export interface Props {
| | 	propertyName: number;
| | }
| | ```


### boolean

Creators may decide between a `true` and `false` state.

Alva provides an `<input type="checkbox"/>` rendered as toggle switch.
This type is connnectable to the user property store.

[[grid]]
| [[grid-column | 1 - 7 ]]
| | ![](https://media.meetalva.io/reference/properties-boolean.png)
|
| [[grid-column | 7 - 13 ]]
| | ```ts
| | export interface Props {
| | 	propertyName: boolean;
| | }
| | ```

### enum

Creators may select from a range of predefined, static options.

Alva provides an `<input type="select"/>`.
This type is connectable to the user property store.



[[grid]]
| [[grid-column | 1 - 7 ]]
| | ![](https://media.meetalva.io/reference/properties-boolean.png)
|
| [[grid-column | 7 - 13 ]]
| | ```ts
| | export enum PropEnum {
| | 	OptionA,
| | 	OptionB,
| | 	OptionC
| | }
| | 
| | export interface Props {
| | 	propertyName: PropEnum;
| | }
| |
| |```

### React.ReactNode

Creators may insert other elements on a "slot" rendered as child
of the containing element.


[[grid]]
| [[grid-column | 1 - 7 ]]
| | ```ts
| | export interface Props {
| |     AreaA: React.ReactNode;
| | 	AreaB: React.ReactNode;
| | }
| | ```
| [[grid-column | 7 - 13 ]]
| | ![](https://media.meetalva.io/reference/properties-slot.png)

## Code Properties

Any type that Alva does not render specialized 
UI for is editable in the "Code Properties" drawer
on the bottom of the property list.

Common examples for this are nested objects, `any[]` etc.

[[grid]]
| [[grid-column | 1 - 7 ]]
| | ![](https://media.meetalva.io/reference/properties-code.png)
|
| [[grid-column | 7 - 13 ]]
| | ```ts
| | export interface Props {
| |    tabs: { title: string; content: string }[];
| | }
| | ```
