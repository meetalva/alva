import EnumItem from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledDemo = styled.div`
	width: 200px;
	padding-top: 32px;
	margin-bottom: 20px;
`;

export interface EnumItemDemoState {
	selectedItem: string;
	values: string[];
}

export class BooleanItemDemo extends React.Component<{}, EnumItemDemoState> {
	public constructor(props: {}) {
		super(props);

		const values = [
			'Medium',
			'Rare',
			'Solid Shoe'
		];

		this.state = {
			values,
			selectedItem: values[0]
		};

		this.handleChange = this.handleChange.bind(this);
	}

	private handleChange(e: React.SyntheticEvent<HTMLSelectElement>): void {
		this.setState({
			selectedItem: e.currentTarget.value
		});
	}

	public render(): JSX.Element {
		return (
			<div>
				<StyledDemo>
					<EnumItem
						values={this.state.values}
						selectedValue={this.state.selectedItem}
						handleChange={this.handleChange}
					/>
				</StyledDemo>
			</div>
		);
	}
}

export default BooleanItemDemo;
