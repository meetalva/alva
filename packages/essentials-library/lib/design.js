"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
exports.Design = props => {
    return (React.createElement("img", { src: props.src, onClick: props.onClick, style: {
            width: props.width,
            height: props.height,
            minWidth: props.minWidth,
            maxWidth: props.maxWidth,
            minHeight: props.minHeight,
            maxHeight: props.maxHeight
        } }));
};
//# sourceMappingURL=design.js.map