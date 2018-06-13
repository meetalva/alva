import { ViewButton } from '../../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewStore } from '../../store';

@MobxReact.inject('store')
@MobxReact.observer
export class OverviewSwitchContainer extends React.Component {
	public render(): JSX.Element | null {
		const { store } = this.props as { store: ViewStore };
		const project = store.getProject();
		const page = store.getCurrentPage();

		if (!project || !page) {
			return null;
		}

		const title = store.getShowPages() ? 'Hide Pages' : 'Show Pages';

		return (
			<ViewButton
				title={title}
				onClick={() => store.setShowPages(!store.getShowPages())}
				rotateIcon={!store.getShowPages()}
			/>
		);
	}
}
