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

export const PropertyPane: React.StatelessComponent = props => (
	<StyledPropertyPane>{props.children}</StyledPropertyPane>
);

export default PropertyPane;
