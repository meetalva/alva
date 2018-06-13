import DemoContainer from '../demo-container';
import { Element, ElementCapability, ElementState } from './index';
import * as React from 'react';

// tslint:disable-next-line:no-empty
const NOOP = () => {};

const CHILD = (
	<Element
		id="1"
		state={ElementState.Default}
		capabilities={[ElementCapability.Editable]}
		open={false}
		onChange={NOOP}
		title="Child Element"
		dragging={false}
	/>
);

const ElementDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Element">
		<>
			Default
			<Element
				id="1"
				state={ElementState.Default}
				capabilities={[ElementCapability.Editable]}
				open={false}
				onChange={NOOP}
				title="Element"
				dragging={false}
			/>
		</>
		<>
			Active
			<Element
				id="2"
				capabilities={[ElementCapability.Editable]}
				open={false}
				onChange={NOOP}
				state={ElementState.Active}
				title="Element"
				dragging={false}
			/>
		</>
		<>
			Highlighted
			<Element
				id="2"
				capabilities={[ElementCapability.Editable]}
				open={false}
				onChange={NOOP}
				state={ElementState.Highlighted}
				title="Element"
				dragging={false}
			/>
		</>
		<>
			Placeholder Highlighted
			<Element
				id="2"
				capabilities={[ElementCapability.Editable]}
				open={false}
				onChange={NOOP}
				placeholderHighlighted={true}
				state={ElementState.Default}
				title="Element"
				dragging={true}
			/>
		</>
		<>
			Editable
			<Element
				id="2"
				capabilities={[ElementCapability.Editable]}
				open={false}
				onChange={NOOP}
				state={ElementState.Editable}
				title="Element"
				dragging={false}
			/>
		</>
		<>
			May open, closed
			<Element
				id="3"
				capabilities={[ElementCapability.Editable, ElementCapability.Openable]}
				onChange={NOOP}
				open={false}
				title="Element"
				state={ElementState.Default}
				dragging={false}
			>
				{CHILD}
			</Element>
		</>
		<>
			May open, opened
			<Element
				id="3"
				capabilities={[ElementCapability.Editable, ElementCapability.Openable]}
				onChange={NOOP}
				open
				title="Element"
				state={ElementState.Default}
				dragging={false}
			>
				{CHILD}
			</Element>
		</>
		<>
			With child, active and open
			<Element
				id="4"
				capabilities={[ElementCapability.Editable, ElementCapability.Openable]}
				onChange={NOOP}
				open
				title="Element"
				state={ElementState.Active}
				dragging={false}
			>
				{CHILD}
			</Element>
		</>
	</DemoContainer>
);

export default ElementDemo;
