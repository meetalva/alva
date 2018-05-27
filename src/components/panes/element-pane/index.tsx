import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

const StyledElementPane = styled.div`
	position: relative;
	flex: 1;
	overflow: scroll;
	padding-top: ${getSpace(SpaceSize.M)}px;
	padding-bottom: ${getSpace(SpaceSize.XL)}px;
`;

export const ElementPane: React.StatelessComponent = props => (
	<StyledElementPane>{props.children}</StyledElementPane>
);

export default ElementPane;
