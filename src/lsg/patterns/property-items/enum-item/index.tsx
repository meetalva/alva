import { getSpace, Size } from '../../space/index';
import { fonts } from '../../fonts/index';
import { colors } from '../../colors/index';
import * as React from 'react';
import styled from 'styled-components';

export interface EnumItemProps {
	label: string;
	selectedValue?: string;
	values: string[];
	required?: boolean;
	className?: string;
	handleChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

const StyledEnumItem = styled.div`
	width: 100%;
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(Size.XS)}px;
	font-size: 14px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey70.toString()};
`;

export const EnumItem: React.StatelessComponent<EnumItemProps> = props => {
	const { className, values, selectedValue, handleChange, label, required } = props;

	return (
		<StyledEnumItem className={className}>
			<StyledLabel>{label}</StyledLabel>
			<select
				className={className}
				onChange={handleChange}
				value={selectedValue || 'emptyValue'}
			>
				{!required && <option key="emptyValue" value="emptyValue" />}
				{values.map(value => (
					<option value={value} key={value}>
						{value}
					</option>
				))};
			</select>
		</StyledEnumItem>
	);
};

export default EnumItem;
