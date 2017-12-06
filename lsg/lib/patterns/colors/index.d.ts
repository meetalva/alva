export declare type RGB = [number, number, number];
export interface ColorOptions {
    alpha?: number;
    displayName: string;
    rgb: RGB;
}
export declare class Color {
    readonly alpha: number;
    readonly displayName: string;
    readonly rgb: RGB;
    constructor(options: ColorOptions);
    toString(format?: 'rgb' | 'hex', options?: {
        alpha?: number;
    }): string;
    toRGBString(alpha?: number): string;
    toHexString(): string;
    protected hexDigit(d: number): string;
}
declare const colors: {
    black: Color;
    greenDark: Color;
    green: Color;
    greenLight: Color;
    grey70: Color;
    grey90: Color;
    white: Color;
};
export default colors;
