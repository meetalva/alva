import { AlvaApp } from '.';
import { Message } from './message';

export type MenuItem = ContentMenuItem | SeperatorMenuItem;

export type ContentMenuItem = ActionableMenuItem | NestedMenuItem;

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

export interface ActionableMenuItem {
	id: string;
	click?(app: AlvaApp): void;
	accelerator?: string;
	enabled?: boolean;
	label: string;
	message?: Message;
	role?: MenuItemRole;
	visible?: boolean;
}

export interface CheckboxMenuItem {
	id: string;
	click?(app: AlvaApp): void;
	accelerator?: string;
	enabled?: boolean;
	checked: boolean;
	label: string;
	message?: Message;
	role?: MenuItemRole;
	visible?: boolean;
	type?: 'checkbox';
}

export interface ServiceMenuItem {
	id: string;
	role?: 'services';
	submenu: MenuItem[];
	visible?: boolean;
}

export interface SeperatorMenuItem {
	id: string;
	type?: 'separator';
	visible?: boolean;
}

export interface NestedMenuItem {
	id: string;
	label: string;
	role?: 'app' | 'about' | 'edit' | 'help' | 'window';
	accelerator?: 'string';
	submenu: MenuItem[];
	visible?: boolean;
	enabled?: boolean;
}

export interface MenuContext<T = unknown> {
	app?: AlvaApp;
	project?: T;
}

export interface ElementMenuContext<T = unknown> {
	app: AlvaApp;
	project: T;
	element: Element;
}

export type ContextMenuItem = ActionableMenuItem | SeperatorMenuItem;

export interface MenuProps {
	variant: MenuVariant;
	menus: MenuItem[];
}

export interface GenericMenuItemProps {
	variant: MenuVariant;
	menu: MenuItem;
}

export interface SubMenuProps {
	visible: boolean;
	variant: MenuVariant;
	menus: MenuItem[];
}

export enum MenuVariant {
	Horizontal,
	Vertical
}
