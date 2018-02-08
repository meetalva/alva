import Dropdown from '../../lsg/patterns/dropdown';
import { DropdownItemEditableLink } from '../../lsg/patterns/dropdown-item';
import * as MobX from 'mobx';
import { observer } from 'mobx-react';
import { PageRef } from '../../store/project/page-ref';
import { Project } from '../../store/project/project';
import * as React from 'react';
import { Store } from '../../store/store';

export interface PageListProps {
	store: Store;
}

export interface PageListItemProps {
	id: string;
	name: string;
	pageRef: PageRef;
	store: Store;
}

@observer
export class PageListItem extends React.Component<PageListItemProps> {
	@MobX.observable protected pageElementEditable: boolean = false;
	@MobX.observable protected pageName: string;

	public constructor(props: PageListItemProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.handlePageKeyDown = this.handlePageKeyDown.bind(this);
		this.handlePageClick = this.handlePageClick.bind(this);
		this.handlePageDoubleClick = this.handlePageDoubleClick.bind(this);
	}
	public render(): JSX.Element {
		return (
			<DropdownItemEditableLink
				editable={this.pageElementEditable}
				name={this.props.name}
				handleChange={this.handleInputChange}
				handleClick={(e: React.MouseEvent<HTMLElement>) => {
					e.preventDefault();
					this.handlePageClick(this.props.id);
				}}
				handleDoubleClick={this.handlePageDoubleClick}
				handleKeyDown={this.handlePageKeyDown}
			/>
		);
	}

	protected handlePageClick(id: string): void {
		this.props.store.openPage(id);
	}

	@MobX.action
	protected handlePageDoubleClick(): void {
		this.pageElementEditable = !this.pageElementEditable;
	}

	@MobX.action
	protected handlePageKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
		if (e.key !== 'Enter') {
			return;
		}
		if (!this.pageName) {
			this.pageElementEditable = false;
			return;
		}
		this.props.pageRef.setName(this.pageName);
		this.props.pageRef.setId(Store.convertToId(this.pageName));
		this.pageElementEditable = false;
		// when the page name is empty not change the name
		// set page name editable to false
	}

	protected handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.pageName = e.target.value;
		// const foo = this.props.pageRef.getProject();
		// this.props.store.renamePage(foo);
	}
}

@observer
export class PageList extends React.Component<PageListProps> {
	@MobX.observable protected pageListVisible: boolean = false;
	public constructor(props: PageListProps) {
		super(props);

		this.handleDropdownToggle = this.handleDropdownToggle.bind(this);
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
					<PageListItem
						id={page.getId()}
						key={index}
						name={page.getName()}
						pageRef={page}
						store={this.props.store}
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
}
