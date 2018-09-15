import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';

export interface ChromeButtonProps {
	onClick?: React.MouseEventHandler<HTMLElement>;
	onDoubleClick?: React.MouseEventHandler<HTMLElement>;
	title: string;
	icon?: React.ReactNode;
}

const StyledChromeButton = styled.div`
	display: flex;
	padding: 0 ${getSpace(SpaceSize.S)}px;
	align-items: center;
	-webkit-app-region: no-drag;
	box-sizing: border-box;
	border-radius: 3px;
	margin-left: ${getSpace(SpaceSize.S)}px;
	background: linear-gradient(to bottom, ${Color.White} 0%, ${Color.Grey97});
	height: 21px;
	box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.1), 0 0.5px 2px 0 rgba(0, 0, 0, 0.3);
	color: ${Color.Grey50};

	&:active {
		background: ${Color.Grey90};
	}
`;

const StyledIcon = styled.div`
	margin-right: 6px;
`;

export const ChromeButton: React.StatelessComponent<ChromeButtonProps> = props => (
	<StyledChromeButton {...props}>
		{props.icon ? <StyledIcon>{props.icon}</StyledIcon> : ''}
		<div>{props.title}</div>
	</StyledChromeButton>
);
