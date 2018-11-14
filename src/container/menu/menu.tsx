import * as React from 'react';
import * as Types from '../../types';
import * as Components from '../../components';
import * as MobxReact from 'mobx-react';
import { MenuStore } from './menu-store';
import { ViewStore } from '../../store';

export interface MenuProps {
	variant: MenuVariant;
	menus: Types.MenuItem[];
}

export interface GenericMenuItemProps {
	variant: MenuVariant;
	menu: Types.MenuItem;
}

export interface SubMenuProps {
	variant: MenuVariant;
	menus: Types.MenuItem[];
}

export enum MenuVariant {
	Horizontal,
	Vertical
}

@MobxReact.observer
export class Menu extends React.Component<MenuProps> {
	private menuStore = new MenuStore(this.props.menus);

	public render(): JSX.Element | null {
		const { props } = this;

		return (
			<MobxReact.Provider menuStore={this.menuStore}>
				<ul
					style={{
						display: 'inline-flex',
						boxSizing: 'border-box',
						listStyle: 'none',
						padding: '0 15px 0 5px',
						margin: '0',
						cursor: 'default',
						background: Components.Color.White
					}}
				>
					{props.menus.map(menu => (
						<GenericMenuItem variant={MenuVariant.Horizontal} key={menu.id} menu={menu} />
					))}
					{this.menuStore.activeMenu && (
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								zIndex: 97,
								width: '100vw',
								height: '100vh'
							}}
							onClick={() => this.menuStore.clear()}
						/>
					)}
				</ul>
			</MobxReact.Provider>
		);
	}
}

export class SubMenu extends React.Component<SubMenuProps> {
	public render(): JSX.Element | null {
		const { props } = this;
		return (
			<ul
				style={{
					position: 'absolute',
					top: '100%',
					left: 0,
					listStyle: 'none',
					margin: 0,
					background: Components.Color.White,
					zIndex: 99,
					padding: props.variant === MenuVariant.Vertical ? '5px 0' : 0,
					minWidth: props.variant === MenuVariant.Vertical ? '240px' : 'auto',
					borderRadius: '0 0 5px 5px',
					border: `1px solid ${Components.Color.Grey90}`,
					boxShadow: `0 5px 10px rgba(0,0,0,.01)`
				}}
			>
				{props.menus.map(menu => {
					return (
						<div style={{ position: 'relative' }} key={menu.id}>
							<GenericMenuItem variant={MenuVariant.Vertical} menu={menu} />
						</div>
					);
				})}
			</ul>
		);
	}
}

class GenericMenuItem extends React.Component<GenericMenuItemProps> {
	public render(): JSX.Element | null {
		const { props } = this;

		if (props.menu.visible === false) {
			return null;
		}

		if (props.menu.hasOwnProperty('type') && (props.menu as any).type === 'separator') {
			return <SeperatorMenuItem />;
		}

		if (props.menu.hasOwnProperty('type') && (props.menu as any).type === 'checkbox') {
			const menu = props.menu as Types.CheckboxMenuItem;
			return <CheckboxMenuItem menu={menu} />;
		}

		if (props.menu.hasOwnProperty('submenu')) {
			const menu = props.menu as Types.NestedMenuItem;
			return <NestedMenuItem variant={props.variant} menu={menu} />;
		}

		const menu = props.menu as Types.ContentMenuItem;
		return <PlainMenuItem menu={menu} />;
	}
}

@MobxReact.inject('menuStore', 'store')
@MobxReact.observer
class PlainMenuItem extends React.Component<{ menu: Types.ContentMenuItem }> {
	public render(): JSX.Element | null {
		const props = this.props as NestedMenuItemProps & { menuStore: MenuStore; store: ViewStore };
		const menu = props.menuStore.get(props.menu.id);

		if (!menu) {
			return null;
		}

		return (
			<li
				style={{
					padding: '2.5px 15px 2.5px 20px',
					boxSizing: 'border-box',
					whiteSpace: 'nowrap',
					background: menu.active ? Components.Color.Blue : 'transparent',
					color: menu.active ? Components.Color.White : Components.Color.Black,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					alignSelf: 'center',
					opacity: props.menu.enabled === false ? 0.3 : 1
				}}
				onMouseEnter={() => {
					if (props.menu.enabled === false || !menu.menu.id) {
						return;
					}
					props.menuStore.toggle(menu.menu.id, true);
				}}
				onMouseLeave={() => {
					if (!menu.menu.id) {
						return;
					}
					props.menuStore.toggle(menu.menu.id, false);
				}}
				onClick={e => {
					e.preventDefault();

					if (props.menu.enabled === false) {
						return;
					}

					if (!menu.menu.id) {
						return;
					}

					props.menuStore.toggle(menu.menu.id, false);

					if (menu.menu.hasOwnProperty('click')) {
						const actionable = menu.menu as Types.ActionableMenuItem;
						if (typeof actionable.click !== 'undefined') {
							actionable.click(props.store.getSender());
						}
					}
				}}
			>
				{props.menu.label.replace(/\&([a-zA-Z].)/, '$1')}
				{props.menu.accelerator && (
					<AcceleratorIndicator accelerator={props.menu.accelerator} />
				)}
			</li>
		);
	}
}

