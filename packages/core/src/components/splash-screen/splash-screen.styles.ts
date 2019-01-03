import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';

export interface StyledSectionProps {
	type: 'primary' | 'secondary';
}

export interface StyledBoxProps {
	type: 'primary' | 'secondary';
}

export const StyledContainer = styled.div`
	position: relative;
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-columns: 1.75fr 1fr;
	grid-template-rows: auto 44px;
	align-items: stretch;
	-webkit-app-region: drag;
`;

export const StyledSection =
	styled.div <
	StyledSectionProps >
	`
	background: ${props => (props.type === 'primary' ? Color.White : Color.Grey97)};
	overflow: auto;
`;

export const StyledBox =
	styled.div <
	StyledBoxProps >
	`
	padding: ${props =>
		props.type === 'primary'
			? `${getSpace(SpaceSize.XXXL * 1.5)}px ${getSpace(SpaceSize.XXXL)}px ${getSpace(
					SpaceSize.XXXL
			  )}px ${getSpace(SpaceSize.XXXL)}px`
			: '0px'};
`;
