import { observer } from 'mobx-react';
import { Project } from '../../store/project';
import * as React from 'react';
import { Store } from '../../store/store';
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

		const title = store.pageOverviewIsOpened ? `Show "${page.getName()}"` : 'Pages';

		return <ViewButton onClick={() => store.togglePageOverview()} title={title} />;
	}
}
