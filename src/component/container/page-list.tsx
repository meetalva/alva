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
	pageID: string;
	name: string;
	pageRef: PageRef;
	store: Store;
}

@observer
export class PageListItem extends React.Component<PageListItemProps> {
	@MobX.observable protected pageElementEditable: boolean = false;
	@MobX.observable
	protected pageNameInputValue: string = this.pageNameInputValue || this.props.name;

	public constructor(props: PageListItemProps) {
		super(props);

		this.handleInputChange = this.handleInputChange.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handlePageKeyDown = this.handlePageKeyDown.bind(this);
		this.handlePageClick = this.handlePageClick.bind(this);
		this.handlePageDoubleClick = this.handlePageDoubleClick.bind(this);
		this.renamePage = this.renamePage.bind(this);
	}
	public render(): JSX.Element {
		return (
			<DropdownItemEditableLink
				editable={this.pageElementEditable}
				focused={this.pageElementEditable}
				handleChange={this.handleInputChange}
				handleClick={this.handlePageClick}
				handleDoubleClick={this.handlePageDoubleClick}
				handleKeyDown={this.handlePageKeyDown}
				name={this.props.name}
				handleBlur={this.handleBlur}
				value={this.pageNameInputValue}
			/>
		);
	}

	protected handlePageClick(e: React.MouseEvent<HTMLElement>): void {
		e.preventDefault();
		this.props.store.openPage(this.props.pageID);
	}

	@MobX.action
	protected handleBlur(): void {
		this.pageElementEditable = false;
		this.pageNameInputValue = this.props.name;
	}

	@MobX.action
	protected handlePageDoubleClick(): void {
		this.pageElementEditable = !this.pageElementEditable;
	}

	@MobX.action
	protected handlePageKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
		switch (e.key.toString()) {
			case 'Escape':
				this.pageNameInputValue = this.props.name;
				this.pageElementEditable = false;
				break;

			case 'Enter':
				if (!this.pageNameInputValue) {
					this.pageNameInputValue = this.props.name;
					this.pageElementEditable = false;
					return;
				}

				this.renamePage(this.pageNameInputValue);
				this.pageElementEditable = false;
				break;

			default:
				return;
		}
	}

	protected handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.pageNameInputValue = e.target.value;
	}

	protected renamePage(name: string): void {
		const pageRef = this.props.pageRef;
		pageRef.setName(name);
		pageRef.updatePathFromNames();
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
						key={page.getId()}
						name={page.getName()}
						pageID={page.getId()}
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
