import Element from '../../lsg/patterns/element';
import * as React from 'react';

export interface ElementWrapperState {
	open?: boolean;
}

export interface ElementWrapperProps {
	active?: boolean;
	open?: boolean;
	title: string;
	handleClick?: React.MouseEventHandler<HTMLElement>;
}

export class ElementWrapper extends React.Component<ElementWrapperProps, ElementWrapperState> {
	public constructor(props: ElementWrapperProps) {
		super(props);

		this.state = {
			open: this.props.open
		};

		this.handleIconClick = this.handleIconClick.bind(this);
	}

	private handleIconClick(): void {
		this.setState({
			open: !this.state.open
		});
	}

	public render(): JSX.Element {
		const { active, children, handleClick, title } = this.props;
		return (
			<Element
				title={title}
				open={!this.state.open}
				active={active}
				handleClick={handleClick}
				handleIconClick={this.handleIconClick}
			>
				{children}
			</Element>
		);
	}
}
