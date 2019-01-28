import styled from 'styled-components';
import { Color } from '../colors';
import { getSpace, SpaceSize } from '../space';

export interface StyledSectionProps {
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
`;

export const StyledSection =
	styled.div <
	StyledSectionProps >
	`
	display: ${props => (props.type === 'primary' ? 'flex' : '')};;
	flex-direction: column;
	justify-content: center;
	background: ${props => (props.type === 'primary' ? Color.White : Color.Grey97)};
	text-align: ${props => (props.type === 'primary' ? 'center' : '')};
	overflow: auto;
`;
