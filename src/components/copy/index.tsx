import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface CopyProps {
	size?: CopySize;
	textColor?: Color;
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
	${(props: StyledCopyProps) =>
		typeof props.size !== 'undefined' ? `font-size: ${props.size}px;` : ''};
	${(props: StyledCopyProps) =>
		typeof props.textColor !== 'undefined' ? `color: ${props.textColor.toString()};` : ''};
	line-height: 22px;
`;

export const Copy: React.SFC<CopyProps> = props => (
	<StyledCopy textColor={props.textColor} size={props.size}>
		{props.children}
	</StyledCopy>
);

export default Copy;
