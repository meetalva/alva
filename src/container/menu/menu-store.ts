import * as Mobx from 'mobx';
import * as Types from '../../types';

export interface MenuMapEntry {
	menu: Types.MenuItem;
	active: boolean;
	depth: number;
}
export type MenuMap = Map<string, MenuMapEntry>;

export class MenuStore {
	@Mobx.observable private menus: MenuMap = new Map();

	@Mobx.computed
	get activeMenu(): MenuMapEntry | undefined {
		return [...this.menus].map(([, m]) => m).find(m => m.active);
	}

	constructor(menus: Types.MenuItem[]) {
		this.menus = flatten(menus, { map: this.menus, depth: 0 });
	}

	public get(id: string): { menu: Types.MenuItem; active: boolean } | undefined {
		return this.menus.get(id);
	}

	@Mobx.action
	public clear(): void {
		[...this.menus].map(([, menu]) => menu).forEach(menu => (menu.active = false));
	}

	@Mobx.action
	public toggle(id: string, forced?: boolean): void {
		const entry = this.menus.get(id);

		if (entry) {
			[...this.menus]
				.map(([, menu]) => menu)
				.filter(m => m.menu.id !== id && m.depth === entry.depth)
				.forEach(menu => (menu.active = false));

			entry.active = typeof forced !== 'undefined' ? forced : !entry.active;
		}
	}
}

function flatten(menus: Types.MenuItem[], init: { map: MenuMap; depth: number }): MenuMap {
	return menus.reduce((acc, menu) => {
		if (menu.hasOwnProperty('id')) {
			acc.set(menu.id, { menu, active: false, depth: init.depth });
		}

		if (menu.hasOwnProperty('submenu')) {
			const m = menu as Types.NestedMenuItem;
			flatten(m.submenu, { map: acc, depth: init.depth + 1 });
		}

		return acc;
	}, init.map);
}
