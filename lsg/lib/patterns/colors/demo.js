"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var styled_components_1 = require("styled-components");
var index_1 = require("./index");
var StyledList = styled_components_1.default.ul(templateObject_1 || (templateObject_1 = tslib_1.__makeTemplateObject(["\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tmargin: 0;\n\tpadding: 48px;\n"], ["\n\tdisplay: flex;\n\tflex-wrap: wrap;\n\tmargin: 0;\n\tpadding: 48px;\n"])));
function ColorDemo() {
    return (React.createElement("div", null,
        React.createElement(StyledList, null,
            React.createElement(ColorSwatch, { color: index_1.default.black }),
            React.createElement(ColorSwatch, { color: index_1.default.grey70 }),
            React.createElement(ColorSwatch, { color: index_1.default.grey90 }),
            React.createElement(ColorSwatch, { color: index_1.default.white })),
        React.createElement(StyledList, null,
            React.createElement(ColorSwatch, { color: index_1.default.greenDark }),
            React.createElement(ColorSwatch, { color: index_1.default.green }),
            React.createElement(ColorSwatch, { color: index_1.default.greenLight }))));
}
exports.default = ColorDemo;
var InnerStyles = styled_components_1.default.div(templateObject_2 || (templateObject_2 = tslib_1.__makeTemplateObject(["\n\tdisplay: flex;\n\tflex-direction: column;\n\tjustify-content: space-between;\n\tpadding: 25px;\n"], ["\n\tdisplay: flex;\n\tflex-direction: column;\n\tjustify-content: space-between;\n\tpadding: 25px;\n"])));
var ColorSwatch = function (props) {
    var threshold = 250;
    var Styles = styled_components_1.default.li(templateObject_3 || (templateObject_3 = tslib_1.__makeTemplateObject(["\n\t\tdisplay: flex;\n\t\tmargin: 0 48px 48px 0;\n\t\tbackground: ", ";\n\t\tpadding-bottom: 50%;\n\t\twidth: 100%;\n\t\t", "\n\t\tcolor: ", ";\n\n\t\t@media screen and (min-width: 320px) {\n\t\t\tpadding: 0;\n\t\t\twidth: 250px;\n\t\t\theight: 250px;\n\t\t}\n\t"], ["\n\t\tdisplay: flex;\n\t\tmargin: 0 48px 48px 0;\n\t\tbackground: ", ";\n\t\tpadding-bottom: 50%;\n\t\twidth: 100%;\n\t\t",
        "\n\t\tcolor: ", ";\n\n\t\t@media screen and (min-width: 320px) {\n\t\t\tpadding: 0;\n\t\t\twidth: 250px;\n\t\t\theight: 250px;\n\t\t}\n\t"])), props.color.toString('rgb'), luminance(props.color.rgb) > threshold
        ? "box-shadow: 0 2px 4px " + index_1.default.grey70.toString() + ";"
        : '', contrast(props.color.rgb));
    return (React.createElement(Styles, null,
        React.createElement(InnerStyles, null,
            React.createElement("div", null, props.color.displayName),
            React.createElement("div", null,
                React.createElement("div", null, props.color.toString('rgb')),
                React.createElement("div", null, props.color.toString('hex'))))));
};
function contrast(rgb) {
    return isLight(rgb) ?
        index_1.default.black.toString() :
        index_1.default.white.toString();
}
function isLight(rgb) {
    var threshold = 100;
    return luminance(rgb) > threshold;
}
function luminance(rgb) {
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var factorR = 0.2126;
    var factorG = 0.7152;
    var factorB = 0.0722;
    return (factorR * r) + (factorG * g) + (factorB * b);
}
var templateObject_1, templateObject_2, templateObject_3;
//# sourceMappingURL=demo.js.map