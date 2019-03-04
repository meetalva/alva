---
displayName: Start
options:
  order: 0
---

# Documentation
**Welcome to Alva! Alva lets you design interactive products based on the same components your engineers are using for production websites. Basically, Alva is design and engineering, joined together. [Learn more about our story](about-us).**

![](https://media.meetalva.io/alva-library-production.png)

  
## Guides: Prototyping with Alva

Learn step-by-step how to create living prototypes with an interactive design system. We have guides for novice as well as advanced users.

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


## References

Currently Alva supports React and certain library requirements, but the goal is to be platform-agnostic in the future.

```widget
const React = require("react");
const {PatternList} = require("@patternplate/widgets");
module.exports = () => <PatternList query="is=doc AND tag=reference AND tag!=entry" />;
```
