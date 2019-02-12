import * as React from 'react';
import styled from '@emotion/styled';
import { Color } from '../colors';
import { fonts } from '../fonts';

export interface LinkProps {
	/** @name Color */
	color?: Color;

	onClick?: React.MouseEventHandler<HTMLDivElement>;
	children?: React.ReactNode;
}

export const Link =
	styled.div <
	LinkProps >
	`
	display: inline-block;
	color: ${props => props.color || 'inherit'};
	font-family: ${fonts().NORMAL_FONT};
`;
