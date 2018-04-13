"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var index_1 = require("./index");
var ImageDemo = function () {
    // example with srcset and props in object
    var image = {
        alt: 'Gourgeously crafted alternate text',
        src: 'https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif',
    };
    return (React.createElement(index_1.default, { alt: image.alt, src: image.src }));
};
exports.default = ImageDemo;
//# sourceMappingURL=demo.js.map