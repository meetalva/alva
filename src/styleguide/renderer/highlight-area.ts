import { observable } from 'mobx';

export interface HighlightAreaProps {
	bottom?: number;
	height?: number;
	left?: number;
	opacity?: number;
	right?: number;
	top?: number;
	width?: number;
}

export class HighlightArea {
	@observable
	private props: HighlightAreaProps = {
		bottom: 0,
		height: 0,
		left: 0,
		opacity: 0,
		right: 0,
		top: 0,
		width: 0
	};

	public getProps(): HighlightAreaProps {
		return this.props;
	}

	public hide(): void {
		this.props.opacity = 0;
	}

	public show(element: Element): void {
		const clientRect: ClientRect = element.getBoundingClientRect();
		const newProps: HighlightAreaProps = {
			bottom: clientRect.bottom,
			height: clientRect.height,
			left: clientRect.left + window.scrollX,
			opacity: 1,
			right: clientRect.right,
			top: clientRect.top + window.scrollY,
			width: clientRect.width
		};

		if (
			this.props.top === newProps.top &&
			this.props.right === newProps.right &&
			this.props.bottom === newProps.bottom &&
			this.props.left === newProps.left &&
			this.props.height === newProps.height &&
			this.props.width === newProps.width
		) {
			return;
		}

		this.props = newProps;

		element.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest'
		});

		setTimeout(() => this.hide(), 500);
	}
}
