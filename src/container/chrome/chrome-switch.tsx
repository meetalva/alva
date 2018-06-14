import { IconName, TabSwitchState } from '../../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { TabSwitch } from '../../components';
import { ViewStore } from '../../store';

@MobxReact.inject('store')
@MobxReact.observer
export class ChromeSwitch extends React.Component {
	public render(): JSX.Element | null {
		const { store } = this.props as { store: ViewStore };

		return (
			<div style={{ display: 'flex', height: '100%' }}>
				<TabSwitch
					icon={IconName.Page}
					title={'Pages'}
					active={store.getShowPages() ? TabSwitchState.Active : TabSwitchState.Default}
					onClick={() => store.setShowPages(!store.getShowPages())}
				/>
				<TabSwitch
					icon={IconName.Element}
					title={'Elements & Library'}
					active={store.getShowLeftSidebar() ? TabSwitchState.Active : TabSwitchState.Default}
					onClick={() => store.setShowLeftSidebar(!store.getShowLeftSidebar())}
				/>
			</div>
		);
	}
}
