"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var styled_components_1 = require("styled-components");
var StyledImage = styled_components_1.default.img(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n\tdisplay: block;\n\twidth: ", ";\n\tobject-fit: cover;\n"], ["\n\tdisplay: block;\n\twidth: ", ";\n\tobject-fit: cover;\n"])), function (props) { return props.size || "100%"; });
var Image = function (props) {
    return (React.createElement(StyledImage, { alt: props.alt, className: props.className, src: props.src, size: props.size }));
};
exports.default = Image;
var templateObject_1;
//# sourceMappingURL=index.js.map