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
				defaultValue={selectedValue ? selectedValue.getId() : ''}
			>
				{!required && <option key="empty" value="" />}
				{values.map(value => (
					<option key={value.getId()} value={value.getId()}>
						{value.getName()}
					</option>
				))};
			</select>
		</StyledEnumItem>
	);
};

export default EnumItem;
