/**
 * A - AlvaApp
 * M - Message
 */
export type MenuItem<A, M> = ContentMenuItem<A, M> | SeperatorMenuItem;

export type ContentMenuItem<A, M> = ActionableMenuItem<A, M> | NestedMenuItem<A, M>;

export type MenuItemRole =
	| 'app'
	| 'about'
	| 'quit'
	| 'hide'
	| 'hideothers'
	| 'unhide'
	| 'edit'
	| 'help'
	| 'window';

export interface ActionableMenuItem<A, M> {
	id: string;
	click?(app: A): void;
	accelerator?: string;
	enabled?: boolean;
	label: string;
	message?: M;
	role?: MenuItemRole;
	visible?: boolean;
}

export interface CheckboxMenuItem<T, M> {
	id: string;
	click?(app: T): void;
	accelerator?: string;
	enabled?: boolean;
	checked: boolean;
	label: string;
	message?: M;
	role?: MenuItemRole;
	visible?: boolean;
	type?: 'checkbox';
}

export interface ServiceMenuItem<T, M> {
	id: string;
	role?: 'services';
	submenu: MenuItem<T, M>[];
	visible?: boolean;
}

export interface SeperatorMenuItem {
	id: string;
	type?: 'separator';
	visible?: boolean;
}

export interface NestedMenuItem<A, M> {
	id: string;
	label: string;
	role?: 'app' | 'about' | 'edit' | 'help' | 'window';
	accelerator?: 'string';
	submenu: MenuItem<A, M>[];
	visible?: boolean;
	enabled?: boolean;
}

/**
 * A - App
 * P - Project
 */
export interface MenuContext<A, P> {
	app?: A;
	project?: P;
}

/**
 * A - App
 * P - Project
 * E - Element
 */
export interface ElementMenuContext<A, P, E> {
	app: A;
	project: P;
	element: E;
}

export type ContextMenuItem<T, M> = ActionableMenuItem<T, M> | SeperatorMenuItem;

export interface MenuProps<T, M> {
	variant: MenuVariant;
	menus: MenuItem<T, M>[];
}

export interface GenericMenuItemProps<T, M> {
	variant: MenuVariant;
	menu: MenuItem<T, M>;
}

export interface SubMenuProps<T, M> {
	visible: boolean;
	variant: MenuVariant;
	menus: MenuItem<T, M>[];
}

export enum MenuVariant {
	Horizontal,
	Vertical
}
