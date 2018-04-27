import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

const StyledElementPane = styled.div`
	position: relative;
	flex: 1;
	overflow: scroll;
	padding-top: ${getSpace(Size.M)}px;
	padding-bottom: ${getSpace(Size.XL)}px;
`;

const ElementPane: React.StatelessComponent = props => (
	<StyledElementPane>{props.children}</StyledElementPane>
);

export default ElementPane;
