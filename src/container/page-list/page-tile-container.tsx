import { PageTile } from '../../components';
import * as MobxReact from 'mobx-react';
import { Page } from '../../model';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';

export interface PageTileContainerProps {
	focused: boolean;
	page: Page;
}

@MobxReact.inject('store')
@MobxReact.observer
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
		const { store } = this.props as PageTileContainerProps & { store: ViewStore };

		if (!this.props.page.getName()) {
			this.props.page.setName(this.props.page.getName({ unedited: true }));
			this.props.page.setNameState(Types.EditState.Editable);
			return;
		}

		const name = this.props.page.getName();
		const editedName = this.props.page.getEditedName();

		this.props.page.setNameState(Types.EditState.Editable);
		this.props.page.setName(this.props.page.getEditedName());

		if (editedName !== name) {
			store.commit();
		}
	}

	protected handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.props.page.setName(e.target.value);
	}

	protected handleClick(e: React.MouseEvent<HTMLElement>): void {
		const { store } = this.props as PageTileContainerProps & { store: ViewStore };

		const target = e.target as HTMLElement;

		if (!this.props.focused) {
			store.setActivePage(this.props.page);
		}

		if (this.props.focused && target.matches('[data-title]')) {
			this.props.page.setNameState(Types.EditState.Editing);
		}
	}

	protected handleFocus(): void {
		this.props.page.setNameState(Types.EditState.Editing);
	}

	protected handleKeyDown(e: KeyboardEvent): void {
		const { store } = this.props as PageTileContainerProps & { store: ViewStore };

		switch (e.key) {
			case 'Escape':
				this.props.page.setNameState(Types.EditState.Editable);
				this.props.page.setName(this.props.page.getName({ unedited: true }));
				return;
			case 'Enter':
				if (this.props.page.getNameState() === Types.EditState.Editing) {
					if (!this.props.page.getName()) {
						this.props.page.setName(this.props.page.getName({ unedited: true }));
						this.props.page.setNameState(Types.EditState.Editable);
						return;
					}

					this.props.page.setNameState(Types.EditState.Editable);
					this.props.page.setName(this.props.page.getEditedName());
					store.commit();
					return;
				}
				if (
					e.target === document.body &&
					this.props.focused &&
					this.props.page.getNameState() === Types.EditState.Editable
				) {
					this.props.page.setNameState(Types.EditState.Editing);
					return;
				}
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<PageTile
				focused={props.focused}
				id={props.page.getId()}
				onBlur={e => this.handleBlur()}
				onChange={e => this.handleChange(e)}
				onClick={e => this.handleClick(e)}
				onFocus={e => this.handleFocus()}
				onKeyDown={e => {
					e.stopPropagation();
					this.handleKeyDown(e.nativeEvent);
				}}
				nameState={props.page.getNameState()}
				name={props.page.getName()}
			/>
		);
	}
}
