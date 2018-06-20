import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as React from 'react';

import { Page } from '../../model';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import { EditableTitle } from '../../components';

export interface EditableTitleContainerProps {
	focused: boolean;
	page: Page;
	secondary: Types.EditableTitleType;
	value: string;
}

@MobxReact.inject('store')
@MobxReact.observer
export class EditableTitleContainer extends React.Component<EditableTitleContainerProps> {
	@Mobx.observable
	private editNameState: Types.EditableTitleState = Types.EditableTitleState.Editable;

	@Mobx.action
	protected handleBlur(): void {
		const { store } = this.props as EditableTitleContainerProps & { store: ViewStore };

		if (!this.props.page.getName()) {
			this.props.page.setName(
				this.props.page.getName({ unedited: true }),
				Types.EditableTitleState.Editing
			);
			this.editNameState = Types.EditableTitleState.Editable;
			return;
		}

		const name = this.props.page.getName();
		const editedName = this.props.page.getEditedName();

		this.editNameState = Types.EditableTitleState.Editable;
		this.props.page.setName(this.props.page.getEditedName());

		if (editedName !== name) {
			store.commit();
		}
	}

	protected handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.props.page.setName(e.target.value, this.editNameState);
	}

	protected handleClick(e: React.MouseEvent<HTMLElement>): void {
		if (this.editNameState === Types.EditableTitleState.Editable) {
			const target = e.target as HTMLElement;
			if (target) {
				target.focus();
			}

			this.editNameState = Types.EditableTitleState.Editing;
		}
	}

	protected handleFocus(): void {
		this.editNameState = Types.EditableTitleState.Editing;
		this.props.page.setNameState(Types.EditableTitleState.Editing);
	}

	protected handleKeyDown(e: KeyboardEvent): void {
		const { store } = this.props as EditableTitleContainerProps & { store: ViewStore };

		switch (e.key) {
			case 'Escape':
				this.editNameState = Types.EditableTitleState.Editable;
				this.props.page.setName(
					this.props.page.getName({ unedited: true }),
					Types.EditableTitleState.Editing
				);
				return;
			case 'Enter':
				if (this.editNameState === Types.EditableTitleState.Editing) {
					if (!this.props.page.getName()) {
						this.props.page.setName(
							this.props.page.getName({ unedited: true }),
							this.editNameState
						);
						this.editNameState = Types.EditableTitleState.Editable;
						return;
					}

					this.editNameState = Types.EditableTitleState.Editable;
					this.props.page.setName(this.props.page.getEditedName(), this.editNameState);
					store.commit();
					return;
				}
				if (
					e.target === document.body &&
					this.props.focused &&
					this.editNameState === Types.EditableTitleState.Editable
				) {
					this.editNameState = Types.EditableTitleState.Editing;
					return;
				}
		}
	}

	public render(): JSX.Element {
		const { props } = this;
		return (
			<EditableTitle
				data-title={true}
				focused={props.focused}
				onBlur={e => this.handleBlur()}
				onChange={e => this.handleChange(e)}
				onClick={e => this.handleClick(e)}
				onFocus={e => this.handleFocus()}
				onKeyDown={e => {
					e.stopPropagation();
					this.handleKeyDown(e.nativeEvent);
				}}
				name={props.page.getName()}
				nameState={this.editNameState}
				category={props.secondary}
				value={props.page.getName()}
			/>
		);
	}
}
