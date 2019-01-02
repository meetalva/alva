import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface CopyProps {
	size?: CopySize;
	textColor?: Color;
	children?: React.ReactNode;
	cut?: boolean;
}

export interface StyledCopyProps {
	size?: CopySize;
	textColor?: Color;
	cut?: boolean;
}

export enum CopySize {
	S = 12,
	M = 15
}

const StyledCopy =
	styled.p <
	StyledCopyProps >
	`
	margin: 0;
	line-height: 1.5;
	cursor: default;
	${props => (typeof props.size !== 'undefined' ? `font-size: ${props.size}px;` : 'font-size: 12px')};
	${props => (typeof props.textColor !== 'undefined' ? `color: ${props.textColor};` : '')};
	white-space: ${props => (props.cut ? 'nowrap' : 'normal')};
	overflow: ${props => (props.cut ? 'hidden' : 'auto')};
	text-overflow: ${props => (props.cut ? 'ellipsis' : 'clip')};
`;

export const Copy: React.StatelessComponent<CopyProps> = props => (
	<StyledCopy textColor={props.textColor} size={props.size} cut={props.cut}>
		{props.children}
	</StyledCopy>
);
