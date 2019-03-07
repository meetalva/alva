import { PropertyItemRadiogroup, PropertyItemRadiogroupValues } from './index';
import * as React from 'react';
import DemoContainer from '../demo-container';
import { IconName } from '../icons';

export interface EnumItemDemoState {
	selectedItem: string;
	values: PropertyItemRadiogroupValues[];
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
				<PropertyItemRadiogroup label="Label" key="0" values={this.state.values} />
				<PropertyItemRadiogroup
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