@MobxReact.inject('menuStore', 'store')
@MobxReact.observer
class CheckboxMenuItem extends React.Component<{ menu: Types.CheckboxMenuItem }> {
	public render(): JSX.Element | null {
		const props = this.props as { menu: Types.CheckboxMenuItem } & {
			menuStore: MenuStore;
			store: ViewStore;
		};
		const menu = props.menuStore.get(props.menu.id);

		if (!menu) {
			return null;
		}

		return (
			<li
				style={{
					position: 'relative',
					padding: '2.5px 15px 2.5px 20px',
					boxSizing: 'border-box',
					whiteSpace: 'nowrap',
					background: menu.active ? Components.Color.Blue : 'transparent',
					color: menu.active ? Components.Color.White : Components.Color.Black,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					alignSelf: 'center',
					opacity: props.menu.enabled === false ? 0.3 : 1
				}}
				onMouseEnter={() => {
					if (props.menu.enabled === false) {
						return;
					}
					props.menuStore.toggle(props.menu.id, true);
				}}
				onMouseLeave={() => {
					if (props.menu.enabled === false) {
						return;
					}
					props.menuStore.toggle(props.menu.id, false);
				}}
				onClick={e => {
					e.preventDefault();

					if (props.menu.enabled === false) {
						return;
					}

					if (!menu.menu.id) {
						return;
					}

					props.menuStore.toggle(menu.menu.id, false);
					if (menu.menu.hasOwnProperty('click')) {
						const actionable = menu.menu as Types.ActionableMenuItem;
						if (typeof actionable.click !== 'undefined') {
							actionable.click(props.store.getSender());
						}
					}
				}}
			>
				{props.menu.checked ? (
					<div
						style={{
							display: 'flex',
							alignSelf: 'center',
							justifyContent: 'center',
							position: 'absolute',
							top: '2.5px',
							left: '5px'
						}}
					>
						✔
					</div>
				) : null}
				{props.menu.label.replace(/\&([a-zA-Z].)/, '$1')}
				{props.menu.accelerator && (
					<AcceleratorIndicator accelerator={props.menu.accelerator} />
				)}
			</li>
		);
	}
}

class SeperatorMenuItem extends React.Component {
	public render(): JSX.Element | null {
		return (
			<div
				style={{
					width: '100%',
					borderBottom: `1px solid ${Components.Color.Grey90}`,
					margin: `5px 0`,
					boxSizing: 'border-box'
				}}
			/>
		);
	}
}

interface NestedMenuItemProps {
	menu: Types.NestedMenuItem;
	variant: MenuVariant;
}

@MobxReact.inject('menuStore')
@MobxReact.observer
class NestedMenuItem extends React.Component<NestedMenuItemProps> {
	public render(): JSX.Element | null {
		const props = this.props as NestedMenuItemProps & { menuStore: MenuStore };
		const menu = props.menuStore.get(props.menu.id);

		if (!menu) {
			return null;
		}

		return (
			<li
				style={{
					display: 'flex',
					alignSelf: 'center',
					position: 'relative',
					zIndex: 98,
					padding: '5px 10px',
					boxSizing: 'border-box',
					background: menu.active ? Components.Color.Blue : 'transparent',
					color: menu.active ? Components.Color.White : Components.Color.Black,
					opacity: props.menu.enabled === false ? 0.3 : 1
				}}
				onClick={e => {
					e.preventDefault();

					if (props.menu.enabled === false) {
						return;
					}

					props.menuStore.toggle(props.menu.id);
				}}
				onMouseEnter={() => {
					if (!props.menuStore.activeMenu) {
						return;
					}

					if (props.menu.enabled === false) {
						return;
					}

					if (!menu.menu.id) {
						return;
					}

					props.menuStore.toggle(menu.menu.id, true);
				}}
			>
				{props.menu.label.replace(/\&([a-zA-Z].)/, '$1')}
				{menu.active && <SubMenu variant={MenuVariant.Vertical} menus={props.menu.submenu} />}
			</li>
		);
	}
}

export interface AcceleratorIndicatorProps {
	accelerator: string;
}

class AcceleratorIndicator extends React.Component<AcceleratorIndicatorProps> {
	public render(): JSX.Element | null {
		return <div>{parseAccelerator(this.props.accelerator)}</div>;
	}
}

function parseAccelerator(accelerator: string): string {
	return accelerator
		.split('+')
		.map(item => {
			switch (item) {
				case 'Cmd':
				case 'Command':
				case 'CommandOrCtrl':
				case 'CmdOrCtrl':
					return '⌘';
				case 'Ctrl':
				case 'Control':
					return '⌃';
				case 'Shift':
					return '⇧';
				case 'Alt':
				case 'Option':
					return '⌥';
				case 'Left':
					return '←';
				case 'Right':
					return '→';
				case 'Delete':
					return '⌫';
				default:
					return item;
			}
		})
		.join('');
}
