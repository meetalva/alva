import { PageTile } from '../../components';
import * as MobxReact from 'mobx-react';
import { Page } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import { EditableTitleContainer } from '../editable-title/editable-title-container';

export interface PageTileContainerProps {
	focused: boolean;
	highlighted: boolean;
	page: Page;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PageTileContainer extends React.Component<PageTileContainerProps> {
	protected handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.props.page.setName(e.target.value);
	}

	protected handleClick(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as PageTileContainerProps & { store: ViewStore };

		if (!this.props.focused) {
			store.getProject().setActivePage(this.props.page);
		}

		const target = e.target as HTMLElement;

		store.getProject().setActivePage(this.props.page);

		if (this.props.highlighted && target.matches('[data-title]')) {
			this.props.page.setNameState(Types.EditableTitleState.Editing);
		}

		const rootElement = this.props.page.getRoot();

		if (rootElement) {
			store.setSelectedElement(rootElement);
			store.getProject().setFocusedItem(Types.FocusedItemType.Page, this.props.page);
		}
	}

	protected handleFocus(): void {
		this.props.page.setNameState(Types.EditableTitleState.Editing);
	}

	protected handleDoubleClick(e: React.MouseEvent<HTMLElement>): void {
		if (this.props.page.getNameState() === Types.EditableTitleState.Editing) {
			return;
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<PageTile
				focused={props.focused}
				highlighted={props.highlighted}
				id={props.page.getId()}
				onClick={e => this.handleClick(e)}
				onFocus={e => this.handleFocus()}
			>
				<EditableTitleContainer
					focused={props.focused}
					page={props.page}
					secondary={Types.EditableTitleType.Primary}
				/>
			</PageTile>
		);
	}
}
