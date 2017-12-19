import ChromeComponent from '../../lsg/patterns/chrome';
import { observer } from 'mobx-react';
import * as React from 'react';

export interface ChromeProps {
	title?: string;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	open?: boolean;
}

@observer
export class Chrome extends React.Component<ChromeProps> {
	public render(): JSX.Element {
		return (
			<ChromeComponent
				handleClick={this.props.handleClick}
				title={this.props.title}
				open={this.props.open}
			>
				{this.props.children}
			</ChromeComponent>
		);
	}
}
