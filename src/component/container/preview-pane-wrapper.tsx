import PreviewPane, { PreviewPaneProps } from '../../lsg/patterns/panes/preview-pane';
import * as React from 'react';

export interface ElementWrapperState {
	direction: number;
	isResizing: boolean;
	maxWidth: number;
	mousePosition?: number;
	width: number;
}

export class PreviewPaneWrapper extends React.Component<PreviewPaneProps, ElementWrapperState> {
	public constructor(props: {}) {
		super(props);

		this.state = {
			isResizing: false,
			direction: 1,
			width: 0,
			maxWidth: 0
		};

		this.handleMouseDownRight = this.handleMouseDownRight.bind(this);
		this.handleMouseDownLeft = this.handleMouseDownLeft.bind(this);
		this.handleMouseUp = this.handleMouseUp.bind(this);
		this.handleMouseMove = this.handleMouseMove.bind(this);
		this.handlePreviewWidthUpdate = this.handlePreviewWidthUpdate.bind(this);
	}

	private handleMouseDownLeft(e: React.MouseEvent<HTMLElement>): void {
		this.setState({
			isResizing: true,
			mousePosition: e.pageX,
			direction: -1
		});
	}

	private handleMouseDownRight(e: React.MouseEvent<HTMLElement>): void {
		this.setState({
			isResizing: true,
			mousePosition: e.pageX,
			direction: 1
		});
	}

	private handleMouseMove(e: React.MouseEvent<HTMLElement>): void {
		const { maxWidth, mousePosition, width, direction } = this.state;

		if (!mousePosition) {
			return;
		}

		if (e.buttons % 2 === 0) {
			this.setState({
				isResizing: false,
				mousePosition: undefined
			});
			return;
		}

		e.preventDefault();

		const newWidth = width - (mousePosition - e.pageX) * 2 * direction;
		this.setState({
			// only set new width if it is not smaller than 300 and also not bigger than the maxWidth
			width: newWidth >= maxWidth ? maxWidth : newWidth >= 300 ? newWidth : 300,
			mousePosition: e.pageX
		});
	}

	private handleMouseUp(): void {
		this.setState({
			isResizing: false,
			mousePosition: undefined
		});
	}

	private handlePreviewWidthUpdate(previewWidth: number): void {
		this.setState({
			width: previewWidth,
			maxWidth: previewWidth
		});
	}

	public render(): JSX.Element {
		return (
			<PreviewPane
				handleMouseDownLeft={this.handleMouseDownLeft}
				handleMouseDownRight={this.handleMouseDownRight}
				handleMouseMove={this.handleMouseMove}
				handleMouseUp={this.handleMouseUp}
				handlePreviewWidthUpdate={this.handlePreviewWidthUpdate}
				width={this.state.width}
				previewFrame={this.props.previewFrame}
			/>
		);
	}
}
