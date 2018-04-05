import * as MobX from 'mobx';

import { Persister } from './json';

/**
 * The class to load and handle color themes
 */
export class Theme {
	/**
	 * Key-value pair of colorId and color.
	 */
	@MobX.observable private colors: { [key: string]: string };

	/**
	 * Creates a new theme.
	 * @param themeName The descriptive name of the theme
	 */
	public constructor(themeName?: string) {
		const defaultTheme = Persister.loadYamlOrJson('src/themes/default/colors.json');
		const customTheme =
			themeName && Persister.loadYamlOrJson(`src/themes/${themeName}/colors.json`);
		console.log('### defaultTheme:', defaultTheme);
		console.log('### customTheme:', customTheme);

		// Todo: combine color themes together, clear up references and flatten structure

		// Todo: write combined color theme in to `this.colors`
		this.colors = { blue: 'green' };
	}

	/**
	 * Returns the corresponding color.
	 * @return The corresponding color.
	 */
	public getColor(colorId: string): string {
		// if color is not found return pink
		return this.colors[colorId] || '#FF69B4';
	}
}
