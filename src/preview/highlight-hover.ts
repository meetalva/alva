import * as MobX from 'mobx';

export class HighlightHover {
	@MobX.observable public bottom: number = 0;
	@MobX.observable public height: number = 0;

	@MobX.observable public left: number = 0;
	@MobX.observable public opacity: number = 0;
	@MobX.observable public right: number = 0;
	@MobX.observable public top: number = 0;
	@MobX.observable public width: number = 0;

	@MobX.action
	public hide(): void {
		this.opacity = 0;
	}

	@MobX.action
	public setSize(node: Element): void {
		if (node.parentElement) {
			const clientRect: ClientRect = node.getBoundingClientRect();
			this.bottom = clientRect.bottom;
			this.height = clientRect.height;
			this.left = clientRect.left + window.screenX;
			this.right = clientRect.right;
			this.top = clientRect.top + window.screenY;
			this.width = clientRect.width;
		}
	}

	@MobX.action
	public show(): void {
		this.opacity = 1;
	}
}
