import { IconName, IconRegistry } from '../icons';
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
			Default
			<Element title="Active Element" />
		</StyledTestDiv>
		<StyledTestDiv>
			Active
			<Element active title="Active Element" />
		</StyledTestDiv>

		<StyledTestDiv>
			With Child and clickhandler
			<Element
				handleIconClick={() => {
					console.log('Clicked');
				}}
				title="Element"
			>
				Child
			</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			With Child and open
			<Element title="Element Open" open>
				Child
			</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			With child and active
			<Element active title="Active Element">
				Child
			</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			With child, active and open
			<Element active open title="Active Element">
				Child
			</Element>
		</StyledTestDiv>

		<IconRegistry names={IconName} />
	</div>
);

export default ElementDemo;
