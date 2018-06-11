import { PreviewTile, Space, SpaceSize } from '../../components';
import * as MobxReact from 'mobx-react';
import { Page } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import { EditableTitleContainer } from '../editable-title/editable-title-container';

export interface PageTileContainerProps {
	focused: boolean;
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
			store.setActivePage(this.props.page);
		}
	}

	protected handleDoubleClick(e: React.MouseEvent<HTMLElement>): void {
		if (this.props.page.getNameState() === Types.EditState.Editing) {
			return;
		}

		const { store } = this.props as PageTileContainerProps & { store: ViewStore };

		const next =
			store.getActiveAppView() === Types.AlvaView.Pages
				? Types.AlvaView.PageDetail
				: Types.AlvaView.Pages;

		store.setActivePage(this.props.page);
		store.setActiveAppView(next);
	}

	protected handleFocus(): void {
		this.props.page.setNameState(Types.EditState.Editing);
	}
	public render(): JSX.Element {
		const { props } = this;
		return (
			<Space size={SpaceSize.S}>
				<PreviewTile
					focused={props.focused}
					id={props.page.getId()}
					onClick={e => this.handleClick(e)}
					onDoubleClick={e => this.handleDoubleClick(e)}
					onFocus={e => this.handleFocus()}
				>
					<EditableTitleContainer
						focused={props.focused}
						page={props.page}
						value={props.page.getName()}
					/>
				</PreviewTile>
			</Space>
		);
	}
}
