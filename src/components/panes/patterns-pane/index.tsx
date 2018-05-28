import { colors } from '../../colors';
import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

const StyledPatternsPane = styled.div`
	box-sizing: border-box;
	flex: 1;
	padding: ${getSpace(SpaceSize.M)}px;
	overflow: scroll;
	border-top: 1px solid ${colors.black.toString('rgb', { alpha: 0.1 })};

	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-top-width: 0.5px;
	}
`;

export const PatternsPane: React.StatelessComponent = props => (
	<StyledPatternsPane>{props.children}</StyledPatternsPane>
);

export default PatternsPane;
