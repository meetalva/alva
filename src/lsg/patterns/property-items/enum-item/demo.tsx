import EnumItem, { Values } from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledDemo = styled.div`
	width: 200px;
	padding-top: 32px;
	margin-bottom: 20px;
`;

export interface EnumItemDemoState {
	selectedItem: string;
	values: Values[];
}

export class BooleanItemDemo extends React.Component<{}, EnumItemDemoState> {
	public constructor(props: {}) {
		super(props);

		const values = [
			{ id: 'id1', name: 'Medium' },
			{ id: 'id2', name: 'Rare' },
			{ id: 'id3', name: 'Solid Shoe' }
		];

		this.state = {
			values,
			selectedItem: values[0].name
		};
	}

	public render(): JSX.Element {
		return (
			<div>
				<StyledDemo>
					<EnumItem label="Label" values={this.state.values} />
				</StyledDemo>
				<StyledDemo>
					Required
					<EnumItem
						label="Label"
						values={this.state.values}
						selectedValue={this.state.selectedItem}
						required
					/>
				</StyledDemo>
			</div>
		);
	}
}

export default BooleanItemDemo;
