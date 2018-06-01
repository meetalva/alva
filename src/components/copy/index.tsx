import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface CopyProps {
	size?: CopySize;
	textColor?: Color;
	children?: React.ReactNode;
}

export interface StyledCopyProps {
	size?: CopySize;
	textColor?: Color;
}

export enum CopySize {
	S = 12,
	M = 15
}

const StyledCopy = styled.p`
	margin: 0;
	line-height: 1.5;
	${(props: StyledCopyProps) =>
		typeof props.size !== 'undefined' ? `font-size: ${props.size}px;` : 'font-size: 12px'};
	${(props: StyledCopyProps) =>
		typeof props.textColor !== 'undefined' ? `color: ${props.textColor};` : ''};
`;

export const Copy: React.StatelessComponent<CopyProps> = props => (
	<StyledCopy textColor={props.textColor} size={props.size}>
		{props.children}
	</StyledCopy>
);
