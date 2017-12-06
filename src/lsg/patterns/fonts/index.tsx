const NORMAL_FONT =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";';

export interface Fonts {
	NORMAL_FONT: string;
}

export function fonts(): Fonts {
	return {
		NORMAL_FONT
	};
}
