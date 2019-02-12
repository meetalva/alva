Buttons are used as triggers for actions. They are used in forms, toolbars, dialog footers and as stand-alone action triggers.

Button also exports a button-group component to make it easy to display multiple buttons together.

### Usage
|Code|Result|
|---|---|
|`<Button>Click me!</Button>`|default|
|`<Button primary>Click me!</Button>`|primary|
|`<Button primary disabled>Click me!</Button>`|disabled|


results to:
```widget
const React = require("react");
const {ComponentDemo} = require("@patternplate/widgets");

module.exports = () => {
  return (
    <ComponentDemo id="button"/>
  );
};
```

---

### Button Props

`disabed (boolean)`:
Defines if the button is active or not


`primary (boolean)`:
Defines wether the button is used for primary actions or secondary


`onClick (React.MouseEventHandler)`


`onMouseDown (React.MouseEventHandler)`
