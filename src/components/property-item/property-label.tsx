import { Color } from '../colors';
import { fonts } from '../fonts';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyLabelProps {
	label: string;
}

const StyledLabel = styled.span`
	display: inline-block;
	flex-shrink: 0;
	font-size: 12px;
	font-family: ${fonts().NORMAL_FONT};
	color: ${Color.Grey50};
	width: 30%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	user-select: none;
	cursor: default;
	box-sizing: border-box;
	padding: ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XS)}px ${getSpace(SpaceSize.XS)}px 0;
`;

export const PropertyLabel: React.StatelessComponent<PropertyLabelProps> = props => {
	const { label } = props;

	return <StyledLabel>{label}</StyledLabel>;
};
