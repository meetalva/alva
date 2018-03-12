export type RGB = [number, number, number];
export interface ColorOptions {
	alpha?: number;
	displayName: string;
	rgb: RGB;
}

export class Color {
	public readonly alpha: number = 1;
	public readonly displayName: string;
	public readonly rgb: RGB;

	public constructor(options: ColorOptions) {
		this.displayName = options.displayName;
		this.rgb = options.rgb;

		if (options.alpha) {
			this.alpha = Math.max(0, Math.min(1, options.alpha));
		}
	}

	protected hexDigit(d: number): string {
		const digit = Math.floor(d)
			.toString(16)
			.slice(-2);

		return digit.length === 2 ? digit : `0${digit}`;
	}

	public toHexString(): string {
		const [r, g, b] = this.rgb.map(d => this.hexDigit(d));

		return this.alpha === 1 ? `#${r}${g}${b}` : `#${r}${g}${b}${this.hexDigit(this.alpha * 255)}`;
	}

	public toRGBString(alpha?: number): string {
		const a = typeof alpha === 'number' ? alpha : this.alpha;
		return a === 1 ? `rgb(${this.rgb.join(', ')})` : `rgba(${this.rgb.join(', ')}, ${a})`;
	}

	public toString(format: 'rgb' | 'hex' = 'rgb', options?: { alpha?: number }): string {
		const hasAlpha =
			options &&
			typeof options === 'object' &&
			'alpha' in options &&
			typeof options.alpha === 'number';
		const alpha = options && hasAlpha ? options.alpha : undefined;
		return !hasAlpha && format === 'hex' ? this.toHexString() : this.toRGBString(alpha);
	}
}

export const colors = {
	black: new Color({
		displayName: 'Black',
		rgb: [1, 12, 22]
	}),
	blackAlpha13: new Color({
		alpha: 0.13,
		displayName: 'Black Alpha 13',
		rgb: [0, 0, 0]
	}),
	blue: new Color({
		displayName: 'Blue',
		rgb: [0, 112, 214]
	}),
	blue20: new Color({
		displayName: 'Blue 20',
		rgb: [51, 141, 222]
	}),
	blue40: new Color({
		displayName: 'Blue 40',
		rgb: [102, 169, 230]
	}),
	grey20: new Color({
		displayName: 'Grey 20',
		rgb: [52, 61, 69]
	}),
	grey36: new Color({
		displayName: 'Grey 36',
		rgb: [92, 92, 92]
	}),
	grey50: new Color({
		displayName: 'Grey 40',
		rgb: [103, 109, 115]
	}),
	grey60: new Color({
		displayName: 'Grey 70',
		rgb: [153, 158, 162]
	}),
	grey80: new Color({
		displayName: 'Grey 80',
		rgb: [204, 206, 208]
	}),
	grey90: new Color({
		displayName: 'Grey 90',
		rgb: [229, 230, 231]
	}),
	white: new Color({
		displayName: 'White',
		rgb: [255, 255, 255]
	})
};
