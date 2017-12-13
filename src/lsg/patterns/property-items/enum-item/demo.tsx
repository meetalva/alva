import { Option } from '../../../../store/pattern/property/enum_property';
import EnumItem from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledDemo = styled.div`
	width: 200px;
	padding-top: 32px;
	margin-bottom: 20px;
`;

export interface EnumItemDemoState {
	selectedItem: Option;
	values: Option[];
}

export class BooleanItemDemo extends React.Component<{}, EnumItemDemoState> {
	public constructor(props: {}) {
		super(props);

		const values = [new Option('Medium'), new Option('Rare'), new Option('Solid Shoe')];

		this.state = {
			values,
			selectedItem: values[0]
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
