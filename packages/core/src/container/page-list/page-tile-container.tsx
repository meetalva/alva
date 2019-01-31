import { PageTile } from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import { Page, DroppablePageIndex } from '@meetalva/model';
import * as React from 'react';
import { WithStore } from '../../store';
import * as Types from '@meetalva/types';
import { EditableTitleContainer } from '../editable-title/editable-title-container';

export interface PageTileContainerProps {
	focused: boolean;
	highlighted: boolean;
	isDroppable: DroppablePageIndex;
	page: Page;
}

@MobxReact.inject('store')
@MobxReact.observer
export class PageTileContainer extends React.Component<PageTileContainerProps> {
	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as PageTileContainerProps & WithStore;

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
			store.getProject().setFocusedItem(this.props.page);
		}
	}

	private handleFocus(): void {
		this.props.page.setNameState(Types.EditableTitleState.Editing);
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<PageTile
				focused={props.focused}
				highlighted={props.highlighted}
				isDroppable={{
					back: props.isDroppable.back,
					next: props.isDroppable.next
				}}
				id={props.page.getId()}
				onClick={e => this.handleClick(e)}
				onFocus={e => this.handleFocus()}
			>
				<EditableTitleContainer item={props.page} />
			</PageTile>
		);
	}
}
