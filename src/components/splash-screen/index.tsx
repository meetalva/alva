import * as React from 'react';
import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';

export type SplashScrenType = 'primary' | 'secondary';
export interface SplashScreenSectionProps {
	type: SplashScrenType;
}

interface StyledSectionProps {
	type: SplashScrenType;
}

const StyledContainer = styled.div`
	position: relative;
	display: grid;
	grid-template-columns: 50vw 50vw;
	grid-template-rows: 30vh 70vh;
	grid-column-gap: ${getSpace(SpaceSize.XL)}px;
	align-items: stretch;
`;

const StyledSection = styled.div`
	grid-row-start: 2;
	justify-self: center;
	padding: 0 ${getSpace(SpaceSize.XL)}px;
	${(props: StyledSectionProps) => {
		switch (props.type) {
			case 'secondary':
				return `
				:after {
					content: "";
						position: absolute;
						top: -40px;
						left: 0;
						z-index: -1;
						width: 100vw;
						height: calc(100% + 40px);
						background-color: ${Color.White};
						transform: translatex(50%);
					}
				`;
			default:
				return '';
		}
	}};
`;

const StyledBox = styled.div`
	max-width: 480px;
`;

export const SplashScreenSection: React.SFC<SplashScreenSectionProps> = props => (
	<StyledSection type={props.type}>
		<StyledBox>{props.children}</StyledBox>
	</StyledSection>
);

export const SplashScreen: React.SFC<{}> = props => (
	<StyledContainer>{props.children}</StyledContainer>
);

export default SplashScreen;
