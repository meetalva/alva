import { colors } from '../../colors';
import { fonts } from '../../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

export interface Values {
	id: string;
	name: string;
}

export interface EnumItemProps {
	className?: string;
	label: string;
	onChange?: React.ChangeEventHandler<HTMLSelectElement>;
	required?: boolean;
	selectedValue?: string;
	values: Values[];
}

const StyledEnumItem = styled.div`
	width: 100%;
`;

const StyledSelect = styled.select`
	appearance: none;
	border: none;
	border-radius: 0;
	font-size: 1em;
	width: 100%;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey36.toString()};
	font-size: 15px;
	border-bottom: 1px solid transparent;
	padding-bottom: ${getSpace(SpaceSize.M) / 2}px;
	margin-bottom: ${getSpace(SpaceSize.L)}px;
	transition: all 0.2s;

	&:hover {
		color: ${colors.black.toString()};
		border-color: ${colors.grey60.toString()};
	}

	&:focus {
		outline: none;
		border-color: ${colors.blue40.toString()};
		color: ${colors.black.toString()};
	}
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(SpaceSize.XS)}px;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey36.toString()};
`;

export const EnumItem: React.StatelessComponent<EnumItemProps> = props => {
	const { className, values, selectedValue, onChange, label, required } = props;

	return (
		<StyledEnumItem className={className}>
			<StyledLabel>{label}</StyledLabel>
			<StyledSelect
				className={className}
				onChange={onChange}
				value={selectedValue ? selectedValue : ''}
			>
				{!required && <option key="empty" value="" />}
				{values.map(value => (
					<option key={value.id} value={value.id}>
						{value.name}
					</option>
				))};
			</StyledSelect>
		</StyledEnumItem>
	);
};

export default EnumItem;
