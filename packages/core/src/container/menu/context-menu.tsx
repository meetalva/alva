import * as React from 'react';
import * as MobxReact from 'mobx-react';
import * as Store from '../../store';
import * as Menu from './menu';
import * as Components from '@meetalva/components';
import * as Types from '@meetalva/types';

@MobxReact.inject('menuStore')
@MobxReact.observer
export class ContextMenu extends React.Component {
	public render(): JSX.Element | null {
		const { menuStore } = this.props as { menuStore: Store.MenuStore };

		if (menuStore.topLevel.length === 0) {
			return null;
		}

		return (
			<>
				<ul
					style={{
						position: 'fixed',
						zIndex: 97,
						top: menuStore.position.y,
						left: menuStore.position.x,
						cursor: 'default',
						boxSizing: 'border-box',
						listStyle: 'none',
						padding: '5px 0',
						margin: '0',
						background: Components.Color.White,
						borderRadius: 5,
						border: `1px solid ${Components.Color.Grey90}`,
						minWidth: 160
					}}
					onContextMenu={e => e.preventDefault()}
					onClick={() => menuStore.reset()}
				>
					{menuStore.topLevel.map(menu => (
						<Menu.GenericMenuItem
							variant={Types.MenuVariant.Horizontal}
							key={menu.id}
							menu={menu}
						/>
					))}
				</ul>
				{menuStore.topLevel.length > 0 && (
					<div
						style={{
							position: 'fixed',
							top: 0,
							left: 0,
							zIndex: 96,
							width: '100vw',
							height: '100vh'
						}}
						onClick={() => menuStore.reset()}
						onContextMenu={() => menuStore.reset()}
					/>
				)}
			</>
		);
	}
}
