import * as React from 'react';
import { getSpace, SpaceSize } from '../../space';
import styled from 'styled-components';

const StyledPropertyPane = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 40%;
	padding: ${getSpace(SpaceSize.M)}px;
	overflow: auto;
`;

export interface PropertyPaneProps {
	children: React.ReactNode;
}

export const PropertyPane: React.StatelessComponent<PropertyPaneProps> = props => (
	<StyledPropertyPane>{props.children}</StyledPropertyPane>
);
