import { Color } from '../colors';
import { PropertyItem } from '../property-item';
import { getIcon, isIcon } from '../icons';
import * as React from 'react';
import styled from 'styled-components';
import { SpaceSize, getSpace } from '../space';
import { Copy, CopySize } from '../copy';

export interface PropertyItemButtonGroupValues {
	id: string;
	name: string;
	icon: string;
}

export interface PropertyItemButtonGroupProps {
	className?: string;
	description?: string;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	required?: boolean;
	selectedValue?: string;
	values: PropertyItemButtonGroupValues[];
}

export interface ButtonGroupItemProps {
	active: boolean;
	name: string;
	id: string;
	icon: string;
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const StyledButtonGroup = styled.div`
	display: flex;
	box-sizing: border-box;
	width: 100%;
	height: 30px;
	border: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	background: ${Color.White};
	border-radius: 3px;
`;

const StyledItem = styled.label`
	box-sizing: border-box;
	text-align: center;
	flex-grow: 1;
	margin: ${getSpace(SpaceSize.XS)}px 0;
	display: flex;
	align-items: center;
	user-select: none;
	justify-content: center;
	border-right: 1px solid ${Color.Grey90};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-right-width: 0.5px;
	}
	color: ${(props: ButtonGroupItemProps) => (props.active ? Color.Blue : Color.Grey60)};

	&:first-of-type {
		border-radius: 3px 0 0 3px;
	}

	&:last-of-type {
		border-right: none;
		border-radius: 0 3px 3px 0;
	}

	&:active {
		color: ${Color.Grey20};
	}
`;

const StyledInput = styled.input`
	display: none;
`;

export const ButtonGroupItem: React.StatelessComponent<ButtonGroupItemProps> = props => {
	const icon = isIcon(props.icon) ? props.icon : 'Box';

	return (
		<StyledItem
			icon={props.icon}
			id={props.id}
			active={props.active}
			name={props.name}
			title={props.name}
		>
			{props.icon ? (
				getIcon({ icon: icon || 'Box', size: 18, strokeWidth: 1.5 })
			) : (
				<Copy size={CopySize.S}>{props.name}</Copy>
			)}
			<StyledInput
				type="radio"
				id={props.id}
				name="buttongroup"
				value={props.id}
				onChange={props.onChange}
			/>
		</StyledItem>
	);
};

export const PropertyItemButtonGroup: React.StatelessComponent<
	PropertyItemButtonGroupProps
> = props => (
	<PropertyItem description={props.description} label={props.label}>
		<StyledButtonGroup>
			{props.values.map(value => (
				<ButtonGroupItem
					name={value.name}
					icon={value.icon}
					id={value.id}
					key={value.id}
					onChange={props.onChange}
					active={value.id === props.selectedValue}
				/>
			))}
		</StyledButtonGroup>
	</PropertyItem>
);
