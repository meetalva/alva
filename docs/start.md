---
displayName: Start
options:
  order: 0
---

# Docs
Welcome to Alva! Learn Alva step-by-step with our [Guides](#guides) and check out [References](#references) for technical documentation and requirements for pattern libraries. 

  
## Guides

Learn step-by-step how to create living prototypes with an interactive design system. We have guides for novice as well as advanced users.

```widget
const React = require("react");
const {PatternList} = require("@patternplate/widgets");
module.exports = () => <PatternList query="is=doc AND tag=guide AND tag!=entry" />;
```


## References

Detailed technical documentation about various Alva features. References are written with **intermediate users** in mind. 

```widget
const React = require("react");
const {PatternList} = require("@patternplate/widgets");
module.exports = () => <PatternList query="is=doc AND tag=reference AND tag!=entry" />;
```
