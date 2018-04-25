import { colors } from '../../colors';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

const StyledElementPane = styled.div`
	position: relative;
	flex-grow: 3;
	flex-shrink: 0;
	flex-basis: 60%;
	overflow: scroll;
	padding-top: ${getSpace(Size.M)}px;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		display: block;
		width: 1px;
		height: 100%;
		border-right: 0.5px solid ${colors.black.toString('rgb', { alpha: 0.1 })};
		box-sizing: border-box;
		z-index: 10;
	}
`;

const ElementPane: React.StatelessComponent = props => (
	<StyledElementPane>{props.children}</StyledElementPane>
);

export default ElementPane;
