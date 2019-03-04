---
displayName: Start
options:
  order: 0
---

# Documentation
**Welcome to Alva! Alva lets you design interactive products based on the same components your engineers are using for production websites. Basically, Alva is design and engineering, joined together. [Learn more about our story](about-us).**

![](https://media.meetalva.io/alva-library-production.png)

  
## Guides: Prototyping with Alva

Instructions for common use cases that can be followed step by step. 
This is where you'll want to begin when exploring Alva and its features.
Most guides are written **for beginners**.

![](https://media.meetalva.io/alva-design-to-code.png)

```widget
const React = require("react");
const {PatternList} = require("@patternplate/widgets");
module.exports = () => <PatternList query="is=doc AND tag=guide AND tag=design AND tag!=entry" />;
```

## Guides: Creating a Component Library

Learn how to create your own Design System's component library based on React/Typescript and how to bring it to live in Alva.

![](https://media.meetalva.io/component-list-abstraction.png)


```widget
const React = require("react");
const {PatternList} = require("@patternplate/widgets");
module.exports = () => <PatternList query="is=doc AND tag=guide AND tag=dev AND tag!=entry" />;
```

## Levels

> :information_source: 
> The levels are meant to help you decide how much time you'll need to follow a guide. 
> If you are a beginner: Please tackle the "Expert" level guides! 
>
> Join us for a [chat and help on Gitter](https://gitter.im/meetalva/Lobby) when you have trouble with anything.

* Beginner
* Intermediate
* Expert

## References

Currently Alva supports React and certain library requirements, but the goal is to be platform-agnostic in the future.

```widget
const React = require("react");
const {PatternList} = require("@patternplate/widgets");
module.exports = () => <PatternList query="is=doc AND tag=reference AND tag!=entry" />;
```
