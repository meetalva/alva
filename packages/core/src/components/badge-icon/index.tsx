import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';
import { Copy, CopySize } from '../copy';

export interface BadgeIconProps {
	color: Color;
}

const StyledBadge = styled.div`
	display: flex;
	height: 15px;
	width: 15px;
	padding-top: 1px;
	box-sizing: border-box;
	justify-content: center;
	font-weight: bold;
	font-size: 10px;
	border-radius: 50%;
	background: ${(props: BadgeIconProps) => props.color};
	color: ${Color.White};
`;

export const BadgeIcon: React.StatelessComponent<BadgeIconProps> = props => {
	return <StyledBadge color={props.color}>{props.children}</StyledBadge>;
};
