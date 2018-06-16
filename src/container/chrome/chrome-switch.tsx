import { IconSize, TabSwitchState } from '../../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { File, Layers, Sliders } from 'react-feather';
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
					active={store.getShowPages() ? TabSwitchState.Active : TabSwitchState.Default}
					onClick={() => store.setShowPages(!store.getShowPages())}
				>
					<File size={IconSize.XS} />
				</TabSwitch>
				<TabSwitch
					active={store.getShowLeftSidebar() ? TabSwitchState.Active : TabSwitchState.Default}
					onClick={() => store.setShowLeftSidebar(!store.getShowLeftSidebar())}
				>
					<Layers size={IconSize.XS} />
				</TabSwitch>
				<TabSwitch
					active={store.getShowRightSidebar() ? TabSwitchState.Active : TabSwitchState.Default}
					onClick={() => store.setShowRightSidebar(!store.getShowRightSidebar())}
				>
					<Sliders size={IconSize.XS} />
				</TabSwitch>
			</div>
		);
	}
}
