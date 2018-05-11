import { colors } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyLabelProps {
	label: string;
}

const StyledLabel = styled.span`
	display: inline-block;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${colors.grey50.toString()};
	width: 30%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	user-select: none;
	cursor: default;
	box-sizing: border-box;
	padding-right: ${getSpace(SpaceSize.XS)}px;
`;

export const PropertyLabel: React.StatelessComponent<PropertyLabelProps> = props => {
	const { label } = props;

	return <StyledLabel title={label}>{label}</StyledLabel>;
};

export default PropertyLabel;
