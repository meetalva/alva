"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
var FlexDirection;
(function (FlexDirection) {
    FlexDirection["Vertical"] = "column";
    FlexDirection["Horizontal"] = "row";
})(FlexDirection = exports.FlexDirection || (exports.FlexDirection = {}));
var FlexAlignHorizontal;
(function (FlexAlignHorizontal) {
    FlexAlignHorizontal["Left"] = "flex-start";
    FlexAlignHorizontal["Center"] = "center";
    FlexAlignHorizontal["Right"] = "flex-end";
    FlexAlignHorizontal["Stretch"] = "stretch";
    FlexAlignHorizontal["SpaceBetween"] = "space-between";
    FlexAlignHorizontal["SpaceAround"] = "space-around";
    FlexAlignHorizontal["SpaceEvenly"] = "space-evenly";
})(FlexAlignHorizontal = exports.FlexAlignHorizontal || (exports.FlexAlignHorizontal = {}));
var FlexAlignVertical;
(function (FlexAlignVertical) {
    FlexAlignVertical["Top"] = "flex-start";
    FlexAlignVertical["Center"] = "center";
    FlexAlignVertical["Bottom"] = "flex-end";
    FlexAlignVertical["Stretch"] = "stretch";
    FlexAlignVertical["SpaceBetween"] = "space-between";
    FlexAlignVertical["SpaceAround"] = "space-around";
    FlexAlignVertical["SpaceEvenly"] = "space-evenly";
})(FlexAlignVertical = exports.FlexAlignVertical || (exports.FlexAlignVertical = {}));
exports.Box = props => {
    return (React.createElement("div", { style: {
            flexBasis: props.flexBasis,
            flexDirection: props.flexDirection,
            flexWrap: props.wrap ? 'wrap' : 'nowrap',
            flexGrow: props.flexGrow,
            flexShrink: props.flexShrink,
            alignItems: props.flexDirection === FlexDirection.Horizontal ? props.vertical : props.horizontal,
            display: props.flex ? 'flex' : 'block',
            justifyContent: props.flexDirection === FlexDirection.Horizontal ? props.horizontal : props.vertical,
            width: props.width,
            height: props.height,
            backgroundColor: props.backgroundColor
        } }, props.children));
};
//# sourceMappingURL=box.js.map