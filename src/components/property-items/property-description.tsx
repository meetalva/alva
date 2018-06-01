import { Color } from '../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export interface PropertyDescriptionProps {
	description: string;
}

const StyledDescription = styled.span`
	flex: none;
	display: block;
	font-size: 12px;
	color: ${Color.Grey50};
	user-select: none;
	cursor: default;
	box-sizing: border-box;
	padding-right: ${getSpace(SpaceSize.XS)}px;
	padding-top: ${getSpace(SpaceSize.XXS)}px;
	width: 70%;
	margin-left: 30%;
`;

export const PropertyDescription: React.StatelessComponent<PropertyDescriptionProps> = props => {
	const { description } = props;

	return <StyledDescription title={description}>{description}</StyledDescription>;
};
