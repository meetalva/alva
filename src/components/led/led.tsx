import { Color } from '../colors';
import * as React from 'react';
import * as Space from '../space';
import styled from 'styled-components';

export enum LedColor {
	Grey,
	Orange,
	Green,
	Red
}

export interface LedProps {
	ledColor: LedColor;
	label?: string;
}

export const Led: React.SFC<LedProps> = props => (
	<StyledLedOuterContainer>
		<StyledLedContainer ledColor={props.ledColor}>
			<StyledLed ledColor={props.ledColor} />
		</StyledLedContainer>
		{props.label && <StyledLedLabel ledColor={props.ledColor}>{props.label}</StyledLedLabel>}
	</StyledLedOuterContainer>
);

const COLOR = (props: LedProps): string => {
	switch (props.ledColor) {
		case LedColor.Green:
			return Color.SignalGreen;
		case LedColor.Orange:
			return Color.Orange;
		case LedColor.Red:
			return Color.Red;
		case LedColor.Grey:
			return Color.Grey50;
	}
};

const StyledLedOuterContainer = styled.div`
	display: flex;
	align-items: center;
	margin: ${Space.getSpace(Space.SpaceSize.S)}px 0;
`;

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

const StyledLedLabel = styled.div`
	color: ${COLOR};
	margin-left: ${Space.getSpace(Space.SpaceSize.XS)}px;
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
