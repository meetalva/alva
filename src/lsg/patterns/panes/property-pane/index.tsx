import * as React from 'react';
import styled from 'styled-components';

const StyledPropertyPane = styled.div`
	flex-grow: 1;
	flex-shrink: 0;
	flex-basis: 40%;
`;

const PropertyPane: React.StatelessComponent<{}> = props => <StyledPropertyPane>{props.children}</StyledPropertyPane>;

export default PropertyPane;
