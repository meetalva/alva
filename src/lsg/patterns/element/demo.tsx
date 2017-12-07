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
			<Element title="Element Open" open>
				Child
			</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			<Element active title="Active Element" />
		</StyledTestDiv>
		<StyledTestDiv>
			<Element active open title="Active Element">
				Child
			</Element>
		</StyledTestDiv>

		<IconRegistry names={IconName} />
	</div>
);

export default ElementDemo;
