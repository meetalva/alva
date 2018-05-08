import { PreviewTile } from '../../lsg/patterns/preview-tile/index';
import Space, { SpaceSize } from '../../lsg/patterns/space/index';
import { observer } from 'mobx-react';
import * as React from 'react';
import { AlvaView, EditState, Page, ViewStore } from '../../store';

export interface PageTileContainerProps {
	focused: boolean;
	page: Page;
}

@observer
export class PageTileContainer extends React.Component<PageTileContainerProps> {
	private onKeyDown: (e: KeyboardEvent) => void;

	public componentDidMount(): void {
		this.onKeyDown = e => this.handleKeyDown(e);
		document.addEventListener('keydown', this.onKeyDown);
	}

	public componentWillUnmount(): void {
		if (this.onKeyDown) {
			document.removeEventListener('keydown', this.onKeyDown);
		}
	}

	protected handleBlur(): void {
		if (!this.props.page.getName()) {
			this.props.page.setName(this.props.page.getName({ unedited: true }));
			this.props.page.setNameState(EditState.Editable);
			return;
		}

		this.props.page.setNameState(EditState.Editable);
		this.props.page.setName(this.props.page.getEditedName());
		ViewStore.getInstance().save();
	}

	protected handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.props.page.setName(e.target.value);
	}

	protected handleClick(e: React.MouseEvent<HTMLElement>): void {
		// const store = Store.getInstance();

		const target = e.target as HTMLElement;

		if (!this.props.focused) {
			// store.openPage(this.props.page.getId());
		}

		if (this.props.focused && target.matches('[data-title]')) {
			this.props.page.setNameState(EditState.Editing);
		}
	}

	protected handleDoubleClick(e: React.MouseEvent<HTMLElement>): void {
		if (this.props.page.getNameState() === EditState.Editing) {
			return;
		}

		const store = ViewStore.getInstance();
		const next = store.getActiveView() === AlvaView.Pages ? AlvaView.PageDetail : AlvaView.Pages;

		// store.openPage(this.props.page.getId());
		store.setActiveView(next);
	}

	protected handleFocus(): void {
		this.props.page.setNameState(EditState.Editing);
	}

	protected handleKeyDown(e: KeyboardEvent): void {
		switch (e.key) {
			case 'Escape':
				this.props.page.setNameState(EditState.Editable);
				this.props.page.setName(this.props.page.getName({ unedited: true }));
				return;
			case 'Enter':
				if (this.props.page.getNameState() === EditState.Editing) {
					if (!this.props.page.getName()) {
						this.props.page.setName(this.props.page.getName({ unedited: true }));
						this.props.page.setNameState(EditState.Editable);
						return;
					}

					this.props.page.setNameState(EditState.Editable);
					this.props.page.setName(this.props.page.getEditedName());
					return;
				}
				if (
					e.target === document.body &&
					this.props.focused &&
					this.props.page.getNameState() === EditState.Editable
				) {
					this.props.page.setNameState(EditState.Editing);
					return;
				}
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<Space size={SpaceSize.S}>
				<PreviewTile
					focused={props.focused}
					id={props.page.getId()}
					onBlur={e => this.handleBlur()}
					onChange={e => this.handleChange(e)}
					onClick={e => this.handleClick(e)}
					onDoubleClick={e => this.handleDoubleClick(e)}
					onFocus={e => this.handleFocus()}
					onKeyDown={e => {
						e.stopPropagation();
						this.handleKeyDown(e.nativeEvent);
					}}
					nameState={props.page.getNameState()}
					name={props.page.getName()}
				/>
			</Space>
		);
	}
}
