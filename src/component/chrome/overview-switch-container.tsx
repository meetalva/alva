import { observer } from 'mobx-react';
import { Project } from '../../store/project';
import * as React from 'react';
import { AlvaView, ViewStore } from '../../store';
import { ViewButton } from '../../lsg/patterns/view-switch';

@observer
export class OverviewSwitchContainer extends React.Component {
	public render(): JSX.Element | null {
		const store = ViewStore.getInstance();
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
