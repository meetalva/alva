import BooleanItem from './index';
import * as React from 'react';
import styled from 'styled-components';

const StyledDemo = styled.div`
	width: 200px;
	margin-bottom: 20px;
`;

export interface BooleanItemDemoState {
	checked?: boolean;
}

export class BooleanItemDemo extends React.Component<{}, BooleanItemDemoState> {
	public state = {
		checked: false
	};

	private handleChange(e: React.SyntheticEvent<HTMLElement>): void {
		this.setState({
			checked: !this.state.checked
		});
	}

	public render(): JSX.Element {
		return (
			<div>
				<StyledDemo>
					<BooleanItem
						label="Visibility"
						checked={this.state.checked}
						onChange={this.handleChange}
					/>
				</StyledDemo>
				<StyledDemo>
					<BooleanItem
						label="Spacing"
						checked={!this.state.checked}
						onChange={this.handleChange}
					/>
				</StyledDemo>
			</div>
		);
	}
}

export default BooleanItemDemo;
