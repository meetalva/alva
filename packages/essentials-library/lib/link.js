"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
exports.Link = props => {
    return (React.createElement("a", { href: props.href, onClick: props.onClick, target: props.target, rel: props.rel }, props.children));
};
//# sourceMappingURL=link.js.map