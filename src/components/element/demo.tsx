import DemoContainer from '../demo-container';
import { IconName, IconRegistry } from '../icons';
import { Element, ElementState } from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledTestDiv = styled.div`
	flex-grow: 1;
	max-width: 200px;
	padding: 20px 10px;
`;

// tslint:disable-next-line:no-empty
const NOOP = () => {};

const CHILD = (
	<Element
		id="1"
		state={ElementState.Default}
		draggable={false}
		mayOpen={false}
		open={false}
		onChange={NOOP}
		title="Child Element"
		dragging={false}
	/>
);

const ElementDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Element">
		<StyledTestDiv>
			Default
			<Element
				id="1"
				state={ElementState.Default}
				draggable={false}
				mayOpen={false}
				open={false}
				onChange={NOOP}
				title="Element"
				dragging={false}
			/>
		</StyledTestDiv>
		<StyledTestDiv>
			Active
			<Element
				id="2"
				draggable={false}
				mayOpen={false}
				open={false}
				onChange={NOOP}
				state={ElementState.Active}
				title="Element"
				dragging={false}
			/>
		</StyledTestDiv>
		<StyledTestDiv>
			Highlighted
			<Element
				id="2"
				draggable={false}
				mayOpen={false}
				open={false}
				onChange={NOOP}
				state={ElementState.Highlighted}
				title="Element"
				dragging={false}
			/>
		</StyledTestDiv>
		<StyledTestDiv>
			Placeholder Highlighted
			<Element
				id="2"
				draggable={false}
				mayOpen={false}
				open={false}
				onChange={NOOP}
				placeholderHighlighted={true}
				state={ElementState.Default}
				title="Element"
				dragging={true}
			/>
		</StyledTestDiv>
		<StyledTestDiv>
			Editable
			<Element
				id="2"
				draggable={false}
				mayOpen={false}
				open={false}
				onChange={NOOP}
				state={ElementState.Editable}
				title="Element"
				dragging={false}
			/>
		</StyledTestDiv>
		<StyledTestDiv>
			May open, closed
			<Element
				id="3"
				draggable={false}
				mayOpen={true}
				onChange={NOOP}
				open={false}
				title="Element"
				state={ElementState.Default}
				dragging={false}
			>
				{CHILD}
			</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			May open, opened
			<Element
				id="3"
				draggable={false}
				mayOpen={true}
				onChange={NOOP}
				open
				title="Element"
				state={ElementState.Default}
				dragging={false}
			>
				{CHILD}
			</Element>
		</StyledTestDiv>
		<StyledTestDiv>
			With child, active and open
			<Element
				id="4"
				draggable={false}
				mayOpen={true}
				onChange={NOOP}
				open
				title="Element"
				state={ElementState.Active}
				dragging={false}
			>
				{CHILD}
			</Element>
		</StyledTestDiv>

		<IconRegistry names={IconName} />
	</DemoContainer>
);

export default ElementDemo;
