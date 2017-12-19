import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface CopyProps {
	textColor?: Color;
	size?: Size;
}

export interface StyledCopyProps {
	textColor?: Color;
	size?: Size;
}

export enum Size {
	S = 12,
	M = 15
}

const StyledCopy = styled.p`
	margin: 0;
	${(props: StyledCopyProps) => (props.size ? `font-size: ${props.size}px;` : '')};
	${(props: StyledCopyProps) => (props.textColor ? `color: ${props.textColor.toString()};` : '')};
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
