import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import { EditableTitle } from '@meetalva/components';

export interface Renameable {
	getEditableState(): Types.EditableTitleState;
	setEditableState(state: Types.EditableTitleState): void;
	getEditableName(): string;
	setEditableName(editableName: string): void;
	getName(opts?: { unedited: boolean }): string;
	setName(name: string): void;
}

export interface EditableTitleContainerProps {
	item: Renameable;
}

@MobxReact.inject('store')
@MobxReact.observer
export class EditableTitleContainer extends React.Component<EditableTitleContainerProps> {
	@Mobx.action
	protected handleBlur(): void {
		const { store } = this.props as EditableTitleContainerProps & { store: ViewStore };

		if (this.props.item.getEditableName().trim().length === 0) {
			this.props.item.setName(this.props.item.getName({ unedited: true }));
			this.props.item.setEditableState(Types.EditableTitleState.Editable);
			return;
		}

		this.props.item.setEditableState(Types.EditableTitleState.Editable);
		this.props.item.setName(this.props.item.getEditableName());

		store.commit();
	}

	protected handleChange(e: React.ChangeEvent<HTMLInputElement>): void {
		this.props.item.setEditableName(e.target.value);
	}

	protected handleClick(e: React.MouseEvent<HTMLElement>): void {
		if (this.props.item.getEditableState() !== Types.EditableTitleState.Neutral) {
			const target = e.target as HTMLElement;

			if (target) {
				target.focus();
			}

			this.props.item.setEditableState(Types.EditableTitleState.Editing);
		}
	}

	protected handleKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
		const { store } = this.props as EditableTitleContainerProps & { store: ViewStore };

		switch (e.key) {
			case 'Escape':
				this.props.item.setEditableState(Types.EditableTitleState.Editable);
				this.props.item.setName(this.props.item.getName({ unedited: true }));
				store.getApp().setHasFocusedInput(false);
				return;
			case 'Enter':
				if (this.props.item.getEditableState() === Types.EditableTitleState.Editing) {
					if (!this.props.item.getName()) {
						this.props.item.setName(this.props.item.getName({ unedited: true }));
						this.props.item.setEditableState(Types.EditableTitleState.Editable);
						store.getApp().setHasFocusedInput(false);
						return;
					}

					this.props.item.setEditableState(Types.EditableTitleState.Editable);
					this.props.item.setName(this.props.item.getEditableName());
					store.getApp().setHasFocusedInput(false);
					store.commit();
					return;
				}
		}
	}

	public render(): JSX.Element {
		const { props } = this;

		return (
			<EditableTitle
				data-title={true}
				onBlur={() => this.handleBlur()}
				onChange={e => this.handleChange(e)}
				onClick={e => this.handleClick(e)}
				onKeyDown={e => this.handleKeyDown(e)}
				name={props.item.getName()}
				state={props.item.getEditableState()}
				value={props.item.getName()}
			/>
		);
	}
}
