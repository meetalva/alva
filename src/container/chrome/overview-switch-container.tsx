import { ViewButton } from '../../components';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';

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

		const title =
			store.getActiveAppView() === Types.AlvaView.Pages ? `Show "${page.getName()}"` : 'Pages';

		const next =
			store.getActiveAppView() === Types.AlvaView.Pages
				? Types.AlvaView.PageDetail
				: Types.AlvaView.Pages;

		return <ViewButton onClick={() => store.setActiveAppView(next)} title={title} />;
	}
}
