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
`;

const StyledLeftSection = styled.div`
	flex-basis: 45%;
`;

const StyledRightSection = styled.div`
	flex-basis: 55%;
	background: grey;
`;

const SplashScreen: React.StatelessComponent<{}> = props => (
	<StyledSplashScreen>
		<StyledLeftSection>{props.children}</StyledLeftSection>
		<StyledRightSection />
	</StyledSplashScreen>
);

export default SplashScreen;
