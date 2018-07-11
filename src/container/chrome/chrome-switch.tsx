import { layoutMenu } from '../../electron/context-menus';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { getSpace, SpaceSize, LayoutSwitch } from '../../components';
import { ViewStore } from '../../store';

@MobxReact.inject('store')
@MobxReact.observer
export class ChromeSwitch extends React.Component {
	public render(): JSX.Element | null {
		const { store } = this.props as { store: ViewStore };

		const next =
			store.getShowPages() && store.getShowLeftSidebar() && store.getShowRightSidebar()
				? false
				: true;

		return (
			<div style={{ marginLeft: getSpace(SpaceSize.XXL * 2) }}>
				<LayoutSwitch
					active={!next}
					onPrimaryClick={() => {
						store.setShowPages(next);
						store.setShowLeftSidebar(next);
						store.setShowRightSidebar(next);
					}}
					onSecondaryClick={() => {
						layoutMenu(store);
					}}
					onDoubleClick={event => {
						event.stopPropagation();
					}}
				/>
			</div>
		);
	}
}
