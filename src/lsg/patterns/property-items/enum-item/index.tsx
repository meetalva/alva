import { colors } from '../../colors';
import { fonts } from '../../fonts';
import { Icon, IconName, Size as IconSize } from '../../icons';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

export interface Values {
	id: string;
	name: string;
}

export interface EnumItemProps {
	className?: string;
	handleChange?: React.ChangeEventHandler<HTMLSelectElement>;
	label: string;
	required?: boolean;
	selectedValue?: string;
	values: Values[];
}

export interface StyledIconProps {
	open?: boolean;
}

const StyledEnumItem = styled.div`
	width: 100%;
`;

const StyledSelectWrapper = styled.div`
	width: 100%;
	position: relative;
	display: block;
	margin-bottom: ${getSpace(Size.M)}px;
	border: 0.5px solid ${colors.grey90.toString()};
	border-radius: 3px;
	background-color: ${colors.white.toString()};
`;

const StyledSelect = styled.select`
	appearance: none;
	box-sizing: border-box;
	width: calc(100% - ${getSpace(Size.XL)}px);
	padding: ${getSpace(Size.XS)}px;

	border: none;

	background: none;

	color: ${colors.black.toString()};

	font-family: ${fonts().NORMAL_FONT};
	font-size: 12px;
	text-overflow: ellipsis;

	transition: all 0.2s;

	&:hover {
		color: ${colors.black.toString()};
		border-color: ${colors.grey60.toString()};
	}

	&:focus {
		outline: none;
		border-color: ${colors.blue40.toString()};
		color: ${colors.black.toString()};
		box-shadow: 0 0 3px ${colors.blue40.toString()};
	}
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	right: 0;
	fill: ${colors.grey60.toString()};
	width: 12px;
	height: 12px;
	padding: ${getSpace(Size.XS)}px;
	transform: rotate(90deg);
`;

const StyledLabel = styled.span`
	display: block;
	margin-bottom: ${getSpace(Size.XXS)}px;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey36.toString()};
`;

export const EnumItem: React.StatelessComponent<EnumItemProps> = props => {
	const { className, values, selectedValue, handleChange, label, required } = props;

	return (
		<StyledEnumItem className={className}>
			<StyledLabel>{label}</StyledLabel>
			<StyledSelectWrapper>
				<StyledSelect
					className={className}
					onChange={handleChange}
					value={selectedValue ? selectedValue : ''}
				>
					{!required && <option key="empty" value="" />}
					{values.map(value => (
						<option key={value.id} value={value.id}>
							{value.name}
						</option>
					))}
				</StyledSelect>
				<StyledIcon name={IconName.ArrowFill} size={IconSize.XXS} color={colors.grey60} />
			</StyledSelectWrapper>
		</StyledEnumItem>
	);
};

export default EnumItem;
