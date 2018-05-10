import { observer } from 'mobx-react';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../store/types';
import { ViewButton } from '../../lsg/patterns/view-switch';

@observer
export class OverviewSwitchContainer extends React.Component {
	public render(): JSX.Element | null {
		const store = ViewStore.getInstance();
		const project = store.getCurrentProject();
		const page = store.getCurrentPage();

		if (!project || !page) {
			return null;
		}

		const title =
			store.getActiveView() === Types.AlvaView.Pages ? `Show "${page.getName()}"` : 'Pages';

		const next =
			store.getActiveView() === Types.AlvaView.Pages
				? Types.AlvaView.PageDetail
				: Types.AlvaView.Pages;

		return <ViewButton onClick={() => store.setActiveView(next)} title={title} />;
	}
}
