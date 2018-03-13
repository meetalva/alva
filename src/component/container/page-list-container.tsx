import * as React from 'react';

import PageList from './page-list';

import { PageRef } from '../../store/project/page-ref';
import { Project } from '../../store/project/project';
import { Store } from '../../store/store';

export interface PageListContainerProps {
	store: Store;
}

export default class PageListContainer extends React.Component<PageListContainerProps> {
	public render(): JSX.Element {
		return <PageList pages={this.getProjectPages()} />;
	}

	public getProjectPages(): PageRef[] {
		const project: Project | undefined = this.props.store.getCurrentProject();
		return project ? project.getPages() : [];
	}
}
