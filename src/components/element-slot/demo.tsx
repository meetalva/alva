import DemoContainer from '../demo-container';
import * as React from 'react';
import { ElementSlot, ElementSlotState } from '.';

const FloatingButtonDemo: React.StatelessComponent<void> = (): JSX.Element => (
	<DemoContainer title="Element Slot">
		<>
			Default
			<ElementSlot
				description="Slot"
				id=""
				open={false}
				state={ElementSlotState.Default}
				title="Slot"
			/>
		</>
		<>
			Open
			<ElementSlot
				description="Slot"
				id=""
				open={true}
				state={ElementSlotState.Default}
				title="Open Slot"
			/>
		</>
		<>
			Disabled
			<ElementSlot
				description="Slot"
				id=""
				open={true}
				state={ElementSlotState.Disabled}
				title="Disabled Slot"
			/>
		</>
		<>
			Highlighted
			<ElementSlot
				description="Slot"
				id=""
				open={true}
				state={ElementSlotState.Highlighted}
				title="Disabled Slot"
			/>
		</>
	</DemoContainer>
);

export default FloatingButtonDemo;
