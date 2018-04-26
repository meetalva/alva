import { colors } from '../../colors';
import * as React from 'react';
import styled from 'styled-components';

const StyledPropertyPane = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 40%;
	border-left: 1px solid ${colors.black.toString('rgb', { alpha: 0.1 })};
	@media screen and (-webkit-min-device-pixel-ratio: 2) {
		border-left-width: 0.5px;
	}
`;

const PropertyPane: React.StatelessComponent = props => (
	<StyledPropertyPane>{props.children}</StyledPropertyPane>
);

export default PropertyPane;
