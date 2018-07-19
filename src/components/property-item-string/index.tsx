import * as React from 'react';
import { PropertyInput, PropertyInputType } from '../property-input';
import { PropertyItem } from '../property-item';
import { Link2, Package } from 'react-feather';
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

export const LinkIcon = styled(Link2)`
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	right: 0;
	box-sizing: border-box;
	padding: 3px 6px 3px 0;
	width: 20px;
	cursor: pointer;
	transition: stroke 0.3s ease-in-out;
	stroke: ${Color.Grey60};
	&:hover {
		stroke: ${Color.Blue20};
	}
`;

export const PackageIcon = styled(Package)`
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	right: 0;
	box-sizing: border-box;
	padding: 3px 6px 3px 0;
	width: 20px;
	cursor: pointer;
	transition: stroke 0.3s ease-in-out;
	stroke: ${Color.Grey60};
	&:hover {
		stroke: ${Color.Blue20};
	}
`;

export const UnlinkIcon: StyledComponentClass<{}, 'svg'> = styled(Link2)`
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
