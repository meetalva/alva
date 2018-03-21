import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface CopyProps {
	size?: Size;
	textColor?: Color;
}

export interface StyledCopyProps {
	size?: Size;
	textColor?: Color;
}

export enum Size {
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

export default class Copy extends React.Component<CopyProps> {
	public render(): JSX.Element {
		return (
			<StyledCopy textColor={this.props.textColor} size={this.props.size}>
				{this.props.children}
			</StyledCopy>
		);
	}
}
