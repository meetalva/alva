import { PropertyItemButtonGroup, PropertyItemButtonGroupValues } from './index';
import * as React from 'react';
import DemoContainer from '../demo-container';

export interface EnumItemDemoState {
	selectedItem: string;
	values: PropertyItemButtonGroupValues[];
}

export class BooleanItemDemo extends React.Component<{}, EnumItemDemoState> {
	public constructor(props: {}) {
		super(props);

		const values = [
			{ id: 'id1', name: 'Medium', icon: 'Plus' },
			{ id: 'id2', name: 'Rare', icon: 'Youtube' },
			{ id: 'id3', name: 'Solid Shoe', icon: 'Plus' }
		];

		this.state = {
			values,
			selectedItem: values[0].name
		};
	}

	public render(): JSX.Element {
		return (
			<DemoContainer title="Enum Item">
				<PropertyItemButtonGroup label="Label" key="0" values={this.state.values} />
				<PropertyItemButtonGroup
					label="Label"
					values={this.state.values}
					selectedValue={this.state.selectedItem}
					required
				/>
			</DemoContainer>
		);
	}
}

export default BooleanItemDemo;
