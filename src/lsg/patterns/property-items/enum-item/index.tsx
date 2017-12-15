import { colors } from '../../colors';
import { Option } from '../../../../store/pattern/property/enum_property';
import { fonts } from '../../fonts';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

export interface EnumItemProps {
	label: string;
	selectedValue?: Option;
	values: Option[];
	required?: boolean;
	className?: string;
	handleChange?: React.ChangeEventHandler<HTMLSelectElement>;
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
	border-bottom: 1px solid ${colors.grey70.toString()};
	padding-bottom: ${getSpace(Size.M)/2}px;
	margin-bottom: ${getSpace(Size.XXL)}px;
	
	&:focus {
		outline: none;
		border-color: ${colors.blue.toString()};
		color: ${colors.black.toString()};
	}
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(Size.XS)}px;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey70.toString()};
	text-transform: capitalize;
`;

export const EnumItem: React.StatelessComponent<EnumItemProps> = props => {
	const { className, values, selectedValue, handleChange, label, required } = props;

	return (
		<StyledEnumItem className={className}>
			<StyledLabel>{label}</StyledLabel>
			<StyledSelect
				className={className}
				onChange={handleChange}
				defaultValue={selectedValue ? selectedValue.getId() : ''}
			>
				{!required && <option key="empty" value="" />}
				{values.map(value => (
					<option key={value.getId()} value={value.getId()}>
						{value.getName()}
					</option>
				))};
			</StyledSelect>
		</StyledEnumItem>
	);
};

export default EnumItem;
