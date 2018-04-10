import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

const StyledPatternsPane = styled.div`
	box-sizing: border-box;
	flex: 1;
	padding: ${getSpace(SpaceSize.M)}px;
	overflow: scroll;
	margin-left: -${getSpace(SpaceSize.L)}px;
	margin-right: -${getSpace(SpaceSize.L)}px;
`;

const PatternsPane: React.StatelessComponent = props => (
	<StyledPatternsPane>{props.children}</StyledPatternsPane>
);

export default PatternsPane;
