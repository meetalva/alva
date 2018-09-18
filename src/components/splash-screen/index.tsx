import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';

const StyledSplashScreen = styled.div`
	box-sizing: border-box;
	display: flex;
	width: 100%;
	margin-top: -40px;
	height: 100vh;
	align-items: stretch;
	justify-content: center;
	-webkit-app-region: drag;
`;

const StyledLeftSection = styled.div`
	flex-shrink: 0;
	flex-grow: 0;
	width: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
`;
const StyledRightSection = styled.div`
	flex-shrink: 0;
	flex-grow: 0;
	width: 50%;
	background-color: ${Color.White};
	display: flex;
	align-items: center;
	justify-content: center;
`;

const StyledBox = styled.div`
	max-width: 480px;
	padding: ${getSpace(SpaceSize.XL)}px;
`;

export interface SplashScreenProps {
	leftSection?: React.ReactNode;
	rightSection?: React.ReactNode;
}

export const SplashScreen: React.StatelessComponent<SplashScreenProps> = props => (
	<StyledSplashScreen>
		<StyledLeftSection>
			<StyledBox>{props.leftSection}</StyledBox>
		</StyledLeftSection>
		<StyledRightSection>
			<StyledBox>{props.rightSection}</StyledBox>
		</StyledRightSection>
	</StyledSplashScreen>
);

export default SplashScreen;
