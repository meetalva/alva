import * as Components from '../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewStore } from '../store';
import * as Types from '../types';

@MobxReact.inject('store')
@MobxReact.observer
export class PropertiesSwitch extends React.Component {
	public render(): JSX.Element | null {
		const { store } = this.props as { store: ViewStore };
		const app = store.getApp();

		return (
			<div style={{ display: 'flex', height: '100%' }}>
				<Components.TabSwitch
					label="Properties"
					title="Show Properties"
					type={Components.TabSwitchType.Tab}
					active={
						app.getRightSidebarTab() === Types.RightSidebarTab.Properties
							? Components.TabSwitchState.Active
							: Components.TabSwitchState.Default
					}
					onClick={() => app.setRightSidebarTab(Types.RightSidebarTab.Properties)}
				/>
				<Components.TabSwitch
					label="Project Settings"
					title="Show Project Settings"
					type={Components.TabSwitchType.Tab}
					active={
						app.getRightSidebarTab() === Types.RightSidebarTab.ProjectSettings
							? Components.TabSwitchState.Active
							: Components.TabSwitchState.Default
					}
					onClick={() => app.setRightSidebarTab(Types.RightSidebarTab.ProjectSettings)}
				/>
			</div>
		);
	}
}
