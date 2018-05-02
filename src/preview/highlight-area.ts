import * as MobX from 'mobx';

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
	private pageElementId?: string;

	@MobX.observable
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
		this.pageElementId = undefined;
	}

	public show(element: Element, pageElementId: string): void {
		if (typeof element.getBoundingClientRect !== 'function') {
			return;
		}
		if (this.pageElementId === pageElementId) {
			return;
		}
		this.pageElementId = pageElementId;

		const clientRect: ClientRect = element.getBoundingClientRect();
		this.props = {
			bottom: clientRect.bottom,
			height: clientRect.height,
			left: clientRect.left + window.scrollX,
			opacity: 1,
			right: clientRect.right,
			top: clientRect.top + window.scrollY,
			width: clientRect.width
		};

		element.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
			inline: 'nearest'
		});

		setTimeout(() => this.hide(), 500);
	}
}
