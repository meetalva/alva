import * as React from 'react';
import { PropertyInput, PropertyInputType } from '../property-input';
import { PropertyItem } from '../property-item';
import { Link2 } from 'react-feather';
import styled, { StyledComponentClass } from 'styled-components';
import { Color } from '../colors';

export interface PropertyItemStringProps {
	className?: string;
	description?: string;
	label: string;
	onBlur?: React.FocusEventHandler<HTMLInputElement>;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	placeholder?: string;
	value?: string;
	icon?: React.ReactNode;
	children?(renderProps: PropertyItemStringProps): JSX.Element | null;
}

// tslint:disable-next-line:no-any
export const LinkIcon: StyledComponentClass<{}, any, any> = styled(Link2)`
	position: absolute;
	right: 0;
	box-sizing: border-box;
	padding: 3px 6px 3px 0;
	width: 20px;
	cursor: pointer;
	transition: stroke 0.3s ease-in-out;
	&:hover {
		stroke: ${Color.Blue20};
	}
`;

// tslint:disable-next-line:no-any
export const UnlinkIcon: StyledComponentClass<{}, any, any> = styled(Link2)`
	position: absolute;
	right: 0;
	box-sizing: border-box;
	padding: 3px 6px 3px 0;
	width: 20px;
	cursor: pointer;
	transition: stroke 0.3s ease-in-out;
	&:hover {
		stroke: ${Color.Red};
	}
`;

export const PropertyItemString: React.StatelessComponent<PropertyItemStringProps> = props => (
	<PropertyItem description={props.description} label={props.label}>
		{props.icon}
		{typeof props.children === 'function' && props.children(props)}
		{typeof props.children === 'undefined' && (
			<PropertyInput
				onChange={props.onChange}
				onBlur={props.onBlur}
				type={PropertyInputType.Text}
				value={props.value || ''}
				placeholder={props.placeholder}
			/>
		)}
	</PropertyItem>
);
