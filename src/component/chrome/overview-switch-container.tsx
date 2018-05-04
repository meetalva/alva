import { observer } from 'mobx-react';
import { Project } from '../../store/project';
import * as React from 'react';
import { AlvaView, Store } from '../../store/store';
import { ViewButton } from '../../lsg/patterns/view-switch';

@observer
export class OverviewSwitchContainer extends React.Component {
	public render(): JSX.Element | null {
		const store = Store.getInstance();
		const project: Project | undefined = store.getCurrentProject();
		const page = store.getCurrentPage();

		if (!project || !page) {
			return null;
		}

		const title = store.getActiveView() === AlvaView.Pages ? `Show "${page.getName()}"` : 'Pages';
		const next = store.getActiveView() === AlvaView.Pages ? AlvaView.PageDetail : AlvaView.Pages;

		return <ViewButton onClick={() => store.setActiveView(next)} title={title} />;
	}
}
