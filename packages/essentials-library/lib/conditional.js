"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
exports.Conditional = props => {
    return React.createElement(React.Fragment, null, props.condition ? props.true : props.false);
};
//# sourceMappingURL=conditional.js.map