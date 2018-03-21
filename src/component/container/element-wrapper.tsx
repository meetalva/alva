import Element from '../../lsg/patterns/element';
import * as React from 'react';

export interface ElementWrapperState {
	highlight?: boolean;
	highlightPlaceholder?: boolean;
	open?: boolean;
}

export interface ElementWrapperProps {
	active?: boolean;
	handleClick?: React.MouseEventHandler<HTMLElement>;
	handleContextMenu?: React.MouseEventHandler<HTMLElement>;
	handleDragDrop?: React.DragEventHandler<HTMLElement>;
	handleDragDropForChild?: React.DragEventHandler<HTMLElement>;
	handleDragStart?: React.DragEventHandler<HTMLElement>;
	open?: boolean;
	title: string;
}

export class ElementWrapper extends React.Component<ElementWrapperProps, ElementWrapperState> {
	public constructor(props: ElementWrapperProps) {
		super(props);

		this.state = {
			open: this.props.open,
			highlight: false
		};

		this.handleIconClick = this.handleIconClick.bind(this);
		this.handleDragStart = this.handleDragStart.bind(this);
		this.handleDragEnter = this.handleDragEnter.bind(this);
		this.handleDragLeave = this.handleDragLeave.bind(this);
		this.handleDragDrop = this.handleDragDrop.bind(this);
		this.handleDragEnterForChild = this.handleDragEnterForChild.bind(this);
		this.handleDragLeaveForChild = this.handleDragLeaveForChild.bind(this);
		this.handleDragDropForChild = this.handleDragDropForChild.bind(this);
	}

	private handleDragDrop(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlight: false
		});
		if (typeof this.props.handleDragDrop === 'function') {
			this.props.handleDragDrop(e);
		}
	}

	private handleDragDropForChild(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlightPlaceholder: false
		});
		if (typeof this.props.handleDragDropForChild === 'function') {
			this.props.handleDragDropForChild(e);
		}
	}

	private handleDragEnter(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlight: true
		});
	}

	private handleDragEnterForChild(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlightPlaceholder: true
		});
	}

	private handleDragLeave(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlight: false
		});
	}

	private handleDragLeaveForChild(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlightPlaceholder: false
		});
	}

	private handleDragStart(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlight: true
		});
		if (typeof this.props.handleDragStart === 'function') {
			this.props.handleDragStart(e);
		}
	}

	private handleIconClick(): void {
		this.setState({
			open: !this.state.open
		});
	}

	public render(): JSX.Element {
		const { active, children, handleClick, handleContextMenu, title } = this.props;
		return (
			<Element
				title={title}
				open={!this.state.open}
				active={active}
				highlight={this.state.highlight}
				highlightPlaceholder={this.state.highlightPlaceholder}
				handleClick={handleClick}
				handleContextMenu={handleContextMenu}
				draggable
				handleIconClick={this.handleIconClick}
				handleDragStart={this.handleDragStart}
				handleDragEnter={this.handleDragEnter}
				handleDragLeave={this.handleDragLeave}
				handleDragDrop={this.handleDragDrop}
				handleDragEnterForChild={this.handleDragEnterForChild}
				handleDragLeaveForChild={this.handleDragLeaveForChild}
				handleDragDropForChild={this.handleDragDropForChild}
			>
				{children}
			</Element>
		);
	}
}
