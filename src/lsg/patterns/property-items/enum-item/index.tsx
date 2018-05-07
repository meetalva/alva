import { colors } from '../../colors';
import { fonts } from '../../fonts';
import { Icon, IconName, IconSize } from '../../icons';
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

const StyledEnumItem = styled.label`
	width: 100%;
	margin-bottom: ${getSpace(SpaceSize.M)}px;
	display: flex;
	justify-content: space-between;
`;

const StyledSelectWrapper = styled.div`
	width: 70%;
	height: 30px;
	position: relative;
	display: inline-block;
	box-sizing: border-box;
	border-radius: 3px;
	background-color: ${colors.white.toString()};
	transition: all 0.1s;
`;

const StyledSelect = styled.select`
	appearance: none;
	box-sizing: border-box;
	width: 100%;
	height: 30px;
	padding: 0 ${getSpace(SpaceSize.XL)}px 0 ${getSpace(SpaceSize.S)}px;
	border: 1px solid ${colors.grey90.toString()};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-width: 0.5px;
	}
	background: none;
	border-radius: 3px;
	color: ${colors.grey20.toString()};
	font-family: ${fonts().NORMAL_FONT};
	font-size: 15px;
	text-overflow: ellipsis;
	transition: all 0.1s;
	&:hover {
		color: ${colors.black.toString()};
		border-color: ${colors.grey60.toString()};
	}
	&:focus {
		outline: none;
		color: ${colors.black.toString()};
		border-color: ${colors.blue40.toString()};
		box-shadow: 0 0 3px ${colors.blue.toString('rgb', { alpha: 0.4 })};
	}
`;

const StyledIcon = styled(Icon)`
	position: absolute;
	right: 0;
	fill: ${colors.grey60.toString()};
	width: 12px;
	height: 12px;
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px;
	transform: rotate(90deg);
	pointer-events: none;
`;

const StyledLabel = styled.span`
	display: inline-block;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey50.toString()};
	padding: ${getSpace(SpaceSize.XS) + getSpace(SpaceSize.XXS)}px 0 0;
	width: 30%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis
	user-select: none;
	cursor: default;
`;

export const EnumItem: React.StatelessComponent<EnumItemProps> = props => {
	const { className, values, selectedValue, onChange, label, required } = props;

	return (
		<StyledEnumItem className={className}>
			<StyledLabel title={label}>{label}</StyledLabel>
			<StyledSelectWrapper>
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
					))}
				</StyledSelect>
				<StyledIcon name={IconName.ArrowFillRight} size={IconSize.XXS} color={colors.grey60} />
			</StyledSelectWrapper>
		</StyledEnumItem>
	);
};

export default EnumItem;
