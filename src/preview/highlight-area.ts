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
	@MobX.observable public bottom = 0;
	@MobX.observable public height = 0;
	@MobX.observable public left = 0;
	@MobX.observable public opacity = 0;
	@MobX.observable public right = 0;
	@MobX.observable public top = 0;
	@MobX.observable public width = 0;

	@MobX.action
	public hide(): void {
		this.opacity = 0;
	}

	@MobX.action
	public setSize(element: Element): void {
		if (typeof element.getBoundingClientRect !== 'function') {
			return;
		}

		const clientRect: ClientRect = element.getBoundingClientRect();
		this.bottom = clientRect.bottom;
		this.height = clientRect.height;
		this.left = clientRect.left + window.scrollX;
		this.right = clientRect.right;
		this.top = clientRect.top + window.scrollY;
		this.width = clientRect.width;
	}

	@MobX.action
	public show(): void {
		this.opacity = 1;
	}
}
