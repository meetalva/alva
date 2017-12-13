import Element from '../../lsg/patterns/element';
import * as React from 'react';

export interface ElementWrapperState {
	open?: boolean;
	highlight?: boolean;
}

export interface ElementWrapperProps {
	active?: boolean;
	open?: boolean;
	title: string;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	handleDragDrop?: React.DragEventHandler<HTMLElement>;
}

export class ElementWrapper extends React.Component<ElementWrapperProps, ElementWrapperState> {
	public constructor(props: ElementWrapperProps) {
		super(props);

		this.state = {
			open: this.props.open,
			highlight: false
		};

		this.handleIconClick = this.handleIconClick.bind(this);
		this.handleDragEnter = this.handleDragEnter.bind(this);
		this.handleDragLeave = this.handleDragLeave.bind(this);
		this.handleDragDrop = this.handleDragDrop.bind(this);
	}

	private handleIconClick(): void {
		this.setState({
			open: !this.state.open
		});
	}

	private handleDragEnter(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlight: true
		});
	}

	private handleDragLeave(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlight: false
		});
	}

	private handleDragDrop(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlight: false
		});
		this.props.handleDragDrop && this.props.handleDragDrop(e);
	}

	public render(): JSX.Element {
		const { active, children, handleClick, title } = this.props;
		return (
			<Element
				title={title}
				open={!this.state.open}
				active={active}
				highlight={this.state.highlight}
				handleClick={handleClick}
				handleIconClick={this.handleIconClick}
				handleDragEnter={this.handleDragEnter}
				handleDragLeave={this.handleDragLeave}
				handleDragDrop={this.handleDragDrop}
			>
				{children}
			</Element>
		);
	}
}
