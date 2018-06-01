import { Color } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface FloatingButtonProps {
	icon: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledFloatingButton = styled.button`
	background: transparent;
	border: none;
	box-sizing: border-box;
	color: ${Color.White};
	cursor: pointer;
	margin: 0;
	min-width: 56px;
	overflow: hidden;
	padding: 0;
	position: relative;
	&::before {
		content: '';
		display: block;
		padding-top: 100%;
		background: ${Color.Blue};
		border-radius: 50%;
	}
	&:focus {
		outline: none;
	}
	&:hover {
		&::before {
			content: '';
			display: block;
			padding-top: 100%;
			background: ${Color.Blue20};
			border-radius: 50%;
		}
	}
`;

const StyledFloatingButtonContent = styled.div`
	box-sizing: border-box;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const FloatingButton: React.SFC<FloatingButtonProps> = props => (
	<StyledFloatingButton onClick={props.onClick}>
		<StyledFloatingButtonContent>{props.icon}</StyledFloatingButtonContent>
	</StyledFloatingButton>
);
