import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

const StyledPatternsPane = styled.div`
	box-sizing: border-box;
	flex: 1;
	padding: ${getSpace(Size.M)}px;
	overflow: scroll;
	margin-left: -${getSpace(Size.L)}px;
	margin-right: -${getSpace(Size.L)}px;
`;

const PatternsPane: React.StatelessComponent = props => (
	<StyledPatternsPane>{props.children}</StyledPatternsPane>
);

export default PatternsPane;
