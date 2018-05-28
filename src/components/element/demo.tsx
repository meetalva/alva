import DemoContainer from '../demo-container';
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
	<DemoContainer title="Element">
		<StyledTestDiv>
			Default
			<Element
				id="1"
				active={false}
				draggable={false}
				editable={false}
				highlight={false}
				highlightPlaceholder={false}
				open={false}
				title="Element"
				dragging={false}
			/>
		</StyledTestDiv>
		<StyledTestDiv>
			Active
			<Element
				id="2"
				active
				draggable={false}
				editable={false}
				highlight={false}
				highlightPlaceholder={false}
				open={false}
				title="Element"
				dragging={false}
			/>
		</StyledTestDiv>
		<StyledTestDiv>
			With Child and open
			<Element
				id="3"
				active={false}
				draggable={false}
				editable={false}
				highlight={false}
				highlightPlaceholder={false}
				open
				title="Element"
				dragging={false}
			>
				Child
			</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			With child and active
			<Element
				id="3"
				active
				draggable={false}
				editable={false}
				highlight={false}
				highlightPlaceholder={false}
				open={false}
				title="Element"
				dragging={false}
			>
				Child
			</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			With child, active and open
			<Element
				id="3"
				active
				draggable={false}
				editable={false}
				highlight={false}
				highlightPlaceholder={false}
				open
				title="Element"
				dragging={false}
			>
				Child
			</Element>
		</StyledTestDiv>

		<IconRegistry names={IconName} />
	</DemoContainer>
);

export default ElementDemo;
