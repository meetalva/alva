import Element from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledTestDiv = styled.div`
	flex-grow: 1;
	max-width: 200px;
	padding: 20px 10px;
`;

const ElementDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<div>
		<StyledTestDiv>
			<Element title="Element">Child</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			<Element active title="Active Element" />
		</StyledTestDiv>
	</div>
);

export default ElementDemo;
