import { colors } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export interface ButtonProps {
	icon: React.ReactNode;
	onClick?: React.MouseEventHandler<HTMLElement>;
}

const StyledFloatingButton = styled.button`
	background: transparent;
	border: none;
	box-sizing: border-box;
	color: ${colors.white.toString()};
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
		background: ${colors.blue.toString()};
		border-radius: 50%;
	}
	&:hover {
		&::before {
			content: '';
			display: block;
			padding-top: 100%;
			background: ${colors.blue20.toString()};
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

export const FloatingButton: React.SFC<ButtonProps> = props => (
	<StyledFloatingButton onClick={props.onClick}>
		<StyledFloatingButtonContent>{props.icon}</StyledFloatingButtonContent>
	</StyledFloatingButton>
);
