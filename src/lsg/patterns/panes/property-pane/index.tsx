import * as React from 'react';
import { getSpace, Size } from '../../space';
import styled from 'styled-components';

const StyledPropertyPane = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 40%;
	padding: ${getSpace(Size.M)}px;
	overflow: scroll;
`;

const PropertyPane: React.StatelessComponent = props => (
	<StyledPropertyPane>{props.children}</StyledPropertyPane>
);

export default PropertyPane;
