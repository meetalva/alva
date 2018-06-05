import * as React from 'react';
import { PageInset } from '../space';
import styled from 'styled-components';

const StyledSplashScreen = styled.div`
	box-sizing: border-box;
	display: flex;
	width: 100%;
	height: 100vh;
	align-items: center;
	justify-content: center;
	padding: 0 ${PageInset.XL}px;
	transform: translateY(-54px);
	user-select: none;
	cursor: default;
`;

const StyledLeftSection = styled.div`
	flex-basis: 45%;
`;

export interface SplashScreenProps {
	children?: React.ReactNode;
}

export const SplashScreen: React.StatelessComponent<SplashScreenProps> = props => (
	<StyledSplashScreen>
		<StyledLeftSection>{props.children}</StyledLeftSection>
	</StyledSplashScreen>
);

export default SplashScreen;
