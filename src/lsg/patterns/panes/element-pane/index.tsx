import { colors } from '../../colors';
import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

const StyledElementPane = styled.div`
	position: relative;
	flex: 1;
	overflow: scroll;
	padding-top: ${getSpace(Size.M)}px;
	padding-bottom: ${getSpace(Size.XL)}px;

	&::after {
		content: '';
		position: sticky;
		bottom: 0;
		display: block;
		width: 100%;
		height: ${getSpace(Size.XXXL)}px;
		background: linear-gradient(
			to bottom,
			${colors.grey97.toString('rgb', { alpha: 0 })},
			${colors.grey97.toString('rgb', { alpha: 1 })}
		);
		z-index: 15;
	}
`;

const ElementPane: React.StatelessComponent = props => (
	<StyledElementPane>{props.children}</StyledElementPane>
);

export default ElementPane;
