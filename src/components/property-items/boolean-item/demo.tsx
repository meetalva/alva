import { BooleanItem } from '.';
import * as React from 'react';
import DemoContainer from '../../demo-container';

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
			<DemoContainer title="Boolean Item">
				<BooleanItem
					label="Visibility"
					checked={this.state.checked}
					onChange={e => this.handleChange(e)}
				/>
				<BooleanItem
					label="Spacing"
					checked={!this.state.checked}
					onChange={e => this.handleChange(e)}
				/>
			</DemoContainer>
		);
	}
}

export default BooleanItemDemo;
