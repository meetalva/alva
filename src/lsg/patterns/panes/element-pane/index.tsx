import * as React from 'react';
import styled from 'styled-components';
import { colors } from '../../colors';

const StyledElementPane = styled.div`
	position: relative;
	flex-grow: 3;
	flex-shrink: 0;
	flex-basis: 60%;
	overflow: scroll;

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

	/*FadeOut*/
	&::after {
		content: '';
		position: sticky;
		bottom: 0;
		display: block;
		width: 100%;
		height: 40px;
		background: linear-gradient(
			to bottom,
			rgba(247, 247, 247, 0) 0%,
			rgba(247, 247, 247, 0.5) 15%,
			rgba(247, 247, 247, 1) 100%
		);
	}
`;

const ElementPane: React.StatelessComponent = props => (
	<StyledElementPane>{props.children}</StyledElementPane>
);

export default ElementPane;
