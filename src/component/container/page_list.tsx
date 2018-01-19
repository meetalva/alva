import Dropdown from '../../lsg/patterns/dropdown';
import DropdownItem from '../../lsg/patterns/dropdown-item';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/project/page-ref';
import { Project } from '../../store/project/project';
import * as React from 'react';
import { Store } from '../../store/store';

export interface PageListProps {
	store: Store;
}

@observer
export class PageList extends React.Component<PageListProps> {
	@MobX.observable protected pageListVisible: boolean = false;
	public constructor(props: PageListProps) {
		super(props);

		this.handleDropdownToggle = this.handleDropdownToggle.bind(this);
		this.handlePageClick = this.handlePageClick.bind(this);
	}

	public render(): JSX.Element {
		const currentPage = this.props.store.getCurrentPage();
		let currentPageName = '';
		if (currentPage) {
			currentPageName = currentPage.getName();
		}
		return (
			<Dropdown
				label={currentPageName}
				handleClick={this.handleDropdownToggle}
				open={this.pageListVisible}
			>
				{this.getProjectPages().map((page: PageRef, index) => (
					<DropdownItem
						name={page.getName()}
						key={index}
						handleClick={(e: React.MouseEvent<HTMLElement>) => {
							e.preventDefault();
							this.handlePageClick(page.getId());
						}}
					/>
				))}
			</Dropdown>
		);
	}

	public getProjectPages(): PageRef[] {
		const project: Project | undefined = this.props.store.getCurrentProject();
		let projectPages: PageRef[] = [];
		if (project) {
			projectPages = project.getPages();
		}
		return projectPages;
	}

	@MobX.action
	protected handleDropdownToggle(): void {
		this.pageListVisible = !this.pageListVisible;
	}

	protected handlePageClick(id: string): void {
		this.props.store.openPage(id);
	}
}
