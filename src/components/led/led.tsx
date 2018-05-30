import { colors } from '../colors';
import * as React from 'react';
import styled from 'styled-components';

export enum LedColor {
	Grey,
	Orange,
	Green,
	Red
}

export interface LedProps {
	ledColor: LedColor;
}

export const Led: React.SFC<LedProps> = props => (
	<StyledLedContainer ledColor={props.ledColor}>
		<StyledLed ledColor={props.ledColor} />
	</StyledLedContainer>
);

const COLOR = (props: LedProps): string => {
	switch (props.ledColor) {
		case LedColor.Green:
			return colors.green.toString();
		case LedColor.Orange:
			return colors.orange.toString();
		case LedColor.Red:
			return colors.red.toString();
		case LedColor.Grey:
			return colors.grey50.toString();
	}
};

const StyledLedContainer = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 15px;
	height: 15px;
	&::before {
		position: absolute;
		z-index: 1;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		content: '';
		width: 75%;
		height: 75%;
		filter: blur(3px);
		opacity: 0.6;
		background-color: ${COLOR};
		mix-blend-mode: multiply;
	}
`;

const StyledLed = styled.div`
	position: relative;
	z-index: 2;
	width: 50%;
	height: 50%;
	border-radius: 50%;
	background-color: ${COLOR};
	border: 0.5px solid rgba(0, 0, 0, 0.4);
`;
