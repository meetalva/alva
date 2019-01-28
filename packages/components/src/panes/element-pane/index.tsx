import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

const StyledElementPane = styled.div`
	position: relative;
	flex: 1;
	overflow: auto;
	padding-top: ${getSpace(SpaceSize.M)}px;
	padding-bottom: ${getSpace(SpaceSize.XL)}px;
`;

export interface ElementPaneProps {
	children?: React.ReactNode;
}

export const ElementPane: React.StatelessComponent<ElementPaneProps> = props => (
	<StyledElementPane>{props.children}</StyledElementPane>
);
