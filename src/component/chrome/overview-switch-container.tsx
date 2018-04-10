import { observer } from 'mobx-react';
import { Project } from '../../store/project';
import * as React from 'react';
import { Store } from '../../store/store';
import { ViewSwitch } from '../../lsg/patterns/view-switch';

@observer
export class OverviewSwitchContainer extends React.Component {
	protected getName(): string {
		const store = Store.getInstance();
		const project: Project | undefined = store.getCurrentProject();
		if (store.pageOverviewIsOpened) {
			return 'Pages';
		} else {
			return project ? project.getName() : 'Unnamed Project';
		}
	}

	public render(): JSX.Element {
		const store = Store.getInstance();
		return (
			<ViewSwitch
				onLeftClick={() => store.togglePageOverview()}
				leftVisible={true}
				rightVisible={false}
				title={`${this.getName()} Overview`}
			/>
		);
	}
}
