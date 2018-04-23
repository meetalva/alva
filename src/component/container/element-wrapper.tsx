import Element from '../../lsg/patterns/element';
import * as React from 'react';

export interface ElementWrapperState {
	highlight?: boolean;
	highlightPlaceholder?: boolean;
	open?: boolean;
}

export interface ElementWrapperProps {
	active?: boolean;
	dragging: boolean;
	id: string;
	onClick?: React.MouseEventHandler<HTMLElement>;
	onContextMenu?: React.MouseEventHandler<HTMLElement>;
	onDragDrop?: React.DragEventHandler<HTMLElement>;
	onDragDropForChild?: React.DragEventHandler<HTMLElement>;
	onDragStart?: React.DragEventHandler<HTMLElement>;
	open?: boolean;
	title: string;
}

export class ElementWrapper extends React.Component<ElementWrapperProps, ElementWrapperState> {
	public state = {
		open: this.props.open,
		highlightPlaceholder: false,
		highlight: false
	};

	private handleClick(e: React.MouseEvent<HTMLElement>): void {
		const target = e.target as HTMLElement;

		if (target.getAttribute('data-element-icon')) {
			this.setState({
				open: !this.state.open
			});
		}
	}

	private handleDragDrop(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlight: false
		});
		if (typeof this.props.onDragDrop === 'function') {
			this.props.onDragDrop(e);
		}
	}

	private handleDragDropForChild(e: React.DragEvent<HTMLElement>): void {
		this.setState({
			highlightPlaceholder: false
		});
		if (typeof this.props.onDragDropForChild === 'function') {
			this.props.onDragDropForChild(e);
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
		if (typeof this.props.onDragStart === 'function') {
			this.props.onDragStart(e);
		}
	}

	public render(): JSX.Element {
		const { active, children, title } = this.props;
		return (
			<Element
				active={active}
				draggable
				dragging={this.props.dragging}
				onClick={e => this.handleClick(e)}
				onDragDrop={e => this.handleDragDrop(e)}
				onDragDropForChild={e => this.handleDragDropForChild(e)}
				onDragEnter={e => this.handleDragEnter(e)}
				onDragEnterForChild={e => this.handleDragEnterForChild(e)}
				onDragLeave={e => this.handleDragLeave(e)}
				onDragLeaveForChild={e => this.handleDragLeaveForChild(e)}
				onDragStart={e => this.handleDragStart(e)}
				highlight={this.state.highlight}
				highlightPlaceholder={this.state.highlightPlaceholder}
				id={this.props.id}
				open={!this.state.open}
				title={title}
			>
				{children}
			</Element>
		);
	}
}
