import * as Components from '@meetalva/components';
import * as MobxReact from 'mobx-react';
import * as Model from '../model';
import * as React from 'react';
import { ViewStore } from '../store';
import * as Types from '@meetalva/types';

export interface UserStorePropertySelectProps {
	autoFocus?: boolean;
	placeholder: string;
	menuIsOpen?: boolean;
	property: Model.UserStoreProperty | undefined;
	type?: Types.UserStorePropertyType;
	onChange: Components.CreateSelectProps['onChange'];
	onBlur?: React.ChangeEventHandler<HTMLElement>;
}

@MobxReact.inject('store')
@MobxReact.observer
export class UserStorePropertySelect extends React.Component<UserStorePropertySelectProps> {
	public render(): JSX.Element | null {
		const { store } = this.props as UserStorePropertySelectProps & { store: ViewStore };

		const options = store
			.getProject()
			.getUserStore()
			.getProperties()
			.filter(this.props.type ? p => p.getType() === this.props.type : () => true)
			.map(p => ({
				label: p.getName(),
				value: p.getId()
			}));

		return (
			<Components.CreateSelect
				autoFocus={this.props.autoFocus}
				menuIsOpen={this.props.menuIsOpen}
				options={options}
				placeholder={this.props.placeholder}
				onBlur={this.props.onBlur}
				onChange={this.props.onChange}
				value={
					this.props.property
						? { label: this.props.property.getName(), value: this.props.property.getId() }
						: undefined
				}
			/>
		);
	}
}
