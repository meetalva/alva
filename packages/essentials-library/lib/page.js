"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_helmet_1 = require("react-helmet");
exports.Page = props => {
    return (React.createElement("div", null,
        React.createElement(react_helmet_1.Helmet, null,
            React.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }),
            props.head),
        props.content,
        props.children));
};
//# sourceMappingURL=page.js.map