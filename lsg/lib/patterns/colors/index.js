"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Color = (function () {
    function Color(options) {
        this.alpha = 1;
        this.displayName = options.displayName;
        this.rgb = options.rgb;
        if (options.alpha) {
            this.alpha = Math.max(0, Math.min(1, options.alpha));
        }
    }
    Color.prototype.toString = function (format, options) {
        if (format === void 0) { format = 'rgb'; }
        var hasAlpha = options && typeof options === "object" && typeof options.alpha === "number";
        var alpha = options && hasAlpha ? options.alpha : undefined;
        return !hasAlpha && format === 'hex'
            ? this.toHexString()
            : this.toRGBString(alpha);
    };
    Color.prototype.toRGBString = function (alpha) {
        var a = typeof alpha === "number" ? alpha : this.alpha;
        return a === 1
            ? "rgb(" + this.rgb.join(', ') + ")"
            : "rgba(" + this.rgb.join(', ') + ", " + a + ")";
    };
    Color.prototype.toHexString = function () {
        var _this = this;
        var _a = this.rgb.map(function (d) { return _this.hexDigit(d); }), r = _a[0], g = _a[1], b = _a[2];
        return this.alpha === 1
            ? "#" + r + g + b
            : "#" + r + g + b + this.hexDigit(this.alpha * 255);
    };
    Color.prototype.hexDigit = function (d) {
        var digit = Math.floor(d).toString(16).slice(-2);
        return digit.length === 2 ? digit : "0" + digit;
    };
    return Color;
}());
exports.Color = Color;
var colors = {
    black: new Color({
        displayName: 'Black',
        rgb: [51, 51, 51]
    }),
    greenDark: new Color({
        displayName: 'Green Dark',
        rgb: [30, 205, 151]
    }),
    green: new Color({
        displayName: 'Green',
        rgb: [87, 218, 178]
    }),
    greenLight: new Color({
        displayName: 'Green Light',
        rgb: [123, 226, 195]
    }),
    grey70: new Color({
        displayName: 'Grey 70',
        rgb: [179, 179, 179]
    }),
    grey90: new Color({
        displayName: 'Grey 90',
        rgb: [227, 227, 227]
    }),
    white: new Color({
        displayName: 'White',
        rgb: [255, 255, 255]
    })
};
exports.default = colors;
//# sourceMappingURL=index.js.map