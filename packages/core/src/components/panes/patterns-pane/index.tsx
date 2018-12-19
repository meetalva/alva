import { Color } from '../../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

const StyledPatternsPane = styled.div`
	box-sizing: border-box;
	flex: 1;
	padding: 0 ${getSpace(SpaceSize.M)}px;
	overflow-y: auto;
	height: 100%;
	border-top: 1px solid ${Color.BlackAlpha13};

	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-top-width: 0.5px;
	}
`;

export interface PatternsPaneProps {
	children?: React.ReactNode;
}

export const PatternsPane: React.StatelessComponent<PatternsPaneProps> = props => (
	<StyledPatternsPane>{props.children}</StyledPatternsPane>
);
